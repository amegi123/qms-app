# Waterfit eQMS 2026 – SRS coverage report

Source: `Waterfit_eQMS_2026_Development_SRS.pdf` (SRS-WF-QMS-2026-v1.0). Status key: ✅ built and tested · 🟡 built in a reduced form · ❌ not built.

## Roles (§2.1) – all 15 personas present

| Role | Status | Notes |
|---|---|---|
| GM, QMR, Factory Manager, Production Supervisor, Maintenance, QA/QC, Store, Procurement, Sales, HR, Finance, Internal Auditor | ✅ | 14 roles; each workflow step is limited to the roles in the procedure. |
| Machine Operator / Assistant; Compounding & Mixing Operator | ✅ | Both roles and demo users exist (Users & Settings shows all 15 SRS personas with their access tier and duties). |
| External Auditor (read-only, time-bound) | ✅ | Demo user with 30-day expiry; all writes blocked server-side. |

## Module 1 – Document & Record Control
| Requirement | Status |
|---|---|
| Master list, change-request workflow, release notes, acknowledgements | ✅ |
| Controlled / obsolete watermarks (“CONTROLLED ELECTRONIC COPY”, “OBSOLETE - RETAINED FOR HISTORICAL REFERENCE”), superseded issues archived | ✅ |
| Incoming & outgoing correspondence register | ✅ new |
| Retention engine: production/test logs 5 yrs, audit records 7 yrs | ✅ new – auto-sets “retain until”. Conflicts with OP/WF/002 (3–10 yrs); both kept. |
| Disposal approval | ✅ |

## Module 2 – Audits, CAPA, NCR
| Requirement | Status |
|---|---|
| Annual audit planner; auditor independence enforced | ✅ new rule |
| Audit checklist (OF/WF/020) + evidence attachments | 🟡 clause-level checklist (7 ISO sections), not the full question list |
| NCR classification Major / Minor / OFI | ✅ new |
| Disposition (rework, crush, scrap…) | ✅ |
| 5-Why and Ishikawa fishbone | ✅ new (5 text fields + 6 categories; no drawn diagram) |
| CAPA owner, due date, overdue alerts, QMR verification | ✅ |
| Automated escalation of overdue CAPA | ✅ GM / MR / Factory Manager are notified when a CAPA is more than 7 days overdue |
| Quarantine / quality hold blocking dispatch | ✅ new – failed lab test holds the batch; dispatch blocked |

## Module 3 – Leadership, Risk, Management Review
| Requirement | Status |
|---|---|
| Management review inputs pack | ✅ (Reports page checklist) |
| Quality objectives & KPI dashboard | ✅ with SRS targets (scrap < 2.5 %, OTD > 95 %, CSAT > 90 %) |
| Risk & opportunity register, L × S matrix | ✅ new |
| Meeting notices, minutes, digital attendance log | ✅ |
| Internal memo system | ✅ new (draft → approve → issue to departments) |

## Module 4 – Production
| Requirement | Status |
|---|---|
| Production orders, line allocation (Jwell / SWC / drip) | ✅ new |
| Recipe rules: resin grade, carbon black 2.0–2.5 %, regrind limit | ✅ new – regrind limit is **0 % for pressure pipes, 10 % for other products** (my assumption – the SRS gives no number; change in Settings) |
| Shift log with barrel zones 170–210 °C, melt, haul-off, vacuum | ✅ new – out-of-range flagged |
| Scrap & recycling sub-module: crusher runs, regrind bin balance | ✅ new |
| Finished-goods transfer notes with production + store co-signatures | ✅ new (both e-signed) |

## Module 5 – QA, Lab, Calibration
| Requirement | Status |
|---|---|
| Batch number engine WF-[TYPE]-[OD]-PN-[DATE]-[SHIFT]-[SEQ] | ✅ new – assigned when production starts; generator in Tools |
| Dimensional inspection (4-point wall, ovality) | 🟡 inspection record with test checklist; no 4-point measurement grid |
| Ash (2.0–2.5 %), Impact (TIR ≤ 10 %), Shrinkage (≤ 3.0 %), Hydrostatic pass/fail | ✅ new – auto verdict; fail → hold + Major NCR |
| Certificate of Analysis with verification | 🟡 printable CoA with e-signature and public verify page; **no QR image**, no tamper-proof PDF |
| Calibration register with due-date alerts | ✅ · automatic *lockout* of overdue instruments 🟡 (flagged, not enforced elsewhere) |

## Module 6 – Maintenance
| Requirement | Status |
|---|---|
| Machine registry | ✅ new |
| Machine history sheet | 🟡 history = maintenance work orders per machine |
| PM and breakdown work orders | ✅ |
| Automatic PM scheduler (daily / weekly / monthly / quarterly) | ✅ new – “Generate due work orders” creates the work orders and rolls the next due date |
| MTBF, MTTR | ✅ (approximate, from logged breakdowns) |
| OEE | 🟡 new – availability × quality from shift logs; the performance (speed) factor is not captured |

## Module 7 – Procurement & Inventory
| Requirement | Status |
|---|---|
| Supplier list, weighted evaluation Q40/D30/P15/S15, underperformer flag | ✅ new |
| Purchasing lifecycle with value-based method | ✅ new – Birr 50,001–100,000 band is not defined in OP/WF/027 and is flagged |
| Inventory, min/max, reorder alerts | ✅ new |
| Gate pass | ✅ new |

## Module 8 – Sales & Customers
| Requirement | Status |
|---|---|
| Proforma, contract review, dispatch note with batch + certificate | ✅ new |
| Complaints with priority and 72 h SLA | ✅ new |
| Complaint ↔ batch / lab sample link | 🟡 batch field only |
| Satisfaction surveys | ✅ (entered by staff; no customer-facing online survey) |

## Module 9 – HR & HSE
| Requirement | Status |
|---|---|
| Employee records, competency matrix with gap analysis | ✅ new (5 skills) |
| Training lifecycle | ✅ (effectiveness at 3–6 months per OP/WF/011; SRS says 30/90 days) |
| Performance appraisal engine (12 criteria, grade A–E) | ✅ new |
| HSE incidents, PPE issuance log, factory safety audits | ✅ new |

## Module 10 – Finance
| Requirement | Status |
|---|---|
| Landed-cost calculator | ✅ new (Tools) |
| Selling-price calculator | ✅ new (Tools) |
| Fixed-asset register with straight-line depreciation | ✅ new |
| Payment / petty cash / per diem workflows | ✅ new (> Birr 10,000 needs GM) |

## Non-functional (§4)
| Requirement | Status |
|---|---|
| Audit trail: user, timestamp, IP, old → new values | 🟡 user, time, IP and old → new on edits; **not tamper-proof / not immutable**; document downloads not logged |
| E-signatures with password re-verification (CoA, document approval, disposal, payment) | 🟡 works, but demo password `wf2026` for everyone – not cryptographic |
| MFA for management | 🟡 one-time code on GM / MR sign-in (demo code `246810`); login is not enforced on later requests |
| Rate limiting | ✅ basic, in memory |
| Offline mode for tablets | 🟡 installable app + offline shell; shift logs, lab tests, inspections queue offline and sync. Other forms need Wi-Fi |
| Backups (daily, weekly full, RPO ≤ 2 h, RTO ≤ 4 h) | 🟡 daily copy kept 14 days + manual download. No weekly encrypted backup, RPO / RTO not met |
| Response time < 500 ms | ✅ in testing (small data set) |
| Bilingual English / Amharic | 🟡 menus and module titles only; machine-drafted, needs a native-speaker review; forms and procedures not translated |
| Mobile-first UI | 🟡 mobile menu and responsive layout; not tested on real tablets |

## Roadmap (§5)
Phase 1 in progress – all 10 modules and all sub-features are present (33 workflow modules); about 190 individual paper formats are still not reproduced as electronic form layouts · Phase 2 barcode / QR scanning ❌ · Phase 3 PLC integration ❌ · Phase 4 verification page 🟡 · Phase 5 AI ❌.

## Things the SRS conflicts with in the company’s own procedures
- Retention: SRS 5 / 7 years vs OP/WF/002 3–10 years.
- Training effectiveness: SRS 30/90 days vs OP/WF/011 3–6 months.
- Customer satisfaction target 90 % (SRS) – earlier proposal was 80 %.
- SRS says 6 audited departments and 37 departmental procedures; the documents contain 7 departments and 31 departmental procedures.
- Factory site “Kality” appears only in the SRS, not in the Quality Manual.

## Section 3 – the 10 modules in the menu
The sidebar is organised exactly as SRS §3: 1 Document & Record Control · 2 Audits, CAPA & NCR · 3 Leadership, Risk & Review · 4 Production & Recycling · 5 QA, Laboratory & Calibration · 6 Plant Maintenance · 7 Procurement & Inventory · 8 Sales & Customers · 9 HR, Competency & HSE · 10 Finance & Costing.
