// src/app/api/groups/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { groups, groupMembers, users } from "@/db/schema";
import { eq, or, desc, and } from "drizzle-orm";

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
    console.error("Error getting user email:", error);
    return null;
  }
}

// GET - Fetch all groups where user is owner or member
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

    // Get groups where user is owner
    const ownedGroups = await db
      .select()
      .from(groups)
      .where(eq(groups.ownerId, userId))
      .orderBy(desc(groups.createdAt));

    // Get groups where user is a member
    const membershipGroups = await db
      .select({
        group: groups,
        membership: groupMembers,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.email, userEmail))
      .orderBy(desc(groups.createdAt));

    // Get member count for each group
    const allGroups = [
      ...ownedGroups.map(g => ({ ...g, isOwner: true })),
      ...membershipGroups.map(mg => ({ ...mg.group, isOwner: false }))
    ];

    // Get members for each group
    const groupsWithMembers = await Promise.all(
      allGroups.map(async (group) => {
        const members = await db
          .select()
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));
        
        return {
          ...group,
          memberCount: members.length + 1, // +1 for owner
          members: members,
        };
      })
    );

    return NextResponse.json(
      { groups: groupsWithMembers },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// POST - Create a new group
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    const newGroup = await db
      .insert(groups)
      .values({
        name,
        description: description || null,
        ownerId: userId,
      })
      .returning();

    return NextResponse.json(
      { message: "Group created successfully", group: newGroup[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a group (only owner)
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
    const groupId = searchParams.get("id");

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const deletedGroup = await db
      .delete(groups)
      .where(and(eq(groups.id, parseInt(groupId)), eq(groups.ownerId, userId)))
      .returning();

    if (deletedGroup.length === 0) {
      return NextResponse.json(
        { error: "Group not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Group deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}

// PUT - Update group
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
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const updatedGroup = await db
      .update(groups)
      .set({
        name: name || undefined,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(and(eq(groups.id, id), eq(groups.ownerId, userId)))
      .returning();

    if (updatedGroup.length === 0) {
      return NextResponse.json(
        { error: "Group not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Group updated successfully", group: updatedGroup[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}