/**
 * CLIENT-SIDE STRUCTURAL & BEHAVIORAL VERIFICATION ENGINE
 * Validates Python 3 submissions without leaking plaintext solutions.
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

  const config = hexToJson(qData.rulesHex);

  // 1. Anti-Cheat: Reject trivial mock submissions
  if (lines.length < config.minLines) {
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
    // Error 1: qty > 5 (or qty >= 6)
    const e1 = /qty\s*>\s*5|qty\s*>=\s*6|5\s*<\s*qty/.test(codeClean) && !/qty\s*<\s*5/.test(codeClean);
    // Error 2: base * 0.10 (or subtotal)
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
    // Error 3: total cells (9 or len(grid)*len(grid[0]))
    const e3 = /total\s*\/\s*(9|len\s*\(\s*grid\s*\)\s*\*\s*len\s*\(\s*grid\s*\[\s*0\s*\]\s*\)|\(\s*len\s*\(\s*grid\s*\)\s*\*\s*len\s*\(\s*grid\s*\[\s*0\s*\]\s*\)\s*\))/.test(codeClean);
    // Error 4: grid[r][c] > row_avgs[r]
    const e4 = /grid\s*\[\s*r\s*\]\s*\[\s*c\s*\]\s*>\s*row_avgs\s*\[\s*r\s*\]/.test(codeClean) && !/grid\s*\[\s*r\s*\]\s*\[\s*c\s*\]\s*<=\s*row_avgs\s*\[\s*r\s*\]/.test(codeClean);
    // Error 5: col_sums[c] > max_c (finding peak column)
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

  if (qId === 'final_q1') {
    // Error 1: mid-tier fine calculation
    const e1 = /10(\.0)?\s*\+\s*\(?\s*\(\s*days\s*-\s*5\s*\)\s*\*\s*5(\.0)?\s*\)?|\(?\s*5\s*\*\s*2(\.0)?\s*\)?\s*\+\s*\(?\s*\(\s*days\s*-\s*5\s*\)\s*\*\s*5(\.0)?\s*\)?/.test(codeClean) && !/days\s*\*\s*5(\.0)?/.test(codeClean);
    // Error 2: ptype == 'Faculty' (comparison)
    const e2 = /if\s+ptype\s*==\s*['"]Faculty['"]\s*:/.test(codeClean);
    // Error 3: total_fines += f
    const e3 = /total_fines\s*\+=\s*f|total_fines\s*=\s*total_fines\s*\+\s*f/.test(codeClean) && !/total_fines\s*=\+\s*f/.test(codeClean);
    // Error 4: days > 10 for heavily overdue
    const e4 = /days\s*>\s*10/.test(codeClean) && !/days\s*<\s*10/.test(codeClean);
    // Error 5: max_fine = f
    const e5 = /max_fine\s*=\s*f\b/.test(codeClean) && !/max_fine\s*=\s*total_fines\b/.test(codeClean);

    if (e1) errorsFixed++;
    if (e2) errorsFixed++;
    if (e3) errorsFixed++;
    if (e4) errorsFixed++;
    if (e5) errorsFixed++;

    return { success: (errorsFixed === 5), errorsSolved: errorsFixed };
  }

  if (qId === 'final_q2') {
    // Error 1: name = t[0]
    const e1 = /t\s*\[\s*0\s*\]\s*,\s*t\s*\[\s*1\s*\]\s*,\s*t\s*\[\s*2\s*\]|name\s*=\s*t\s*\[\s*0\s*\]/.test(codeClean);
    // Error 2: scores[i] > 0
    const e2 = /scores\s*\[\s*i\s*\]\s*>\s*0/.test(codeClean) && !/scores\s*\[\s*i\s*\]\s*>=\s*0/.test(codeClean);
    // Error 3: solved == 3 (speed run bonus)
    const e3 = /solved\s*==\s*3/.test(codeClean) && !/len\s*\(\s*scores\s*\)\s*==\s*3/.test(codeClean);
    // Error 4: champion = name guarded by if net > top_score
    const e4 = /if\s+net\s*>\s*top_score\s*:\s*[\r\n]+\s*(?:top_score\s*=\s*net\s*[\r\n]+\s*champion\s*=\s*name|champion\s*=\s*name\s*[\r\n]+\s*top_score\s*=\s*net)/.test(codeClean) ||
               /if\s+net\s*>\s*top_score\s*:\s*top_score\s*=\s*net\s*;\s*champion\s*=\s*name|if\s+net\s*>\s*top_score\s*:\s*champion\s*=\s*name\s*;\s*top_score\s*=\s*net/.test(codeClean);
    // Error 5: penalty only for solved problems > 0
    const e5 = /sum\s*\(\s*times\s*\[\s*i\s*\]\s+for\s+i\s+in\s+range\s*\(\s*3\s*\)\s+if\s+scores\s*\[\s*i\s*\]\s*>\s*0\s*\)/.test(codeClean) ||
               /times\s*\[\s*i\s*\][\s\S]*?scores\s*\[\s*i\s*\]\s*>\s*0/.test(codeClean);

    if (e1) errorsFixed++;
    if (e2) errorsFixed++;
    if (e3) errorsFixed++;
    if (e4) errorsFixed++;
    if (e5) errorsFixed++;

    return { success: (errorsFixed === 5), errorsSolved: errorsFixed };
  }

  return { success: false, errorsSolved: 0 };
}
