import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";

export default async function TestInstructionsPage({ params }: { params: Promise<{ testId: string }> }) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;

  if (!session) {
    redirect("/login");
  }

  const test = await prisma.mockTest.findUnique({
    where: { id: resolvedParams.testId },
  });

  if (!test || test.status !== "published") {
    return <div>Test not found or not available.</div>;
  }

  // Check if there is an in-progress attempt
  const existingAttempt = await prisma.attempt.findFirst({
    where: {
      studentId: session.user.id,
      testId: test.id,
      status: "in_progress",
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">{test.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center p-4 bg-gray-100 rounded-lg">
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-bold">{test.durationMinutes} Mins</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Questions</div>
                <div className="font-bold">{test.totalMarks}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Max Marks</div>
                <div className="font-bold">{test.totalMarks}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Negative Marks</div>
                <div className="font-bold">None</div>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-xl font-bold">General Instructions:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>The examination will comprise of {test.totalMarks} Multiple Choice Questions (MCQs).</li>
                <li>Each question carries 1 mark.</li>
                <li>There is <strong>NO NEGATIVE MARKING</strong> for incorrect answers.</li>
                <li>The total duration of the test is {test.durationMinutes} minutes.</li>
                <li>The countdown timer at the top right of the screen will display the remaining time available for you to complete the examination.</li>
                <li>When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
              </ul>

              <h3 className="text-xl font-bold mt-6">Navigating and Answering:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly.</li>
                <li>Select one of the four options to answer the question.</li>
                <li>Click on <strong>Save & Next</strong> to save your answer and go to the next question.</li>
                <li>Click on <strong>Mark for Review & Next</strong> to save your answer and mark the question for review.</li>
                <li>To deselect your chosen answer, click on the <strong>Clear Response</strong> button.</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" required id="agree" />
                <span className="text-sm text-blue-900">
                  I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I agree that in case of not adhering to the instructions, I will be disqualified.
                </span>
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            {existingAttempt ? (
              <Link href={`/exam/${existingAttempt.id}`}>
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600">Resume In-Progress Test</Button>
              </Link>
            ) : (
              <form action="/api/exam/start" method="POST">
                <input type="hidden" name="testId" value={test.id} />
                <Button size="lg" type="submit" className="bg-green-600 hover:bg-green-700 px-12">I am ready to begin</Button>
              </form>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

