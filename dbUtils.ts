import { createClient as createLibsqlClient } from "@libsql/client";
import { createClient as createTursoClient } from "@tursodatabase/api";
import md5 from "md5";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./db/schema";

const turso = createTursoClient({
    token: process.env.TURSO_API_TOKEN!,
    org: process.env.TURSO_ORG!,
});

export async function checkDatabaseExists(userId: string): Promise<boolean> {
    const dbName = await getDatabaseName(userId);

    if (!dbName) return false;

    try {
        await turso.databases.get(dbName);
        return true;
    } catch (error) {
        console.error("Error checking database existence:", error);
        return false;
    }
}

export async function getDatabaseClient(userId: string) {
    const url = await getLibsqlUrl(userId);

    if (!url) {
        console.error("Failed to create database client: URL is null.");
        return null;
    }

    try {
        const client = createLibsqlClient({
            url,
            authToken: process.env.TURSO_GROUP_AUTH_TOKEN,
        });

        return drizzle(client, { schema });
    } catch (error) {
        console.error("Failed to create database client:", error);
        return null;
    }
}

export async function getDatabaseName(userId: string): Promise<string | null> {
    return userId ? md5(userId) : null;
}

function getDatabaseUrl(dbName: string | null): string | null {
    return dbName ? `${dbName}-${process.env.TURSO_ORG}.turso.io` : null;
}

async function getLibsqlUrl(userId: string): Promise<string | null> {
    const dbName = await getDatabaseName(userId);
    const url = getDatabaseUrl(dbName);
    console.log({ url });
    return url ? `libsql://${url}` : null;
}

export async function getDumpUrl(userId: string): Promise<string | null> {
    const dbName = await getDatabaseName(userId);
    const url = getDatabaseUrl(dbName);
    return url ? `https://${url}/dump` : null;
}