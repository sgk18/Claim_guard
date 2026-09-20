"""
ClaimGuard Master Pitch PPTX Generator (Enhanced with Real Live Verified Data)
Generates a professional, editable 16:9 PowerPoint pitch deck (ClaimGuard_Product_Pitch.pptx)
adhering strictly to ClaimGuard's design system, 5-color palette, typography hierarchy,
structured card layouts, uncropped images, and full embedded speaker notes for all 15 slides.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# 1. Colors
ORANGE = RGBColor(0xF9, 0x73, 0x16)
PEACH = RGBColor(0xFD, 0xBA, 0x74)
DARK_NAVY = RGBColor(0x0F, 0x17, 0x2A)
SLATE = RGBColor(0x33, 0x41, 0x55)
LIGHT_SLATE = RGBColor(0x64, 0x74, 0x8B)
OFF_WHITE = RGBColor(0xF8, 0xFA, 0xFC)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BORDER_GRAY = RGBColor(0xCB, 0xD5, 0xE1)
CARD_BG = RGBColor(0xFF, 0xFF, 0xFF)
DARK_CARD = RGBColor(0x1E, 0x29, 0x3B)
ACCENT_GREEN = RGBColor(0x16, 0xA3, 0x4A)
ACCENT_RED = RGBColor(0xDC, 0x26, 0x26)
ACCENT_AMBER = RGBColor(0xD9, 0x77, 0x06)

FONT_FAMILY = "Plus Jakarta Sans"

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen standard
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def get_speaker_note(slide_num):
        path = f"presentation/speaker-notes/slide-{slide_num:02d}.md"
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        return "No speaker notes."

    def add_background(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, kicker, title, dark_mode=False):
        kicker_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.7), Inches(0.35))
        tf = kicker_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = kicker.upper()
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = PEACH if dark_mode else ORANGE

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT_FAMILY
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = WHITE if dark_mode else DARK_NAVY

    def add_footer(slide, slide_num, dark_mode=False):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.95), Inches(11.7), Inches(0.3))
        tf = footer_box.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"CLAIMGUARD PRODUCT PITCH   |   SLIDE {slide_num:02d} OF 15   |   APEX LOGISTICS INDIA PVT LTD"
        p.font.name = FONT_FAMILY
        p.font.size = Pt(9)
        p.font.color.rgb = LIGHT_SLATE

    # =========================================================================
    # SLIDE 1: COVER
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_background(s1, DARK_NAVY)
    
    tbox = s1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(6.5), Inches(5.0))
    tf = tbox.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = "FINANCIAL VERIFICATION INTELLIGENCE"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = PEACH
    
    p2 = tf.add_paragraph()
    p2.text = "CLAIMGUARD"
    p2.font.size = Pt(46)
    p2.font.bold = True
    p2.font.color.rgb = WHITE
    p2.space_before = Pt(10)
    
    p3 = tf.add_paragraph()
    p3.text = "Intelligent Expense & Receipt Verification"
    p3.font.size = Pt(20)
    p3.font.bold = True
    p3.font.color.rgb = ORANGE
    p3.space_before = Pt(8)
    
    p4 = tf.add_paragraph()
    p4.text = "From field receipt submission to risk-aware managerial decision making. A unified, deterministic compliance platform connecting mobile field staff, cloud OCR, deterministic fraud math, and finance controllers."
    p4.font.size = Pt(13)
    p4.font.color.rgb = OFF_WHITE
    p4.space_before = Pt(14)

    p5 = tf.add_paragraph()
    p5.text = "Verified Reference: Apex Logistics & Field Solutions India Pvt Ltd (APEX-2026)"
    p5.font.size = Pt(11)
    p5.font.bold = True
    p5.font.color.rgb = PEACH
    p5.space_before = Pt(16)

    img_path = "presentation/images/cover-ecosystem.jpg"
    if os.path.exists(img_path):
        s1.shapes.add_picture(img_path, Inches(7.5), Inches(1.5), width=Inches(5.0))
    
    add_footer(s1, 1, dark_mode=True)
    s1.notes_slide.notes_text_frame.text = get_speaker_note(1)

    # =========================================================================
    # SLIDE 2: PROBLEM
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_background(s2, OFF_WHITE)
    add_header(s2, "The Operational Problem", "Expense verification is still too manual.")

    cards = [
        ("1. PAPER & CHAT CHAOS", "Field employees collect thermal slips in pockets or forward unstructured WhatsApp photos weeks after travel ends.", "Unstructured Inputs"),
        ("2. MANUAL DATA ENTRY", "Controllers spend 5–10 minutes per receipt deciphering faded thermal print and re-typing totals into spreadsheets.", "High Admin Cost"),
        ("3. UNSPOTTED DUPLICATES", "The human eye cannot spot when the exact same fuel slip was already claimed 3 weeks earlier under a different project code.", "Silent Leakage"),
        ("4. LOST TAX CREDITS", "Fake, unverified, or non-existent vendor GSTIN numbers invalidate corporate tax deductions, causing lost Input Tax Credit (ITC).", "Compliance Risk")
    ]
    
    left = 0.8
    for title, desc, tag in cards:
        shape = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(1.85), Inches(2.75), Inches(4.7))
        shape.fill.solid()
        shape.fill.fore_color.rgb = CARD_BG
        shape.line.color.rgb = BORDER_GRAY
        shape.line.width = Pt(1.5)
        
        tf = shape.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.3)
        
        p = tf.paragraphs[0]
        p.text = tag.upper()
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = ORANGE
        
        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(14)
        p2.font.bold = True
        p2.font.color.rgb = DARK_NAVY
        p2.space_before = Pt(8)
        
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(11)
        p3.font.color.rgb = SLATE
        p3.space_before = Pt(12)
        
        left += 2.95

    add_footer(s2, 2)
    s2.notes_slide.notes_text_frame.text = get_speaker_note(2)

    # =========================================================================
    # SLIDE 3: CORE IDEA
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_background(s3, DARK_NAVY)
    add_header(s3, "Product Thesis", "What if every receipt could be screened before manual review?", dark_mode=True)

    box1 = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.85), Inches(5.6), Inches(4.7))
    box1.fill.solid()
    box1.fill.fore_color.rgb = DARK_CARD
    box1.line.color.rgb = SLATE
    tf1 = box1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = tf1.margin_top = Inches(0.3)
    
    p = tf1.paragraphs[0]
    p.text = "THE TRADITIONAL PARADIGM"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = LIGHT_SLATE
    
    steps_trad = [
        "Employee submits crumpled paper / raw photo without metadata",
        "Piles up in finance inbox for weeks in backlog",
        "Manager spends 10 minutes manually verifying arithmetic & caps",
        "Duplicate payouts and GST compliance errors slip through"
    ]
    for s in steps_trad:
        p = tf1.add_paragraph()
        p.text = f"X  {s}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = OFF_WHITE
        p.space_before = Pt(14)

    box2 = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(1.85), Inches(5.7), Inches(4.7))
    box2.fill.solid()
    box2.fill.fore_color.rgb = DARK_CARD
    box2.line.color.rgb = ORANGE
    box2.line.width = Pt(2)
    tf2 = box2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = tf2.margin_top = Inches(0.3)
    
    p = tf2.paragraphs[0]
    p.text = "THE CLAIMGUARD PARADIGM"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    
    steps_cg = [
        "Employee captures instant photo via Flutter mobile app",
        "Instant AWS Textract extraction & key-value normalization",
        "Deterministic fraud checks (Perceptual Hash, GSTIN, Anomaly)",
        "Compounded 0–100 risk score & Bedrock narrative",
        "Manager reviews decision-ready evidence in seconds"
    ]
    for s in steps_cg:
        p = tf2.add_paragraph()
        p.text = f"->  {s}"
        p.font.size = Pt(11.5)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.space_before = Pt(10)

    add_footer(s3, 3, dark_mode=True)
    s3.notes_slide.notes_text_frame.text = get_speaker_note(3)

    # =========================================================================
    # SLIDE 4: COMPLETE WORKFLOW (7 STAGES, 2 ROWS)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_background(s4, OFF_WHITE)
    add_header(s4, "Continuous Pipeline", "One workflow. Multiple verification layers.")

    row1 = [
        ("01. CAPTURE", "Mobile Viewfinder", "Rahul snaps fuel receipt in Flutter app with edge alignment."),
        ("02. EXTRACT", "AWS Textract OCR", "Extracts Indian Oil Corp, ₹1,850.00, Date & 15-char GSTIN."),
        ("03. VALIDATE", "Policy & Caps", "Checks fuel cap <= ₹5,000, date within tour, math consistency."),
        ("04. DETECT", "Fraud Signals", "Perceptual hash collision check (Hamming <= 5) & GSTIN check.")
    ]
    
    left = 0.8
    for num, title, desc in row1:
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(1.85), Inches(2.75), Inches(2.2))
        c.fill.solid()
        c.fill.fore_color.rgb = WHITE
        c.line.color.rgb = BORDER_GRAY
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.2)
        p = tf.paragraphs[0]
        p.text = num
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = ORANGE
        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(13)
        p2.font.bold = True
        p2.font.color.rgb = DARK_NAVY
        p2.space_before = Pt(4)
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(10)
        p3.font.color.rgb = SLATE
        p3.space_before = Pt(6)
        left += 2.95

    row2 = [
        ("05. ASSESS", "0-100 Risk Engine", "Calculates score: CLM-4401 = 8 (LOW), CLM-4471 = 65 (HIGH)."),
        ("06. REVIEW", "Manager Cockpit", "Priya Sharma reviews side-by-side evidence with AI summary."),
        ("07. AUDIT", "Supabase Log", "Immutable append-only row: actor, timestamp, and audit notes.")
    ]

    left = 0.8
    for num, title, desc in row2:
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(4.3), Inches(2.75), Inches(2.2))
        c.fill.solid()
        c.fill.fore_color.rgb = WHITE
        c.line.color.rgb = BORDER_GRAY
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.2)
        p = tf.paragraphs[0]
        p.text = num
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = DARK_NAVY
        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(13)
        p2.font.bold = True
        p2.font.color.rgb = DARK_NAVY
        p2.space_before = Pt(4)
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(10)
        p3.font.color.rgb = SLATE
        p3.space_before = Pt(6)
        left += 2.95

    # Summary box
    sbox = s4.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left), Inches(4.3), Inches(2.75), Inches(2.2))
    sbox.fill.solid()
    sbox.fill.fore_color.rgb = DARK_NAVY
    tf = sbox.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.25)
    p = tf.paragraphs[0]
    p.text = "CONTINUOUS AUDIT"
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = PEACH
    p2 = tf.add_paragraph()
    p2.text = "Zero Data Gaps"
    p2.font.size = Pt(14)
    p2.font.bold = True
    p2.font.color.rgb = WHITE
    p2.space_before = Pt(4)
    p3 = tf.add_paragraph()
    p3.text = "From shutter click to permanent audit log in < 4 seconds."
    p3.font.size = Pt(10.5)
    p3.font.color.rgb = OFF_WHITE
    p3.space_before = Pt(6)

    add_footer(s4, 4)
    s4.notes_slide.notes_text_frame.text = get_speaker_note(4)

    # =========================================================================
    # SLIDE 5: EMPLOYEE EXPERIENCE (REAL DATA: RAHUL KUMAR)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_background(s5, OFF_WHITE)
    add_header(s5, "Field Mobility & Real Live Session", "For employees, submitting a claim becomes simple.")

    box = s5.shapes.add_textbox(Inches(0.8), Inches(1.85), Inches(6.2), Inches(4.8))
    tf = box.text_frame
    tf.word_wrap = True
    
    pts = [
        ("Active Submitter Session: Rahul Kumar", "Senior Field Sales Executive &bull; South Sales &bull; Historical Avg: ₹1,650.00 (38 claims)."),
        ("Live Ingestion: CLM-4401 (Indian Oil Corp)", "Category: Fuel &bull; Amount: ₹1,850.00 &bull; Date: 16 Sep 2026 &bull; Tour: BLR-MYS Regional."),
        ("Instant Viewfinder Extraction", "Real-time edge framing. The employee snaps the photo and receives structured results in 2 seconds."),
        ("Zero Cloud Jargon", "Employees see only their claim progress. All OCR, risk scoring, and cloud services remain invisible."),
        ("Instant Push Status Sync", "Push cards notify field staff the moment a claim is verified, reviewed, or approved.")
    ]
    for i, (title, desc) in enumerate(pts):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = title
        p.font.size = Pt(12.5)
        p.font.bold = True
        p.font.color.rgb = DARK_NAVY
        if i > 0: p.space_before = Pt(9)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(2)

    img_path = "presentation/images/employee-mobile.jpg"
    if os.path.exists(img_path):
        s5.shapes.add_picture(img_path, Inches(7.3), Inches(1.85), width=Inches(5.2))

    add_footer(s5, 5)
    s5.notes_slide.notes_text_frame.text = get_speaker_note(5)

    # =========================================================================
    # SLIDE 6: MANAGER EXPERIENCE (REAL DATA: PRIYA SHARMA)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_background(s6, OFF_WHITE)
    add_header(s6, "Operations Cockpit & Live Review", "Managers see the entire picture.")

    img_path = "presentation/images/manager-dashboard.jpg"
    if os.path.exists(img_path):
        s6.shapes.add_picture(img_path, Inches(0.8), Inches(1.85), width=Inches(5.6))

    box = s6.shapes.add_textbox(Inches(6.7), Inches(1.85), Inches(5.8), Inches(4.8))
    tf = box.text_frame
    tf.word_wrap = True
    
    pts = [
        ("Active Controller: Priya Sharma", "Finance Operations Controller &bull; Reviewing CLM-4471 (Flagged Duplicate Suspect)."),
        ("Flagged Evidence: Indian Oil Corp (₹3,850)", "Duplicate Hash: Matches prior claim CLM-3902 (Hamming <= 5).\nAnomaly Spike: ₹3,850 is 2.33x employee category baseline (₹1,650)."),
        ("Split-Screen Verification Cockpit", "Original high-res receipt on the left; normalized key-values and GSTIN validation on the right."),
        ("Prioritized Risk Triage", "Queue dynamically filtered: Low (batch approve), Medium, High, or Critical."),
        ("One-Click Actions with Audit", "Approve, Reject, or Request Clarification with mandatory compliance notes committed to Supabase.")
    ]
    for i, (title, desc) in enumerate(pts):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = title
        p.font.size = Pt(12.5)
        p.font.bold = True
        p.font.color.rgb = DARK_NAVY
        if i > 0: p.space_before = Pt(9)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(2)

    add_footer(s6, 6)
    s6.notes_slide.notes_text_frame.text = get_speaker_note(6)

    # =========================================================================
    # SLIDE 7: OCR (REAL AWS TEXTRACT PAYLOAD)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_background(s7, DARK_NAVY)
    add_header(s7, "Document Intelligence & Real Payload", "From image to structured information.", dark_mode=True)

    img_path = "presentation/images/ocr-extraction.jpg"
    if os.path.exists(img_path):
        s7.shapes.add_picture(img_path, Inches(0.8), Inches(1.85), width=Inches(5.5))

    box = s7.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.6), Inches(1.85), Inches(5.9), Inches(4.7))
    box.fill.solid()
    box.fill.fore_color.rgb = DARK_CARD
    box.line.color.rgb = SLATE
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.3)
    
    p = tf.paragraphs[0]
    p.text = "VERIFIED TEXTRACT EXTRACTION: CLM-4401"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = PEACH
    
    payload = [
        "VENDOR:  'Indian Oil Corporation Ltd' (98% Confidence)",
        "AMOUNT:  1850.00 INR (99% Confidence)",
        "DATE:    '2026-09-16' (Normalized from '16/09/2026')",
        "GSTIN:   '29AAACI1681G1ZS' (92% Confidence &bull; Karnataka)",
        "ITEMS:   [{'item': 'Diesel High Speed', 'amount': 1850.00}]"
    ]
    for s in payload:
        p = tf.add_paragraph()
        p.text = s
        p.font.size = Pt(10)
        p.font.color.rgb = WHITE
        p.space_before = Pt(6)
    
    p3 = tf.add_paragraph()
    p3.text = "THE FUNDAMENTAL PRINCIPLE"
    p3.font.size = Pt(11)
    p3.font.bold = True
    p3.font.color.rgb = ORANGE
    p3.space_before = Pt(14)
    
    p4 = tf.add_paragraph()
    p4.text = "OCR asks: 'What text does this document contain?'\nOCR does NOT ask: 'Is this document legitimate?'\n\nA completely fake receipt printed on paper will extract with 100% confidence. That is why OCR is only the starting point."
    p4.font.size = Pt(10.5)
    p4.font.color.rgb = OFF_WHITE
    p4.space_before = Pt(4)

    add_footer(s7, 7, dark_mode=True)
    s7.notes_slide.notes_text_frame.text = get_speaker_note(7)

    # =========================================================================
    # SLIDE 8: VALIDATION + FRAUD SIGNALS (REAL RULES)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_background(s8, OFF_WHITE)
    add_header(s8, "Deterministic Math Engine", "OCR is only the beginning: 6 verification signals.")

    signals = [
        ("Perceptual Duplicate Hash", "Visual hash matches prior claim CLM-3902 (Hamming <= 5).", "+40 PTS", ACCENT_RED),
        ("GSTIN Luhn Checksum", "Tax ID 29AAACI1681G1ZS passes Karnataka state code 29 & Modulo 36.", "0 PTS &bull; PASS", ACCENT_GREEN),
        ("Amount Anomaly Baseline", "Amount ₹3,850.00 is 2.33x Rahul Kumar's historical category avg (₹1,650).", "+20 PTS", ACCENT_AMBER),
        ("Merchant Category Match", "Indian Oil line items (Diesel) match policy category FUEL.", "0 PTS &bull; PASS", ACCENT_GREEN),
        ("Policy Cap Evaluation", "Under single max limit (₹5,000) but triggers daily travel cap review.", "+5 PTS", SLATE),
        ("Date & Tour Consistency", "Receipt date (17/09/2026) matches active tour trip_blr_mys_01 window.", "0 PTS &bull; PASS", ACCENT_GREEN)
    ]

    left = 0.8
    top = 1.85
    for i, (name, desc, pts, color) in enumerate(signals):
        c = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(3.7), Inches(2.2))
        c.fill.solid()
        c.fill.fore_color.rgb = WHITE
        c.line.color.rgb = BORDER_GRAY
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.2)
        
        p = tf.paragraphs[0]
        p.text = pts
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = color
        
        p2 = tf.add_paragraph()
        p2.text = name
        p2.font.size = Pt(12)
        p2.font.bold = True
        p2.font.color.rgb = DARK_NAVY
        p2.space_before = Pt(4)
        
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(9.5)
        p3.font.color.rgb = SLATE
        p3.space_before = Pt(6)
        
        if i % 3 == 2:
            left = 0.8
            top += 2.45
        else:
            left += 4.0

    add_footer(s8, 8)
    s8.notes_slide.notes_text_frame.text = get_speaker_note(8)

    # =========================================================================
    # SLIDE 9: RISK ENGINE (REAL COMPARISON)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_background(s9, OFF_WHITE)
    add_header(s9, "Risk Prioritization & Real Scores", "Turn multiple signals into a decision-ready risk view.")

    img_path = "presentation/images/fraud-risk.jpg"
    if os.path.exists(img_path):
        s9.shapes.add_picture(img_path, Inches(0.8), Inches(1.85), width=Inches(5.5))

    box = s9.shapes.add_textbox(Inches(6.6), Inches(1.85), Inches(5.9), Inches(4.7))
    tf = box.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = "COMPARISON OF 2 REAL LIVE CLAIMS"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    
    comparisons = [
        ("CLM-4401 &bull; VERIFIED (SCORE: 8 / 100 &bull; LOW)", "Indian Oil Corp ₹1,850. Valid GSTIN, 0 fraud flags. Auto-approved or single-click clear.", ACCENT_GREEN),
        ("CLM-4471 &bull; SUSPICIOUS (SCORE: 65 / 100 &bull; HIGH)", "Duplicate hash (+40) + Anomaly spike (+20) + Policy cap (+5). Routed to Investigation.", ACCENT_RED),
        ("5 Standardized States", "VERIFIED (0–24), LIKELY VALID (0–24), REVIEW REQUIRED (25–49), SUSPICIOUS (50–74), UNABLE TO VERIFY (<70% OCR).", DARK_NAVY)
    ]
    for st, d, col in comparisons:
        p = tf.add_paragraph()
        p.text = f"[{st}]"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_before = Pt(10)
        
        p2 = tf.add_paragraph()
        p2.text = d
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(2)

    add_footer(s9, 9)
    s9.notes_slide.notes_text_frame.text = get_speaker_note(9)

    # =========================================================================
    # SLIDE 10: AI ROLE
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_background(s10, DARK_NAVY)
    add_header(s10, "Boundary of Intelligence", "AI assists the review. It does not replace it.", dark_mode=True)

    box1 = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.85), Inches(5.6), Inches(4.7))
    box1.fill.solid()
    box1.fill.fore_color.rgb = DARK_CARD
    box1.line.color.rgb = ACCENT_GREEN
    box1.line.width = Pt(1.5)
    tf1 = box1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = tf1.margin_top = Inches(0.3)
    p = tf1.paragraphs[0]
    p.text = "WHAT AI DOES &bull; LIVE SYNTHESIS FOR CLM-4471"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    
    p2 = tf1.add_paragraph()
    p2.text = "\"Receipt image perceptual hash matches Claim #3902 submitted on 28 Aug 2026 by same employee. Claim amount ₹3,850 exceeds Rahul Kumar's historical category mean (₹1,650) by 2.33x. Manual investigation recommended before payout.\""
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = WHITE
    p2.space_before = Pt(8)

    can_items = [
        "Translates raw hash distances & statistical ratios into plain English",
        "Prompts the manager on exact evidence questions during review",
        "Assists receipt taxonomy classification when fuzzy",
        "Accelerates triage so humans make faster, confident decisions"
    ]
    for it in can_items:
        p = tf1.add_paragraph()
        p.text = f"+  {it}"
        p.font.size = Pt(10)
        p.font.color.rgb = OFF_WHITE
        p.space_before = Pt(8)

    box2 = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(1.85), Inches(5.7), Inches(4.7))
    box2.fill.solid()
    box2.fill.fore_color.rgb = DARK_CARD
    box2.line.color.rgb = ACCENT_RED
    box2.line.width = Pt(1.5)
    tf2 = box2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = tf2.margin_top = Inches(0.3)
    p = tf2.paragraphs[0]
    p.text = "WHAT AI DOES NOT DO (STRICT CONTROLS)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_RED
    
    not_items = [
        "Zero Autonomous Approvals: AI never approves or disburses funds",
        "Zero Autonomous Rejections: Rejections require human confirmation",
        "No Policy Overrides: AI cannot modify company caps or tax rules",
        "Immutable Audit Records: AI cannot touch or mutate database rows",
        "Zero Credential Authority: Cannot grant org access or tokens"
    ]
    for it in not_items:
        p = tf2.add_paragraph()
        p.text = f"-  {it}"
        p.font.size = Pt(10.5)
        p.font.color.rgb = OFF_WHITE
        p.space_before = Pt(12)

    add_footer(s10, 10, dark_mode=True)
    s10.notes_slide.notes_text_frame.text = get_speaker_note(10)

    # =========================================================================
    # SLIDE 11: SYSTEM ARCHITECTURE
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_background(s11, OFF_WHITE)
    add_header(s11, "Scalable Platform", "Built as a connected, scalable platform.")

    tiers = [
        ("1. PRESENTATION SURFACES", "Flutter Mobile App (Field Staff)  |  Next.js 15 Operations Portal (Finance Managers)", ORANGE),
        ("2. SECURE API GATEWAY", "Fastify REST API  |  JWT Authentication  |  Organization Multi-Tenancy Scoping", DARK_NAVY),
        ("3. CORE DOMAIN SERVICES", "Receipt Processing  |  Deterministic Fraud Rules  |  0–100 Scorer  |  Audit Committer", SLATE),
        ("4. DATA PERSISTENCE & CLOUD", "Supabase PostgreSQL (RLS, Multi-tenant)  |  AWS S3, Textract, Step Functions, Bedrock", ORANGE)
    ]
    
    top = 1.85
    for title, desc, col in tiers:
        bar = s11.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(top), Inches(11.7), Inches(1.05))
        bar.fill.solid()
        bar.fill.fore_color.rgb = WHITE
        bar.line.color.rgb = BORDER_GRAY
        bar.line.width = Pt(1.5)
        tf = bar.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = Inches(0.2)
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = col
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11.5)
        p2.font.color.rgb = DARK_NAVY
        p2.space_before = Pt(3)
        top += 1.25

    add_footer(s11, 11)
    s11.notes_slide.notes_text_frame.text = get_speaker_note(11)

    # =========================================================================
    # SLIDE 12: COMPLETE DATA PIPELINE (REAL TRACE: CLM-4471)
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_background(s12, DARK_NAVY)
    add_header(s12, "Receipt Lifecycle & Live Trace: CLM-4471", "Follow one receipt through the system (15 Steps).", dark_mode=True)

    steps_12 = [
        "1. Rahul snaps receipt in Flutter app",
        "2. Fastify API receives encrypted image",
        "3. Claim created: CLM-4471 (SUBMITTED)",
        "4. Private S3 bucket KMS upload",
        "5. EventBridge triggers Textract event",
        "6. Textract extracts ₹3,850 & Indian Oil",
        "7. Normalizer standardizes to 2026-09-17",
        "8. GSTIN 29AAACI1681G1ZS verified valid",
        "9. Hash collision: matches CLM-3902 (+40)",
        "10. Anomaly: 2.33x employee baseline (+20)",
        "11. Score computed: 65/100 (HIGH Risk)",
        "12. Bedrock generates explanation summary",
        "13. Persists to Supabase with RLS security",
        "14. Priya Sharma rejects with audit note",
        "15. Phone syncs: Status updated instantly"
    ]
    
    col1 = steps_12[:5]
    col2 = steps_12[5:10]
    col3 = steps_12[10:]
    
    left = 0.8
    for col in [col1, col2, col3]:
        c = s12.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left), Inches(1.85), Inches(3.7), Inches(4.7))
        c.fill.solid()
        c.fill.fore_color.rgb = DARK_CARD
        c.line.color.rgb = SLATE
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.25)
        for i, s in enumerate(col):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.text = s
            p.font.size = Pt(11)
            p.font.color.rgb = OFF_WHITE
            if i > 0: p.space_before = Pt(14)
        left += 4.0

    add_footer(s12, 12, dark_mode=True)
    s12.notes_slide.notes_text_frame.text = get_speaker_note(12)

    # =========================================================================
    # SLIDE 13: ORGANIZATION + JOIN CODE (REAL APEX DATA)
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_background(s13, OFF_WHITE)
    add_header(s13, "Controlled Onboarding & Live Workspace", "Simple onboarding. Controlled access.")

    img_path = "presentation/images/onboarding-pairing.jpg"
    if os.path.exists(img_path):
        s13.shapes.add_picture(img_path, Inches(0.8), Inches(1.85), width=Inches(5.6))

    box = s13.shapes.add_textbox(Inches(6.7), Inches(1.85), Inches(5.8), Inches(4.7))
    tf = box.text_frame
    tf.word_wrap = True
    
    pairing_pts = [
        ("Live Active Join Code: CG-7K4P9X", "Assigned to Apex Logistics India Pvt Ltd (APEX-2026). Max 100 uses &bull; Valid 30 days."),
        ("Manager Creates Workspace", "Priya Sharma configures spending policies (Fuel ₹5k cap, Meals ₹1.2k cap) and department roles."),
        ("Employee Pairs Device Instantly", "Rahul Kumar enters code CG-7K4P9X once. Device is cryptographically bound to Apex Logistics."),
        ("No Social Login Dependency", "No corporate Google accounts or passwords required for field technicians. Paired via device session."),
        ("Secure Session JWT Tokens", "Backend validates code, provisions membership, and issues scoped access tokens stored in keychain.")
    ]
    for i, (title, desc) in enumerate(pairing_pts):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = DARK_NAVY
        if i > 0: p.space_before = Pt(9)
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(2)

    add_footer(s13, 13)
    s13.notes_slide.notes_text_frame.text = get_speaker_note(13)

    # =========================================================================
    # SLIDE 14: EXPECTED OUTCOMES
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    add_background(s14, OFF_WHITE)
    add_header(s14, "Business Impact", "What ClaimGuard is designed to improve.")

    outcomes = [
        ("LESS MANUAL VERIFICATION", "Automated Textract data entry and deterministic arithmetic checks eliminate repetitive receipt auditing."),
        ("FASTER REVIEW CYCLES", "Field employees receive reimbursement approvals in hours or days instead of weeks, boosting workforce morale."),
        ("EARLIER SUSPICIOUS SIGNALS", "Perceptual duplicate hashes, historical spikes, and invalid GSTINs are caught before company funds are disbursed."),
        ("CENTRALIZED VISIBILITY", "Unified PostgreSQL audit trail provides complete compliance oversight across all regional branches and field units.")
    ]

    left = 0.8
    top = 1.85
    for i, (title, desc) in enumerate(outcomes):
        c = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(5.7), Inches(2.25))
        c.fill.solid()
        c.fill.fore_color.rgb = WHITE
        c.line.color.rgb = BORDER_GRAY
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.25)
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = ORANGE
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(6)
        
        if i % 2 == 1:
            left = 0.8
            top += 2.5
        else:
            left += 6.0

    add_footer(s14, 14)
    s14.notes_slide.notes_text_frame.text = get_speaker_note(14)

    # =========================================================================
    # SLIDE 15: FUTURE + CLOSING
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    add_background(s15, DARK_NAVY)
    add_header(s15, "Product Roadmap & Closing", "From receipt verification to an intelligent expense workflow.", dark_mode=True)

    roadmap = [
        ("PHASE 1 (ACTIVE)", "Core receipt verification, OCR extraction, deterministic fraud rules & manager dashboard.", ACCENT_GREEN),
        ("PHASE 2 (NEXT)", "Advanced risk intelligence with 90-day rolling behavioral baselines and peer clustering.", PEACH),
        ("PHASE 3 (ANALYTICS)", "Organization-wide benchmark heatmaps, category leak analysis, and tax audit export.", PEACH),
        ("PHASE 4 (FUTURE)", "Conversational WhatsApp receipt submission channel [FUTURE INTEGRATION].", LIGHT_SLATE),
        ("PHASE 5 (FUTURE)", "Direct two-way accounting sync into SAP, Tally, and Zoho Books [FUTURE INTEGRATION].", LIGHT_SLATE)
    ]
    
    left = 0.8
    for phase, desc, col in roadmap:
        c = s15.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left), Inches(1.85), Inches(2.25), Inches(4.7))
        c.fill.solid()
        c.fill.fore_color.rgb = DARK_CARD
        c.line.color.rgb = col
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.2)
        
        p = tf.paragraphs[0]
        p.text = phase
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = col
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = OFF_WHITE
        p2.space_before = Pt(8)
        
        left += 2.4

    add_footer(s15, 15, dark_mode=True)
    s15.notes_slide.notes_text_frame.text = get_speaker_note(15)

    output_path = "ClaimGuard_Product_Pitch.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_presentation()
