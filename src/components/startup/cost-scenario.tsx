"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { calculateScenario } from "@/lib/startup/planner";
import { MAX_SCENARIO_AMOUNT, type StartupScenario } from "@/lib/startup/types";

const fields = [
  ["cashAvailable", "Available cash"], ["oneTimeCost", "One-time setup cost"],
  ["fixedMonthlyCost", "Fixed monthly cost"], ["monthlyPrice", "Monthly price per customer"],
  ["variableCost", "Monthly cost per customer"], ["customers", "Assumed paying customers"],
] as const;

export function CostScenario({ value, onChange }: { value: StartupScenario; onChange: (next: StartupScenario) => void }) {
  const result = calculateScenario(value);
  const money = (amount: number) => new Intl.NumberFormat("en", { style: "currency", currency: value.currency, maximumFractionDigits: 2 }).format(amount);
  return <div className="space-y-5">
    <p className="max-w-2xl text-sm text-muted-foreground">Enter your own assumptions. Nothing here is a price quote or revenue forecast. All costs and revenue use the same monthly period; include your time or salary if it needs to be funded.</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="startup-currency">Currency</Label><Select id="startup-currency" value={value.currency} onChange={event => onChange({ ...value, currency: event.target.value as StartupScenario["currency"] })}>{["INR", "USD", "EUR", "GBP"].map(c => <option key={c}>{c}</option>)}</Select></div>
      {fields.map(([key, label]) => <div key={key} className="space-y-2">
        <Label htmlFor={`startup-cost-${key}`}>{label}</Label>
        <Input id={`startup-cost-${key}`} type="number" inputMode={key === "customers" ? "numeric" : "decimal"} min={0} max={key === "customers" ? 1000000 : MAX_SCENARIO_AMOUNT} step={key === "customers" ? 1 : "0.01"} value={value[key]} onChange={event => {
          const number = event.target.valueAsNumber;
          if (Number.isFinite(number) && number >= 0 && number <= (key === "customers" ? 1000000 : MAX_SCENARIO_AMOUNT) && (key !== "customers" || Number.isInteger(number))) onChange({ ...value, [key]: number });
          else if (event.target.value === "") onChange({ ...value, [key]: 0 });
        }} />
      </div>)}
    </div>
    <dl className="grid gap-x-6 gap-y-4 border-y border-border py-5 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
      {[
        ["Monthly revenue", money(result.revenue)], ["Monthly costs", money(result.monthlyCost)], ["Monthly net", money(result.monthlyNet)],
        ["Cash after setup", money(result.cashAfterSetup)],
        ["Break-even customers", result.breakEvenCustomers === null ? "Needs a positive margin" : String(result.breakEvenCustomers)],
        ["Runway at this scenario", result.cashAfterSetup < 0 ? "Setup exceeds available cash" : result.runwayMonths === null ? "No monthly cash burn entered" : `${result.runwayMonths.toFixed(1)} months`],
      ].map(([label, output]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-base font-semibold tabular-nums">{output}</dd></div>)}
    </dl>
    {result.cashAfterSetup < 0 && <p className="text-sm text-destructive">Setup costs exceed the available cash in this scenario.</p>}
    <p className="text-xs leading-relaxed text-muted-foreground">Amounts are calculated to two decimal places. Revenue = price × customers. Costs = fixed costs + variable cost × customers. Break-even = fixed costs ÷ (price − variable cost), rounded up. Runway assumes constant customers and costs, with no growth, churn or additional funding. Changing currency changes the unit label; it does not convert amounts.</p>
  </div>;
}
