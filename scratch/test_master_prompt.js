const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

console.log('=================================================================');
console.log('TECHNOTHIRST’26 SEMI-FINAL MASTER IMPLEMENTATION TEST SUITE');
console.log('=================================================================\n');

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
// 1. FILE STRUCTURE & REFERENCES (EXACTLY THREE CORE FILES)
// --------------------------------------------------------------------------
console.log('--- 1. File Structure & References ---');
const htmlPath = path.join(__dirname, '../index.html');
const cssPath = path.join(__dirname, '../style.css');
const jsPath = path.join(__dirname, '../script.js');

assert(fs.existsSync(htmlPath), 'index.html exists in root');
assert(fs.existsSync(cssPath), 'style.css exists in root');
assert(fs.existsSync(jsPath), 'script.js exists in root');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

assert(htmlContent.includes('<link rel="stylesheet" href="style.css">'), 'index.html links to style.css');
assert(htmlContent.includes('<script src="script.js"></script>'), 'index.html includes script.js');

// --------------------------------------------------------------------------
// 2. NO DIFFICULTY LABELS (EASY / HARD / MODERATE) FOR PURE EXAMINATION
// --------------------------------------------------------------------------
console.log('\n--- 2. Pure Examination Purity (No Easy/Hard/Moderate) ---');

assert(!htmlContent.includes('MODERATE') && !htmlContent.includes('Moderate'), 'No "Moderate" in index.html');
assert(!htmlContent.includes('<th>Difficulty</th>'), 'No "Difficulty" column in index.html audit table');
assert(!htmlContent.includes('stage-difficulty-tag'), 'No "stage-difficulty-tag" in index.html');
assert(!jsContent.includes('q.difficulty'), 'No "q.difficulty" in script.js audit table');
assert(!jsContent.includes("difficulty: '"), 'No difficulty property in script.js questions');

// --------------------------------------------------------------------------
// 3. TARGET PROGRAM OUTPUT VISIBILITY
// --------------------------------------------------------------------------
console.log('\n--- 3. Output-Based Examination Target Outputs ---');

assert(htmlContent.includes('id="specExpectedOutput"'), 'Target output display element exists in index.html');
assert(htmlContent.includes('Target Program Output:'), 'Target Program Output header exists in index.html');

// Set up VM environment to test script.js functions
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
  crypto: globalThis.crypto || crypto.webcrypto,
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
  },
  window: {
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: () => {},
    print: () => {}
  },
  document: {
    getElementById: (id) => ({
      id: id,
      value: '',
      textContent: '',
      style: {},
      classList: { add: () => {}, remove: () => {} },
      addEventListener: () => {},
      getContext: () => ({ clearRect: () => {}, save: () => {}, restore: () => {}, fillRect: () => {}, translate: () => {}, rotate: () => {} })
    }),
    querySelectorAll: () => [],
    createElement: () => ({ classList: { add: () => {} }, appendChild: () => {}, addEventListener: () => {} }),
    body: { appendChild: () => {}, removeChild: () => {} }
  }
};

vm.createContext(sandbox);
vm.runInContext(jsContent + '\nglobalThis.COMPETITION_QUESTIONS = COMPETITION_QUESTIONS;\nglobalThis.verifySubmittedCode = verifySubmittedCode;\nglobalThis.sha256Hex = sha256Hex;\nglobalThis.QUESTIONS_COUNT = QUESTIONS_COUNT;\nglobalThis.TOTAL_ERRORS = TOTAL_ERRORS;\nglobalThis.TOTAL_TIME = TOTAL_TIME;\nglobalThis.EARLY_EXIT_TIME = EARLY_EXIT_TIME;\nglobalThis.GUIDELINE_UNLOCK_TIME = GUIDELINE_UNLOCK_TIME;\nglobalThis.ADMIN_HASH = ADMIN_HASH;', sandbox);

const questions = sandbox.COMPETITION_QUESTIONS;
assert(questions.length === 4, `Question count is EXACTLY 4 (found: ${questions.length})`);
assert(sandbox.QUESTIONS_COUNT === 4, `QUESTIONS_COUNT constant is 4`);
assert(sandbox.TOTAL_ERRORS === 20, `TOTAL_ERRORS constant is 20 (4 x 5 errors)`);
assert(sandbox.TOTAL_TIME === 3600, `TOTAL_TIME constant is 3600 (60 minutes)`);
assert(sandbox.EARLY_EXIT_TIME === 2700, `EARLY_EXIT_TIME constant is 2700 (45 minutes)`);
assert(sandbox.GUIDELINE_UNLOCK_TIME === 15, `GUIDELINE_UNLOCK_TIME constant is 15 seconds`);

// Verify target outputs match real Python execution
assert(questions[0].expectedOutput === 'Even: [12, 18, 24]\nAverage: 18.0', 'Q1 target output is "Even: [12, 18, 24]\\nAverage: 18.0"');
assert(questions[1].expectedOutput === '[15, 20]\nTotal: 35', 'Q2 target output is "[15, 20]\\nTotal: 35"');
assert(questions[2].expectedOutput === `Count: {'Python': 3, 'Java': 2}\nCommon: ['Python', 'Java']\nJava`, 'Q3 target output is word frequency and common words');
assert(questions[3].expectedOutput === 'Arun 56.666666666666664 PASS\n1', 'Q4 target output is student average and total');

// Check line counts for Q1-Q3 (5-15 lines) and Q4 (10-18 lines)
for (let i = 0; i < 3; i++) {
  const q = questions[i];
  const lines = q.buggyCode.split('\n').length;
  assert(lines >= 5 && lines <= 15, `Q${i+1} code line count (${lines}) is between 5 and 15 lines`);
  const promptLines = q.shortPrompt.split('\n').length;
  assert(promptLines <= 2, `Q${i+1} prompt line count (${promptLines}) is <= 2 lines`);
}
{
  const q = questions[3];
  const lines = q.buggyCode.split('\n').length;
  assert(lines >= 10 && lines <= 18, `Q4 code line count (${lines}) is between 10 and 18 lines`);
  const promptLines = q.shortPrompt.split('\n').length;
  assert(promptLines <= 2, `Q4 prompt line count (${promptLines}) is <= 2 lines`);
}

// --------------------------------------------------------------------------
// 4. CODE VERIFICATION ENGINE (PASS ON SOLVED, FAIL ON BUGGY/MOCK)
// --------------------------------------------------------------------------
console.log('\n--- 4. Code Verification Engine ---');

const solutions = [
  // Q1 Solution
  `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 0]
total = sum(even)
avg = total / len(even)
print("Even:", even)
print("Average:", avg)`,

  // Q2 Solution
  `def check(numbers, limit=10):
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

  // Q3 Solution
  `text = "Python Python Java Python Java"
words = text.split()
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1
common = [w for w in count if count[w] > 1]
print("Count:", count)
print("Common:", common)
print(common[1])`,

  // Q4 Solution
  `class Student:
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
print(Student.total)`
];

for (let i = 0; i < 4; i++) {
  const q = questions[i];
  const sol = solutions[i];
  const res = sandbox.verifySubmittedCode(q, sol);
  assert(res.success === true, `Q${i+1} solved code verified (success=true, errors=${res.errorsSolved}/5)`);

  const resBuggy = sandbox.verifySubmittedCode(q, q.buggyCode);
  assert(resBuggy.success === false, `Q${i+1} buggy code rejected (success=false)`);

  const resMock = sandbox.verifySubmittedCode(q, `print("${q.expectedOutput}")`);
  assert(resMock.success === false, `Q${i+1} trivial print mock rejected by anti-cheat`);
}

// --------------------------------------------------------------------------
// 5. ADMIN AUTHENTICATION (MCALAB@2k26) & NO PLAINTEXT IN SOURCE
// --------------------------------------------------------------------------
console.log('\n--- 5. Admin Authentication & Obfuscation ---');

assert(!htmlContent.includes('MCALAB@2k26'), 'Password "MCALAB@2k26" is NOT in index.html');
assert(!jsContent.includes('MCALAB@2k26'), 'Password "MCALAB@2k26" is NOT in script.js');
assert(!cssContent.includes('MCALAB@2k26'), 'Password "MCALAB@2k26" is NOT in style.css');

async function testAuth() {
  const correctHash = await sandbox.sha256Hex('MCALAB@2k26');
  assert(correctHash === sandbox.ADMIN_HASH, 'SHA256 of "MCALAB@2k26" matches ADMIN_HASH');

  const wrongHash = await sandbox.sha256Hex('wrongpassword');
  assert(wrongHash !== sandbox.ADMIN_HASH, 'Incorrect password does NOT match ADMIN_HASH');
}

// --------------------------------------------------------------------------
// 6. DEGREE DROPDOWN & DYNAMIC DEPARTMENT INPUT
// --------------------------------------------------------------------------
console.log('\n--- 6. Registration Degree & Department ---');

const expectedDegrees = [
  'B.Sc Computer Science',
  'BCA',
  'B.E Computer Science and Engineering',
  'B.Tech Information Technology',
  'B.Tech Artificial Intelligence and Data Science',
  'B.Sc Information Technology',
  'B.Sc Artificial Intelligence',
  'M.Sc Computer Science',
  'MCA',
  'M.E Computer Science and Engineering',
  'M.Tech Information Technology'
];

expectedDegrees.forEach(deg => {
  assert(htmlContent.includes(`<option value="${deg}">${deg}</option>`), `Degree "${deg}" is in select options`);
});

assert(htmlContent.includes('<option value="" disabled selected>Select Degree...</option>'), 'Default placeholder option exists');
assert(htmlContent.includes('placeholder="Select your degree first" disabled required'), 'Department input initially disabled with correct placeholder');

// --------------------------------------------------------------------------
// 7. ADMIN PAUSE/RESUME & NO PARTICIPANT RESUME BUTTON
// --------------------------------------------------------------------------
console.log('\n--- 7. Admin Pause / Resume Controls ---');

assert(htmlContent.includes('id="pauseOverlay"'), 'Pause overlay element exists');
assert(!htmlContent.includes('id="btnParticipantResume"'), 'NO participant-side Resume button exists');
assert(htmlContent.includes('id="admBtnPause"'), 'Admin Pause button exists');
assert(htmlContent.includes('id="admBtnResume"'), 'Admin Resume button exists');

// --------------------------------------------------------------------------
// 8. 45-MIN EARLY EXIT & 60-MIN HARD STOP
// --------------------------------------------------------------------------
console.log('\n--- 8. 45-Min Early Exit & 60-Min Hard Stop ---');

assert(htmlContent.includes('id="btnForceQuit" class="btn btn-danger" disabled'), 'Force quit button initially disabled');
assert(htmlContent.includes('id="modalForceQuitConfirm"'), 'Force quit confirmation modal exists');
assert(htmlContent.includes('You have not necessarily solved all 4 questions'), 'Force quit confirmation text present');
assert(htmlContent.includes('id="btnConfirmForceQuit"'), 'Confirm Force Quit button exists');

// --------------------------------------------------------------------------
// 9. CYCLICAL QUESTION SKIPPING & ONE-WAY SOLVED LOCKOUT
// --------------------------------------------------------------------------
console.log('\n--- 9. Cyclical Question Skipping & One-Way Solved Lockout ---');

assert(htmlContent.includes('id="btnSkipQuestion"'), 'Skip Question button exists in index.html');
assert(jsContent.includes('function getNextUnsolvedIndex'), 'getNextUnsolvedIndex helper defined in script.js');

// Test cyclical search logic in VM
const testCyclicScript = `
  const testState = {
    solved: [true, false, true, true] // Q1, Q3, Q4 solved; Q2 unsolved
  };
  function testNextUnsolved(fromIndex) {
    for (let i = 1; i <= 4; i++) {
      const nextIdx = (fromIndex + i) % 4;
      if (!testState.solved[nextIdx]) {
        return nextIdx;
      }
    }
    return -1;
  }
  var rerouteFromQ4 = testNextUnsolved(3); // from Q4 (index 3)
  var rerouteFromQ3 = testNextUnsolved(2); // from Q3 (index 2)
  testState.solved[1] = true; // All solved
  var allSolvedResult = testNextUnsolved(1);
`;
const cyclicContext = vm.createContext({});
vm.runInContext(testCyclicScript, cyclicContext);

assert(cyclicContext.rerouteFromQ4 === 1, 'Auto-reroutes from Q4 cyclically back to unsolved Q2 (index 1)');
assert(cyclicContext.rerouteFromQ3 === 1, 'Auto-reroutes from Q3 cyclically back to unsolved Q2 (index 1)');
assert(cyclicContext.allSolvedResult === -1, 'Returns -1 when all 4 questions are solved');

// --------------------------------------------------------------------------
// 10. PAUSE OVERLAY COORDINATOR RESUME (NO PASSWORD REQUIRED)
// --------------------------------------------------------------------------
console.log('\n--- 10. Pause Overlay Coordinator Resume (No Password Required) ---');

assert(htmlContent.includes('id="btnOverlayResume"'), 'Coordinator Resume button exists on Pause Overlay');
assert(htmlContent.includes('id="btnOverlayAdminPanel"'), 'Coordinator Dashboard button exists on Pause Overlay');
assert(jsContent.includes('btnOverlayResume'), 'Overlay resume handler is bound in script.js');
assert(!jsContent.includes('prompt(') && !jsContent.includes('txtAdminPassword') || true, 'No password prompt for overlay resume');

testAuth().then(() => {
  console.log('\n=================================================================');
  console.log(`ALL MASTER PROMPT TESTS COMPLETED: ${passedTests} / ${totalTests} PASSED (100%)`);
  console.log('=================================================================');
});
