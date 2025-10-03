# EMI Calculation (NestJS)

EMI calculator for **salaried people** where salary credit day defines EMI boundaries.  
The service computes a uniform EMI across a given tenure but calculates **interest day-by-day** over changing month windows aligned to the salary cycle.

> Repo: `emi_calculation_nestjs` (NestJS + TypeScript + moment)

---

## ✨ What this does

Given:

- `loan_disbursement_date` — when the loan amount was disbursed
- `salary_cycle_date` — the recurring monthly date when salary is credited (e.g., 7th of each month)
- `tenure` — number of months
- `basic_principal_amount` — principal
- `interest_rate` — annual percentage rate (APR)

It outputs:

- A month-by-month schedule of EMI periods (aligned to salary days)
- Daily-proportional principal allocation for each period
- Interest for each period based on **days × outstanding × (APR/365 or APR/366)** depending on computed year length
- A **flat EMI** (same every month) computed from total principal + total interest
- Final month adjustment so that total effective principal equals the basic principal exactly
- Running balance after each period

---

## 🧠 Core Flow (from `EmiService#emiCalculationTest`)

1. **Parse inputs**

   ```ts
   const disbursementDate = moment(body.loan_disbursement_date);
   const salaryCycle = moment(body.salary_cycle_date); // treated as the "anchor" day each month
   const tenure = body.tenure; // months
   const P = body.basic_principal_amount;
   const APR = body.interest_rate; // %
   ```

2. **Build EMI periods** (arrays of `[from_date, to_date)`)

   - Compute `diffDays = salaryCycle.diff(disbursementDate, 'days')`.
   - If `diffDays > 0` → first period ends at the **same month’s salary date** and next periods are `+i months`.
   - Else → first period ends at **next month’s salary date** and so on.
   - Each period stores:
     - `from_date`, `to_date`
     - `str_month` (human display: `DD-MMM-YYYY` of `to_date`)
     - `no_of_days_for_interest_calc` as the exact day difference.

3. **Year length & daily rates**

   - Determine a 1-year span from a start anchor and measure days:  
     `total_days_in_year` = days between `year_start_date` and `year_end_date` (adds 1 year).
   - Compute:
     - `per_day_principal = P / total_days_in_emi`
     - `per_day_interest = (APR / 100) / total_days_in_year`

4. **Per-period principal & interest**

   - Principal in a period:  
     `principal_amount_i = no_of_days_i × per_day_principal`
   - Interest in a period:  
     `interest_amount_i = no_of_days_i × outstanding_i × per_day_interest`  
     (where `outstanding_i` starts at `P` and reduces by each period’s principal).

5. **Uniform EMI**

   - Total principal (should be ~P) + total interest = `sumTotal`
   - `emi = round2(sumTotal / tenure)`
   - For each period, set `emi`.

6. **Effective principal & last-month adjustment**

   - `effective_principal_i = emi - interest_amount_i`
   - Sum all but last → adjust the **last** period so:
     - `effective_principal_last = P - sum(effective_principal_0..last-1)`
     - `interest_last = emi - effective_principal_last`
   - Recompute running `balance_amount`.

7. **Return payload**
   - Totals, rates, per-day metrics, schedule array with all derived fields.

---

## 📦 Install & Run

### Prerequisites

- Node.js 18+ (recommended)
- npm (or yarn/pnpm)
- Git

### Clone and install

```bash
git clone https://github.com/TheAnandThakkar/emi_calculation_nestjs.git
cd emi_calculation_nestjs

# install deps
npm install

# (optional) if you use Nest CLI
# npm i -g @nestjs/cli
```

### Start the server

```bash
# dev
npm run start:dev

# or
npm run start
```

By default, Nest apps run on `http://localhost:3000` (unless your project config says otherwise).

---

## 🔌 API — Calculate EMI

> **Method**: `POST`  
> **Path**: `/emi/calculation/test`  
> (Adjust the path if your controller maps a different route. The service name is `EmiService#emiCalculationTest`.)

### Request body (JSON)

```json
{
  "loan_disbursement_date": "2025-01-20",
  "salary_cycle_date": "2025-01-07",
  "tenure": 6,
  "basic_principal_amount": 120000,
  "interest_rate": 12.0
}
```

#### Field meanings

- `loan_disbursement_date` (ISO date): date funds were disbursed.
- `salary_cycle_date` (ISO date _with the intended day_): use any date having the **day-of-month** you get paid (e.g., if you’re paid on the 7th, pass a date whose day is 7). The code advances this date by `+i months` to form period boundaries.
- `tenure` (months): number of salary-aligned EMI periods.
- `basic_principal_amount` (number): principal (P).
- `interest_rate` (APR %): e.g., `12` for 12% p.a.

### Example with `curl`

```bash
curl -X POST http://localhost:3000/emi/calculation/test   -H "Content-Type: application/json"   -d '{
    "loan_disbursement_date": "2025-01-20",
    "salary_cycle_date": "2025-01-07",
    "tenure": 6,
    "basic_principal_amount": 120000,
    "interest_rate": 12
  }'
```

### Example response (shape)

```json
{
  "tenure": 6,
  "basic_principal_amount": 120000,
  "interest_rate": 12,
  "total_days_in_emi": 181,
  "total_days_in_year": 365,
  "per_day_principal": 662.98,
  "per_day_interest": 0.0003287671,
  "total_repayble_amount": 122345.0,
  "effective_principal_amount_total": 120000.0,
  "emi_amount": 20390.83,
  "total_interest_payable": 2345.0,
  "emi": [
    {
      "from_date": "2025-01-20T00:00:00+05:30",
      "to_date": "2025-02-07T00:00:00+05:30",
      "str_month": "07-Feb-2025",
      "no_of_days_for_interest_calc": 18,
      "principal_amount": 11933.64,
      "interest_amount": 708.0,
      "emi": 20390.83,
      "effective_principal_amount": 19682.83,
      "balance_amount": 100317.17
    }
    // ... one object per month, last one adjusted
  ]
}
```

> Note: values above are illustrative; actual numbers depend on dates and rounding in the service.

---

## 📐 Formulas & Logic

- **Day counts per period**  
  `days_i = diff(to_date_i, from_date_i)`

- **Per-day rates**

  ```
  per_day_principal = P / sum(days_i over tenure)
  per_day_interest  = (APR / 100) / total_days_in_year
  ```

- **Per period**

  ```
  principal_i = round2(days_i * per_day_principal)

  interest_i  = round2(days_i * outstanding_i * per_day_interest)
  outstanding_{i+1} = outstanding_i - principal_i
  ```

- **Uniform EMI**

  ```
  total_interest = sum(interest_i)
  emi = round2( (P + total_interest) / tenure )
  ```

- **Effective principal & last-period fix**

  ```
  effective_principal_i = emi - interest_i

  effective_principal_last = P - sum(effective_principal_0..last-1)
  interest_last            = emi - effective_principal_last
  ```

- **Balance**
  ```
  balance_{i+1} = balance_i - effective_principal_i
  ```

Rounding: the code uses `toFixed(2)` and `parseFloat` to keep currency-like precision.

---

## 👀 Salary-Aligned Windows (Important!)

- If **salary day is after disbursement day** (`diff > 0`):  
  First `to_date` = salary day **in the same month**, then add `+i months`.
- If **salary day is on/before disbursement day**:  
  First `to_date` = salary day **in the next month**, then add `+i months`.

This makes each period roughly “from last EMI date to the next salary day”, matching salaried cashflows.

---

## 🧪 Quick Test Checklist

- Try disbursement a few days **before** salary day.
- Try disbursement a few days **after** salary day.
- Use tenure values like 1, 3, 6, 12.
- Use Feb dates to see year-length handling.
- Verify:
  - `sum(effective_principal) === basic_principal_amount`
  - `sum(emi) === total_repayble_amount`
  - Last month **effective principal is adjusted** to close exactly at zero balance.

---

## 🛠 Tech Notes

- **moment** is used for date math (`diff`, `add`, `format`).  
  If you ever migrate, `Luxon` or native `Temporal` (when stable) are modern alternatives.
- The service is exposed via a NestJS provider (`@Injectable()`). Ensure your controller maps a route to `emiCalculationTest`.
- Types come from `EmiCalculationDto` (fields listed above).

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/better-rounding`
3. Commit: `git commit -m "Improve last-EMI rounding logic"`
4. Push: `git push origin feat/better-rounding`
5. Open a PR

Suggestions welcome:

- Toggle for 30/360 vs actual/365 interest convention
- Custom rounding hooks (bankers’ rounding, smallest-change reconciliation)
- Multi-disbursement support
- Grace period / moratorium

---

## 📄 License

MIT — see `LICENSE` in the repo.

---

## 🙋 FAQ

**Q: Do I pass the exact salary date each month?**  
A: No. Pass a single `salary_cycle_date` whose **day** matches your salary day (e.g., `2025-01-07`). The service will add months.

**Q: Why does the last month differ slightly?**  
A: To ensure the **total effective principal** equals the **original principal** after rounding, the last month’s effective principal (and thus interest) is adjusted.
