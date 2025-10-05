// src/app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { links, groups, groupMembers } from "@/db/schema";
import { eq, and, desc, or } from "drizzle-orm";

async function getUserId(): Promise<number | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    const userId = (session.user as any).id;
    return userId ? parseInt(userId) : null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

async function getUserEmail(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.email || null;
  } catch (error) {
    return null;
  }
}

// GET - Fetch all links for the authenticated user (private + groups they're in)
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const userEmail = await getUserEmail();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Get user's private and public links
    const privateLinks = await db
      .select()
      .from(links)
      .where(
        and(
          eq(links.userId, userId),
          or(
            eq(links.visibility, "private"),
            eq(links.visibility, "public")
          )
        )
      )
      .orderBy(desc(links.createdAt));

    // Get groups where user is owner or member
    const ownedGroups = await db
      .select()
      .from(groups)
      .where(eq(groups.ownerId, userId));

    const memberGroups = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.email, userEmail));

    const allGroupIds = [
      ...ownedGroups.map(g => g.id),
      ...memberGroups.map(m => m.groupId)
    ];

    // Get links from groups
    let groupLinks: any[] = [];
    if (allGroupIds.length > 0) {
      for (const groupId of allGroupIds) {
        const linksInGroup = await db
          .select()
          .from(links)
          .where(
            and(
              eq(links.visibility, "group"),
              eq(links.groupId, groupId)
            )
          )
          .orderBy(desc(links.createdAt));
        
        groupLinks = [...groupLinks, ...linksInGroup];
      }
    }

    const allLinks = [...privateLinks, ...groupLinks];

    return NextResponse.json(
      { links: allLinks },
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
    const userEmail = await getUserEmail();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, title, source, category, tags, description, visibility, groupId } = body;

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

    // Validate visibility
    const validVisibilities = ["private", "public", "group"];
    const finalVisibility = visibility && validVisibilities.includes(visibility) 
      ? visibility 
      : "private";

    // If group visibility, validate group access
    let finalGroupId = null;
    if (finalVisibility === "group") {
      if (!groupId) {
        return NextResponse.json(
          { error: "Group ID is required for group visibility" },
          { status: 400 }
        );
      }

      // Check if user is owner or member of the group
      const group = await db
        .select()
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

      if (group.length === 0) {
        return NextResponse.json(
          { error: "Group not found" },
          { status: 404 }
        );
      }

      const isOwner = group[0].ownerId === userId;
      
      if (!isOwner) {
        const membership = await db
          .select()
          .from(groupMembers)
          .where(
            and(
              eq(groupMembers.groupId, groupId),
              eq(groupMembers.email, userEmail)
            )
          )
          .limit(1);

        if (membership.length === 0) {
          return NextResponse.json(
            { error: "You don't have access to this group" },
            { status: 403 }
          );
        }
      }

      finalGroupId = groupId;
    }

    // Create the link
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
        visibility: finalVisibility,
        groupId: finalGroupId,
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
    const userEmail = await getUserEmail();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, url, title, source, category, tags, description, visibility, groupId } = body;

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

    // Handle visibility and group changes
    let finalGroupId: number | null | undefined = undefined;
    if (visibility === "group" && groupId) {
      // Verify group access
      const group = await db
        .select()
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

      if (group.length === 0) {
        return NextResponse.json(
          { error: "Group not found" },
          { status: 404 }
        );
      }

      const isOwner = group[0].ownerId === userId;
      
      if (!isOwner) {
        const membership = await db
          .select()
          .from(groupMembers)
          .where(
            and(
              eq(groupMembers.groupId, groupId),
              eq(groupMembers.email, userEmail)
            )
          )
          .limit(1);

        if (membership.length === 0) {
          return NextResponse.json(
            { error: "You don't have access to this group" },
            { status: 403 }
          );
        }
      }

      finalGroupId = groupId;
    } else if (visibility !== "group") {
      finalGroupId = null;
    }

    // Update only if the link belongs to the authenticated user
    const updatedLink = await db
      .update(links)
      .set({
        url: url || undefined,
        title: title !== undefined ? title : undefined,
        source: source || undefined,
        category: category || undefined,
        tags: tags !== undefined ? tags : undefined,
        description: description !== undefined ? description : undefined,
        visibility: visibility || undefined,
        groupId: finalGroupId !== undefined ? finalGroupId : undefined,
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