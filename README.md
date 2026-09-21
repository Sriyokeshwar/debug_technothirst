# Technothirst’26 — Offline Python Debugging Championship

**A.V.C. College of Engineering (Autonomous)**  
*Department of Computer Applications (MCA) — Mannampandal, Mayiladuthurai*

A 100% offline, standalone client-side Python 3 Debugging Competition Platform built with pure modern web standards (**HTML5**, **CSS3**, and **Vanilla JavaScript**). Strictly zero dependencies, zero CDNs, zero frameworks, zero external fonts, and zero backend services required.

---

## 🚀 Key Highlights & Architecture

- **100% Offline Portability**: Works directly by double-clicking `index.html`. Can be copied to a pen drive and run on any Windows computer with any standard modern browser without installing Node.js, Python, npm, or web servers.
- **Light Futuristic Tech Theme**: Clean white and soft ice-blue palette, deep navy typography, electric cyan accents, subtle technical borders, and soft shadows matching the official Technothirst'26 branding.
- **Professional Coding Assessment Editor**:
  - Dark editor panel (`#0b1120`) with line numbers gutter (1 to N) aligned with code.
  - Python syntax-like color treatment (keywords, strings, numbers, built-in functions, comments).
  - One-click **[ Copy Code ]** with clipboard API and execCommand fallback.
  - Reset editor view scroll control.
- **Deterministic Verification Engine**:
  - Reusable verification function `verifyAnswer()` checking candidate selection against configured answers.
  - Immediate visual feedback (emerald green for correct, rose red for incorrect).
  - Comprehensive engineering diagnosis explanation revealed on verification.
  - Answer locking mechanism preventing repeated score inflation.
  - Question Navigator updates live (`✓` for correct, `✕` for incorrect, amber for selected).
- **Standalone Countdown Timer**:
  - 60:00 countdown timer built in pure Vanilla JS `setInterval`.
  - Visual progress bar tracking remaining time.
  - Automatic warning state under 5 minutes (< 300s).
  - Auto-submits examination at 00:00 without allowing negative time.
- **Official Certificate & Technical Audit Scorecard**:
  - Comprehensive performance metrics: Score, Accuracy %, Questions Solved, Time Elapsed.
  - Technical audit breakdown table with question-by-question diagnosis.
  - Dedicated `@media print` styling for printing or saving official PDF scorecards.
- **Zero Data Leakage**:
  - Offline `localStorage` persistence prefixed with `TECHNOTHIRST26_DEBUGGING_TEST_`.
  - Graceful fallback for restricted/private browsing modes.

---

## 📁 Repository Structure

```
TECHNOTHIRST26_DEBUGGING_TEST/
│
├── index.html           # Main offline single-page application entry point
├── styles.css           # Technothirst’26 Light Tech Theme stylesheet
├── script.js            # Pure Vanilla JavaScript state machine, timer & verification engine
│
└── assets/
    ├── technothirst_reference.png   # Technothirst'26 symposium branding reference visual
    ├── mca_logo.jpg                 # Department of Computer Applications official emblem
    └── college_entrance.jpg         # A.V.C. College of Engineering campus entrance visual
```

---

## 💻 How to Run

1. Copy the folder to any computer or pen drive.
2. Double-click `index.html` (or open it with Google Chrome, Microsoft Edge, or Mozilla Firefox).
3. The debugging championship begins immediately! Zero setup required.

---

## 🎓 Organization & Credits

- **Organized by**: Department of Computer Applications (MCA), A.V.C. College of Engineering (Autonomous)
- **Symposium**: Technothirst’26 (A National Level Student’s Technical Symposium)
