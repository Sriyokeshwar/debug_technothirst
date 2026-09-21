/**
 * DATA BANK: 4 SEMI-FINAL QUESTIONS & 2 FINAL QUESTIONS
 * Exactly matching user specification:
 * Semi-Final:
 * Q1: nums even filter & average
 * Q2: check numbers limit & sum
 * Q3: text words count & common list indexing
 * Q4: Student class total, average, result
 *
 * Final:
 * Q5: process even, doubled, filtered > 20
 * Q6: calculate try/except ValueError on strings with negative max & avg
 */
const COMPETITION_QUESTIONS = {
  semi: [
    /* SEMI QUESTION 1 */
    {
      id: 'semi_q1',
      stage: 'SEMI-FINAL',
      number: 1,
      total: 4,
      title: 'Even Numbers Filter & Average Calculation',
      shortPrompt: 'Filter all even integers from the list and compute their sum and average.\nEnsure even numbers are correctly identified and average divides by the count of even numbers.',
      expectedOutput: `Even: [12, 18, 24]\nAverage: 18.0`,
      buggyCode: `nums = [12, 15, 18, 21, 24]
even = [n for n in nums if n % 2 == 1]
total = sum(even)
avg = total / len(nums)
print("Even:", even)
print("Average:", avg)`,
      rulesHex: '7b226d696e4c696e6573223a352c22636865636b73223a5b226576656e5f66696c746572222c226176675f646976225d7d'
    },

    /* SEMI QUESTION 2 */
    {
      id: 'semi_q2',
      stage: 'SEMI-FINAL',
      number: 2,
      total: 4,
      title: 'Threshold Filter & Numeric Summation',
      shortPrompt: 'Filter all numbers strictly greater than the limit and compute their cumulative sum.\nEnsure values are appended as numbers so sum() succeeds without TypeError.',
      expectedOutput: `[15, 20]\nTotal: 35`,
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
      rulesHex: '7b226d696e4c696e6573223a382c22636865636b73223a5b22617070656e645f6e756d222c2273756d5f746f74616c225d7d'
    },

    /* SEMI QUESTION 3 */
    {
      id: 'semi_q3',
      stage: 'SEMI-FINAL',
      number: 3,
      total: 4,
      title: 'Word Frequency Counter & Common Words Indexing',
      shortPrompt: 'Count word occurrences in text and extract repeated words.\nFix index boundary error when accessing elements of the common words list.',
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
      rulesHex: '7b226d696e4c696e6573223a382c22636865636b73223a5b226669785f696e646578222c22636f756e745f66696c746572225d7d'
    },

    /* SEMI QUESTION 4 */
    {
      id: 'semi_q4',
      stage: 'SEMI-FINAL',
      number: 4,
      total: 4,
      title: 'Student Class Attributes & Method Invocations',
      shortPrompt: 'Manage student records with class-level student counters, average marks, and pass/fail evaluation.\nFix class attribute access inside constructor and call the average method properly.',
      expectedOutput: `Arun 56.666666666666664 PASS\n1`,
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
      rulesHex: '7b226d696e4c696e6573223a31302c22636865636b73223a5b22636c6173735f746f74616c222c226176675f63616c6c225d7d'
    }
  ],

  final: [
    /* FINAL QUESTION 1 (Q5) */
    {
      id: 'final_q1',
      stage: 'FINAL TEST',
      number: 1,
      total: 2,
      title: 'List Transformation & Filter Pipeline',
      shortPrompt: 'Filter even numbers, map double values, and filter elements strictly greater than 20.\nEnsure process function returns even and filtered lists and print total sum.',
      expectedOutput: `Even: [4, 8, 12, 20]\nFiltered: [24, 40]\nTotal: 64`,
      buggyCode: `def process(values):
    even = [x for x in values if x % 2 == 0]
    doubled = list(map(lambda x: x * 2, even))
    filtered = [x for x in doubled if x > 20]
    return even, filtered

data = [4, 8, 12, 15, 20]
a, b = process(data)
print("Even:", a)
print("Filtered:", b)
print("Total:", sum(b))`,
      rulesHex: '7b226d696e4c696e6573223a382c22636865636b73223a5b2270726f636573735f66756e63222c22646f75626c65645f66696c746572225d7d'
    },

    /* FINAL QUESTION 2 (Q6) */
    {
      id: 'final_q2',
      stage: 'FINAL TEST',
      number: 2,
      total: 2,
      title: 'String Data Parsing & Robust Exception Handling',
      shortPrompt: 'Parse numeric strings from heterogeneous list, classify positive and negative values, and compute statistics.\nPrevent ValueError from aborting calculation and compute negative max and average.',
      expectedOutput: `[10, 20]\n-2`,
      buggyCode: `def calculate(values):
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
      rulesHex: '7b226d696e4c696e6573223a31302c22636865636b73223a5b2270617273655f6e756d73222c2263616c635f7374617473225d7d'
    }
  ]
};
