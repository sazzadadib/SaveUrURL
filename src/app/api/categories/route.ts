// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper function to get userId from session/auth
async function getUserId(request: NextRequest): Promise<number | null> {
  // TODO: Implement proper authentication
  return 1;
}

const DEFAULT_CATEGORIES = [
  "education",
  "music",
  "movies",
  "documents",
  "tech",
  "news",
  "social",
  "other",
];

// GET - Fetch all categories (default + custom)
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch custom categories for this user
    const userCustomCategories = await db
      .select()
      .from(customCategories)
      .where(eq(customCategories.userId, userId));

    // Combine default and custom categories
    const customCategoryNames = userCustomCategories.map(cat => cat.name.toLowerCase());
    const allCategories = [...DEFAULT_CATEGORIES, ...customCategoryNames];

    return NextResponse.json(
      { categories: allCategories },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - Add a new custom category
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const categoryName = name.toLowerCase().trim();

    // Check if it's a default category
    if (DEFAULT_CATEGORIES.includes(categoryName)) {
      return NextResponse.json(
        { message: "Category already exists in defaults" },
        { status: 200 }
      );
    }

    // Check if custom category already exists for this user
    const existing = await db
      .select()
      .from(customCategories)
      .where(eq(customCategories.userId, userId));

    const alreadyExists = existing.some(cat => cat.name.toLowerCase() === categoryName);

    if (alreadyExists) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 200 }
      );
    }

    // Add new custom category
    const newCategory = await db
      .insert(customCategories)
      .values({
        userId,
        name: categoryName,
      })
      .returning();

    return NextResponse.json(
      { message: "Category added successfully", category: newCategory[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json(
      { error: "Failed to add category" },
      { status: 500 }
    );
  }
}