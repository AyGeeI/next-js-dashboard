import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardMetric } from "@/components/widgets/card-metric";
import { mockFinanceData } from "@/lib/mocks";
import { Wallet, TrendingUp, TrendingDown, Target } from "lucide-react";

const currency = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export default function FinanzenPage() {
  const { balance, income, expenses, transactions, savingsGoal } = mockFinanceData;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Finanzen</h1>
        <p className="text-sm text-muted-foreground">
          Ihre finanzielle Übersicht und Transaktionen (Dummy-Daten)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Kontostand"
          value={currency.format(balance)}
          icon={Wallet}
          description="Aktueller Kontostand"
          valueClassName={balance >= 0 ? "text-emerald-600" : "text-red-600"}
        />
        <CardMetric
          title="Einnahmen"
          value={currency.format(income)}
          icon={TrendingUp}
          description="Diesen Monat"
          valueClassName="text-emerald-600"
          delta={{
            value: "+8.2%",
            trend: "up",
            label: "vs. Vormonat"
          }}
        />
        <CardMetric
          title="Ausgaben"
          value={currency.format(expenses)}
          icon={TrendingDown}
          description="Diesen Monat"
          valueClassName="text-red-600"
          delta={{
            value: "-3.1%",
            trend: "down",
            label: "vs. Vormonat"
          }}
        />
        <CardMetric
          title="Sparziel"
          value={`${savingsGoal.percentage}%`}
          icon={Target}
          description={`${currency.format(savingsGoal.current)} / ${currency.format(savingsGoal.target)}`}
        />
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Letzte Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              const formattedAmount = currency.format(Math.abs(transaction.amount));
              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-2 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <p className={`text-base font-semibold ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
                    {isIncome ? "+" : "-"}
                    {formattedAmount}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sparziel-Fortschritt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                {currency.format(savingsGoal.current)} von {currency.format(savingsGoal.target)}
              </span>
              <span className="text-sm font-medium text-foreground">{savingsGoal.percentage}%</span>
            </div>
            <div className="h-4 w-full rounded-md bg-muted">
              <div
                className="h-full rounded-md bg-primary transition-all"
                style={{ width: `${savingsGoal.percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Hinweis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Dies sind Dummy-Daten. In einer produktiven Umgebung würden hier echte Finanzdaten aus einer Datenbank
            oder einer Banking-API dargestellt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
