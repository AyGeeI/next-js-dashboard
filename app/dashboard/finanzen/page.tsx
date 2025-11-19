"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardMetric } from "@/components/widgets/card-metric";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mockFinanceData } from "@/lib/mocks";
import { Wallet, TrendingUp, TrendingDown, Target, ChevronLeft } from "lucide-react";

const currency = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export default function FinanzenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { balance, income, expenses, transactions, savingsGoal } = mockFinanceData;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-10">
      {/* Breadcrumbs */}
      <div className="hidden sm:block">
        <Breadcrumbs />
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between motion-safe:animate-in motion-safe:fade-in-50">
        <div className="space-y-2">
          {/* Mobile Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2 sm:hidden"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Zurück
          </Button>
          <h1 className="text-2xl font-semibold">Finanzen</h1>
          <p className="text-sm text-muted-foreground">
            Ihre finanzielle Übersicht und Transaktionen (Dummy-Daten)
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric
          title="Kontostand"
          value={currency.format(balance)}
          icon={Wallet}
          description="Aktueller Kontostand"
          valueClassName={balance >= 0 ? "text-emerald-600" : "text-red-600"}
          loading={loading}
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
          loading={loading}
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
          loading={loading}
        />
        <CardMetric
          title="Sparziel"
          value={`${savingsGoal.percentage}%`}
          icon={Target}
          description={`${currency.format(savingsGoal.current)} / ${currency.format(savingsGoal.target)}`}
          loading={loading}
        />
      </div>

      {/* Transactions */}
      <Card className="rounded-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Letzte Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
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
          ) : (
            <div className="rounded-md border border-dashed p-8 text-center">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                Keine Transaktionen vorhanden
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Transaktionen werden hier angezeigt, sobald sie verfügbar sind.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Savings Goal */}
      <Card className="rounded-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sparziel-Fortschritt</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
          ) : (
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
          )}
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
