import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { answerId, selectedOption, isMarkedReview } = await req.json();

    const answer = await prisma.attemptAnswer.findUnique({
      where: { id: answerId },
      include: { attempt: true }
    });

    if (!answer || answer.attempt.studentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (answer.attempt.status === "submitted") {
      return NextResponse.json({ error: "Exam already submitted" }, { status: 400 });
    }

    await prisma.attemptAnswer.update({
      where: { id: answerId },
      data: {
        selectedOption,
        isMarkedReview,
        answeredAt: selectedOption ? new Date() : null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
