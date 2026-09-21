/**
 * TECHNOTHIRST’26 — PYTHON DEBUGGING CHAMPIONSHIP
 * Department of Computer Applications (MCA)
 * A.V.C. College of Engineering (Autonomous)
 *
 * NON-NEGOTIABLE CORE ARCHITECTURE:
 * - HTML5 + CSS3 + Pure Vanilla JavaScript ONLY
 * - Zero external libraries, zero CDNs, zero frameworks, zero backend
 * - Deterministic debugging answer verification engine
 * - Fully working offline countdown timer
 * - Robust state preservation across question navigation
 * - LocalStorage persistence with TECHNOTHIRST26_DEBUGGING_TEST_ prefix
 */

(function () {
  'use strict';

  /* =========================================================================
     1. GLOBAL CONSTANTS & QUESTION BANK
     ========================================================================= */
  const STORAGE_PREFIX = 'TECHNOTHIRST26_DEBUGGING_TEST_';
  const STORAGE_KEY_STATE = STORAGE_PREFIX + 'SESSION_STATE';
  const TEST_TOTAL_TIME = 3600; // 60 minutes in seconds
  const WARNING_TIME = 300;     // 5 minutes in seconds

  /**
   * Comprehensive Data Bank of 8 Python Debugging Questions
   * Supporting: id, language, difficulty, title, code, question, options, correctOption (0-indexed), explanation
   */
  const QUESTIONS_DATA = [
    // QUESTION 1
    {
      id: 1,
      language: 'Python 3',
      difficulty: 'Easy',
      title: 'List Even Filtering & Average Calculation',
      code: `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 1]
total = sum(even)
avg = total / len(nums)
print("Even:", even)
print("Average:", avg)`,
      question: 'Which issues cause this code to filter odd numbers instead of even, and compute an incorrect average of the filtered elements?',
      options: [
        "The modulo condition checks for odd numbers (n % 2 == 1) and the divisor divides by len(nums) instead of len(even)",
        "The list comprehension has a syntax error and sum() cannot be called on a list",
        "The nums list must be sorted first before filtering, and avg requires floating-point cast",
        "print() cannot accept multiple arguments and total requires manual initialization"
      ],
      correctOption: 0,
      explanation: "1) 'n % 2 == 1' filters odd numbers ([15, 21]); to collect even numbers, it must be 'n % 2 == 0'. 2) 'total / len(nums)' divides by 5 (original list length) rather than 3 ('len(even)'), producing 14.4 instead of the true average 18.0."
    },

    // QUESTION 2
    {
      id: 2,
      language: 'Python 3',
      difficulty: 'Easy',
      title: 'Threshold Filter & TypeError Accumulator',
      code: `def check(numbers, limit=10):
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
      question: "Running this code raises a 'TypeError: unsupported operand type(s) for +: int and str'. What causes this error and how should it be resolved?",
      options: [
        "The default parameter limit=10 is immutable and cannot be compared with numbers in data",
        "result.append(str(n)) converts numbers to strings, causing sum(result) to fail; append n as a numeric integer instead",
        "check() returns a tuple which cannot be unpacked into values, total",
        "The for loop exceeds the list boundaries of data"
      ],
      correctOption: 1,
      explanation: "Casting 'n' to 'str(n)' creates a list of strings (['15', '20']). Built-in sum() starts with default integer accumulator 0 and attempts 0 + '15', raising TypeError. Appending 'n' directly as a numeric integer allows sum() to calculate 15 + 20 = 35."
    },

    // QUESTION 3
    {
      id: 3,
      language: 'Python 3',
      difficulty: 'Medium',
      title: 'Word Frequency Counter & Index Out of Bounds',
      code: `text = "Python Python Java Python Java"
words = text.split()
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1
common = [w for w in count if count[w] > 1]
print("Count:", count)
print("Common:", common)
print(common[2])`,
      question: "Why does the final line print(common[2]) crash with 'IndexError: list index out of range'?",
      options: [
        "count.get(word, 0) fails to increment dictionary values beyond 1",
        "text.split() splits individual characters instead of whitespace-delimited words",
        "common contains only 2 distinct repeated words (['Python', 'Java']), so index 2 is out of bounds; valid indices are 0 and 1",
        "Dictionary keys cannot be iterated in list comprehensions without calling .keys()"
      ],
      correctOption: 2,
      explanation: "There are only two unique words occurring more than once: 'Python' (count: 3) and 'Java' (count: 2). Hence 'common' has length 2. In 0-indexed Python lists, valid indices are 0 and 1. Accessing index 2 attempts to read a 3rd non-existent element."
    },

    // QUESTION 4
    {
      id: 4,
      language: 'Python 3',
      difficulty: 'Hard',
      title: 'Class Variable Scoping & Method Invocation',
      code: `class Student:
    total = 0
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks
        total += 1
    def average(self):
        return sum(marks) / len(marks)
    def result():
        return "PASS" if average() >= 50 else "FAIL"

s = Student("Arun", [60, 70, 40])
print(s.name, s.average, s.result())
print(Student.total)`,
      question: "Which set of corrections resolves the OOP scoping, missing self references, and method invocation errors in this class?",
      options: [
        "Change total += 1 to Student.total += 1, use self.marks, add self to def result(self), invoke self.average(), and call s.average()",
        "Declare global total in every method, make average a @classmethod, and change Student.total to s.__total__",
        "Pass marks as a dictionary, remove self from __init__, and use Student.average(s)",
        "Rename Student to student_class, change result() to return boolean, and instantiate without arguments"
      ],
      correctOption: 0,
      explanation: "1) 'total' is a class variable; inside __init__ it must be 'Student.total += 1'. 2) 'marks' in average() must be 'self.marks'. 3) Instance method 'result' requires 'def result(self)'. 4) Calling average() inside result must be 'self.average()'. 5) Printing 's.average' prints the method reference; it must be called as 's.average()'."
    },

    // QUESTION 5
    {
      id: 5,
      language: 'Python 3',
      difficulty: 'Medium',
      title: 'Functional Transformations & List Comprehensions',
      code: `def process(values):
    even = [x for x in values if x % 2 == 0]
    doubled = list(map(lambda x: x * 2, even))
    filtered = [x for x in doubled if x > 20]
    total = sum(filtered)
    return even, filtered, total

data = [4, 7, 8, 12, 15, 20]
e, f, t = process(data)
print("Even:", e)
print("Filtered:", f)
print("Total:", t)`,
      question: "What will be printed as 'Filtered' and 'Total' when this processing pipeline executes with data = [4, 7, 8, 12, 15, 20]?",
      options: [
        "Filtered: [8, 16, 24, 40], Total: 88",
        "Filtered: [24, 40], Total: 64",
        "Filtered: [12, 20], Total: 32",
        "Filtered: [30, 40], Total: 70"
      ],
      correctOption: 1,
      explanation: "1) Even values are [4, 8, 12, 20]. 2) Doubled values are [8, 16, 24, 40]. 3) Values strictly greater than 20 are [24, 40]. 4) Their sum is 24 + 40 = 64."
    },

    // QUESTION 6
    {
      id: 6,
      language: 'Python 3',
      difficulty: 'Hard',
      title: 'Robust String Parsing & Type Sanitization',
      code: `def calculate(values):
    nums = [int(x) for x in values if x]
    positive = [x for x in nums if x > 0]
    negative = [x for x in nums if x < 0]
    avg = sum(nums) / len(values)
    result = {
        "positive": positive,
        "max_neg": max(negative) if negative else 0,
        "avg": avg
    }
    return result

data = ["10", "-2", "20", "0", "abc"]
res = calculate(data)
print(res["positive"])
print(res["max_neg"])`,
      question: "Why does calculate(data) crash with 'ValueError: invalid literal for int() with base 10: abc' and what is the proper fix?",
      options: [
        "Negative string '-2' cannot be parsed by int(); replace with abs(int(x))",
        "Non-numeric string 'abc' cannot be converted to int; validate with x.lstrip('-').isdigit() or wrap in try-except ValueError",
        "Dictionary keys must be integers rather than strings like 'positive'",
        "len(values) returns a float causing a division error"
      ],
      correctOption: 1,
      explanation: "int('abc') raises ValueError. Merely checking 'if x' verifies non-emptiness but not whether the string contains numeric characters. Checking 'x.lstrip('-').isdigit()' or using 'try-except ValueError' filters out non-integers, safely yielding positive=[10, 20] and max_neg=-2."
    },

    // QUESTION 7
    {
      id: 7,
      language: 'Python 3',
      difficulty: 'Medium',
      title: 'Default Mutable Parameter Trap',
      code: `def append_entry(item, items_list=[]):
    items_list.append(item)
    return items_list

a = append_entry("A")
b = append_entry("B")
print("A:", a)
print("B:", b)`,
      question: "Why does print('B:', b) unexpectedly output ['A', 'B'] instead of ['B']?",
      options: [
        "In Python, default parameter expressions are evaluated only once when the function is defined, sharing the mutable list across all calls",
        "Variables a and b share the same global memory pointer in the stack",
        "append() is a memoized recursive operator in Python 3",
        "Strings are immutable objects and automatically overwrite list pointers"
      ],
      correctOption: 0,
      explanation: "Python default arguments are evaluated once at function definition time, NOT upon each call. The empty list [] is retained and modified in-place across successive invocations. The standard fix is: 'def append_entry(item, items_list=None): if items_list is None: items_list = []'."
    },

    // QUESTION 8
    {
      id: 8,
      language: 'Python 3',
      difficulty: 'Medium',
      title: 'Dictionary Key Mutation & Reference Aliasing',
      code: `def update_records(record, field, value):
    new_record = record
    new_record[field] = value
    return new_record

orig = {"name": "Siva", "score": 85}
modified = update_records(orig, "score", 95)
print("Original:", orig["score"])
print("Modified:", modified["score"])`,
      question: "Why does orig['score'] print 95 instead of preserving the original score 85?",
      options: [
        "Assignment 'new_record = record' creates a reference alias pointing to the same dictionary object in memory, not a separate copy",
        "Integers in dictionaries are automatically converted to pointers in Python runtime",
        "orig is defined in the global module scope and cannot be protected inside functions",
        "Python dictionaries require explicit memory lock statements to prevent in-place mutation"
      ],
      correctOption: 0,
      explanation: "In Python, variable assignment does not copy objects; it merely binds a new name to the existing object reference. To preserve 'orig', create an explicit shallow copy via 'record.copy()' or 'dict(record)'."
    }
  ];

  /* =========================================================================
     2. APPLICATION STATE MANAGEMENT
     ========================================================================= */
  let state = {
    currentQuestionIndex: 0,
    answers: {},       // { qId: selectedOptionIndex }
    verified: {},      // { qId: true/false }
    results: {},       // { qId: isCorrect (boolean) }
    score: 0,
    timeRemaining: TEST_TOTAL_TIME,
    testSubmitted: false,
    startTime: Date.now()
  };

  let timerInterval = null;

  /* =========================================================================
     3. INITIALIZATION & STORAGE RESTORATION
     ========================================================================= */
  function initTest() {
    loadState();
    renderQuestion();
    renderQuestionNavigator();
    updateProgressUI();
    startTimer();
    bindEventListeners();
  }

  function createFreshState() {
    return {
      currentQuestionIndex: 0,
      answers: {},
      verified: {},
      results: {},
      score: 0,
      timeRemaining: TEST_TOTAL_TIME,
      testSubmitted: false,
      startTime: Date.now()
    };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage unavailable or disabled:', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          state = Object.assign(createFreshState(), parsed);
          // Sanitize current index
          if (state.currentQuestionIndex < 0 || state.currentQuestionIndex >= QUESTIONS_DATA.length) {
            state.currentQuestionIndex = 0;
          }
          if (state.testSubmitted) {
            showResults();
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved state:', e);
    }
    state = createFreshState();
  }

  function resetTest() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    try {
      localStorage.removeItem(STORAGE_KEY_STATE);
    } catch (e) {}

    state = createFreshState();
    saveState();

    // Reset views
    document.getElementById('mainWorkspace').style.display = 'block';
    document.getElementById('resultsScreen').style.display = 'none';
    
    // Reset timer styling
    const timerCard = document.getElementById('headerTimerCard');
    const timerWidget = document.getElementById('sidebarTimerWidget');
    if (timerCard) timerCard.classList.remove('warning');
    if (timerWidget) timerWidget.classList.remove('warning');

    renderQuestion();
    renderQuestionNavigator();
    updateProgressUI();
    startTimer();
    showToast('Test session reset successfully. Timer restarted.', 'info');
  }

  /* =========================================================================
     4. QUESTION & SYNTAX RENDERING
     ========================================================================= */
  function renderQuestion() {
    const q = QUESTIONS_DATA[state.currentQuestionIndex];
    if (!q) return;

    // Header Badges
    const numBadge = document.getElementById('lblQuestionNumber');
    const diffBadge = document.getElementById('lblDifficulty');
    const langText = document.getElementById('lblLangText');
    const qTitle = document.getElementById('lblQuestionTitle');
    const fileName = document.getElementById('lblEditorFileName');
    const instText = document.getElementById('lblInstructionText');

    if (numBadge) numBadge.textContent = `QUESTION 0${q.id}`;
    if (diffBadge) {
      diffBadge.textContent = q.difficulty;
      diffBadge.className = `q-difficulty-badge ${q.difficulty.toLowerCase()}`;
    }
    if (langText) langText.textContent = q.language;
    if (qTitle) qTitle.textContent = q.title;
    if (fileName) fileName.textContent = `question_0${q.id}_debug.py`;
    if (instText) instText.textContent = q.question;

    // Code & Gutter
    renderCodeEditor(q.code);

    // Options List
    renderOptions(q);

    // Restore previous verification state if already verified
    restoreQuestionState(q);

    // Prev / Next button states
    const btnPrev = document.getElementById('btnPrevQuestion');
    const btnNext = document.getElementById('btnNextQuestion');
    if (btnPrev) btnPrev.disabled = (state.currentQuestionIndex === 0);
    if (btnNext) {
      if (state.currentQuestionIndex === QUESTIONS_DATA.length - 1) {
        btnNext.innerHTML = `<span>Submit Test</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      } else {
        btnNext.innerHTML = `<span>Next Question</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      }
    }

    renderQuestionNavigator();
  }

  /**
   * Generates line numbers and syntax highlighted spans
   */
  function renderCodeEditor(rawCode) {
    const gutterEl = document.getElementById('codeGutter');
    const codeContentEl = document.getElementById('codeContent');
    if (!gutterEl || !codeContentEl) return;

    const lines = rawCode.split('\n');
    let gutterHtml = '';
    let codeHtml = '';

    lines.forEach((line, idx) => {
      gutterHtml += `<span>${idx + 1}</span>`;
      codeHtml += highlightPythonLine(line) + (idx < lines.length - 1 ? '\n' : '');
    });

    gutterEl.innerHTML = gutterHtml;
    codeContentEl.innerHTML = `<code>${codeHtml}</code>`;
  }

  /**
   * Deterministic client-side Python syntax highlighter
   */
  function highlightPythonLine(line) {
    if (!line) return '';

    // Separate comment if present
    let codePart = line;
    let commentPart = '';
    const commentIdx = line.indexOf('#');
    if (commentIdx !== -1) {
      codePart = line.substring(0, commentIdx);
      commentPart = `<span class="syn-comment">${escapeHtml(line.substring(commentIdx))}</span>`;
    }

    let escaped = escapeHtml(codePart);

    // Strings: single and double quotes
    escaped = escaped.replace(/(f?&quot;.*?&quot;|f?&#39;.*?&#39;|f?".*?"|f?'.*?')/g, '<span class="syn-str">$1</span>');

    // Keywords
    const keywords = [
      'def', 'return', 'if', 'elif', 'else', 'for', 'in', 'range',
      'while', 'class', 'import', 'from', 'as', 'try', 'except',
      'finally', 'raise', 'pass', 'lambda', 'with', 'global',
      'and', 'or', 'not', 'is', 'True', 'False', 'None'
    ];
    keywords.forEach(kw => {
      const reg = new RegExp(`\\b(${kw})\\b`, 'g');
      escaped = escaped.replace(reg, '<span class="syn-kw">$1</span>');
    });

    // Builtins
    const builtins = ['print', 'sum', 'len', 'max', 'min', 'map', 'list', 'dict', 'set', 'int', 'str', 'float', 'abs'];
    builtins.forEach(bi => {
      const reg = new RegExp(`\\b(${bi})\\b`, 'g');
      escaped = escaped.replace(reg, '<span class="syn-builtin">$1</span>');
    });

    // Numbers
    escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syn-num">$1</span>');

    return escaped + commentPart;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Renders the 4 options cards for current question
   */
  function renderOptions(q) {
    const listEl = document.getElementById('optionsList');
    if (!listEl) return;

    const letters = ['A', 'B', 'C', 'D'];
    const currentAnswer = state.answers[q.id];
    const isVerified = Boolean(state.verified[q.id]);

    let html = '';
    q.options.forEach((optText, optIdx) => {
      const isSelected = (currentAnswer === optIdx);
      let cardClass = 'option-card';
      let statusIcon = '';

      if (isSelected) cardClass += ' selected';
      if (isVerified) {
        cardClass += ' locked';
        if (optIdx === q.correctOption) {
          cardClass += ' verified-correct';
          statusIcon = '✓';
        } else if (isSelected) {
          cardClass += ' verified-incorrect';
          statusIcon = '✕';
        }
      }

      html += `
        <div class="${cardClass}" data-opt-idx="${optIdx}" role="radio" aria-checked="${isSelected}" tabindex="${isVerified ? -1 : 0}">
          <span class="option-badge">${letters[optIdx]}</span>
          <div class="option-text">${escapeHtml(optText)}</div>
          <span class="option-status-icon">${statusIcon}</span>
        </div>
      `;
    });

    listEl.innerHTML = html;

    // Attach click listeners to cards
    const cards = listEl.querySelectorAll('.option-card');
    cards.forEach(card => {
      card.addEventListener('click', function () {
        if (isVerified) return; // Answer locked
        const idx = parseInt(this.getAttribute('data-opt-idx'), 10);
        selectOption(idx);
      });

      // Keyboard accessibility (Space / Enter)
      card.addEventListener('keydown', function (e) {
        if (isVerified) return;
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          const idx = parseInt(this.getAttribute('data-opt-idx'), 10);
          selectOption(idx);
        }
      });
    });
  }

  /* =========================================================================
     5. ANSWER SELECTION & VERIFICATION ENGINE (CORE FIX)
     ========================================================================= */
  function selectOption(optIdx) {
    const q = QUESTIONS_DATA[state.currentQuestionIndex];
    if (!q || state.verified[q.id]) return; // Locked

    state.answers[q.id] = optIdx;
    saveState();

    // Update active class on DOM option cards
    const cards = document.querySelectorAll('#optionsList .option-card');
    cards.forEach(card => {
      const idx = parseInt(card.getAttribute('data-opt-idx'), 10);
      if (idx === optIdx) {
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
      } else {
        card.classList.remove('selected');
        card.setAttribute('aria-checked', 'false');
      }
    });

    // Hide any previous stale verification banner
    const verCard = document.getElementById('verificationCard');
    if (verCard) verCard.style.display = 'none';

    renderQuestionNavigator();
  }

  /**
   * VERIFY ANSWER — Reusable, Deterministic, Single-Invocation Function
   */
  function verifyAnswer() {
    const q = QUESTIONS_DATA[state.currentQuestionIndex];
    if (!q) return;

    // 1. Prevent verification if already verified (prevents multiple score increments)
    if (state.verified[q.id]) {
      showToast('This question has already been verified and locked.', 'info');
      return;
    }

    // 2. Validate selection presence
    const selectedIdx = state.answers[q.id];
    if (selectedIdx === undefined || selectedIdx === null) {
      showToast('⚠️ Please select an answer option first before clicking Verify.', 'error');
      // Gentle pulse animation on options container
      const optContainer = document.getElementById('optionsContainer');
      if (optContainer) {
        optContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // 3. Evaluate correctness
    const isCorrect = (selectedIdx === q.correctOption);

    // 4. Lock and update state
    state.verified[q.id] = true;
    state.results[q.id] = isCorrect;

    if (isCorrect) {
      state.score += 10;
      showToast('✓ Correct diagnosis! +10 Points awarded.', 'success');
    } else {
      showToast('✕ Incorrect diagnosis. Review the technical explanation.', 'error');
    }

    saveState();

    // 5. Update UI feedback
    renderOptions(q);
    showVerificationFeedback(isCorrect, q.explanation);
    renderQuestionNavigator();
    updateProgressUI();

    // 6. Automatically focus Next button for rapid keyboard flow
    const btnNext = document.getElementById('btnNextQuestion');
    if (btnNext) btnNext.focus();
  }

  function showVerificationFeedback(isCorrect, explanation) {
    const card = document.getElementById('verificationCard');
    const header = document.getElementById('feedbackHeader');
    const icon = document.getElementById('feedbackIcon');
    const title = document.getElementById('feedbackTitle');
    const text = document.getElementById('explanationText');
    const btnVerify = document.getElementById('btnVerifyAnswer');

    if (!card || !header || !icon || !title || !text) return;

    card.style.display = 'flex';
    card.className = `verification-card ${isCorrect ? 'correct' : 'incorrect'}`;

    if (isCorrect) {
      icon.textContent = '✓';
      title.textContent = 'CORRECT ANSWER! (+10 PTS)';
    } else {
      icon.textContent = '✕';
      title.textContent = 'INCORRECT DIAGNOSIS (0 PTS)';
    }

    text.textContent = explanation;

    if (btnVerify) {
      btnVerify.disabled = true;
      btnVerify.innerHTML = `<span>✓ VERIFIED</span>`;
    }
  }

  function restoreQuestionState(q) {
    const verCard = document.getElementById('verificationCard');
    const btnVerify = document.getElementById('btnVerifyAnswer');

    if (state.verified[q.id]) {
      const isCorrect = Boolean(state.results[q.id]);
      showVerificationFeedback(isCorrect, q.explanation);
    } else {
      if (verCard) verCard.style.display = 'none';
      if (btnVerify) {
        btnVerify.disabled = false;
        btnVerify.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>VERIFY ANSWER</span>
        `;
      }
    }
  }

  /* =========================================================================
     6. QUESTION NAVIGATION (PREV, NEXT, PILL JUMP)
     ========================================================================= */
  function nextQuestion() {
    if (state.currentQuestionIndex < QUESTIONS_DATA.length - 1) {
      state.currentQuestionIndex++;
      saveState();
      renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Last question reached: prompt submit modal
      openSubmitModal();
    }
  }

  function previousQuestion() {
    if (state.currentQuestionIndex > 0) {
      state.currentQuestionIndex--;
      saveState();
      renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function jumpToQuestion(index) {
    if (index >= 0 && index < QUESTIONS_DATA.length) {
      state.currentQuestionIndex = index;
      saveState();
      renderQuestion();
    }
  }

  /**
   * Renders the 8 Question Navigator Pills
   */
  function renderQuestionNavigator() {
    const gridEl = document.getElementById('qNavGrid');
    if (!gridEl) return;

    let html = '';
    QUESTIONS_DATA.forEach((q, idx) => {
      const isCurrent = (idx === state.currentQuestionIndex);
      const isAnswered = (state.answers[q.id] !== undefined);
      const isVerified = Boolean(state.verified[q.id]);
      const isCorrect = Boolean(state.results[q.id]);

      let pillClass = 'q-nav-pill';
      let icon = `Q${idx + 1}`;

      if (isCurrent) pillClass += ' active';

      if (isVerified) {
        if (isCorrect) {
          pillClass += ' correct';
          icon = '✓';
        } else {
          pillClass += ' incorrect';
          icon = '✕';
        }
      } else if (isAnswered) {
        pillClass += ' selected-unverified';
      }

      html += `
        <button type="button" class="${pillClass}" data-q-idx="${idx}" title="Question ${idx + 1}: ${q.title}">
          ${icon}
        </button>
      `;
    });

    gridEl.innerHTML = html;

    // Attach click listeners to navigator buttons
    const buttons = gridEl.querySelectorAll('.q-nav-pill');
    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-q-idx'), 10);
        jumpToQuestion(idx);
      });
    });
  }

  function updateProgressUI() {
    const total = QUESTIONS_DATA.length;
    let answeredCount = 0;
    let correctCount = 0;

    QUESTIONS_DATA.forEach(q => {
      if (state.answers[q.id] !== undefined) answeredCount++;
      if (state.results[q.id] === true) correctCount++;
    });

    const percent = Math.round((answeredCount / total) * 100);

    const lblProgress = document.getElementById('lblProgressPercentage');
    const fillBar = document.getElementById('progressBarFill');
    const lblScore = document.getElementById('lblCurrentScore');
    const lblAnswered = document.getElementById('lblAnsweredCount');
    const lblAccuracy = document.getElementById('lblAccuracy');

    if (lblProgress) lblProgress.textContent = `${percent}%`;
    if (fillBar) fillBar.style.width = `${percent}%`;
    if (lblScore) lblScore.textContent = state.score;
    if (lblAnswered) lblAnswered.textContent = `${answeredCount}/${total}`;
    if (lblAccuracy) {
      lblAccuracy.textContent = answeredCount > 0 ? `${Math.round((correctCount / answeredCount) * 100)}%` : '--';
    }
  }

  /* =========================================================================
     7. TIMER ENGINE (COUNTDOWN)
     ========================================================================= */
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    updateTimerDisplay();

    timerInterval = setInterval(() => {
      if (state.testSubmitted) {
        clearInterval(timerInterval);
        return;
      }

      state.timeRemaining--;

      if (state.timeRemaining <= 0) {
        state.timeRemaining = 0;
        clearInterval(timerInterval);
        updateTimerDisplay();
        autoFinishTest();
      } else {
        updateTimerDisplay();
        // Periodically save timer state
        if (state.timeRemaining % 5 === 0) {
          saveState();
        }
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const totalSec = Math.max(0, state.timeRemaining);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    const headerDisplay = document.getElementById('headerTimerDisplay');
    const sidebarDisplay = document.getElementById('sidebarTimerDisplay');
    const progressFill = document.getElementById('timerProgressFill');
    const timerCard = document.getElementById('headerTimerCard');
    const timerWidget = document.getElementById('sidebarTimerWidget');

    if (headerDisplay) headerDisplay.textContent = formatted;
    if (sidebarDisplay) sidebarDisplay.textContent = formatted;

    // Progress bar fill
    if (progressFill) {
      const pct = (totalSec / TEST_TOTAL_TIME) * 100;
      progressFill.style.width = `${pct}%`;
    }

    // Warning styling under 5 minutes
    if (totalSec <= WARNING_TIME) {
      if (timerCard) timerCard.classList.add('warning');
      if (timerWidget) timerWidget.classList.add('warning');
    } else {
      if (timerCard) timerCard.classList.remove('warning');
      if (timerWidget) timerWidget.classList.remove('warning');
    }
  }

  function autoFinishTest() {
    showToast('⏱️ Time expired! Automatically submitting your examination...', 'error');
    finalizeTestSubmission();
  }

  /* =========================================================================
     8. MODALS & SUBMISSION WORKFLOW
     ========================================================================= */
  function openSubmitModal() {
    const modal = document.getElementById('modalSubmitConfirm');
    if (!modal) return;

    const total = QUESTIONS_DATA.length;
    let answered = 0;
    QUESTIONS_DATA.forEach(q => {
      if (state.answers[q.id] !== undefined) answered++;
    });
    const unanswered = total - answered;

    const lblTotal = document.getElementById('modalSummaryTotal');
    const lblAttempted = document.getElementById('modalSummaryAttempted');
    const lblUnanswered = document.getElementById('modalSummaryUnanswered');
    const lblScore = document.getElementById('modalSummaryScore');

    if (lblTotal) lblTotal.textContent = total;
    if (lblAttempted) lblAttempted.textContent = answered;
    if (lblUnanswered) lblUnanswered.textContent = unanswered;
    if (lblScore) lblScore.textContent = `${state.score} / ${total * 10}`;

    modal.classList.add('active');
  }

  function closeSubmitModal() {
    const modal = document.getElementById('modalSubmitConfirm');
    if (modal) modal.classList.remove('active');
  }

  function finalizeTestSubmission() {
    closeSubmitModal();
    state.testSubmitted = true;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    saveState();
    showResults();
  }

  /* =========================================================================
     9. OFFICIAL CERTIFICATE & AUDIT SCORECARD
     ========================================================================= */
  function showResults() {
    document.getElementById('mainWorkspace').style.display = 'none';
    const resScreen = document.getElementById('resultsScreen');
    if (!resScreen) return;
    resScreen.style.display = 'block';

    const totalQ = QUESTIONS_DATA.length;
    let correctCount = 0;
    let attemptedCount = 0;

    QUESTIONS_DATA.forEach(q => {
      if (state.answers[q.id] !== undefined) attemptedCount++;
      if (state.results[q.id] === true) correctCount++;
    });

    const incorrectCount = attemptedCount - correctCount;
    const finalScore = state.score;
    const maxScore = totalQ * 10;
    const accuracyPct = Math.round((correctCount / totalQ) * 100);
    const timeUsedSec = TEST_TOTAL_TIME - state.timeRemaining;
    const usedMins = Math.floor(timeUsedSec / 60);
    const usedSecs = timeUsedSec % 60;
    const formattedUsed = `${usedMins}m ${usedSecs.toString().padStart(2, '0')}s`;

    // Populate Metrics
    document.getElementById('resFinalScore').textContent = `${finalScore} / ${maxScore}`;
    document.getElementById('resPercentage').textContent = `${accuracyPct}%`;
    document.getElementById('resCorrectCount').textContent = `${correctCount} / ${totalQ}`;
    document.getElementById('resIncorrectCount').textContent = `${incorrectCount} Incorrect &bull; ${totalQ - attemptedCount} Skipped`;
    document.getElementById('resTimeUsed').textContent = formattedUsed;

    // Performance Honor Badge
    const badgeEl = document.getElementById('resHonorBadge');
    const descEl = document.getElementById('resHonorDesc');
    if (accuracyPct >= 80) {
      badgeEl.textContent = '🌟 DISTINGUISHED MASTER DEBUGGER';
      badgeEl.style.background = 'linear-gradient(135deg, #059669, #10b981)';
      descEl.textContent = 'Exemplary proficiency in algorithmic analysis, scope resolution, and runtime defect correction.';
    } else if (accuracyPct >= 50) {
      badgeEl.textContent = '⭐ PROFICIENT PYTHON DEBUGGER';
      badgeEl.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
      descEl.textContent = 'Solid comprehension of Python core semantics, type management, and common software bug patterns.';
    } else {
      badgeEl.textContent = '🏅 COMPETITION PARTICIPANT';
      badgeEl.style.background = 'linear-gradient(135deg, #475569, #334155)';
      descEl.textContent = 'Completed the Technothirst’26 National Technical Symposium Python Debugging Examination.';
    }

    // Populate Technical Audit Table
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    const letters = ['A', 'B', 'C', 'D'];
    let auditHtml = '';

    QUESTIONS_DATA.forEach((q, idx) => {
      const selectedIdx = state.answers[q.id];
      const isCorrect = (state.results[q.id] === true);
      const isAttempted = (selectedIdx !== undefined);

      let statusBadge = '<span class="audit-badge skipped">UNANSWERED</span>';
      let pts = '0';
      let chosenText = '<em>None selected</em>';

      if (isAttempted) {
        chosenText = `<strong>Option ${letters[selectedIdx]}:</strong> ${escapeHtml(q.options[selectedIdx])}`;
        if (isCorrect) {
          statusBadge = '<span class="audit-badge pass">CORRECT</span>';
          pts = '+10';
        } else {
          statusBadge = '<span class="audit-badge fail">INCORRECT</span>';
          pts = '0';
        }
      }

      auditHtml += `
        <tr>
          <td><strong>Q${idx + 1}</strong></td>
          <td><strong>${escapeHtml(q.title)}</strong></td>
          <td><span class="q-difficulty-badge ${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
          <td style="max-width: 320px;">${chosenText}</td>
          <td>${statusBadge}</td>
          <td><strong>${pts}</strong></td>
        </tr>
      `;
    });

    tbody.innerHTML = auditHtml;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =========================================================================
     10. COPY CODE & CLIPBOARD UTILITIES
     ========================================================================= */
  function copyCode() {
    const q = QUESTIONS_DATA[state.currentQuestionIndex];
    if (!q) return;

    const btn = document.getElementById('btnCopyCode');
    const btnText = document.getElementById('copyBtnText');

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(q.code)
        .then(() => triggerCopySuccess(btn, btnText))
        .catch(() => fallbackCopy(q.code, btn, btnText));
    } else {
      fallbackCopy(q.code, btn, btnText);
    }
  }

  function fallbackCopy(text, btn, btnText) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(ta);
      if (successful) {
        triggerCopySuccess(btn, btnText);
      } else {
        showToast('Unable to copy code automatically. Please select text manually.', 'error');
      }
    } catch (err) {
      showToast('Copy command failed in this browser.', 'error');
    }
  }

  function triggerCopySuccess(btn, btnText) {
    if (btn) btn.classList.add('copied');
    if (btnText) btnText.textContent = '✓ Copied!';
    showToast('✓ Buggy code copied to clipboard!', 'success');
    setTimeout(() => {
      if (btn) btn.classList.remove('copied');
      if (btnText) btnText.textContent = 'Copy Code';
    }, 2000);
  }

  function resetCodeView() {
    const viewport = document.getElementById('editorViewport');
    if (viewport) {
      viewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      showToast('Editor view reset to line 1.', 'info');
    }
  }

  /* =========================================================================
     11. TOAST NOTIFICATIONS UTILITY
     ========================================================================= */
  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type || 'info'}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  /* =========================================================================
     12. EVENT LISTENERS
     ========================================================================= */
  function bindEventListeners() {
    // Verify Answer Button
    const btnVerify = document.getElementById('btnVerifyAnswer');
    if (btnVerify) {
      btnVerify.addEventListener('click', verifyAnswer);
    }

    // Previous & Next Navigation Buttons
    const btnPrev = document.getElementById('btnPrevQuestion');
    const btnNext = document.getElementById('btnNextQuestion');
    if (btnPrev) btnPrev.addEventListener('click', previousQuestion);
    if (btnNext) btnNext.addEventListener('click', nextQuestion);

    // Copy Code & Reset Code View Buttons
    const btnCopy = document.getElementById('btnCopyCode');
    const btnResetView = document.getElementById('btnResetCodeView');
    if (btnCopy) btnCopy.addEventListener('click', copyCode);
    if (btnResetView) btnResetView.addEventListener('click', resetCodeView);

    // Submit Modal Open / Close / Confirm
    const btnOpenSubmit = document.getElementById('btnOpenSubmitModal');
    const btnCloseConfirm = document.getElementById('btnCloseConfirmModal');
    const btnCancelSubmit = document.getElementById('btnCancelSubmit');
    const btnConfirmSubmit = document.getElementById('btnConfirmFinalSubmit');

    if (btnOpenSubmit) btnOpenSubmit.addEventListener('click', openSubmitModal);
    if (btnCloseConfirm) btnCloseConfirm.addEventListener('click', closeSubmitModal);
    if (btnCancelSubmit) btnCancelSubmit.addEventListener('click', closeSubmitModal);
    if (btnConfirmSubmit) btnConfirmSubmit.addEventListener('click', finalizeTestSubmission);

    // Reset Modal
    const btnOpenReset = document.getElementById('btnRestartTest');
    const modalReset = document.getElementById('modalResetConfirm');
    const btnCloseReset = document.getElementById('btnCloseResetModal');
    const btnCancelReset = document.getElementById('btnCancelReset');
    const btnConfirmReset = document.getElementById('btnConfirmReset');

    if (btnOpenReset) {
      btnOpenReset.addEventListener('click', () => {
        if (modalReset) modalReset.classList.add('active');
      });
    }
    if (btnCloseReset && modalReset) {
      btnCloseReset.addEventListener('click', () => modalReset.classList.remove('active'));
    }
    if (btnCancelReset && modalReset) {
      btnCancelReset.addEventListener('click', () => modalReset.classList.remove('active'));
    }
    if (btnConfirmReset && modalReset) {
      btnConfirmReset.addEventListener('click', () => {
        modalReset.classList.remove('active');
        resetTest();
      });
    }

    // Results Actions: Print and Restart
    const btnPrint = document.getElementById('btnPrintCertificate');
    const btnRestartResults = document.getElementById('btnRestartFromResults');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());
    if (btnRestartResults) btnRestartResults.addEventListener('click', resetTest);

    // Global Keyboard Shortcuts (1-4 for options, V for verify, N for next, P for prev)
    window.addEventListener('keydown', function (e) {
      // Avoid firing when typing inside an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key >= '1' && e.key <= '4') {
        const optIdx = parseInt(e.key, 10) - 1;
        selectOption(optIdx);
      } else if (e.key === 'v' || e.key === 'V') {
        verifyAnswer();
      } else if (e.key === 'n' || e.key === 'N') {
        nextQuestion();
      } else if (e.key === 'p' || e.key === 'P') {
        previousQuestion();
      }
    });
  }

  /* Initialize immediately on DOM content loaded */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTest);
  } else {
    initTest();
  }

})();
