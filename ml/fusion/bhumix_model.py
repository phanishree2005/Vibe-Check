"""
BHUMI-X Proposed Research Architecture:
Resolution-Aware, Reliability-Gated Multimodal Spatiotemporal Deep Learning Network

Key Contributions:
1. Native Resolution Support Embeddings (e_res)
2. Modality Availability Mask (MAM) for Kharif cloud-hole robustness
3. Reliability-Gated Cross-Attention (RGCA) dynamically upweighting Sentinel-1 & Soil Hydrology
4. Dual Multi-Task Heads: 14-day Drought Stress Risk + Continuous Moisture Anomaly
5. Split-Conformal Prediction & Out-of-Distribution (OOD) Abstention Engine
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Dict, Any, Tuple, Optional, List


class ResolutionSupportEmbedding(nn.Module):
    """
    Encodes physical spatial support:
    Scale 0: 10m (Sentinel-2 Optical)
    Scale 1: 10m (Sentinel-1 SAR)
    Scale 2: 30m (SRTM DEM / Terrain)
    Scale 3: 250m (ISRIC SoilGrids)
    Scale 4: 9000m (ERA5-Land / SMAP / NASA POWER)
    """
    def __init__(self, d_model: int = 64):
        super().__init__()
        self.embedding = nn.Embedding(5, d_model)

    def forward(self, scale_indices: torch.Tensor) -> torch.Tensor:
        # scale_indices: (batch_size, num_modalities)
        return self.embedding(scale_indices)


class ModalityEncoders(nn.Module):
    def __init__(self, d_model: int = 64):
        super().__init__()
        # Optical: 4 spectral indices + 4 bands = 8 features
        self.opt_enc = nn.Sequential(
            nn.Linear(8, d_model),
            nn.LayerNorm(d_model),
            nn.ReLU(),
            nn.Linear(d_model, d_model)
        )
        # SAR: vv, vh, cross_ratio, rvi, ndpi = 5 features
        self.sar_enc = nn.Sequential(
            nn.Linear(5, d_model),
            nn.LayerNorm(d_model),
            nn.ReLU(),
            nn.Linear(d_model, d_model)
        )
        # Weather: 7 features (precip, tmax, tmin, vpd, precip14, vpd14, tmax14)
        self.met_enc = nn.Sequential(
            nn.Linear(7, d_model),
            nn.LayerNorm(d_model),
            nn.ReLU(),
            nn.Linear(d_model, d_model)
        )
        # Soil: soil_moisture, swdi, clay, sand, fc, pwp = 6 features
        self.soil_enc = nn.Sequential(
            nn.Linear(6, d_model),
            nn.LayerNorm(d_model),
            nn.ReLU(),
            nn.Linear(d_model, d_model)
        )
        # Terrain / Geo: elevation, slope, twi = 3 features
        self.geo_enc = nn.Sequential(
            nn.Linear(3, d_model),
            nn.LayerNorm(d_model),
            nn.ReLU(),
            nn.Linear(d_model, d_model)
        )

    def forward(
        self,
        x_opt: torch.Tensor,
        x_sar: torch.Tensor,
        x_met: torch.Tensor,
        x_soil: torch.Tensor,
        x_geo: torch.Tensor
    ) -> torch.Tensor:
        # Returns stacked modality tokens: (batch_size, 5, d_model)
        z_opt = self.opt_enc(x_opt).unsqueeze(1)
        z_sar = self.sar_enc(x_sar).unsqueeze(1)
        z_met = self.met_enc(x_met).unsqueeze(1)
        z_soil = self.soil_enc(x_soil).unsqueeze(1)
        z_geo = self.geo_enc(x_geo).unsqueeze(1)
        return torch.cat([z_opt, z_sar, z_met, z_soil, z_geo], dim=1)


class ReliabilityGatedCrossAttention(nn.Module):
    """
    Applies multi-head cross-attention across modality tokens with
    dynamic reliability gating that zeroes out cloud-obscured channels.
    """
    def __init__(self, d_model: int = 64, n_heads: int = 4):
        super().__init__()
        self.mha = nn.MultiheadAttention(embed_dim=d_model, num_heads=n_heads, batch_first=True)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_model * 2),
            nn.ReLU(),
            nn.Linear(d_model * 2, d_model)
        )
        self.gate_linear = nn.Linear(d_model, 1)

    def forward(
        self,
        tokens: torch.Tensor,       # (batch, 5, d_model)
        modality_mask: torch.Tensor  # (batch, 5) with 1.0 = valid, 0.0 = masked
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        # Key padding mask: True where value should be IGNORED by PyTorch MultiheadAttention
        key_padding_mask = (modality_mask == 0.0)

        # Multihead self-attention across modalities
        attn_out, attn_weights = self.mha(tokens, tokens, tokens, key_padding_mask=key_padding_mask)
        tokens = self.norm1(tokens + attn_out)

        # Feed forward block
        tokens = self.norm2(tokens + self.ffn(tokens))

        # Dynamic quality gating per modality
        gate_weights = torch.sigmoid(self.gate_linear(tokens)).squeeze(-1)  # (batch, 5)
        # Zero out completely masked modalities
        effective_weights = gate_weights * modality_mask
        sum_weights = effective_weights.sum(dim=-1, keepdim=True) + 1e-6
        norm_weights = effective_weights / sum_weights  # (batch, 5)

        # Weighted pooling into unified latent representation
        z_fused = (tokens * norm_weights.unsqueeze(-1)).sum(dim=1)  # (batch, d_model)
        return z_fused, norm_weights


class BhumiXNet(nn.Module):
    def __init__(self, d_model: int = 64, n_heads: int = 4):
        super().__init__()
        self.d_model = d_model
        self.encoders = ModalityEncoders(d_model=d_model)
        self.res_embedding = ResolutionSupportEmbedding(d_model=d_model)
        self.fusion = ReliabilityGatedCrossAttention(d_model=d_model, n_heads=n_heads)

        # Multi-task prediction heads
        self.classifier_head = nn.Sequential(
            nn.Linear(d_model, 32),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(32, 1)  # Logits for binary drought stress
        )
        self.regression_head = nn.Sequential(
            nn.Linear(d_model, 32),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(32, 1)  # Continuous delta SWDI
        )

    def forward(
        self,
        x_opt: torch.Tensor,
        x_sar: torch.Tensor,
        x_met: torch.Tensor,
        x_soil: torch.Tensor,
        x_geo: torch.Tensor,
        modality_mask: torch.Tensor  # (batch, 5)
    ) -> Dict[str, torch.Tensor]:
        # 1. Encode each modality
        tokens = self.encoders(x_opt, x_sar, x_met, x_soil, x_geo)  # (batch, 5, d_model)

        # 2. Add native resolution support embeddings
        batch_size = tokens.size(0)
        scale_indices = torch.tensor([0, 1, 4, 3, 2], device=tokens.device).unsqueeze(0).repeat(batch_size, 1)
        tokens = tokens + self.res_embedding(scale_indices)

        # 3. Fuse with reliability-gated cross-attention
        z_fused, dynamic_weights = self.fusion(tokens, modality_mask)

        # 4. Multi-task prediction
        logits = self.classifier_head(z_fused).squeeze(-1)
        probs = torch.sigmoid(logits)
        delta_swdi = self.regression_head(z_fused).squeeze(-1)

        return {
            "logits": logits,
            "drought_prob": probs,
            "delta_swdi": delta_swdi,
            "latent_z": z_fused,
            "dynamic_weights": dynamic_weights
        }


class ConformalPredictor:
    """
    Split-Conformal Prediction Engine for calibrated uncertainty quantification.
    Guarantees finite-sample coverage at 1 - alpha (e.g. 90% confidence).
    Includes Mahalanobis OOD distance detector for autonomous abstention.
    """
    def __init__(self, alpha: float = 0.10):
        self.alpha = alpha
        self.q_hat = 0.5
        self.calibration_scores: List[float] = []
        self.latent_mean: Optional[np.ndarray] = None
        self.latent_cov_inv: Optional[np.ndarray] = None
        self.ood_threshold: float = 25.0

    def fit_calibration(
        self,
        val_probs: np.ndarray,
        val_targets: np.ndarray,
        val_latents: np.ndarray
    ):
        """
        Computes non-conformity scores on calibration set:
        s_i = 1 - p(y_i | x_i)
        """
        scores = []
        for p, y in zip(val_probs, val_targets):
            # Probability assigned to true class
            p_true = p if y == 1 else (1.0 - p)
            scores.append(1.0 - p_true)

        scores = np.sort(scores)
        n = len(scores)
        # Conformal quantile index
        q_idx = int(np.ceil((n + 1) * (1.0 - self.alpha))) - 1
        q_idx = min(n - 1, max(0, q_idx))
        self.q_hat = float(scores[q_idx])
        self.calibration_scores = scores.tolist()

        # Fit OOD Mahalanobis distribution
        self.latent_mean = np.mean(val_latents, axis=0)
        cov = np.cov(val_latents, rowvar=False) + np.eye(val_latents.shape[1]) * 1e-4
        self.latent_cov_inv = np.linalg.pinv(cov)
        
        # Calculate 99th percentile mahalanobis distance on calibration set
        dists = []
        for z in val_latents:
            diff = z - self.latent_mean
            d = float(np.dot(np.dot(diff, self.latent_cov_inv), diff.T))
            dists.append(d)
        self.ood_threshold = float(np.percentile(dists, 97.5))

    def predict_conformal(
        self,
        prob: float,
        latent_z: np.ndarray
    ) -> Dict[str, Any]:
        """
        Outputs calibrated prediction set and checks for OOD abstention.
        """
        # Calculate Mahalanobis OOD distance
        is_ood = False
        mahalanobis_dist = 0.0
        if self.latent_mean is not None and self.latent_cov_inv is not None:
            diff = latent_z - self.latent_mean
            mahalanobis_dist = float(np.dot(np.dot(diff, self.latent_cov_inv), diff.T))
            is_ood = mahalanobis_dist > self.ood_threshold

        # Construct prediction set
        # Include class 1 if 1 - prob <= q_hat
        # Include class 0 if prob <= q_hat
        pred_set = []
        if (1.0 - prob) <= self.q_hat:
            pred_set.append("Stress (Drought Risk)")
        if prob <= self.q_hat:
            pred_set.append("No Stress (Normal)")

        # In case both are rejected (empty set), default to argmax
        if len(pred_set) == 0:
            pred_set.append("Stress (Drought Risk)" if prob >= 0.5 else "No Stress (Normal)")

        # Abstention decision
        should_abstain = is_ood or (len(pred_set) == 2 and 0.40 <= prob <= 0.60)
        abstain_reason = None
        if is_ood:
            abstain_reason = f"Out-of-Distribution Input (Mahalanobis Distance {mahalanobis_dist:.2f} > Threshold {self.ood_threshold:.2f})"
        elif len(pred_set) == 2:
            abstain_reason = f"High Epistemic Ambiguity: Conformal Set contains both classes at 90% confidence."

        return {
            "calibrated_prob": round(float(prob), 4),
            "confidence_level": f"{int((1.0 - self.alpha) * 100)}%",
            "q_hat_threshold": round(self.q_hat, 4),
            "prediction_set": pred_set,
            "set_size": len(pred_set),
            "mahalanobis_ood_distance": round(mahalanobis_dist, 2),
            "is_out_of_distribution": is_ood,
            "should_abstain": should_abstain,
            "abstain_reason": abstain_reason
        }

