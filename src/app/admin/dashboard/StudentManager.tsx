"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function StudentManager({ initialStudents }: { initialStudents: any[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: "lock" | "unlock" | "logout") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      } else {
        alert("Failed to perform action");
      }
    } catch (e) {
      alert("Error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {students.map((student) => (
        <div key={student.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center transition-colors ${student.isLocked ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{student.name || "Unnamed"}</span>
              {student.isLocked && <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">Locked</span>}
            </div>
            <p className="text-sm text-slate-500">{student.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Last Attempt: {student.lastActive ? new Date(student.lastActive).toLocaleString() : "Never"}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleAction(student.id, "logout")}
              disabled={loadingId === student.id}
              className="flex-1 sm:flex-none border-slate-300 text-slate-700"
            >
              Force Logout
            </Button>
            <Button 
              size="sm" 
              variant={student.isLocked ? "primary" : "danger"} 
              onClick={() => handleAction(student.id, student.isLocked ? "unlock" : "lock")}
              disabled={loadingId === student.id}
              className={`flex-1 sm:flex-none ${!student.isLocked ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
            >
              {student.isLocked ? "Unlock" : "Lock"}
            </Button>
          </div>
        </div>
      ))}
      {students.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">No students found.</p>
      )}
    </div>
  );
}

