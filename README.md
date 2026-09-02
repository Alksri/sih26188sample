# Aegis® // SIH26188 — AI-Based Fake Identity & Document Screening System

A military-grade, cloud-powered document intelligence and biometric verification platform developed for the **Ministry of Home Affairs // SIH26188 Protocol**.

---

## 🚀 One-Click Vercel Deployment

This project is pre-configured for **Vercel** with zero setup required:
1. Push to GitHub (already linked to `https://github.com/Alksri/sih26188sample.git`).
2. Import the repository into [Vercel](https://vercel.com).
3. Vercel will auto-detect **Vite**, run `npm run build`, and serve the app with the included `vercel.json` SPA routing and edge caching rules.

---

## 🛡️ Core Verification Workflow (Modules 1 - 7)

```
Document / Camera Ingestion
        ↓
Image Preprocessing & Normalization
        ↓
Module 1: OCR & Information Extraction (10 Structured Fields)
        ↓
Module 2: Document Standards Validation (ICAO Doc 9303 & Modulo-7)
        ↓
Module 3: AI Deep Tampering Forensics (ELA, UV 365nm, IR Reflectance, Kerning)
        ↓
Module 4: 1:1 Biometric Face Verification (68-Point Mesh & 3D Anti-Spoof)
        ↓
Module 5: Bayesian Multi-Signal Risk Assessment Engine
        ↓
Module 6: Border Officer Review & Case Disposition
        ↓
Module 7: Immutable Digital Audit Trail (SHA-256 Ledger & JSON Dossier)
```

---

## ⚡ Key Highlights
- **Sub-Second Throughput**: Screening latency reduced from ~5 minutes to **4.8 seconds**.
- **Right-Side Interactive Recon Video**: Unblurred 4K surveillance monitor with touch and mouse scrubbing.
- **Explainable AI (XAI)**: Natural language rationale and bounding boxes detailing *why* an anomaly was flagged.
- **SIH Hackathon Demo Presets**:
  - **Demo 1**: Genuine Diplomatic Visa (Pass, Low Risk 9%).
  - **Demo 2**: Tampered Document (Photo Replacement 82%, Font Inconsistency, Modulo-7 Failure).
  - **Demo 3**: Identity Imposter (Valid Document, Face Match Divergence 41.2%).
- **Mobile First**: 100% responsive on phones and tablets with slide-down navigation drawer and mobile card layouts.
- **Dual Themes**: Institutional Ivory paper aesthetic and Cyber Dark glassmorphic mode.

---

## 🛠️ Tech Stack
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Tailored Design System)
- **Icons**: Lucide React
- **AI Core**: Google Gemini 2.5 Flash Cloud API (`gemini-2.5-flash`) + Offline Pre-calibrated Demo Engine
- **Routing & Edge**: Vercel SPA rewrites & byte-range streaming (`vercel.json`)

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run production build
npm run build

# Preview production bundle
npm run preview
```
