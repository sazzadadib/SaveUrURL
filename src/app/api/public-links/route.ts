// src/app/api/public-links/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { links, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET - Fetch all public links (no authentication required)
export async function GET(request: NextRequest) {
  try {
    const publicLinks = await db
      .select({
        link: links,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(links)
      .innerJoin(users, eq(links.userId, users.id))
      .where(eq(links.visibility, "public"))
      .orderBy(desc(links.createdAt));

    const formattedLinks = publicLinks.map(item => ({
      ...item.link,
      userName: item.user.name,
      userEmail: item.user.email,
    }));

    return NextResponse.json(
      { links: formattedLinks },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching public links:", error);
    return NextResponse.json(
      { error: "Failed to fetch public links" },
      { status: 500 }
    );
  }
}