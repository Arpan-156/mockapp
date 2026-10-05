import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "admin") {
    redirect("/admin/dashboard");
  }

  const userAttempts = await prisma.attempt.findMany({
    where: { studentId: session.user.id },
    include: { test: true },
    orderBy: { startedAt: 'desc' },
  });

  const availableTests = await prisma.mockTest.findMany({
    where: { status: "published" },
  });

  const bestScore = userAttempts.reduce((max, attempt) => Math.max(max, attempt.score || 0), 0);
  const avgScore = userAttempts.length > 0
    ? Math.round(userAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / userAttempts.length)
    : 0;
  const passRate = userAttempts.length > 0
    ? Math.round((userAttempts.filter(a => (a.score || 0) >= a.test.passingMarks).length / userAttempts.length) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-6 h-16 flex items-center border-b bg-white justify-between">
        <div className="font-bold text-xl text-blue-800">WB TET MOCK</div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {session.user.name || session.user.email}</span>
          <Link href="/api/auth/signout">
            <Button variant="outline" size="sm">Logout</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-6">Student Dashboard</h1>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tests Attempted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userAttempts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bestScore} / 150</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgScore} / 150</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{passRate}%</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Available Mock Tests</h2>
            <div className="space-y-4">
              {availableTests.map((test) => (
                <Card key={test.id}>
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{test.title}</h3>
                      <p className="text-sm text-gray-500">{test.description}</p>
                      <div className="text-sm mt-2 flex gap-4 text-gray-600">
                        <span>{test.totalMarks} Questions</span>
                        <span>{test.durationMinutes} Mins</span>
                        <span>Pass: {test.passingMarks}</span>
                      </div>
                    </div>
                    <Link href={`/mock-tests/${test.id}`}>
                      <Button>Start Test</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {availableTests.length === 0 && (
                <p className="text-gray-500">No mock tests available yet.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Your Recent Attempts</h2>
            <div className="space-y-4">
              {userAttempts.slice(0, 5).map((attempt) => (
                <Card key={attempt.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{attempt.test.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(attempt.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{attempt.score !== null ? `${attempt.score} / ${attempt.test.totalMarks}` : 'In Progress'}</div>
                      <Link href={attempt.status === 'submitted' ? `/result/${attempt.id}` : `/exam/${attempt.id}`}>
                        <Button variant="outline" size="sm" className="mt-2">
                          {attempt.status === 'submitted' ? 'View Result' : 'Resume'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {userAttempts.length === 0 && (
                <p className="text-gray-500">You haven't attempted any tests yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
