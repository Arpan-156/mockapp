"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function TestManager({ initialTests }: { initialTests: any[] }) {
  const [tests, setTests] = useState(initialTests);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setTests(initialTests);
  }, [initialTests]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this test and all its questions?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/tests/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTests(prev => prev.filter(t => t.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete test");
      }
    } catch (e) {
      alert("Error occurred while deleting test");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mt-4">
      {tests.map((test) => (
        <div key={test.id} className="p-4 rounded-xl border flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-slate-50 border-slate-200 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{test.title}</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold shrink-0">{test.totalMarks} Marks</span>
            </div>
            <p className="text-sm text-slate-500 line-clamp-1">{test.description}</p>
            <p className="text-xs text-slate-400 mt-1">
              Created: {!isMounted ? "..." : new Date(test.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button 
            size="sm" 
            variant="danger" 
            onClick={() => handleDelete(test.id)}
            disabled={deletingId === test.id}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shrink-0"
          >
            {deletingId === test.id ? "Deleting..." : "Delete Test"}
          </Button>
        </div>
      ))}
      {tests.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">No live tests found.</p>
      )}
    </div>
  );
}

