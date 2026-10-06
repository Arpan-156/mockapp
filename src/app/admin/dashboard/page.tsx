import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import StudentManager from "./StudentManager";
import TestManager from "./TestManager";

export default async function AdminDashboard() {
  const studentCount = await prisma.user.count({ where: { role: "student" } });
  const questionCount = await prisma.question.count();
  const testCount = await prisma.mockTest.count();
  const attemptCount = await prisma.attempt.count();

  // Fetch all students for the manager
  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: {
      id: true,
      email: true,
      name: true,
      isLocked: true,
      forceLogoutAt: true,
      attempts: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { startedAt: true }
      }
    }
  } as any);

  // Format students to include lastActive
  const formattedStudents = students.map((s: any) => {
    let lastActiveStr = "Never";
    if (s.attempts[0]?.startedAt) {
      const d = new Date(s.attempts[0].startedAt);
      lastActiveStr = d.toISOString().split('T')[0] + ' ' + d.toLocaleTimeString('en-US', { hour12: false });
    }
    return {
      id: s.id,
      email: s.email,
      name: s.name,
      isLocked: s.isLocked,
      lastActive: lastActiveStr,
    };
  });

  // Fetch all live mock tests
  const liveTests = await prisma.mockTest.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Platform Overview</h1>
        <p className="text-slate-500">Monitor system statistics and generate new test sets in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Students", value: studentCount, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Total Questions", value: questionCount, icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z", color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Active Tests", value: testCount, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Total Attempts", value: attemptCount, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "text-indigo-600", bg: "bg-indigo-100" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-slate-500 text-sm">{stat.label}</span>
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
            </div>
            <div className="text-4xl font-extrabold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm bg-gradient-to-br from-white to-blue-50/50">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-900">Live Test Generator</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Generate a full 150-question mock test instantly. The system will scrape Web Search in real-time to build a brand new, unique mock test with 30 questions per subject.
          </p>
          <Link href="/admin/questions/import">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md font-semibold h-12 rounded-xl">
              Launch Generator Studio
            </Button>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
           <h2 className="text-xl font-bold mb-4 text-slate-900">Active Mock Tests</h2>
           <p className="text-sm text-slate-500 mb-2">View and manage currently live mock tests.</p>
           <TestManager initialTests={liveTests} />
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
           <h2 className="text-xl font-bold mb-4 text-slate-900">Student Access Management</h2>
           <p className="text-sm text-slate-500 mb-6">View all registered students, lock their accounts, or force them to log out.</p>
           
           <StudentManager initialStudents={formattedStudents} />
        </div>
      </div>
    </div>
  );
}
