import { prisma } from "@/lib/prisma";
import { SyncCenterClient } from "@/components/sync-center";

export const dynamic = "force-dynamic";

async function getSyncData() {
    const transactions = await prisma.transaction.findMany({
        orderBy: { date: "desc" },
        include: { category: true },
    });

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    // Serialize transactions for client
    const serializedTransactions = transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        date: t.date.toISOString(),
        type: t.type,
        categoryId: t.categoryId,
        category: t.category
            ? { id: t.category.id, name: t.category.name, color: t.category.color }
            : null,
    }));

    const serializedCategories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
    }));

    return { transactions: serializedTransactions, categories: serializedCategories };
}

export default async function SyncPage() {
    const data = await getSyncData();

    return <SyncCenterClient data={data} />;
}
