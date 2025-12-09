import { prisma } from "@/lib/prisma";
import { JournalClient } from "@/components/journal";

export const dynamic = "force-dynamic";

async function getJournalData() {
    const transactions = await prisma.transaction.findMany({
        orderBy: { date: "desc" },
        include: {
            category: true,
            subcategory: true,
            account: true,
        },
    });

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { subcategories: true },
    });

    const accounts = await prisma.account.findMany({
        orderBy: { name: "asc" },
    });

    // Serialize for client
    const serializedTransactions = transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        date: t.date.toISOString(),
        type: t.type,
        notes: t.notes,
        category: t.category
            ? { id: t.category.id, name: t.category.name, color: t.category.color }
            : null,
        subcategory: t.subcategory
            ? { id: t.subcategory.id, name: t.subcategory.name }
            : null,
        account: t.account
            ? { id: t.account.id, name: t.account.name, color: t.account.color }
            : null,
    }));

    const serializedCategories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        subcategories: c.subcategories.map(s => ({ id: s.id, name: s.name })),
    }));

    const serializedAccounts = accounts.map((a) => ({
        id: a.id,
        name: a.name,
        color: a.color,
    }));

    return {
        transactions: serializedTransactions,
        categories: serializedCategories,
        accounts: serializedAccounts,
    };
}

export default async function JournalPage() {
    const data = await getJournalData();

    return <JournalClient data={data} />;
}
