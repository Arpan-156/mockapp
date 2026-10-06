import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (action === "lock") {
      await prisma.user.update({
        where: { id },
        data: { isLocked: true } as any,
      });
      return NextResponse.json({ isLocked: true });
    } else if (action === "unlock") {
      await prisma.user.update({
        where: { id },
        data: { isLocked: false } as any,
      });
      return NextResponse.json({ isLocked: false });
    } else if (action === "logout") {
      const now = new Date();
      await prisma.user.update({
        where: { id },
        data: { forceLogoutAt: now } as any,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
