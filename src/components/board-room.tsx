"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    TrendingDown,
    Flame,
    CheckCircle2,
    AlertCircle,
    Trophy,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: string;
    categoryId: string | null;
    category: { id: string; name: string; color: string; icon: string } | null;
}

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
}

interface WeeklyStats {
    weeklyIncome: number;
    weeklyExpenses: number;
    savingsRate: number;
    uncategorizedCount: number;
    categorySpending: Record<string, { total: number; color: string }>;
}

interface BoardRoomData {
    transactions: Transaction[];
    categories: Category[];
    stats: WeeklyStats;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

function getSavingsGrade(rate: number): { grade: string; color: string; message: string } {
    if (rate >= 50) return { grade: "A+", color: "text-emerald-400", message: "Exceptional! You're saving like a titan." };
    if (rate >= 30) return { grade: "A", color: "text-emerald-400", message: "Excellent savings rate!" };
    if (rate >= 20) return { grade: "B", color: "text-amber-400", message: "Good job! Room for improvement." };
    if (rate >= 10) return { grade: "C", color: "text-orange-400", message: "Consider reducing expenses." };
    if (rate >= 0) return { grade: "D", color: "text-red-400", message: "Your expenses match your income." };
    return { grade: "F", color: "text-red-500", message: "Spending exceeds income. Time to act." };
}

export function BoardRoomClient({ data }: { data: BoardRoomData }) {
    const router = useRouter();
    const [assigningCategory, setAssigningCategory] = useState<string | null>(null);

    const uncategorizedTransactions = data.transactions.filter(
        (t) => !t.categoryId && t.type === "expense"
    );

    const savingsGrade = getSavingsGrade(data.stats.savingsRate);

    const handleCategoryAssign = async (transactionId: string, categoryId: string) => {
        setAssigningCategory(transactionId);
        try {
            const response = await fetch(`/api/transactions/${transactionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId }),
            });
            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Error assigning category:", error);
        } finally {
            setAssigningCategory(null);
        }
    };

    // Sort category spending
    const sortedCategorySpending = Object.entries(data.stats.categorySpending)
        .sort(([, a], [, b]) => b.total - a.total);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">The Board Room</h1>
                <p className="text-muted-foreground">
                    Your weekly financial review • Last 7 days
                </p>
            </div>

            {/* Weekly Score Card */}
            <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Weekly Savings Score
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className={`text-6xl font-black ${savingsGrade.color}`}>
                                {savingsGrade.grade}
                            </div>
                            <p className="text-muted-foreground mt-1">{savingsGrade.message}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">
                                {data.stats.savingsRate.toFixed(0)}%
                            </div>
                            <p className="text-sm text-muted-foreground">Savings Rate</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-emerald-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Weekly Income
                        </CardTitle>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">
                            {formatCurrency(data.stats.weeklyIncome)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Weekly Expenses
                        </CardTitle>
                        <Flame className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-400">
                            {formatCurrency(data.stats.weeklyExpenses)}
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    data.stats.uncategorizedCount > 0
                        ? "border-orange-500/20"
                        : "border-emerald-500/20"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Uncategorized
                        </CardTitle>
                        {data.stats.uncategorizedCount > 0 ? (
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-2xl font-bold",
                            data.stats.uncategorizedCount > 0 ? "text-orange-400" : "text-emerald-400"
                        )}>
                            {data.stats.uncategorizedCount}
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                                transactions
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Breakdown */}
            {sortedCategorySpending.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sortedCategorySpending.map(([name, { total, color }]) => {
                            const percentage = (total / data.stats.weeklyExpenses) * 100;
                            return (
                                <div key={name} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{name}</span>
                                        <span className="text-muted-foreground">
                                            {formatCurrency(total)} ({percentage.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-accent rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {/* Uncategorized Transactions */}
            {uncategorizedTransactions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            Categorize These Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {uncategorizedTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="p-4 rounded-lg bg-accent/50 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{transaction.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(transaction.date), "MMM d, h:mm a")}
                                        </p>
                                    </div>
                                    <span className="font-semibold text-red-400">
                                        -{formatCurrency(transaction.amount)}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {data.categories
                                        .filter((c) => c.name !== "Salary" && c.name !== "Investments")
                                        .map((category) => (
                                            <Button
                                                key={category.id}
                                                variant="outline"
                                                size="sm"
                                                disabled={assigningCategory === transaction.id}
                                                onClick={() => handleCategoryAssign(transaction.id, category.id)}
                                                className="transition-all hover:scale-105"
                                                style={{
                                                    borderColor: category.color,
                                                    color: category.color,
                                                }}
                                            >
                                                {assigningCategory === transaction.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                ) : null}
                                                {category.name}
                                            </Button>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* All Clear Message */}
            {uncategorizedTransactions.length === 0 && (
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="py-8 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-emerald-400">All Clear!</h3>
                        <p className="text-muted-foreground">
                            All your transactions are categorized. Great job staying organized!
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
