import { prisma } from "@/lib/prisma";
import { AccountsClient } from "@/components/accounts";

export const dynamic = "force-dynamic";

async function getAccountsData() {
    const accounts = await prisma.account.findMany({
        orderBy: { createdAt: "asc" },
        include: {
            transactions: {
                orderBy: { date: "desc" },
                take: 5,
            },
        },
    });

    const serializedAccounts = accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        color: acc.color,
        icon: acc.icon,
        balance: acc.balance,
        isDefault: acc.isDefault,
        recentTransactions: acc.transactions.map(t => ({
            id: t.id,
            amount: t.amount,
            description: t.description,
            date: t.date.toISOString(),
            type: t.type,
        })),
    }));

    return { accounts: serializedAccounts };
}

export default async function AccountsPage() {
    const data = await getAccountsData();

    return <AccountsClient data={data} />;
}
