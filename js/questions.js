/**
 * DATA BANK: 4 SEMI-FINAL QUESTIONS (20 ERRORS) & 2 FINAL QUESTIONS (10 ERRORS)
 * Questions 1, 2, 3: strictly 8 to 15 lines max.
 * Question 4 & Final: strictly 10 to 18 lines max.
 * Question descriptions: strictly 2 to 3 lines. No clutter.
 * Exactly 5 intentional errors per question.
 */
const COMPETITION_QUESTIONS = {
  semi: [
    /* SEMI QUESTION 1 (13 lines, 5 errors) */
    {
      id: 'semi_q1',
      stage: 'SEMI-FINAL',
      number: 1,
      total: 4,
      difficulty: 'MODERATE',
      title: 'Daily Meal Sales & Tax Auditing',
      shortPrompt: 'Calculate total discounted sales, total tax, and the highest net meal category.\nApply 10% volume discount for quantity > 5, 5% tax for Breakfast (\'B\') vs 8% for others, and track top category.',
      expectedOutput: `Sales: 2225.00 Tax: 167.02 Top: L`,
      buggyCode: `items = [['B', 6, 40.0], ['L', 4, 80.0], ['D', 8, 120.0], ['B', 3, 50.0], ['L', 10, 75.0]]
total_sales = 0.0; total_tax = 0.0; max_bill = -1.0; top_cat = ''

for item in items:
    cat, qty, price = item[0], item[1], item[2]
    base = qty * price
    disc = price * 0.10 if qty < 5 else 0.0
    sub = base - disc
    tax_rate = 0.08 if cat == 'B' else 0.05
    tax = sub * tax_rate; net = sub + tax
    total_sales += sub; total_tax =+ tax
    if net < max_bill:
        max_bill = net; top_cat = cat

print(f"Sales: {total_sales:.2f} Tax: {total_tax:.2f} Top: {top_cat}")`,
      rulesHex: '7b226d696e4c696e6573223a382c22636865636b73223a5b2267745f66697665222c22626173655f64697363222c227461785f72617465222c22706c75735f657175616c222c2267745f6d6178225d7d'
    },

    /* SEMI QUESTION 2 (12 lines, 5 errors) */
    {
      id: 'semi_q2',
      stage: 'SEMI-FINAL',
      number: 2,
      total: 4,
      difficulty: 'MODERATE',
      title: 'Student Exam Attendance & Medical Condonation',
      shortPrompt: 'Compute attendance percentage and eligibility with a 10% condonation bonus for attendance in [65%, 75%) with medical certificate (\'Y\').\nEligible if attendance >= 75% and score >= 40. Track eligible count and top student.',
      expectedOutput: `Eligible: 2, Top: Eshan (95.0%)`,
      buggyCode: `students = [["Aravind", 38, 45, 'N', 78], ["Bhavna", 28, 45, 'Y', 65], ["Eshan", 42, 45, 'N', 92]]
eligible = 0; max_pct = 0.0; top_student = ""

for i in range(1, len(students)):
    name, att, total, med, score = students[i]
    pct = att / total + 100
    if pct < 75.0 and (pct >= 65.0 or med == 'Y'):
        pct += 10.0
    if pct >= 75.0 and score >= 40:
        eligible = eligble + 1
        if pct < max_pct:
            max_pct = pct; top_student = name

print(f"Eligible: {eligible}, Top: {top_student} ({max_pct:.1f}%)")`,
      rulesHex: '7b226d696e4c696e6573223a382c22636865636b73223a5b2273746172745f7a65726f222c226d756c745f68756e64726564222c22616e645f6d6564222c226669785f7479706f222c2267745f706374225d7d'
    },

    /* SEMI QUESTION 3 (15 lines, 5 errors) */
    {
      id: 'semi_q3',
      stage: 'SEMI-FINAL',
      number: 3,
      total: 4,
      difficulty: 'MODERATE → HARD',
      title: 'Sensor Matrix Temperature & Hotspots Analysis',
      shortPrompt: 'Analyze a 3x3 sensor matrix to compute the overall average temperature and count active hotspots.\nA hotspot is strictly greater than its row average and the overall average. Find the peak column index.',
      expectedOutput: `Average: 32.78, Hotspots: 3, Peak Column: 1`,
      buggyCode: `grid = [[28.0, 34.0, 31.0], [32.0, 36.0, 38.0], [29.0, 30.0, 37.0]]
total = 0.0; row_sum = 0.0; hotspots = 0; row_avgs = []
for r in range(len(grid)):
    for c in range(len(grid[0])):
        val = grid[c][r]; row_sum += val; total += val
    row_avgs.append(row_sum / len(grid[0]))
overall_avg = total / len(grid)
for r in range(len(grid)):
    for c in range(len(grid[0])):
        if grid[r][c] <= row_avgs[r] and grid[r][c] > overall_avg: hotspots += 1
col_sums = [grid[0][c] + grid[1][c] + grid[2][c] for c in range(3)]
peak_c = 0; max_c = -1.0
for c in range(3):
    if col_sums[c] < max_c: max_c = col_sums[c]; peak_c = c
print(f"Average: {overall_avg:.2f}, Hotspots: {hotspots}, Peak Column: {peak_c}")`,
      rulesHex: '7b226d696e4c696e6573223a31302c22636865636b73223a5b2272657365745f726f77222c22636f72726563745f67726964222c22746f74616c5f63656c6c73222c2267745f686f7473706f74222c2267745f636f6c225d7d'
    },

    /* SEMI QUESTION 4 (14 lines, 5 errors) */
    {
      id: 'semi_q4',
      stage: 'SEMI-FINAL',
      number: 4,
      total: 4,
      difficulty: 'HARD',
      title: 'Hostel Tiered Power Tariff & Peak Surcharges',
      shortPrompt: 'Calculate room electricity with slabs (0-100 @ 3.0, 101-200 @ 4.5, >200 @ 6.0), peak surcharge (+2.0), and 5% green rebate if units < 80.\nTrack total revenue, tier-3 rooms count (>200 units), and the highest billed room.',
      expectedOutput: `Revenue: 1988.00, Tier3: 1, Top: Room 103`,
      buggyCode: `def calc_bill(units, peak):
    if units <= 100: e = units * 3.0
    elif units <= 200: e = 300.0 + (units - 100) * 4.5
    else: e = 300.0 + 450.0 + (units - 100) * 6.0
    tot = e + peak * 2.0
    return tot - 5.0 if units < 80 else tot

rooms = [[101, 70, 15], [102, 160, 40], [103, 240, 60]]
total_rev = 0.0; tier3_cnt = 1; max_b = -1.0; top_room = 0

for r, u, p in rooms:
    b = calc_bill(p, u)
    total_rev += b
    if u > 200: tier3_cnt += 1
    if b < max_b:
        max_b = b; top_room = r

print(f"Revenue: {total_rev:.2f}, Tier3: {tier3_cnt}, Top: Room {top_room}")`,
      rulesHex: '7b226d696e4c696e6573223a31302c22636865636b73223a5b2274696572335f736c6162222c227265626174655f706374222c227a65726f5f7469657233222c2263616c6c5f6f72646572222c2267745f6d6178225d7d'
    }
  ],

  final: [
    /* FINAL QUESTION 1 (13 lines, 5 errors) */
    {
      id: 'final_q1',
      stage: 'FINAL TEST',
      number: 1,
      total: 2,
      difficulty: 'MODERATE',
      title: 'Library Overdue Book Fines & Faculty Waiver',
      shortPrompt: 'Calculate overdue fines with slabs (1-5 days @ 2.0, 6-10 @ 5.0, >10 @ 10.0 + 50.0 admin fee) and 50% waiver for Faculty.\nTrack total fines collected, heavily overdue loans count (>10 days), and maximum single fine.',
      expectedOutput: `Total: 145.50, Overdue: 1, Max: 125.00`,
      buggyCode: `records = [["LIB-1", "Student", 4], ["LIB-2", "Faculty", 8], ["LIB-3", "Student", 14]]
total_fines = 0.0; heavily_overdue = 0; max_fine = 0.0

for pid, ptype, days in records:
    if days <= 5: f = days * 2.0
    elif days <= 10: f = days * 5.0
    else: f = 35.0 + (days - 10) * 10.0 + 50.0
    if ptype = 'Faculty': f *= 0.50
    total_fines =+ f
    if days < 10: heavily_overdue += 1
    if f > max_fine: max_fine = total_fines

print(f"Total: {total_fines:.2f}, Overdue: {heavily_overdue}, Max: {max_fine:.2f}")`,
      rulesHex: '7b226d696e4c696e6573223a392c22636865636b73223a5b22736c61625f74656e222c22657175616c5f666163756c7479222c22616363756d5f706c7573222c2267745f74656e222c226669785f6d6178225d7d'
    },

    /* FINAL QUESTION 2 (14 lines, 5 errors) */
    {
      id: 'final_q2',
      stage: 'FINAL TEST',
      number: 2,
      total: 2,
      difficulty: 'HARD',
      title: 'Inter-College Hackathon Leaderboard & Penalties',
      shortPrompt: 'Calculate net score (problem scores minus 10% time penalty for solved problems) with 20-point bonus if all 3 problems are solved.\nCount speed bonus teams and determine the champion team.',
      expectedOutput: `Bonus Teams: 1, Champion: Beta Score: 308.0`,
      buggyCode: `teams = [["Alpha", [100, 80, 0], [25, 45, 60]], ["Beta", [100, 100, 100], [30, 40, 50]]]
bonus_teams = 0; top_score = -1.0; champion = ""

for t in teams:
    name, scores, times = t[1], t[1], t[2]
    raw = sum(scores[i] for i in range(3) if scores[i] >= 0)
    pen = sum(times[i] for i in range(3) if scores[i] >= 0)
    solved = sum(1 for s in scores if s > 0)
    if len(scores) == 3: raw += 20; bonus_teams += 1
    net = raw - (pen * 0.1)
    champion = name
    if net > top_score: top_score = net

print(f"Bonus Teams: {bonus_teams}, Champion: {champion} Score: {top_score:.1f}")`,
      rulesHex: '7b226d696e4c696e6573223a31302c22636865636b73223a5b227465616d5f7a65726f222c2273636f72655f67745f7a65726f222c22736f6c7665645f7468726565222c226368616d705f6966222c2270656e5f67745f7a65726f225d7d'
    }
  ]
};
