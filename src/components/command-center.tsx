"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    TrendingDown,
    Flame,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { QuickAddSheet } from "@/components/quick-add-sheet";
import Link from "next/link";

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: string;
    category: { id: string; name: string; color: string; icon: string } | null;
}

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
}

interface ChartDataPoint {
    date: string;
    income: number;
    expense: number;
}

interface Stats {
    netWorth: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    chartData: ChartDataPoint[];
    recentTransactions: Transaction[];
    categories: Category[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export function CommandCenterClient({ stats }: { stats: Stats }) {
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const savingsRate = stats.monthlyIncome > 0
        ? ((stats.monthlyIncome - stats.monthlyExpenses) / stats.monthlyIncome) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
                    <p className="text-muted-foreground">
                        Your financial overview for {format(new Date(), "MMMM yyyy")}
                    </p>
                </div>
                <Button
                    onClick={() => setIsQuickAddOpen(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/25"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Quick Add
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Net Worth Card */}
                <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Net This Month
                        </CardTitle>
                        {stats.netWorth >= 0 ? (
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-3xl font-bold ${stats.netWorth >= 0 ? "text-emerald-400" : "text-red-400"
                                }`}
                        >
                            {stats.netWorth >= 0 ? "+" : ""}
                            {formatCurrency(stats.netWorth)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {savingsRate > 0 ? `${savingsRate.toFixed(0)}% savings rate` : "Spending exceeds income"}
                        </p>
                    </CardContent>
                </Card>

                {/* Income Card */}
                <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Monthly Income
                        </CardTitle>
                        <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-400">
                            {formatCurrency(stats.monthlyIncome)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All income sources
                        </p>
                    </CardContent>
                </Card>

                {/* Monthly Burn Card */}
                <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Monthly Burn
                        </CardTitle>
                        <Flame className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-400">
                            {formatCurrency(stats.monthlyExpenses)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total expenses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                            30-Day Trend
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(parseISO(date), "MMM d")}
                                    stroke="#71717a"
                                    fontSize={12}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#18181b",
                                        border: "1px solid #27272a",
                                        borderRadius: "8px",
                                    }}
                                    labelFormatter={(date) => format(parseISO(date as string), "MMM d, yyyy")}
                                    formatter={(value: number, name: string) => [
                                        formatCurrency(value),
                                        name === "income" ? "Income" : "Expenses",
                                    ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#incomeGradient)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#expenseGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Transactions</CardTitle>
                    <Link href="/journal">
                        <Button variant="ghost" size="sm">
                            View All
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.recentTransactions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No transactions yet. Click &quot;Quick Add&quot; to get started!
                            </p>
                        ) : (
                            stats.recentTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "income"
                                                    ? "bg-emerald-500/20 text-emerald-500"
                                                    : "bg-red-500/20 text-red-500"
                                                }`}
                                        >
                                            {transaction.type === "income" ? (
                                                <ArrowUpRight className="w-5 h-5" />
                                            ) : (
                                                <ArrowDownRight className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(transaction.date), "MMM d, h:mm a")}
                                                </span>
                                                {transaction.category && (
                                                    <Badge
                                                        variant="secondary"
                                                        style={{ backgroundColor: `${transaction.category.color}20`, color: transaction.category.color }}
                                                    >
                                                        {transaction.category.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={`font-semibold ${transaction.type === "income"
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                            }`}
                                    >
                                        {transaction.type === "income" ? "+" : "-"}
                                        {formatCurrency(transaction.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Add Sheet */}
            <QuickAddSheet
                open={isQuickAddOpen}
                onOpenChange={setIsQuickAddOpen}
                categories={stats.categories}
            />

            {/* Mobile FAB */}
            <button
                onClick={() => setIsQuickAddOpen(true)}
                className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 flex items-center justify-center hover:scale-105 transition-transform"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
    );
}
