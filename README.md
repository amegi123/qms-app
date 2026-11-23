# Water Fit QMS – Internal Quality Management System (demo)

A web-based quality management system for **Water Fit General Trading (WF)**, built on the company's own ISO 9001:2015 documentation (MN/WF/001, PO/WF/001 and procedures OP/WF/001–046).

## Run

```bash
cd qms-app
npm install        # first time only
npm start          # → http://localhost:3000
```

Pick a demo user on the sign-in screen. Each role sees different permissions: GM, MR, Department Head, QA, Auditor, Staff.

`npm run seed` re-imports the documents and resets the demo data. The source folder defaults to `~/Downloads/QMS 2026`; override it with `QMS_ROOT=/path npm run seed`.

## What is inside

| Area | Based on | Highlights |
|---|---|---|
| Document Control | OP/WF/001, OF/WF/001–004 | 150 real documents imported with codes, issues and owners. Inline reading view, issue history, change request → draft → review → GM approval → issue, distribution and receipt acknowledgement, review-cycle alerts, full-text search |
| Records Register | OP/WF/002, OF/WF/012–013 | WF file code (DEPT/DRCC/SERIAL/YEAR), retention, legal hold, disposal approval |
| Inspection & Testing | OP/WF/040, OF/WF/063 | Test checklist per batch, release or reject, raise NCR |
| Non-Conforming Product | OP/WF/005 | Register → evaluate → rework / concession / discard → verify → close |
| Corrective Actions | OP/WF/004 | Root cause, action plan, effectiveness check, reopen if not cleared |
| Calibration | OP/WF/041, OF/WF/047–049 | Instrument register, interval-based due dates, quarantine |
| Maintenance | OP/WF/038–039, OF/WF/067 | Breakdown and PM work orders for DOLCI / JWELL / NOVAMEC lines, downtime |
| Complaints | OP/WF/031, OF/WF/034 | Classify (NCP / delivery / service), CPA, inform customer |
| Customer Satisfaction | OP/WF/032, OF/WF/0152 | 7-aspect survey (Poor → Very good), segment analysis |
| Supplier Evaluation | OP/WF/027–028 | Score on the 7 procedure criteria, approve / suspend |
| Internal Audits | OP/WF/003, OF/WF/014–016 | Annual programme calendar, coverage check, findings → CAPA |
| Management Review | OP/WF/006–007 | ISO 9.3.2 input checklist, minutes, actions |
| Training | OP/WF/011 | Plan, attendance, trainee and 3–6-month effectiveness evaluation |
| Company & Context | MN/WF/001, OF/WF/030/039/040 | Policy, org chart, context, interested parties, process map, clause matrix, QMS health check |
| Reports | ISO 9.1 | Live management-review inputs, trends, CSV exports, print to PDF |

All views also offer ⌘K global search, notifications, My Work, table / board / calendar views, comments, attachments, linked records, an audit trail, and dark mode.

## Architecture

- `server.js`: Express API. It enforces workflow and role permissions server-side and stores data in `data/db.json`.
- `lib/modules.js`: one definition per module (fields, states, transitions, roles). The UI is generated from it.
- `seed.js`: imports the QMS folder, converts Word files to HTML and text (macOS `textutil`), and builds the full-text index.
- `public/`: framework-free ES-module front end with no build step.

For production, swap the JSON store for PostgreSQL / MySQL and the demo sign-in for company accounts. The API surface stays the same, so the same design can be ported to PHP / Laravel if required.

**Demo data note:** names of the GM, MR, auditors and department contacts come from the QMS documents. Users marked "demo", plus the NCR, CAPA, audit and other operational records, are illustrative sample data.

## Putting this on GitHub

Push **only this `qms-app` folder** – not the parent folder, which holds the company's Word documents (hundreds of MB) and would hit GitHub's size limits.

```bash
cd qms-app
git init
git add .
git commit -m "Water Fit eQMS"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

- `node_modules/`, uploads, backups and OS files are excluded by `.gitignore`.
- `data/db.json`, `data/fulltext.json` and `data/previews/` (≈5 MB) are generated from the QMS documents so the demo works without them. They contain company content – **make the repository private**, or uncomment those lines in `.gitignore` to publish code only (the app then needs `QMS_ROOT=/path/to/QMS npm run seed`).
- A new clone runs with `npm install && npm start`. Word-to-HTML conversion in `seed.js` uses macOS `textutil`; on other systems the stored previews are used instead.
- Hosting: `vercel.json` / `api/index.js` run the app as a serverless function. The host's disk is read-only, so changes made in the demo are kept in memory only and reset on restart.
