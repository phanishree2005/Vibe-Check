# Formal Research Hypotheses & Experimental Falsification Framework

**Project:** BHUMI-X (Bharat's Hyperlocal Understanding & Multimodal Intelligence – X)  
**Document Code:** `BHUMIX-HYP-2026-V1`  
**Classification:** Scientific Hypotheses Formulation and Falsification Protocols  

---

## 1. Primary Research Question

> **Can resolution-aware, reliability-aware multimodal spatiotemporal learning provide earlier and better-calibrated agricultural climate-stress predictions under missing observations and geographical distribution shifts than conventional single-modality and feature-concatenation baselines?**

---

## 2. Formal Hypotheses Formulations (RQ1 – RQ8)

### Hypothesis 1 (RQ1: Multimodal Synergy over Single Modalities)
- **Null Hypothesis ($H_{0,1}$):** A multimodal model combining optical, SAR, soil, and meteorological modalities does not achieve a statistically significant improvement in 14-day agricultural stress prediction F1-score compared to the best performing single-modality baseline:
  $$F1(\mathcal{M}_{\text{multimodal}}) \le \max_{m \in \{\text{opt}, \text{sar}, \text{met}, \text{soil}\}} F1(\mathcal{M}_{m})$$
- **Alternative Hypothesis ($H_{1,1}$):** Synergistic cross-modal feature representation outperforms all single-modality models by at least $\Delta F1 \ge 0.05$ at $\alpha = 0.05$ (Wilcoxon signed-rank test).
- **Falsification Metric:** Macro F1 and AUROC across held-out test splits.

---

### Hypothesis 2 (RQ2: Spatial-Resolution Support Mismatch)
- **Null Hypothesis ($H_{0,2}$):** Explicitly encoding spatial support resolution ($\mathbf{e}_{\text{res}}$) does not improve generalization performance compared to naive bilinear upsampling of coarse climate layers to 10 m resolution:
  $$\text{Loss}_{\text{unseen}}(\mathcal{M}_{\text{res-aware}}) \ge \text{Loss}_{\text{unseen}}(\mathcal{M}_{\text{naive-resample}})$$
- **Alternative Hypothesis ($H_{1,2}$):** Preserving native resolution through hierarchical multi-scale attention prevents spatial feature hallucination and yields lower prediction error on out-of-district spatial blocks.

---

### Hypothesis 3 (RQ3: SAR & Hydrology Compensation During Optical Blindout)
- **Null Hypothesis ($H_{0,3}$):** During periods of optical unavailability (cloud cover $> 70\%$), Sentinel-1 C-band SAR backscatter combined with meteorological water deficit provides no predictive utility over random guessing or seasonal climatology:
  $$\text{AUROC}_{\text{cloud}}(\mathcal{M}_{\text{SAR+Met}}) \le 0.50$$
- **Alternative Hypothesis ($H_{1,3}$):** C-band radar structural backscatter ($\gamma^0_{VV}, \gamma^0_{VH}$) and antecedent atmospheric drying maintain an $\text{AUROC} \ge 0.72$ even in the complete absence of optical Sentinel-2 data.

---

### Hypothesis 4 (RQ4: Active Missing-Modality Masking)
- **Null Hypothesis ($H_{0,4}$):** A multimodal model trained with active missing-modality masks (MAM) degrades at the same rate under simulated sensor dropout as an early-concatenation model:
  $$\frac{\partial F1_{\text{MAM}}}{\partial p_{\text{dropout}}} = \frac{\partial F1_{\text{concat}}}{\partial p_{\text{dropout}}}$$
- **Alternative Hypothesis ($H_{1,4}$):** The reliability-gated attention mechanism exhibits graceful degradation, maintaining $> 85\%$ of full-modality performance under single-modality dropout compared to $< 60\%$ retention for standard concatenation.

---

### Hypothesis 5 (RQ5: Cross-District Spatial Generalization)
- **Null Hypothesis ($H_{0,5}$):** When evaluated on geographically unseen districts using Leave-One-District-Out (LODO) validation, the model exhibits performance collapse:
  $$\text{AUROC}_{\text{LODO}} \le 0.60$$
- **Alternative Hypothesis ($H_{1,5}$):** Conditioned on static topographic and edaphic features (SRTM elevation/slope, SoilGrids clay fraction), the model successfully transfers across agro-climatic zones with $\text{AUROC}_{\text{LODO}} \ge 0.75$.

---

### Hypothesis 6 (RQ6: Uncertainty Calibration & Out-of-Distribution Abstention)
- **Null Hypothesis ($H_{0,6}$):** Conformal prediction sets constructed with a target significance level $\alpha = 0.10$ fail to achieve the nominal empirical coverage on out-of-distribution spatial holdouts:
  $$\mathbb{P}\left(Y \in \mathcal{C}(X)\right) < 1 - \alpha$$
- **Alternative Hypothesis ($H_{1,6}$):** Split-conformal prediction guarantees valid empirical coverage $\ge 90\%$ while identifying uncalibrated out-of-distribution inputs through mahalanobis latent distance thresholding, enabling reliable abstention.

---

### Hypothesis 7 (RQ7: Attribution Consistency Under Sensor Corruption)
- **Null Hypothesis ($H_{0,7}$):** SHAP and integrated gradient attributions for surviving modalities become unstable or invert polarity when an uncorrupted secondary modality is dropped:
  $$\text{CosineSimilarity}(\phi_{\text{met}}^{\text{full}}, \phi_{\text{met}}^{\text{ablated}}) < 0.50$$
- **Alternative Hypothesis ($H_{1,7}$):** Gated feature representations preserve attribution stability ($\text{CosineSimilarity} \ge 0.80$), confirming that learned representations are disentangled.

---

### Hypothesis 8 (RQ8: Agronomic Actionability and Utility)
- **Null Hypothesis ($H_{0,8}$):** Model-derived decision recommendations provide no higher agronomic expected utility or compliance with university package-of-practices (UAS Dharwad) than standard static district bulletins.
- **Alternative Hypothesis ($H_{1,8}$):** Hyperlocal, uncertainty-gated mitigation recommendations reduce false positive intervention costs by $> 30\%$ while maintaining $100\%$ compliance with verified agronomic guidelines.

