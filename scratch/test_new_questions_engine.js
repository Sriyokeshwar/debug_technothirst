const fs = require('fs');

function verifySubmittedCode(qData, userCode) {
  if (!userCode || typeof userCode !== 'string') {
    return { success: false, errorsSolved: 0 };
  }

  const lines = userCode.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  // Anti-Cheat: Reject trivial mock submissions (too short)
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

    const e1 = /even\s*=\s*\[\s*x\s+for\s+x\s+in\s+values\s+if\s+x\s*%\s*2\s*==\s*0\s*\]/.test(codeClean);
    const e2 = /doubled\s*=/.test(codeClean) && /filtered\s*=/.test(codeClean);
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

// Test cases
const tests = [
  {
    id: 'semi_q1',
    buggy: `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 1]
total = sum(even)
avg = total / len(nums)
print("Even:", even)
print("Average:", avg)`,
    solved: `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 0]
total = sum(even)
avg = total / len(even)
print("Even:", even)
print("Average:", avg)`
  },
  {
    id: 'semi_q2',
    buggy: `def check(numbers, limit=10):
    result = []
    for n in numbers:
        if n > limit:
            result.append(str(n))
    total = sum(result)
    return result, total

data = [5, 15, 20, 8]
values, total = check(data, 10)
print(values)
print("Total:", total)`,
    solved: `def check(numbers, limit=10):
    result = []
    for n in numbers:
        if n > limit:
            result.append(n)
    total = sum(result)
    return result, total

data = [5, 15, 20, 8]
values, total = check(data, 10)
print(values)
print("Total:", total)`
  },
  {
    id: 'semi_q3',
    buggy: `text = "Python Python Java Python Java"
words = text.split()
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1
common = [w for w in count if count[w] > 1]
print("Count:", count)
print("Common:", common)
print(common[2])`,
    solved: `text = "Python Python Java Python Java"
words = text.split()
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1
common = [w for w in count if count[w] > 1]
print("Count:", count)
print("Common:", common)
print(common[1])`
  },
  {
    id: 'semi_q4',
    buggy: `class Student:
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
print(Student.total)`,
    solved: `class Student:
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
  },
  {
    id: 'final_q1',
    buggy: `print('mock')`,
    solved: `def process(values):
    even = [x for x in values if x % 2 == 0]
    doubled = list(map(lambda x: x * 2, even))
    filtered = [x for x in doubled if x > 20]
    return even, filtered

data = [4, 8, 12, 15, 20]
a, b = process(data)
print("Even:", a)
print("Filtered:", b)
print("Total:", sum(b))`
  },
  {
    id: 'final_q2',
    buggy: `def calculate(values):
    try:
        nums = [int(x) for x in values if x]
        positive = [x for x in nums if x > 0]
        negative = [x for x in nums if x < 0]
        maximum = max(negative)
        average = sum(nums) / len(values)
        return {"positive": positive, "negative": negative,
                "max": maximum, "avg": average}
    except ValueError:
        return "Invalid"

data = ["10", "-5", "20", "", "abc", "-2"]
result = calculate(data)
print(result["positive"])
print(result["max"])`,
    solved: `def calculate(values):
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
  }
];

let allPass = true;
tests.forEach(t => {
  const qData = { id: t.id };
  const rBuggy = verifySubmittedCode(qData, t.buggy);
  const rSolved = verifySubmittedCode(qData, t.solved);
  const rMock = verifySubmittedCode(qData, `print("mock")\nprint("test")\nprint("fake")\nprint("fake2")\nprint("fake3")`);

  console.log(`[${t.id}] Buggy: success=${rBuggy.success} errors=${rBuggy.errorsSolved} | Solved: success=${rSolved.success} errors=${rSolved.errorsSolved} | Mock: success=${rMock.success}`);

  if (rBuggy.success !== false) {
    console.error(`FAIL: ${t.id} buggy code should not pass`);
    allPass = false;
  }
  if (rSolved.success !== true || rSolved.errorsSolved !== 5) {
    console.error(`FAIL: ${t.id} solved code should pass with 5 errors`);
    allPass = false;
  }
  if (rMock.success !== false) {
    console.error(`FAIL: ${t.id} mock code should not pass`);
    allPass = false;
  }
});

if (allPass) {
  console.log('\n>>> ALL 6 QUESTIONS PASSED VERIFICATION TESTS! <<<');
} else {
  process.exit(1);
}
