import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800 text-white gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs">A</div>
          Admin Panel
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          <Link href="/admin/dashboard" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors font-medium">
            Dashboard
          </Link>
          <Link href="/admin/questions/import" className="block px-4 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 transition-colors font-medium flex items-center justify-between">
            <span>Live Generator</span>
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          </Link>
          <div className="px-4 py-2.5 rounded-lg text-slate-500 font-medium cursor-not-allowed">
            Question Bank
          </div>
          <div className="px-4 py-2.5 rounded-lg text-slate-500 font-medium cursor-not-allowed">
            Mock Tests
          </div>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="font-bold text-slate-800 tracking-tight">WB TET Platform Control</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
              <span className="text-sm font-semibold">{session.user.name || "Admin"}</span>
            </div>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm" className="rounded-full border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50">Logout</Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}

