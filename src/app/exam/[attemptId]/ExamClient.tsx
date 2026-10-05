"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ExamClient({ attempt, orderedAnswers, testQuestions }: any) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(orderedAnswers);
  const [timeLeft, setTimeLeft] = useState(() => {
    const expires = new Date(attempt.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expires - now) / 1000));
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx].selectedOption = option;
    setAnswers(newAnswers);
    saveAnswer(newAnswers[currentIdx].id, option, newAnswers[currentIdx].isMarkedReview);
  };

  const handleClearResponse = () => {
    const newAnswers = [...answers];
    newAnswers[currentIdx].selectedOption = null;
    setAnswers(newAnswers);
    saveAnswer(newAnswers[currentIdx].id, null, newAnswers[currentIdx].isMarkedReview);
  };

  const handleMarkReview = () => {
    const newAnswers = [...answers];
    newAnswers[currentIdx].isMarkedReview = !newAnswers[currentIdx].isMarkedReview;
    setAnswers(newAnswers);
    saveAnswer(newAnswers[currentIdx].id, newAnswers[currentIdx].selectedOption, newAnswers[currentIdx].isMarkedReview);
    if (currentIdx < testQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const saveAnswer = async (answerId: string, selectedOption: string | null, isMarkedReview: boolean) => {
    await fetch("/api/exam/save-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId, selectedOption, isMarkedReview }),
    });
  };

  const handleSubmitTest = async () => {
    const res = await fetch("/api/exam/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId: attempt.id }),
    });
    if (res.ok) {
      router.push(`/result/${attempt.id}`);
    } else {
      alert("Error submitting test. Please try again.");
    }
  };

  if (!testQuestions || testQuestions.length === 0 || !answers || answers.length === 0) {
    return <div>Loading test data...</div>;
  }

  const currentQ = testQuestions[currentIdx].question;
  const currentA = answers[currentIdx];

  const getStatusColor = (idx: number) => {
    const a = answers[idx];
    if (a.isMarkedReview && a.selectedOption) return "bg-purple-600 text-white"; // Answered + Marked
    if (a.isMarkedReview) return "bg-purple-400 text-white"; // Marked for review
    if (a.selectedOption) return "bg-green-500 text-white"; // Answered
    if (idx === currentIdx) return "bg-blue-500 text-white"; // Current
    return "bg-gray-200 text-gray-700"; // Not visited/answered
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
        <h1 className="text-xl font-bold text-blue-900">{attempt.test.title}</h1>
        <div className="flex items-center gap-4">
          <div className="text-xl font-mono font-bold bg-gray-100 px-4 py-2 rounded-md">
            {formatTime(timeLeft)}
          </div>
          <Button variant="danger" onClick={() => {
            if (confirm("Are you sure you want to submit the test?")) {
              handleSubmitTest();
            }
          }}>
            Submit Test
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg">Question {currentIdx + 1} / {testQuestions.length}</span>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{currentQ.subject.name}</span>
            </div>
            
            <div className="text-lg mb-8">{currentQ.questionText}</div>
            
            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <label key={opt} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${currentA.selectedOption === opt ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name={`q-${currentIdx}`}
                    checked={currentA.selectedOption === opt}
                    onChange={() => handleOptionSelect(opt)}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-lg">
                    {opt === 'A' && currentQ.optionA}
                    {opt === 'B' && currentQ.optionB}
                    {opt === 'C' && currentQ.optionC}
                    {opt === 'D' && currentQ.optionD}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-12 flex justify-between items-center pt-6 border-t">
              <div className="space-x-4">
                <Button variant="outline" onClick={handleMarkReview}>
                  {currentA.isMarkedReview ? "Unmark Review" : "Mark for Review"}
                </Button>
                <Button variant="outline" onClick={handleClearResponse}>
                  Clear Response
                </Button>
              </div>
              <div className="space-x-4">
                <Button variant="secondary" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}>
                  Previous
                </Button>
                <Button onClick={() => setCurrentIdx(Math.min(testQuestions.length - 1, currentIdx + 1))} disabled={currentIdx === testQuestions.length - 1}>
                  Save & Next
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar Palette */}
        <aside className="w-80 bg-white border-l shadow-sm flex flex-col">
          <div className="p-4 border-b font-bold bg-gray-50 text-center">
            Question Palette
          </div>
          <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto flex-1 content-start">
            {answers.map((ans: any, idx: number) => (
              <button
                key={ans.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-10 h-10 flex items-center justify-center rounded-md font-bold text-sm ${getStatusColor(idx)}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="p-4 border-t bg-gray-50 space-y-2 text-xs">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-400 rounded"></div> Marked for Review</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-600 rounded"></div> Answered & Marked</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 border rounded"></div> Not Answered</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
