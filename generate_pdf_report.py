import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_header_footer(self, page_count):
        self.saveState()
        
        # Don't draw header/footer on page 1 (cover)
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0D293F"))
            self.drawString(40, 810, "WATERFIT OS | SMART MANUFACTURING & ENTERPRISE MANAGEMENT SYSTEM")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(555, 810, "TECHNICAL HANDOFF & GAP ANALYSIS")
            
            self.setStrokeColor(colors.HexColor("#DFE8F0"))
            self.setLineWidth(0.75)
            self.line(40, 802, 555, 802)
            
            # Footer
            self.line(40, 42, 555, 42)
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(40, 30, "CONFIDENTIAL - HAMER AI / WATERFIT PLASTIC PRODUCTS INDUSTRY PLC - NOVEMBER 2026")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(555, 30, page_text)
            
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#146BC2")      # Industrial Blue
    c_navy = colors.HexColor("#0D293F")         # Deep Navy
    c_dark = colors.HexColor("#172B3A")         # Ink Text
    c_bg = colors.HexColor("#F4F7FA")           # Soft Grey
    c_border = colors.HexColor("#DFE8F0")       # Border Grey
    c_success = colors.HexColor("#16856D")      # Forest Green
    c_warning = colors.HexColor("#D97706")      # Amber
    c_danger = colors.HexColor("#DC2626")       # Red Alert
    
    # Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_navy
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_primary
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569")
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=c_navy,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark,
        spaceAfter=5
    )
    
    body_bold = ParagraphStyle(
        'BodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=c_dark
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=c_navy
    )

    tbl_header = ParagraphStyle(
        'TblHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    tbl_cell = ParagraphStyle(
        'TblCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=c_dark
    )
    
    tbl_cell_bold = ParagraphStyle(
        'TblCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=c_dark
    )

    tag_ok = ParagraphStyle(
        'TagOK',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=c_success
    )

    tag_partial = ParagraphStyle(
        'TagPartial',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=c_warning
    )

    tag_missing = ParagraphStyle(
        'TagMissing',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=c_danger
    )

    story = []

    # -------------------------------------------------------------
    # COVER / HEADER BANNER
    # -------------------------------------------------------------
    banner_data = [
        [
            Paragraph("<b>WATERFIT OS</b>", ParagraphStyle('B1', fontName='Helvetica-Bold', fontSize=26, leading=30, textColor=colors.white)),
            Paragraph("<b>CONFIDENTIAL HANDOFF</b><br/>Version 1.0 | November 2026", ParagraphStyle('B2', fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor("#DFE8F0"), alignment=2))
        ],
        [
            Paragraph("Unified Smart Manufacturing & Enterprise Management Platform<br/><i>System Audit, Gap Matrix & Development Architecture Roadmap</i>", ParagraphStyle('B3', fontName='Helvetica-Oblique', fontSize=10.5, leading=14, textColor=colors.HexColor("#93C5FD"))),
            Paragraph("<b>Target:</b> Aman & Core Dev Team<br/><b>Client:</b> Waterfit Plastic Products Industry PLC", ParagraphStyle('B4', fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=colors.white, alignment=2))
        ]
    ]
    t_banner = Table(banner_data, colWidths=[330, 185])
    t_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_navy),
        ('PADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,1), (-1,1), 12),
    ]))
    story.append(t_banner)
    story.append(Spacer(1, 14))

    # Executive Summary Card
    exec_summary_text = (
        "<b>EXECUTIVE MANDATE & CORE PRINCIPLE:</b><br/>"
        "Per executive direction from HAMER AI, the existing <b>Waterfit eQMS 2026</b> application is <b>not</b> to be discarded "
        "or rewritten from scratch. Instead, it must be upgraded in place into <b>WATERFIT OS</b> (Smart Manufacturing & "
        "Enterprise Management System). The industrial eQMS workspace remains the bedrock of quality, auditability, and ISO 9001 compliance, "
        "while expanding upwards into an executive Business OS (CEO Command Center, CRM Pipeline, Unified Inventory & Warehousing, "
        "Procurement with Multi-Stage Approvals, Landed Cost Finance, and Grounded Decision Intelligence)."
    )
    t_exec = Table([[Paragraph(exec_summary_text, callout_style)]], colWidths=[515])
    t_exec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg),
        ('BOX', (0,0), (-1,-1), 1, c_primary),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_exec)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 1: ARCHITECTURAL PRINCIPLES & AUDIT
    # -------------------------------------------------------------
    story.append(Paragraph("1. System Audit: Existing Codebase & Telegram Source Documents", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=2, spaceAfter=8))
    
    sec1_text = (
        "A rigorous deep-dive audit of the local development repository (<code>qms-app</code>) and the Waterfit document "
        "transfers in Telegram Desktop (<code>QMS 2026/QMS DOCUMENTS</code> and <code>QMS TEMPLATES</code>) yields clear visibility "
        "into the current baseline versus the target WATERFIT OS specification."
    )
    story.append(Paragraph(sec1_text, body_style))

    # Codebase Audit Table
    codebase_audit_data = [
        [Paragraph("Repository Layer", tbl_header), Paragraph("Current Implementation Status", tbl_header), Paragraph("Evaluation & Upgrade Requirement", tbl_header)],
        [
            Paragraph("<b>Backend & Data Store</b><br/>Node.js / Express<br/><code>data/db.json</code> (384 KB)", tbl_cell),
            Paragraph("<font color='#16856D'><b>Operational (Working)</b></font><br/>39 distinct collections. Persistent JSON file with automatic backups. In-memory rate limiting and session handlers.", tbl_cell),
            Paragraph("<b>Needs Refactor:</b> File-based JSON cannot guarantee ACID transactional boundaries across multi-step transactions (e.g., dispatch cannot consume quarantined stock; concurrent inventory deductions). Must implement transactional locks or migrate to SQLite / PostgreSQL.", tbl_cell)
        ],
        [
            Paragraph("<b>Frontend Architecture</b><br/>Vanilla JS Modules<br/><code>public/js/pages/</code>", tbl_cell),
            Paragraph("<font color='#D97706'><b>Partial / Functional</b></font><br/>Single Page App shell with dynamic hash routing, modal forms, SVG charts, and bilingual Amharic dictionary.", tbl_cell),
            Paragraph("<b>Needs Upgrade:</b> Currently uses dense, basic tables and fragmented scripts. Must align to the designated White-first Industrial SaaS UI token set (#146BC2 industrial blue, #0D293F navy, #F4F7FA surface) with responsive tablet/desktop layouts.", tbl_cell)
        ],
        [
            Paragraph("<b>Role & Persona Engine</b><br/><code>users</code> & <code>org</code><br/>15 SRS Personas", tbl_cell),
            Paragraph("<font color='#16856D'><b>Complete Baseline</b></font><br/>All 15 personas exist (GM, QMR, Factory Mgr, Operators, Storekeeper, Sales, Finance, Auditor).", tbl_cell),
            Paragraph("<b>Needs Strict Enforcement:</b> Frontend hides buttons, but backend endpoints must strictly enforce role-based access control (RBAC), prevent self-approval, and time-bound external auditor sessions.", tbl_cell)
        ],
        [
            Paragraph("<b>Original Waterfit Files</b><br/>Telegram QMS 2026<br/>42 SOPs, 190 Formats", tbl_cell),
            Paragraph("<font color='#16856D'><b>Rich Source Identified</b></font><br/>Quality Manual (MN-WF-001), OP-WF-001 to 042, and official operational templates (OF-WF-060 to 190) catalogued.", tbl_cell),
            Paragraph("<b>Action Required:</b> Formats like OF/WF/082 (Raw Material Request), OF/WF/080 (Issue), OF/WF/081 (Receipt), and OF/WF/079 (FG Transfer) must be digitized into interactive UI screens.", tbl_cell)
        ]
    ]
    t_codebase = Table(codebase_audit_data, colWidths=[120, 185, 210])
    t_codebase.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg]),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_codebase)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 2: MASTER GAP MATRIX ACROSS ALL 10 MODULES
    # -------------------------------------------------------------
    story.append(PageBreak())
    story.append(Paragraph("2. Master Gap Analysis: Existing vs. Missing vs. Needs Refactor", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=2, spaceAfter=8))
    
    gap_intro = (
        "The table below details the exact status of all 10 target workspaces outlined in Section 03 of the Handoff Brief. "
        "Status legend: <font color='#16856D'><b>[EXISTS]</b></font> = working in codebase; "
        "<font color='#D97706'><b>[PARTIAL]</b></font> = basic mock or reduced form; "
        "<font color='#DC2626'><b>[MISSING]</b></font> = needs new development."
    )
    story.append(Paragraph(gap_intro, body_style))
    story.append(Spacer(1, 6))

    gap_matrix_data = [
        [Paragraph("Workspace / Module", tbl_header), Paragraph("Components & Requirements", tbl_header), Paragraph("Current State", tbl_header), Paragraph("Action Plan for WATERFIT OS", tbl_header)],
        
        # 1. Overview
        [
            Paragraph("<b>1. Overview & CEO Command</b>", tbl_cell_bold),
            Paragraph("• CEO Command Center<br/>• Executive KPI Cards (ETB Sales, Scrap %, Receivables, Stock Risk)<br/>• Unified Action & Approval Center<br/>• Live Notification Feed", tbl_cell),
            Paragraph("<font color='#D97706'><b>PARTIAL</b></font><br/>Basic dashboard exists with static cards and mock scrap %.", tbl_cell),
            Paragraph("<b>Upgrade:</b> Connect real-time aggregations from sales, inventory, and production. Implement unified Action Center with click-to-approve consequences.", tbl_cell)
        ],
        
        # 2. Manufacturing
        [
            Paragraph("<b>2. Manufacturing & Extrusion</b>", tbl_cell_bold),
            Paragraph("• Work Orders & Scheduling<br/>• Extrusion Lines (Jwell, SWC, Drip)<br/>• Shift logs & Barrel Temp zones<br/>• Recipe Compounding & Regrind<br/>• OF/WF/079 FG Handover", tbl_cell),
            Paragraph("<font color='#16856D'><b>EXISTS</b></font><br/>Shift logs, recipes, scrap balance, and FG transfer note built.", tbl_cell),
            Paragraph("<b>Refactor:</b> Add order-driven scheduling (link sales order directly to work order). Enforce dual sign-off on FG transfer before stock reflects in warehouse.", tbl_cell)
        ],

        # 3. Warehousing & Inventory
        [
            Paragraph("<b>3. Warehousing & Batch Ledger</b>", tbl_cell_bold),
            Paragraph("• Split Ledgers: RM, FG, Spares<br/>• OF/WF/082 Material Request<br/>• OF/WF/080 Material Issue<br/>• OF/WF/081 Receiving Note<br/>• Quarantine Lock & Reversals", tbl_cell),
            Paragraph("<font color='#D97706'><b>PARTIAL</b></font><br/>Basic inventory table exists. Quarantine flag exists on lab failure.", tbl_cell),
            Paragraph("<b>Upgrade:</b> Prohibit negative stock. Separate RM, FG, and Spare Part ledgers. Enforce zero-dispatch policy on quarantined or unreleased batches.", tbl_cell)
        ],

        # 4. Procurement
        [
            Paragraph("<b>4. Procurement & Requisitions</b>", tbl_cell_bold),
            Paragraph("• OP/WF/027 Local & Foreign Flow<br/>• Purchase Requisitions & Approvals<br/>• RFQs & Bid Comparison<br/>• Supplier Directory & Scorecards<br/>• Foreign Banking & LC Tracking", tbl_cell),
            Paragraph("<font color='#D97706'><b>PARTIAL</b></font><br/>Supplier evaluation sheet and basic PO form present.", tbl_cell),
            Paragraph("<b>Upgrade:</b> Build side-by-side 3-quote Bid Comparison matrix. Add Foreign Purchasing branch with proforma selection, bank status, and landed-cost calculation.", tbl_cell)
        ],

        # 5. Sales & CRM
        [
            Paragraph("<b>5. Sales & CRM Pipeline</b>", tbl_cell_bold),
            Paragraph("• Lead Inquiries (TikTok, Web, Referral)<br/>• Customer Directory & Credit Tiers<br/>• Proforma Quotations<br/>• OP/WF/030 Order Branching<br/>• Dispatch Note & CSAT Surveys", tbl_cell),
            Paragraph("<font color='#D97706'><b>PARTIAL</b></font><br/>Sales orders and complaints register exist. No lead CRM.", tbl_cell),
            Paragraph("<b>Upgrade:</b> Build interactive CRM pipeline (Leads -> Quotes -> Orders). Implement OP/WF/030 stock-available vs. production-required decision routing.", tbl_cell)
        ],

        # 6. Finance & Costing
        [
            Paragraph("<b>6. Finance & Costing</b>", tbl_cell_bold),
            Paragraph("• Invoices & Receipts (ETB)<br/>• Accounts Receivable & Payables<br/>• Petty Cash & Per Diem Requests<br/>• Landed-Cost Calculator<br/>• Fixed Asset Depreciation (Straight Line)", tbl_cell),
            Paragraph("<font color='#16856D'><b>EXISTS</b></font><br/>Depreciation table, landed-cost tool, and payment approval present.", tbl_cell),
            Paragraph("<b>Refactor:</b> Consolidate payment requests into general ledger view. Connect sales invoices to receivables aging. Clearly label mock bank statements as demo.", tbl_cell)
        ],

        # 7. eQMS (Deep Core)
        [
            Paragraph("<b>7. Integrated eQMS</b>", tbl_cell_bold),
            Paragraph("• Master List of Documents (OP/WF/001)<br/>• Change Requests & Obsolete Marks<br/>• OF/WF/014 Annual Audit Planner<br/>• NCR & CAPA (5-Why, Ishikawa)<br/>• QA Lab (Ash, Tensile, Hydrostatic)", tbl_cell),
            Paragraph("<font color='#16856D'><b>EXISTS</b></font><br/>Highly functional. Watermarks, audit logs, CAPA escalation, and lab tests running.", tbl_cell),
            Paragraph("<b>Preserve & Deepen:</b> Keep all existing document codes and test parameters. Ensure lab test failures trigger automatic batch quarantine in the inventory ledger.", tbl_cell)
        ],

        # 8. Maintenance
        [
            Paragraph("<b>8. Maintenance & Assets</b>", tbl_cell_bold),
            Paragraph("• Machine Registry & History Sheets<br/>• PM Schedules (Daily/Weekly/Monthly)<br/>• Breakdown Tickets & Line Downtime<br/>• Spare Part Consumption<br/>• MTBF, MTTR, OEE Calculation", tbl_cell),
            Paragraph("<font color='#D97706'><b>PARTIAL</b></font><br/>PM schedule generator and breakdown tickets work. OEE is partial.", tbl_cell),
            Paragraph("<b>Upgrade:</b> Link breakdown tickets directly to extrusion line downtime alerts in the CEO and Factory Manager dashboards.", tbl_cell)
        ],

        # 9. HR & Factory HSE
        [
            Paragraph("<b>9. HR, Competencies & HSE</b>", tbl_cell_bold),
            Paragraph("• Staff Registry & Competencies<br/>• Training Lifecycle & Evaluations<br/>• Performance Appraisals (12 criteria)<br/>• HSE Incident Reporting & Audits<br/>• PPE Issuance Tracking", tbl_cell),
            Paragraph("<font color='#16856D'><b>EXISTS</b></font><br/>Employee competencies, appraisals, HSE incidents, and PPE logs exist.", tbl_cell),
            Paragraph("<b>Refactor:</b> Clean UI, connect HSE incident severity to CEO dashboard alerts, digitize factory safety inspection checklist.", tbl_cell)
        ],

        # 10. Intelligence & Admin
        [
            Paragraph("<b>10. Intelligence & Admin</b>", tbl_cell_bold),
            Paragraph("• Grounded AI Executive Advisor<br/>• Trend Analytics & Anomaly Detection<br/>• Master Report Center & CSV Export<br/>• User Management & RBAC<br/>• Immutable Audit Trail", tbl_cell),
            Paragraph("<font color='#DC2626'><b>MISSING</b></font><br/>Reports page exists; AI advisor and unified audit viewer are absent.", tbl_cell),
            Paragraph("<b>Develop:</b> Implement AI Advisor that parses real db records (ETB sales, scrap spikes, overdue CAPAs). Explicitly tag demo insights. Provide CSV/PDF exports.", tbl_cell)
        ]
    ]

    t_gap = Table(gap_matrix_data, colWidths=[90, 155, 95, 175])
    t_gap.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg]),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_gap)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 3: END-TO-END SCENARIO VALIDATION (A - E)
    # -------------------------------------------------------------
    story.append(PageBreak())
    story.append(Paragraph("3. End-to-End Operational Workflow Validation (Scenarios A - E)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=2, spaceAfter=8))
    
    sec3_text = (
        "The core acceptance criterion of WATERFIT OS is that business operations and factory records are united into single, "
        "coherent transaction chains. Below is the operational validation plan for the five required cross-departmental scenarios."
    )
    story.append(Paragraph(sec3_text, body_style))
    story.append(Spacer(1, 6))

    scenarios = [
        ("Scenario A: Customer Order Fulfilled from Stock",
         "Lead / Inquiry (TikTok / Web) -> Sales Quotation -> Confirmed Customer Order -> Reserve Available Finished Goods -> "
         "Finance Invoice Review -> Payment / Approved Credit -> Store Delivery Verification -> Dispatch Note -> Customer Receipt -> Update CEO Revenue & Stock KPIs.",
         "Verify that finished goods inventory is immediately marked 'Reserved' upon order confirmation and 'Dispatched' upon store delivery, preventing duplicate fulfillment."),
        
        ("Scenario B: Customer Order Requiring Production",
         "Confirmed Order -> Capacity & Delivery Check -> Approved Production Order -> Bill of Materials -> Store Material Issue (OF/WF/080) -> "
         "Extrusion Run & Hourly Shift Log -> QA Dimensional & Hydrostatic Test -> Finished Goods Handover (OF/WF/079) -> Released Stock -> Dispatch.",
         "Verify that goods completed on the factory floor cannot be dispatched until QA issues an electronic release certificate and the storekeeper signs the handover note."),

        ("Scenario C: Raw Material Shortage Triggers Procurement",
         "Low Resin / Carbon Black Alert or Approved Request (OF/WF/082) -> Purchase Requisition -> Local vs. Foreign Decision -> Budget Approval -> "
         "Supplier Quotations (3 Bids) -> Evaluation & PO Issuance -> Delivery Receipt (OF/WF/081) -> QA Inspection -> Stock Ledger & Landed Cost Update.",
         "Verify that the purchasing workflow transitions smoothly from requisition to goods receipt and updates the raw material stock ledger and weighted average unit cost."),

        ("Scenario D: Quality Failure, Quarantine & CAPA Escalation",
         "Hydrostatic Burst or Wall Thickness Failure -> Automated Batch Quarantine Flag -> Non-Conformance Report (NCR) -> 5-Why Investigation -> "
         "CAPA Plan Formulation -> QMR & GM Escalation -> Disposition Decision (Crush / Scrap / Rework) -> Scrap Ledger Update -> Retained Evidence.",
         "Verify that once a lab test is marked 'Failed', the system immediately blocks that batch number from being selected for dispatch across all sales orders."),

        ("Scenario E: Equipment Breakdown & Production Rescheduling",
         "Machine Breakdown (e.g. Jwell Line 2) -> Emergency Maintenance Ticket -> Line Downtime Flagged -> Technician Assignment -> Spare Part Issue -> "
         "Repair & Return-to-Service Verification -> Production Rescheduling -> Factory Manager & CEO Real-time Alert.",
         "Verify that active breakdown tickets update line availability on the production planning board and feed directly into OEE and MTTR metrics.")
    ]

    for title, flow, verification in scenarios:
        sc_data = [
            [Paragraph(f"<b>{title}</b>", ParagraphStyle('ScTitle', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=c_navy))],
            [Paragraph(f"<b>Workflow:</b> {flow}", tbl_cell)],
            [Paragraph(f"<b>Integrity Invariant:</b> <font color='#16856D'>{verification}</font>", tbl_cell)]
        ]
        t_sc = Table(sc_data, colWidths=[515])
        t_sc.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), c_bg),
            ('BOX', (0,0), (-1,-1), 1, c_border),
            ('LINEBELOW', (0,0), (-1,0), 1, c_primary),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t_sc)
        story.append(Spacer(1, 8))

    # -------------------------------------------------------------
    # SECTION 4: DATA INTEGRITY & ROLE PERMISSION GOVERNANCE
    # -------------------------------------------------------------
    story.append(PageBreak())
    story.append(Paragraph("4. Data Invariants & Role-Based Access Control (RBAC)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("<b>4.1 Non-Negotiable Data Invariants</b>", h2_style))
    invariants_text = (
        "1. <b>Zero Negative Stock:</b> No inventory movement (issue, transfer, dispatch) may drive stock quantities below zero.<br/>"
        "2. <b>Single Source of Truth:</b> Production orders, finished goods stock, and sales dispatch records reference the identical batch ID.<br/>"
        "3. <b>Quarantine Hard-Lock:</b> Quarantined lots (failed QA or pending inspection) cannot be selected for customer delivery notes.<br/>"
        "4. <b>Segregation of Duties:</b> No operator, storekeeper, or purchasing agent can approve their own requests or financial disbursements.<br/>"
        "5. <b>Traceable Ledger:</b> Stock adjustments require reason codes and authorizer signatures; deletions are strictly forbidden."
    )
    story.append(Paragraph(invariants_text, body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>4.2 15-Persona Permission Matrix</b>", h2_style))
    rbac_data = [
        [Paragraph("Role / Persona", tbl_header), Paragraph("Primary Workspace", tbl_header), Paragraph("Create / Edit Scope", tbl_header), Paragraph("Approval & Sign-Off Authority", tbl_header)],
        [
            Paragraph("<b>General Manager (CEO)</b>", tbl_cell_bold),
            Paragraph("CEO Command Center, Overview", tbl_cell),
            Paragraph("Enterprise Policies, Strategic Goals", tbl_cell),
            Paragraph("High-value POs (>100k ETB), CapEx, Obsolete doc disposal, Final CAPA sign-off", tbl_cell)
        ],
        [
            Paragraph("<b>Quality Mgr (QMR)</b>", tbl_cell_bold),
            Paragraph("eQMS, Audits, Lab, Doc Control", tbl_cell),
            Paragraph("Audit plans, SOPs, CAPA, Specs", tbl_cell),
            Paragraph("Controlled document releases, CAPA closure, QA release override", tbl_cell)
        ],
        [
            Paragraph("<b>Factory Manager</b>", tbl_cell_bold),
            Paragraph("Manufacturing, Lines, Maintenance", tbl_cell),
            Paragraph("Production plans, Line capacity", tbl_cell),
            Paragraph("Production orders, PM schedule release, Downtime sign-off", tbl_cell)
        ],
        [
            Paragraph("<b>Production Supervisor</b>", tbl_cell_bold),
            Paragraph("Extrusion Lines, Shift Logs", tbl_cell),
            Paragraph("Hourly run logs, Scrap balance", tbl_cell),
            Paragraph("Shift handovers, Material requests (OF/WF/082)", tbl_cell)
        ],
        [
            Paragraph("<b>QA/QC Lab Technician</b>", tbl_cell_bold),
            Paragraph("QA Lab, Calibration, Batches", tbl_cell),
            Paragraph("Dimensional, Ash, Hydrostatic logs", tbl_cell),
            Paragraph("Batch Pass/Fail verdict, Quarantine lock, CoA issuance", tbl_cell)
        ],
        [
            Paragraph("<b>Storekeeper</b>", tbl_cell_bold),
            Paragraph("Warehouses, Bin Ledgers, Issues", tbl_cell),
            Paragraph("Goods receiving (081), Issues (080)", tbl_cell),
            Paragraph("Physical stock confirmation, Dispatch release verification", tbl_cell)
        ],
        [
            Paragraph("<b>Procurement Officer</b>", tbl_cell_bold),
            Paragraph("Procurement, RFQs, POs", tbl_cell),
            Paragraph("Supplier records, Quotations, RFQs", tbl_cell),
            Paragraph("Requisition submission, Supplier scorecards (within threshold)", tbl_cell)
        ],
        [
            Paragraph("<b>Sales Officer</b>", tbl_cell_bold),
            Paragraph("Sales & CRM, Orders, Pipeline", tbl_cell),
            Paragraph("Leads, Quotations, Proformas", tbl_cell),
            Paragraph("Order booking (subject to finance credit & inventory check)", tbl_cell)
        ],
        [
            Paragraph("<b>Finance Officer</b>", tbl_cell_bold),
            Paragraph("Finance, Costing, Ledgers", tbl_cell),
            Paragraph("Invoices, Receipts, Asset register", tbl_cell),
            Paragraph("Credit limit approval, Payment disbursements, Expense verification", tbl_cell)
        ],
        [
            Paragraph("<b>External Auditor</b>", tbl_cell_bold),
            Paragraph("Read-Only Audit Portal", tbl_cell),
            Paragraph("None (Strictly read-only access)", tbl_cell),
            Paragraph("None (Time-bound 30-day session; tamper-proof log access)", tbl_cell)
        ]
    ]

    t_rbac = Table(rbac_data, colWidths=[105, 120, 140, 150])
    t_rbac.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg]),
        ('PADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(t_rbac)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # SECTION 5: QUESTIONS TO VALIDATE WITH WATERFIT & ROADMAP
    # -------------------------------------------------------------
    story.append(PageBreak())
    story.append(Paragraph("5. Stakeholder Validation & Implementation Roadmap", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("<b>5.1 Crucial Operational Decisions Needed from Waterfit Leadership</b>", h2_style))
    questions_intro = (
        "To avoid hardcoding arbitrary engineering limits or unauthorized corporate policies into WATERFIT OS, "
        "the following ten specific items must be formally validated with Waterfit stakeholders:"
    )
    story.append(Paragraph(questions_intro, body_style))
    
    q_items = [
        "<b>1. Document & Template Currency:</b> Which of the 42 SOPs and 190 formats in the Telegram archive are actively enforced vs. superseded?",
        "<b>2. Extrusion Standards & Limits:</b> Confirm barrel zone temperature thresholds (170-210 °C) and hydrostatic pressure test specs for HDPE/PPR/uPVC lines.",
        "<b>3. Regrind Allowance Policies:</b> Confirm whether 0% regrind is strictly enforced for pressure pipes and up to 10% for conduit/drainage pipes.",
        "<b>4. Financial Approval Thresholds:</b> Confirm delegated approval limits: e.g., Department Head up to 10,000 ETB, Factory Manager 50,000 ETB, CEO >100,000 ETB.",
        "<b>5. Customer Credit Policies:</b> Under what conditions can sales dispatch proceed before invoice payment receipt is recorded in ETB?",
        "<b>6. Foreign Procurement Milestones:</b> What exact banking, National Bank of Ethiopia (NBE) permit, and customs clearing milestones must be tracked?",
        "<b>7. Production Line Capacities:</b> Confirm exact output ratings (kg/hr, meters/hr) for Jwell Line 1, Jwell Line 2, SWC corrugated line, and Drip line.",
        "<b>8. Calibration Lockout Rules:</b> Should an expired calibration certificate automatically prevent a QA technician from entering test results?",
        "<b>9. Factory Network Connectivity:</b> Which floor stations (e.g. compounding, store) experience Wi-Fi dead zones and require offline-first PWA caching?",
        "<b>10. Legacy Data Migration:</b> What format are historical customers, suppliers, inventory stock balances, and equipment records currently stored in?"
    ]
    for q in q_items:
        story.append(Paragraph(f"• {q}", body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>5.2 Phased Delivery Roadmap & Acceptance Gates</b>", h2_style))
    gates_data = [
        [Paragraph("Gate", tbl_header), Paragraph("Focus & Core Deliverables", tbl_header), Paragraph("Key Acceptance Criteria", tbl_header)],
        [
            Paragraph("<b>Gate 0</b><br/>Assessment", tbl_cell_bold),
            Paragraph("Complete codebase audit, Git safe branch (<code>upgrade/waterfit-os</code>), database backup, gap analysis matrix.", tbl_cell),
            Paragraph("Zero data loss; existing eQMS tests pass; gap report approved by lead architect.", tbl_cell)
        ],
        [
            Paragraph("<b>Gate 1</b><br/>Rebrand & Shell", tbl_cell_bold),
            Paragraph("WATERFIT OS design system, unified sidebar navigation (10 workspaces), role switcher, responsive typography.", tbl_cell),
            Paragraph("Clean industrial aesthetic (#146BC2 / #0D293F); eQMS preserved as internal workspace.", tbl_cell)
        ],
        [
            Paragraph("<b>Gate 2</b><br/>Core Operations", tbl_cell_bold),
            Paragraph("End-to-end integration of CRM Leads -> Sales Orders -> Inventory Check -> Work Order Scheduling -> Dispatches.", tbl_cell),
            Paragraph("Scenarios A & B demonstrable end-to-end; no duplicate postings or negative stock.", tbl_cell)
        ],
        [
            Paragraph("<b>Gate 3</b><br/>eQMS Deepening", tbl_cell_bold),
            Paragraph("Full QA lab integration; automated batch quarantine upon test failure; digitized OF/WF/079, 080, 081, 082 forms.", tbl_cell),
            Paragraph("Scenario D demonstrable; quarantined stock cannot be dispatched under any condition.", tbl_cell)
        ],
        [
            Paragraph("<b>Gate 4</b><br/>Executive OS & AI", tbl_cell_bold),
            Paragraph("CEO Command Center, AR/AP financial reports, landed-cost calculator, grounded AI Executive Advisor, CSV/PDF export.", tbl_cell),
            Paragraph("AI Advisor references real system transactions; demo mode clearly labeled; real KPI cards.", tbl_cell)
        ],
        [
            Paragraph("<b>Gate 5</b><br/>Pilot & Rollout", tbl_cell_bold),
            Paragraph("User Acceptance Testing (UAT) with Waterfit team, offline floor sync verification, audit logs, deployment guide.", tbl_cell),
            Paragraph("Stakeholder sign-off; complete user documentation delivered; production cutover plan.", tbl_cell)
        ]
    ]

    t_gates = Table(gates_data, colWidths=[65, 230, 220])
    t_gates.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_navy),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_gates)
    story.append(Spacer(1, 14))

    # Sign-off card
    signoff_text = (
        "<b>REPORT COMPILATION & SUBMISSION NOTE:</b><br/>"
        "This comprehensive analysis document serves as the formal architectural blueprint and 'First Deliverable' "
        "stipulated in Section 12 of the HAMER AI Development Handoff. Development proceeds under Git branch "
        "<code>upgrade/waterfit-os</code> ensuring full backward compatibility and zero operational disruption."
    )
    t_sign = Table([[Paragraph(signoff_text, callout_style)]], colWidths=[515])
    t_sign.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg),
        ('BOX', (0,0), (-1,-1), 1, c_primary),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_sign)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == "__main__":
    out_pdf = sys.argv[1] if len(sys.argv) > 1 else "WATERFIT_OS_Analysis_and_Upgrade_Roadmap.pdf"
    build_pdf(out_pdf)
