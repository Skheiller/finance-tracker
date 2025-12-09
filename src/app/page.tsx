import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  // Get all accounts with transaction totals
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Get all transactions for totals
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
    include: {
      category: true,
      subcategory: true,
      account: true,
    },
  });

  // Get categories with subcategories
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { subcategories: true },
  });

  // Calculate totals per account
  const accountsWithTotals = accounts.map(account => {
    const accountTransactions = transactions.filter(t => t.accountId === account.id);
    const totalSpent = accountTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = accountTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      color: account.color,
      icon: account.icon,
      balance: account.balance,
      totalSpent,
      totalIncome,
      transactionCount: accountTransactions.length,
    };
  });

  // Overall totals
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  // Recent transactions (last 10)
  const recentTransactions = transactions.slice(0, 10).map(t => ({
    id: t.id,
    amount: t.amount,
    description: t.description,
    date: t.date.toISOString(),
    type: t.type,
    category: t.category ? { id: t.category.id, name: t.category.name, color: t.category.color } : null,
    subcategory: t.subcategory ? { id: t.subcategory.id, name: t.subcategory.name } : null,
    account: t.account ? { id: t.account.id, name: t.account.name, color: t.account.color } : null,
  }));

  // Serialize categories
  const serializedCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
    color: c.color,
    subcategories: c.subcategories.map(s => ({ id: s.id, name: s.name })),
  }));

  return {
    accounts: accountsWithTotals,
    totalExpenses,
    totalIncome,
    recentTransactions,
    categories: serializedCategories,
  };
}

export default async function HomePage() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}
