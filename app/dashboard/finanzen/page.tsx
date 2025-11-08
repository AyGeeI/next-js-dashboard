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
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Finanzen</h2>
        <p className="text-muted-foreground">
          Ihre finanzielle Übersicht und Transaktionen (Dummy-Daten)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Kontostand"
          value={currency.format(balance)}
          icon={Wallet}
          description="Aktueller Kontostand"
        />
        <CardMetric
          title="Einnahmen"
          value={currency.format(income)}
          icon={TrendingUp}
          description="Diesen Monat"
        />
        <CardMetric
          title="Ausgaben"
          value={currency.format(expenses)}
          icon={TrendingDown}
          description="Diesen Monat"
        />
        <CardMetric
          title="Sparziel"
          value={`${savingsGoal.percentage}%`}
          icon={Target}
          description={`${currency.format(savingsGoal.current)} / ${currency.format(savingsGoal.target)}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Letzte Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              const formattedAmount = currency.format(Math.abs(transaction.amount));
              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <p className={`text-lg font-semibold ${isIncome ? "text-primary" : "text-foreground"}`}>
                    {isIncome ? "+" : "-"}
                    {formattedAmount}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sparziel-Fortschritt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                {currency.format(savingsGoal.current)} von {currency.format(savingsGoal.target)}
              </span>
              <span className="font-medium text-foreground">{savingsGoal.percentage}%</span>
            </div>
            <div className="h-4 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${savingsGoal.percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Hinweis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dies sind Dummy-Daten. In einer produktiven Umgebung würden hier echte Finanzdaten aus einer Datenbank
            oder einer Banking-API dargestellt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
