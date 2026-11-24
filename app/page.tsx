"use client"

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [summarize, setSummarize] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSummarize(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data.data.extractedText);
      handleSummarize();

    } catch (err) {
      setError("Failed to generate summary.");
    }
  }

  const handleSummarize = async () => {
    if (!result) return;

    try {
      const summarizeResponse = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: result }),
      });

      const summarizeData = await summarizeResponse.json();

      if (summarizeData.success) {
        setSummarize(summarizeData.summary);
      } else {
        setError("Failed to generate summary.");
      }
    } catch (err) {
      setError("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen p-4">
      <h1 className="text-2xl font-bold">AI PDF Summarizer</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Upload a PDF file to get a summary of its content.
      </p>
      <section className="mt-4 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-300 p-4 dark:border-zinc-700">
        <input type="file" accept=".pdf" onChange={handleFileChange} />
      </section>

      {
        file && (
          <div className="mt-4">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Selected file: {file.name}
            </p>
          </div>
        )
      }

      <button className="mt-4 bg-white p-4 text-black rounded" disabled={!file} onClick={handleUpload}>
        {loading ? "Generating summary..." : "Generate summary"}
      </button>

      {error && (
        <p className="text-sm text-red-600 mt-4">{error}</p>
      )}

      {/* {result && (
        <p className="text-sm text-green-700 mt-4">{result}</p>
      )} */}

      {summarize && (
        <div className="mt-4 w-full max-w-2xl overflow-y-auto p-4 bg-white rounded shadow dark:bg-zinc-800">
          <h2 className="text-xl font-bold mb-2">Summary:</h2>
          <ReactMarkdown>{summarize}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
