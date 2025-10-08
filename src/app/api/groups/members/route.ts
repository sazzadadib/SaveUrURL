// src/app/api/groups/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { groups, groupMembers, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

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

// GET - Get all members of a group
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

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Verify group exists and get owner info
    const group = await db
      .select({
        id: groups.id,
        name: groups.name,
        ownerId: groups.ownerId,
        ownerEmail: users.email,
        ownerName: users.name,
      })
      .from(groups)
      .leftJoin(users, eq(groups.ownerId, users.id))
      .where(eq(groups.id, parseInt(groupId)))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const isOwner = group[0].ownerId === userId;
    
    // Verify user has access to this group (owner or member)
    if (!isOwner) {
      const membership = await db
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, parseInt(groupId)),
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

    // Get all members
    const members = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        email: groupMembers.email,
        addedAt: groupMembers.addedAt,
        name: users.name,
      })
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, parseInt(groupId)))
      .orderBy(groupMembers.addedAt);

    return NextResponse.json(
      { 
        members, 
        owner: {
          id: group[0].ownerId,
          email: group[0].ownerEmail,
          name: group[0].ownerName,
        },
        groupName: group[0].name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching group members:", error);
    return NextResponse.json(
      { error: "Failed to fetch group members" },
      { status: 500 }
    );
  }
}

// POST - Add a member to a group (only owner)
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
    const { groupId, email } = body;

    if (!groupId || !email) {
      return NextResponse.json(
        { error: "Group ID and email are required" },
        { status: 400 }
      );
    }

    // Validate and sanitize email
    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Verify user is the owner of the group
    const group = await db
      .select()
      .from(groups)
      .where(and(eq(groups.id, groupId), eq(groups.ownerId, userId)))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json(
        { error: "Group not found or you don't have permission" },
        { status: 403 }
      );
    }

    // Check if user exists with this email
    const userToAdd = await db
      .select()
      .from(users)
      .where(eq(users.email, sanitizedEmail))
      .limit(1);

    if (userToAdd.length === 0) {
      return NextResponse.json(
        { error: "No user found with this email address" },
        { status: 404 }
      );
    }

    // Check if trying to add the owner
    if (userToAdd[0].id === userId) {
      return NextResponse.json(
        { error: "You are already the owner of this group" },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.email, sanitizedEmail)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: "This user is already a member of the group" },
        { status: 400 }
      );
    }

    // Check member limit (optional - set your own limit)
    const memberCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    const currentMembers = Number(memberCount[0]?.count || 0);
    const MAX_MEMBERS = 50; // Adjust as needed

    if (currentMembers >= MAX_MEMBERS) {
      return NextResponse.json(
        { error: `Group has reached maximum capacity of ${MAX_MEMBERS} members` },
        { status: 400 }
      );
    }

    // Add the member
    const newMember = await db
      .insert(groupMembers)
      .values({
        groupId,
        userId: userToAdd[0].id,
        email: sanitizedEmail,
      })
      .returning();

    return NextResponse.json(
      { 
        message: "Member added successfully", 
        member: {
          ...newMember[0],
          name: userToAdd[0].name,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding group member:", error);
    return NextResponse.json(
      { error: "Failed to add group member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a member from a group (only owner)
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
    const memberId = searchParams.get("memberId");
    const groupId = searchParams.get("groupId");

    if (!memberId || !groupId) {
      return NextResponse.json(
        { error: "Member ID and Group ID are required" },
        { status: 400 }
      );
    }

    // Verify user is the owner of the group
    const group = await db
      .select()
      .from(groups)
      .where(and(eq(groups.id, parseInt(groupId)), eq(groups.ownerId, userId)))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json(
        { error: "Group not found or you don't have permission" },
        { status: 403 }
      );
    }

    // Verify member exists in this group
    const member = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.id, parseInt(memberId)),
          eq(groupMembers.groupId, parseInt(groupId))
        )
      )
      .limit(1);

    if (member.length === 0) {
      return NextResponse.json(
        { error: "Member not found in this group" },
        { status: 404 }
      );
    }

    // Remove the member
    await db
      .delete(groupMembers)
      .where(eq(groupMembers.id, parseInt(memberId)));

    return NextResponse.json(
      { message: "Member removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing group member:", error);
    return NextResponse.json(
      { error: "Failed to remove group member" },
      { status: 500 }
    );
  }
}