import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
    orderBy: { startedAt: "desc" },
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 hidden sm:block">
              WB TET Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200">
              <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                {session.user.name || session.user.email}
              </span>
            </div>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm" className="rounded-full text-slate-600 hover:text-red-600 hover:bg-red-50 border-slate-200 hover:border-red-200 transition-colors">
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        
        {/* Welcome & Stats Section */}
        <section>
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              Dashboard
            </h1>
            <p className="text-slate-500 text-lg">Track your progress and prepare for success.</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: "Tests Attempted", value: userAttempts.length, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-blue-600", bg: "bg-blue-100" },
              { label: "Best Score", value: `${bestScore}/150`, icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", color: "text-amber-600", bg: "bg-amber-100" },
              { label: "Average Score", value: `${avgScore}/150`, icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "text-emerald-600", bg: "bg-emerald-100" },
              { label: "Pass Rate", value: `${passRate}%`, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-indigo-600", bg: "bg-indigo-100" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-slate-500 text-sm">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}>
                    <svg className={`w-4 h-4 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Available Tests (Takes up 2 columns on lg screens) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Available Mock Tests
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-5">
              {availableTests.map((test) => (
                <div key={test.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md">WB TET</div>
                      <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">{test.durationMinutes} min</div>
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{test.title}</h3>
                    <p className="text-sm text-slate-500 mb-5 line-clamp-2">{test.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        150 Qs
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Pass: {test.passingMarks}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                    <Link href={`/mock-tests/${test.id}`} className="block w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
                        Start Test Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {availableTests.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No Tests Available</h3>
                  <p className="text-slate-500 mt-1 max-w-sm">Please check back later or contact your administrator to generate new tests.</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Attempts (Takes up 1 column on lg screens) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                History
              </h2>
            </div>

            <div className="space-y-4">
              {userAttempts.slice(0, 5).map((attempt) => {
                const isPassed = attempt.score !== null && attempt.score >= attempt.test.passingMarks;
                const isSubmitted = attempt.status === "submitted";
                return (
                  <div key={attempt.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 truncate pr-4" title={attempt.test.title}>{attempt.test.title}</h3>
                      {isSubmitted ? (
                        <span className={`text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap ${isPassed ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          {isPassed ? "Passed" : "Failed"}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-800 whitespace-nowrap">
                          In Progress
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(attempt.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="font-extrabold text-lg text-slate-800">
                        {attempt.score !== null ? (
                          <span className={isPassed ? "text-emerald-600" : "text-red-600"}>
                            {attempt.score} <span className="text-sm text-slate-400 font-medium">/ {attempt.test.totalMarks}</span>
                          </span>
                        ) : "- / -"}
                      </div>
                      <Link href={isSubmitted ? `/result/${attempt.id}` : `/exam/${attempt.id}`}>
                        <Button variant={isSubmitted ? "outline" : "primary"} size="sm" className={`rounded-lg font-semibold ${!isSubmitted && "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                          {isSubmitted ? "Analysis" : "Resume"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
              {userAttempts.length === 0 && (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-sm">No recent attempts.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

