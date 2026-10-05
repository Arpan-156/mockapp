import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function AdminDashboard() {
  const studentCount = await prisma.user.count({ where: { role: "student" } });
  const questionCount = await prisma.question.count();
  const testCount = await prisma.mockTest.count();
  const attemptCount = await prisma.attempt.count();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Students</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{studentCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Questions</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{questionCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Mock Tests</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{testCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Attempts</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{attemptCount}</div></CardContent>
        </Card>
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <p className="text-gray-500 text-sm">System is active and logging attempts. More admin features (Bulk upload, test generation, etc.) will be exposed here in the full deployment.</p>
      </div>
    </div>
  );
}
