import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Error fetching transaction:", error);
        return NextResponse.json(
            { error: "Failed to fetch transaction" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                ...(body.amount !== undefined && { amount: body.amount }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.type !== undefined && { type: body.type }),
                ...(body.date !== undefined && { date: new Date(body.date) }),
                ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
                ...(body.notes !== undefined && { notes: body.notes }),
                ...(body.isRecurring !== undefined && { isRecurring: body.isRecurring }),
            },
            include: { category: true },
        });
        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Error updating transaction:", error);
        return NextResponse.json(
            { error: "Failed to update transaction" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.transaction.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return NextResponse.json(
            { error: "Failed to delete transaction" },
            { status: 500 }
        );
    }
}
