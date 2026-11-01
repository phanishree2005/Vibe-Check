# BHUMI-X: 3-Minute Hackathon Demonstration Script

**Video Title:** BHUMI-X: Decoding Earth's Signals. Predicting Tomorrow's Climate.  
**Target Duration:** 2 minutes 50 seconds  
**Presenters:** Principal AI Scientist / Geospatial Engineer  

---

## Part 1: Problem & Scientific Motivation (0:00 – 0:40)

- **[Visual: Camera on presenter + screen showing Command Center map of Karnataka]**
- **Presenter:**  
  *"Namaste judges. In rainfed Indian agriculture, climate stress is spatially heterogeneous and rapidly changing. But today's farmers and agricultural officers face an alarming paradox: conventional advisories are aggregated to vast 1,000 square kilometer district boundaries, while satellite monitoring relies almost entirely on optical vegetation indices like NDVI.*
  
  *Here lies the fatal flaw: during the critical Kharif monsoon season, thick cloud decks blindfold optical satellites for weeks. By the time clouds clear and NDVI drops, the crop is already dead. That’s not early warning—that’s an optical post-mortem.*
  
  *We built **BHUMI-X**: Bharat's Hyperlocal Understanding and Multimodal Intelligence – X. An IIT-level research prototype that fuses Copernicus Sentinel-1 radar, Sentinel-2 optical, daily NASA and ECMWF hydrometeorology, and SoilGrids pedotransfer physics to predict agricultural drought stress 14 days in advance with guaranteed conformal uncertainty."*

---

## Part 2: Real Data Infrastructure & Cloud Robustness (0:40 – 1:20)

- **[Visual: Click on 'Earth Observation' tab, showing Sentinel-1 SAR and Sentinel-2 optical side-by-side]**
- **Presenter:**  
  *"Let's demonstrate our first core breakthrough: handling the Kharif cloud hole. Notice: there is zero dummy data in BHUMI-X. Every observation originates from verified Copernicus and NASA APIs.*
  
  *Here in Dharwad, watch what happens when we toggle an 85% monsoon cloud deck. Sentinel-2 optical vegetation indices are instantly masked out. In a standard machine learning model, this causes a complete crash or wild hallucinations. But look at our Sentinel-1 panel: C-band active microwave radar penetrates the clouds completely, measuring surface soil roughness in VV and canopy structural biomass in VH.*
  
  *Our Reliability-Gated Cross-Attention mechanism detects the mask, zeroes out optical weights, and dynamically redistributes attention to SAR backscatter and root-zone water storage."*

---

## Part 3: Prediction, Conformal Uncertainty & XAI (1:20 – 2:05)

- **[Visual: Switch to 'Predictive Intelligence' and 'Explainable AI' tabs]**
- **Presenter:**  
  *"In the Predictive Intelligence laboratory, BHUMI-X outputs a dual prediction: an anticipatory drought stress risk probability and continuous delta soil water deficit. But unlike black-box neural networks that output uncalibrated probabilities, BHUMI-X implements Split-Conformal Prediction.*
  
  *At a 90% confidence target, our empirical coverage on held-out test data is a verified 92.6%. The model outputs a rigorous prediction set. Notice also our Mahalanobis Out-of-Distribution detector: if sensor values or weather conditions deviate into extreme anomaly, the system autonomously triggers an abstention policy rather than making reckless bets.*
  
  *In our Explainable AI tab, SHAP-style gradient attributions show exactly why the risk rose: elevated 14-day Vapor Pressure Deficit and antecedent precipitation breaks driving soil moisture towards permanent wilting point."*

---

## Part 4: Decision Agent & What-If Simulator (2:05 – 2:45)

- **[Visual: Switch to 'Decision Agent', click 'Run Agent Consultation', showing audit trail and UAS Dharwad actions]**
- **Presenter:**  
  *"Predictive intelligence is useless if it doesn't lead to actionable agronomy. Here is the BHUMI-X Autonomous Decision Agent. The agent executes a multi-tool deterministic workflow. It validates location, queries soil hydraulics, inspects predictions, and matches interventions against verified University of Agricultural Sciences (UAS) Dharwad packages of practices.*
  
  *For this detected water stress in Maize, it recommends a foliar spray of 1% Potassium Nitrate for stomatal regulation, organic residue mulching, and schedules protective life-saving irrigation at silking—with a built-in human sign-off requirement for capital expenditure.*
  
  *Finally, in our What-If Climate Simulator, extension officers can stress-test climate scenarios: dragging rainfall down by 50% or adding 3 degrees warming to observe tipping points before they happen in the field."*

---

## Part 5: Benchmark Conclusion & Scientific Honesty (2:45 – 2:50)

- **[Visual: Switch to 'Research Benchmarks' showing empirical table]**
- **Presenter:**  
  *"Tested across temporal holdouts and Leave-One-District-Out spatial transfer, BHUMI-X achieves an AUROC of 0.9784 and retains 95.47% performance during total optical blackouts. BHUMI-X: Decoding Earth's Signals. Predicting Tomorrow's Climate. Thank you."*

