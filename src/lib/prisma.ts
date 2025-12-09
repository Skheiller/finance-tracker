import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.POSTGRES_URL;

    if (!connectionString) {
        // Return a client that will fail at runtime if database is accessed
        // This allows the build to complete on Vercel where env vars are set at runtime
        console.warn("POSTGRES_URL not set - database operations will fail");
        // Create a dummy pool that will fail when used
        const pool = new Pool({ connectionString: "postgresql://dummy:dummy@localhost:5432/dummy" });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter });
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
}

// Lazy initialization - only create client when first accessed
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
