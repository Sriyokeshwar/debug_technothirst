# Technothirst’26 — Python Debugging Championship

**A.V.C. College of Engineering (Autonomous)**  
*Department of Computer Applications (MCA) — Mannampandal, Mayiladuthurai*

An offline-first, client-side Python 3 Debugging Competition Platform built with pure modern web technologies (**HTML5**, **CSS3**, and **Vanilla JavaScript**). Strictly zero dependencies, zero CDNs, and zero backend services required.

---

## 🚀 Key Features

- **Offline-First Architecture**: Runs completely local by opening `index.html` in any browser. No internet or server installation required.
- **Stage 1: Semi-Final**:
  - Exactly **4 questions** with **5 intentional errors** each (20 errors total).
  - 60-minute countdown timer with early-exit unlocks at 45:00.
  - Strict line constraints (8 to 15 lines max for Q1–Q3; 10 to 18 lines for Q4).
  - Clean 2-line concise problem prompts.
- **Stage 2: Final Test**:
  - Organizer/Coordinator-activated stage.
  - Exactly **2 questions** with **5 intentional errors** each (10 errors total).
  - 10-minute timer limit.
- **Two-Column Debugging Workspace**:
  - **Left Side**: Concise 2-line problem prompt + syntax-highlighted buggy Python code with a one-click **[ COPY CODE ]** button.
  - **External IDE Workflow**: Students copy the code, debug in their local Python 3 interpreter/IDE, and paste the corrected version back.
  - **Right Side**: Clean code paste textarea with Tab indentation support and live line/character metrics.
- **Interactive Verification & Flexible Navigation**:
  - **[ VERIFY CODE ]**: Checks fixes against structural/behavioral criteria.
  - **Next-Line Banner**: Displays green theme for successful verification or red theme for unverified attempts.
  - **Auto-Enable Next Button**: Clicking verify automatically unlocks **[ NEXT QUESTION → ]** regardless of whether verification passed or failed.
  - **[ SKIP QUESTION ↷ ]**: Allows contestants to skip ahead at any time.
- **Multi-Participant Support & Local Storage Cache**:
  - Upon completion, the official **Audit Certificate** is rendered.
  - Clicking **[ + ADD ANOTHER PARTICIPANT ]** safely archives the current participant's scores, time, and roll number into local cache storage (`localStorage`), clears the session, and seamlessly onboards the next contestant on the same machine.
- **Coordinator / Admin Control Center**:
  - Authenticated via Web Crypto API PBKDF2 (SHA-256) password verification (Default: `Admin@Debug2026`).
  - Real-time candidate monitoring, timer pause/resume, test cancellation, and Final Test activation.
  - Full **Saved Participant Records** roster table with one-click **Export CSV** and **Clear Cache** tools.
- **Official Print / PDF Certificate & Text Audit**:
  - Clean `@media print` layout for saving or printing official competition certificates.
  - Offline `.txt` comprehensive audit file download.

---

## 📁 Repository Structure

```
.
├── index.html           # Main single-page application entry point
├── assets/
│   └── logo.jpg         # AVCCE MCA department official emblem
├── css/
│   └── style.css        # Technothirst’26 Light Tech Theme stylesheet
├── js/
│   ├── questions.js     # Data bank of Semi-Final (4) and Final (2) questions
│   ├── validation.js    # Client-side validation & anti-cheat engine
│   ├── security.js      # PBKDF2 (SHA-256) password authentication
│   ├── confetti.js      # Canvas confetti particle physics engine
│   └── app.js           # Core state machine, timers, and UI controller
├── scratch/
│   └── comprehensive_test.js  # 58-test automated verification suite
├── .gitignore
└── README.md
```

---

## 💻 How to Run

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Sriyokeshwar/debug_technothirst.git
   ```
2. Navigate into the directory and double-click `index.html` (or open it with any web browser like Google Chrome, Mozilla Firefox, or Microsoft Edge).
3. No build tools, Node.js runtime, or internet connection required!

---

## 🧪 Testing

To run the full automated test suite (58 verification tests):
```bash
node scratch/comprehensive_test.js
```

---

## 🎓 Credits

- **Organized by**: Department of Computer Applications (MCA), A.V.C. College of Engineering (Autonomous)
- **Symposium**: Technothirst’26
