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
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800">
          Admin Panel
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin/dashboard" className="block px-4 py-2 rounded bg-slate-800 text-white">Dashboard</Link>
          <Link href="#" className="block px-4 py-2 rounded text-slate-300 hover:bg-slate-800 hover:text-white">Question Bank</Link>
          <Link href="#" className="block px-4 py-2 rounded text-slate-300 hover:bg-slate-800 hover:text-white">Mock Tests</Link>
          <Link href="#" className="block px-4 py-2 rounded text-slate-300 hover:bg-slate-800 hover:text-white">Students</Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h2 className="font-semibold text-gray-800">WB TET Mock Test Platform</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm">Admin User</span>
            <Link href="/api/auth/signout">
              <Button variant="outline" size="sm">Logout</Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
