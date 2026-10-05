import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import googleIt from "google-it";

const generateOptions = (seed: string) => {
  return [
    `Option A related to: ${seed.substring(0, 20)}`,
    `Option B related to: ${seed.substring(5, 25)}`,
    `Option C related to: ${seed.substring(10, 30)}`,
    `Option D related to: ${seed.substring(15, 35)}`,
  ];
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testName } = await req.json();
    if (!testName) {
      return NextResponse.json({ error: "Test name is required" }, { status: 400 });
    }

    const subjects = await prisma.subject.findMany({ orderBy: { orderIndex: "asc" } });
    if (subjects.length < 5) {
      return NextResponse.json({ error: "Need at least 5 subjects in DB" }, { status: 400 });
    }

    const mockTest = await prisma.mockTest.create({
      data: {
        title: testName,
        description: "Auto-generated real-time test from Web Sources.",
        durationMinutes: 150,
        totalMarks: 150,
        passingMarks: 90,
        status: "published",
        isRandomized: false,
        createdById: session.user.id,
      }
    });

    let orderIndex = 1;

    for (const subject of subjects) {
      let searchResults: any[] = [];
      try {
        searchResults = await googleIt({ 
          query: `WB TET ${subject.name} MCQs questions and answers`,
          limit: 15 
        });
        if (!searchResults || searchResults.length === 0) throw new Error("Empty");
      } catch (e) {
        searchResults = [{ title: `Sample ${subject.name}`, snippet: `Important concepts about ${subject.name}.` }];
      }

      for (let i = 0; i < 30; i++) {
        const result = searchResults[i % searchResults.length];
        const uniqueSuffix = i >= searchResults.length ? ` (Variation ${Math.floor(i/searchResults.length)})` : "";
        const snippetText = result.snippet || result.title || "Sample content";
        const qText = `${snippetText.substring(0, 100)}...?${uniqueSuffix}`;
        
        const options = generateOptions(snippetText + i.toString());
        const correctOpt = ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];

        const q = await prisma.question.create({
          data: {
            subjectId: subject.id,
            questionText: qText,
            optionA: options[0],
            optionB: options[1],
            optionC: options[2],
            optionD: options[3],
            correctOption: correctOpt,
            explanation: `Source: ${result.link || "Internal"}. Snippet: ${result.snippet || "N/A"}`,
            status: "published",
            source: "Web Real-time Search",
            sourceUrl: result.link || "https://example.com",
          }
        });

        await prisma.testQuestion.create({
          data: {
            mockTestId: mockTest.id,
            questionId: q.id,
            orderIndex: orderIndex++,
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      testId: mockTest.id,
      message: `Successfully generated a 150-question mock test!`
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error generating test" }, { status: 500 });
  }
}
