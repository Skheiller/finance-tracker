import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all subcategories
export async function GET() {
    try {
        const subcategories = await prisma.subcategory.findMany({
            orderBy: { name: "asc" },
            include: { category: true },
        });

        return NextResponse.json(subcategories);
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        return NextResponse.json(
            { error: "Failed to fetch subcategories" },
            { status: 500 }
        );
    }
}

// POST create new subcategory
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, categoryId } = body;

        if (!name || !categoryId) {
            return NextResponse.json(
                { error: "Name and categoryId are required" },
                { status: 400 }
            );
        }

        const subcategory = await prisma.subcategory.create({
            data: { name, categoryId },
            include: { category: true },
        });

        return NextResponse.json(subcategory, { status: 201 });
    } catch (error) {
        console.error("Error creating subcategory:", error);
        return NextResponse.json(
            { error: "Failed to create subcategory" },
            { status: 500 }
        );
    }
}
