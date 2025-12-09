import { prisma } from "@/lib/prisma";
import { InsightsClient } from "@/components/insights";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export const dynamic = "force-dynamic";

async function getInsightsData() {
    const now = new Date();

    // Get all transactions
    const allTransactions = await prisma.transaction.findMany({
        orderBy: { date: "desc" },
        include: {
            category: true,
            subcategory: true,
            account: true,
        },
    });

    // Get categories and accounts
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    const accounts = await prisma.account.findMany({
        orderBy: { name: "asc" },
    });

    // Calculate monthly data for the last 12 months
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));

        const monthTransactions = allTransactions.filter(t => {
            const date = new Date(t.date);
            return date >= monthStart && date <= monthEnd;
        });

        const expenses = monthTransactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const income = monthTransactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        monthlyData.push({
            month: format(monthStart, "MMM yyyy"),
            shortMonth: format(monthStart, "MMM"),
            expenses,
            income,
            net: income - expenses,
            transactionCount: monthTransactions.length,
        });
    }

    // Category breakdown (all time)
    const categoryBreakdown = categories.map(cat => {
        const catTransactions = allTransactions.filter(
            t => t.categoryId === cat.id && t.type === "expense"
        );
        const total = catTransactions.reduce((sum, t) => sum + t.amount, 0);
        return {
            id: cat.id,
            name: cat.name,
            color: cat.color,
            total,
            transactionCount: catTransactions.length,
        };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    // Calculate percentage for categories
    const totalCategorySpending = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
    const categoryWithPercentage = categoryBreakdown.map(c => ({
        ...c,
        percentage: totalCategorySpending > 0 ? (c.total / totalCategorySpending) * 100 : 0,
    }));

    // Account breakdown
    const accountBreakdown = accounts.map(acc => {
        const accTransactions = allTransactions.filter(t => t.accountId === acc.id);
        const totalSpent = accTransactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = accTransactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            id: acc.id,
            name: acc.name,
            color: acc.color,
            totalSpent,
            totalIncome,
            transactionCount: accTransactions.length,
        };
    }).filter(a => a.transactionCount > 0);

    // Monthly category breakdown (for stacked chart)
    const monthlyCategoryData = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));

        const monthData: Record<string, number | string> = {
            month: format(monthStart, "MMM"),
        };

        categories.forEach(cat => {
            const catTransactions = allTransactions.filter(t => {
                const date = new Date(t.date);
                return date >= monthStart && date <= monthEnd &&
                    t.categoryId === cat.id && t.type === "expense";
            });
            monthData[cat.name] = catTransactions.reduce((sum, t) => sum + t.amount, 0);
        });

        monthlyCategoryData.push(monthData);
    }

    // Day of week analysis
    const dayOfWeekSpending = [0, 1, 2, 3, 4, 5, 6].map(day => {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayTransactions = allTransactions.filter(t => {
            const date = new Date(t.date);
            return date.getDay() === day && t.type === "expense";
        });
        return {
            day: dayNames[day],
            total: dayTransactions.reduce((sum, t) => sum + t.amount, 0),
            count: dayTransactions.length,
        };
    });

    // Top expenses
    const topExpenses = allTransactions
        .filter(t => t.type === "expense")
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10)
        .map(t => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
            date: t.date.toISOString(),
            category: t.category?.name || "Uncategorized",
            categoryColor: t.category?.color || "#71717a",
        }));

    // Overall stats
    const totalExpenses = allTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = allTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const avgMonthlyExpense = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / 12;
    const avgMonthlyIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / 12;

    // Current month vs last month
    const currentMonthExpenses = monthlyData[11]?.expenses || 0;
    const lastMonthExpenses = monthlyData[10]?.expenses || 0;
    const monthOverMonthChange = lastMonthExpenses > 0
        ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : 0;

    return {
        monthlyData,
        categoryBreakdown: categoryWithPercentage,
        accountBreakdown,
        monthlyCategoryData,
        dayOfWeekSpending,
        topExpenses,
        categories: categories.map(c => ({ id: c.id, name: c.name, color: c.color })),
        stats: {
            totalExpenses,
            totalIncome,
            netSavings: totalIncome - totalExpenses,
            avgMonthlyExpense,
            avgMonthlyIncome,
            transactionCount: allTransactions.length,
            monthOverMonthChange,
            currentMonthExpenses,
        },
    };
}

export default async function InsightsPage() {
    const data = await getInsightsData();

    return <InsightsClient data={data} />;
}
