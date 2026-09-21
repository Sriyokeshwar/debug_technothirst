/**
 * CLIENT-SIDE STRUCTURAL & BEHAVIORAL VERIFICATION ENGINE
 * Validates Python 3 submissions for the updated questions.
 */
function hexToJson(hexStr) {
  let str = '';
  for (let i = 0; i < hexStr.length; i += 2) {
    str += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
  }
  return JSON.parse(str);
}

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
    const hasListOrLoop = /\[.*?for\s+n\s+in\s+nums.*?\]|for\s+n\s+in\s+nums\s*:/.test(codeClean);
    if (!hasListOrLoop) return { success: false, errorsSolved: 0 };

    // Error 1: even condition fixed (n % 2 == 0 or n % 2 != 1)
    const e1 = /(?:n\s*%\s*2\s*==\s*0|n\s*%\s*2\s*!=\s*1|not\s*\(?\s*n\s*%\s*2\s*\)?|\(?\s*n\s*&\s*1\s*\)?\s*==\s*0)/.test(codeClean) && !/n\s*%\s*2\s*==\s*1/.test(codeClean);
    // Error 2: average divided by len(even) or count of evens
    const e2 = /(?:total\s*\/\s*len\s*\(\s*even\s*\)|len\s*\(\s*even\s*\))/.test(codeClean) && !/total\s*\/\s*len\s*\(\s*nums\s*\)/.test(codeClean);

    if (e1) errorsFixed += 2;
    if (e2) errorsFixed += 3;
    const allFixed = (e1 && e2);
    return { success: allFixed, errorsSolved: allFixed ? 5 : (e1 ? 2 : (e2 ? 3 : 0)) };
  }

  if (qId === 'semi_q2') {
    const hasFunc = /def\s+check\s*\(/.test(codeClean);
    const hasLoop = /for\s+n\s+in\s+numbers\s*:/.test(codeClean);
    if (!hasFunc || !hasLoop) return { success: false, errorsSolved: 0 };

    // Error 1: append number directly (n or int(n)), not str(n)
    const e1 = !/result\.append\s*\(\s*str\s*\(/.test(codeClean) && /result\.append\s*\(\s*(?:int\()?\s*n\s*\)?\s*\)/.test(codeClean);
    // Error 2: total is calculated with sum
    const e2 = /total\s*=\s*sum\s*\(\s*result\s*\)|sum\s*\(\s*result\s*\)/.test(codeClean);

    if (e1) errorsFixed += 3;
    if (e2) errorsFixed += 2;
    const allFixed = (e1 && e2);
    return { success: allFixed, errorsSolved: allFixed ? 5 : (e1 ? 3 : 0) };
  }

  if (qId === 'semi_q3') {
    const hasCount = /count\s*\[\s*word\s*\]/.test(codeClean);
    if (!hasCount) return { success: false, errorsSolved: 0 };

    // Error 1: index out of bounds fixed (e.g. common[1], common[0], common[-1] instead of common[2])
    const e1 = !/common\s*\[\s*2\s*\]/.test(codeClean) && /(?:common\s*\[\s*(?:1|0|-1)\s*\]|common\s*\[\s*len\s*\(\s*common\s*\)\s*-\s*1\s*\]|try\s*:[\s\S]*?common\s*\[\s*2\s*\][\s\S]*?except\s+IndexError)/.test(codeClean);
    // Error 2: common words filter preserved/valid
    const e2 = /common\s*=\s*\[\s*w\s+for\s+w\s+in\s+count\s+if\s+count\s*\[\s*w\s*\]\s*>\s*1\s*\]/.test(codeClean);

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
