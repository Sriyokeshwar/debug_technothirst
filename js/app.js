/**
 * APPLICATION CORE & STATE MANAGEMENT
 * Technothirst’26 Python Debugging Championship — AVCCE MCA
 */
const STORAGE_KEY = 'agy_py_competition_v1';
const ROSTER_KEY = 'agy_participants_roster';

const STATE = {
  view: 'registration',
  stage: 'SEMI-FINAL',      // 'SEMI-FINAL' or 'FINAL TEST'
  status: 'active',          // 'active', 'paused', 'force_quit', 'completed', 'cancelled'
  
  // Current candidate info
  student: {
    name: '',
    rollNo: '',
    degree: 'MCA',
    department: 'Computer Applications',
    college: 'A.V.C. College of Engineering (AVCCE)'
  },

  // Semi-final state
  semi: {
    currentQIndex: 0,
    solved: [false, false, false, false],
    errorsFixed: [0, 0, 0, 0],
    elapsedSeconds: 0,       // 0 to 3600 (60 min)
    qTimes: [0, 0, 0, 0],     // seconds spent per question
    lastTickTimestamp: null,
    earlyExitUnlocked: false,
    userDismissed45Prompt: false
  },

  // Final test state
  final: {
    activated: false,
    started: false,
    currentQIndex: 0,
    solved: [false, false],
    errorsFixed: [0, 0],
    elapsedSeconds: 0,       // 0 to 600 (10 min)
    qTimes: [0, 0],
    lastTickTimestamp: null
  }
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
  } catch (e) {
    console.error('Failed to persist state:', e);
  }
}

function loadState() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      Object.assign(STATE, parsed);
      return true;
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
  }
  return false;
}

/* ==========================================================================
   PARTICIPANTS CACHE ROSTER (MULTI-PARTICIPANT STORAGE)
   ========================================================================== */
function getParticipantsRoster() {
  const data = localStorage.getItem(ROSTER_KEY);
  if (data) {
    try { return JSON.parse(data); } catch(e) {}
  }
  return [];
}

function saveParticipantsRoster(roster) {
  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
  } catch(e) {}
}

function archiveCurrentParticipant() {
  if (!STATE.student || !STATE.student.name) return;

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
    stage: STATE.stage,
    status: STATE.status,
    semiQuestions: STATE.semi.solved.filter(s => s).length,
    semiErrors: STATE.semi.errorsFixed.reduce((a, b) => a + b, 0),
    semiTime: STATE.semi.elapsedSeconds,
    finalQuestions: STATE.final.started ? STATE.final.solved.filter(s => s).length : null,
    finalErrors: STATE.final.started ? STATE.final.errorsFixed.reduce((a, b) => a + b, 0) : null,
    finalTime: STATE.final.started ? STATE.final.elapsedSeconds : null
  };

  if (existingIdx >= 0) {
    roster[existingIdx] = entry;
  } else {
    roster.push(entry);
  }

  saveParticipantsRoster(roster);
}

function resetToNewParticipant() {
  // Archive current first
  archiveCurrentParticipant();

  // Reset state cleanly
  STATE.view = 'registration';
  STATE.stage = 'SEMI-FINAL';
  STATE.status = 'active';
  STATE.student = {
    name: '',
    rollNo: '',
    degree: 'MCA',
    department: 'Computer Applications',
    college: 'A.V.C. College of Engineering (AVCCE)'
  };
  STATE.semi = {
    currentQIndex: 0,
    solved: [false, false, false, false],
    errorsFixed: [0, 0, 0, 0],
    elapsedSeconds: 0,
    qTimes: [0, 0, 0, 0],
    lastTickTimestamp: null,
    earlyExitUnlocked: false,
    userDismissed45Prompt: false
  };
  STATE.final = {
    activated: false,
    started: false,
    currentQIndex: 0,
    solved: [false, false],
    errorsFixed: [0, 0],
    elapsedSeconds: 0,
    qTimes: [0, 0],
    lastTickTimestamp: null
  };

  saveState();

  // Clear inputs
  document.getElementById('regStudentName').value = '';
  document.getElementById('regRollNo').value = '';
  document.getElementById('regDegree').value = 'MCA';
  document.getElementById('regDepartment').value = 'Computer Applications';
  document.getElementById('regCollege').value = 'A.V.C. College of Engineering (AVCCE)';
  document.getElementById('chkGuidelines').checked = false;
  document.getElementById('btnStartDebug').disabled = true;

  switchView('viewRegistration');
}

/* ==========================================================================
   ACCORDION & GUIDELINE 15-SECOND LOCK
   ========================================================================== */
function toggleAccordion(headerEl) {
  const card = headerEl.closest('.acc-card');
  card.classList.toggle('open');
}

let guidelineTimer = null;
let guidelineRemaining = 15;

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

  guidelineRemaining = 15;
  chk.disabled = true;
  btnStart.disabled = true;
  badge.textContent = `Lock: ${guidelineRemaining}s remaining`;
  badge.classList.remove('unlocked');

  if (guidelineTimer) clearInterval(guidelineTimer);

  guidelineTimer = setInterval(() => {
    guidelineRemaining--;
    if (guidelineRemaining > 0) {
      badge.textContent = `Lock: ${guidelineRemaining}s remaining`;
    } else {
      clearInterval(guidelineTimer);
      guidelineTimer = null;
      badge.textContent = '✓ Guidelines Unlocked';
      badge.classList.add('unlocked');
      chk.disabled = false;
    }
  }, 1000);
}

/* ==========================================================================
   COUNTDOWN ANIMATION (3 -> 2 -> 1 -> GO)
   ========================================================================== */
function run321Countdown(onComplete) {
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
   SYNTAX HIGHLIGHTING (PURE VANILLA JS)
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
   TIMER STATE MACHINE (60M SEMI & 10M FINAL)
   ========================================================================== */
let timerInterval = null;

function startTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(timerTick, 1000);
}

function timerTick() {
  if (STATE.status === 'paused' || STATE.status === 'completed' || STATE.status === 'cancelled' || STATE.status === 'force_quit') {
    return;
  }

  if (STATE.stage === 'SEMI-FINAL') {
    STATE.semi.elapsedSeconds++;
    const currentQ = STATE.semi.currentQIndex;
    if (currentQ >= 0 && currentQ < 4 && !STATE.semi.solved[currentQ]) {
      STATE.semi.qTimes[currentQ]++;
    }

    const totalAllowed = 3600; // 60 minutes
    const elapsed = STATE.semi.elapsedSeconds;
    const remaining = Math.max(0, totalAllowed - elapsed);

    updateTimerDisplay(remaining, 3600);

    // 45 Minutes Reached (2700s)
    if (elapsed >= 2700 && !STATE.semi.earlyExitUnlocked) {
      STATE.semi.earlyExitUnlocked = true;
      document.getElementById('wsEarlyExitStatus').textContent = 'Early exit unlocked';
      document.getElementById('wsEarlyExitStatus').style.color = '#10B981';

      const allSolved = STATE.semi.solved.every(s => s === true);
      if (!allSolved && !STATE.semi.userDismissed45Prompt) {
        openModal('modal45MinPrompt');
        STATE.semi.userDismissed45Prompt = true;
      }
    }

    // 60 Minutes Reached (3600s)
    if (elapsed >= 3600) {
      clearInterval(timerInterval);
      STATE.status = 'completed';
      saveState();
      alert('Time expired for Semi-Final (60:00). Auto-submitting.');
      finishSemiFinal('Time Expired');
      return;
    }

    saveState();
  } 
  else if (STATE.stage === 'FINAL TEST') {
    STATE.final.elapsedSeconds++;
    const currentQ = STATE.final.currentQIndex;
    if (currentQ >= 0 && currentQ < 2 && !STATE.final.solved[currentQ]) {
      STATE.final.qTimes[currentQ]++;
    }

    const totalAllowed = 600; // 10 minutes
    const elapsed = STATE.final.elapsedSeconds;
    const remaining = Math.max(0, totalAllowed - elapsed);

    updateTimerDisplay(remaining, 600);

    if (elapsed >= 600) {
      clearInterval(timerInterval);
      STATE.status = 'completed';
      saveState();
      alert('Final Test time expired (10:00). Auto-submitting.');
      finishFinalTest('Time Expired');
      return;
    }

    saveState();
  }
}

function updateTimerDisplay(remainingSec, totalSec) {
  const timerBox = document.getElementById('navTimerBox');
  const display = document.getElementById('timerDisplay');
  
  const mins = Math.floor(remainingSec / 60);
  const secs = remainingSec % 60;
  display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (remainingSec <= 300) {
    timerBox.classList.remove('warning');
    timerBox.classList.add('critical');
    display.classList.add('critical');
  } else if (remainingSec <= 600) {
    timerBox.classList.add('warning');
    timerBox.classList.remove('critical');
    display.classList.remove('critical');
  } else {
    timerBox.classList.remove('warning', 'critical');
    display.classList.remove('critical');
  }
}

/* ==========================================================================
   STREAMLINED TWO-COLUMN WORKSPACE CONTROLLER
   LEFT: 2-Line Question + Buggy Code (with Copy Button)
   RIGHT: Paste Area + Verification Feedback (Green/Red) + Next Question
   ========================================================================== */
function renderWorkspace() {
  const isFinal = (STATE.stage === 'FINAL TEST');
  const questionsList = isFinal ? COMPETITION_QUESTIONS.final : COMPETITION_QUESTIONS.semi;
  const qIndex = isFinal ? STATE.final.currentQIndex : STATE.semi.currentQIndex;
  const qData = questionsList[qIndex];

  // Update Nav
  document.getElementById('navStageText').textContent = STATE.stage;
  const navBadge = document.getElementById('navStageBadge');
  if (isFinal) {
    navBadge.classList.add('final');
  } else {
    navBadge.classList.remove('final');
  }

  renderStepPills(isFinal ? 2 : 4, qIndex, isFinal ? STATE.final.solved : STATE.semi.solved);
  document.getElementById('navCenterProgress').style.display = 'flex';
  document.getElementById('navTimerBox').style.display = 'flex';

  // Status Bar
  document.getElementById('wsStageBadge').textContent = STATE.stage;
  document.getElementById('wsQuestionNum').textContent = `QUESTION ${qData.number} / ${qData.total}`;
  document.getElementById('wsDifficulty').textContent = qData.difficulty;
  if (qData.difficulty.includes('HARD')) {
    document.getElementById('wsDifficulty').classList.add('hard');
  } else {
    document.getElementById('wsDifficulty').classList.remove('hard');
  }

  document.getElementById('wsCandidateName').textContent = `Candidate: ${STATE.student.name || '--'}`;

  // Early Exit text
  if (!isFinal) {
    if (STATE.semi.earlyExitUnlocked) {
      document.getElementById('wsEarlyExitStatus').textContent = 'Early exit unlocked';
      document.getElementById('wsEarlyExitStatus').style.color = '#10B981';
    } else {
      document.getElementById('wsEarlyExitStatus').textContent = 'Early exit unlocks at 45:00';
      document.getElementById('wsEarlyExitStatus').style.color = 'var(--secondary-color)';
    }
  } else {
    document.getElementById('wsEarlyExitStatus').textContent = 'Final Stage (10m Limit)';
  }

  // LEFT COLUMN: 2-line prompt + Buggy code
  document.getElementById('specTitle').textContent = `Q${qData.number}: ${qData.title}`;
  document.getElementById('specShortPrompt').textContent = qData.shortPrompt;
  document.getElementById('codeViewerBody').innerHTML = highlightPythonSyntax(qData.buggyCode);

  const btnCopy = document.getElementById('btnCopyCode');
  btnCopy.textContent = 'COPY CODE';
  btnCopy.classList.remove('copied');

  // RIGHT COLUMN: Clean Paste Area
  const editor = document.getElementById('txtCorrectedCode');
  editor.value = '';
  updateEditorMetrics();

  // Reset Verification Status Banner
  hideVerificationStatus();

  // Next Question starts disabled until Verify is clicked
  const btnNext = document.getElementById('btnNextQuestion');
  btnNext.disabled = true;

  const totalQ = isFinal ? 2 : 4;
  if (qIndex === totalQ - 1) {
    btnNext.style.display = 'none';
    document.getElementById('btnFinishTest').style.display = 'inline-flex';
    document.getElementById('btnFinishTest').disabled = true; // Enabled once verified or skipped
  } else {
    btnNext.style.display = 'inline-flex';
    document.getElementById('btnFinishTest').style.display = 'none';
  }
}

function renderStepPills(total, activeIdx, solvedArr) {
  const container = document.getElementById('qStepPills');
  container.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const pill = document.createElement('div');
    pill.className = 'q-step-pill';
    pill.textContent = `Q${i + 1}`;
    if (solvedArr[i]) {
      pill.classList.add('completed');
      pill.textContent = `✓`;
    } else if (i === activeIdx) {
      pill.classList.add('active');
    } else {
      pill.classList.add('locked');
    }
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

/* COPY BUTTON */
document.getElementById('btnCopyCode').addEventListener('click', function() {
  const isFinal = (STATE.stage === 'FINAL TEST');
  const questionsList = isFinal ? COMPETITION_QUESTIONS.final : COMPETITION_QUESTIONS.semi;
  const qIndex = isFinal ? STATE.final.currentQIndex : STATE.semi.currentQIndex;
  const qData = questionsList[qIndex];

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

/* VERIFICATION WITH GREEN/RED BANNER & AUTOMATIC NEXT BUTTON ENABLING */
document.getElementById('btnVerifyCode').addEventListener('click', function() {
  const isFinal = (STATE.stage === 'FINAL TEST');
  const questionsList = isFinal ? COMPETITION_QUESTIONS.final : COMPETITION_QUESTIONS.semi;
  const qIndex = isFinal ? STATE.final.currentQIndex : STATE.semi.currentQIndex;
  const qData = questionsList[qIndex];
  const userCode = document.getElementById('txtCorrectedCode').value;

  const result = verifySubmittedCode(qData, userCode);

  if (result.success) {
    // Green theme color banner
    showVerificationStatus(true, '✓ Question verified successfully. All intentional errors resolved.');
    if (isFinal) {
      STATE.final.solved[qIndex] = true;
      STATE.final.errorsFixed[qIndex] = 5;
    } else {
      STATE.semi.solved[qIndex] = true;
      STATE.semi.errorsFixed[qIndex] = 5;
    }
  } else {
    // Red theme color banner
    showVerificationStatus(false, '✖ Question is not verified. Please check logic or review requirements.');
    if (isFinal) {
      STATE.final.errorsFixed[qIndex] = result.errorsSolved;
    } else {
      STATE.semi.errorsFixed[qIndex] = result.errorsSolved;
    }
  }
  saveState();

  // Update pills
  renderStepPills(isFinal ? 2 : 4, qIndex, isFinal ? STATE.final.solved : STATE.semi.solved);

  // CRITICAL REQUIREMENT:
  // "Even though the question is verify or not verify, once clicked the verify button, automatically enable the next question moving button."
  document.getElementById('btnNextQuestion').disabled = false;
  document.getElementById('btnFinishTest').disabled = false;
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

/* SKIP QUESTION BUTTON */
document.getElementById('btnSkipQuestion').addEventListener('click', function() {
  const isFinal = (STATE.stage === 'FINAL TEST');
  const totalQ = isFinal ? 2 : 4;
  const qIndex = isFinal ? STATE.final.currentQIndex : STATE.semi.currentQIndex;

  if (confirm('Do you want to skip this question? You will move to the next question.')) {
    if (qIndex < totalQ - 1) {
      if (isFinal) STATE.final.currentQIndex++;
      else STATE.semi.currentQIndex++;
      saveState();
      renderWorkspace();
    } else {
      if (isFinal) finishFinalTest('Completed');
      else finishSemiFinal('Completed');
    }
  }
});

/* NEXT QUESTION NAVIGATION */
document.getElementById('btnNextQuestion').addEventListener('click', function() {
  const isFinal = (STATE.stage === 'FINAL TEST');
  if (isFinal) {
    STATE.final.currentQIndex++;
  } else {
    STATE.semi.currentQIndex++;
  }
  saveState();
  renderWorkspace();
});

/* FINISH TEST */
document.getElementById('btnFinishTest').addEventListener('click', function() {
  const isFinal = (STATE.stage === 'FINAL TEST');
  if (isFinal) {
    finishFinalTest('Completed');
  } else {
    finishSemiFinal('Completed');
  }
});

/* FORCE QUIT BUTTON */
document.getElementById('btnForceQuit').addEventListener('click', function() {
  if (confirm('Are you sure you want to Force Quit? Your current progress will be submitted.')) {
    finishSemiFinal('Force Quit');
  }
});

document.getElementById('btnPromptForceQuit').addEventListener('click', function() {
  closeModal('modal45MinPrompt');
  finishSemiFinal('Force Quit');
});

document.getElementById('btnPromptContinue').addEventListener('click', function() {
  closeModal('modal45MinPrompt');
});

/* ==========================================================================
   STAGE COMPLETION & RESULTS
   ========================================================================== */
function finishSemiFinal(statusDesc) {
  STATE.status = (statusDesc === 'Force Quit') ? 'force_quit' : 'completed';
  archiveCurrentParticipant();
  saveState();
  triggerConfetti();
  showResultsView();
}

function finishFinalTest(statusDesc) {
  STATE.status = 'completed';
  archiveCurrentParticipant();
  saveState();
  triggerConfetti();
  showResultsView();
}

function showResultsView() {
  switchView('viewResults');
  
  document.getElementById('navCenterProgress').style.display = 'none';
  document.getElementById('navTimerBox').style.display = 'none';
  document.getElementById('navStageText').textContent = 'Audit Results';

  document.getElementById('resCandName').textContent = STATE.student.name || '--';
  document.getElementById('resCandRoll').textContent = STATE.student.rollNo || '--';
  document.getElementById('resCandDegree').textContent = STATE.student.degree || '--';
  document.getElementById('resCandDept').textContent = STATE.student.department || '--';
  document.getElementById('resCandCollege').textContent = STATE.student.college || '--';

  const semiSolvedCount = STATE.semi.solved.filter(s => s).length;
  const semiErrorsFixed = STATE.semi.errorsFixed.reduce((a, b) => a + b, 0);
  const semiMins = Math.floor(STATE.semi.elapsedSeconds / 60);
  const semiSecs = STATE.semi.elapsedSeconds % 60;

  document.getElementById('resSemiQuestions').textContent = `${semiSolvedCount} / 4`;
  document.getElementById('resSemiErrors').textContent = `${semiErrorsFixed} / 20`;
  document.getElementById('resSemiTime').textContent = `${semiMins} min ${semiSecs} sec`;
  document.getElementById('resSemiStatus').textContent = (STATE.status === 'force_quit') ? 'Force Quit' : 'Completed';
  
  const badge = document.getElementById('resSemiBadge');
  badge.textContent = (STATE.status === 'force_quit') ? 'Force Quit' : 'Completed';
  badge.className = `score-badge ${STATE.status === 'force_quit' ? 'warning' : 'success'}`;

  const finalCard = document.getElementById('cardFinalResult');
  if (STATE.final.activated) {
    finalCard.style.opacity = '1';
    if (STATE.final.started) {
      const finalSolvedCount = STATE.final.solved.filter(s => s).length;
      const finalErrorsFixed = STATE.final.errorsFixed.reduce((a, b) => a + b, 0);
      const finalMins = Math.floor(STATE.final.elapsedSeconds / 60);
      const finalSecs = STATE.final.elapsedSeconds % 60;

      document.getElementById('resFinalQuestions').textContent = `${finalSolvedCount} / 2`;
      document.getElementById('resFinalErrors').textContent = `${finalErrorsFixed} / 10`;
      document.getElementById('resFinalTime').textContent = `${finalMins} min ${finalSecs} sec`;
      document.getElementById('resFinalStatus').textContent = 'Completed';
      document.getElementById('resFinalBadge').textContent = 'Finished';
      document.getElementById('resFinalBadge').className = 'score-badge success';
    } else {
      document.getElementById('resFinalBadge').textContent = 'Ready';
      document.getElementById('resFinalBadge').className = 'score-badge warning';
      document.getElementById('resFinalStatus').textContent = 'Activated by Coordinator';
      document.getElementById('finalReadyBanner').style.display = 'block';
    }
  } else {
    finalCard.style.opacity = '0.55';
    document.getElementById('finalReadyBanner').style.display = 'none';
  }

  // Timing Table
  const tbody = document.getElementById('resTimingTableBody');
  tbody.innerHTML = '';

  COMPETITION_QUESTIONS.semi.forEach((q, idx) => {
    const solved = STATE.semi.solved[idx];
    const timeSec = STATE.semi.qTimes[idx];
    const m = Math.floor(timeSec / 60);
    const s = timeSec % 60;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>Q${idx + 1}:</strong> ${q.title}</td>
      <td>${q.difficulty}</td>
      <td><span class="score-badge ${solved ? 'success' : 'warning'}">${solved ? 'Solved' : 'Unsolved'}</span></td>
      <td>${m}m ${s}s</td>
    `;
    tbody.appendChild(tr);
  });

  if (STATE.final.started) {
    COMPETITION_QUESTIONS.final.forEach((q, idx) => {
      const solved = STATE.final.solved[idx];
      const timeSec = STATE.final.qTimes[idx];
      const m = Math.floor(timeSec / 60);
      const s = timeSec % 60;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>FINAL Q${idx + 1}:</strong> ${q.title}</td>
        <td>${q.difficulty}</td>
        <td><span class="score-badge ${solved ? 'success' : 'warning'}">${solved ? 'Solved' : 'Unsolved'}</span></td>
        <td>${m}m ${s}s</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

/* ADD ANOTHER PARTICIPANT BUTTON (ON RESULTS PAGE) */
document.getElementById('btnAddAnotherParticipant').addEventListener('click', function() {
  if (confirm('Archive current participant and register a new student for the competition?')) {
    resetToNewParticipant();
  }
});

/* ENTER FINAL TEST BUTTON */
document.getElementById('btnEnterFinalTest').addEventListener('click', function() {
  STATE.stage = 'FINAL TEST';
  STATE.final.started = true;
  STATE.final.currentQIndex = 0;
  STATE.status = 'active';
  saveState();
  document.getElementById('finalReadyBanner').style.display = 'none';
  switchView('viewWorkspace');
  renderWorkspace();
});

/* ==========================================================================
   AUDIT TXT & PRINT
   ========================================================================== */
document.getElementById('btnDownloadTxt').addEventListener('click', function() {
  const semiSolvedCount = STATE.semi.solved.filter(s => s).length;
  const semiErrorsFixed = STATE.semi.errorsFixed.reduce((a, b) => a + b, 0);
  const semiMins = Math.floor(STATE.semi.elapsedSeconds / 60);
  const semiSecs = STATE.semi.elapsedSeconds % 60;

  let txt = `=============================================================
A.V.C. COLLEGE OF ENGINEERING (AUTONOMOUS)
DEPARTMENT OF COMPUTER APPLICATIONS (MCA)
TECHNOTHIRST’26 PYTHON DEBUGGING CHAMPIONSHIP AUDIT
=============================================================

CANDIDATE CREDENTIALS:
Name:            ${STATE.student.name}
Register Number: ${STATE.student.rollNo}
Degree:          ${STATE.student.degree}
Department:      ${STATE.student.department}
College:         ${STATE.student.college}

-------------------------------------------------------------
STAGE 1: SEMI-FINAL PERFORMANCE
-------------------------------------------------------------
Status:           ${STATE.status.toUpperCase()}
Questions Solved: ${semiSolvedCount} / 4
Errors Solved:    ${semiErrorsFixed} / 20
Total Time Taken: ${semiMins} min ${semiSecs} sec

QUESTION BREAKDOWN:
`;

  COMPETITION_QUESTIONS.semi.forEach((q, i) => {
    const timeSec = STATE.semi.qTimes[i];
    const m = Math.floor(timeSec / 60);
    const s = timeSec % 60;
    txt += `Q${i + 1} [${q.title}]: ${STATE.semi.solved[i] ? 'SOLVED' : 'UNSOLVED'} in ${m}m ${s}s\n`;
  });

  if (STATE.final.started) {
    const finalSolvedCount = STATE.final.solved.filter(s => s).length;
    const finalErrorsFixed = STATE.final.errorsFixed.reduce((a, b) => a + b, 0);
    const finalMins = Math.floor(STATE.final.elapsedSeconds / 60);
    const finalSecs = STATE.final.elapsedSeconds % 60;

    txt += `\n-------------------------------------------------------------
STAGE 2: FINAL TEST PERFORMANCE
-------------------------------------------------------------
Questions Solved: ${finalSolvedCount} / 2
Errors Solved:    ${finalErrorsFixed} / 10
Final Duration:   ${finalMins} min ${finalSecs} sec

FINAL QUESTION BREAKDOWN:
`;
    COMPETITION_QUESTIONS.final.forEach((q, i) => {
      const timeSec = STATE.final.qTimes[i];
      const m = Math.floor(timeSec / 60);
      const s = timeSec % 60;
      txt += `FINAL Q${i + 1} [${q.title}]: ${STATE.final.solved[i] ? 'SOLVED' : 'UNSOLVED'} in ${m}m ${s}s\n`;
    });
  }

  txt += `\n=============================================================
Audit Generated Off-line at: ${new Date().toLocaleString()}
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

document.getElementById('btnPrintPdf').addEventListener('click', function() {
  window.print();
});

/* ==========================================================================
   ADMIN CONTROLS & PARTICIPANTS ROSTER ARCHIVE
   ========================================================================== */
document.getElementById('btnAdminOpen').addEventListener('click', function() {
  openModal('modalAdminLogin');
  document.getElementById('txtAdminPassword').value = '';
  document.getElementById('errAdminPassword').style.display = 'none';
});

document.getElementById('btnAdminSubmitLogin').addEventListener('click', async function() {
  const pwd = document.getElementById('txtAdminPassword').value;
  const isValid = await verifyAdminCredentials(pwd);

  if (isValid) {
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
  
  const isFinal = (STATE.stage === 'FINAL TEST');
  const qNum = isFinal ? (STATE.final.currentQIndex + 1) : (STATE.semi.currentQIndex + 1);
  const totalQ = isFinal ? 2 : 4;
  document.getElementById('admQuestion').textContent = `${STATE.stage} Q${qNum}/${totalQ}`;

  const remaining = isFinal ? Math.max(0, 600 - STATE.final.elapsedSeconds) : Math.max(0, 3600 - STATE.semi.elapsedSeconds);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  document.getElementById('admTimeLeft').textContent = `${m}m ${s}s`;

  const solvedCount = isFinal ? STATE.final.solved.filter(s => s).length : STATE.semi.solved.filter(s => s).length;
  document.getElementById('admQuestionsSolved').textContent = `${solvedCount} / ${totalQ}`;

  if (STATE.status === 'paused') {
    document.getElementById('admBtnPause').style.display = 'none';
    document.getElementById('admBtnResume').style.display = 'inline-flex';
  } else {
    document.getElementById('admBtnPause').style.display = 'inline-flex';
    document.getElementById('admBtnResume').style.display = 'none';
  }

  const btnActFinal = document.getElementById('admBtnActivateFinal');
  if (STATE.final.activated) {
    btnActFinal.textContent = '✓ FINAL ACTIVATED';
    btnActFinal.disabled = true;
  } else {
    btnActFinal.textContent = '⚡ ACTIVATE FINAL TEST';
    btnActFinal.disabled = false;
  }
}

function renderAdminRoster() {
  const roster = getParticipantsRoster();
  const tbody = document.getElementById('admRosterTableBody');
  tbody.innerHTML = '';

  if (roster.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 14px;">No completed candidate records yet.</td></tr>';
    return;
  }

  roster.forEach(p => {
    const tr = document.createElement('tr');
    const m = Math.floor(p.semiTime / 60);
    const s = p.semiTime % 60;
    tr.innerHTML = `
      <td><strong>${p.rollNo}</strong></td>
      <td>${p.name}</td>
      <td>${p.degree}</td>
      <td>${p.semiQuestions} / 4</td>
      <td>${p.semiErrors} / 20</td>
      <td>${m}m ${s}s</td>
      <td><span class="score-badge ${p.status === 'completed' ? 'success' : 'warning'}">${p.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('admBtnPause').addEventListener('click', function() {
  STATE.status = 'paused';
  saveState();
  document.getElementById('pauseOverlay').classList.add('active');
  updateAdminDashboardData();
});

document.getElementById('admBtnResume').addEventListener('click', function() {
  STATE.status = 'active';
  saveState();
  document.getElementById('pauseOverlay').classList.remove('active');
  updateAdminDashboardData();
});

document.getElementById('admBtnForceFinish').addEventListener('click', function() {
  if (confirm('Force finish this participant? Current scores will be submitted.')) {
    closeModal('modalAdminDashboard');
    if (STATE.stage === 'FINAL TEST') {
      finishFinalTest('Force Finished');
    } else {
      finishSemiFinal('Force Finished');
    }
  }
});

document.getElementById('admBtnActivateFinal').addEventListener('click', function() {
  STATE.final.activated = true;
  saveState();
  updateAdminDashboardData();
  alert('Final Test activated for candidate.');
  if (STATE.view === 'viewResults') {
    document.getElementById('cardFinalResult').style.opacity = '1';
    document.getElementById('finalReadyBanner').style.display = 'block';
  }
});

document.getElementById('admBtnCancel').addEventListener('click', function() {
  if (confirm('Cancel candidate test? Data will be preserved.')) {
    STATE.status = 'cancelled';
    archiveCurrentParticipant();
    saveState();
    closeModal('modalAdminDashboard');
    showResultsView();
  }
});

document.getElementById('admBtnNewParticipant').addEventListener('click', function() {
  if (confirm('Reset system for a new participant? Current participant data will be cached in the roster.')) {
    closeModal('modalAdminDashboard');
    resetToNewParticipant();
  }
});

document.getElementById('admBtnClearRoster').addEventListener('click', function() {
  if (confirm('Are you sure you want to clear the saved participant roster cache? This cannot be undone.')) {
    saveParticipantsRoster([]);
    renderAdminRoster();
  }
});

document.getElementById('admBtnExportAllCsv').addEventListener('click', function() {
  const roster = getParticipantsRoster();
  if (roster.length === 0) {
    alert('No participant records to export.');
    return;
  }

  let csv = 'RollNo,Name,Degree,Department,College,Stage,SemiQuestions,SemiErrors,SemiTimeSeconds,FinalQuestions,FinalErrors,Status,Timestamp\n';
  roster.forEach(p => {
    csv += `"${p.rollNo}","${p.name}","${p.degree}","${p.department}","${p.college}","${p.stage}",${p.semiQuestions},${p.semiErrors},${p.semiTime},${p.finalQuestions || 0},${p.finalErrors || 0},"${p.status}","${p.timestamp}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Technothirst26_Participants_Roster.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

/* ==========================================================================
   MODAL CONTROLLER & VIEW SWITCHER
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
  saveState();
}

/* ==========================================================================
   REGISTRATION FORM SUBMIT
   ========================================================================== */
document.getElementById('formRegistration').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('regStudentName').value.trim();
  const roll = document.getElementById('regRollNo').value.trim();
  const deg = document.getElementById('regDegree').value;
  const dept = document.getElementById('regDepartment').value.trim();
  const col = document.getElementById('regCollege').value.trim();

  let valid = true;
  if (!name) { document.getElementById('errStudentName').style.display = 'block'; valid = false; }
  else document.getElementById('errStudentName').style.display = 'none';

  if (!roll) { document.getElementById('errRollNo').style.display = 'block'; valid = false; }
  else document.getElementById('errRollNo').style.display = 'none';

  if (!deg) { document.getElementById('errDegree').style.display = 'block'; valid = false; }
  else document.getElementById('errDegree').style.display = 'none';

  if (!dept) { document.getElementById('errDepartment').style.display = 'block'; valid = false; }
  else document.getElementById('errDepartment').style.display = 'none';

  if (!col) { document.getElementById('errCollege').style.display = 'block'; valid = false; }
  else document.getElementById('errCollege').style.display = 'none';

  if (!valid) return;

  STATE.student = { name, rollNo: roll, degree: deg, department: dept, college: col };
  saveState();

  switchView('viewRules');
  initGuidelineTimer();
});

document.getElementById('chkGuidelines').addEventListener('change', function() {
  document.getElementById('btnStartDebug').disabled = !this.checked;
});

document.getElementById('btnStartDebug').addEventListener('click', function() {
  run321Countdown(() => {
    STATE.stage = 'SEMI-FINAL';
    STATE.status = 'active';
    switchView('viewWorkspace');
    renderWorkspace();
    startTimerLoop();
  });
});

/* ==========================================================================
   INITIALIZATION & RECOVERY ON LOAD
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  initConfettiCanvas();
  const hasSaved = loadState();

  if (hasSaved && STATE.student && STATE.student.name) {
    if (STATE.status === 'paused') {
      document.getElementById('pauseOverlay').classList.add('active');
    }

    if (STATE.view === 'viewResults' || STATE.status === 'completed' || STATE.status === 'cancelled') {
      showResultsView();
    } else if (STATE.view === 'viewWorkspace' && (STATE.status === 'active' || STATE.status === 'paused')) {
      switchView('viewWorkspace');
      renderWorkspace();
      startTimerLoop();
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
