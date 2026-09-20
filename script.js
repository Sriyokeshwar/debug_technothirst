/**
 * TECHNOTHIRST’26 — PYTHON DEBUGGING TOURNAMENT (SEMI-FINAL)
 * DEPARTMENT OF COMPUTER APPLICATIONS (MCA)
 * A.V.C. COLLEGE OF ENGINEERING (AUTONOMOUS)
 *
 * PURE VANILLA JAVASCRIPT IMPLEMENTATION
 * - Exactly 4 Questions (No Question 5)
 * - 5 Intentional Errors per Question (20 Total Errors)
 * - 60-Minute Hard Stop & 45-Minute Early Exit Threshold
 * - Admin Authentication & Pause / Resume Controls
 * - Dynamic Degree & Department Handling
 * - Multi-Participant Caching & Results Auditing
 */

// Global Competition Constants
const QUESTIONS_COUNT = 4;
const ERRORS_PER_QUESTION = 5;
const TOTAL_ERRORS = 20;
const TOTAL_TIME = 3600;       // 60 minutes in seconds
const EARLY_EXIT_TIME = 2700;  // 45 minutes in seconds
const GUIDELINE_UNLOCK_TIME = 15; // 15 seconds

const STORAGE_KEY = 'technothirst26_semifinal_session';
const ROSTER_KEY = 'technothirst26_participants_roster';

// SHA-256 hash of coordinator authorization key
const ADMIN_HASH = 'a09d95f1dd880973ce4ca0c15646ebdbe428d5093aa9d7882a7395e025fafd1c';

/* ==========================================================================
   1. DATA BANK: EXACTLY 4 SEMI-FINAL QUESTIONS (20 ERRORS TOTAL)
   Q1, Q2, Q3: strictly 8 to 15 lines max
   Q4: strictly 10 to 18 lines max
   Prompts: strictly 2 lines max
   ========================================================================== */
const COMPETITION_QUESTIONS = [
  // QUESTION 1 (15 lines, 5 errors)
  {
    id: 'semi_q1',
    number: 1,
    title: 'Daily Meal Sales & Tax Auditing',
    shortPrompt: 'Calculate total discounted sales, total tax, and the highest net meal category.\nApply 10% volume discount for quantity > 5, 5% tax for Breakfast (\'B\') vs 8% for others, and track top category.',
    expectedOutput: 'Sales: 2225.00 Tax: 167.02 Top: D',
    buggyCode: `items = [['B', 6, 40.0], ['L', 4, 80.0], ['D', 8, 120.0], ['B', 3, 50.0], ['L', 10, 75.0]]
total_sales = 0.0; total_tax = 0.0; max_bill = -1.0; top_cat = ''

for item in items:
    cat, qty, price = item[0], item[1], item[2]
    base = qty * price
    disc = price * 0.10 if qty < 5 else 0.0
    sub = base - disc
    tax_rate = 0.08 if cat == 'B' else 0.05
    tax = sub * tax_rate; net = sub + tax
    total_sales += sub; total_tax =+ tax
    if net < max_bill:
        max_bill = net; top_cat = cat

print(f"Sales: {total_sales:.2f} Tax: {total_tax:.2f} Top: {top_cat}")`
  },

  // QUESTION 2 (14 lines, 5 errors)
  {
    id: 'semi_q2',
    number: 2,
    title: 'Student Exam Attendance & Medical Condonation',
    shortPrompt: 'Compute attendance percentage and eligibility with a 10% condonation bonus for attendance in [65%, 75%) with medical certificate (\'Y\').\nEligible if attendance >= 75% and score >= 40. Track eligible count and top student.',
    expectedOutput: 'Eligible: 2, Top: Eshan (93.3%)',
    buggyCode: `students = [["Aravind", 38, 45, 'N', 78], ["Bhavna", 28, 45, 'Y', 65], ["Eshan", 42, 45, 'N', 92]]
eligible = 0; max_pct = 0.0; top_student = ""

for i in range(1, len(students)):
    name, att, total, med, score = students[i]
    pct = att / total + 100
    if pct < 75.0 and (pct >= 65.0 or med == 'Y'):
        pct += 10.0
    if pct >= 75.0 and score >= 40:
        eligible = eligble + 1
        if pct < max_pct:
            max_pct = pct; top_student = name

print(f"Eligible: {eligible}, Top: {top_student} ({max_pct:.1f}%)")`
  },

  // QUESTION 3 (15 lines, 5 errors)
  {
    id: 'semi_q3',
    number: 3,
    title: 'Sensor Matrix Temperature & Hotspots Analysis',
    shortPrompt: 'Analyze a 3x3 sensor matrix to compute the overall average temperature and count active hotspots.\nA hotspot is strictly greater than its row average and the overall average. Find the peak column index.',
    expectedOutput: 'Average: 32.78, Hotspots: 4, Peak Column: 2',
    buggyCode: `grid = [[28.0, 34.0, 31.0], [32.0, 36.0, 38.0], [29.0, 30.0, 37.0]]
total = 0.0; row_sum = 0.0; hotspots = 0; row_avgs = []
for r in range(len(grid)):
    for c in range(len(grid[0])):
        val = grid[c][r]; row_sum += val; total += val
    row_avgs.append(row_sum / len(grid[0]))
overall_avg = total / len(grid)
for r in range(len(grid)):
    for c in range(len(grid[0])):
        if grid[r][c] <= row_avgs[r] and grid[r][c] > overall_avg: hotspots += 1
col_sums = [grid[0][c] + grid[1][c] + grid[2][c] for c in range(3)]
peak_c = 0; max_c = -1.0
for c in range(3):
    if col_sums[c] < max_c: max_c = col_sums[c]; peak_c = c
print(f"Average: {overall_avg:.2f}, Hotspots: {hotspots}, Peak Column: {peak_c}")`
  },

  // QUESTION 4 (18 lines, 5 errors)
  {
    id: 'semi_q4',
    number: 4,
    title: 'Hostel Tiered Power Tariff & Peak Surcharges',
    shortPrompt: 'Calculate room electricity with slabs (0-100 @ 3.0, 101-200 @ 4.5, >200 @ 6.0), peak surcharge (+2.0), and 5% green rebate if units < 80.\nTrack total revenue, tier-3 rooms count (>200 units), and the highest billed room.',
    expectedOutput: 'Revenue: 1988.00, Tier3: 1, Top: Room 103',
    buggyCode: `def calc_bill(units, peak):
    if units <= 100: e = units * 3.0
    elif units <= 200: e = 300.0 + (units - 100) * 4.5
    else: e = 300.0 + 450.0 + (units - 100) * 6.0
    tot = e + peak * 2.0
    return tot - 5.0 if units < 80 else tot

rooms = [[101, 70, 15], [102, 160, 40], [103, 240, 60]]
total_rev = 0.0; tier3_cnt = 1; max_b = -1.0; top_room = 0

for r, u, p in rooms:
    b = calc_bill(p, u)
    total_rev += b
    if u > 200: tier3_cnt += 1
    if b < max_b:
        max_b = b; top_room = r

print(f"Revenue: {total_rev:.2f}, Tier3: {tier3_cnt}, Top: Room {top_room}")`
  }
];

/* ==========================================================================
   2. APPLICATION STATE MANAGEMENT
   ========================================================================== */
const STATE = {
  view: 'registration', // 'registration', 'rules', 'countdown', 'workspace', 'results'
  status: 'active',     // 'active', 'paused', 'completed', 'force_quit', 'time_expired', 'cancelled'
  
  student: {
    name: '',
    rollNo: '',
    degree: '',
    department: '',
    college: 'A.V.C. College of Engineering (Autonomous)'
  },

  currentQIndex: 0,
  solved: [false, false, false, false],
  errorsFixed: [0, 0, 0, 0],
  elapsedSeconds: 0,
  qTimes: [0, 0, 0, 0],
  earlyExitUnlocked: false
};

function saveSession() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
  } catch (e) {
    console.error('Session persistence failed:', e);
  }
}

function loadSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      Object.assign(STATE, parsed);
      return true;
    } catch (e) {
      console.error('Session parsing failed:', e);
    }
  }
  return false;
}

/* ==========================================================================
   3. PARTICIPANTS CACHE ROSTER ARCHIVE (MULTI-PARTICIPANT)
   ========================================================================== */
function getParticipantsRoster() {
  const data = localStorage.getItem(ROSTER_KEY);
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  return [];
}

function saveParticipantsRoster(roster) {
  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
  } catch (e) {}
}

function archiveCurrentParticipant() {
  if (!STATE.student || !STATE.student.name || !STATE.student.rollNo) return;

  const roster = getParticipantsRoster();
  const existingIdx = roster.findIndex(p => p.rollNo === STATE.student.rollNo);

  const entry = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    name: STATE.student.name,
    rollNo: STATE.student.rollNo,
    degree: STATE.student.degree,
    department: STATE.student.department,
    college: STATE.student.college,
    status: STATE.status,
    questionsSolved: STATE.solved.filter(s => s).length,
    errorsSolved: STATE.errorsFixed.reduce((a, b) => a + b, 0),
    timeTaken: STATE.elapsedSeconds,
    solvedBreakdown: [...STATE.solved],
    qTimes: [...STATE.qTimes]
  };

  if (existingIdx >= 0) {
    roster[existingIdx] = entry;
  } else {
    roster.push(entry);
  }

  saveParticipantsRoster(roster);
}

function resetToNewParticipant() {
  archiveCurrentParticipant();

  STATE.view = 'registration';
  STATE.status = 'active';
  STATE.student = {
    name: '',
    rollNo: '',
    degree: '',
    department: '',
    college: 'A.V.C. College of Engineering (Autonomous)'
  };
  STATE.currentQIndex = 0;
  STATE.solved = [false, false, false, false];
  STATE.errorsFixed = [0, 0, 0, 0];
  STATE.elapsedSeconds = 0;
  STATE.qTimes = [0, 0, 0, 0];
  STATE.earlyExitUnlocked = false;

  saveSession();

  // Reset form inputs
  document.getElementById('regStudentName').value = '';
  document.getElementById('regRollNo').value = '';
  document.getElementById('regDegree').value = '';
  const deptInput = document.getElementById('regDepartment');
  deptInput.value = '';
  deptInput.disabled = true;
  deptInput.placeholder = 'Select your degree first';
  document.getElementById('chkGuidelines').checked = false;
  document.getElementById('btnStartDebug').disabled = true;

  switchView('viewRegistration');
}

/* ==========================================================================
   4. REGISTRATION: DEGREE DROPDOWN & DYNAMIC DEPARTMENT INPUT
   ========================================================================== */
const degreeSelect = document.getElementById('regDegree');
const deptInput = document.getElementById('regDepartment');

degreeSelect.addEventListener('change', function() {
  const selVal = this.value.trim();
  if (selVal && selVal !== '') {
    deptInput.disabled = false;
    deptInput.placeholder = 'Enter your department / specialization';
    deptInput.focus();
  } else {
    deptInput.disabled = true;
    deptInput.value = '';
    deptInput.placeholder = 'Select your degree first';
  }
});

document.getElementById('formRegistration').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('regStudentName').value.trim();
  const roll = document.getElementById('regRollNo').value.trim();
  const deg = degreeSelect.value.trim();
  const dept = deptInput.value.trim();
  const col = document.getElementById('regCollege').value.trim();

  let valid = true;

  if (!name) { document.getElementById('errStudentName').style.display = 'block'; valid = false; }
  else { document.getElementById('errStudentName').style.display = 'none'; }

  if (!roll) { document.getElementById('errRollNo').style.display = 'block'; valid = false; }
  else { document.getElementById('errRollNo').style.display = 'none'; }

  if (!deg) { document.getElementById('errDegree').style.display = 'block'; valid = false; }
  else { document.getElementById('errDegree').style.display = 'none'; }

  if (!dept) { document.getElementById('errDepartment').style.display = 'block'; valid = false; }
  else { document.getElementById('errDepartment').style.display = 'none'; }

  if (!col) { document.getElementById('errCollege').style.display = 'block'; valid = false; }
  else { document.getElementById('errCollege').style.display = 'none'; }

  if (!valid) return;

  STATE.student = { name, rollNo: roll, degree: deg, department: dept, college: col };
  saveSession();

  switchView('viewRules');
  initGuidelineTimer();
});

/* ==========================================================================
   5. TOURNAMENT GUIDELINES & 15-SECOND LOCK
   ========================================================================== */
function toggleAccordion(headerEl) {
  const card = headerEl.closest('.acc-card');
  card.classList.toggle('open');
}

let guidelineInterval = null;
let guidelineCountdown = GUIDELINE_UNLOCK_TIME;

function initGuidelineTimer() {
  const badge = document.getElementById('guidelineTimerBadge');
  const chk = document.getElementById('chkGuidelines');
  const btnStart = document.getElementById('btnStartDebug');

  if (chk.checked) {
    chk.disabled = false;
    btnStart.disabled = false;
    badge.textContent = '✓ Guidelines Accepted';
    badge.classList.add('unlocked');
    return;
  }

  guidelineCountdown = GUIDELINE_UNLOCK_TIME;
  chk.disabled = true;
  btnStart.disabled = true;
  badge.textContent = `Lock: ${guidelineCountdown}s remaining`;
  badge.classList.remove('unlocked');

  if (guidelineInterval) clearInterval(guidelineInterval);

  guidelineInterval = setInterval(() => {
    guidelineCountdown--;
    if (guidelineCountdown > 0) {
      badge.textContent = `Lock: ${guidelineCountdown}s remaining`;
    } else {
      clearInterval(guidelineInterval);
      guidelineInterval = null;
      badge.textContent = '✓ Guidelines Unlocked';
      badge.classList.add('unlocked');
      chk.disabled = false;
    }
  }, 1000);
}

document.getElementById('chkGuidelines').addEventListener('change', function() {
  document.getElementById('btnStartDebug').disabled = !this.checked;
});

document.getElementById('btnStartDebug').addEventListener('click', function() {
  runCountdownAnimation(() => {
    STATE.status = 'active';
    switchView('viewWorkspace');
    renderWorkspace();
    startTimerLoop();
  });
});

/* ==========================================================================
   6. 3-2-1 COUNTDOWN ANIMATION
   ========================================================================== */
function runCountdownAnimation(onComplete) {
  switchView('viewCountdown');
  const numEl = document.getElementById('countdownNumber');
  let count = 3;
  numEl.textContent = '3';

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      numEl.textContent = count.toString();
    } else if (count === 0) {
      numEl.textContent = 'START!';
    } else {
      clearInterval(interval);
      if (onComplete) onComplete();
    }
  }, 900);
}

/* ==========================================================================
   7. TIMER STATE MACHINE (60-MIN HARD STOP & 45-MIN EARLY EXIT)
   ========================================================================== */
let timerInterval = null;

function startTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(timerTick, 1000);
}

function timerTick() {
  if (STATE.status === 'paused' || STATE.status === 'completed' || STATE.status === 'force_quit' || STATE.status === 'time_expired') {
    return;
  }

  STATE.elapsedSeconds++;
  const curQ = STATE.currentQIndex;
  if (curQ >= 0 && curQ < QUESTIONS_COUNT && !STATE.solved[curQ]) {
    STATE.qTimes[curQ]++;
  }

  const remaining = Math.max(0, TOTAL_TIME - STATE.elapsedSeconds);
  updateTimerDisplay(remaining);

  // 45-MINUTE THRESHOLD CHECK (2700s)
  if (STATE.elapsedSeconds >= EARLY_EXIT_TIME && !STATE.earlyExitUnlocked) {
    STATE.earlyExitUnlocked = true;
    document.getElementById('wsEarlyExitStatus').textContent = 'Early exit unlocked (45:00 reached)';
    document.getElementById('wsEarlyExitStatus').style.color = '#10B981';
    
    // Enable Force Quit button at exactly 45:00
    const btnFq = document.getElementById('btnForceQuit');
    btnFq.disabled = false;
    btnFq.removeAttribute('title');
  }

  // 60-MINUTE HARD STOP (3600s)
  if (STATE.elapsedSeconds >= TOTAL_TIME) {
    clearInterval(timerInterval);
    const allSolved = STATE.solved.every(s => s === true);
    STATE.status = allSolved ? 'completed' : 'time_expired';
    saveSession();
    alert('Maximum test duration reached (60:00). Auto-submitting Semi-Final test.');
    finishTestSession(STATE.status);
    return;
  }

  saveSession();
}

function updateTimerDisplay(remainingSec) {
  const timerBox = document.getElementById('navTimerBox');
  const display = document.getElementById('timerDisplay');
  
  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (remainingSec <= 300) {
    timerBox.className = 'nav-timer-box critical';
    display.className = 'timer-display critical';
  } else if (remainingSec <= 600) {
    timerBox.className = 'nav-timer-box warning';
    display.className = 'timer-display';
  } else {
    timerBox.className = 'nav-timer-box';
    display.className = 'timer-display';
  }
}

/* ==========================================================================
   8. SYNTAX HIGHLIGHTING (PURE VANILLA JS)
   ========================================================================== */
function highlightPythonSyntax(code) {
  const lines = code.split('\n');
  return lines.map((rawLine, idx) => {
    const lineNum = idx + 1;
    let line = escapeHtml(rawLine);

    if (line.includes('#')) {
      const parts = line.split('#');
      const codePart = highlightTokens(parts[0]);
      const commentPart = `<span class="syn-com">#${parts.slice(1).join('#')}</span>`;
      return `<div class="code-line"><span class="code-line-num">${lineNum}</span><span class="code-line-content">${codePart}${commentPart}</span></div>`;
    }

    const formatted = highlightTokens(line);
    return `<div class="code-line"><span class="code-line-num">${lineNum}</span><span class="code-line-content">${formatted}</span></div>`;
  }).join('');
}

function highlightTokens(str) {
  str = str.replace(/(f?&quot;.*?&quot;|f?&#39;.*?&#39;|f?'.*?'|f?".*?")/g, '<span class="syn-str">$1</span>');

  const keywords = ['def', 'return', 'if', 'elif', 'else', 'for', 'in', 'range', 'while', 'print', 'and', 'or', 'not', 'True', 'False', 'None', 'sum', 'len'];
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    str = str.replace(regex, '<span class="syn-kw">$1</span>');
  });

  str = str.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syn-num">$1</span>');
  return str;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ==========================================================================
   9. WORKSPACE CONTROLLER & QUESTION NAVIGATION
   ========================================================================== */
function renderWorkspace() {
  const qIdx = STATE.currentQIndex;
  const qData = COMPETITION_QUESTIONS[qIdx];

  // Nav display
  document.getElementById('navStageText').textContent = 'SEMI-FINAL';
  document.getElementById('navCenterProgress').style.display = 'flex';
  document.getElementById('navTimerBox').style.display = 'flex';
  renderStepPills();

  // Status Bar
  document.getElementById('wsQuestionNum').textContent = `QUESTION ${qData.number} / ${QUESTIONS_COUNT}`;
  document.getElementById('wsCandidateName').textContent = `Candidate: ${STATE.student.name || '--'}`;

  // Early Exit & Force Quit button state
  const btnFq = document.getElementById('btnForceQuit');
  if (STATE.earlyExitUnlocked || STATE.elapsedSeconds >= EARLY_EXIT_TIME) {
    document.getElementById('wsEarlyExitStatus').textContent = 'Early exit unlocked (45:00 reached)';
    document.getElementById('wsEarlyExitStatus').style.color = '#10B981';
    btnFq.disabled = false;
    btnFq.removeAttribute('title');
  } else {
    document.getElementById('wsEarlyExitStatus').textContent = 'Early exit unlocks at 45:00';
    document.getElementById('wsEarlyExitStatus').style.color = 'var(--secondary-color)';
    btnFq.disabled = true;
    btnFq.title = 'Force quit unlocks after 45 minutes';
  }

  // Left Column
  document.getElementById('specTitle').textContent = `Q${qData.number}: ${qData.title}`;
  document.getElementById('specShortPrompt').textContent = qData.shortPrompt;
  document.getElementById('specExpectedOutput').textContent = qData.expectedOutput;
  document.getElementById('codeViewerBody').innerHTML = highlightPythonSyntax(qData.buggyCode);

  const btnCopy = document.getElementById('btnCopyCode');
  btnCopy.textContent = 'COPY CODE';
  btnCopy.classList.remove('copied');

  // Right Column
  const editor = document.getElementById('txtCorrectedCode');
  editor.value = '';
  updateEditorMetrics();
  hideVerificationStatus();

  // Next Question / Finish Test button handling
  const btnNext = document.getElementById('btnNextQuestion');
  const btnFinish = document.getElementById('btnFinishTest');

  if (qIdx === QUESTIONS_COUNT - 1) {
    // Question 4: hide Next, show Finish Test
    btnNext.style.display = 'none';
    btnFinish.style.display = 'inline-flex';

    // Finish Test is allowed ONLY if 4/4 questions are solved
    const allSolved = STATE.solved.every(s => s === true);
    btnFinish.disabled = !allSolved;
  } else {
    btnNext.style.display = 'inline-flex';
    btnFinish.style.display = 'none';

    // Next is enabled if current question is already solved
    btnNext.disabled = !STATE.solved[qIdx];
  }
}

function renderStepPills() {
  const container = document.getElementById('qStepPills');
  container.innerHTML = '';
  for (let i = 0; i < QUESTIONS_COUNT; i++) {
    const pill = document.createElement('div');
    pill.className = 'q-step-pill';
    pill.textContent = `Q${i + 1}`;

    if (STATE.solved[i]) {
      pill.classList.add('completed');
      pill.textContent = '✓';
    } else if (i === STATE.currentQIndex) {
      pill.classList.add('active');
    } else {
      pill.classList.add('locked');
    }

    // Allow clicking on any unlocked/solved question or current
    pill.style.cursor = 'pointer';
    pill.addEventListener('click', () => {
      STATE.currentQIndex = i;
      saveSession();
      renderWorkspace();
    });

    container.appendChild(pill);
  }
}

function updateEditorMetrics() {
  const txt = document.getElementById('txtCorrectedCode').value;
  const lines = txt.split('\n').length;
  const chars = txt.length;
  document.getElementById('editorLineCount').textContent = `Lines: ${lines} | Characters: ${chars}`;
}

document.getElementById('txtCorrectedCode').addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + 4;
    updateEditorMetrics();
  }
});

document.getElementById('txtCorrectedCode').addEventListener('input', updateEditorMetrics);

// COPY CODE BUTTON
document.getElementById('btnCopyCode').addEventListener('click', function() {
  const qData = COMPETITION_QUESTIONS[STATE.currentQIndex];
  navigator.clipboard.writeText(qData.buggyCode).then(() => {
    this.textContent = '✓ COPIED';
    this.classList.add('copied');
    setTimeout(() => {
      this.textContent = 'COPY CODE';
      this.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = qData.buggyCode;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    this.textContent = '✓ COPIED';
    this.classList.add('copied');
    setTimeout(() => {
      this.textContent = 'COPY CODE';
      this.classList.remove('copied');
    }, 2000);
  });
});

/* ==========================================================================
   10. CODE VERIFICATION ENGINE (EVALUATES ALL 5 INTENTIONAL ERRORS)
   ========================================================================== */
function verifySubmittedCode(qData, userCode) {
  if (!userCode || typeof userCode !== 'string') {
    return { success: false, errorsSolved: 0 };
  }

  const lines = userCode.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  // Anti-Cheat: Reject trivial mock submissions
  if (lines.length < 8) {
    return { success: false, errorsSolved: 0 };
  }

  const codeClean = userCode.replace(/\r/g, '');
  const hasForOrWhile = /\b(for|while)\b/.test(codeClean);
  if (!hasForOrWhile) {
    return { success: false, errorsSolved: 0 };
  }

  let errorsFixed = 0;
  const qId = qData.id;

  if (qId === 'semi_q1') {
    // Error 1: qty > 5
    const e1 = /qty\s*>\s*5|qty\s*>=\s*6|5\s*<\s*qty/.test(codeClean) && !/qty\s*<\s*5/.test(codeClean);
    // Error 2: base * 0.10
    const e2 = /(base|qty\s*\*\s*price)\s*\*\s*(0\.1|0\.10|\.1)/.test(codeClean) && !/price\s*\*\s*0\.10/.test(codeClean);
    // Error 3: tax rate 0.05 for B, 0.08 for others
    const e3 = /(0\.05|\.05)\s+if\s+cat\s*==\s*['"]B['"]\s+else\s+(0\.08|\.08)|(0\.08|\.08)\s+if\s+cat\s*!=\s*['"]B['"]\s+else\s+(0\.05|\.05)/.test(codeClean) ||
               (/if\s+cat\s*==\s*['"]B['"]\s*:[\s\S]*?0\.05/.test(codeClean) && /else\s*:[\s\S]*?0\.08/.test(codeClean));
    // Error 4: total_tax += tax
    const e4 = /total_tax\s*\+=\s*tax|total_tax\s*=\s*total_tax\s*\+\s*tax/.test(codeClean) && !/total_tax\s*=\+\s*tax/.test(codeClean);
    // Error 5: net > max_bill
    const e5 = /net\s*>\s*max_bill|max_bill\s*<\s*net/.test(codeClean) && !/net\s*<\s*max_bill/.test(codeClean);

    if (e1) errorsFixed++;
    if (e2) errorsFixed++;
    if (e3) errorsFixed++;
    if (e4) errorsFixed++;
    if (e5) errorsFixed++;

    return { success: (errorsFixed === 5), errorsSolved: errorsFixed };
  }

  if (qId === 'semi_q2') {
    // Error 1: start range at 0
    const e1 = /range\s*\(\s*(0\s*,\s*)?len\s*\(\s*students\s*\)\s*\)/.test(codeClean) && !/range\s*\(\s*1\s*,/.test(codeClean);
    // Error 2: att / total * 100
    const e2 = /att\s*\/\s*total\s*\*\s*100|\(\s*att\s*\/\s*total\s*\)\s*\*\s*100/.test(codeClean) && !/att\s*\/\s*total\s*\+\s*100/.test(codeClean);
    // Error 3: and med == 'Y'
    const e3 = /pct\s*>=\s*65(\.0)?\s+and\s+med\s*==\s*['"]Y['"]|med\s*==\s*['"]Y['"]\s+and\s+pct\s*>=\s*65/.test(codeClean);
    // Error 4: variable typo eligble fixed
    const e4 = !/\beligble\b/.test(codeClean) && /eligible\s*(\+=|\s*=\s*eligible\s*\+\s*1)/.test(codeClean);
    // Error 5: pct > max_pct
    const e5 = /pct\s*>\s*max_pct|max_pct\s*<\s*pct/.test(codeClean) && !/pct\s*<\s*max_pct/.test(codeClean);

    if (e1) errorsFixed++;
    if (e2) errorsFixed++;
    if (e3) errorsFixed++;
    if (e4) errorsFixed++;
    if (e5) errorsFixed++;

    return { success: (errorsFixed === 5), errorsSolved: errorsFixed };
  }

  if (qId === 'semi_q3') {
    // Error 1: row_sum reset inside outer row loop
    const e1 = /for\s+r\s+in\s+range\s*\([\s\S]*?row_sum\s*=\s*0(\.0)?/.test(codeClean) ||
               (codeClean.indexOf('row_sum = 0') > codeClean.indexOf('for r in range'));
    // Error 2: grid[r][c] correctly indexed
    const e2 = /val\s*=\s*grid\s*\[\s*r\s*\]\s*\[\s*c\s*\]/.test(codeClean) && !/val\s*=\s*grid\s*\[\s*c\s*\]\s*\[\s*r\s*\]/.test(codeClean);
    // Error 3: total cells 9 or len(grid)*len(grid[0])
    const e3 = /total\s*\/\s*(9|len\s*\(\s*grid\s*\)\s*\*\s*len\s*\(\s*grid\s*\[\s*0\s*\]\s*\)|\(\s*len\s*\(\s*grid\s*\)\s*\*\s*len\s*\(\s*grid\s*\[\s*0\s*\]\s*\)\s*\))/.test(codeClean);
    // Error 4: grid[r][c] > row_avgs[r]
    const e4 = /grid\s*\[\s*r\s*\]\s*\[\s*c\s*\]\s*>\s*row_avgs\s*\[\s*r\s*\]/.test(codeClean) && !/grid\s*\[\s*r\s*\]\s*\[\s*c\s*\]\s*<=\s*row_avgs\s*\[\s*r\s*\]/.test(codeClean);
    // Error 5: col_sums[c] > max_c
    const e5 = /col_sums\s*\[\s*c\s*\]\s*>\s*max_c|max_c\s*<\s*col_sums\s*\[\s*c\s*\]/.test(codeClean) && !/col_sums\s*\[\s*c\s*\]\s*<\s*max_c/.test(codeClean);

    if (e1) errorsFixed++;
    if (e2) errorsFixed++;
    if (e3) errorsFixed++;
    if (e4) errorsFixed++;
    if (e5) errorsFixed++;

    return { success: (errorsFixed === 5), errorsSolved: errorsFixed };
  }

  if (qId === 'semi_q4') {
    // Error 1: units - 200 in tier 3
    const e1 = /\(\s*units\s*-\s*200\s*\)\s*\*\s*6(\.0)?/.test(codeClean) && !/\(\s*units\s*-\s*100\s*\)\s*\*\s*6(\.0)?/.test(codeClean);
    // Error 2: green rebate 5%
    const e2 = /tot\s*-\s*\(?\s*tot\s*\*\s*(0\.05|\.05)\s*\)?|tot\s*\*\s*(0\.95|\.95)/.test(codeClean) && !/tot\s*-\s*5(\.0)?\b/.test(codeClean);
    // Error 3: tier3_cnt initialized to 0
    const e3 = /tier3_cnt\s*=\s*0\b/.test(codeClean) && !/tier3_cnt\s*=\s*1\b/.test(codeClean);
    // Error 4: calc_bill(u, p) in proper parameter order
    const e4 = /calc_bill\s*\(\s*u\s*,\s*p\s*\)/.test(codeClean) && !/calc_bill\s*\(\s*p\s*,\s*u\s*\)/.test(codeClean);
    // Error 5: b > max_b
    const e5 = /b\s*>\s*max_b|max_b\s*<\s*b/.test(codeClean) && !/b\s*<\s*max_b/.test(codeClean);

    if (e1) errorsFixed++;
    if (e2) errorsFixed++;
    if (e3) errorsFixed++;
    if (e4) errorsFixed++;
    if (e5) errorsFixed++;

    return { success: (errorsFixed === 5), errorsSolved: errorsFixed };
  }

  return { success: false, errorsSolved: 0 };
}

// VERIFY CODE BUTTON CLICK
document.getElementById('btnVerifyCode').addEventListener('click', function() {
  const qIdx = STATE.currentQIndex;
  const qData = COMPETITION_QUESTIONS[qIdx];
  const userCode = document.getElementById('txtCorrectedCode').value;

  const result = verifySubmittedCode(qData, userCode);

  if (result.success) {
    // Green theme color banner: VERIFIED
    showVerificationStatus(true, '✓ VERIFIED: Question verified successfully. All 5 intentional errors resolved.');
    STATE.solved[qIdx] = true;
    STATE.errorsFixed[qIdx] = 5;

    // Successful verification unlocks NEXT QUESTION
    if (qIdx < QUESTIONS_COUNT - 1) {
      document.getElementById('btnNextQuestion').disabled = false;
    } else {
      // Question 4: Check if all 4 are solved
      const allSolved = STATE.solved.every(s => s === true);
      if (allSolved) {
        document.getElementById('btnFinishTest').disabled = false;
      }
    }
  } else {
    // Red theme color banner: UNVERIFIED
    showVerificationStatus(false, `✖ UNVERIFIED: Question is not verified (${result.errorsSolved}/5 errors resolved). Please check logic and retry.`);
    if (!STATE.solved[qIdx]) {
      STATE.errorsFixed[qIdx] = result.errorsSolved;
      if (qIdx < QUESTIONS_COUNT - 1) {
        document.getElementById('btnNextQuestion').disabled = true;
      }
    }
  }

  saveSession();
  renderStepPills();
});

function showVerificationStatus(isSuccess, message) {
  const banner = document.getElementById('verificationStatusBanner');
  banner.className = `verification-status-banner ${isSuccess ? 'success' : 'error'}`;
  banner.textContent = message;
}

function hideVerificationStatus() {
  const banner = document.getElementById('verificationStatusBanner');
  banner.className = 'verification-status-banner';
  banner.textContent = '';
}

// NEXT QUESTION BUTTON
document.getElementById('btnNextQuestion').addEventListener('click', function() {
  if (STATE.currentQIndex < QUESTIONS_COUNT - 1) {
    STATE.currentQIndex++;
    saveSession();
    renderWorkspace();
  }
});

// FINISH TEST BUTTON (ALLOWED ONLY WHEN 4/4 QUESTIONS ARE SOLVED)
document.getElementById('btnFinishTest').addEventListener('click', function() {
  const allSolved = STATE.solved.every(s => s === true);
  if (!allSolved) {
    alert('You cannot finish the test normally before solving all 4 questions.');
    return;
  }
  finishTestSession('completed');
});

// FORCE QUIT BUTTON (ENABLED AT 45:00)
document.getElementById('btnForceQuit').addEventListener('click', function() {
  if (STATE.elapsedSeconds < EARLY_EXIT_TIME && !STATE.earlyExitUnlocked) {
    alert('Force Quit is locked until 45 minutes have elapsed.');
    return;
  }
  openModal('modalForceQuitConfirm');
});

document.getElementById('btnConfirmForceQuit').addEventListener('click', function() {
  closeModal('modalForceQuitConfirm');
  finishTestSession('force_quit');
});

/* ==========================================================================
   11. TEST COMPLETION & RESULTS AUDIT SCREEN
   ========================================================================== */
function finishTestSession(finalStatus) {
  if (timerInterval) clearInterval(timerInterval);
  STATE.status = finalStatus;
  archiveCurrentParticipant();
  saveSession();

  if (finalStatus === 'completed') {
    triggerConfetti();
  }

  showResultsView();
}

function showResultsView() {
  switchView('viewResults');

  document.getElementById('navCenterProgress').style.display = 'none';
  document.getElementById('navTimerBox').style.display = 'none';
  document.getElementById('navStageText').textContent = 'Audit Results';

  // Candidate credentials
  document.getElementById('resCandName').textContent = STATE.student.name || '--';
  document.getElementById('resCandRoll').textContent = STATE.student.rollNo || '--';
  document.getElementById('resCandDegree').textContent = STATE.student.degree || '--';
  document.getElementById('resCandDept').textContent = STATE.student.department || '--';
  document.getElementById('resCandCollege').textContent = STATE.student.college || '--';

  const solvedCount = STATE.solved.filter(s => s).length;
  const errorsFixed = STATE.errorsFixed.reduce((a, b) => a + b, 0);
  const mins = Math.floor(STATE.elapsedSeconds / 60);
  const secs = STATE.elapsedSeconds % 60;

  document.getElementById('resSemiQuestions').textContent = `${solvedCount} / ${QUESTIONS_COUNT}`;
  document.getElementById('resSemiErrors').textContent = `${errorsFixed} / ${TOTAL_ERRORS}`;
  document.getElementById('resSemiTime').textContent = `${mins} min ${secs} sec`;

  let statusLabel = 'Completed';
  let badgeClass = 'success';

  if (STATE.status === 'force_quit') {
    statusLabel = 'Force Quit / Incomplete';
    badgeClass = 'warning';
  } else if (STATE.status === 'time_expired') {
    statusLabel = solvedCount === 4 ? 'Completed' : 'Time Expired / Incomplete';
    badgeClass = solvedCount === 4 ? 'success' : 'danger';
  } else if (STATE.status === 'cancelled') {
    statusLabel = 'Cancelled by Admin';
    badgeClass = 'danger';
  }

  document.getElementById('resSemiStatus').textContent = statusLabel;
  const badge = document.getElementById('resSemiBadge');
  badge.textContent = statusLabel;
  badge.className = `score-badge ${badgeClass}`;

  // Render question-by-question audit table: strictly 4 rows (Q1 to Q4)
  const tbody = document.getElementById('resTimingTableBody');
  tbody.innerHTML = '';

  COMPETITION_QUESTIONS.forEach((q, idx) => {
    const isSolved = STATE.solved[idx];
    const timeSec = STATE.qTimes[idx];
    const m = Math.floor(timeSec / 60);
    const s = timeSec % 60;
    const errors = isSolved ? 5 : 0; // Exactly 5/5 if solved, 0/5 if unsolved

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>Q${idx + 1}:</strong> ${q.title}</td>
      <td><span class="score-badge ${isSolved ? 'success' : 'warning'}">${isSolved ? 'SOLVED' : 'UNSOLVED'}</span></td>
      <td>${m}m ${s}s</td>
      <td><strong>${errors} / 5</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

// REGISTER ANOTHER PARTICIPANT BUTTON
document.getElementById('btnAddAnotherParticipant').addEventListener('click', function() {
  if (confirm('Archive current participant audit and register a new student for the competition?')) {
    resetToNewParticipant();
  }
});

// TXT AUDIT DOWNLOAD
document.getElementById('btnDownloadTxt').addEventListener('click', function() {
  const solvedCount = STATE.solved.filter(s => s).length;
  const errorsFixed = STATE.errorsFixed.reduce((a, b) => a + b, 0);
  const mins = Math.floor(STATE.elapsedSeconds / 60);
  const secs = STATE.elapsedSeconds % 60;

  let txt = `=============================================================
A.V.C. COLLEGE OF ENGINEERING (AUTONOMOUS)
DEPARTMENT OF COMPUTER APPLICATIONS (MCA)
TECHNOTHIRST’26 PYTHON DEBUGGING TOURNAMENT — SEMI-FINAL AUDIT
=============================================================

CANDIDATE CREDENTIALS:
Name:            ${STATE.student.name}
Register Number: ${STATE.student.rollNo}
Degree:          ${STATE.student.degree}
Department:      ${STATE.student.department}
College:         ${STATE.student.college}

-------------------------------------------------------------
SEMI-FINAL PERFORMANCE
-------------------------------------------------------------
Status:           ${STATE.status.toUpperCase()}
Questions Solved: ${solvedCount} / ${QUESTIONS_COUNT}
Errors Solved:    ${errorsFixed} / ${TOTAL_ERRORS}
Total Time Taken: ${mins} min ${secs} sec

QUESTION-BY-QUESTION AUDIT BREAKDOWN:
`;

  COMPETITION_QUESTIONS.forEach((q, i) => {
    const timeSec = STATE.qTimes[i];
    const m = Math.floor(timeSec / 60);
    const s = timeSec % 60;
    const err = STATE.solved[i] ? 5 : 0;
    txt += `Q${i + 1} [${q.title}]: ${STATE.solved[i] ? 'SOLVED' : 'UNSOLVED'} | Errors: ${err}/5 | Time: ${m}m ${s}s\n`;
  });

  txt += `
=============================================================
Generated Off-line at: ${new Date().toLocaleString()}
Institution Seal: AVCCE MCA / Technothirst’26
=============================================================`;

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Technothirst26_Audit_${STATE.student.rollNo || 'Candidate'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// PRINT / PDF BUTTON
document.getElementById('btnPrintPdf').addEventListener('click', function() {
  window.print();
});

/* ==========================================================================
   12. ADMIN AUTHENTICATION & DASHBOARD CONTROLS
   ========================================================================== */
document.getElementById('btnAdminOpen').addEventListener('click', function() {
  openModal('modalAdminLogin');
  document.getElementById('txtAdminPassword').value = '';
  document.getElementById('errAdminPassword').style.display = 'none';
});

async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.getElementById('btnAdminSubmitLogin').addEventListener('click', async function() {
  const pwd = document.getElementById('txtAdminPassword').value;
  const hash = await sha256Hex(pwd);

  if (hash === ADMIN_HASH) {
    closeModal('modalAdminLogin');
    openAdminDashboard();
  } else {
    document.getElementById('errAdminPassword').style.display = 'block';
  }
});

document.getElementById('txtAdminPassword').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('btnAdminSubmitLogin').click();
  }
});

function openAdminDashboard() {
  updateAdminDashboardData();
  renderAdminRoster();
  openModal('modalAdminDashboard');
}

function updateAdminDashboardData() {
  document.getElementById('admCandName').textContent = STATE.student.name || '--';
  document.getElementById('admCandRoll').textContent = STATE.student.rollNo || '--';
  document.getElementById('admCandDegreeDept').textContent = `${STATE.student.degree || '--'} / ${STATE.student.department || '--'}`;
  document.getElementById('admQuestion').textContent = `Question ${STATE.currentQIndex + 1} / ${QUESTIONS_COUNT}`;

  const remaining = Math.max(0, TOTAL_TIME - STATE.elapsedSeconds);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  document.getElementById('admTimeLeft').textContent = `${m}m ${s}s`;

  const solvedCount = STATE.solved.filter(s => s).length;
  const errorsSolved = STATE.errorsFixed.reduce((a, b) => a + b, 0);
  document.getElementById('admQuestionsSolved').textContent = `${solvedCount} / ${QUESTIONS_COUNT}`;
  document.getElementById('admErrorsSolved').textContent = `${errorsSolved} / ${TOTAL_ERRORS}`;

  const isPaused = (STATE.status === 'paused');
  document.getElementById('admPauseState').textContent = isPaused ? 'PAUSED' : 'ACTIVE';
  document.getElementById('admPauseState').style.color = isPaused ? '#EF4444' : '#10B981';

  if (isPaused) {
    document.getElementById('admBtnPause').style.display = 'none';
    document.getElementById('admBtnResume').style.display = 'inline-flex';
  } else {
    document.getElementById('admBtnPause').style.display = 'inline-flex';
    document.getElementById('admBtnResume').style.display = 'none';
  }
}

function renderAdminRoster() {
  const roster = getParticipantsRoster();
  const tbody = document.getElementById('admRosterTableBody');
  tbody.innerHTML = '';

  if (roster.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 14px;">No completed candidate records yet.</td></tr>';
    return;
  }

  roster.forEach(p => {
    const tr = document.createElement('tr');
    const m = Math.floor(p.timeTaken / 60);
    const s = p.timeTaken % 60;
    tr.innerHTML = `
      <td><strong>${p.rollNo}</strong></td>
      <td>${p.name}</td>
      <td>${p.degree}</td>
      <td>${p.department}</td>
      <td>${p.questionsSolved} / ${QUESTIONS_COUNT}</td>
      <td>${p.errorsSolved} / ${TOTAL_ERRORS}</td>
      <td>${m}m ${s}s</td>
      <td><span class="score-badge ${p.status === 'completed' ? 'success' : 'warning'}">${p.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ADMIN PAUSE TEST
document.getElementById('admBtnPause').addEventListener('click', function() {
  STATE.status = 'paused';
  saveSession();
  document.getElementById('pauseOverlay').classList.add('active');
  updateAdminDashboardData();
});

// ADMIN RESUME TEST
document.getElementById('admBtnResume').addEventListener('click', function() {
  STATE.status = 'active';
  saveSession();
  document.getElementById('pauseOverlay').classList.remove('active');
  updateAdminDashboardData();
});

// ADMIN FORCE FINISH
document.getElementById('admBtnForceFinish').addEventListener('click', function() {
  if (confirm('Force finish current participant? Current progress will be audited.')) {
    closeModal('modalAdminDashboard');
    finishTestSession('force_quit');
  }
});

// ADMIN CANCEL TEST
document.getElementById('admBtnCancel').addEventListener('click', function() {
  if (confirm('Cancel this candidate test? Session will be terminated.')) {
    closeModal('modalAdminDashboard');
    finishTestSession('cancelled');
  }
});

// ADMIN NEW PARTICIPANT
document.getElementById('admBtnNewParticipant').addEventListener('click', function() {
  if (confirm('Reset environment for a new participant? Current session will be archived in the roster.')) {
    closeModal('modalAdminDashboard');
    resetToNewParticipant();
  }
});

// CLEAR ROSTER CACHE
document.getElementById('admBtnClearRoster').addEventListener('click', function() {
  if (confirm('Clear all saved participant records from local cache? This cannot be undone.')) {
    saveParticipantsRoster([]);
    renderAdminRoster();
  }
});

// EXPORT ROSTER AS CSV
document.getElementById('admBtnExportAllCsv').addEventListener('click', function() {
  const roster = getParticipantsRoster();
  if (roster.length === 0) {
    alert('No participant records to export.');
    return;
  }

  let csv = 'RollNo,Name,Degree,Department,College,QuestionsSolved,ErrorsSolved,TimeTakenSeconds,Status,Timestamp\n';
  roster.forEach(p => {
    csv += `"${p.rollNo}","${p.name}","${p.degree}","${p.department}","${p.college}",${p.questionsSolved},${p.errorsSolved},${p.timeTaken},"${p.status}","${p.timestamp}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Technothirst26_Participants_Roster.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

/* ==========================================================================
   13. MODAL CONTROLLER & VIEW SWITCHER
   ========================================================================== */
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function switchView(viewId) {
  STATE.view = viewId;
  document.querySelectorAll('.view-screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
  saveSession();
}

/* ==========================================================================
   14. CANVASES & CONFETTI ENGINE
   ========================================================================== */
let confettiCanvas = null;
let confettiCtx = null;
let confettiParticles = [];
let confettiAnimationId = null;

function initConfettiCanvas() {
  confettiCanvas = document.getElementById('confettiCanvas');
  if (!confettiCanvas) return;
  confettiCtx = confettiCanvas.getContext('2d');

  function resize() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
}

function triggerConfetti() {
  if (!confettiCanvas) initConfettiCanvas();
  confettiParticles = [];
  const colors = ['#06B6D4', '#075985', '#FACC15', '#10B981', '#F472B6', '#38BDF8'];

  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.5) * 14 - 3,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 8,
      gravity: 0.28,
      opacity: 1
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
  animateConfetti();
}

function animateConfetti() {
  if (!confettiCtx) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  let alive = 0;
  confettiParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.rotation += p.rSpeed;
    p.opacity -= 0.008;

    if (p.opacity > 0) {
      alive++;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = p.opacity;
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      confettiCtx.restore();
    }
  });

  if (alive > 0) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ==========================================================================
   15. INITIALIZATION ON DOM READY
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  initConfettiCanvas();
  const hasSaved = loadSession();

  if (hasSaved && STATE.student && STATE.student.name && STATE.student.rollNo) {
    // If test was paused by admin, keep paused overlay active
    if (STATE.status === 'paused') {
      document.getElementById('pauseOverlay').classList.add('active');
    }

    if (STATE.view === 'viewResults' || STATE.status === 'completed' || STATE.status === 'force_quit' || STATE.status === 'time_expired' || STATE.status === 'cancelled') {
      showResultsView();
    } else if (STATE.view === 'viewWorkspace') {
      switchView('viewWorkspace');
      renderWorkspace();
      if (STATE.status === 'active') {
        startTimerLoop();
      }
    } else if (STATE.view === 'viewRules') {
      switchView('viewRules');
      initGuidelineTimer();
    } else {
      switchView('viewRegistration');
    }
  } else {
    switchView('viewRegistration');
  }
});
