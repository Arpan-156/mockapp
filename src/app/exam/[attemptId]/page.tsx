import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExamClient from "./ExamClient";

export default async function ExamPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;

  if (!session) {
    redirect("/login");
  }

  const attempt = await prisma.attempt.findUnique({
    where: { id: resolvedParams.attemptId },
    include: {
      test: true,
      answers: {
        include: {
          question: {
            include: { subject: true }
          }
        },
        orderBy: { question: { id: 'asc' } } // Fallback ordering, should really order by TestQuestion orderIndex
      }
    }
  });

  if (!attempt) {
    return <div>Attempt not found</div>;
  }

  if (attempt.studentId !== session.user.id) {
    return <div>Unauthorized</div>;
  }

  if (attempt.status === "submitted") {
    redirect(`/result/${attempt.id}`);
  }

  // Need to get the questions in correct order as per TestQuestion
  const testQuestions = await prisma.testQuestion.findMany({
    where: { mockTestId: attempt.testId },
    orderBy: { orderIndex: 'asc' },
    include: {
      question: {
        include: { subject: true }
      }
    }
  });

  // Map answers to the ordered questions
  const orderedAnswers = testQuestions.map((tq) => {
    const existingAnswer = attempt.answers.find(a => a.questionId === tq.questionId);
    return existingAnswer || null;
  }).filter(Boolean); // Filter out nulls, though there shouldn't be any if attempt is initialized correctly

  return <ExamClient attempt={attempt} orderedAnswers={orderedAnswers} testQuestions={testQuestions} />;
}

