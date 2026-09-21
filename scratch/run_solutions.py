import io
import sys

def test_q1():
    out = io.StringIO()
    sys.stdout = out
    nums = [12, 15, 18, 21, 24]
    even = [n for n in nums if n % 2 == 0]
    total = sum(even)
    avg = total / len(even)
    print("Even:", even)
    print("Average:", avg)
    sys.stdout = sys.__stdout__
    return out.getvalue().strip()

def test_q2():
    out = io.StringIO()
    sys.stdout = out
    def check(numbers, limit=10):
        result = []
        for n in numbers:
            if n > limit:
                result.append(n)
        total = sum(result)
        return result, total

    data = [5, 15, 20, 8]
    values, total = check(data, 10)
    print(values)
    print("Total:", total)
    sys.stdout = sys.__stdout__
    return out.getvalue().strip()

def test_q3():
    out = io.StringIO()
    sys.stdout = out
    text = "Python Python Java Python Java"
    words = text.split()
    count = {}
    for word in words:
        count[word] = count.get(word, 0) + 1
    common = [w for w in count if count[w] > 1]
    print("Count:", count)
    print("Common:", common)
    print(common[1])
    sys.stdout = sys.__stdout__
    return out.getvalue().strip()

def test_q4():
    out = io.StringIO()
    sys.stdout = out
    class Student:
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
    print(Student.total)
    sys.stdout = sys.__stdout__
    return out.getvalue().strip()

def test_q5():
    out = io.StringIO()
    sys.stdout = out
    def process(values):
        even = [x for x in values if x % 2 == 0]
        doubled = list(map(lambda x: x * 2, even))
        filtered = [x for x in doubled if x > 20]
        return even, filtered

    data = [4, 8, 12, 15, 20]
    a, b = process(data)
    print("Even:", a)
    print("Filtered:", b)
    print("Total:", sum(b))
    sys.stdout = sys.__stdout__
    return out.getvalue().strip()

def test_q6():
    out = io.StringIO()
    sys.stdout = out
    def calculate(values):
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
    print(result["max"])
    sys.stdout = sys.__stdout__
    return out.getvalue().strip()

print("Q1 Output:\n" + test_q1())
print("-" * 30)
print("Q2 Output:\n" + test_q2())
print("-" * 30)
print("Q3 Output:\n" + test_q3())
print("-" * 30)
print("Q4 Output:\n" + test_q4())
print("-" * 30)
print("Q5 Output:\n" + test_q5())
print("-" * 30)
print("Q6 Output:\n" + test_q6())
