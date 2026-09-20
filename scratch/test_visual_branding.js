const fs = require('fs');
const path = require('path');

console.log('=================================================================');
console.log('TECHNOTHIRST’26 VISUAL & BRANDING INTEGRITY TEST SUITE');
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

const htmlPath = path.join(__dirname, '../index.html');
const cssPath = path.join(__dirname, '../style.css');
const jsPath = path.join(__dirname, '../script.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

// --- 1. BRANDING ACCURACY ---
console.log('--- 1. Event Branding & Exact Spelling ---');
assert(html.includes('TECHNOTHIRST’26') || html.includes("TECHNOTHIRST'26"), 'TECHNOTHIRST\'26 in uppercase branding');
assert(html.toLowerCase().includes("technothirst’26") || html.toLowerCase().includes("technothirst'26"), 'Technothirst\'26 case variation present');
assert(html.includes('A.V.C. COLLEGE OF ENGINEERING'), 'College name present in HTML');
assert(html.includes('Department of Computer Applications'), 'Department of Computer Applications present');
assert(html.includes('A National Level Student’s Technical Symposium'), 'National Level Symposium subtitle present');
assert(html.includes('23.09.2026'), 'Symposium date 23.09.2026 present');

// --- 2. INNOVATIVE HOME / REGISTRATION TERMINAL ---
console.log('\n--- 2. Innovative Home / Participant Registration Console ---');
assert(html.includes('class="cyber-corner top-left"'), 'Cyber corner top-left present');
assert(html.includes('class="cyber-corner top-right"'), 'Cyber corner top-right present');
assert(html.includes('class="cyber-corner bottom-left"'), 'Cyber corner bottom-left present');
assert(html.includes('class="cyber-corner bottom-right"'), 'Cyber corner bottom-right present');
assert(html.includes('SYSTEM ONLINE'), 'Live telemetry SYSTEM ONLINE indicator present');
assert(html.includes('id="regCachedCount"'), 'Dynamic cached participants counter element present');
assert(html.includes('CASH PRIZES'), 'Symposium Cash Prizes highlight present');
assert(html.includes('CODE DEBUGGING'), 'Code Debugging highlight present');
assert(html.includes('TIME LIMIT'), 'Time limit highlight present');
assert(html.includes('OFFICIAL PERKS'), 'Official Perks highlight present');
assert(html.includes('id="formRegistration"'), 'formRegistration element intact');
assert(html.includes('id="regStudentName"'), 'regStudentName input intact');
assert(html.includes('id="regRollNo"'), 'regRollNo input intact');
assert(html.includes('id="regDegree"'), 'regDegree dropdown intact');
assert(html.includes('id="regDepartment"'), 'regDepartment input intact');
assert(html.includes('id="regCollege"'), 'regCollege input intact');

// --- 3. POSTER COLOR SYSTEM & CYBER STYLING ---
console.log('\n--- 3. Poster Color Palette & Styling ---');
assert(css.includes('#031522'), 'Deep space navy #031522 defined in CSS');
assert(css.includes('#00D9FF') || css.includes('#20E5FF'), 'Luminous cyan #00D9FF / #20E5FF defined in CSS');
assert(css.includes('#FFD400') || css.includes('#FFE840') || css.includes('#FFD700'), 'Gold palette defined in CSS');
assert(css.includes('backdrop-filter: blur'), 'Glassmorphism backdrop-filter used');
assert(css.includes('.cyber-corner'), '.cyber-corner CSS rules present');
assert(css.includes('.reg-brand-title'), '3D metallic gold title rule present');
assert(css.includes('--success-green: #10B981'), 'High-tech success green token present');
assert(css.includes('--error-red: #EF4444'), 'High-tech error red token present');
assert(css.includes('.verification-status-banner.verified'), 'Verified banner style present');
assert(css.includes('.verification-status-banner.unverified'), 'Unverified banner style present');

// --- 4. SCRIPT UI INTEGRATION ---
console.log('\n--- 4. Script Dynamic Updates ---');
assert(js.includes('updateCachedCountUI'), 'updateCachedCountUI function defined in script.js');
assert(js.includes('resetToNewParticipant'), 'resetToNewParticipant intact');
assert(js.includes('btnAddAnotherParticipant'), 'btnAddAnotherParticipant listener intact');

console.log('\n=================================================================');
console.log(`ALL VISUAL BRANDING TESTS COMPLETED: ${passedTests} / ${totalTests} PASSED`);
console.log('=================================================================');
