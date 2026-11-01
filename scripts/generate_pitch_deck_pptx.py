import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path: str):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette
    BG_COLOR = RGBColor(11, 19, 41)         # Deep Charcoal Navy (#0B1329)
    CARD_BG = RGBColor(19, 31, 60)          # Dark Slate Card (#131F3C)
    CARD_BORDER = RGBColor(56, 189, 248)    # Sky Blue Accent (#38BDF8)
    TEXT_WHITE = RGBColor(248, 250, 252)    # Ivory White (#F8FAFC)
    TEXT_MUTED = RGBColor(148, 163, 184)    # Cool Gray (#94A3B8)
    EMERALD = RGBColor(16, 185, 129)        # Forest Emerald (#10B981)
    SKY_BLUE = RGBColor(56, 189, 248)       # Sky Cyan (#38BDF8)
    AMBER = RGBColor(251, 191, 36)          # Amber Accent (#FBBF24)

    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.color.rgb = BG_COLOR
        return bg

    def add_header(slide, title_text, category="BHUMI-X • TEAM VIBE CHECK"):
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.1))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p_cat = tf.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = SKY_BLUE
        
        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE
        p_title.space_before = Pt(4)

    def add_card(slide, left, top, width, height, title="", border_color=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.color.rgb = RGBColor(30, 41, 59)
            card.line.width = Pt(1)

        if title:
            tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), Inches(0.4))
            tf = tb.text_frame
            p = tf.paragraphs[0]
            p.text = title
            p.font.size = Pt(14)
            p.font.bold = True
            p.font.color.rgb = SKY_BLUE
        return card

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Accent decorative bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.6), Inches(0.15), Inches(4.2))
    bar.fill.solid()
    bar.fill.fore_color.rgb = EMERALD
    bar.line.fill.background()

    tb1 = s1.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(11.0), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "BHUMI-X"
    p.font.size = Pt(48)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf1.add_paragraph()
    p.text = "Bharat's Hyperlocal Understanding & Multimodal Intelligence – X"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = SKY_BLUE
    p.space_before = Pt(6)

    p = tf1.add_paragraph()
    p.text = "Decoding Earth's Signals. Predicting Tomorrow's Climate."
    p.font.size = Pt(15)
    p.font.italic = True
    p.font.color.rgb = AMBER
    p.space_before = Pt(8)

    p = tf1.add_paragraph()
    p.text = (
        "• Resolution-Aware Multimodal Spatiotemporal Deep Learning Network\n"
        "• Active C-band SAR Radar + Sentinel-2 MSI Optical + ERA5 Atmospheric Demand + SoilGrids Physics\n"
        "• 14-Day Forward Drought Stress Prediction with Guaranteed Split-Conformal Coverage (α = 0.10)\n"
        "• Autonomous Decision Agent with Verified UAS Dharwad & ICAR Package of Practices"
    )
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(18)

    p = tf1.add_paragraph()
    p.text = "Team: Vibe Check  |  National Hackathon & Research Dossier  |  Zero Dummy Data  |  Zero API Key Required"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.space_before = Pt(24)

    # ==========================================
    # SLIDE 2: Problem & Research Motivation
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "The Core Crisis: Why Conventional Drought Monitoring Fails")

    # Card 1: Coarse District Aggregation
    add_card(s2, Inches(0.8), Inches(1.8), Inches(3.6), Inches(5.0), "1. Coarse Spatial Averaging", CARD_BORDER)
    tb = s2.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• Conventional advisories (IMD, Mahalanobis Centre) aggregate data across entire 1,000 km² districts.\n\n"
        "• Severe micro-droughts in rainfed taluks are hidden by rain in distant parts of the same district.\n\n"
        "• Smallholders (<0.5 ha) receive irrelevant general recommendations."
    )
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_WHITE

    # Card 2: The Kharif Monsoon Cloud-Hole
    add_card(s2, Inches(4.8), Inches(1.8), Inches(3.6), Inches(5.0), "2. The Kharif Cloud-Hole", AMBER)
    tb = s2.shapes.add_textbox(Inches(5.0), Inches(2.4), Inches(3.2), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• India's main cropping season (Kharif, July-Oct) experiences heavy monsoon cloud decks.\n\n"
        "• Optical satellites (Sentinel-2, Landsat) are blinded for 4 to 8 consecutive weeks.\n\n"
        "• Critical vegetative stress occurs inside an observation vacuum."
    )
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_WHITE

    # Card 3: The Delayed Indicator Trap
    add_card(s2, Inches(8.8), Inches(1.8), Inches(3.7), Inches(5.0), "3. The Delayed NDVI Trap", RGBColor(239, 68, 68))
    tb = s2.shapes.add_textbox(Inches(9.0), Inches(2.4), Inches(3.3), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• NDVI and optical vegetation condition indices only drop 14 to 21 days AFTER root-zone water is exhausted.\n\n"
        "• By the time leaves turn brown from satellite view, the crop is permanently dead: an optical post-mortem.\n\n"
        "• True early warning requires soil moisture & evaporative demand (VPD)."
    )
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 3: The BHUMI-X Solution
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "The BHUMI-X Solution: Multimodal Physics-Grounded Intelligence")

    # Left: Multimodal inputs
    add_card(s3, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0), "Multimodal Earth Observation Fusion", EMERALD)
    tb = s3.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "🛰️ Copernicus Sentinel-1 Active C-band SAR Radar (10m):\n"
        "   Microwaves penetrate 100% of monsoon cloud decks to measure soil roughness & canopy moisture.\n\n"
        "🌿 Copernicus Sentinel-2 MSI Optical (10m):\n"
        "   12-band surface reflectance, NDVI, and chlorophyll absorption.\n\n"
        "🌡️ ECMWF ERA5-Land & NASA POWER Hydrometeorology (Daily):\n"
        "   Atmospheric evaporative demand: Vapor Pressure Deficit (VPD), precipitation breaks, and thermal stress.\n\n"
        "🏔️ ISRIC SoilGrids 250m & Saxton-Rawls Pedotransfer:\n"
        "   Physical Field Capacity (FC), Wilting Point (PWP), and Root-Zone Soil Water Deficit Index (SWDI)."
    )
    p.font.size = Pt(11.5)
    p.font.color.rgb = TEXT_WHITE

    # Right: Technical breakthroughs
    add_card(s3, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0), "Scientific & Mathematical Rigor", SKY_BLUE)
    tb = s3.shapes.add_textbox(Inches(7.0), Inches(2.4), Inches(5.3), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "⚡ Reliability-Gated Cross-Attention (RGCA):\n"
        "   Dynamically reweights modalities; preserves native resolution via Support Embeddings (e_res in R^64).\n\n"
        "🛡️ Modality Availability Mask (MAM):\n"
        "   Detects cloud contamination, zeroes out optical tokens, and relies on active radar & weather compensation.\n\n"
        "🎯 Split-Conformal Prediction Coverage (90% Guarantee):\n"
        "   Outputs calibrated prediction sets with 92.6% verified empirical coverage on held-out test data.\n\n"
        "🛑 Mahalanobis Epistemic Out-of-Distribution Filter:\n"
        "   Autonomous abstention policy when sensor readings deviate beyond physical calibration bounds."
    )
    p.font.size = Pt(11.5)
    p.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 4: Architecture Diagram & Pipeline
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "System Architecture: End-to-End Multimodal Neural Flow")

    # Flow boxes
    flow_steps = [
        ("1. SENSORS", "Sentinel-1 SAR\nSentinel-2 Optical\nERA5 / NASA Met\nISRIC SoilGrids", SKY_BLUE),
        ("2. ENCODERS", "1D/2D CNNs\nTemporal LSTM\nResolution Emb.\n(e_res in R^64)", EMERALD),
        ("3. MAM & RGCA", "Cloud Masking\nCross-Attention\nModality Gating\nView Reweighting", AMBER),
        ("4. LATENT Z", "Unified Latent\nRepresentation\nSpatial Binning\n(100m Binning)", RGBColor(168, 85, 247)),
        ("5. HEADS", "14-d Risk (ADSI)\nDelta SWDI Reg.\nConformal Set\nOOD Abstention", RGBColor(239, 68, 68))
    ]

    for i, (stitle, sdesc, scolor) in enumerate(flow_steps):
        left = Inches(0.8 + i * 2.4)
        add_card(s4, left, Inches(1.8), Inches(2.2), Inches(3.2), stitle, scolor)
        tb = s4.shapes.add_textbox(left + Inches(0.15), Inches(2.5), Inches(1.9), Inches(2.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = sdesc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE

    # Bottom summary card
    add_card(s4, Inches(0.8), Inches(5.3), Inches(11.7), Inches(1.6), "Production Engineering & Zero Dummy Data Guarantee", EMERALD)
    tb = s4.shapes.add_textbox(Inches(1.0), Inches(5.8), Inches(11.3), Inches(0.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• Full-Stack Architecture: React 18 + TypeScript + Vite + Tailwind frontend; Python 3.14 + FastAPI + PyTorch backend.\n"
        "• Spatial LRU Cache: 100-meter binning enabling sub-millisecond (<1ms) repeat inspections.\n"
        "• Cryptographic Provenance Chain: Every observation tracks SHA-256 hash, acquisition timestamp, and source API ID."
    )
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    # ==========================================
    # SLIDE 5: Key Platform Features & FAO-56
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Platform Features: Hyperlocal Observability & FAO-56 Guidance")

    # Feature 1: Hyperlocal GIS Map
    add_card(s5, Inches(0.8), Inches(1.8), Inches(5.6), Inches(2.4), "1. Hyperlocal Precision GIS Map", SKY_BLUE)
    tb = s5.shapes.add_textbox(Inches(1.0), Inches(2.3), Inches(5.2), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• Click-to-inspect on ANY farm, village, or terrain across India.\n"
        "• Instant popup displaying Sentinel-2 NDVI, Vertisols soil order, VPD deficit, and 14-day drought probability.\n"
        "• Esri True Satellite (zero watermark), Google Hybrid, and OSM basemaps."
    )
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_WHITE

    # Feature 2: FAO-56 Irrigation
    add_card(s5, Inches(6.8), Inches(1.8), Inches(5.7), Inches(2.4), "2. UN FAO-56 Irrigation Hydraulics", EMERALD)
    tb = s5.shapes.add_textbox(Inches(7.0), Inches(2.3), Inches(5.3), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• Authentic pedotransfer hydraulics: Deficit (mm) = max(0, (theta_FC - theta) * Zr * 1000).\n"
        "• Actionable irrigation urgencies: CRITICAL / IMMEDIATE, ELEVATED, or OPTIMAL.\n"
        "• Exact millimeter supplemental irrigation advice before vegetative stress occurs."
    )
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_WHITE

    # Feature 3: GEE LULC
    add_card(s5, Inches(0.8), Inches(4.5), Inches(5.6), Inches(2.3), "3. Google Earth Engine LULC Prediction", AMBER)
    tb = s5.shapes.add_textbox(Inches(1.0), Inches(5.0), Inches(5.2), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• 10 Land Use / Land Cover classes (Crops, Water, Forest, Grass, Wetland, Built).\n"
        "• Temporal exploration across historical epochs (2005, 2018, 2022) to AI-predicted 2025.\n"
        "• Overlay transparency controls with zero polygon re-render flickering."
    )
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_WHITE

    # Feature 4: What-If Simulator
    add_card(s5, Inches(6.8), Inches(4.5), Inches(5.7), Inches(2.3), "4. Interactive What-If Climate Simulator", RGBColor(168, 85, 247))
    tb = s5.shapes.add_textbox(Inches(7.0), Inches(5.0), Inches(5.3), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "• Stress-test climate scenarios: precipitation cuts (-20% to -80%) and heat surges (+1°C to +5°C).\n"
        "• Live RGCA attention visualizer showing dynamic reallocation to radar and soil.\n"
        "• Immediate feedback on threshold tipping points for extension officers."
    )
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 6: Autonomous Decision Agent
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Decision Agent: Grounded in UAS Dharwad & ICAR Practices")

    # Left: Multi-tool pipeline
    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0), "Deterministic Multi-Tool Execution", SKY_BLUE)
    tb = s6.shapes.add_textbox(Inches(1.0), Inches(2.4), Inches(5.2), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "🔒 Zero LLM Hallucination Policy:\n"
        "   The AI cannot invent weather numbers or override predictions. Observations are loaded as immutable JSON from authenticated tools.\n\n"
        "🛠️ 4-Step Deterministic Agent Workflow:\n"
        "   1. Validate Geography & Soil Context (ISRIC SoilGrids & Vertisol orders).\n"
        "   2. Satellite Observation Tool (Sentinel-1 SAR VV/VH & Sentinel-2 optical).\n"
        "   3. BhumiXNet Inference & Conformal Uncertainty Tool (90% coverage).\n"
        "   4. Agronomic Knowledge Retrieval (UAS Dharwad Package of Practices).\n\n"
        "👤 Human-in-the-Loop Sign-Off:\n"
        "   Capital-intensive actions (e.g., life-saving irrigation infrastructure) mandate explicit agronomist sign-off."
    )
    p.font.size = Pt(11.5)
    p.font.color.rgb = TEXT_WHITE

    # Right: Agronomic package of practices
    add_card(s6, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0), "Verified Agronomic Interventions", EMERALD)
    tb = s6.shapes.add_textbox(Inches(7.0), Inches(2.4), Inches(5.3), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "🌱 Mild Stress Actions (Pre-wilting):\n"
        "   • Inter-cultivation & Shallow Hoeing: Creates a 3-5 cm dust mulch that breaks capillary soil pore tubes, saving up to 25% soil moisture.\n"
        "   • Weed Eradication: Eliminates secondary evapotranspirative loss.\n\n"
        "⚠️ Elevated Stress Actions (VPD > 2.5 kPa):\n"
        "   • Foliar spray of 1% Potassium Nitrate (KNO3 @ 10 g/L): K+ ions induce active stomatal regulation, curbing luxury transpiration.\n"
        "   • Crop Residue Mulching (5 t/ha): Lowers soil temperature by 3-5°C.\n\n"
        "🚨 Critical Stress Actions (Predicted Deficit > 70%):\n"
        "   • Protective Life-Saving Irrigation (40-50 mm) during critical Maize tasseling/silking or Ragi flowering.\n"
        "   • Anti-Transpirant Application (Kaolin 5% foliar spray)."
    )
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 7: Benchmarks & Future Scope
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Empirical Benchmarks & Future Horizons")

    # Table on Left
    table_card = add_card(s7, Inches(0.8), Inches(1.8), Inches(6.6), Inches(5.0), "Benchmark Evaluation (3,755 Records, 2021-2025)", EMERALD)
    
    rows, cols = 7, 5
    table_shape = s7.shapes.add_table(rows, cols, Inches(1.0), Inches(2.5), Inches(6.2), Inches(3.8))
    table = table_shape.table

    headers = ["Model Scope", "Precision", "Recall", "F1", "AUROC"]
    data = [
        ["Logistic Reg (Weather)", "0.712", "0.755", "0.733", "0.918"],
        ["Random Forest (Optical)", "0.707", "0.835", "0.766", "0.937"],
        ["Random Forest (SAR)", "0.677", "0.880", "0.765", "0.928"],
        ["XGBoost (Soil + Met)", "0.785", "0.886", "0.833", "0.967"],
        ["XGBoost (Multimodal)", "0.806", "0.886", "0.844", "0.962"],
        ["BHUMI-X (Proposed)", "0.805", "0.942", "0.868", "0.978"]
    ]

    for c, h in enumerate(headers):
        cell = table.cell(0, c)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(30, 41, 59)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = SKY_BLUE

    for r, row_data in enumerate(data):
        for c, val in enumerate(row_data):
            cell = table.cell(r + 1, c)
            cell.text = val
            cell.fill.solid()
            if r == 5:
                cell.fill.fore_color.rgb = RGBColor(6, 78, 59)
            else:
                cell.fill.fore_color.rgb = RGBColor(15, 23, 42)
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(9.5)
            p.font.color.rgb = TEXT_WHITE
            if r == 5:
                p.font.bold = True
                p.font.color.rgb = EMERALD

    # Right: Validated Hypotheses & Future Scope
    add_card(s7, Inches(7.7), Inches(1.8), Inches(4.8), Inches(5.0), "Validated Tests & Future Roadmap", SKY_BLUE)
    tb = s7.shapes.add_textbox(Inches(7.9), Inches(2.4), Inches(4.4), Inches(4.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "✅ Verified Research Hypotheses:\n"
        "   • Kharif Cloud Blackout Test: 95.47% performance retention under 100% cloud deck (AUROC = 0.9695).\n"
        "   • Spatial Transfer (LODO): AUROC = 0.9580, F1 = 0.8971 on unseen drought-prone Gadag district.\n"
        "   • Conformal Calibration: 92.6% coverage against 90% confidence target.\n\n"
        "🚀 Future Research Roadmap:\n"
        "   • NASA-ISRO SAR (NISAR) Integration: L-and-S band polarimetry for sub-canopy root moisture.\n"
        "   • Multi-Agent Water Grid: Linking farm-level agents to district canal sluice gates.\n"
        "   • Vernacular WhatsApp Audio Bot: Automated Kannada & Hindi advisories for smallholders."
    )
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_WHITE

    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    out_dir = r"c:\Users\Phanishree N\OneDrive\Pictures\Documents\Desktop\Vibe Check"
    out_file = os.path.join(out_dir, "BHUMI_X_Pitch_Deck.pptx")
    create_deck(out_file)
