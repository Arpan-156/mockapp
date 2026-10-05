"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function GeneratorStudioPage() {
  const [testName, setTestName] = useState("WB TET Live Generation Set 01");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setStatus("generating");
    try {
      const res = await fetch("/api/admin/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testName }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to generate test");
      }
    } catch (e) {
      setStatus("error");
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Live Test Generator</h1>
        <p className="text-slate-500 text-lg">Use real-time web scraping to build a unique 150-question mock test instantly.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl shadow-blue-900/5">
        <div className="p-8 space-y-8">
          
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">Test Set Name</label>
            <Input 
              value={testName} 
              onChange={e => setTestName(e.target.value)} 
              className="text-lg py-6 font-semibold bg-slate-50 border-slate-200 text-slate-900 focus:bg-white transition-colors"
            />
            <p className="text-sm text-slate-500 font-medium">This name will be visible to students on the dashboard.</p>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Generation Process
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-blue-800 font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</div>
                Scrapes Google Search for all 5 WB TET Subjects
              </li>
              <li className="flex items-center gap-3 text-sm text-blue-800 font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">2</div>
                Extracts relevant MCQs, options, and explanations
              </li>
              <li className="flex items-center gap-3 text-sm text-blue-800 font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">3</div>
                Compiles exactly 30 questions per subject (150 total)
              </li>
              <li className="flex items-center gap-3 text-sm text-blue-800 font-medium">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">4</div>
                Publishes instantly to the Student Dashboard
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex-1">
            {status === "generating" && (
              <div className="flex items-center gap-3 text-blue-600 font-bold">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Mining web sources and compiling questions...
              </div>
            )}
            {status === "success" && (
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {message}
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {message}
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !testName}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12 shadow-md shadow-blue-200"
          >
            {loading ? "Generating..." : "Generate 150 Qs"}
          </Button>
        </div>
      </div>
    </div>
  );
}