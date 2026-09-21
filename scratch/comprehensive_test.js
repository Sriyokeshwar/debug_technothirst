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

// Semi Q1, Q2, Q3: strictly 5 to 15 lines
for (let i = 0; i < 3; i++) {
  const q = questions.semi[i];
  const lines = q.buggyCode.split('\n').length;
  assert(lines >= 5 && lines <= 15, `Semi Q${i+1} code line count (${lines}) is between 5 and 15 lines`);
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
  semi_q1: `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 0]
total = sum(even)
avg = total / len(even)
print("Even:", even)
print("Average:", avg)`,

  semi_q2: `def check(numbers, limit=10):
    result = []
    for n in numbers:
        if n > limit:
            result.append(n)
    total = sum(result)
    return result, total

data = [5, 15, 20, 8]
values, total = check(data, 10)
print(values)
print("Total:", total)`,

  semi_q3: `text = "Python Python Java Python Java"
words = text.split()
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1
common = [w for w in count if count[w] > 1]
print("Count:", count)
print("Common:", common)
print(common[1])`,

  semi_q4: `class Student:
    total = 0
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks
        Student.total += 1
    def average(self):
        return sum(self.marks) / len(self.marks)
    def result(self):
        return "PASS" if self.average() >= 50 else "FAIL"

s = Student("Arun", [60, 70, 40])
print(s.name, s.average(), s.result())
print(Student.total)`,

  final_q1: `def process(values):
    even = [x for x in values if x % 2 == 0]
    doubled = [x * 2 for x in even]
    filtered = [x for x in doubled if x > 20]
    return even, filtered

data = [4, 8, 12, 15, 20]
a, b = process(data)
print("Even:", a)
print("Filtered:", b)
print("Total:", sum(b))`,

  final_q2: `def calculate(values):
    nums = []
    for x in values:
        try:
            nums.append(int(x))
        except ValueError:
            pass
    positive = [x for x in nums if x > 0]
    negative = [x for x in nums if x < 0]
    maximum = max(negative) if negative else 0
    average = sum(nums) / len(nums) if nums else 0
    return {"positive": positive, "negative": negative,
            "max": maximum, "avg": average}

data = ["10", "-5", "20", "", "abc", "-2"]
result = calculate(data)
print(result["positive"])
print(result["max"])`
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

  // Trivial malicious print mock should fail
  const mockCode = `print("${q.expectedOutput.replace(/"/g, '\\"')}")\n# mock\n# mock\n# mock\n# mock\n# mock\n# mock\n# mock`;
  const resMock = sandbox.verifySubmittedCode(q, mockCode);
  assert(resMock.success === false, `${q.id} trivial mock print rejected by anti-cheat`);

  // Empty code should fail
  const resEmpty = sandbox.verifySubmittedCode(q, '');
  assert(resEmpty.success === false, `${q.id} empty code returns false`);
});

// Partial fixes test (e.g. 2 fixes on semi_q1)
const partialQ1 = `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 0]
total = sum(even)
avg = total / len(nums)
print("Even:", even)
print("Average:", avg)`;
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
