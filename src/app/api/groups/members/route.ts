// src/app/api/groups/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { groups, groupMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

// GET - Get all members of a group
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
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

    // Verify user has access to this group (owner or member)
    const group = await db
      .select()
      .from(groups)
      .where(eq(groups.id, parseInt(groupId)))
      .limit(1);

    if (group.length === 0) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const isOwner = group[0].ownerId === userId;
    
    if (!isOwner) {
      const session = await getServerSession(authOptions);
      const userEmail = session?.user?.email;
      
      const membership = await db
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, parseInt(groupId)),
            eq(groupMembers.email, userEmail!)
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

    const members = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, parseInt(groupId)));

    return NextResponse.json(
      { members, owner: group[0] },
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
      .where(eq(users.email, email))
      .limit(1);

    if (userToAdd.length === 0) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.email, email)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: "User is already a member of this group" },
        { status: 400 }
      );
    }

    // Check if trying to add the owner
    if (userToAdd[0].id === userId) {
      return NextResponse.json(
        { error: "Owner is automatically a member" },
        { status: 400 }
      );
    }

    const newMember = await db
      .insert(groupMembers)
      .values({
        groupId,
        userId: userToAdd[0].id,
        email,
      })
      .returning();

    return NextResponse.json(
      { message: "Member added successfully", member: newMember[0] },
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

    const deletedMember = await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.id, parseInt(memberId)),
          eq(groupMembers.groupId, parseInt(groupId))
        )
      )
      .returning();

    if (deletedMember.length === 0) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

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