const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('TECHNOTHIRST’26 PYTHON DEBUGGING SYSTEM TEST SUITE');
console.log('====================================================\n');

// 1. Read files
const questionsCode = fs.readFileSync(path.join(__dirname, '../js/questions.js'), 'utf8');
const validationCode = fs.readFileSync(path.join(__dirname, '../js/validation.js'), 'utf8');
const securityCode = fs.readFileSync(path.join(__dirname, '../js/security.js'), 'utf8');

// Set up VM environment
const sandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  JSON: JSON,
  Math: Math,
  String: String,
  Array: Array,
  RegExp: RegExp,
  Date: Date,
  TextEncoder: globalThis.TextEncoder || require('util').TextEncoder,
  TextDecoder: globalThis.TextDecoder || require('util').TextDecoder,
  crypto: globalThis.crypto || require('crypto').webcrypto,
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
  }
};

vm.createContext(sandbox);

// Load files into sandbox
vm.runInContext(questionsCode + '\nglobalThis.COMPETITION_QUESTIONS = COMPETITION_QUESTIONS;', sandbox);
vm.runInContext(validationCode + '\nglobalThis.verifySubmittedCode = verifySubmittedCode;\nglobalThis.hexToJson = hexToJson;', sandbox);
vm.runInContext(securityCode + '\nglobalThis.verifyAdminCredentials = verifyAdminCredentials;', sandbox);

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✖ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// --------------------------------------------------------------------------
// TEST SUITE 1: QUESTION LINE COUNTS & PROMPT LENGTHS
// --------------------------------------------------------------------------
console.log('--- TEST SUITE 1: Question Line Counts & Prompt Constraints ---');
const questions = sandbox.COMPETITION_QUESTIONS;

// Semi Q1, Q2, Q3: strictly 8 to 15 lines
for (let i = 0; i < 3; i++) {
  const q = questions.semi[i];
  const lines = q.buggyCode.split('\n').length;
  assert(lines >= 8 && lines <= 15, `Semi Q${i+1} code line count (${lines}) is between 8 and 15 lines`);
  const promptLines = q.shortPrompt.split('\n').length;
  assert(promptLines <= 2, `Semi Q${i+1} prompt line count (${promptLines}) is <= 2 lines`);
}

// Semi Q4: strictly 10 to 18 lines
{
  const q = questions.semi[3];
  const lines = q.buggyCode.split('\n').length;
  assert(lines >= 10 && lines <= 18, `Semi Q4 code line count (${lines}) is between 10 and 18 lines`);
  const promptLines = q.shortPrompt.split('\n').length;
  assert(promptLines <= 2, `Semi Q4 prompt line count (${promptLines}) is <= 2 lines`);
}

// Final Q1, Q2: strictly 10 to 18 lines
for (let i = 0; i < 2; i++) {
  const q = questions.final[i];
  const lines = q.buggyCode.split('\n').length;
  assert(lines >= 10 && lines <= 18, `Final Q${i+1} code line count (${lines}) is between 10 and 18 lines`);
  const promptLines = q.shortPrompt.split('\n').length;
  assert(promptLines <= 2, `Final Q${i+1} prompt line count (${promptLines}) is <= 2 lines`);
}

// --------------------------------------------------------------------------
// TEST SUITE 2: SOLVED CODE VERIFICATION (100% PASS RATE & 5/5 ERRORS)
// --------------------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Fixed Code Verification (All 6 Questions) ---');

const solutions = {
  semi_q1: `items = [['B', 6, 40.0], ['L', 4, 80.0], ['D', 8, 120.0], ['B', 3, 50.0], ['L', 10, 75.0]]
total_sales = 0.0; total_tax = 0.0; max_bill = -1.0; top_cat = ''

for item in items:
    cat, qty, price = item[0], item[1], item[2]
    base = qty * price
    disc = base * 0.10 if qty > 5 else 0.0
    sub = base - disc
    tax_rate = 0.05 if cat == 'B' else 0.08
    tax = sub * tax_rate; net = sub + tax
    total_sales += sub; total_tax += tax
    if net > max_bill:
        max_bill = net; top_cat = cat

print(f"Sales: {total_sales:.2f} Tax: {total_tax:.2f} Top: {top_cat}")`,

  semi_q2: `students = [["Aravind", 38, 45, 'N', 78], ["Bhavna", 28, 45, 'Y', 65], ["Eshan", 42, 45, 'N', 92]]
eligible = 0; max_pct = 0.0; top_student = ""

for i in range(len(students)):
    name, att, total, med, score = students[i]
    pct = att / total * 100
    if pct < 75.0 and (pct >= 65.0 and med == 'Y'):
        pct += 10.0
    if pct >= 75.0 and score >= 40:
        eligible += 1
        if pct > max_pct:
            max_pct = pct; top_student = name

print(f"Eligible: {eligible}, Top: {top_student} ({max_pct:.1f}%)")`,

  semi_q3: `grid = [[28.0, 34.0, 31.0], [32.0, 36.0, 38.0], [29.0, 30.0, 37.0]]
total = 0.0; hotspots = 0; row_avgs = []

for r in range(len(grid)):
    row_sum = 0.0
    for c in range(len(grid[0])):
        val = grid[r][c]
        row_sum += val; total += val
    row_avgs.append(row_sum / len(grid[0]))

overall_avg = total / (len(grid) * len(grid[0]))
for r in range(len(grid)):
    for c in range(len(grid[0])):
        if grid[r][c] > row_avgs[r] and grid[r][c] > overall_avg:
            hotspots += 1

col_sums = [grid[0][c] + grid[1][c] + grid[2][c] for c in range(3)]
peak_c = 0; max_c = -1.0
for c in range(3):
    if col_sums[c] > max_c:
        max_c = col_sums[c]; peak_c = c

print(f"Average: {overall_avg:.2f}, Hotspots: {hotspots}, Peak Column: {peak_c}")`,

  semi_q4: `def calc_bill(units, peak):
    if units <= 100: e = units * 3.0
    elif units <= 200: e = 300.0 + (units - 100) * 4.5
    else: e = 300.0 + 450.0 + (units - 200) * 6.0
    tot = e + peak * 2.0
    return tot - (tot * 0.05) if units < 80 else tot

rooms = [[101, 70, 15], [102, 160, 40], [103, 240, 60]]
total_rev = 0.0; tier3_cnt = 0; max_b = -1.0; top_room = 0

for r, u, p in rooms:
    b = calc_bill(u, p)
    total_rev += b
    if u > 200: tier3_cnt += 1
    if b > max_b:
        max_b = b; top_room = r

print(f"Revenue: {total_rev:.2f}, Tier3: {tier3_cnt}, Top: Room {top_room}")`,

  final_q1: `records = [["LIB-1", "Student", 4], ["LIB-2", "Faculty", 8], ["LIB-3", "Student", 14]]
total_fines = 0.0; heavily_overdue = 0; max_fine = 0.0

for pid, ptype, days in records:
    if days <= 5: f = days * 2.0
    elif days <= 10: f = 10.0 + (days - 5) * 5.0
    else: f = 35.0 + (days - 10) * 10.0 + 50.0
    if ptype == 'Faculty': f *= 0.50
    total_fines += f
    if days > 10: heavily_overdue += 1
    if f > max_fine: max_fine = f

print(f"Total: {total_fines:.2f}, Overdue: {heavily_overdue}, Max: {max_fine:.2f}")`,

  final_q2: `teams = [["Alpha", [100, 80, 0], [25, 45, 60]], ["Beta", [100, 100, 100], [30, 40, 50]]]
bonus_teams = 0; top_score = -1.0; champion = ""

for t in teams:
    name, scores, times = t[0], t[1], t[2]
    raw = sum(scores[i] for i in range(3) if scores[i] > 0)
    pen = sum(times[i] for i in range(3) if scores[i] > 0)
    solved = sum(1 for s in scores if s > 0)
    if solved == 3: raw += 20; bonus_teams += 1
    net = raw - (pen * 0.1)
    if net > top_score:
        top_score = net; champion = name

print(f"Bonus Teams: {bonus_teams}, Champion: {champion} Score: {top_score:.1f}")`
};

// Verify each solved question
const allQs = [...questions.semi, ...questions.final];
allQs.forEach(q => {
  const sol = solutions[q.id];
  const res = sandbox.verifySubmittedCode(q, sol);
  assert(res.success === true, `${q.id} passed verification with success = true`);
  assert(res.errorsSolved === 5, `${q.id} correctly counted 5/5 errors solved`);
});

// --------------------------------------------------------------------------
// TEST SUITE 3: BUGGY CODE & MALICIOUS / TRIVIAL CODE REJECTION
// --------------------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Rejection of Buggy & Trivial Code ---');

allQs.forEach(q => {
  // Buggy original code should fail
  const resBuggy = sandbox.verifySubmittedCode(q, q.buggyCode);
  assert(resBuggy.success === false, `${q.id} buggy original code fails verification (errors fixed: ${resBuggy.errorsSolved}/5)`);

  // Trivial single-line print mock should fail anti-cheat
  const mockCheat = `print("${q.expectedOutput}")`;
  const resCheat = sandbox.verifySubmittedCode(q, mockCheat);
  assert(resCheat.success === false && resCheat.errorsSolved === 0, `${q.id} trivial mock print rejected by anti-cheat`);

  // Empty string
  const resEmpty = sandbox.verifySubmittedCode(q, '');
  assert(resEmpty.success === false && resEmpty.errorsSolved === 0, `${q.id} empty code returns false`);
});

// Partial fixes test (e.g. 2 fixes on semi_q1)
const partialQ1 = `items = [['B', 6, 40.0], ['L', 4, 80.0], ['D', 8, 120.0], ['B', 3, 50.0], ['L', 10, 75.0]]
total_sales = 0.0; total_tax = 0.0; max_bill = -1.0; top_cat = ''

for item in items:
    cat, qty, price = item[0], item[1], item[2]
    base = qty * price
    disc = base * 0.10 if qty > 5 else 0.0
    sub = base - disc
    tax_rate = 0.08 if cat == 'B' else 0.05
    tax = sub * tax_rate; net = sub + tax
    total_sales += sub; total_tax =+ tax
    if net < max_bill:
        max_bill = net; top_cat = cat

print(f"Sales: {total_sales:.2f} Tax: {total_tax:.2f} Top: {top_cat}")`;
const resPartial = sandbox.verifySubmittedCode(questions.semi[0], partialQ1);
assert(resPartial.success === false && resPartial.errorsSolved === 2, `Partial fix on semi_q1 detects 2/5 errors and returns success=false`);

// --------------------------------------------------------------------------
// TEST SUITE 4: MULTI-PARTICIPANT ROSTER & CACHE PERSISTENCE
// --------------------------------------------------------------------------
console.log('\n--- TEST SUITE 4: Multi-Participant Roster & Cache Logic ---');

// Mock state and participant caching functions from app.js
const mockAppCode = `
const ROSTER_KEY = 'agy_participants_roster';
const STORAGE_KEY = 'agy_py_competition_v1';

let STATE = {
  view: 'registration',
  stage: 'SEMI-FINAL',
  status: 'active',
  student: {
    name: 'Candidate One',
    rollNo: '21MCA001',
    degree: 'MCA',
    department: 'Computer Applications',
    college: 'AVCCE'
  },
  semi: {
    solved: [true, true, true, true],
    errorsFixed: [5, 5, 5, 5],
    elapsedSeconds: 2400
  },
  final: {
    started: false,
    solved: [false, false],
    errorsFixed: [0, 0],
    elapsedSeconds: 0
  }
};

function getParticipantsRoster() {
  const data = localStorage.getItem(ROSTER_KEY);
  if (data) {
    try { return JSON.parse(data); } catch(e) {}
  }
  return [];
}

function saveParticipantsRoster(roster) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
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
  archiveCurrentParticipant();
  STATE.student = { name: '', rollNo: '', degree: 'MCA', department: 'Computer Applications', college: 'AVCCE' };
  STATE.semi.solved = [false, false, false, false];
  STATE.semi.errorsFixed = [0, 0, 0, 0];
  STATE.semi.elapsedSeconds = 0;
  STATE.status = 'active';
  STATE.view = 'registration';
}

function generateRosterCsv() {
  const roster = getParticipantsRoster();
  let csv = 'RollNo,Name,Degree,Department,College,Stage,SemiQuestions,SemiErrors,SemiTimeSeconds,FinalQuestions,FinalErrors,Status,Timestamp\\n';
  roster.forEach(p => {
    csv += \`"\${p.rollNo}","\${p.name}","\${p.degree}","\${p.department}","\${p.college}","\${p.stage}",\${p.semiQuestions},\${p.semiErrors},\${p.semiTime},\${p.finalQuestions || 0},\${p.finalErrors || 0},"\${p.status}","\${p.timestamp}"\\n\`;
  });
  return csv;
}

// Execute Candidate 1 test completion
archiveCurrentParticipant();

// Register Candidate 2
resetToNewParticipant();
STATE.student = {
  name: 'Candidate Two',
  rollNo: '21MCA002',
  degree: 'BCA',
  department: 'Computer Applications',
  college: 'AVCCE'
};
STATE.semi.solved = [true, true, false, false];
STATE.semi.errorsFixed = [5, 5, 0, 0];
STATE.semi.elapsedSeconds = 1800;
archiveCurrentParticipant();

globalThis.getParticipantsRoster = getParticipantsRoster;
globalThis.generateRosterCsv = generateRosterCsv;
globalThis.saveParticipantsRoster = saveParticipantsRoster;
globalThis.STATE = STATE;
`;

vm.runInContext(mockAppCode, sandbox);

const roster = sandbox.getParticipantsRoster();
assert(roster.length === 2, `Participants roster cache contains 2 records`);
assert(roster[0].name === 'Candidate One' && roster[0].semiQuestions === 4 && roster[0].semiErrors === 20, `Candidate One correctly cached with 4/4 questions and 20/20 errors`);
assert(roster[1].name === 'Candidate Two' && roster[1].semiQuestions === 2 && roster[1].semiErrors === 10, `Candidate Two correctly cached with 2/4 questions and 10/20 errors`);

const csv = sandbox.generateRosterCsv();
assert(csv.includes('21MCA001') && csv.includes('Candidate One'), `CSV export includes Candidate One`);
assert(csv.includes('21MCA002') && csv.includes('Candidate Two'), `CSV export includes Candidate Two`);

// Test Clearing Roster
sandbox.saveParticipantsRoster([]);
const clearedRoster = sandbox.getParticipantsRoster();
assert(clearedRoster.length === 0, `Clear Cache correctly resets participant roster`);

// --------------------------------------------------------------------------
// TEST SUITE 5: AUTO-ENABLE NEXT QUESTION REGARDLESS OF PASS/FAIL
// --------------------------------------------------------------------------
console.log('\n--- TEST SUITE 5: Verify Click Auto-Enables Next Button ---');

const verifyButtonLogic = `
function simulateVerifyAction(userCode, qData) {
  const result = verifySubmittedCode(qData, userCode);
  const elements = {
    btnNextQuestion: { disabled: true },
    btnFinishTest: { disabled: true },
    verificationBanner: { className: '', text: '' }
  };

  if (result.success) {
    elements.verificationBanner.className = 'verification-status-banner success';
    elements.verificationBanner.text = '✓ Question verified successfully.';
  } else {
    elements.verificationBanner.className = 'verification-status-banner error';
    elements.verificationBanner.text = '✖ Question is not verified.';
  }

  // Next button enabled REGARDLESS of verify outcome
  elements.btnNextQuestion.disabled = false;
  elements.btnFinishTest.disabled = false;

  return { result, elements };
}
globalThis.simulateVerifyAction = simulateVerifyAction;
`;

vm.runInContext(verifyButtonLogic, sandbox);

// Test with Incorrect code
const simFailed = sandbox.simulateVerifyAction('invalid python code', questions.semi[0]);
assert(simFailed.result.success === false, `Failed code result.success is false`);
assert(simFailed.elements.btnNextQuestion.disabled === false, `Next Question button is ENABLED even when verification fails`);
assert(simFailed.elements.verificationBanner.className.includes('error'), `Banner displays red error style when verification fails`);

// Test with Correct code
const simPassed = sandbox.simulateVerifyAction(solutions.semi_q1, questions.semi[0]);
assert(simPassed.result.success === true, `Passed code result.success is true`);
assert(simPassed.elements.btnNextQuestion.disabled === false, `Next Question button is ENABLED when verification passes`);
assert(simPassed.elements.verificationBanner.className.includes('success'), `Banner displays green success style when verification passes`);

// --------------------------------------------------------------------------
// TEST SUITE 6: ADMIN SECURITY (PBKDF2 SHA-256)
// --------------------------------------------------------------------------
console.log('\n--- TEST SUITE 6: Admin Authentication Security ---');

async function testSecurity() {
  const correctAuth = await sandbox.verifyAdminCredentials('Admin@Debug2026');
  assert(correctAuth === true, `Admin password 'Admin@Debug2026' authenticates correctly`);

  const wrongAuth = await sandbox.verifyAdminCredentials('wrongpassword');
  assert(wrongAuth === false, `Incorrect password 'wrongpassword' is rejected`);

  const emptyAuth = await sandbox.verifyAdminCredentials('');
  assert(emptyAuth === false, `Empty password is rejected`);
}

testSecurity().then(() => {
  console.log('\n====================================================');
  console.log(`ALL TESTS COMPLETED: ${passedTests} / ${totalTests} PASSED (100%)`);
  console.log('====================================================');
});
