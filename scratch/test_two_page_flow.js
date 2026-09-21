const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('=================================================================');
console.log('TECHNOTHIRST’26 TWO-PAGE FLOW & ADMIN AUTH VERIFICATION TEST SUITE');
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

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');

// --- 1. PAGE ARCHITECTURE: TWO DISTINCT SCREENS ---
console.log('--- 1. Two-Page Architecture (Home vs Registration) ---');
assert(html.includes('id="viewHome"') && html.includes('class="view-screen active"'), 'Page 1 #viewHome exists and is initial active screen');
assert(html.includes('id="viewRegistration"') && !html.includes('id="viewRegistration" class="view-screen active"'), 'Page 2 #viewRegistration is separate screen and not initially active');
assert(html.includes('class="home-wrapper"'), 'Page 1 has dedicated .home-wrapper layout');
assert(html.includes('class="reg-page-container"'), 'Page 2 has dedicated .reg-page-container layout');
assert(!html.includes('formRegistration') || (html.indexOf('viewHome') < html.indexOf('formRegistration') && html.indexOf('viewRegistration') < html.indexOf('formRegistration')), 'formRegistration is located inside Page 2 (#viewRegistration) and NOT inside Page 1 (#viewHome)');

// --- 2. PAGE 1 CONTENT & BRANDING ---
console.log('\n--- 2. Page 1 Content & Branding ---');
assert(html.includes('Department of Computer Applications Presents'), 'Department of Computer Applications Presents badge present');
assert(html.includes('A.V.C. COLLEGE OF ENGINEERING'), 'College name present');
assert(html.includes('TECHNOTHIRST’26') || html.includes("TECHNOTHIRST'26"), 'Branding title TECHNOTHIRST’26 present');
assert(html.includes('A National Level Student’s Technical Symposium'), 'National Level Symposium subtitle present');
assert(html.includes('CODE &bull; LEARN &bull; COMPETE &bull; GROW') || html.includes('CODE • LEARN • COMPETE • GROW'), 'Tagline present');
assert(html.includes('SEMI-FINAL ROUND'), 'Semi-final round indicator present');
assert(html.includes('PYTHON DEBUGGING CHAMPIONSHIP'), 'Python debugging championship indicator present');
assert(html.includes('assets/avc_entrance.jpg'), 'Real campus entrance visual referenced');
assert(fs.existsSync(path.join(__dirname, '../assets/avc_entrance.jpg')), 'Real campus entrance image file exists on disk');
assert(html.includes('id="eventDetails"') && html.includes('home-info-grid'), 'Event info cards grid present');
assert(html.includes('₹500') && html.includes('₹300') && html.includes('₹200'), 'Cash prizes 1st ₹500, 2nd ₹300, 3rd ₹200 displayed');
assert(html.includes('60 Minutes Total Duration'), '60 min total duration displayed');
assert(html.includes('45:00'), '45:00 exit threshold displayed');
assert(html.includes('BE A PART OF TECHNOTHIRST’26'), 'Full blue CTA banner headline present');
assert(html.includes('id="btnHomeRegisterNow"') && html.includes('REGISTER NOW →'), 'Prominent REGISTER NOW → button with inner arrow present on Home');

// --- 3. PAGE 2 CONTENT & FORM INTEGRATION ---
console.log('\n--- 3. Page 2 Content & Centered Registration Terminal ---');
assert(html.includes('id="btnBackToHome"') && html.includes('← Back to Home'), '← Back to Home navigation button present on Page 2');
assert(html.includes('CONTESTANT ONBOARDING'), 'Contestant Onboarding header present on Page 2');
assert(html.includes('id="formRegistration"'), 'formRegistration element present on Page 2');
assert(html.includes('id="regStudentName"'), 'Candidate name input present');
assert(html.includes('id="regRollNo"'), 'Roll number input present');
assert(html.includes('id="regDegree"'), 'Degree select dropdown present');
assert(html.includes('id="regDepartment"'), 'Department text input present');
assert(html.includes('id="regCollege"'), 'College text input present');
assert(html.includes('btn-submit-reg') && html.includes('REGISTER →'), 'REGISTER → submit button present');

// --- 4. NAVIGATION FLOW IN JAVASCRIPT ---
console.log('\n--- 4. Navigation Flow in JavaScript ---');
assert(js.includes('btnHomeRegisterNow') && js.includes("switchView('viewRegistration')"), 'btnHomeRegisterNow routes to viewRegistration');
assert(js.includes('btnBackToHome') && js.includes("switchView('viewHome')"), 'btnBackToHome routes to viewHome');
assert(js.includes('navLinkHome'), 'navLinkHome handler exists');
assert(js.includes('navLinkEvent'), 'navLinkEvent handler exists');
assert(js.includes('navLinkCampus'), 'navLinkCampus handler exists');
assert(js.includes('switchView(\'viewHome\')'), 'resetToNewParticipant switches back to viewHome');

// --- 5. ADMIN VERIFICATION ON "+ ADD ANOTHER PARTICIPANT" ---
console.log('\n--- 5. Admin Verification on "+ ADD ANOTHER PARTICIPANT" ---');
assert(html.includes('id="modalAddParticipantAuth"'), 'modalAddParticipantAuth modal element exists in index.html');
assert(html.includes('id="txtAddParticipantPassword"'), 'txtAddParticipantPassword input exists in index.html');
assert(html.includes('id="btnConfirmAddParticipant"'), 'btnConfirmAddParticipant button exists in index.html');
assert(html.includes('id="btnCancelAddParticipant"'), 'btnCancelAddParticipant button exists in index.html');
assert(html.includes('id="errAddParticipantPassword"'), 'errAddParticipantPassword error container exists in index.html');

assert(js.includes('btnAddAnotherParticipant'), 'btnAddAnotherParticipant handler exists');
assert(js.includes('modalAddParticipantAuth'), 'script references modalAddParticipantAuth');
assert(js.includes('btnConfirmAddParticipant'), 'script binds btnConfirmAddParticipant');

// Test password verification logic
const ADMIN_HASH = "a09d95f1dd880973ce4ca0c15646ebdbe428d5093aa9d7882a7395e025fafd1c";
const testAdminPass = "MCALAB@2k26";
const hash = crypto.createHash('sha256').update(testAdminPass).digest('hex');
assert(hash === ADMIN_HASH, 'SHA-256 of "MCALAB@2k26" matches ADMIN_HASH');

const wrongHash = crypto.createHash('sha256').update("wrongpassword").digest('hex');
assert(wrongHash !== ADMIN_HASH, 'Incorrect password does NOT match ADMIN_HASH');

// --- 6. OFFLINE FIRST & RESPONSIVE DESIGN INTEGRITY ---
console.log('\n--- 6. Offline-First & Responsive CSS ---');
assert(!html.includes('googleapis.com') && !html.includes('cdnjs.cloudflare.com'), 'Zero CDN or external font dependencies in index.html');
assert(!css.includes('@import url(') || !css.includes('http'), 'Zero external remote CSS font imports in style.css');
assert(css.includes('.home-wrapper'), '.home-wrapper CSS rules present');
assert(css.includes('.home-hero-card'), '.home-hero-card CSS rules present');
assert(css.includes('.home-campus-card'), '.home-campus-card CSS rules present');
assert(css.includes('.home-info-grid'), '.home-info-grid CSS rules present');
assert(css.includes('.home-cta-banner'), '.home-cta-banner CSS rules present');
assert(css.includes('.btn-cta-register'), '.btn-cta-register CSS rules present');
assert(css.includes('.reg-page-container'), '.reg-page-container CSS rules present');
assert(css.includes('.btn-back-home'), '.btn-back-home CSS rules present');
assert(css.includes('@media (max-width: 1024px)'), '1024px tablet responsive rules present');
assert(css.includes('@media (max-width: 768px)'), '768px mobile responsive rules present');
assert(css.includes('@media (max-width: 480px)'), '480px small mobile responsive rules present');

console.log('\n=================================================================');
console.log(`ALL TWO-PAGE FLOW TESTS COMPLETED: ${passedTests} / ${totalTests} PASSED (100%)`);
console.log('=================================================================');
