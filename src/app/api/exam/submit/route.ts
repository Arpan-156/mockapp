import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { attemptId } = await req.json();

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: { include: { question: true } },
        test: true,
      }
    });

    if (!attempt || attempt.studentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (attempt.status === "submitted") {
      return NextResponse.json({ success: true });
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const answersToUpdate: { id: string; isCorrect: boolean }[] = [];

    for (const ans of attempt.answers) {
      if (!ans.selectedOption) {
        unansweredCount++;
        answersToUpdate.push({ id: ans.id, isCorrect: false });
      } else if (ans.selectedOption === ans.question.correctOption) {
        correctCount++;
        answersToUpdate.push({ id: ans.id, isCorrect: true });
      } else {
        incorrectCount++;
        answersToUpdate.push({ id: ans.id, isCorrect: false });
      }
    }

    // Perform updates in transaction
    await prisma.$transaction(async (tx) => {
      for (const update of answersToUpdate) {
        await tx.attemptAnswer.update({
          where: { id: update.id },
          data: { isCorrect: update.isCorrect }
        });
      }

      await tx.attempt.update({
        where: { id: attempt.id },
        data: {
          status: "submitted",
          submittedAt: new Date(),
          score: correctCount, // 1 mark per correct answer, no negative marking
          correctCount,
          incorrectCount,
          unansweredCount,
          timeTakenSeconds: Math.floor((new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000)
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
