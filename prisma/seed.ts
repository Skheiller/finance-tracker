import "dotenv/config";

// Import from generated prisma client
import { PrismaClient, Category } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
    { name: "Groceries", color: "#22c55e", icon: "shopping-cart" },
    { name: "Dining", color: "#f97316", icon: "utensils" },
    { name: "Transport", color: "#3b82f6", icon: "car" },
    { name: "Entertainment", color: "#a855f7", icon: "gamepad-2" },
    { name: "Utilities", color: "#eab308", icon: "zap" },
    { name: "Healthcare", color: "#ef4444", icon: "heart-pulse" },
    { name: "Shopping", color: "#ec4899", icon: "shopping-bag" },
    { name: "Subscriptions", color: "#06b6d4", icon: "repeat" },
    { name: "Salary", color: "#10b981", icon: "banknote" },
    { name: "Investments", color: "#6366f1", icon: "trending-up" },
];

const sampleTransactions = [
    { amount: 5000, description: "Monthly Salary", type: "income", daysAgo: 0 },
    { amount: 150, description: "Weekly Groceries", type: "expense", daysAgo: 1 },
    { amount: 45, description: "Uber Ride", type: "expense", daysAgo: 2 },
    { amount: 85, description: "Restaurant Dinner", type: "expense", daysAgo: 3 },
    { amount: 200, description: "Electric Bill", type: "expense", daysAgo: 4 },
    { amount: 15, description: "Netflix Subscription", type: "expense", daysAgo: 5 },
    { amount: 120, description: "New Shoes", type: "expense", daysAgo: 6 },
    { amount: 35, description: "Coffee & Snacks", type: "expense", daysAgo: 7 },
    { amount: 500, description: "Freelance Payment", type: "income", daysAgo: 8 },
    { amount: 75, description: "Gas Station", type: "expense", daysAgo: 9 },
    { amount: 250, description: "Concert Tickets", type: "expense", daysAgo: 10 },
    { amount: 90, description: "Pharmacy", type: "expense", daysAgo: 12 },
    { amount: 65, description: "Lunch with Clients", type: "expense", daysAgo: 14 },
    { amount: 180, description: "Grocery Run", type: "expense", daysAgo: 16 },
    { amount: 1000, description: "Stock Dividends", type: "income", daysAgo: 20 },
    { amount: 40, description: "Book Purchase", type: "expense", daysAgo: 22 },
    { amount: 300, description: "Internet Bill", type: "expense", daysAgo: 25 },
    { amount: 55, description: "Spotify Premium", type: "expense", daysAgo: 28 },
];

async function main() {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();

    // Create categories
    const categories = await Promise.all(
        defaultCategories.map((cat) =>
            prisma.category.create({
                data: cat,
            })
        )
    );

    console.log(`✅ Created ${categories.length} categories`);

    // Helper function to find category
    const findCategory = (name: string): string | undefined =>
        categories.find((c: Category) => c.name === name)?.id;

    // Create transactions with category assignments
    const categoryMap: Record<string, string | undefined> = {
        "Weekly Groceries": findCategory("Groceries"),
        "Grocery Run": findCategory("Groceries"),
        "Coffee & Snacks": findCategory("Dining"),
        "Restaurant Dinner": findCategory("Dining"),
        "Lunch with Clients": findCategory("Dining"),
        "Uber Ride": findCategory("Transport"),
        "Gas Station": findCategory("Transport"),
        "Concert Tickets": findCategory("Entertainment"),
        "Electric Bill": findCategory("Utilities"),
        "Internet Bill": findCategory("Utilities"),
        Pharmacy: findCategory("Healthcare"),
        "New Shoes": findCategory("Shopping"),
        "Book Purchase": findCategory("Shopping"),
        "Netflix Subscription": findCategory("Subscriptions"),
        "Spotify Premium": findCategory("Subscriptions"),
        "Monthly Salary": findCategory("Salary"),
        "Freelance Payment": findCategory("Salary"),
        "Stock Dividends": findCategory("Investments"),
    };

    const now = new Date();
    const transactions = await Promise.all(
        sampleTransactions.map((t) => {
            const date = new Date(now);
            date.setDate(date.getDate() - t.daysAgo);
            return prisma.transaction.create({
                data: {
                    amount: t.amount,
                    description: t.description,
                    type: t.type,
                    date: date,
                    categoryId: categoryMap[t.description] || null,
                },
            });
        })
    );

    console.log(`✅ Created ${transactions.length} transactions`);
    console.log("🎉 Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
