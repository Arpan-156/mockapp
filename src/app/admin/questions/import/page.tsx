"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";

export default function ImportQuestionsPage() {
  const [query, setQuery] = useState("WB TET Primary CDP previous year");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    fetch("/api/admin/subjects").then(res => res.json()).then(data => {
      setSubjects(data.subjects);
      if (data.subjects.length > 0) setSelectedSubject(data.subjects[0].id);
    });
  }, []);

  const handleFetch = async () => {
    setLoading(true);
    setQuestions([]);
    try {
      const res = await fetch("/api/admin/fetch-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, subjectId: selectedSubject }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      } else {
        alert(data.error || "Failed to fetch");
      }
    } catch (e) {
      alert("Error fetching questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Real-time Question Discovery</h1>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Search Query</label>
            <Input 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="e.g. WB TET EVS questions" 
              className="text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Target Subject</label>
            <select 
              value={selectedSubject} 
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 px-3 bg-white text-gray-900"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Button onClick={handleFetch} disabled={loading || !selectedSubject}>
            {loading ? "Searching Google..." : "Search Web Sources"}
          </Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Discovered Drafts (Requires Review)</h2>
          {questions.map((q, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg">Draft #{idx + 1} - Source: {q.source}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-800">
                <p><strong>URL:</strong> <a href={q.sourceUrl} target="_blank" className="text-blue-600 underline">{q.sourceUrl}</a></p>
                <p><strong>Extracted Snippet:</strong> {q.questionText}</p>
                <p><em>In a full production implementation with a Gemini LLM, this snippet would be parsed precisely into the 4 options and correct answer automatically. For now, it is stored as a draft requiring manual admin edit.</em></p>
                <Button className="mt-4">Approve & Save to Database</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
