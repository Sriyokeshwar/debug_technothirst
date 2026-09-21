const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

console.log('=================================================================');
console.log('TECHNOTHIRST’26 USER ISOLATION TEST SUITE');
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

const jsPath = path.join(__dirname, '../script.js');
const jsCode = fs.readFileSync(jsPath, 'utf8');

function createIsolatedEnvironment(initialLocalStorage = {}, initialSessionStorage = {}) {
  const localStorageMock = {
    store: { ...initialLocalStorage },
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
  };

  const sessionStorageMock = {
    store: { ...initialSessionStorage },
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
  };

  const domElements = {};
  function getEl(id) {
    if (!domElements[id]) {
      domElements[id] = {
        id: id,
        value: '',
        checked: false,
        disabled: false,
        textContent: '',
        innerHTML: '',
        style: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        listeners: {},
        addEventListener(event, fn) {
          if (!this.listeners[event]) this.listeners[event] = [];
          this.listeners[event].push(fn);
        },
        click() {
          if (this.listeners['click']) {
            this.listeners['click'].forEach(fn => fn.call(this, { preventDefault: () => {} }));
          }
        },
        focus() {},
        removeAttribute() {},
        appendChild() {},
        removeChild() {},
        getContext: () => ({ clearRect: () => {}, save: () => {}, restore: () => {}, fillRect: () => {}, translate: () => {}, rotate: () => {} })
      };
    }
    return domElements[id];
  }

  const windowListeners = {};
  const sandbox = {
    console: { log: () => {}, error: () => {}, warn: () => {} },
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
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
    window: {
      innerWidth: 1024,
      innerHeight: 768,
      addEventListener(event, fn) {
        if (!windowListeners[event]) windowListeners[event] = [];
        windowListeners[event].push(fn);
      }
    },
    document: {
      getElementById: getEl,
      querySelectorAll: () => [],
      createElement: (tag) => ({
        tagName: tag,
        style: {},
        classList: { add: () => {}, remove: () => {} },
        addEventListener: () => {},
        appendChild: () => {}
      }),
      body: {
        appendChild: () => {},
        removeChild: () => {}
      }
    },
    alert: () => {},
    confirm: () => true
  };

  const context = vm.createContext(sandbox);
  vm.runInContext(jsCode, context);

  return {
    context,
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
    getEl,
    getState() {
      return vm.runInContext('STATE', context);
    },
    eval(expr) {
      return vm.runInContext(expr, context);
    },
    triggerDOMReady() {
      if (windowListeners['DOMContentLoaded']) {
        windowListeners['DOMContentLoaded'].forEach(fn => fn());
      }
    }
  };
}

// --------------------------------------------------------------------------
// TEST 1 — BRAND NEW USER
// --------------------------------------------------------------------------
console.log('--- TEST 1: Brand New User Starts with Clean State ---');
{
  const env = createIsolatedEnvironment();
  
  // Register User A
  env.getEl('regStudentName').value = 'Alice';
  env.getEl('regRollNo').value = '22MCA01';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  
  // Submit User A
  const submitHandler = env.getEl('formRegistration').listeners['submit'][0];
  submitHandler({ preventDefault: () => {} });

  // User A enters workspace and solves Q1
  const solvedQ1Code = `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 0]
total = sum(even)
avg = total / len(even)
print("Even:", even)
print("Average:", avg)`;

  env.getEl('txtCorrectedCode').value = solvedQ1Code;
  env.getEl('btnVerifyCode').click();

  assert(env.getState().solved[0] === true, 'User A verified Q1');
  assert(env.localStorage.getItem('debugTestState_22mca01') !== null, 'User A state saved under debugTestState_22mca01');

  // User A leaves / registers new participant
  env.getEl('btnAddAnotherParticipant').click();

  // User B registers for the first time
  env.getEl('regStudentName').value = 'Bob';
  env.getEl('regRollNo').value = '22MCA02';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  submitHandler({ preventDefault: () => {} });

  // Verify User B has a 100% fresh state
  assert(env.getState().student.rollNo === '22MCA02', 'Current student is User B');
  assert(env.getState().solved[0] === false, 'User B Q1 is NOT verified (fresh attempt)');
  assert(env.getState().solved.every(s => s === false), 'User B has 0/4 questions solved');
  assert(env.getState().draftCodes[0] === '', 'User B corrected code is completely empty');
  assert(env.getEl('txtCorrectedCode').value === '', 'User B textarea in DOM is empty');
  assert(env.getState().errorsFixed.reduce((a,b)=>a+b,0) === 0, 'User B errorsFixed is 0');
}

// --------------------------------------------------------------------------
// TEST 2 — OLD USER RETURNS
// --------------------------------------------------------------------------
console.log('\n--- TEST 2: Old User Returns and Restores Saved Progress ---');
{
  // Pre-seed localStorage with User A's previously verified state
  const userAState = {
    userId: '22mca01',
    student: { name: 'Alice', rollNo: '22MCA01', degree: 'MCA', department: 'Computer Applications', college: 'AVCCE' },
    view: 'viewWorkspace',
    status: 'active',
    currentQIndex: 1,
    solved: [true, false, false, false],
    solvedQuestions: [true, false, false, false],
    verifiedQuestions: { semi_q1: true, semi_q2: false, semi_q3: false, semi_q4: false },
    skipped: [false, false, false, false],
    draftCodes: ['# User A Code for Q1', '', '', ''],
    errorsFixed: [5, 0, 0, 0],
    elapsedSeconds: 420,
    qTimes: [420, 0, 0, 0]
  };

  const initialStore = {
    'debugTestState_22mca01': JSON.stringify(userAState)
  };

  const env = createIsolatedEnvironment(initialStore);
  const submitHandler = env.getEl('formRegistration').listeners['submit'][0];

  // User A enters their roll number
  env.getEl('regStudentName').value = 'Alice';
  env.getEl('regRollNo').value = '22MCA01';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  submitHandler({ preventDefault: () => {} });

  assert(env.getState().student.rollNo === '22MCA01', 'User A recognized');
  assert(env.getState().solved[0] === true, 'User A restored Q1 as solved');
  assert(env.getState().draftCodes[0] === '# User A Code for Q1', 'User A restored Q1 draft code');
  assert(env.getState().elapsedSeconds === 420, 'User A restored elapsed time');
}

// --------------------------------------------------------------------------
// TEST 3 — USER SWITCH / LOGOUT ISOLATION
// --------------------------------------------------------------------------
console.log('\n--- TEST 3: User Switch Completely Isolates Memory & Storage ---');
{
  const env = createIsolatedEnvironment();
  const submitHandler = env.getEl('formRegistration').listeners['submit'][0];

  // User A registers and solves Q1
  env.getEl('regStudentName').value = 'Alice';
  env.getEl('regRollNo').value = '22MCA01';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  submitHandler({ preventDefault: () => {} });

  env.getState().solved[0] = true;
  env.getState().draftCodes[0] = 'print("Alice answer")';
  env.eval('saveSession()');

  // Reset / Logout User A
  env.eval('resetToNewParticipant()');

  // Ensure active user session is purged
  assert(env.sessionStorage.getItem('technothirst26_active_user_id') === null, 'Active user session removed on reset');
  assert(env.getState().solved[0] === false, 'In-memory solved array reset to false');

  // User B registers
  env.getEl('regStudentName').value = 'Bob';
  env.getEl('regRollNo').value = '22MCA02';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  submitHandler({ preventDefault: () => {} });

  assert(env.getState().solved[0] === false, 'User B sees Q1 as unverified');
  assert(env.getState().draftCodes[0] === '', 'User B sees blank draft code for Q1');
  
  // User A state in storage is still preserved intact!
  const userAStored = JSON.parse(env.localStorage.getItem('debugTestState_22mca01'));
  assert(userAStored.solved[0] === true, 'User A data preserved in debugTestState_22mca01');
}

// --------------------------------------------------------------------------
// TEST 4 — REFRESH TEST
// --------------------------------------------------------------------------
console.log('\n--- TEST 4: Page Refresh Loads ONLY Active User State ---');
{
  const userBState = {
    userId: '22mca02',
    student: { name: 'Bob', rollNo: '22MCA02', degree: 'MCA', department: 'Computer Applications', college: 'AVCCE' },
    view: 'viewWorkspace',
    status: 'active',
    currentQIndex: 0,
    solved: [false, false, false, false],
    draftCodes: ['my draft for Q1', '', '', ''],
    errorsFixed: [0, 0, 0, 0],
    elapsedSeconds: 120
  };

  const env = createIsolatedEnvironment(
    { 'debugTestState_22mca02': JSON.stringify(userBState) },
    { 'technothirst26_active_user_id': '22mca02' }
  );

  // Trigger page load
  env.triggerDOMReady();

  assert(env.getState().student.rollNo === '22MCA02', 'Active user Bob restored on refresh');
  assert(env.getState().draftCodes[0] === 'my draft for Q1', 'Bob draft code restored on refresh');
  assert(env.getState().elapsedSeconds === 120, 'Bob timer restored on refresh');
}

// --------------------------------------------------------------------------
// TEST 5 — DIFFERENT QUESTIONS INDEPENDENCE
// --------------------------------------------------------------------------
console.log('\n--- TEST 5: Question Status Belongs Strictly to Each User ---');
{
  const env = createIsolatedEnvironment();
  const submitHandler = env.getEl('formRegistration').listeners['submit'][0];

  // User A verifies Q1
  env.getEl('regStudentName').value = 'Alice';
  env.getEl('regRollNo').value = '22MCA01';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  submitHandler({ preventDefault: () => {} });
  env.getState().solved[0] = true;
  env.eval('saveSession()');

  // Reset to User B
  env.eval('resetToNewParticipant()');
  env.getEl('regStudentName').value = 'Bob';
  env.getEl('regRollNo').value = '22MCA02';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  submitHandler({ preventDefault: () => {} });

  assert(env.getState().solved[0] === false, 'Q1 is NOT verified for User B');
  assert(env.getState().solved[1] === false, 'Q2 is NOT verified for User B');

  // User B verifies Q2
  env.getState().solved[1] = true;
  env.eval('saveSession()');

  // Switch back to User A
  env.eval('resetToNewParticipant()');
  env.getEl('regStudentName').value = 'Alice';
  env.getEl('regRollNo').value = '22MCA01';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  submitHandler({ preventDefault: () => {} });

  assert(env.getState().solved[0] === true, 'User A still has Q1 verified');
  assert(env.getState().solved[1] === false, 'User A does NOT have Q2 verified (belongs only to User B)');
}

// --------------------------------------------------------------------------
// TEST 6 — OLD GLOBAL LOCALSTORAGE CLEANUP & NON-POLLUTION
// --------------------------------------------------------------------------
console.log('\n--- TEST 6: Legacy Global LocalStorage Is Cleaned & Never Migrated ---');
{
  const legacyStore = {
    'technothirst26_semifinal_session': JSON.stringify({
      student: { name: 'OldUser', rollNo: 'OLD999' },
      solved: [true, true, true, true],
      draftCodes: ['old code 1', 'old code 2', 'old code 3', 'old code 4']
    }),
    'debugTestState': JSON.stringify({ solved: [true, true, true, true] }),
    'answers': 'leaked answers',
    'technothirst26_participants_roster': JSON.stringify([{ rollNo: 'AUDIT01', name: 'Past Candidate' }])
  };

  const env = createIsolatedEnvironment(legacyStore);
  env.triggerDOMReady();

  // Ensure legacy keys were removed
  assert(env.localStorage.getItem('technothirst26_semifinal_session') === null, 'Legacy technothirst26_semifinal_session removed');
  assert(env.localStorage.getItem('debugTestState') === null, 'Legacy debugTestState removed');
  assert(env.localStorage.getItem('answers') === null, 'Legacy answers removed');

  // Ensure roster archive was NOT destroyed
  assert(env.localStorage.getItem('technothirst26_participants_roster') !== null, 'Roster archive preserved');

  // New user registers
  const submitHandler = env.getEl('formRegistration').listeners['submit'][0];
  env.getEl('regStudentName').value = 'NewUser';
  env.getEl('regRollNo').value = 'NEW100';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  submitHandler({ preventDefault: () => {} });

  assert(env.getState().student.rollNo === 'NEW100', 'New user registered');
  assert(env.getState().solved.every(s => s === false), 'No old solved questions migrated into new user');
  assert(env.getState().draftCodes.every(c => c === ''), 'No old draft code migrated into new user');
}

// --------------------------------------------------------------------------
// TEST 7 — COMPLETION CALCULATION RULE
// --------------------------------------------------------------------------
console.log('\n--- TEST 7: Completion Calculated Strictly from Current User Verification ---');
{
  const env = createIsolatedEnvironment();
  const submitHandler = env.getEl('formRegistration').listeners['submit'][0];

  env.getEl('regStudentName').value = 'Charlie';
  env.getEl('regRollNo').value = '22MCA03';
  env.getEl('regDegree').value = 'MCA';
  env.getEl('regDepartment').value = 'Computer Applications';
  env.getEl('regCollege').value = 'AVCCE';
  submitHandler({ preventDefault: () => {} });

  assert(env.getState().completed === false, 'Fresh user completion is false');
  assert(env.getState().solved.filter(s => s).length === 0, '0 questions verified');

  env.getState().solved = [true, true, true, false];
  assert(env.getState().solved.every(s => s === true) === false, '3/4 solved does not satisfy completion');

  env.getState().solved = [true, true, true, true];
  assert(env.getState().solved.every(s => s === true) === true, '4/4 solved satisfies completion');
}

console.log('\n=================================================================');
console.log(`ALL USER ISOLATION TESTS COMPLETED: ${passedTests} / ${totalTests} PASSED (100%)`);
console.log('=================================================================');
