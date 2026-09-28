import { PrismaClient } from "@prisma/client";

// Single shared instance — never `new PrismaClient()` inside a request handler.
export const prisma = new PrismaClient();
