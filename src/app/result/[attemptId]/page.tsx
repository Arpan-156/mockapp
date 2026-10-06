import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
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
        orderBy: { question: { id: 'asc' } }
      }
    }
  });

  if (!attempt || attempt.studentId !== session.user.id) {
    return <div>Not found</div>;
  }

  if (attempt.status !== "submitted") {
    redirect(`/exam/${attempt.id}`);
  }

  const passStatus = (attempt.score || 0) >= attempt.test.passingMarks ? "PASSED" : "FAILED";
  const percentage = Math.round(((attempt.score || 0) / attempt.test.totalMarks) * 100);
  const accuracy = attempt.correctCount + attempt.incorrectCount > 0 
    ? Math.round((attempt.correctCount / (attempt.correctCount + attempt.incorrectCount)) * 100) 
    : 0;

  // Group by subjects
  const subjectStats: Record<string, { total: number, correct: number, incorrect: number, unattempted: number, name: string }> = {};
  
  attempt.answers.forEach(a => {
    const subId = a.question.subjectId;
    if (!subjectStats[subId]) {
      subjectStats[subId] = { total: 0, correct: 0, incorrect: 0, unattempted: 0, name: a.question.subject.name };
    }
    subjectStats[subId].total++;
    if (a.isCorrect) subjectStats[subId].correct++;
    else if (a.selectedOption) subjectStats[subId].incorrect++;
    else subjectStats[subId].unattempted++;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-6 h-16 flex items-center border-b bg-white justify-between">
        <div className="font-bold text-xl text-blue-800">WB TET MOCK - Result</div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">{attempt.test.title}</h1>
          <p className="text-gray-500">Submitted on {new Date(attempt.submittedAt || '').toLocaleString()}</p>
        </div>

        <Card className="bg-blue-900 text-white border-none shadow-lg">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center divide-x divide-blue-800">
              <div>
                <div className="text-blue-200 mb-2">Score</div>
                <div className="text-5xl font-bold">{attempt.score} <span className="text-2xl text-blue-400">/ {attempt.test.totalMarks}</span></div>
              </div>
              <div>
                <div className="text-blue-200 mb-2">Percentage</div>
                <div className="text-5xl font-bold">{percentage}%</div>
              </div>
              <div>
                <div className="text-blue-200 mb-2">Status</div>
                <div className={`text-4xl font-bold mt-2 ${passStatus === 'PASSED' ? 'text-green-400' : 'text-red-400'}`}>{passStatus}</div>
              </div>
              <div>
                <div className="text-blue-200 mb-2">Accuracy</div>
                <div className="text-5xl font-bold">{accuracy}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle>Correct</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold text-green-600">{attempt.correctCount}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Incorrect</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold text-red-600">{attempt.incorrectCount}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Unattempted</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold text-gray-500">{attempt.unansweredCount}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Correct</th>
                    <th className="px-6 py-3">Incorrect</th>
                    <th className="px-6 py-3">Unattempted</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(subjectStats).map((stat) => (
                    <tr key={stat.name} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{stat.name}</td>
                      <td className="px-6 py-4 font-bold">{stat.correct} / {stat.total}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{stat.correct}</td>
                      <td className="px-6 py-4 text-red-600 font-medium">{stat.incorrect}</td>
                      <td className="px-6 py-4 text-gray-500">{stat.unattempted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-6 mt-12">Question-wise Review</h2>
          <div className="space-y-6">
            {attempt.answers.map((ans, idx) => (
              <Card key={ans.id} className={ans.isCorrect ? 'border-green-200' : ans.selectedOption ? 'border-red-200' : 'border-gray-200'}>
                <CardHeader className={`border-b ${ans.isCorrect ? 'bg-green-50' : ans.selectedOption ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">Question {idx + 1}</CardTitle>
                    <div>
                      {ans.isCorrect ? (
                        <span className="text-green-700 font-bold flex items-center gap-2">✅ Correct</span>
                      ) : ans.selectedOption ? (
                        <span className="text-red-700 font-bold flex items-center gap-2">❌ Incorrect</span>
                      ) : (
                        <span className="text-gray-600 font-bold flex items-center gap-2">⚪ Not Attempted</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-gray-500 text-sm mb-2">{ans.question.subject.name}</div>
                  <div className="text-lg mb-6">{ans.question.questionText}</div>
                  
                  <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <div className="p-4 rounded border bg-gray-50">
                      <div className="text-sm font-bold text-gray-500 mb-1">Your Answer:</div>
                      <div className={`font-medium ${!ans.selectedOption ? 'text-gray-500' : ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {ans.selectedOption ? `${ans.selectedOption}. ${ans.question[`option${ans.selectedOption}` as keyof typeof ans.question] as string}` : 'None'}
                      </div>
                    </div>
                    <div className="p-4 rounded border bg-green-50 border-green-100">
                      <div className="text-sm font-bold text-green-800 mb-1">Correct Answer:</div>
                      <div className="font-medium text-green-900">
                        {ans.question.correctOption}. {ans.question[`option${ans.question.correctOption}` as keyof typeof ans.question] as string}
                      </div>
                    </div>
                  </div>

                  {ans.question.explanation && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded text-blue-900">
                      <div className="font-bold mb-1">Explanation:</div>
                      <div>{ans.question.explanation}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

