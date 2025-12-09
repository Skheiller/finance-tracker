import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "@/components/categories";

export const dynamic = "force-dynamic";

async function getCategoriesData() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            subcategories: {
                orderBy: { name: "asc" },
            },
            _count: {
                select: { transactions: true },
            },
        },
    });

    const serializedCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        budget: cat.budget,
        transactionCount: cat._count.transactions,
        subcategories: cat.subcategories.map(sub => ({
            id: sub.id,
            name: sub.name,
        })),
    }));

    return { categories: serializedCategories };
}

export default async function CategoriesPage() {
    const data = await getCategoriesData();

    return <CategoriesClient data={data} />;
}
