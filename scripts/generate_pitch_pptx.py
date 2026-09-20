"""
ClaimGuard Master Pitch PPTX Generator
Generates a professional, editable 16:9 PowerPoint pitch deck (ClaimGuard_Product_Pitch.pptx)
adhering strictly to ClaimGuard's design system, 5-color palette, typography hierarchy,
structured card layouts, and full embedded speaker notes for all 15 slides.
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
FALLBACK_FONT = "Segoe UI"

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen standard
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide layout

    # Helper: load speaker note
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
        # Kicker
        kicker_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf = kicker_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = kicker.upper()
        p.font.name = FONT_FAMILY
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = PEACH if dark_mode else ORANGE

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(11.7), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT_FAMILY
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = WHITE if dark_mode else DARK_NAVY

    def add_footer(slide, slide_num, dark_mode=False):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.7), Inches(0.3))
        tf = footer_box.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"CLAIMGUARD PRODUCT PITCH   |   SLIDE {slide_num:02d} OF 15"
        p.font.name = FONT_FAMILY
        p.font.size = Pt(9)
        p.font.color.rgb = LIGHT_SLATE if dark_mode else LIGHT_SLATE

    # =========================================================================
    # SLIDE 1: COVER
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_background(s1, DARK_NAVY)
    
    # Left Hero Text
    tbox = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(6.5), Inches(4.5))
    tf = tbox.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = "FINANCIAL VERIFICATION INTELLIGENCE"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = PEACH
    
    p2 = tf.add_paragraph()
    p2.text = "CLAIMGUARD"
    p2.font.size = Pt(48)
    p2.font.bold = True
    p2.font.color.rgb = WHITE
    p2.space_before = Pt(14)
    
    p3 = tf.add_paragraph()
    p3.text = "Intelligent Expense & Receipt Verification"
    p3.font.size = Pt(22)
    p3.font.color.rgb = ORANGE
    p3.space_before = Pt(10)
    
    p4 = tf.add_paragraph()
    p4.text = "From field receipt submission to risk-aware managerial decision making. A unified, deterministic compliance platform for modern distributed organizations."
    p4.font.size = Pt(14)
    p4.font.color.rgb = OFF_WHITE
    p4.space_before = Pt(18)

    # Right Hero Image
    img_path = "presentation/images/cover-ecosystem.jpg"
    if os.path.exists(img_path):
        s1.shapes.add_picture(img_path, Inches(7.4), Inches(1.3), width=Inches(5.2))
    
    add_footer(s1, 1, dark_mode=True)
    s1.notes_slide.notes_text_frame.text = get_speaker_note(1)

    # =========================================================================
    # SLIDE 2: PROBLEM
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_background(s2, OFF_WHITE)
    add_header(s2, "The Operational Problem", "Expense verification is still too manual.")

    cards = [
        ("1. PAPER & CHAT CHAOS", "Field staff collect crumpled paper receipts or forward random photos over WhatsApp threads days or weeks later.", "Unstructured Inputs"),
        ("2. MANUAL DATA ENTRY", "Finance managers manually re-type amounts, vendors, and dates into spreadsheets, struggling with faded ink.", "High Administrative Cost"),
        ("3. UNSPOTTED DUPLICATES", "Humans cannot reliably detect whether the same receipt was already submitted 3 weeks ago or edited.", "Silent Policy Leakage"),
        ("4. LOST TAX CREDITS", "Ineligible GST claims and missing or invalid 15-digit GSTINs lead to lost Input Tax Credit (ITC) on audits.", "Compliance Risk")
    ]
    
    left = 0.8
    for title, desc, tag in cards:
        shape = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(2.0), Inches(2.7), Inches(4.5))
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
        p2.font.size = Pt(15)
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

    # Left box: Traditional vs ClaimGuard
    box1 = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.5))
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
        "Employee submits crumpled paper / raw photo",
        "Piles up in finance inbox for weeks",
        "Manager spends 10 minutes manually verifying math",
        "Duplicate payouts and compliance errors slip through"
    ]
    for s in steps_trad:
        p = tf1.add_paragraph()
        p.text = f"X  {s}"
        p.font.size = Pt(12)
        p.font.color.rgb = OFF_WHITE
        p.space_before = Pt(14)

    # Right box: ClaimGuard Paradigm
    box2 = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(2.0), Inches(5.7), Inches(4.5))
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
        "Employee captures instant photo via Flutter mobile",
        "Instant AWS Textract extraction & normalizer",
        "Deterministic fraud checks (Hash, GSTIN, Anomaly)",
        "Compounded 0-100 risk score & Bedrock explanation",
        "Manager receives decision-ready evidence in seconds"
    ]
    for s in steps_cg:
        p = tf2.add_paragraph()
        p.text = f"->  {s}"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.space_before = Pt(10)

    add_footer(s3, 3, dark_mode=True)
    s3.notes_slide.notes_text_frame.text = get_speaker_note(3)

    # =========================================================================
    # SLIDE 4: COMPLETE WORKFLOW (7 STAGES)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_background(s4, OFF_WHITE)
    add_header(s4, "End-to-End Architecture", "One workflow. Multiple verification layers.")

    stages = [
        ("1. CAPTURE", "Mobile Flutter app captures receipt image with alignment guidance."),
        ("2. EXTRACT", "AWS Textract extracts vendor, date, total, GSTIN & line items."),
        ("3. VALIDATE", "Deterministic validation tests date boundaries and math."),
        ("4. DETECT", "Perceptual hashing & anomaly baselines detect fraud signals."),
        ("5. ASSESS", "Deterministic 0-100 scoring derives verified authenticity state."),
        ("6. REVIEW", "Manager reviews evidence side-by-side in operations cockpit."),
        ("7. AUDIT", "Append-only immutable audit trail records actor, action & timestamp.")
    ]
    
    # 2 rows of stages
    row1 = stages[:4]
    row2 = stages[4:]
    
    left = 0.8
    for title, desc in row1:
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(2.0), Inches(2.75), Inches(2.1))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = BORDER_GRAY
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.2)
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = ORANGE
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(6)
        left += 2.95

    left = 1.3
    for title, desc in row2:
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(4.4), Inches(3.2), Inches(2.1))
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = BORDER_GRAY
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.2)
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = ORANGE
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(6)
        left += 3.7

    add_footer(s4, 4)
    s4.notes_slide.notes_text_frame.text = get_speaker_note(4)

    # =========================================================================
    # SLIDE 5: EMPLOYEE EXPERIENCE
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_background(s5, OFF_WHITE)
    add_header(s5, "Field Mobility", "For employees, submitting a claim becomes simple.")

    # Left text
    box = s5.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(6.0), Inches(4.8))
    tf = box.text_frame
    tf.word_wrap = True
    
    features = [
        ("Cross-Platform Flutter Native", "Fast, responsive mobile experience optimized for field reps and technicians on Android & iOS."),
        ("One-Tap Camera Capture", "Receipt scanner viewfinder with real-time framing and image stabilization."),
        ("Inline Extraction Review", "Instant preview card displaying extracted vendor, date, amount, and category for rapid verification."),
        ("Zero Cloud Jargon", "Employees see only their claim progress. All OCR, risk scoring, and cloud services remain invisible."),
        ("Live Status Tracking", "Instant push cards notify field staff the moment a claim is verified, reviewed, or approved.")
    ]
    for i, (title, desc) in enumerate(features):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f"{title}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = DARK_NAVY
        if i > 0: p.space_before = Pt(10)
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(2)

    # Right image
    img_path = "presentation/images/employee-mobile.jpg"
    if os.path.exists(img_path):
        s5.shapes.add_picture(img_path, Inches(7.2), Inches(1.8), width=Inches(5.3))

    add_footer(s5, 5)
    s5.notes_slide.notes_text_frame.text = get_speaker_note(5)

    # =========================================================================
    # SLIDE 6: MANAGER EXPERIENCE
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_background(s6, OFF_WHITE)
    add_header(s6, "Operations Cockpit", "Managers see the entire picture.")

    # Left image
    img_path = "presentation/images/manager-dashboard.jpg"
    if os.path.exists(img_path):
        s6.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), width=Inches(6.0))

    # Right text
    box = s6.shapes.add_textbox(Inches(7.1), Inches(1.8), Inches(5.4), Inches(4.8))
    tf = box.text_frame
    tf.word_wrap = True
    
    mgr_pts = [
        ("Split-Screen Verification View", "Original high-res receipt on the left; structured extracted values and tax identifiers on the right."),
        ("Prioritized Risk Triage", "Queue dynamically filtered by risk: Low (batch approve), Medium, High, or Critical."),
        ("Evidence-Backed Indicators", "Hoverable duplicate hash comparisons, historical spending baselines, and GSTIN check logs."),
        ("Explainable AI Summaries", "Claude 3.5 synthesis on AWS Bedrock summarizes key flags into two actionable sentences."),
        ("One-Click Actions with Audit", "Approve, Reject, or Request Clarification with mandatory compliance notes recorded in Supabase.")
    ]
    for i, (title, desc) in enumerate(mgr_pts):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = DARK_NAVY
        if i > 0: p.space_before = Pt(10)
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(2)

    add_footer(s6, 6)
    s6.notes_slide.notes_text_frame.text = get_speaker_note(6)

    # =========================================================================
    # SLIDE 7: OCR
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_background(s7, DARK_NAVY)
    add_header(s7, "Document Intelligence", "From image to structured information.", dark_mode=True)

    # Left image
    img_path = "presentation/images/ocr-extraction.jpg"
    if os.path.exists(img_path):
        s7.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), width=Inches(6.0))

    # Right explanation box
    box = s7.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.1), Inches(1.8), Inches(5.4), Inches(4.8))
    box.fill.solid()
    box.fill.fore_color.rgb = DARK_CARD
    box.line.color.rgb = SLATE
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.3)
    
    p = tf.paragraphs[0]
    p.text = "WHAT OCR DOES"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = PEACH
    
    p2 = tf.add_paragraph()
    p2.text = "AWS Textract AnalyzeExpense parses geometric bounding boxes, summary key-values, and line items. Extracts Merchant Name, Total Amount, Date, and 15-character Indian GSTIN with individual confidence scores."
    p2.font.size = Pt(11)
    p2.font.color.rgb = OFF_WHITE
    p2.space_before = Pt(6)
    
    p3 = tf.add_paragraph()
    p3.text = "THE FUNDAMENTAL PRINCIPLE"
    p3.font.size = Pt(13)
    p3.font.bold = True
    p3.font.color.rgb = ORANGE
    p3.space_before = Pt(16)
    
    p4 = tf.add_paragraph()
    p4.text = "OCR asks: 'What does this receipt say?'\nOCR does NOT ask: 'Is this receipt authentic?'\n\nA completely fake, fabricated invoice printed on paper will extract with 100% OCR confidence. That is why OCR is only step one."
    p4.font.size = Pt(11)
    p4.font.color.rgb = WHITE
    p4.space_before = Pt(6)

    add_footer(s7, 7, dark_mode=True)
    s7.notes_slide.notes_text_frame.text = get_speaker_note(7)

    # =========================================================================
    # SLIDE 8: VALIDATION + FRAUD SIGNALS
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_background(s8, OFF_WHITE)
    add_header(s8, "Deterministic Math Engine", "OCR is only the beginning: 6 verification signals.")

    signals = [
        ("Perceptual Duplicate Hash", "Hamming distance <= 5 flags exact or cropped duplicate receipts.", "+40 PTS", ACCENT_RED),
        ("Indian GSTIN Checksum", "Validates 15-char tax ID against state codes & ISO 7064 Modulo 36.", "+25 PTS", ACCENT_AMBER),
        ("Historical Amount Anomaly", "Flags expenses exceeding 2.0x employee's historical category average.", "+20 PTS", ACCENT_AMBER),
        ("Category Keyword Mismatch", "Detects dining, alcohol or personal purchases tagged as Fuel/Travel.", "+20 PTS", ACCENT_AMBER),
        ("Policy Cap Violation", "Enforces single-claim expenditure limits and tax invoice thresholds.", "+15 PTS", SLATE),
        ("Date & Timing Anomaly", "Flags backdated claims >90 days old or impossible future dates.", "+15 PTS", SLATE)
    ]

    left = 0.8
    top = 1.9
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
        p2.font.size = Pt(13)
        p2.font.bold = True
        p2.font.color.rgb = DARK_NAVY
        p2.space_before = Pt(4)
        
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(10)
        p3.font.color.rgb = SLATE
        p3.space_before = Pt(6)
        
        if i % 3 == 2:
            left = 0.8
            top += 2.4
        else:
            left += 4.0

    add_footer(s8, 8)
    s8.notes_slide.notes_text_frame.text = get_speaker_note(8)

    # =========================================================================
    # SLIDE 9: RISK ENGINE
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_background(s9, OFF_WHITE)
    add_header(s9, "Risk Engine", "Turn multiple signals into a decision-ready risk view.")

    # Left image
    img_path = "presentation/images/fraud-risk.jpg"
    if os.path.exists(img_path):
        s9.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), width=Inches(6.0))

    # Right: 5 qualified states
    box = s9.shapes.add_textbox(Inches(7.1), Inches(1.8), Inches(5.4), Inches(4.8))
    tf = box.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = "5 QUALIFIED AUTHENTICITY STATES"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ORANGE
    
    states = [
        ("VERIFIED", "Valid GSTIN, clear OCR (>90%), zero fraud signals. Score: 0-24.", ACCENT_GREEN),
        ("LIKELY VALID", "Minor warning, slight date deviation, valid math. Score: 0-24.", RGBColor(0x25, 0x63, 0xEB)),
        ("REVIEW REQUIRED", "Amount anomaly or policy limit breach needing sign-off. Score: 25-49.", ACCENT_AMBER),
        ("SUSPICIOUS", "Duplicate hash match or invalid tax checksum detected. Score: 50-74.", ACCENT_RED),
        ("UNABLE TO VERIFY", "Blurred image, unreadable merchant, low OCR (<70%). Requires retake.", LIGHT_SLATE)
    ]
    for st, d, col in states:
        p = tf.add_paragraph()
        p.text = f"[{st}]"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = col
        p.space_before = Pt(8)
        
        p2 = tf.add_paragraph()
        p2.text = d
        p2.font.size = Pt(10)
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

    # Left: AI Can Do
    box1 = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.5))
    box1.fill.solid()
    box1.fill.fore_color.rgb = DARK_CARD
    box1.line.color.rgb = ACCENT_GREEN
    box1.line.width = Pt(1.5)
    tf1 = box1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = tf1.margin_top = Inches(0.3)
    p = tf1.paragraphs[0]
    p.text = "WHAT AI CAN DO (EXPLANATION LAYER)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    
    can_items = [
        "Synthesizes triggered fraud flags into plain-English summaries",
        "Translates mathematical ratios into actionable manager tips",
        "Assists receipt taxonomy classification when fuzzy",
        "Provides contextual explanations to speed up human reviews"
    ]
    for it in can_items:
        p = tf1.add_paragraph()
        p.text = f"+  {it}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = OFF_WHITE
        p.space_before = Pt(14)

    # Right: AI Does NOT Do
    box2 = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.8), Inches(2.0), Inches(5.7), Inches(4.5))
    box2.fill.solid()
    box2.fill.fore_color.rgb = DARK_CARD
    box2.line.color.rgb = ACCENT_RED
    box2.line.width = Pt(1.5)
    tf2 = box2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = tf2.margin_top = Inches(0.3)
    p = tf2.paragraphs[0]
    p.text = "WHAT AI DOES NOT DO (STRICT CONTROLS)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_RED
    
    not_items = [
        "Never independently approves or rejects financial claims",
        "Never overrides company security policies or spending limits",
        "Cannot mutate or delete audit log entries in the database",
        "Cannot grant organization membership or session credentials"
    ]
    for it in not_items:
        p = tf2.add_paragraph()
        p.text = f"-  {it}"
        p.font.size = Pt(11.5)
        p.font.color.rgb = OFF_WHITE
        p.space_before = Pt(14)

    add_footer(s10, 10, dark_mode=True)
    s10.notes_slide.notes_text_frame.text = get_speaker_note(10)

    # =========================================================================
    # SLIDE 11: SYSTEM ARCHITECTURE
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_background(s11, OFF_WHITE)
    add_header(s11, "Multi-Tier Platform", "Built as a connected, scalable platform.")

    tiers = [
        ("1. CLIENT SURFACES", "Flutter Mobile App (Field Staff)  |  Next.js 15 Web Portal (Finance Managers)", ORANGE),
        ("2. SECURE API GATEWAY", "Fastify REST API  |  JWT Authentication  |  Organization Multi-Tenancy", DARK_NAVY),
        ("3. CORE DOMAIN SERVICES", "Claim Lifecycle  |  Receipt Ingestion  |  Deterministic Fraud Rules  |  Risk Scorer", SLATE),
        ("4. DATA & SERVERLESS CLOUD", "Supabase PostgreSQL (RLS, Audit)  |  AWS S3, Textract, Step Functions, Bedrock", ORANGE)
    ]
    
    top = 2.0
    for title, desc, col in tiers:
        bar = s11.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(top), Inches(11.7), Inches(1.0))
        bar.fill.solid()
        bar.fill.fore_color.rgb = WHITE
        bar.line.color.rgb = BORDER_GRAY
        bar.line.width = Pt(1.5)
        tf = bar.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = Inches(0.2)
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(12)
        p2.font.color.rgb = DARK_NAVY
        p2.space_before = Pt(3)
        top += 1.2

    add_footer(s11, 11)
    s11.notes_slide.notes_text_frame.text = get_speaker_note(11)

    # =========================================================================
    # SLIDE 12: COMPLETE DATA PIPELINE (15 STEPS)
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_background(s12, DARK_NAVY)
    add_header(s12, "Receipt Lifecycle", "Follow one receipt through the system (15 Steps).", dark_mode=True)

    steps_12 = [
        "1. Employee snaps receipt in Flutter app",
        "2. Encrypted image uploaded to Fastify API",
        "3. Pending claim record initialized in DB",
        "4. Image stored in S3 (KMS encryption)",
        "5. EventBridge triggers AWS Textract OCR",
        "6. Textract extracts key-values & lines",
        "7. Normalizer standardizes date, amount, GSTIN",
        "8. Deterministic validation checks math/caps",
        "9. Fraud engine checks duplicate hashes",
        "10. Risk engine calculates 0-100 score",
        "11. AWS Bedrock synthesizes risk narrative",
        "12. All records sync to Supabase with RLS",
        "13. Manager receives claim in operations queue",
        "14. Manager approves/rejects with audit note",
        "15. Employee receives instant phone status sync"
    ]
    
    # 3 columns of 5 steps
    col1 = steps_12[:5]
    col2 = steps_12[5:10]
    col3 = steps_12[10:]
    
    left = 0.8
    for col in [col1, col2, col3]:
        c = s12.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left), Inches(2.0), Inches(3.7), Inches(4.5))
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
    # SLIDE 13: ORGANIZATION + JOIN CODE
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_background(s13, OFF_WHITE)
    add_header(s13, "Controlled Onboarding", "Simple onboarding. Controlled access.")

    # Left image
    img_path = "presentation/images/onboarding-pairing.jpg"
    if os.path.exists(img_path):
        s13.shapes.add_picture(img_path, Inches(0.8), Inches(1.8), width=Inches(6.0))

    # Right text
    box = s13.shapes.add_textbox(Inches(7.1), Inches(1.8), Inches(5.4), Inches(4.8))
    tf = box.text_frame
    tf.word_wrap = True
    
    pairing_pts = [
        ("Manager Creates Workspace", "Manager provisions organization with spending policies and branch parameters in the web portal."),
        ("Generates 6-Character Join Code", "Temporary alpha-numeric code (e.g. 'CG-7842') generated with short TTL and role assignment."),
        ("Employee Pairs Device Instantly", "Field staff enter the code in the mobile app. Device is cryptographically bound to the company."),
        ("No Social Login Lock-In", "No Google accounts, corporate emails, or complex passwords required for drivers and field crew."),
        ("Secure Session JWT Tokens", "Backend validates code, creates membership, and issues scoped access tokens stored in device keychain.")
    ]
    for i, (title, desc) in enumerate(pairing_pts):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = DARK_NAVY
        if i > 0: p.space_before = Pt(10)
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10.5)
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
        ("LESS MANUAL VERIFICATION", "Automated OCR, math checks & GSTIN validation free managers from tedious receipt auditing."),
        ("FASTER REVIEW CYCLES", "Field staff receive reimbursement decisions in days or hours instead of weeks, boosting morale."),
        ("EARLIER SUSPICIOUS SIGNALS", "Duplicate hashes, historical spending spikes & fake tax IDs flagged before payouts are disbursed."),
        ("CENTRALIZED VISIBILITY", "Unified audit trail and real-time dashboard provide complete oversight across all regional branches.")
    ]

    left = 0.8
    top = 2.0
    for i, (title, desc) in enumerate(outcomes):
        c = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(5.7), Inches(2.2))
        c.fill.solid()
        c.fill.fore_color.rgb = WHITE
        c.line.color.rgb = BORDER_GRAY
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.3)
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = ORANGE
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = SLATE
        p2.space_before = Pt(8)
        
        if i % 2 == 1:
            left = 0.8
            top += 2.4
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
        ("PHASE 1 (CURRENT)", "Core receipt verification, OCR extraction, deterministic fraud rules & manager dashboard.", ACCENT_GREEN),
        ("PHASE 2 (NEXT)", "Advanced risk intelligence with 90-day rolling behavioral baselines and peer group clustering.", PEACH),
        ("PHASE 3 (ANALYTICS)", "Organization-wide benchmark heatmaps, category leak analysis, and tax audit export.", PEACH),
        ("PHASE 4 (MESSAGING)", "Conversational WhatsApp receipt submission channel [FUTURE INTEGRATION].", LIGHT_SLATE),
        ("PHASE 5 (ERP CONNECTORS)", "Direct two-way accounting sync into SAP, Tally, and Zoho Books [FUTURE INTEGRATION].", LIGHT_SLATE)
    ]
    
    left = 0.8
    for phase, desc, col in roadmap:
        c = s15.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left), Inches(2.1), Inches(2.25), Inches(4.3))
        c.fill.solid()
        c.fill.fore_color.rgb = DARK_CARD
        c.line.color.rgb = col
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = Inches(0.2)
        
        p = tf.paragraphs[0]
        p.text = phase
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = OFF_WHITE
        p2.space_before = Pt(8)
        
        left += 2.4

    add_footer(s15, 15, dark_mode=True)
    s15.notes_slide.notes_text_frame.text = get_speaker_note(15)

    # Save presentation
    output_path = "ClaimGuard_Product_Pitch.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to {output_path}")

if __name__ == "__main__":
    create_presentation()
