import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardMetric } from "@/components/widgets/card-metric";
import { mockFinanceData } from "@/lib/mocks";
import { Wallet, TrendingUp, TrendingDown, Target } from "lucide-react";

export default function FinanzenPage() {
  const { balance, income, expenses, transactions, savingsGoal } = mockFinanceData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Finanzen</h2>
        <p className="text-muted-foreground">
          Ihre finanzielle Übersicht und Transaktionen (Dummy-Daten)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Kontostand"
          value={`${balance.toFixed(2)} €`}
          icon={Wallet}
          description="Aktueller Kontostand"
        />
        <CardMetric
          title="Einnahmen"
          value={`${income.toFixed(2)} €`}
          icon={TrendingUp}
          description="Diesen Monat"
        />
        <CardMetric
          title="Ausgaben"
          value={`${expenses.toFixed(2)} €`}
          icon={TrendingDown}
          description="Diesen Monat"
        />
        <CardMetric
          title="Sparziel"
          value={`${savingsGoal.percentage}%`}
          icon={Target}
          description={`${savingsGoal.current} / ${savingsGoal.target} €`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Letzte Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <p
                  className={`text-lg font-bold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sparziel-Fortschritt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {savingsGoal.current.toFixed(2)} € von {savingsGoal.target.toFixed(2)} €
              </span>
              <span className="font-medium">{savingsGoal.percentage}%</span>
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
            Dies sind Dummy-Daten. In einer produktiven Umgebung würden hier echte
            Finanzdaten aus einer Datenbank oder Banking-API angezeigt werden.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
