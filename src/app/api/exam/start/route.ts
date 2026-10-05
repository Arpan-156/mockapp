import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.redirect(new URL("/login", req.url));

    const formData = await req.formData();
    const testId = formData.get("testId") as string;

    const test = await prisma.mockTest.findUnique({ where: { id: testId } });
    if (!test) return NextResponse.redirect(new URL("/dashboard", req.url));

    // check existing
    const existing = await prisma.attempt.findFirst({
      where: { studentId: session.user.id, testId: test.id, status: "in_progress" }
    });
    
    if (existing) {
      return NextResponse.redirect(new URL(`/exam/${existing.id}`, req.url));
    }

    const expiresAt = new Date(Date.now() + test.durationMinutes * 60 * 1000);

    const attempt = await prisma.attempt.create({
      data: {
        studentId: session.user.id,
        testId: test.id,
        expiresAt,
        status: "in_progress",
      }
    });

    const testQuestions = await prisma.testQuestion.findMany({
      where: { mockTestId: test.id },
    });

    // Generate empty answers
    const answersData = testQuestions.map(tq => ({
      attemptId: attempt.id,
      questionId: tq.questionId,
    }));

    await prisma.attemptAnswer.createMany({
      data: answersData
    });

    return NextResponse.redirect(new URL(`/exam/${attempt.id}`, req.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}
