"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    RadialBarChart,
    RadialBar,
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    PieChartIcon,
    BarChart3,
    Activity,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// MAD currency formatter
const formatMAD = (amount: number) => {
    return `${amount.toLocaleString("fr-MA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} د.م.`;
};

const formatMADShort = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toFixed(0);
};

interface MonthlyData {
    month: string;
    shortMonth: string;
    expenses: number;
    income: number;
    net: number;
    transactionCount: number;
}

interface CategoryBreakdown {
    id: string;
    name: string;
    color: string;
    total: number;
    transactionCount: number;
    percentage: number;
}

interface AccountBreakdown {
    id: string;
    name: string;
    color: string;
    totalSpent: number;
    totalIncome: number;
    transactionCount: number;
}

interface DayOfWeekSpending {
    day: string;
    total: number;
    count: number;
}

interface TopExpense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    categoryColor: string;
}

interface InsightsData {
    monthlyData: MonthlyData[];
    categoryBreakdown: CategoryBreakdown[];
    accountBreakdown: AccountBreakdown[];
    monthlyCategoryData: Record<string, number | string>[];
    dayOfWeekSpending: DayOfWeekSpending[];
    topExpenses: TopExpense[];
    categories: { id: string; name: string; color: string }[];
    stats: {
        totalExpenses: number;
        totalIncome: number;
        netSavings: number;
        avgMonthlyExpense: number;
        avgMonthlyIncome: number;
        transactionCount: number;
        monthOverMonthChange: number;
        currentMonthExpenses: number;
    };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export function InsightsClient({ data }: { data: InsightsData }) {
    const [timeRange, setTimeRange] = useState<"3m" | "6m" | "12m">("6m");

    const filteredMonthlyData = data.monthlyData.slice(
        timeRange === "3m" ? 9 : timeRange === "6m" ? 6 : 0
    );

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
                    <p className="text-sm text-muted-foreground">
                        Visualize and understand your spending patterns
                    </p>
                </div>
                <Select value={timeRange} onValueChange={(v: "3m" | "6m" | "12m") => setTimeRange(v)}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="3m">Last 3 months</SelectItem>
                        <SelectItem value="6m">Last 6 months</SelectItem>
                        <SelectItem value="12m">Last 12 months</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Expenses"
                    value={formatMAD(data.stats.totalExpenses)}
                    subtitle={`${data.stats.transactionCount} transactions`}
                />
                <StatCard
                    title="Total Income"
                    value={formatMAD(data.stats.totalIncome)}
                    subtitle="All time"
                    valueClass="text-emerald-500"
                />
                <StatCard
                    title="Net Savings"
                    value={formatMAD(data.stats.netSavings)}
                    subtitle={data.stats.netSavings >= 0 ? "You're saving!" : "Spending more than earning"}
                    valueClass={data.stats.netSavings >= 0 ? "text-emerald-500" : "text-red-500"}
                />
                <StatCard
                    title="This Month"
                    value={formatMAD(data.stats.currentMonthExpenses)}
                    subtitle={
                        <span className={cn(
                            "flex items-center gap-1",
                            data.stats.monthOverMonthChange > 0 ? "text-red-400" : "text-emerald-400"
                        )}>
                            {data.stats.monthOverMonthChange > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : data.stats.monthOverMonthChange < 0 ? (
                                <TrendingDown className="w-3 h-3" />
                            ) : (
                                <Minus className="w-3 h-3" />
                            )}
                            {Math.abs(data.stats.monthOverMonthChange).toFixed(0)}% vs last month
                        </span>
                    }
                />
            </div>

            {/* Main Charts */}
            <Tabs defaultValue="trends" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="trends" className="gap-2">
                        <Activity className="w-4 h-4 hidden sm:block" />
                        Trends
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="gap-2">
                        <PieChartIcon className="w-4 h-4 hidden sm:block" />
                        Categories
                    </TabsTrigger>
                    <TabsTrigger value="breakdown" className="gap-2">
                        <BarChart3 className="w-4 h-4 hidden sm:block" />
                        Breakdown
                    </TabsTrigger>
                    <TabsTrigger value="patterns" className="gap-2">
                        <Calendar className="w-4 h-4 hidden sm:block" />
                        Patterns
                    </TabsTrigger>
                </TabsList>

                {/* Trends Tab */}
                <TabsContent value="trends" className="space-y-4">
                    {/* 1. Income vs Expenses Over Time */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Income vs Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={filteredMonthlyData}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                        <XAxis dataKey="shortMonth" stroke="#71717a" fontSize={12} />
                                        <YAxis stroke="#71717a" fontSize={12} tickFormatter={formatMADShort} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                            labelStyle={{ color: "#fff" }}
                                            formatter={(value: number) => formatMAD(value)}
                                        />
                                        <Legend />
                                        <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                                        <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Net Savings Trend */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Net Savings Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={filteredMonthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                        <XAxis dataKey="shortMonth" stroke="#71717a" fontSize={12} />
                                        <YAxis stroke="#71717a" fontSize={12} tickFormatter={formatMADShort} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                            formatter={(value: number) => formatMAD(value)}
                                        />
                                        <Bar
                                            dataKey="net"
                                            name="Net"
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {filteredMonthlyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.net >= 0 ? "#10b981" : "#ef4444"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Monthly Expense Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Monthly Expense Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={filteredMonthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                        <XAxis dataKey="shortMonth" stroke="#71717a" fontSize={12} />
                                        <YAxis stroke="#71717a" fontSize={12} tickFormatter={formatMADShort} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                            formatter={(value: number) => formatMAD(value)}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="expenses"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                                            name="Expenses"
                                        />
                                        {/* Average line */}
                                        <Line
                                            type="monotone"
                                            dataKey={() => data.stats.avgMonthlyExpense}
                                            stroke="#71717a"
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="Average"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-muted-foreground text-center mt-2">
                                Average monthly expense: {formatMAD(data.stats.avgMonthlyExpense)}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* 4. Category Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Spending by Category</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {data.categoryBreakdown.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.categoryBreakdown as unknown as Array<Record<string, unknown>>}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="total"
                                                    nameKey="name"
                                                >
                                                    {data.categoryBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                                    formatter={(value: number) => formatMAD(value)}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            No category data yet
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 5. Category Percentages */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Category Breakdown (%)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.categoryBreakdown.length > 0 ? (
                                        data.categoryBreakdown.slice(0, 8).map((cat) => (
                                            <div key={cat.id} className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: cat.color }}
                                                        />
                                                        {cat.name}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {cat.percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${cat.percentage}%`,
                                                            backgroundColor: cat.color,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            No category data yet
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 6. Category Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Category Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                {data.categoryBreakdown.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.categoryBreakdown.slice(0, 8)} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                            <XAxis type="number" stroke="#71717a" fontSize={12} tickFormatter={formatMADShort} />
                                            <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={12} width={100} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                                formatter={(value: number) => formatMAD(value)}
                                            />
                                            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                                                {data.categoryBreakdown.slice(0, 8).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground">
                                        No category data yet
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Breakdown Tab */}
                <TabsContent value="breakdown" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* 7. Account Spending */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Spending by Account</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    {data.accountBreakdown.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data.accountBreakdown}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                                                <YAxis stroke="#71717a" fontSize={12} tickFormatter={formatMADShort} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                                    formatter={(value: number) => formatMAD(value)}
                                                />
                                                <Bar dataKey="totalSpent" name="Spent" radius={[4, 4, 0, 0]}>
                                                    {data.accountBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            No account data yet
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 8. Account Transaction Count */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Transactions per Account</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.accountBreakdown.length > 0 ? (
                                        data.accountBreakdown.map((acc) => (
                                            <div key={acc.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: acc.color }}
                                                    />
                                                    <span className="text-sm">{acc.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{acc.transactionCount} txns</p>
                                                    <p className="text-xs text-muted-foreground">{formatMAD(acc.totalSpent)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            No account data yet
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 9. Top 10 Expenses */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Top 10 Largest Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.topExpenses.length > 0 ? (
                                <div className="space-y-2">
                                    {data.topExpenses.map((expense, idx) => (
                                        <div
                                            key={expense.id}
                                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground text-sm w-5">#{idx + 1}</span>
                                                <div>
                                                    <p className="text-sm font-medium">{expense.description}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] px-1.5 py-0"
                                                            style={{ borderColor: expense.categoryColor, color: expense.categoryColor }}
                                                        >
                                                            {expense.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="font-medium">{formatMAD(expense.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    No expenses recorded yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Patterns Tab */}
                <TabsContent value="patterns" className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* 10. Day of Week Spending */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Spending by Day of Week</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.dayOfWeekSpending}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                            <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                                            <YAxis stroke="#71717a" fontSize={12} tickFormatter={formatMADShort} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                                formatter={(value: number) => formatMAD(value)}
                                            />
                                            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Spent" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 11. Transaction Count by Day */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Transaction Frequency</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.dayOfWeekSpending}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                            <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                                            <YAxis stroke="#71717a" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                                            />
                                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="# of Transactions" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 12. Monthly Averages */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Monthly Averages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-2xl font-semibold">{formatMAD(data.stats.avgMonthlyExpense)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Avg. Monthly Expense</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-2xl font-semibold text-emerald-500">{formatMAD(data.stats.avgMonthlyIncome)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Avg. Monthly Income</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-2xl font-semibold">
                                        {data.stats.transactionCount > 0
                                            ? (data.stats.totalExpenses / data.stats.transactionCount).toFixed(0)
                                            : 0} د.م.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Avg. Transaction</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-2xl font-semibold">{data.stats.transactionCount}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Total Transactions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 13. Savings Rate Gauge */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Savings Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] flex items-center justify-center">
                                {data.stats.totalIncome > 0 ? (
                                    <div className="text-center">
                                        <div className="relative">
                                            <svg className="w-40 h-40 transform -rotate-90">
                                                <circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    stroke="#27272a"
                                                    strokeWidth="12"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    stroke={data.stats.netSavings >= 0 ? "#10b981" : "#ef4444"}
                                                    strokeWidth="12"
                                                    fill="none"
                                                    strokeDasharray={`${Math.min(Math.abs((data.stats.netSavings / data.stats.totalIncome) * 100), 100) * 4.4} 440`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className={cn(
                                                    "text-3xl font-bold",
                                                    data.stats.netSavings >= 0 ? "text-emerald-500" : "text-red-500"
                                                )}>
                                                    {data.stats.totalIncome > 0
                                                        ? ((data.stats.netSavings / data.stats.totalIncome) * 100).toFixed(0)
                                                        : 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {data.stats.netSavings >= 0 ? "of income saved" : "overspending rate"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        Add income to see savings rate
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    valueClass,
}: {
    title: string;
    value: string;
    subtitle: React.ReactNode;
    valueClass?: string;
}) {
    return (
        <Card>
            <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">{title}</p>
                <p className={cn("text-xl font-semibold mt-1", valueClass)}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </CardContent>
        </Card>
    );
}
