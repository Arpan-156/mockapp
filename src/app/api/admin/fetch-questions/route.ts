import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import googleIt from "google-it";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, subjectId } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Real-time fetch from Google
    const results = await googleIt({ query: `${query} MCQs with answers` });

    // We heuristically parse the snippets into mock questions for the admin to review
    const parsedQuestions = results.slice(0, 10).map((res: any, index: number) => {
      return {
        id: `draft-${index}`,
        subjectId,
        questionText: res.snippet.substring(0, 150) + "?", // Simple heuristic from snippet
        optionA: "Option A from snippet",
        optionB: "Option B from snippet",
        optionC: "Option C from snippet",
        optionD: "Option D from snippet",
        correctOption: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)],
        explanation: `Sourced from: ${res.title}. Original context: ${res.snippet}`,
        difficulty: "medium",
        source: res.title,
        sourceUrl: res.link,
        status: "pending_review",
      };
    });

    return NextResponse.json({ questions: parsedQuestions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch from Google" }, { status: 500 });
  }
}
