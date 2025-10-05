// src/app/api/sources/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { customSources } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper function to get userId from session
async function getUserId(): Promise<number | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }

    // Get user ID from session (it's stored as string, convert to number)
    const userId = (session.user as any).id;
    return userId ? parseInt(userId) : null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

const DEFAULT_SOURCES = [
  "youtube",
  "facebook",
  "linkedin",
  "twitter",
  "instagram",
  "github",
  "medium",
  "reddit",
  "other",
];

// GET - Fetch all sources (default + custom for this user only)
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Fetch custom sources for THIS USER ONLY
    const userCustomSources = await db
      .select()
      .from(customSources)
      .where(eq(customSources.userId, userId));

    // Combine default and custom sources
    const customSourceNames = userCustomSources.map(src => src.name.toLowerCase());
    const allSources = [...DEFAULT_SOURCES, ...customSourceNames];

    return NextResponse.json(
      { sources: allSources },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch sources" },
      { status: 500 }
    );
  }
}

// POST - Add a new custom source
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: "Source name is required" },
        { status: 400 }
      );
    }

    const sourceName = name.toLowerCase().trim();

    // Check if it's a default source
    if (DEFAULT_SOURCES.includes(sourceName)) {
      return NextResponse.json(
        { message: "Source already exists in defaults" },
        { status: 200 }
      );
    }

    // Check if custom source already exists for THIS USER
    const existing = await db
      .select()
      .from(customSources)
      .where(eq(customSources.userId, userId));

    const alreadyExists = existing.some(src => src.name.toLowerCase() === sourceName);

    if (alreadyExists) {
      return NextResponse.json(
        { message: "Source already exists" },
        { status: 200 }
      );
    }

    // Add new custom source for THIS USER
    const newSource = await db
      .insert(customSources)
      .values({
        userId,
        name: sourceName,
      })
      .returning();

    return NextResponse.json(
      { message: "Source added successfully", source: newSource[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding source:", error);
    return NextResponse.json(
      { error: "Failed to add source" },
      { status: 500 }
    );
  }
}