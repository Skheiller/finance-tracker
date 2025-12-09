import { prisma } from "@/lib/prisma";
import { BoardRoomClient } from "@/components/board-room";
import { subDays, startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

async function getWeeklyData() {
    const now = new Date();
    const weekStart = startOfDay(subDays(now, 7));

    const transactions = await prisma.transaction.findMany({
        where: {
            date: {
                gte: weekStart,
                lte: endOfDay(now),
            },
        },
        orderBy: { date: "desc" },
        include: { category: true },
    });

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    // Calculate weekly stats
    const weeklyIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const weeklyExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const uncategorizedCount = transactions.filter((t) => !t.categoryId).length;

    // Calculate savings rate
    const savingsRate =
        weeklyIncome > 0
            ? ((weeklyIncome - weeklyExpenses) / weeklyIncome) * 100
            : 0;

    // Spending by category
    const categorySpending = transactions
        .filter((t) => t.type === "expense" && t.category)
        .reduce((acc, t) => {
            const catName = t.category!.name;
            const catColor = t.category!.color;
            if (!acc[catName]) {
                acc[catName] = { total: 0, color: catColor };
            }
            acc[catName].total += t.amount;
            return acc;
        }, {} as Record<string, { total: number; color: string }>);

    // Serialize transactions for client
    const serializedTransactions = transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        date: t.date.toISOString(),
        type: t.type,
        categoryId: t.categoryId,
        category: t.category
            ? { id: t.category.id, name: t.category.name, color: t.category.color, icon: t.category.icon }
            : null,
    }));

    const serializedCategories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
    }));

    return {
        transactions: serializedTransactions,
        categories: serializedCategories,
        stats: {
            weeklyIncome,
            weeklyExpenses,
            savingsRate,
            uncategorizedCount,
            categorySpending,
        },
    };
}

export default async function ReviewPage() {
    const data = await getWeeklyData();

    return <BoardRoomClient data={data} />;
}
