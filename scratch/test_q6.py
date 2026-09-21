def calculate(values):
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
print(result["max"])
