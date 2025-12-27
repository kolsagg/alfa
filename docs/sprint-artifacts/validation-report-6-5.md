# Validation Report

**Document:** `docs/sprint-artifacts/6-5-card-cut-off-date-awareness.md`
**Checklist:** `.bmad/bmm/workflows/4-implementation/create-story/checklist.md`
**Date:** 2025-12-27

## Summary

- Overall: 12/15 passed (80%)
- Critical Issues: 1

## Section Results

### Epic Analysis & AC Coverage

Pass Rate: 5/5 (100%)
✓ All ACs from Epics.md (1250-1265) are captured.
✓ Debit card exclusion is explicitly handled (AC5).
✓ Month-end edge cases mentioned (AC4).

### Technical Specifications

Pass Rate: 3/4 (75%)
✓ Calculation logic defined.
⚠ **PARTIAL** - The distinction between "Normalized Monthly Spending" (from 6.4) and "Actual Predicted Statement Amount" is blurred.
Evidence: Task 2.3 says "Integrate with existing spending calculation utilities", but `normalizeToMonthly` is actually inappropriate for statement prediction (bill is based on actual hits, not average load).

### Disaster Prevention (Gaps)

Pass Rate: 2/4 (50%)
✗ **FAIL** - Missing logic for handled multiple occurrences of the same subscription in one statement period (e.g., 5 weekly payments in a 31-day window).
✗ **FAIL** - Visual conflict on CardVisual: Current story says highlight upcoming payments but doesn't define if the "Total" on the card face changes to "Statement Total" or stays as "Monthly Load".

### LLM Optimization

Pass Rate: 2/2 (100%)
✓ Clear structure.
✓ Actionable tasks.

## Failed Items

- **Actual vs Normalized Calculation**: Recommendation: Explicitly define `calculateActualStatementAmount()` which iterates through payment dates, instead of using `normalizeToMonthly`.
- **Multiple Instances Logic**: Recommendation: Add a subtask to handle finding all `nextPaymentDate` + (N \* period) instances that fall between `startDate` and `endDate`.

## Partial Items

- **UI Consistency**: Recommendation: Define whether the `CardVisual` displays the "Monthly Load" or "Statement Predicted Bill" by default, or if it is a toggle/hover state.

## Recommendations

1. **Must Fix**: Differentiate calculation logic. A credit card bill prediction is useless if it shows a $120 yearly sub as a $10 monthly load. It must show $120 if the payment is in the current period, $0 otherwise.
2. **Should Improve**: Extend `spending-calculator.ts` with "Actual" calculation mode rather than creating a fragmented `statement-period.ts` for money logic.
3. **Consider**: Adding a "Statement Insight" component inside `CardDetailSheet` that shows "X days remaining in cycle".
