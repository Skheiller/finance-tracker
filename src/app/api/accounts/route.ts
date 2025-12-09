import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all accounts
export async function GET() {
    try {
        const accounts = await prisma.account.findMany({
            orderBy: { createdAt: "asc" },
            include: {
                _count: {
                    select: { transactions: true },
                },
            },
        });

        return NextResponse.json(accounts);
    } catch (error) {
        console.error("Error fetching accounts:", error);
        return NextResponse.json(
            { error: "Failed to fetch accounts" },
            { status: 500 }
        );
    }
}

// POST create new account
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, balance, color, icon, isDefault } = body;

        const account = await prisma.account.create({
            data: {
                name,
                type: type || "custom",
                balance: balance || 0,
                color: color || "#71717a",
                icon: icon || "wallet",
                isDefault: isDefault || false,
            },
        });

        return NextResponse.json(account, { status: 201 });
    } catch (error) {
        console.error("Error creating account:", error);
        return NextResponse.json(
            { error: "Failed to create account" },
            { status: 500 }
        );
    }
}
