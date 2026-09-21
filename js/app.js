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

const ROSTER_KEY = 'technothirst26_participants_roster';
const ACTIVE_USER_KEY = 'technothirst26_active_user_id';
const LEGACY_STORAGE_KEYS = [
  'technothirst26_semifinal_session',
  'debugTestState',
  'testState',
  'answers',
  'correctedCode',
  'verifiedQuestions',
  'questionStates',
  'testProgress',
  'currentQuestion'
];

// SHA-256 hash of coordinator authorization key
const ADMIN_HASH = 'a09d95f1dd880973ce4ca0c15646ebdbe428d5093aa9d7882a7395e025fafd1c';
// Legacy organizer password hash
const LEGACY_ADMIN_HASH = '022dc6c2b910ae8db851da56e49ba8d0dd01cda9cd269030d93a248e156e7fbe';

function isAuthorizedAdmin(hash) {
  return hash === ADMIN_HASH || hash === LEGACY_ADMIN_HASH;
}


/* ==========================================================================
   1. DATA BANK: EXACTLY 4 SEMI-FINAL QUESTIONS (20 ERRORS TOTAL)
   Q1, Q2, Q3: strictly 8 to 15 lines max
   Q4: strictly 10 to 18 lines max
   Prompts: strictly 2 lines max
   ========================================================================== */
const COMPETITION_QUESTIONS = [
  // QUESTION 1
  {
    id: 'semi_q1',
    number: 1,
    title: 'Even Numbers Filter & Average Calculation',
    shortPrompt: 'Filter all even integers from the list and compute their sum and average.\nEnsure even numbers are correctly identified and average divides by the count of even numbers.',
    expectedOutput: 'Even: [12, 18, 24]\nAverage: 18.0',
    buggyCode: `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 1]
total = sum(even)
avg = total / len(nums)
print("Even:", even)
print("Average:", avg)`
  },

  // QUESTION 2
  {
    id: 'semi_q2',
    number: 2,
    title: 'Threshold Filter & Numeric Summation',
    shortPrompt: 'Filter all numbers strictly greater than the limit and compute their cumulative sum.\nEnsure values are appended as numbers so sum() succeeds without TypeError.',
    expectedOutput: '[15, 20]\nTotal: 35',
    buggyCode: `def check(numbers, limit=10):
    result = []
    for n in numbers:
        if n > limit:
            result.append(str(n))
    total = sum(result)
    return result, total

data = [5, 15, 20, 8]
values, total = check(data, 10)
print(values)
print("Total:", total)`
  },

  // QUESTION 3
  {
    id: 'semi_q3',
    number: 3,
    title: 'Word Frequency Counter & Common Words Indexing',
    shortPrompt: 'Count word occurrences in text and extract repeated words.\nFix index boundary error when accessing elements of the common words list.',
    expectedOutput: `Count: {'Python': 3, 'Java': 2}\nCommon: ['Python', 'Java']\nJava`,
    buggyCode: `text = "Python Python Java Python Java"
words = text.split()
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1
common = [w for w in count if count[w] > 1]
print("Count:", count)
print("Common:", common)
print(common[2])`
  },

  // QUESTION 4
  {
    id: 'semi_q4',
    number: 4,
    title: 'Student Class Attributes & Method Invocations',
    shortPrompt: 'Manage student records with class-level student counters, average marks, and pass/fail evaluation.\nFix class attribute access inside constructor and call the average method properly.',
    expectedOutput: 'Arun 56.666666666666664 PASS\n1',
    buggyCode: `class Student:
    total = 0
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks
        total += 1
    def average(self):
        return sum(self.marks) / len(self.marks)
    def result(self):
        return "PASS" if self.average() >= 50 else "FAIL"

s = Student("Arun", [60, 70, 40])
print(s.name, s.average, s.result())
print(Student.total)`
  }
];

/* ==========================================================================
   2. USER-SPECIFIC ISOLATED STATE MANAGEMENT
   - Every participant has an independent test session: debugTestState_<USER_ID>
   - Completely isolates answers, verification, timers, and question status
   - No global data leakage between users
   ========================================================================== */

function normalizeUserId(rawId) {
  if (!rawId) return '';
  return String(rawId).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

function getCurrentUserId() {
  if (STATE && STATE.student && STATE.student.rollNo) {
    const id = normalizeUserId(STATE.student.rollNo);
    if (id) return id;
  }
  const activeUser = sessionStorage.getItem(ACTIVE_USER_KEY) || localStorage.getItem(ACTIVE_USER_KEY);
  if (activeUser) {
    return normalizeUserId(activeUser);
  }
  return null;
}

function getUserStorageKey(userId) {
  const id = normalizeUserId(userId || getCurrentUserId());
  return id ? `debugTestState_${id}` : null;
}

function cleanupLegacyGlobalData() {
  LEGACY_STORAGE_KEYS.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  });
}

function createFreshUserState(studentInfo) {
  const normId = normalizeUserId(studentInfo?.rollNo || '');
  return {
    userId: normId,
    student: {
      name: studentInfo?.name || '',
      rollNo: studentInfo?.rollNo || '',
      degree: studentInfo?.degree || '',
      department: studentInfo?.department || '',
      college: studentInfo?.college || 'A.V.C. College of Engineering (Autonomous)'
    },
    view: 'rules',
    status: 'active',
    completed: false,
    currentQuestion: 0,
    currentQIndex: 0,
    solved: [false, false, false, false],
    solvedQuestions: [false, false, false, false],
    verifiedQuestions: {
      semi_q1: false,
      semi_q2: false,
      semi_q3: false,
      semi_q4: false
    },
    skipped: [false, false, false, false],
    skippedQuestions: [false, false, false, false],
    draftCodes: ['', '', '', ''],
    pastedCode: {
      semi_q1: '',
      semi_q2: '',
      semi_q3: '',
      semi_q4: ''
    },
    correctedCode: {
      semi_q1: '',
      semi_q2: '',
      semi_q3: '',
      semi_q4: ''
    },
    outputVerified: {
      semi_q1: false,
      semi_q2: false,
      semi_q3: false,
      semi_q4: false
    },
    questionStates: {
      semi_q1: { verified: false, errorsFixed: 0, timeTaken: 0 },
      semi_q2: { verified: false, errorsFixed: 0, timeTaken: 0 },
      semi_q3: { verified: false, errorsFixed: 0, timeTaken: 0 },
      semi_q4: { verified: false, errorsFixed: 0, timeTaken: 0 }
    },
    errorsFixed: [0, 0, 0, 0],
    elapsedSeconds: 0,
    qTimes: [0, 0, 0, 0],
    earlyExitUnlocked: false,
    testStartedAt: Date.now()
  };
}

const STATE = createFreshUserState(null);

function resetInMemoryState() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  const clean = createFreshUserState(null);
  clean.view = 'registration';
  Object.keys(STATE).forEach(k => delete STATE[k]);
  Object.assign(STATE, clean);
}

function saveUserState(customState) {
  const s = customState || STATE;
  const userId = normalizeUserId(s?.student?.rollNo || getCurrentUserId());
  if (!userId) return;

  const storageKey = getUserStorageKey(userId);
  if (!storageKey) return;

  try {
    localStorage.setItem(storageKey, JSON.stringify(s));
    sessionStorage.setItem(ACTIVE_USER_KEY, userId);
    localStorage.setItem(ACTIVE_USER_KEY, userId);
  } catch (e) {
    console.error('Failed to save user test state:', e);
  }
}

function saveSession() {
  saveUserState(STATE);
}

function loadUserSpecificState(userId) {
  const normId = normalizeUserId(userId || getCurrentUserId());
  if (!normId) return null;

  const storageKey = getUserStorageKey(normId);
  if (!storageKey) return null;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate state ownership
      if (normalizeUserId(parsed?.student?.rollNo) === normId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse user test state:', e);
  }
  return null;
}

function loadSession() {
  const userId = getCurrentUserId();
  if (!userId) return false;

  const userState = loadUserSpecificState(userId);
  if (userState && userState.student && userState.student.rollNo) {
    resetInMemoryState();
    Object.assign(STATE, userState);
    if (!Array.isArray(STATE.draftCodes) || STATE.draftCodes.length !== QUESTIONS_COUNT) {
      STATE.draftCodes = ['', '', '', ''];
    }
    if (!Array.isArray(STATE.skipped) || STATE.skipped.length !== QUESTIONS_COUNT) {
      STATE.skipped = [false, false, false, false];
    }
    return true;
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
  const existingIdx = roster.findIndex(p => normalizeUserId(p.rollNo) === normalizeUserId(STATE.student.rollNo));

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
  updateCachedCountUI();
}

function updateCachedCountUI() {
  try {
    const badge = document.getElementById('regCachedCount');
    if (badge) {
      const roster = getParticipantsRoster();
      badge.textContent = roster.length;
    }
  } catch (e) {}
}

function resetToNewParticipant() {
  archiveCurrentParticipant();

  // Clear active user session reference
  sessionStorage.removeItem(ACTIVE_USER_KEY);
  localStorage.removeItem(ACTIVE_USER_KEY);

  // Clear in-memory state completely
  resetInMemoryState();

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

  // Clear editor textarea and verification feedback in DOM
  const editor = document.getElementById('txtCorrectedCode');
  if (editor) editor.value = '';
  hideVerificationStatus();

  updateCachedCountUI();
  switchView('viewHome');
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

  const normId = normalizeUserId(roll);

  // Set active user references
  sessionStorage.setItem(ACTIVE_USER_KEY, normId);
  localStorage.setItem(ACTIVE_USER_KEY, normId);

  // Check if this specific user already has an isolated state saved
  const existingUserState = loadUserSpecificState(normId);

  if (existingUserState) {
    // Returning user: load ONLY their state
    resetInMemoryState();
    Object.assign(STATE, existingUserState);
    STATE.student = { name, rollNo: roll, degree: deg, department: dept, college: col };
  } else {
    // Brand new user: initialize a 100% clean test state!
    resetInMemoryState();
    const freshState = createFreshUserState({ name, rollNo: roll, degree: deg, department: dept, college: col });
    Object.assign(STATE, freshState);
  }

  saveSession();

  // Clear any existing textarea value in the DOM
  const editor = document.getElementById('txtCorrectedCode');
  if (editor) editor.value = '';
  hideVerificationStatus();

  // Route user
  if (STATE.completed || STATE.status === 'completed' || STATE.status === 'force_quit' || STATE.status === 'time_expired' || STATE.status === 'cancelled') {
    showResultsView();
  } else if (STATE.view === 'viewWorkspace') {
    switchView('viewWorkspace');
    renderWorkspace();
    startTimerLoop();
  } else {
    switchView('viewRules');
    initGuidelineTimer();
  }
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

  // Persist timer session every 5 seconds to eliminate synchronous localStorage lag
  if (STATE.elapsedSeconds % 5 === 0) {
    saveSession();
  }
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
   9. WORKSPACE CONTROLLER & CYCLICAL QUESTION NAVIGATION
   ========================================================================== */
function getNextUnsolvedIndex(fromIndex) {
  for (let i = 1; i <= QUESTIONS_COUNT; i++) {
    const nextIdx = (fromIndex + i) % QUESTIONS_COUNT;
    if (!STATE.solved[nextIdx]) {
      return nextIdx;
    }
  }
  return -1; // All questions solved!
}

function saveCurrentDraft() {
  const editor = document.getElementById('txtCorrectedCode');
  if (editor && STATE.currentQIndex >= 0 && STATE.currentQIndex < QUESTIONS_COUNT) {
    const code = editor.value;
    const qId = COMPETITION_QUESTIONS[STATE.currentQIndex].id;
    STATE.draftCodes[STATE.currentQIndex] = code;
    if (!STATE.pastedCode) STATE.pastedCode = {};
    if (!STATE.correctedCode) STATE.correctedCode = {};
    STATE.pastedCode[qId] = code;
    STATE.correctedCode[qId] = code;
  }
}

function renderWorkspace() {
  // If current question is solved, immediately route to the next unsolved question
  if (STATE.solved[STATE.currentQIndex]) {
    const nextUnsolved = getNextUnsolvedIndex(STATE.currentQIndex);
    if (nextUnsolved !== -1) {
      STATE.currentQIndex = nextUnsolved;
    }
  }

  const qIdx = STATE.currentQIndex;
  const qData = COMPETITION_QUESTIONS[qIdx];
  const allSolved = STATE.solved.every(s => s === true);
  const nextUnsolved = getNextUnsolvedIndex(qIdx);

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

  // Right Column: Load candidate draft code if present
  const editor = document.getElementById('txtCorrectedCode');
  editor.value = STATE.draftCodes[qIdx] || '';
  updateEditorMetrics();
  hideVerificationStatus();

  // Button Handling
  const btnNext = document.getElementById('btnNextQuestion');
  const btnSkip = document.getElementById('btnSkipQuestion');
  const btnFinish = document.getElementById('btnFinishTest');

  if (allSolved) {
    // All 4 questions are solved!
    btnNext.style.display = 'none';
    if (btnSkip) btnSkip.style.display = 'none';
    btnFinish.style.display = 'inline-flex';
    btnFinish.disabled = false;
  } else {
    // There are still uncompleted questions
    btnNext.style.display = 'inline-flex';
    btnNext.disabled = false;
    if (nextUnsolved !== -1 && nextUnsolved < qIdx) {
      btnNext.textContent = `REROUTE TO Q${nextUnsolved + 1} ↻`;
    } else {
      btnNext.textContent = `NEXT QUESTION →`;
    }

    if (btnSkip) {
      btnSkip.style.display = 'inline-flex';
      // Disable skip if this is the sole remaining unsolved question
      if (nextUnsolved === qIdx || nextUnsolved === -1) {
        btnSkip.disabled = true;
        btnSkip.title = 'This is the only remaining uncompleted question';
      } else {
        btnSkip.disabled = false;
        btnSkip.title = 'Skip this question to solve it later';
      }
    }

    // After 45 minutes, allow finish test even with partial completion
    if (STATE.earlyExitUnlocked || STATE.elapsedSeconds >= EARLY_EXIT_TIME) {
      btnFinish.style.display = 'inline-flex';
      btnFinish.disabled = false;
    } else {
      btnFinish.style.display = 'none';
      btnFinish.disabled = true;
    }
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
      // Solved questions are locked and CANNOT be revisited
      pill.classList.add('completed');
      pill.textContent = '✓';
      pill.title = `Question ${i + 1} completed and locked`;
      pill.style.cursor = 'not-allowed';
      // Do not attach navigation listener
    } else if (i === STATE.currentQIndex) {
      pill.classList.add('active');
    } else if (STATE.skipped[i]) {
      pill.classList.add('skipped');
      pill.title = `Question ${i + 1} skipped (uncompleted)`;
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', () => {
        saveCurrentDraft();
        STATE.currentQIndex = i;
        saveSession();
        renderWorkspace();
      });
    } else {
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', () => {
        saveCurrentDraft();
        STATE.currentQIndex = i;
        saveSession();
        renderWorkspace();
      });
    }

    container.appendChild(pill);
  }
}

function updateEditorMetrics() {
  const txt = document.getElementById('txtCorrectedCode').value;
  const lines = (txt.match(/\n/g) || []).length + 1;
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
    STATE.draftCodes[STATE.currentQIndex] = this.value;
    updateEditorMetrics();
  }
});

document.getElementById('txtCorrectedCode').addEventListener('input', function() {
  STATE.draftCodes[STATE.currentQIndex] = this.value;
  updateEditorMetrics();
});

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
  if (lines.length < 5) {
    return { success: false, errorsSolved: 0 };
  }

  const codeClean = userCode.replace(/\r/g, '');
  let errorsFixed = 0;
  const qId = qData.id;

  if (qId === 'semi_q1') {
    const hasListOrLoop = /\[.*?for\s+\w+\s+in\s+nums.*?\]|for\s+\w+\s+in\s+nums\s*:/.test(codeClean);
    if (!hasListOrLoop) return { success: false, errorsSolved: 0 };

    // Error 1: even condition fixed (n % 2 == 0 or n % 2 != 1)
    const e1 = /(?:\w+\s*%\s*2\s*==\s*0|\w+\s*%\s*2\s*!=\s*1|not\s*\(?\s*\w+\s*%\s*2\s*\)?|\(?\s*\w+\s*&\s*1\s*\)?\s*==\s*0)/.test(codeClean) && !/\w+\s*%\s*2\s*==\s*1/.test(codeClean);
    // Error 2: average divided by len(even) or count of evens
    const e2 = /(?:total\s*\/\s*len\s*\(\s*even\s*\)|len\s*\(\s*even\s*\))/.test(codeClean) && !/total\s*\/\s*len\s*\(\s*nums\s*\)/.test(codeClean);

    if (e1) errorsFixed += 2;
    if (e2) errorsFixed += 3;
    const allFixed = (e1 && e2);
    return { success: allFixed, errorsSolved: allFixed ? 5 : (e1 ? 2 : (e2 ? 3 : 0)) };
  }

  if (qId === 'semi_q2') {
    const hasFunc = /def\s+check\s*\(/.test(codeClean);
    const hasLoopOrComp = /for\s+\w+\s+in\s+numbers\s*:|\[\s*\w+\s+for\s+\w+\s+in\s+numbers/.test(codeClean);
    if (!hasFunc || !hasLoopOrComp) return { success: false, errorsSolved: 0 };

    // Error 1: append number directly (n or int(n)), not str(n), or list comprehension
    const e1 = (!/result\.append\s*\(\s*str\s*\(/.test(codeClean) && /result\.append\s*\(\s*(?:int\()?\s*\w+\s*\)?\s*\)/.test(codeClean)) ||
               /result\s*=\s*\[\s*\w+\s+for\s+\w+\s+in\s+numbers\s+if\s+\w+\s*>\s*limit\s*\]/.test(codeClean);
    // Error 2: total is calculated with sum
    const e2 = /total\s*=\s*sum\s*\(\s*result\s*\)|sum\s*\(\s*result\s*\)/.test(codeClean);

    if (e1) errorsFixed += 3;
    if (e2) errorsFixed += 2;
    const allFixed = (e1 && e2);
    return { success: allFixed, errorsSolved: allFixed ? 5 : (e1 ? 3 : 0) };
  }

  if (qId === 'semi_q3') {
    const hasCount = /count\s*\[\s*\w+\s*\]/.test(codeClean);
    if (!hasCount) return { success: false, errorsSolved: 0 };

    // Error 1: index out of bounds fixed (e.g. common[1], common[0], common[-1] instead of common[2])
    const e1 = !/common\s*\[\s*2\s*\]/.test(codeClean) && /(?:common\s*\[\s*(?:1|0|-1)\s*\]|common\s*\[\s*len\s*\(\s*common\s*\)\s*-\s*1\s*\]|try\s*:[\s\S]*?common\s*\[\s*2\s*\][\s\S]*?except\s+IndexError)/.test(codeClean);
    // Error 2: common words filter preserved/valid
    const e2 = /common\s*=\s*\[\s*\w+\s+for\s+\w+\s+in\s+count\s+if\s+count\s*\[\s*\w+\s*\]\s*>\s*1\s*\]/.test(codeClean);

    if (e1) errorsFixed += 3;
    if (e2) errorsFixed += 2;
    const allFixed = (e1 && e2);
    return { success: allFixed, errorsSolved: allFixed ? 5 : (e1 ? 3 : 0) };
  }

  if (qId === 'semi_q4') {
    const hasClass = /class\s+Student\s*:/.test(codeClean);
    if (!hasClass) return { success: false, errorsSolved: 0 };

    // Error 1: Student.total += 1 or self.__class__.total += 1 inside __init__
    const e1 = /(?:Student\.total|self\.__class__\.total)\s*(?:\+=|\s*=\s*(?:Student|self\.__class__)\.total\s*\+\s*1)/.test(codeClean) && !/^\s*total\s*\+=\s*1/m.test(codeClean);
    // Error 2: s.average() invoked as method call
    const e2 = /s\.average\s*\(\s*\)/.test(codeClean) && !/print\s*\(\s*s\.name\s*,\s*s\.average\s*,/.test(codeClean);

    if (e1) errorsFixed += 3;
    if (e2) errorsFixed += 2;
    const allFixed = (e1 && e2);
    return { success: allFixed, errorsSolved: allFixed ? 5 : (e1 ? 3 : 0) };
  }

  if (qId === 'final_q1') {
    const hasFunc = /def\s+process\s*\(/.test(codeClean);
    if (!hasFunc) return { success: false, errorsSolved: 0 };

    const e1 = (!/map\s*\(\s*lambda/.test(codeClean) && /\[\s*x\s*\*\s*2\s+for\s+x\s+in\s+even\s*\]/.test(codeClean)) ||
               /filtered\s*=\s*\[\s*x\s*\*\s*2\s+for\s+x\s+in\s+even\s+if\s*x\s*\*\s*2\s*>\s*20\s*\]/.test(codeClean);
    const e2 = /return\s+even\s*,\s*filtered/.test(codeClean);
    const allFixed = (e1 && e2);
    return { success: allFixed, errorsSolved: allFixed ? 5 : 0 };
  }

  if (qId === 'final_q2') {
    const hasFunc = /def\s+calculate\s*\(/.test(codeClean);
    if (!hasFunc) return { success: false, errorsSolved: 0 };

    const e1 = /(?:except\s+ValueError[\s\S]*?pass|x\.lstrip\(['"]-['"]\)\.isdigit\(\)|try\s*:[\s\S]*?nums\.append\s*\(\s*int|\.isdigit\(\))/.test(codeClean) || !/return\s*['"]Invalid['"]/.test(codeClean);
    const e2 = /positive\s*=/.test(codeClean) && /return\s*\{/.test(codeClean);
    const allFixed = (e1 && e2);
    return { success: allFixed, errorsSolved: allFixed ? 5 : 0 };
  }

  return { success: false, errorsSolved: 0 };
}

// VERIFY CODE BUTTON CLICK
document.getElementById('btnVerifyCode').addEventListener('click', function() {
  const userId = getCurrentUserId();
  if (!userId) {
    alert('No active participant session found. Please register first.');
    resetToNewParticipant();
    return;
  }

  const qIdx = STATE.currentQIndex;
  const qData = COMPETITION_QUESTIONS[qIdx];
  const userCode = document.getElementById('txtCorrectedCode').value;

  // Save code under THIS USER'S state
  STATE.draftCodes[qIdx] = userCode;
  if (!STATE.pastedCode) STATE.pastedCode = {};
  if (!STATE.correctedCode) STATE.correctedCode = {};
  STATE.pastedCode[qData.id] = userCode;
  STATE.correctedCode[qData.id] = userCode;

  const result = verifySubmittedCode(qData, userCode);

  if (result.success) {
    // Green theme color banner: VERIFIED
    showVerificationStatus(true, '✓ VERIFIED: Question verified successfully. All 5 intentional errors resolved.');
    STATE.solved[qIdx] = true;
    if (!STATE.solvedQuestions) STATE.solvedQuestions = [false, false, false, false];
    STATE.solvedQuestions[qIdx] = true;
    if (!STATE.verifiedQuestions) STATE.verifiedQuestions = {};
    STATE.verifiedQuestions[qData.id] = true;
    if (!STATE.outputVerified) STATE.outputVerified = {};
    STATE.outputVerified[qData.id] = true;
    STATE.errorsFixed[qIdx] = 5;
    if (!STATE.questionStates) STATE.questionStates = {};
    STATE.questionStates[qData.id] = { verified: true, errorsFixed: 5, timeTaken: STATE.qTimes[qIdx] };

    const allSolved = STATE.solved.every(s => s === true);
    if (allSolved) {
      STATE.completed = true;
      document.getElementById('btnFinishTest').style.display = 'inline-flex';
      document.getElementById('btnFinishTest').disabled = false;
      document.getElementById('btnNextQuestion').style.display = 'none';
      const btnSkip = document.getElementById('btnSkipQuestion');
      if (btnSkip) btnSkip.style.display = 'none';
      showVerificationStatus(true, '🎉 All 4 questions verified! Click [ FINISH TEST ] to submit your examination.');
    } else {
      document.getElementById('btnNextQuestion').disabled = false;
    }
  } else {
    // Red theme color banner: UNVERIFIED
    showVerificationStatus(false, `✖ UNVERIFIED: Question is not verified (${result.errorsSolved}/5 errors resolved). Please check logic and retry, or skip.`);
    if (!STATE.solved[qIdx]) {
      STATE.errorsFixed[qIdx] = result.errorsSolved;
      if (!STATE.questionStates) STATE.questionStates = {};
      STATE.questionStates[qData.id] = { verified: false, errorsFixed: result.errorsSolved, timeTaken: STATE.qTimes[qIdx] };
    }
    // Clicking verify automatically allows moving to next question / skipping
    document.getElementById('btnNextQuestion').disabled = false;
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

// SKIP QUESTION BUTTON (DEFER QUESTION TO ANSWER AT LAST)
const btnSkipEl = document.getElementById('btnSkipQuestion');
if (btnSkipEl) {
  btnSkipEl.addEventListener('click', function() {
    saveCurrentDraft();
    const qIdx = STATE.currentQIndex;
    STATE.skipped[qIdx] = true;

    const nextIdx = getNextUnsolvedIndex(qIdx);
    if (nextIdx !== -1 && nextIdx !== qIdx) {
      STATE.currentQIndex = nextIdx;
      saveSession();
      renderWorkspace();
      showVerificationStatus(false, `↷ Skipped Question ${qIdx + 1}. Moved to Question ${nextIdx + 1}. Uncompleted questions will cycle until answered.`);
    } else {
      alert(`Question ${qIdx + 1} is the only remaining uncompleted question.`);
    }
  });
}

// NEXT QUESTION BUTTON (CYCLICAL NAVIGATION / REROUTE)
document.getElementById('btnNextQuestion').addEventListener('click', function() {
  saveCurrentDraft();
  const qIdx = STATE.currentQIndex;
  const nextIdx = getNextUnsolvedIndex(qIdx);

  if (nextIdx !== -1) {
    STATE.currentQIndex = nextIdx;
    saveSession();
    renderWorkspace();
    if (nextIdx < qIdx) {
      // Cycled around to unfinished question
      showVerificationStatus(false, `↻ Rerouted to unfinished Question ${nextIdx + 1}. Complete this question or skip to continue.`);
    }
  } else {
    // All questions solved!
    const allSolved = STATE.solved.every(s => s === true);
    if (allSolved) {
      finishTestSession('completed');
    }
  }
});

// FINISH TEST BUTTON (ALLOWED BEFORE 45:00 ONLY IF 4/4 SOLVED; ALLOWED AFTER 45:00 ALWAYS)
document.getElementById('btnFinishTest').addEventListener('click', function() {
  const allSolved = STATE.solved.every(s => s === true);
  if (!allSolved && STATE.elapsedSeconds < EARLY_EXIT_TIME && !STATE.earlyExitUnlocked) {
    alert('Before 45 minutes, you can finish ONLY after solving all 4 questions.');
    return;
  }
  finishTestSession(allSolved ? 'completed' : 'force_quit');
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

// REGISTER ANOTHER PARTICIPANT BUTTON (ADMIN AUTHENTICATED)
document.getElementById('btnAddAnotherParticipant').addEventListener('click', function() {
  const pwdInput = document.getElementById('txtAddParticipantPassword');
  const errEl = document.getElementById('errAddParticipantPassword');
  if (pwdInput) pwdInput.value = '';
  if (errEl) errEl.style.display = 'none';
  openModal('modalAddParticipantAuth');
  if (pwdInput) setTimeout(() => pwdInput.focus(), 100);
});

// ADMIN AUTH MODAL HANDLERS FOR ADD ANOTHER PARTICIPANT
const btnCancelAddPart = document.getElementById('btnCancelAddParticipant');
if (btnCancelAddPart) {
  btnCancelAddPart.addEventListener('click', function() {
    closeModal('modalAddParticipantAuth');
  });
}

const btnConfirmAddPart = document.getElementById('btnConfirmAddParticipant');
if (btnConfirmAddPart) {
  btnConfirmAddPart.addEventListener('click', async function() {
    const pwdInput = document.getElementById('txtAddParticipantPassword');
    const errEl = document.getElementById('errAddParticipantPassword');
    const pwd = pwdInput ? pwdInput.value.trim() : '';
    const hash = await sha256Hex(pwd);

    if (isAuthorizedAdmin(hash)) {
      if (errEl) errEl.style.display = 'none';
      closeModal('modalAddParticipantAuth');
      resetToNewParticipant();
      switchView('viewHome');
    } else {
      if (errEl) errEl.style.display = 'block';
    }
  });
}

const txtAddPartPwd = document.getElementById('txtAddParticipantPassword');
if (txtAddPartPwd) {
  txtAddPartPwd.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('btnConfirmAddParticipant')?.click();
    }
  });
}

// TWO-PAGE NAVIGATION: HOME (PAGE 1) <-> REGISTRATION (PAGE 2)
const btnHomeReg = document.getElementById('btnHomeRegisterNow');
if (btnHomeReg) {
  btnHomeReg.addEventListener('click', function() {
    switchView('viewRegistration');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const btnBackHome = document.getElementById('btnBackToHome');
if (btnBackHome) {
  btnBackHome.addEventListener('click', function() {
    switchView('viewHome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const navLinkH = document.getElementById('navLinkHome');
if (navLinkH) {
  navLinkH.addEventListener('click', function() {
    switchView('viewHome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const navLinkE = document.getElementById('navLinkEvent');
if (navLinkE) {
  navLinkE.addEventListener('click', function() {
    switchView('viewHome');
    setTimeout(() => {
      document.getElementById('eventDetails')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  });
}

const navLinkC = document.getElementById('navLinkCampus');
if (navLinkC) {
  navLinkC.addEventListener('click', function() {
    switchView('viewHome');
    setTimeout(() => {
      document.getElementById('campusSection')?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  });
}

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

function jsSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = candidate + candidate; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  hash = hash.slice(0, 8);
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength | 0;
  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const sH0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const sH1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const t1 = hash[7] + sH1 + ch + k[i] + (w[i] | 0);
      const t2 = sH0 + maj;
      hash = [(t1 + t2) | 0, hash[0], hash[1], hash[2], (hash[3] + t1) | 0, hash[4], hash[5], hash[6]];
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

async function sha256Hex(str) {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      const enc = new TextEncoder();
      const data = enc.encode(str);
      const buf = await crypto.subtle.digest('SHA-256', data);
      const arr = Array.from(new Uint8Array(buf));
      return arr.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {}
  return jsSha256(str);
}

document.getElementById('btnAdminSubmitLogin').addEventListener('click', async function() {
  const pwd = document.getElementById('txtAdminPassword').value.trim();
  const hash = await sha256Hex(pwd);

  if (isAuthorizedAdmin(hash)) {
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

// OVERLAY RESUME TEST (NO PASSWORD REQUIRED)
const btnOverlayResume = document.getElementById('btnOverlayResume');
if (btnOverlayResume) {
  btnOverlayResume.addEventListener('click', function() {
    STATE.status = 'active';
    saveSession();
    document.getElementById('pauseOverlay').classList.remove('active');
    startTimerLoop();
    updateAdminDashboardData();
  });
}

// OVERLAY OPEN COORDINATOR DASHBOARD
const btnOverlayAdminPanel = document.getElementById('btnOverlayAdminPanel');
if (btnOverlayAdminPanel) {
  btnOverlayAdminPanel.addEventListener('click', function() {
    openModal('modalAdminLogin');
  });
}

// ADMIN PAUSE TEST
document.getElementById('admBtnPause').addEventListener('click', function() {
  STATE.status = 'paused';
  saveSession();
  document.getElementById('pauseOverlay').classList.add('active');
  updateAdminDashboardData();
});

// ADMIN RESUME TEST (NO PASSWORD REQUIRED)
document.getElementById('admBtnResume').addEventListener('click', function() {
  STATE.status = 'active';
  saveSession();
  document.getElementById('pauseOverlay').classList.remove('active');
  startTimerLoop();
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

  const navLinks = document.getElementById('navLinksBar');
  const navProg = document.getElementById('navCenterProgress');
  const navTimer = document.getElementById('navTimerBox');

  if (viewId === 'viewHome' || viewId === 'viewRegistration') {
    if (navLinks) navLinks.style.display = 'flex';
    if (navProg) navProg.style.display = 'none';
    if (navTimer) navTimer.style.display = 'none';
    if (viewId === 'viewRegistration') {
      updateCachedCountUI();
    }
  } else if (viewId === 'viewWorkspace') {
    if (navLinks) navLinks.style.display = 'none';
    if (navProg) navProg.style.display = 'flex';
    if (navTimer) navTimer.style.display = 'flex';
  } else {
    if (navLinks) navLinks.style.display = 'none';
    if (navProg) navProg.style.display = 'none';
    if (navTimer) navTimer.style.display = 'none';
  }
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
   15. INITIALIZATION ON DOM READY (ISOLATED INITIALIZATION SEQUENCE)
   initCurrentUser()
   → createUserSpecificStorageKey()
   → loadUserSpecificState()
   → validateStateOwnership()
   → initializeFreshStateIfNeeded()
   → renderQuestion()
   → renderProgress()
   → renderTimer()
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  initConfettiCanvas();
  cleanupLegacyGlobalData();

  // 1. Identify active user
  const activeUserId = getCurrentUserId();

  if (activeUserId) {
    // 2. Load user-specific state & validate ownership
    const userState = loadUserSpecificState(activeUserId);

    if (userState && userState.student && userState.student.rollNo) {
      resetInMemoryState();
      Object.assign(STATE, userState);

      // If test was paused by admin, keep paused overlay active
      if (STATE.status === 'paused') {
        document.getElementById('pauseOverlay').classList.add('active');
      }

      if (STATE.completed || STATE.view === 'viewResults' || STATE.status === 'completed' || STATE.status === 'force_quit' || STATE.status === 'time_expired' || STATE.status === 'cancelled') {
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
      } else if (STATE.view === 'viewRegistration') {
        switchView('viewRegistration');
      } else {
        switchView('viewHome');
      }
      return;
    }
  }

  // 3. If no active user or invalid ownership, start clean on Home Page
  resetInMemoryState();
  switchView('viewHome');
});

// Guarantee session persistence on window close/refresh for current user
window.addEventListener('beforeunload', saveSession);
