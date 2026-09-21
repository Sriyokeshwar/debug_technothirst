/**
 * TECHNOTHIRST’26 — PYTHON DEBUGGING CHAMPIONSHIP
 * Pure Vanilla JavaScript • 100% Offline • Pen-Drive Ready
 * A.V.C. COLLEGE OF ENGINEERING (AUTONOMOUS) • DEPARTMENT OF MCA
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. CONSTANTS & SYSTEM CONFIGURATION
     ========================================================================== */
  const ADMIN_PASSWORDS = ['Admin@Debug2026', 'MCALAB@2k26'];
  const STORAGE_KEY_ACTIVE = 'TECHNOTHIRST26_ACTIVE_TEST';
  const STORAGE_KEY_FINALISTS = 'TECHNOTHIRST26_FINALISTS';

  const SEMI_TOTAL_SECONDS = 3600; // 60 minutes
  const SEMI_EARLY_EXIT_REMAINING = 900; // 45 minutes elapsed -> 15 min left
  const FINAL_TOTAL_SECONDS = 600;  // 10 minutes

  // Automatic mapping of Degree Program to Department
  const DEGREE_DEPARTMENT_MAP = {
    'B.Sc Computer Science': 'Computer Science',
    'BCA': 'Computer Applications',
    'B.E Computer Science and Engineering': 'Computer Science and Engineering',
    'B.Tech Information Technology': 'Information Technology',
    'B.Tech Artificial Intelligence and Data Science': 'Artificial Intelligence and Data Science',
    'B.Sc Information Technology': 'Information Technology',
    'B.Sc Artificial Intelligence': 'Artificial Intelligence',
    'M.Sc Computer Science': 'Computer Science',
    'MCA': 'Master of Computer Applications',
    'M.E Computer Science and Engineering': 'Computer Science and Engineering',
    'M.Tech Information Technology': 'Information Technology'
  };

  /* ==========================================================================
     2. QUESTION BANKS (SEMI-FINAL: 4 QUESTIONS, FINAL ROUND: 2 QUESTIONS)
     ========================================================================== */
  const SEMI_QUESTIONS = [
    // ------------------------------------------------------------------------
    // QUESTION 1: EASY (5 Intentional Errors)
    // ------------------------------------------------------------------------
    {
      id: 'semi_q1',
      num: 1,
      title: 'Even Numbers Filter & Average Calculation',
      difficulty: 'EASY',
      shortPrompt: 'Filter all even integers from the input list and compute their arithmetic mean without zero-division or parity check faults.',
      expectedOutput: 'Even: [12, 18, 24]\nAverage: 18.0',
      buggyCode: `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 1]
total = sum(even)
avg = total / len(nums)
print("Even:", even)
print("Average:", avg)`,
      options: [
        {
          key: 'A',
          title: 'Option A (Correct Parity Filter, Dynamic Divisor & Zero Guard)',
          text: 'Change parity condition to n % 2 == 0 to correctly select even numbers; divide total by len(even) instead of len(nums); guard against ZeroDivisionError if even is empty; ensure filtered output is [12, 18, 24] and average evaluates to 18.0.'
        },
        {
          key: 'B',
          title: 'Option B (Tuple Transformation & Half-Sum Approximation)',
          text: 'Convert nums into an immutable tuple, replace the list comprehension with filter(lambda x: x > 15), and divide total sum by 2 using integer floor division.'
        },
        {
          key: 'C',
          title: 'Option C (In-Place Mutation & Hardcoded Divisor)',
          text: 'Mutate the list using nums.remove(15) inside a while loop, calculate average by dividing total by constant 5, and cast total to string before summation.'
        },
        {
          key: 'D',
          title: 'Option D (Modulo-3 Divisibility & Descending Sorting)',
          text: 'Change the modulo operator to n % 3 == 0, sort the list in descending order with reverse=True, and replace sum() with an uninitialized accumulator variable.'
        }
      ],
      correctKey: 'A',
      explanationHtml: `
        <div class="expl-summary">
          <h4>Technical Bug Breakdown (5 Intentional Errors):</h4>
          <ol class="expl-bug-list">
            <li><strong>Parity Inversion Bug (Line 2):</strong> <code>n % 2 == 1</code> filters odd numbers <code>[15, 21]</code> instead of even numbers <code>[12, 18, 24]</code>. Correct expression: <code>n % 2 == 0</code>.</li>
            <li><strong>Incorrect Divisor in Average (Line 4):</strong> <code>total / len(nums)</code> divides by total original list length (5) instead of the count of filtered even numbers (3), resulting in an invalid mathematical average.</li>
            <li><strong>ZeroDivisionError Vulnerability:</strong> If an input list contains zero even numbers, <code>len(even)</code> will be 0, causing Python to crash with <code>ZeroDivisionError</code> without a validation guard.</li>
            <li><strong>Logical Disparity in Output:</strong> Average must reflect only the arithmetic mean of <code>even</code> (<code>54 / 3 = 18.0</code>).</li>
            <li><strong>Floating-Point Division Safety:</strong> Division requires float casting or dynamic check to ensure clean decimal representation.</li>
          </ol>
          <div class="expl-code-box">
            <span class="expl-code-label">Corrected Python Solution:</span>
            <pre><code>nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 0]
total = sum(even)
avg = (total / len(even)) if len(even) > 0 else 0.0
print("Even:", even)
print("Average:", avg)</code></pre>
          </div>
        </div>
      `
    },

    // ------------------------------------------------------------------------
    // QUESTION 2: MODERATE (5 Intentional Errors)
    // ------------------------------------------------------------------------
    {
      id: 'semi_q2',
      num: 2,
      title: 'Threshold Filter & Numeric Summation',
      difficulty: 'MODERATE',
      shortPrompt: 'Filter list numbers strictly greater than the threshold limit and compute cumulative total without TypeError or parameter bugs.',
      expectedOutput: '[15, 20]\nTotal: 35',
      buggyCode: `def check(numbers, limit=10):
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
      options: [
        {
          key: 'A',
          title: 'Option A (Numeric Type Retention & TypeError Resolution)',
          text: 'Append raw integer n directly (result.append(n)) instead of str(n) so sum(result) performs valid numeric addition on [15, 20] yielding 35, avoiding TypeError: unsupported operand type(s) for +: int and str.'
        },
        {
          key: 'B',
          title: 'Option B (String Concatenation with Default Limit Reset)',
          text: 'Replace sum(result) with "".join(result) to concatenate strings as "1520", and reset limit default value to limit=0 inside the function definition.'
        },
        {
          key: 'C',
          title: 'Option C (Dictionary Conversion & Dynamic Eval)',
          text: 'Convert data to a dictionary with enumerated keys, and pass the string result array into Python built-in eval() to execute dynamic addition.'
        },
        {
          key: 'D',
          title: 'Option D (Inverted Inequality & Set Pop)',
          text: 'Change n > limit to n < limit, append float(n) into an unordered set, and return result.pop() instead of the numeric total.'
        }
      ],
      correctKey: 'A',
      explanationHtml: `
        <div class="expl-summary">
          <h4>Technical Bug Breakdown (5 Intentional Errors):</h4>
          <ol class="expl-bug-list">
            <li><strong>TypeError in Summation (Line 6):</strong> <code>result.append(str(n))</code> converts numeric integers to string tokens. Calling <code>sum(result)</code> crashes with <code>TypeError: unsupported operand type(s) for +: 'int' and 'str'</code>.</li>
            <li><strong>Improper Data Type Representation:</strong> Converting values to strings prevents mathematical operations on the returned list.</li>
            <li><strong>Unchecked Empty List Return:</strong> If no items satisfy the threshold, <code>sum([])</code> should safely return 0 without parameter corruption.</li>
            <li><strong>Threshold Comparison Integrity:</strong> Strict boundary <code>n > limit</code> correctly captures 15 and 20 when limit is 10.</li>
            <li><strong>Tuple Unpacking Consistency:</strong> Caller expects <code>(values, total)</code> with integer elements in both values.</li>
          </ol>
          <div class="expl-code-box">
            <span class="expl-code-label">Corrected Python Solution:</span>
            <pre><code>def check(numbers, limit=10):
    result = []
    for n in numbers:
        if n > limit:
            result.append(n)
    total = sum(result)
    return result, total

data = [5, 15, 20, 8]
values, total = check(data, 10)
print(values)
print("Total:", total)</code></pre>
          </div>
        </div>
      `
    },

    // ------------------------------------------------------------------------
    // QUESTION 3: MODERATE (5 Intentional Errors)
    // ------------------------------------------------------------------------
    {
      id: 'semi_q3',
      num: 3,
      title: 'Word Frequency Counter & Index Boundary Access',
      difficulty: 'MODERATE',
      shortPrompt: 'Count word occurrences in text and extract repeated words without IndexError or dictionary key faults.',
      expectedOutput: `Count: {'Python': 3, 'Java': 2}\nCommon: ['Python', 'Java']\nJava`,
      buggyCode: `text = "Python Python Java Python Java"
words = text.split()
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1
common = [w for w in count if count[w] > 1]
print("Count:", count)
print("Common:", common)
print(common[2])`,
      options: [
        {
          key: 'A',
          title: 'Option A (Zero-Based Index Fix & Bounds Validation)',
          text: 'Fix IndexError: list index out of range by changing common[2] to valid zero-based index common[1] or common[-1] since common has only 2 items (["Python", "Java"]); add length validation guard if len(common) > 1.'
        },
        {
          key: 'B',
          title: 'Option B (Reset Frequency Counter & Words Indexing)',
          text: 'Change count.get(word, 0) + 1 to count[word] = 1, and change print(common[2]) to print(words[5]).'
        },
        {
          key: 'C',
          title: 'Option C (Delimiter Re-specification & Tuple Coercion)',
          text: 'Split text by comma delimiter text.split(","), convert count to a list of tuples, and access common[3].'
        },
        {
          key: 'D',
          title: 'Option D (Inclusive Frequency Check & Slicing Bypass)',
          text: 'Change frequency filter condition to count[w] >= 1, discard the dictionary entirely, and slice words[0:2] directly.'
        }
      ],
      correctKey: 'A',
      explanationHtml: `
        <div class="expl-summary">
          <h4>Technical Bug Breakdown (5 Intentional Errors):</h4>
          <ol class="expl-bug-list">
            <li><strong>IndexError: list index out of range (Line 9):</strong> The filtered list <code>common</code> contains exactly 2 elements: <code>['Python', 'Java']</code>. In Python's 0-indexed system, valid indices are <code>0</code> and <code>1</code>. Accessing <code>common[2]</code> crashes immediately.</li>
            <li><strong>Missing Bounds Guard:</strong> Accessing a collection element by arbitrary index without checking <code>len(common) > 1</code> is an insecure pattern.</li>
            <li><strong>Dictionary Key Safety:</strong> While <code>count.get(word, 0) + 1</code> correctly handles initialization, iterating keys with order guarantees requires Python 3.7+ dictionary semantics.</li>
            <li><strong>Case-Sensitivity Vulnerability:</strong> Words with mixed capitalization (e.g., 'python' vs 'Python') would split frequencies without token normalization.</li>
            <li><strong>Hardcoded Index Assumption:</strong> Last element access should idiomatically use <code>common[-1]</code>.</li>
          </ol>
          <div class="expl-code-box">
            <span class="expl-code-label">Corrected Python Solution:</span>
            <pre><code>text = "Python Python Java Python Java"
words = text.split()
count = {}
for word in words:
    count[word] = count.get(word, 0) + 1
common = [w for w in count if count[w] > 1]
print("Count:", count)
print("Common:", common)
if len(common) > 1:
    print(common[1])</code></pre>
          </div>
        </div>
      `
    },

    // ------------------------------------------------------------------------
    // QUESTION 4: HARD (5 Intentional Errors)
    // ------------------------------------------------------------------------
    {
      id: 'semi_q4',
      num: 4,
      title: 'Student Class Attributes & Instance Method Invocation',
      difficulty: 'HARD',
      shortPrompt: 'Manage student records with class-level student counters, average marks, and pass/fail evaluation without UnboundLocalError or method pointer bugs.',
      expectedOutput: 'Arun 56.67 PASS\n1',
      buggyCode: `class Student:
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
      options: [
        {
          key: 'A',
          title: 'Option A (Class Scope Resolution & Method Call Execution)',
          text: 'Qualify class attribute with class name Student.total += 1 inside __init__ to avoid UnboundLocalError; invoke average method with parentheses s.average() instead of printing the bound method pointer; add guard in average() for empty marks.'
        },
        {
          key: 'B',
          title: 'Option B (Global Scope Keyword & Class Method Pointer)',
          text: 'Declare global total inside __init__, remove self.name assignment, and call Student.average(self) from top-level scope.'
        },
        {
          key: 'C',
          title: 'Option C (Remove Parentheses from Result & Manual Total)',
          text: 'Remove parentheses from s.result, increment total = total + 1 at the global file footer, and store marks as an immutable tuple.'
        },
        {
          key: 'D',
          title: 'Option D (ClassMethod Conversion & Property Decorator)',
          text: 'Decorate average with @classmethod, pass cls argument, convert marks to a dictionary, and access self.total as a read-only private field.'
        }
      ],
      correctKey: 'A',
      explanationHtml: `
        <div class="expl-summary">
          <h4>Technical Bug Breakdown (5 Intentional Errors):</h4>
          <ol class="expl-bug-list">
            <li><strong>UnboundLocalError in Constructor (Line 6):</strong> <code>total += 1</code> inside <code>__init__</code> attempts to read and increment a local variable <code>total</code> before assignment. To increment a class attribute, it must be qualified: <code>Student.total += 1</code>.</li>
            <li><strong>Method Pointer vs Function Invocation (Line 13):</strong> <code>s.average</code> prints the function reference (e.g. <code>&lt;bound method Student.average of ...&gt;</code>) instead of calling the function with parentheses <code>s.average()</code>.</li>
            <li><strong>ZeroDivisionError Hazard:</strong> If a student has an empty marks list <code>[]</code>, <code>len(self.marks)</code> is 0. <code>average()</code> requires a safeguard: <code>sum(self.marks) / len(self.marks) if self.marks else 0.0</code>.</li>
            <li><strong>Floating-Point Formatting:</strong> The division produces <code>56.666666666666664</code>, requiring rounded display <code>round(s.average(), 2)</code>.</li>
            <li><strong>Class Namespace Encapsulation:</strong> Class counters must maintain strict isolation across multiple instantiated student objects.</li>
          </ol>
          <div class="expl-code-box">
            <span class="expl-code-label">Corrected Python Solution:</span>
            <pre><code>class Student:
    total = 0
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks
        Student.total += 1
    def average(self):
        return sum(self.marks) / len(self.marks) if self.marks else 0.0
    def result(self):
        return "PASS" if self.average() >= 50 else "FAIL"

s = Student("Arun", [60, 70, 40])
print(s.name, round(s.average(), 2), s.result())
print(Student.total)</code></pre>
          </div>
        </div>
      `
    }
  ];

  const FINAL_QUESTIONS = [
    // ------------------------------------------------------------------------
    // FINAL Q1: MODERATE (5 Intentional Errors)
    // ------------------------------------------------------------------------
    {
      id: 'fin_q1',
      num: 1,
      title: 'Matrix Transposition & Diagonal Summation',
      difficulty: 'MODERATE',
      shortPrompt: 'Compute matrix transpose and primary diagonal sum without shallow reference sharing or indexing bugs.',
      expectedOutput: 'Diagonal: 15\nTransposed: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]',
      buggyCode: `def transpose_and_diagonal(matrix):
    rows = len(matrix)
    cols = len(matrix[0])
    trans = [[0] * rows] * cols
    diag_sum = 0
    for i in range(rows):
        for j in range(cols):
            trans[j][i] = matrix[i][j]
            if i == j:
                diag_sum += matrix[j][i]
    return trans, diag_sum

grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
t_grid, d_sum = transpose_and_diagonal(grid)
print("Diagonal:", d_sum)
print("Transposed:", t_grid)`,
      options: [
        {
          key: 'A',
          title: 'Option A (Independent Row Allocation & Clean Diagonal Accumulation)',
          text: 'Replace shallow list multiplication [[0] * rows] * cols with independent nested comprehension [[0 for _ in range(rows)] for _ in range(cols)] to prevent identical row references; add bounds validation for square matrices; accumulate diagonal elements cleanly.'
        },
        {
          key: 'B',
          title: 'Option B (Flattening Matrix with Itertools)',
          text: 'Flatten matrix elements into a 1D list using itertools.chain, sum the first three indices, and reverse rows in place.'
        },
        {
          key: 'C',
          title: 'Option C (Shallow Copy Replacement & Index Inversion)',
          text: 'Use trans = matrix.copy(), invert the condition to if i != j, and accumulate matrix[0][0] + matrix[2][2].'
        },
        {
          key: 'D',
          title: 'Option D (Column Slicing with Element Pop)',
          text: 'Decrease loop limit to range(cols - 1), replace assignment with matrix.pop(), and divide diag_sum by 2.'
        }
      ],
      correctKey: 'A',
      explanationHtml: `
        <div class="expl-summary">
          <h4>Final Bug Breakdown (5 Intentional Errors):</h4>
          <ol class="expl-bug-list">
            <li><strong>Shallow Reference Replication:</strong> <code>[[0] * rows] * cols</code> creates <code>cols</code> references to the exact same inner list. Mutating <code>trans[j][i]</code> modifies every row simultaneously. Must use list comprehension: <code>[[0 for _ in range(rows)] for _ in range(cols)]</code>.</li>
            <li><strong>Ragged Matrix Vulnerability:</strong> Assuming uniform row length via <code>len(matrix[0])</code> without checking that all rows have identical dimensions crashes on ragged inputs.</li>
            <li><strong>Diagonal Indexing Inconsistency:</strong> Accumulating <code>matrix[j][i]</code> when <code>i == j</code> is mathematically equivalent to <code>matrix[i][i]</code>, but placing it inside a nested loop repeats redundant iterations.</li>
            <li><strong>Square Matrix Dimension Check:</strong> Diagonal summation is mathematically defined only for square matrices (<code>rows == cols</code>).</li>
            <li><strong>Unencapsulated Transpose Mutation:</strong> Re-using grid objects creates mutation side-effects.</li>
          </ol>
          <div class="expl-code-box">
            <span class="expl-code-label">Corrected Python Solution:</span>
            <pre><code>def transpose_and_diagonal(matrix):
    rows = len(matrix)
    cols = len(matrix[0])
    trans = [[0 for _ in range(rows)] for _ in range(cols)]
    diag_sum = sum(matrix[i][i] for i in range(min(rows, cols)))
    for i in range(rows):
        for j in range(cols):
            trans[j][i] = matrix[i][j]
    return trans, diag_sum

grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
t_grid, d_sum = transpose_and_diagonal(grid)
print("Diagonal:", d_sum)
print("Transposed:", t_grid)</code></pre>
          </div>
        </div>
      `
    },

    // ------------------------------------------------------------------------
    // FINAL Q2: HIGH / HARD (5 Intentional Errors)
    // ------------------------------------------------------------------------
    {
      id: 'fin_q2',
      num: 2,
      title: 'Recursive Binary Search & Partition Boundary Offsets',
      difficulty: 'HIGH',
      shortPrompt: 'Perform recursive divide-and-conquer search on a sorted array without recursion overflow, integer overflow, or off-by-one errors.',
      expectedOutput: 'Found at index: 4',
      buggyCode: `def binary_search(arr, target, low, high):
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] > target:
        return binary_search(arr, target, low, mid)
    else:
        return binary_search(arr, target, mid, high)

nums = [3, 8, 14, 19, 27, 35, 42]
idx = binary_search(nums, 27, 0, len(nums))
print("Found at index:", idx)`,
      options: [
        {
          key: 'A',
          title: 'Option A (Offset Partition Boundaries & Valid Initial High Bound)',
          text: 'Correct right partition boundary to mid + 1, correct left partition boundary to mid - 1, and set initial high bound to len(nums) - 1 to prevent RecursionError and IndexError; validate sorted array precondition.'
        },
        {
          key: 'B',
          title: 'Option B (Base Case Mutation & Middle Slicing)',
          text: 'Change base case to if low == high: return 0, replace mid calculation with len(arr) // 2, and slice arr[:mid].'
        },
        {
          key: 'C',
          title: 'Option C (Built-in Index Fallback & Over-bound Setting)',
          text: 'Invoke arr.index(target) inside recursive call, set initial high to len(nums) + 1, and return None.'
        },
        {
          key: 'D',
          title: 'Option D (Infinite While Loop & Double Step)',
          text: 'Replace recursion with while True, calculate mid as (low * high) // 2, and increment low by 2 on each cycle.'
        }
      ],
      correctKey: 'A',
      explanationHtml: `
        <div class="expl-summary">
          <h4>Final Bug Breakdown (5 Intentional Errors):</h4>
          <ol class="expl-bug-list">
            <li><strong>Initial High Bound Off-by-One (Line 14):</strong> Passing <code>len(nums)</code> as initial <code>high</code> indexes beyond the valid array bounds (0 to <code>len(nums)-1</code>), causing <code>IndexError</code> when <code>mid == len(nums)</code>.</li>
            <li><strong>Infinite Recursion in Left Search (Line 9):</strong> Passing <code>mid</code> instead of <code>mid - 1</code> causes infinite recursion when the target is smaller than <code>arr[mid]</code> on small subarrays.</li>
            <li><strong>Infinite Recursion in Right Search (Line 11):</strong> Passing <code>mid</code> instead of <code>mid + 1</code> locks <code>low</code> at <code>mid</code>, causing <code>RecursionError: maximum recursion depth exceeded</code>.</li>
            <li><strong>Integer Midpoint Arithmetic:</strong> In large arrays, <code>(low + high) // 2</code> can cause overflow in fixed-width types (idiomatically <code>low + (high - low) // 2</code>).</li>
            <li><strong>Empty Array / Unsorted Precondition Check:</strong> Missing validation if <code>arr</code> is empty or unsorted.</li>
          </ol>
          <div class="expl-code-box">
            <span class="expl-code-label">Corrected Python Solution:</span>
            <pre><code>def binary_search(arr, target, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] > target:
        return binary_search(arr, target, low, mid - 1)
    else:
        return binary_search(arr, target, mid + 1, high)

nums = [3, 8, 14, 19, 27, 35, 42]
idx = binary_search(nums, 27, 0, len(nums) - 1)
print("Found at index:", idx)</code></pre>
          </div>
        </div>
      `
    }
  ];

  /* ==========================================================================
     3. APPLICATION STATE MANAGEMENT
     ========================================================================== */
  let appState = {
    currentScreen: 'screenRegistration',
    contestant: {
      name: '',
      rollNo: '',
      degree: '',
      department: '',
      college: 'A.V.C. College of Engineering (Autonomous)',
      email: '',
      phone: ''
    },
    semi: {
      started: false,
      startedAt: null,
      remainingSeconds: SEMI_TOTAL_SECONDS,
      completed: false,
      completedAt: null,
      currentQ: 0,
      answers: {
        semi_q1: { selectedKey: null, verified: false, isCorrect: false, points: 0 },
        semi_q2: { selectedKey: null, verified: false, isCorrect: false, points: 0 },
        semi_q3: { selectedKey: null, verified: false, isCorrect: false, points: 0 },
        semi_q4: { selectedKey: null, verified: false, isCorrect: false, points: 0 }
      },
      score: 0
    },
    activeFinalist: null,
    final: {
      started: false,
      startedAt: null,
      remainingSeconds: FINAL_TOTAL_SECONDS,
      completed: false,
      completedAt: null,
      currentQ: 0,
      answers: {
        fin_q1: { selectedKey: null, verified: false, isCorrect: false, points: 0 },
        fin_q2: { selectedKey: null, verified: false, isCorrect: false, points: 0 }
      },
      score: 0
    }
  };

  let semiTimerInterval = null;
  let finalTimerInterval = null;

  /* ==========================================================================
     4. STORAGE HELPERS (OFFLINE PERSISTENCE)
     ========================================================================== */
  function saveActiveSession() {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(appState));
    } catch (e) {
      console.warn('Could not save active test session:', e);
    }
  }

  function loadActiveSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.contestant && parsed.contestant.name) {
          appState = parsed;
          return true;
        }
      }
    } catch (e) {
      console.warn('Could not load active session:', e);
    }
    return false;
  }

  function clearActiveSession() {
    try {
      localStorage.removeItem(STORAGE_KEY_ACTIVE);
    } catch (e) {}
  }

  function getSavedFinalists() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_FINALISTS);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn('Could not load saved finalists:', e);
    }
    return [];
  }

  function saveFinalistsList(list) {
    try {
      localStorage.setItem(STORAGE_KEY_FINALISTS, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save finalists list:', e);
    }
  }

  /* ==========================================================================
     5. TOAST NOTIFICATIONS & MODAL CONTROLS
     ========================================================================== */
  function showToast(message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    let icon = 'ℹ️';
    let bg = 'rgba(15, 23, 42, 0.92)';
    let border = 'rgba(14, 165, 233, 0.4)';

    if (type === 'success') {
      icon = '✓';
      bg = 'rgba(6, 78, 59, 0.95)';
      border = '#10b981';
    } else if (type === 'error' || type === 'danger') {
      icon = '✖';
      bg = 'rgba(127, 29, 29, 0.95)';
      border = '#ef4444';
    } else if (type === 'warning') {
      icon = '⚠️';
      bg = 'rgba(120, 53, 15, 0.95)';
      border = '#f59e0b';
    }

    toast.innerHTML = `<span style="font-weight: bold; margin-right: 8px;">${icon}</span> <span>${message}</span>`;
    toast.style.backgroundColor = bg;
    toast.style.borderColor = border;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3500);
  }

  function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  }
  window.closeModal = closeModal;

  function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  }

  /* ==========================================================================
     6. SCREEN ROUTING & VIEWPORT CONTROLLER
     ========================================================================== */
  function switchScreen(screenId) {
    const screens = document.querySelectorAll('.screen-view');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      appState.currentScreen = screenId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateHeaderControls(screenId);
    saveActiveSession();
  }

  function updateHeaderControls(screenId) {
    const headerCenter = document.getElementById('headerCenterInfo');
    const headerStageText = document.getElementById('headerStageText');
    const headerParticipantChip = document.getElementById('headerParticipantChip');
    const headerParticipantName = document.getElementById('headerParticipantName');
    const headerParticipantId = document.getElementById('headerParticipantId');
    const headerTimerBox = document.getElementById('headerTimerBox');
    const timerCaption = document.getElementById('timerCaption');
    const headerTimerDisplay = document.getElementById('headerTimerDisplay');

    if (screenId === 'screenRegistration') {
      if (headerCenter) headerCenter.style.display = 'none';
      if (headerTimerBox) headerTimerBox.style.display = 'none';
    } else if (screenId === 'screenTestWorkspace') {
      if (headerCenter) headerCenter.style.display = 'flex';
      if (headerStageText) headerStageText.textContent = 'SEMI-FINAL ROUND';
      if (headerParticipantName) headerParticipantName.textContent = appState.contestant.name || 'Contestant';
      if (headerParticipantId) headerParticipantId.textContent = appState.contestant.rollNo ? `(${appState.contestant.rollNo})` : '';
      if (headerTimerBox) headerTimerBox.style.display = 'flex';
      if (timerCaption) timerCaption.textContent = 'TIME REMAINING';
      if (headerTimerDisplay) headerTimerDisplay.textContent = formatSeconds(appState.semi.remainingSeconds);
    } else if (screenId === 'screenSemiResults') {
      if (headerCenter) headerCenter.style.display = 'flex';
      if (headerStageText) headerStageText.textContent = 'SEMI-FINAL AUDIT';
      if (headerParticipantName) headerParticipantName.textContent = appState.contestant.name || 'Contestant';
      if (headerParticipantId) headerParticipantId.textContent = appState.contestant.rollNo ? `(${appState.contestant.rollNo})` : '';
      if (headerTimerBox) headerTimerBox.style.display = 'none';
    } else if (screenId === 'screenFinalistAdmin') {
      if (headerCenter) headerCenter.style.display = 'flex';
      if (headerStageText) headerStageText.textContent = 'ADMINISTRATION';
      if (headerParticipantName) headerParticipantName.textContent = 'Coordinator Access';
      if (headerParticipantId) headerParticipantId.textContent = '';
      if (headerTimerBox) headerTimerBox.style.display = 'none';
    } else if (screenId === 'screenFinalWorkspace') {
      if (headerCenter) headerCenter.style.display = 'flex';
      if (headerStageText) headerStageText.textContent = 'FINAL CHAMPIONSHIP';
      if (headerParticipantName) {
        headerParticipantName.textContent = appState.activeFinalist ? appState.activeFinalist.name : (appState.contestant.name || 'Finalist');
      }
      if (headerParticipantId) {
        headerParticipantId.textContent = appState.activeFinalist ? `(${appState.activeFinalist.id})` : '';
      }
      if (headerTimerBox) headerTimerBox.style.display = 'flex';
      if (timerCaption) timerCaption.textContent = 'FINAL TIME LEFT';
      if (headerTimerDisplay) headerTimerDisplay.textContent = formatSeconds(appState.final.remainingSeconds);
    } else if (screenId === 'screenFinalResults') {
      if (headerCenter) headerCenter.style.display = 'flex';
      if (headerStageText) headerStageText.textContent = 'CHAMPION RESULTS';
      if (headerParticipantName) {
        headerParticipantName.textContent = appState.activeFinalist ? appState.activeFinalist.name : appState.contestant.name;
      }
      if (headerParticipantId) headerParticipantId.textContent = '';
      if (headerTimerBox) headerTimerBox.style.display = 'none';
    }
  }

  /* ==========================================================================
     7. SYNTAX HIGHLIGHTING & IDE TERMINAL COMPONENT
     ========================================================================== */
  function renderSyntaxHighlightedCode(codeString, containerElement) {
    if (!containerElement) return;
    containerElement.innerHTML = '';

    const lines = codeString.split('\n');

    lines.forEach((lineText, idx) => {
      const lineNum = (idx + 1).toString().padStart(2, '0');

      const row = document.createElement('div');
      row.className = 'ide-code-row';

      const gutter = document.createElement('div');
      gutter.className = 'ide-gutter-cell';
      gutter.textContent = lineNum;

      const codeCell = document.createElement('div');
      codeCell.className = 'ide-line-cell';
      codeCell.innerHTML = highlightPythonLine(lineText);

      row.appendChild(gutter);
      row.appendChild(codeCell);
      containerElement.appendChild(row);
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function highlightPythonLine(line) {
    if (!line.trim()) return '&nbsp;';

    // Separate comment if any
    let commentPart = '';
    let codePart = line;
    const commentIdx = line.indexOf('#');
    if (commentIdx !== -1) {
      codePart = line.substring(0, commentIdx);
      commentPart = `<span class="syn-com">${escapeHtml(line.substring(commentIdx))}</span>`;
    }

    let escaped = escapeHtml(codePart);

    // Strings (double or single quotes)
    escaped = escaped.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="syn-str">$&</span>');

    // Numbers
    escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syn-num">$1</span>');

    // Python Keywords
    const keywords = [
      'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'in', 'and', 'or',
      'not', 'is', 'while', 'break', 'continue', 'import', 'from', 'as', 'try',
      'except', 'finally', 'raise', 'with', 'lambda', 'pass', 'global', 'nonlocal'
    ];
    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    escaped = escaped.replace(kwRegex, '<span class="syn-kw">$1</span>');

    // Builtins & Functions
    const builtins = [
      'print', 'len', 'sum', 'range', 'list', 'dict', 'set', 'str', 'int',
      'float', 'get', 'append', 'split', 'max', 'min', 'all', 'any', 'round'
    ];
    const builtinRegex = new RegExp(`\\b(${builtins.join('|')})\\b(?=\\s*\\()`, 'g');
    escaped = escaped.replace(builtinRegex, '<span class="syn-fn">$1</span>');

    // Special OOP Tokens
    escaped = escaped.replace(/\b(self|__init__)\b/g, '<span class="syn-fn">$1</span>');

    return escaped + commentPart;
  }

  function copyCodeToClipboard(text, btnElement, labelElement) {
    if (!navigator.clipboard) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showCopySuccess(labelElement);
      } catch (err) {
        showToast('Could not copy code to clipboard', 'error');
      }
      document.body.removeChild(ta);
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      showCopySuccess(labelElement);
    }).catch(() => {
      showToast('Copy permission denied', 'error');
    });
  }

  function showCopySuccess(labelElement) {
    if (!labelElement) return;
    const original = labelElement.textContent;
    labelElement.textContent = 'COPIED! ✓';
    showToast('Code copied to clipboard', 'success');
    setTimeout(() => {
      labelElement.textContent = original;
    }, 2000);
  }

  /* ==========================================================================
     8. SEMI-FINAL WORKSPACE RENDERING & INTERACTION
     ========================================================================== */
  function renderSemiQuestion(idx) {
    if (idx < 0 || idx >= SEMI_QUESTIONS.length) return;
    appState.semi.currentQ = idx;

    const q = SEMI_QUESTIONS[idx];
    const answerState = appState.semi.answers[q.id] || {
      selectedKey: null,
      verified: false,
      isCorrect: false,
      points: 0
    };

    // Header info
    document.getElementById('wsQuestionNumber').textContent = `QUESTION 0${q.num} OF 04`;
    document.getElementById('wsDifficultyBadge').textContent = q.difficulty;
    document.getElementById('wsQuestionTitle').textContent = q.title;
    document.getElementById('wsQuestionDesc').textContent = q.shortPrompt;

    // IDE Code
    const codeTable = document.getElementById('ideCodeTable');
    renderSyntaxHighlightedCode(q.buggyCode, codeTable);

    // Setup Copy Code Button
    const btnCopy = document.getElementById('btnCopyCode');
    const copyText = document.getElementById('copyBtnText');
    btnCopy.onclick = () => copyCodeToClipboard(q.buggyCode, btnCopy, copyText);

    // Setup Reset View Button
    const btnResetView = document.getElementById('btnResetCodeView');
    const viewport = document.getElementById('ideEditorViewport');
    btnResetView.onclick = () => {
      if (viewport) viewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };

    // Hide warning
    document.getElementById('selectionWarningTip').style.display = 'none';

    // Render Options
    const optionsContainer = document.getElementById('optionsCardsList');
    optionsContainer.innerHTML = '';

    q.options.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'option-card';
      card.id = `optCard_${opt.key}`;

      const isSelected = answerState.selectedKey === opt.key;
      if (isSelected) card.classList.add('selected');

      if (answerState.verified) {
        card.classList.add('locked');
        if (opt.key === q.correctKey) {
          card.classList.add('verified-correct');
        } else if (isSelected && !answerState.isCorrect) {
          card.classList.add('verified-incorrect');
        }
      }

      card.innerHTML = `
        <div class="option-radio-visual">
          <span class="radio-circle"></span>
        </div>
        <div class="option-body-wrap">
          <div class="option-header-tag">
            <span class="opt-key-pill">${opt.key}</span>
            <span class="opt-title-text">${opt.title}</span>
          </div>
          <div class="opt-desc-text">${opt.text}</div>
        </div>
      `;

      if (!answerState.verified) {
        card.addEventListener('click', () => selectSemiOption(opt.key));
      }

      optionsContainer.appendChild(card);
    });

    // Verification Button State
    const btnVerify = document.getElementById('btnVerifyAnswer');
    if (answerState.verified) {
      btnVerify.disabled = true;
      btnVerify.innerHTML = `<span>✓ ANSWER VERIFIED (${answerState.points} PTS)</span>`;
      btnVerify.classList.add('btn-verified-done');
    } else {
      btnVerify.disabled = false;
      btnVerify.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>VERIFY ANSWER</span>
      `;
      btnVerify.classList.remove('btn-verified-done');
    }

    // Explanation Panel
    const explPanel = document.getElementById('explanationPanel');
    const explBanner = document.getElementById('explanationStatusBanner');
    const explIcon = document.getElementById('explanationStatusIcon');
    const explText = document.getElementById('explanationStatusText');
    const explBody = document.getElementById('explanationBodyContent');

    if (answerState.verified) {
      explPanel.style.display = 'block';
      if (answerState.isCorrect) {
        explBanner.className = 'explanation-status-banner status-correct';
        explIcon.textContent = '✓';
        explText.textContent = 'CORRECT TECHNICAL DIAGNOSIS (+10 POINTS)';
      } else {
        explBanner.className = 'explanation-status-banner status-incorrect';
        explIcon.textContent = '✖';
        explText.textContent = 'INCORRECT TECHNICAL DIAGNOSIS (0 POINTS)';
      }
      explBody.innerHTML = q.explanationHtml;
    } else {
      explPanel.style.display = 'none';
    }

    // Bottom Navigation Bar
    const btnPrev = document.getElementById('btnPrevQuestion');
    const btnNext = document.getElementById('btnNextQuestion');

    btnPrev.disabled = idx === 0;
    btnPrev.onclick = () => renderSemiQuestion(idx - 1);

    if (idx === SEMI_QUESTIONS.length - 1) {
      btnNext.innerHTML = `<span>GO TO REVIEW / SUBMIT →</span>`;
      btnNext.disabled = !answerState.verified;
      btnNext.onclick = () => {
        const sidebar = document.querySelector('.workspace-sidebar');
        if (sidebar) sidebar.scrollIntoView({ behavior: 'smooth' });
        showToast('You are on the final question. Submit test when ready.', 'info');
      };
    } else {
      btnNext.innerHTML = `<span>NEXT QUESTION →</span>`;
      btnNext.disabled = !answerState.verified;
      btnNext.onclick = () => renderSemiQuestion(idx + 1);
    }

    // Update Right Sidebar Elements
    updateSidebarSummary();
    saveActiveSession();
  }

  function selectSemiOption(key) {
    const q = SEMI_QUESTIONS[appState.semi.currentQ];
    const answerState = appState.semi.answers[q.id];
    if (answerState && answerState.verified) return; // Locked

    answerState.selectedKey = key;

    // Update option card visual styles
    document.querySelectorAll('#optionsCardsList .option-card').forEach(card => {
      card.classList.remove('selected');
    });
    const selectedCard = document.getElementById(`optCard_${key}`);
    if (selectedCard) selectedCard.classList.add('selected');

    // Hide warning message
    document.getElementById('selectionWarningTip').style.display = 'none';

    // Update navigator matrix pill to show answered state
    updateSidebarSummary();
    saveActiveSession();
  }

  function verifySemiAnswer() {
    const q = SEMI_QUESTIONS[appState.semi.currentQ];
    const answerState = appState.semi.answers[q.id];

    if (answerState.verified) return; // Prevent duplicate scoring!

    if (!answerState.selectedKey) {
      const tip = document.getElementById('selectionWarningTip');
      tip.style.display = 'block';
      tip.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    answerState.verified = true;
    answerState.isCorrect = (answerState.selectedKey === q.correctKey);

    if (answerState.isCorrect) {
      answerState.points = 10;
      appState.semi.score += 10;
      showToast('Correct Diagnosis! +10 Points Awarded.', 'success');
    } else {
      answerState.points = 0;
      showToast('Incorrect Diagnosis. 0 Points.', 'danger');
    }

    // Re-render current question with verified states
    renderSemiQuestion(appState.semi.currentQ);
  }

  function updateSidebarSummary() {
    // Current Score
    document.getElementById('sidebarScoreVal').textContent = appState.semi.score;

    let verifiedCount = 0;
    SEMI_QUESTIONS.forEach(q => {
      if (appState.semi.answers[q.id]?.verified) verifiedCount++;
    });

    document.getElementById('sidebarScoreDetail').textContent = `${verifiedCount} of 4 Questions Verified`;

    // Question Matrix Pills
    const matrixGrid = document.getElementById('qMatrixGrid');
    matrixGrid.innerHTML = '';

    SEMI_QUESTIONS.forEach((q, idx) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'q-matrix-pill';
      pill.textContent = `Q0${q.num}`;

      const ans = appState.semi.answers[q.id];
      if (idx === appState.semi.currentQ) {
        pill.classList.add('current');
      } else if (ans.verified) {
        pill.classList.add(ans.isCorrect ? 'verified-correct' : 'verified-incorrect');
      } else if (ans.selectedKey) {
        pill.classList.add('answered');
      }

      pill.addEventListener('click', () => {
        renderSemiQuestion(idx);
      });

      matrixGrid.appendChild(pill);
    });

    // Check Early Exit Eligibility
    checkEarlyExitStatus(verifiedCount);
  }

  function checkEarlyExitStatus(verifiedCount) {
    const elapsedSeconds = SEMI_TOTAL_SECONDS - appState.semi.remainingSeconds;
    const earlyExitMet = (elapsedSeconds >= 2700) || (verifiedCount === 4);

    const earlyExitChip = document.getElementById('sidebarEarlyExitStatus');
    const btnSubmit = document.getElementById('btnSubmitExam');

    if (earlyExitMet) {
      earlyExitChip.className = 'early-exit-status-chip unlocked';
      earlyExitChip.innerHTML = '🔓 Early Exit Unlocked';
      btnSubmit.classList.add('btn-submit-ready');
    } else {
      earlyExitChip.className = 'early-exit-status-chip locked';
      earlyExitChip.innerHTML = '🔒 Early Exit unlocks after 45:00';
      btnSubmit.classList.remove('btn-submit-ready');
    }
  }

  /* ==========================================================================
     9. SEMI-FINAL TIMERS & SUBMISSION
     ========================================================================== */
  function startSemiTimer() {
    if (semiTimerInterval) clearInterval(semiTimerInterval);

    updateSemiTimerDisplay();

    semiTimerInterval = setInterval(() => {
      if (appState.semi.remainingSeconds > 0) {
        appState.semi.remainingSeconds--;
        updateSemiTimerDisplay();

        if (appState.semi.remainingSeconds % 15 === 0) {
          saveActiveSession();
        }
      } else {
        clearInterval(semiTimerInterval);
        semiTimerInterval = null;
        autoSubmitSemiFinal();
      }
    }, 1000);
  }

  function updateSemiTimerDisplay() {
    const timeStr = formatSeconds(appState.semi.remainingSeconds);
    const headerTimer = document.getElementById('headerTimerDisplay');
    const sidebarTimer = document.getElementById('sidebarTimerDisplay');
    const progressFill = document.getElementById('timerProgressFill');

    if (headerTimer) headerTimer.textContent = timeStr;
    if (sidebarTimer) sidebarTimer.textContent = timeStr;

    const pct = Math.max(0, Math.min(100, (appState.semi.remainingSeconds / SEMI_TOTAL_SECONDS) * 100));
    if (progressFill) progressFill.style.width = `${pct}%`;

    // Low time visual alerts
    if (appState.semi.remainingSeconds <= 300) {
      if (headerTimer) headerTimer.style.color = '#ef4444';
      if (sidebarTimer) sidebarTimer.style.color = '#ef4444';
    } else {
      if (headerTimer) headerTimer.style.color = '#38bdf8';
      if (sidebarTimer) sidebarTimer.style.color = '#0284c7';
    }

    let verifiedCount = 0;
    SEMI_QUESTIONS.forEach(q => {
      if (appState.semi.answers[q.id]?.verified) verifiedCount++;
    });
    checkEarlyExitStatus(verifiedCount);
  }

  function formatSeconds(totalSec) {
    const sec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function handleSemiSubmitClick() {
    let verifiedCount = 0;
    SEMI_QUESTIONS.forEach(q => {
      if (appState.semi.answers[q.id]?.verified) verifiedCount++;
    });

    const elapsedSeconds = SEMI_TOTAL_SECONDS - appState.semi.remainingSeconds;
    const earlyExitMet = (elapsedSeconds >= 2700) || (verifiedCount === 4);

    if (!earlyExitMet) {
      const remainingEarlyTime = Math.ceil((2700 - elapsedSeconds) / 60);
      showToast(
        `Early exit locked! Solve all 4 questions or wait ${remainingEarlyTime} min (45:00 threshold).`,
        'warning'
      );
      return;
    }

    const confirmText = document.getElementById('submitConfirmText');
    confirmText.textContent = `You have verified ${verifiedCount} of 4 questions. Current score: ${appState.semi.score} / 40 pts. Do you want to finalize your Semi-Final submission?`;
    openModal('modalSubmitConfirm');
  }

  function autoSubmitSemiFinal() {
    showToast('Time has expired! Automatically submitting your test.', 'warning');
    closeModal('modalSubmitConfirm');
    finalizeSemiSubmission();
  }

  function finalizeSemiSubmission() {
    if (semiTimerInterval) {
      clearInterval(semiTimerInterval);
      semiTimerInterval = null;
    }

    appState.semi.completed = true;
    appState.semi.completedAt = Date.now();

    closeModal('modalSubmitConfirm');
    populateSemiResultsScorecard();
    switchScreen('screenSemiResults');
    showToast('Semi-Final test submitted successfully!', 'success');
  }

  /* ==========================================================================
     10. SEMI-FINAL RESULTS SCORECARD & ADMIN APPROVAL GATE
     ========================================================================== */
  function populateSemiResultsScorecard() {
    // Contestant metadata
    document.getElementById('resName').textContent = appState.contestant.name || 'Contestant';
    document.getElementById('resRoll').textContent = appState.contestant.rollNo || 'N/A';
    document.getElementById('resDegree').textContent = appState.contestant.degree || 'N/A';
    document.getElementById('resDept').textContent = appState.contestant.department || 'N/A';
    document.getElementById('resCollege').textContent = appState.contestant.college || 'A.V.C. College of Engineering (Autonomous)';

    // Score metrics
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;

    SEMI_QUESTIONS.forEach(q => {
      const a = appState.semi.answers[q.id];
      if (a && a.verified) {
        attempted++;
        if (a.isCorrect) correct++;
        else incorrect++;
      }
    });

    const timeUsedSeconds = SEMI_TOTAL_SECONDS - appState.semi.remainingSeconds;
    const pct = ((correct / SEMI_QUESTIONS.length) * 100).toFixed(1);

    document.getElementById('resTotalQ').textContent = '4';
    document.getElementById('resAttempted').textContent = attempted;
    document.getElementById('resCorrect').textContent = correct;
    document.getElementById('resIncorrect').textContent = incorrect;
    document.getElementById('resScore').textContent = `${appState.semi.score} / 40`;
    document.getElementById('resPercentage').textContent = `${pct}%`;
    document.getElementById('resTimeUsed').textContent = formatSeconds(timeUsedSeconds);

    // Question audit table
    const tbody = document.getElementById('resAuditTableBody');
    tbody.innerHTML = '';

    SEMI_QUESTIONS.forEach(q => {
      const a = appState.semi.answers[q.id];
      const tr = document.createElement('tr');

      let statusBadge = '<span class="audit-status unattempted">Unattempted</span>';
      let ptsStr = '0 / 10';

      if (a && a.verified) {
        if (a.isCorrect) {
          statusBadge = '<span class="audit-status correct">✓ Correct (Option ' + a.selectedKey + ')</span>';
          ptsStr = '10 / 10';
        } else {
          statusBadge = '<span class="audit-status incorrect">✖ Incorrect (Option ' + a.selectedKey + ')</span>';
          ptsStr = '0 / 10';
        }
      }

      tr.innerHTML = `
        <td><strong>0${q.num}</strong></td>
        <td>${q.title}</td>
        <td><span class="audit-diff-pill ${q.difficulty.toLowerCase()}">${q.difficulty}</span></td>
        <td>${statusBadge}</td>
        <td><strong>${ptsStr}</strong></td>
      `;
      tbody.appendChild(tr);
    });

    // Reset admin unlock field
    document.getElementById('txtAdminPassword').value = '';
    document.getElementById('errAdminPassword').style.display = 'none';
  }

  function handleAdminUnlockClick() {
    const pwdInput = document.getElementById('txtAdminPassword');
    const errTip = document.getElementById('errAdminPassword');
    const pwd = pwdInput.value.trim();

    if (ADMIN_PASSWORDS.includes(pwd)) {
      errTip.style.display = 'none';
      pwdInput.value = '';
      showToast('Coordinator Key Verified! Finalist Registration Unlocked.', 'success');
      initFinalistRegistrationScreen();
      switchScreen('screenFinalistAdmin');
    } else {
      errTip.style.display = 'block';
      pwdInput.classList.add('input-shake');
      setTimeout(() => pwdInput.classList.remove('input-shake'), 500);
      showToast('Invalid Coordinator Authorization Key.', 'error');
    }
  }

  function handleHeaderAdminClick() {
    document.getElementById('txtHeaderAdminPassword').value = '';
    document.getElementById('errHeaderAdminPassword').style.display = 'none';
    openModal('modalHeaderAdmin');
  }

  function handleHeaderAdminConfirm() {
    const pwdInput = document.getElementById('txtHeaderAdminPassword');
    const errTip = document.getElementById('errHeaderAdminPassword');
    const pwd = pwdInput.value.trim();

    if (ADMIN_PASSWORDS.includes(pwd)) {
      errTip.style.display = 'none';
      pwdInput.value = '';
      closeModal('modalHeaderAdmin');
      showToast('Coordinator Access Granted.', 'success');
      initFinalistRegistrationScreen();
      switchScreen('screenFinalistAdmin');
    } else {
      errTip.style.display = 'block';
      pwdInput.classList.add('input-shake');
      setTimeout(() => pwdInput.classList.remove('input-shake'), 500);
      showToast('Invalid Coordinator Authorization Key.', 'error');
    }
  }

  /* ==========================================================================
     11. FINALIST REGISTRATION & DATABASE MANAGEMENT (SCREEN 4)
     ========================================================================== */
  function getNextFinalistId() {
    const list = getSavedFinalists();
    let highestNum = 0;

    list.forEach(f => {
      if (f.id && f.id.startsWith('TT26-F')) {
        const numPart = parseInt(f.id.replace('TT26-F', ''), 10);
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    });

    const next = (highestNum + 1).toString().padStart(3, '0');
    return `TT26-F${next}`;
  }

  function initFinalistRegistrationScreen() {
    const assignedId = getNextFinalistId();
    document.getElementById('finalistIdPreview').textContent = `Assigned ID: ${assignedId}`;

    // Pre-populate fields from current contestant
    document.getElementById('finName').value = appState.contestant.name || '';
    document.getElementById('finParticipantId').value = appState.contestant.rollNo || '';
    document.getElementById('finCollege').value = appState.contestant.college || 'A.V.C. College of Engineering (Autonomous)';
    document.getElementById('finDept').value = appState.contestant.department || appState.contestant.degree || '';
    document.getElementById('finYear').value = '2nd Year';
    document.getElementById('finEmail').value = appState.contestant.email || '';
    document.getElementById('finPhone').value = appState.contestant.phone || '';
    document.getElementById('finSemiScore').value = `${appState.semi.score} / 40 pts (${((appState.semi.score / 40) * 100).toFixed(0)}%)`;

    renderFinalistsTable();
  }

  function saveCurrentFinalistRecord(notify = true) {
    const name = document.getElementById('finName').value.trim();
    const rollNo = document.getElementById('finParticipantId').value.trim();
    const college = document.getElementById('finCollege').value.trim();
    const dept = document.getElementById('finDept').value.trim();
    const year = document.getElementById('finYear').value.trim();
    const email = document.getElementById('finEmail').value.trim();
    const phone = document.getElementById('finPhone').value.trim();

    if (!name || !rollNo || !college) {
      showToast('Please fill in candidate Name, Roll No, and College.', 'warning');
      return null;
    }

    const assignedId = getNextFinalistId();
    const list = getSavedFinalists();

    // Check if contestant with same rollNo already saved
    let existing = list.find(f => f.rollNo.toLowerCase() === rollNo.toLowerCase());
    let finalistRecord;

    if (existing) {
      existing.name = name;
      existing.college = college;
      existing.dept = dept;
      existing.year = year;
      existing.email = email;
      existing.phone = phone;
      existing.semiScore = appState.semi.score;
      finalistRecord = existing;
    } else {
      finalistRecord = {
        id: assignedId,
        name: name,
        rollNo: rollNo,
        college: college,
        dept: dept,
        year: year,
        email: email,
        phone: phone,
        semiScore: appState.semi.score,
        finalScore: null,
        cumulativeScore: null,
        status: 'Qualified Finalist',
        timestamp: new Date().toISOString()
      };
      list.push(finalistRecord);
    }

    saveFinalistsList(list);
    appState.activeFinalist = finalistRecord;
    saveActiveSession();
    renderFinalistsTable();

    if (notify) {
      showToast(`Finalist record ${finalistRecord.id} saved to database!`, 'success');
    }
    return finalistRecord;
  }

  function renderFinalistsTable() {
    const list = getSavedFinalists();
    const badge = document.getElementById('finRecordCountBadge');
    const tbody = document.getElementById('finalistTableBody');

    if (badge) badge.textContent = `${list.length} Records`;
    if (!tbody) return;

    tbody.innerHTML = '';

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-light); padding: 24px;">
            No finalist records saved yet. Approved finalists will appear here.
          </td>
        </tr>
      `;
      return;
    }

    list.forEach((f, idx) => {
      const tr = document.createElement('tr');

      const finScoreStr = (f.finalScore !== null && f.finalScore !== undefined)
        ? `${f.finalScore} / 20`
        : '<span style="color: var(--text-light);">Not Taken</span>';

      let statusBadgeClass = 'status-qualified';
      if (f.status === 'Completed' || f.finalScore !== null) {
        statusBadgeClass = 'status-completed';
      }

      tr.innerHTML = `
        <td><span class="fin-id-badge">${f.id}</span></td>
        <td><strong>${f.name}</strong></td>
        <td>${f.rollNo}</td>
        <td>${f.college}</td>
        <td><strong class="text-blue">${f.semiScore} / 40</strong></td>
        <td><strong>${finScoreStr}</strong></td>
        <td><span class="fin-status-pill ${statusBadgeClass}">${f.status || 'Qualified'}</span></td>
        <td>
          <button type="button" class="btn-table-action" onclick="viewFinalistDetails('${f.id}')" title="View Details">👁</button>
          <button type="button" class="btn-table-action btn-del" onclick="deleteFinalistRecord('${f.id}')" title="Delete">🗑</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.viewFinalistDetails = function (id) {
    const list = getSavedFinalists();
    const f = list.find(item => item.id === id);
    if (!f) return;

    document.getElementById('viewFinalistTitle').textContent = `RECORD: ${f.id} — ${f.name}`;
    const body = document.getElementById('viewFinalistBody');
    body.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.95rem;">
        <div><strong>Finalist ID:</strong> ${f.id}</div>
        <div><strong>Candidate Name:</strong> ${f.name}</div>
        <div><strong>Participant / Roll ID:</strong> ${f.rollNo}</div>
        <div><strong>Institution:</strong> ${f.college}</div>
        <div><strong>Department:</strong> ${f.dept || 'N/A'}</div>
        <div><strong>Academic Year:</strong> ${f.year || 'N/A'}</div>
        <div><strong>Email Address:</strong> ${f.email || 'N/A'}</div>
        <div><strong>Phone Number:</strong> ${f.phone || 'N/A'}</div>
        <div><strong>Semi-Final Score:</strong> <span style="color: #0284c7; font-weight: bold;">${f.semiScore} / 40</span></div>
        <div><strong>Final Round Score:</strong> <span style="color: #10b981; font-weight: bold;">${f.finalScore !== null ? f.finalScore + ' / 20' : 'Pending'}</span></div>
        <div style="grid-column: 1 / -1; border-top: 1px solid var(--border-color); padding-top: 10px;">
          <strong>Championship Cumulative Score:</strong>
          <span style="color: #d97706; font-weight: 800; font-size: 1.1rem; margin-left: 8px;">
            ${f.cumulativeScore !== null ? f.cumulativeScore + ' / 60' : 'Pending Final'}
          </span>
        </div>
      </div>
    `;
    openModal('modalViewFinalist');
  };

  window.deleteFinalistRecord = function (id) {
    if (!confirm(`Are you sure you want to remove finalist ${id}?`)) return;
    let list = getSavedFinalists();
    list = list.filter(f => f.id !== id);
    saveFinalistsList(list);
    renderFinalistsTable();
    showToast(`Finalist ${id} deleted.`, 'info');
  };

  function exportFinalistsJson() {
    const list = getSavedFinalists();
    if (list.length === 0) {
      showToast('No finalist records found to export.', 'warning');
      return;
    }

    const jsonStr = JSON.stringify(list, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `TECHNOTHIRST26_FINALISTS_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Finalists database exported successfully!', 'success');
  }

  function handleImportFinalists(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported)) {
          showToast('Invalid JSON structure. Array expected.', 'error');
          return;
        }

        const existing = getSavedFinalists();
        let addedCount = 0;
        let updatedCount = 0;

        imported.forEach(item => {
          if (!item.id || !item.name) return;
          const idx = existing.findIndex(ex => ex.id === item.id || ex.rollNo === item.rollNo);
          if (idx !== -1) {
            existing[idx] = Object.assign({}, existing[idx], item);
            updatedCount++;
          } else {
            existing.push(item);
            addedCount++;
          }
        });

        saveFinalistsList(existing);
        renderFinalistsTable();
        showToast(`Import completed: ${addedCount} added, ${updatedCount} updated.`, 'success');
      } catch (err) {
        showToast('Error reading or parsing JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  }

  function clearAllFinalists() {
    if (!confirm('CAUTION: This will erase all saved finalist records from offline storage. Continue?')) return;
    localStorage.removeItem(STORAGE_KEY_FINALISTS);
    renderFinalistsTable();
    showToast('All finalist records cleared.', 'info');
  }

  /* ==========================================================================
     12. FINAL ROUND WORKSPACE RENDERING & INTERACTION (SCREEN 5)
     ========================================================================== */
  function startFinalRound() {
    const record = saveCurrentFinalistRecord(false);
    if (!record) return;

    appState.activeFinalist = record;
    appState.final.started = true;
    appState.final.startedAt = Date.now();
    appState.final.remainingSeconds = FINAL_TOTAL_SECONDS;
    appState.final.completed = false;
    appState.final.score = 0;
    appState.final.currentQ = 0;

    FINAL_QUESTIONS.forEach(q => {
      appState.final.answers[q.id] = {
        selectedKey: null,
        verified: false,
        isCorrect: false,
        points: 0
      };
    });

    renderFinalQuestion(0);
    switchScreen('screenFinalWorkspace');
    startFinalTimer();
    showToast('Final Championship Round Started! 10 Minutes on the clock.', 'success');
  }

  function renderFinalQuestion(idx) {
    if (idx < 0 || idx >= FINAL_QUESTIONS.length) return;
    appState.final.currentQ = idx;

    const q = FINAL_QUESTIONS[idx];
    const answerState = appState.final.answers[q.id];

    document.getElementById('finWsQuestionNumber').textContent = `FINAL QUESTION 0${q.num} OF 02`;
    document.getElementById('finWsDifficultyBadge').textContent = q.difficulty;
    document.getElementById('finWsQuestionTitle').textContent = q.title;
    document.getElementById('finWsQuestionDesc').textContent = q.shortPrompt;

    const codeTable = document.getElementById('finIdeCodeTable');
    renderSyntaxHighlightedCode(q.buggyCode, codeTable);

    const btnCopy = document.getElementById('btnCopyCodeFinal');
    const copyText = document.getElementById('copyBtnTextFinal');
    btnCopy.onclick = () => copyCodeToClipboard(q.buggyCode, btnCopy, copyText);

    document.getElementById('finSelectionWarningTip').style.display = 'none';

    // Render Options
    const optionsContainer = document.getElementById('finOptionsCardsList');
    optionsContainer.innerHTML = '';

    q.options.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'option-card';
      card.id = `finOptCard_${opt.key}`;

      const isSelected = answerState.selectedKey === opt.key;
      if (isSelected) card.classList.add('selected');

      if (answerState.verified) {
        card.classList.add('locked');
        if (opt.key === q.correctKey) {
          card.classList.add('verified-correct');
        } else if (isSelected && !answerState.isCorrect) {
          card.classList.add('verified-incorrect');
        }
      }

      card.innerHTML = `
        <div class="option-radio-visual">
          <span class="radio-circle"></span>
        </div>
        <div class="option-body-wrap">
          <div class="option-header-tag">
            <span class="opt-key-pill">${opt.key}</span>
            <span class="opt-title-text">${opt.title}</span>
          </div>
          <div class="opt-desc-text">${opt.text}</div>
        </div>
      `;

      if (!answerState.verified) {
        card.addEventListener('click', () => selectFinalOption(opt.key));
      }

      optionsContainer.appendChild(card);
    });

    // Verify Button
    const btnVerify = document.getElementById('btnVerifyAnswerFinal');
    if (answerState.verified) {
      btnVerify.disabled = true;
      btnVerify.innerHTML = `<span>✓ FINAL ANSWER VERIFIED (${answerState.points} PTS)</span>`;
      btnVerify.classList.add('btn-verified-done');
    } else {
      btnVerify.disabled = false;
      btnVerify.innerHTML = `<span>VERIFY FINAL ANSWER</span>`;
      btnVerify.classList.remove('btn-verified-done');
    }

    // Explanation Panel
    const explPanel = document.getElementById('finExplanationPanel');
    const explBanner = document.getElementById('finExplanationStatusBanner');
    const explIcon = document.getElementById('finExplanationStatusIcon');
    const explText = document.getElementById('finExplanationStatusText');
    const explBody = document.getElementById('finExplanationBodyContent');

    if (answerState.verified) {
      explPanel.style.display = 'block';
      if (answerState.isCorrect) {
        explBanner.className = 'explanation-status-banner status-correct';
        explIcon.textContent = '✓';
        explText.textContent = 'CORRECT FINAL DIAGNOSIS (+10 PTS)';
      } else {
        explBanner.className = 'explanation-status-banner status-incorrect';
        explIcon.textContent = '✖';
        explText.textContent = 'INCORRECT FINAL DIAGNOSIS (0 PTS)';
      }
      explBody.innerHTML = q.explanationHtml;
    } else {
      explPanel.style.display = 'none';
    }

    // Nav buttons
    const btnPrev = document.getElementById('btnPrevQuestionFinal');
    const btnNext = document.getElementById('btnNextQuestionFinal');

    btnPrev.disabled = idx === 0;
    btnPrev.onclick = () => renderFinalQuestion(idx - 1);

    if (idx === FINAL_QUESTIONS.length - 1) {
      btnNext.innerHTML = `<span>SUBMIT FINAL ROUND →</span>`;
      btnNext.disabled = !answerState.verified;
      btnNext.onclick = () => submitFinalRound();
    } else {
      btnNext.innerHTML = `<span>NEXT QUESTION →</span>`;
      btnNext.disabled = !answerState.verified;
      btnNext.onclick = () => renderFinalQuestion(idx + 1);
    }

    updateFinalSidebarSummary();
    saveActiveSession();
  }

  function selectFinalOption(key) {
    const q = FINAL_QUESTIONS[appState.final.currentQ];
    const answerState = appState.final.answers[q.id];
    if (answerState && answerState.verified) return;

    answerState.selectedKey = key;

    document.querySelectorAll('#finOptionsCardsList .option-card').forEach(card => {
      card.classList.remove('selected');
    });
    const selectedCard = document.getElementById(`finOptCard_${key}`);
    if (selectedCard) selectedCard.classList.add('selected');

    document.getElementById('finSelectionWarningTip').style.display = 'none';
    updateFinalSidebarSummary();
    saveActiveSession();
  }

  function verifyFinalAnswer() {
    const q = FINAL_QUESTIONS[appState.final.currentQ];
    const answerState = appState.final.answers[q.id];

    if (answerState.verified) return;

    if (!answerState.selectedKey) {
      document.getElementById('finSelectionWarningTip').style.display = 'block';
      return;
    }

    answerState.verified = true;
    answerState.isCorrect = (answerState.selectedKey === q.correctKey);

    if (answerState.isCorrect) {
      answerState.points = 10;
      appState.final.score += 10;
      showToast('Correct Final Diagnosis! +10 Points.', 'success');
    } else {
      answerState.points = 0;
      showToast('Incorrect Final Diagnosis.', 'danger');
    }

    renderFinalQuestion(appState.final.currentQ);
  }

  function updateFinalSidebarSummary() {
    document.getElementById('finSidebarScoreVal').textContent = appState.final.score;

    const grid = document.getElementById('finQMatrixGrid');
    grid.innerHTML = '';

    FINAL_QUESTIONS.forEach((q, idx) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'q-matrix-pill';
      pill.textContent = `FQ0${q.num}`;

      const ans = appState.final.answers[q.id];
      if (idx === appState.final.currentQ) {
        pill.classList.add('current');
      } else if (ans.verified) {
        pill.classList.add(ans.isCorrect ? 'verified-correct' : 'verified-incorrect');
      } else if (ans.selectedKey) {
        pill.classList.add('answered');
      }

      pill.addEventListener('click', () => renderFinalQuestion(idx));
      grid.appendChild(pill);
    });
  }

  function startFinalTimer() {
    if (finalTimerInterval) clearInterval(finalTimerInterval);
    updateFinalTimerDisplay();

    finalTimerInterval = setInterval(() => {
      if (appState.final.remainingSeconds > 0) {
        appState.final.remainingSeconds--;
        updateFinalTimerDisplay();
      } else {
        clearInterval(finalTimerInterval);
        finalTimerInterval = null;
        showToast('Final Round time expired! Submitting results.', 'warning');
        submitFinalRound();
      }
    }, 1000);
  }

  function updateFinalTimerDisplay() {
    const timeStr = formatSeconds(appState.final.remainingSeconds);
    const headerTimer = document.getElementById('headerTimerDisplay');
    const sidebarTimer = document.getElementById('finSidebarTimerDisplay');
    const progressFill = document.getElementById('finTimerProgressFill');

    if (headerTimer) headerTimer.textContent = timeStr;
    if (sidebarTimer) sidebarTimer.textContent = timeStr;

    const pct = Math.max(0, Math.min(100, (appState.final.remainingSeconds / FINAL_TOTAL_SECONDS) * 100));
    if (progressFill) progressFill.style.width = `${pct}%`;
  }

  function submitFinalRound() {
    if (finalTimerInterval) {
      clearInterval(finalTimerInterval);
      finalTimerInterval = null;
    }

    appState.final.completed = true;
    appState.final.completedAt = Date.now();

    // Update active finalist record in storage
    const list = getSavedFinalists();
    const finalistId = appState.activeFinalist ? appState.activeFinalist.id : null;
    const existing = list.find(f => f.id === finalistId);

    const semiScore = appState.semi.score;
    const finalScore = appState.final.score;
    const cumulative = semiScore + finalScore;

    if (existing) {
      existing.finalScore = finalScore;
      existing.cumulativeScore = cumulative;
      existing.status = 'Completed';
      saveFinalistsList(list);
      appState.activeFinalist = existing;
    }

    populateChampionScorecard();
    switchScreen('screenFinalResults');
    showToast('Final Championship Completed! Review your standing.', 'success');
  }

  /* ==========================================================================
     13. CHAMPIONSHIP RESULTS & SCORECARD (SCREEN 6)
     ========================================================================== */
  function populateChampionScorecard() {
    const f = appState.activeFinalist || {
      name: appState.contestant.name,
      id: 'TT26-F001',
      college: appState.contestant.college,
      dept: appState.contestant.department || appState.contestant.degree
    };

    const semiScore = appState.semi.score;
    const finalScore = appState.final.score;
    const totalScore = semiScore + finalScore;
    const totalPct = ((totalScore / 60) * 100).toFixed(1);

    document.getElementById('champName').textContent = f.name || 'Finalist';
    document.getElementById('champFinalistId').textContent = f.id || 'TT26-F001';
    document.getElementById('champCollege').textContent = f.college || 'A.V.C. College of Engineering (Autonomous)';
    document.getElementById('champDept').textContent = f.dept || 'Computer Applications';

    document.getElementById('champSemiScore').textContent = `${semiScore} / 40`;
    document.getElementById('champFinalScore').textContent = `${finalScore} / 20`;
    document.getElementById('champCombinedScore').textContent = `${totalScore} / 60`;
    document.getElementById('champCombinedPct').textContent = `${totalPct}%`;

    let statusText = 'HONORABLE FINALIST';
    if (totalScore >= 50) {
      statusText = '🏆 FIRST TIER CHAMPION';
    } else if (totalScore >= 35) {
      statusText = '🥈 MERIT FINALIST';
    }
    document.getElementById('champStatus').textContent = statusText;
  }

  function resetCurrentParticipant() {
    if (!confirm('Start test for a new contestant? Current unsaved session will be cleared.')) return;

    if (semiTimerInterval) clearInterval(semiTimerInterval);
    if (finalTimerInterval) clearInterval(finalTimerInterval);

    clearActiveSession();

    // Reset state without touching saved finalists
    appState.currentScreen = 'screenRegistration';
    appState.contestant = {
      name: '',
      rollNo: '',
      degree: '',
      department: '',
      college: 'A.V.C. College of Engineering (Autonomous)',
      email: '',
      phone: ''
    };
    appState.semi = {
      started: false,
      startedAt: null,
      remainingSeconds: SEMI_TOTAL_SECONDS,
      completed: false,
      completedAt: null,
      currentQ: 0,
      answers: {
        semi_q1: { selectedKey: null, verified: false, isCorrect: false, points: 0 },
        semi_q2: { selectedKey: null, verified: false, isCorrect: false, points: 0 },
        semi_q3: { selectedKey: null, verified: false, isCorrect: false, points: 0 },
        semi_q4: { selectedKey: null, verified: false, isCorrect: false, points: 0 }
      },
      score: 0
    };
    appState.activeFinalist = null;
    appState.final = {
      started: false,
      startedAt: null,
      remainingSeconds: FINAL_TOTAL_SECONDS,
      completed: false,
      completedAt: null,
      currentQ: 0,
      answers: {
        fin_q1: { selectedKey: null, verified: false, isCorrect: false, points: 0 },
        fin_q2: { selectedKey: null, verified: false, isCorrect: false, points: 0 }
      },
      score: 0
    };

    // Reset registration form
    const regForm = document.getElementById('formRegistration');
    if (regForm) regForm.reset();
    const deptInput = document.getElementById('regDepartment');
    if (deptInput) {
      deptInput.value = '';
      deptInput.disabled = true;
      deptInput.placeholder = 'Select your degree first';
    }

    switchScreen('screenRegistration');
    showToast('Ready for new contestant onboarding.', 'info');
  }

  /* ==========================================================================
     14. REGISTRATION FORM HANDLER
     ========================================================================== */
  function setupRegistrationForm() {
    const degreeSelect = document.getElementById('regDegree');
    const deptInput = document.getElementById('regDepartment');
    const form = document.getElementById('formRegistration');

    if (degreeSelect && deptInput) {
      degreeSelect.addEventListener('change', function () {
        const selVal = degreeSelect.value;
        const autoDept = DEGREE_DEPARTMENT_MAP[selVal] || '';
        deptInput.value = autoDept;
        deptInput.disabled = false;
        deptInput.placeholder = 'Department Specialization';
        document.getElementById('errDegree').style.display = 'none';
        document.getElementById('errDepartment').style.display = 'none';
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('regStudentName').value.trim();
        const roll = document.getElementById('regRollNo').value.trim();
        const degree = document.getElementById('regDegree').value;
        const dept = document.getElementById('regDepartment').value.trim();
        const college = document.getElementById('regCollege').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();

        let hasError = false;

        if (!name) {
          document.getElementById('errStudentName').style.display = 'block';
          hasError = true;
        } else {
          document.getElementById('errStudentName').style.display = 'none';
        }

        if (!roll) {
          document.getElementById('errRollNo').style.display = 'block';
          hasError = true;
        } else {
          document.getElementById('errRollNo').style.display = 'none';
        }

        if (!degree) {
          document.getElementById('errDegree').style.display = 'block';
          hasError = true;
        } else {
          document.getElementById('errDegree').style.display = 'none';
        }

        if (!dept) {
          document.getElementById('errDepartment').style.display = 'block';
          hasError = true;
        } else {
          document.getElementById('errDepartment').style.display = 'none';
        }

        if (!college) {
          document.getElementById('errCollege').style.display = 'block';
          hasError = true;
        } else {
          document.getElementById('errCollege').style.display = 'none';
        }

        if (hasError) {
          showToast('Please fill all mandatory fields.', 'warning');
          return;
        }

        // Save contestant
        appState.contestant = {
          name: name,
          rollNo: roll,
          degree: degree,
          department: dept,
          college: college,
          email: email,
          phone: phone
        };

        appState.semi.started = true;
        appState.semi.startedAt = Date.now();

        // Switch to Workspace & start timer
        renderSemiQuestion(0);
        switchScreen('screenTestWorkspace');
        startSemiTimer();
        showToast(`Welcome, ${name}! Semi-Final Examination begins.`, 'success');
      });
    }
  }

  /* ==========================================================================
     15. ATTACH GLOBAL EVENT LISTENERS & INITIALIZE
     ========================================================================== */
  function attachEventListeners() {
    // Header Admin button
    const btnHeaderAdmin = document.getElementById('btnHeaderAdmin');
    if (btnHeaderAdmin) btnHeaderAdmin.onclick = handleHeaderAdminClick;

    // Header Admin Confirm button in modal
    const btnConfirmHeaderAdmin = document.getElementById('btnConfirmHeaderAdmin');
    if (btnConfirmHeaderAdmin) btnConfirmHeaderAdmin.onclick = handleHeaderAdminConfirm;

    // Semi-Final Verify Answer
    const btnVerify = document.getElementById('btnVerifyAnswer');
    if (btnVerify) btnVerify.onclick = verifySemiAnswer;

    // Semi-Final Submit Exam button (Sidebar)
    const btnSubmitExam = document.getElementById('btnSubmitExam');
    if (btnSubmitExam) btnSubmitExam.onclick = handleSemiSubmitClick;

    // Confirm Modal Submit button
    const btnConfirmSubmit = document.getElementById('btnConfirmSubmitExam');
    if (btnConfirmSubmit) btnConfirmSubmit.onclick = finalizeSemiSubmission;

    // Print Semi Scorecard
    const btnPrintScorecard = document.getElementById('btnPrintScorecard');
    if (btnPrintScorecard) btnPrintScorecard.onclick = () => window.print();

    // Restart New Contestant from Scorecard
    const btnRestartNew = document.getElementById('btnRestartNewContestant');
    if (btnRestartNew) btnRestartNew.onclick = resetCurrentParticipant;

    // Admin Approval Gate Unlock button
    const btnUnlockFinalist = document.getElementById('btnUnlockFinalist');
    if (btnUnlockFinalist) btnUnlockFinalist.onclick = handleAdminUnlockClick;

    // Enter key inside password input
    const txtAdminPwd = document.getElementById('txtAdminPassword');
    if (txtAdminPwd) {
      txtAdminPwd.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleAdminUnlockClick();
      });
    }

    const txtHeaderAdminPwd = document.getElementById('txtHeaderAdminPassword');
    if (txtHeaderAdminPwd) {
      txtHeaderAdminPwd.addEventListener('keydown', e => {
        if (e.key === 'Enter') handleHeaderAdminConfirm();
      });
    }

    // Finalist Screen Actions
    const btnExport = document.getElementById('btnExportFinalistsJson');
    if (btnExport) btnExport.onclick = exportFinalistsJson;

    const fileImport = document.getElementById('fileImportFinalists');
    if (fileImport) fileImport.onchange = handleImportFinalists;

    const btnClearAll = document.getElementById('btnClearAllFinalists');
    if (btnClearAll) btnClearAll.onclick = clearAllFinalists;

    const btnSaveRecord = document.getElementById('btnSaveFinalistRecord');
    if (btnSaveRecord) btnSaveRecord.onclick = () => saveCurrentFinalistRecord(true);

    const btnStartFinal = document.getElementById('btnStartFinalRound');
    if (btnStartFinal) btnStartFinal.onclick = startFinalRound;

    // Final Workspace actions
    const btnVerifyFinal = document.getElementById('btnVerifyAnswerFinal');
    if (btnVerifyFinal) btnVerifyFinal.onclick = verifyFinalAnswer;

    const btnSubmitFinal = document.getElementById('btnSubmitFinalExam');
    if (btnSubmitFinal) btnSubmitFinal.onclick = submitFinalRound;

    // Champion Scorecard actions
    const btnPrintChamp = document.getElementById('btnPrintChampionScorecard');
    if (btnPrintChamp) btnPrintChamp.onclick = () => window.print();

    const btnChampNew = document.getElementById('btnChampNewParticipant');
    if (btnChampNew) btnChampNew.onclick = resetCurrentParticipant;
  }

  /* ==========================================================================
     16. BOOTSTRAP APPLICATION
     ========================================================================== */
  function initApp() {
    setupRegistrationForm();
    attachEventListeners();

    // Try restoring existing active session if available
    const hasSession = loadActiveSession();

    if (hasSession && appState.contestant && appState.contestant.name) {
      if (appState.final && appState.final.completed) {
        populateChampionScorecard();
        switchScreen('screenFinalResults');
      } else if (appState.final && appState.final.started) {
        renderFinalQuestion(appState.final.currentQ || 0);
        switchScreen('screenFinalWorkspace');
        startFinalTimer();
      } else if (appState.semi && appState.semi.completed) {
        populateSemiResultsScorecard();
        switchScreen('screenSemiResults');
      } else if (appState.semi && appState.semi.started) {
        renderSemiQuestion(appState.semi.currentQ || 0);
        switchScreen('screenTestWorkspace');
        startSemiTimer();
      } else {
        switchScreen('screenRegistration');
      }
    } else {
      switchScreen('screenRegistration');
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
