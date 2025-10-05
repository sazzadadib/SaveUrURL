// src/app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { links } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

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

// GET - Fetch all links for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userLinks = await db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(desc(links.createdAt));

    return NextResponse.json(
      { links: userLinks },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST - Create a new link
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
    const { url, title, source, category, tags, description } = body;

    // Validation
    if (!url || !source || !category) {
      return NextResponse.json(
        { error: "URL, source, and category are required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Create the link for the authenticated user
    const newLink = await db
      .insert(links)
      .values({
        userId,
        url,
        title: title || null,
        source,
        category,
        tags: tags || null,
        description: description || null,
      })
      .returning();

    return NextResponse.json(
      { message: "Link created successfully", link: newLink[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a link (only if it belongs to the user)
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get("id");

    if (!linkId) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }

    // Delete only if the link belongs to the authenticated user
    const deletedLink = await db
      .delete(links)
      .where(and(eq(links.id, parseInt(linkId)), eq(links.userId, userId)))
      .returning();

    if (deletedLink.length === 0) {
      return NextResponse.json(
        { error: "Link not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Link deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}

// PUT - Update a link (only if it belongs to the user)
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, url, title, source, category, tags, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }

    // Validate URL format if URL is being updated
    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }

    // Update only if the link belongs to the authenticated user
    const updatedLink = await db
      .update(links)
      .set({
        url: url || undefined,
        title: title || null,
        source: source || undefined,
        category: category || undefined,
        tags: tags || null,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(and(eq(links.id, id), eq(links.userId, userId)))
      .returning();

    if (updatedLink.length === 0) {
      return NextResponse.json(
        { error: "Link not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Link updated successfully", link: updatedLink[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating link:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}