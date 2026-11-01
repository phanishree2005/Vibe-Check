# Systematic Literature Review: Multimodal Geospatial Intelligence for Agricultural Stress Detection

**Project:** BHUMI-X (Bharat's Hyperlocal Understanding & Multimodal Intelligence – X)  
**Document Code:** `BHUMIX-REV-2026-V1`  
**Classification:** Scientific Literature Review & Synthesis  
**Target Standard:** IIT-Level Research Prototype & Hackathon Defense  

---

## 1. Executive Summary & Review Scope

This systematic literature review surveys peer-reviewed research, journal articles, and preprints published between 2020 and 2026 across IEEE Xplore, ScienceDirect, MDPI, SpringerLink, and open scientific repositories. The review focuses on four interconnected pillars:
1. Multimodal satellite data fusion (Optical, SAR, and Thermal).
2. Surface and root-zone soil moisture estimation through physical and machine learning frameworks.
3. Spatiotemporal deep learning and agricultural foundation models.
4. Uncertainty quantification, missing-modality robustness, and forecast-to-action decision systems in tropical and monsoonal agriculture.

---

## 2. Structured Extraction of Foundational & Recent Literature

### Study 1: Adaptive Fusion of Multi-View Remote Sensing Data for Optimal Sub-Field Crop Yield Prediction
- **Authors:** Corinna Ertel et al.
- **Year:** 2024 (Published in *Remote Sensing of Environment*, 2025)
- **DOI / Citation:** `arXiv:2401.11844` / *RSE 2025*
- **Research Objective:** Overcoming rigid early/late feature concatenation by introducing an adaptive, sample-specific gating mechanism across optical, meteorological, and static soil features at sub-field granularity.
- **Geographical & Crop Coverage:** Commercial fields across Argentina, Uruguay, and Germany (Soybean, Winter Wheat, Rapeseed).
- **Datasets & Resolutions:** Sentinel-2 Level-2A (10 m–20 m), gridded meteorological records, and digital elevation/soil maps.
- **Architecture & Fusion:** Dedicated modality-specific view-encoders coupled with a Gated Unit (GU) computing dynamic convex combinations of view representations.
- **Evaluation & Results:** $R^2 \approx 0.68$ at 10 m pixel level, aggregating to $R^2 \approx 0.80 - 0.92$ at field boundaries.
- **Limitations & Gap for BHUMI-X:**
  - Evaluated on high-input, temperate, commercial monocultures; does not account for tropical smallholder landscapes characterized by parcel fragmentation (< 1 ha).
  - Assumes full modality availability; does not model optical blindouts caused by monsoonal cloud cover.
  - Lacks uncertainty calibration (predictions are single-point deterministic estimates).

### Study 2: Remotely Sensed High-Resolution Soil Moisture and Evapotranspiration: Bridging the Gap Between Science and Society
- **Authors:** Jingyi Huang, Vinit Sehgal, Laura V. Alvarez, Luca Brocca, Shuohao Cai, Rui Cheng, Xinghua Cheng, Jinyang Du, et al.
- **Year:** May 2025
- **Journal:** *Water Resources Research* (AGU), Vol. 61, Issue 5
- **DOI:** `10.1029/2024WR037929`
- **Research Objective:** Review state-of-the-art physics-informed and ML downscaling for remote sensing soil moisture (SM) and evapotranspiration (ET) at field scales (3 m–30 m).
- **Main Findings:**
  - Direct microwave radiometry (e.g., SMAP L-band at 36 km) is physically robust but spatially too coarse for field-level agronomic decisions.
  - Thermal infrared and optical vegetation indices provide high spatial proxy data (10 m–30 m) but suffer from cloud blockage and indirect surface coupling.
  - Downscaling models that ignore vertical soil stratification (surface 0–5 cm vs. root-zone 0–100 cm) introduce significant bias during critical crop reproductive stages.
- **Relevance for BHUMI-X:** Justifies why BHUMI-X separates topsoil moisture from root-zone soil water index (SWI) and enforces physical mass-balance bounds rather than treating optical NDVI as an ungrounded soil moisture proxy.

### Study 3: Soil Moisture Prediction Using Remote Sensing and Machine Learning Algorithms: A Review on Progress, Challenges, and Opportunities
- **Authors:** MDPI Systematic Review Team
- **Year:** July 2025
- **Journal:** *Remote Sensing*, Vol. 17, No. 14, Art. 2397
- **DOI:** `10.3390/rs17142397`
- **Research Objective:** Meta-analysis of ML algorithms applied to multi-source satellite data for soil moisture estimation across global agricultural zones (2010–2024).
- **Main Findings:**
  - Non-linear ensemble methods (Random Forest, XGBoost) and Artificial Neural Networks dominate top-performing benchmarks.
  - Combining optical reflectance with C-band/L-band radar backscatter consistently achieves lower unbiased RMSE ($ubRMSE < 0.04 \text{ m}^3/\text{m}^3$) than single-source models.
  - Critical challenge identified: Overfitting to local meteorological stations and severe degradation when tested on unseen agro-climatic zones without domain adaptation.

### Study 4: Foundation Models for Generalist Geospatial Artificial Intelligence & Agricultural Foundation Models
- **Authors:** Johannes Jakubik et al. (IBM / NASA Prithvi Team, CropFM initiatives)
- **Year:** 2023–2025
- **Citation:** `arXiv:2310.18660` / IEEE IGARSS 2024
- **Research Objective:** Pre-training large-scale Vision Transformers (ViTs) on petabytes of multispectral Harmonized Landsat-Sentinel (HLS) data using masked autoencoder (MAE) objectives for downstream Earth Observation tasks.
- **Findings & Limitations:**
  - Demonstrates strong representation transfer for land-cover segmentation and broad biomass classification.
  - Compute-intensive and largely focused on optical channels; lacks native deep assimilation of asynchronous high-frequency meteorological time-series and hydrologic soil states.
  - Zero-shot predictions on micro-parcels in semi-arid India exhibit high variance without fine-grained local calibration.

### Study 5: Drought Monitoring and Forecasting in India: Opportunities and Challenges
- **Authors:** Vimal Mishra, Saran Aadhar, Harsh Shah, et al.
- **Year:** 2020
- **Journal:** *Current Science*, Vol. 119, No. 2, pp. 205–215
- **Research Objective:** Assessing meteorological, hydrological, and agricultural drought operational frameworks across the Indian subcontinent.
- **Findings:**
  - Standardized indices (SPI, SPEI) operated by government agencies operate at district or meteorological subdivision scales, masking intra-district vulnerability.
  - The onset of agricultural drought lags meteorological dry spells by 2–4 weeks; early warning requires coupling atmospheric evaporative demand (VPD, temperature) with soil moisture depletion before canopy chlorophyll degradation becomes observable in NDVI.

---

## 3. The Indian Monsoon Challenge: The Optical Cloud-Hole

In Karnataka and broader peninsular India, the primary cropping season (**Kharif**, July–October) coincides with continuous monsoon cloud cover. 

```
Monsoon Onset (June/July) ---> Peak Cloud Cover (July/Aug) ---> Dry Spell / Drought Stress ---> Cloud Clears (Sept)
         |                                |                                   |                        |
Optical: S2 Available                   BLIND OUT (90%+ Cloud Cover)        BLIND OUT (No S2)        S2: Shows Brown/Dead Crop
         |                                |                                   |                        |
SAR:     S1 Available                   PENETRATES CLOUDS                   PENETRATES CLOUDS        S1: Confirms Structural Loss
         |                                |                                   |                        |
Soil/Met:ERA5/IMD Continuous            VPD Surges / SM Drops               Depletion Detected       Damage Already Done
```

**Scientific Consequence:** Relying primarily on optical vegetation indices (NDVI/EVI) results in an *optical post-mortem*: stress is only confirmed once clouds clear, long after the physiological window for irrigation or anti-transpirant intervention has closed. BHUMI-X must leverage Sentinel-1 SAR and daily hydrometeorology to bridge this critical observation gap.

---

## 4. Synthesis of Existing Limitations Across Literature

| Dimension | State-of-the-Art in Literature | Critical Unresolved Limitation |
|---|---|---|
| **Spatial Alignment** | Resampling all inputs to a uniform fine grid (e.g., 10 m nearest-neighbor). | Introduces spatial autocorrelation artifacts and hallucinates precision from coarse 9 km reanalysis. |
| **Temporal Dynamics** | Regular time-step binning or fixed-length sequence interpolation. | Incompatible with irregular satellite revisit schedules and erratic monsoon rain events. |
| **Sensor Redundancy** | Early concatenation: $[X_{\text{opt}}, X_{\text{sar}}, X_{\text{met}}]$. | Model fails or crashes when clouds obscure optical channels. |
| **Uncertainty Quantification** | Uncalibrated Softmax probabilities or deterministic regression point estimates. | Overconfident false positives trigger costly, unneeded farmer interventions; no distinction between epistemic and aleatoric uncertainty. |
| **Validation Rigour** | Random train/test pixel splits. | Catastrophic spatial and temporal data leakage leading to artificially inflated accuracy metrics. |
| **Actionable Agency** | Static dashboards with generic text bulletins. | Decoupled from physical ground truths, missing uncertainty guardrails, and prone to LLM hallucinations. |

---

## 5. Summary Conclusion

The literature strongly confirms the validity of multimodal remote sensing and machine learning for agricultural stress monitoring. However, it also exposes a distinct research void: **the absence of a resolution-aware, reliability-calibrated architecture capable of continuous inference across optical cloud blindouts with verified geographical transferability and evidence-grounded decision support.** This establishes the foundation for BHUMI-X.

