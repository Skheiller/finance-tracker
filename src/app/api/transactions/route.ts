import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all transactions
export async function GET() {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: { date: "desc" },
            include: {
                category: true,
                subcategory: true,
                account: true,
            },
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}

// POST create new transaction
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, description, type, categoryId, subcategoryId, accountId, date, notes } = body;

        const transaction = await prisma.transaction.create({
            data: {
                amount,
                description,
                type: type || "expense",
                categoryId: categoryId || null,
                subcategoryId: subcategoryId || null,
                accountId: accountId || null,
                date: date ? new Date(date) : new Date(),
                notes: notes || null,
            },
            include: {
                category: true,
                subcategory: true,
                account: true,
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}
