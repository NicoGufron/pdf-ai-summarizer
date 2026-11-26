"use client"

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PDFData | null>(null);

  // const [summarize, setSummarize] = useState<string | null>(null);
  const [summaryAIData, setSummaryAIData] = useState<GoogleGenAIData | null>(null);
  
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const selectedFile = event.target.files?.[0] || null;

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSummaryAIData(null);
    // setSummarize(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.data) {
        setResult(data.data);
      }

    } catch (err) {
      setError("Failed to generate summary.");
    }
  }

  useEffect(() => {
    if (result) {
      handleSummarize();
    }
  }, [result]);

  const handleSummarize = async () => {
    if (!result) return;

    try {
      const startTime = performance.now();
      const summarizeResponse = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: result.extractedText }),
      });

      const summarizeData = await summarizeResponse.json();

      const endTime = performance.now();

      setGenerationTime(
        Number(((endTime - startTime) / 1000).toFixed(2))
      );

      if (summarizeData.success) {
        // setSummarize(summarizeData.summary);
        setTokensUsed(summarizeData.tokensUsed);
        setSummaryAIData(summarizeData.data);
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
      <h1 className="text-2xl font-bold">PDF AI Summarizer</h1>
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

      {result && (
        <div className="mt-4 w-full max-w-2xl overflow-y-auto p-4 bg-white rounded shadow dark:bg-zinc-800 flex flex-col gap-2">
          <h2 className="text-xl font-bold mb-2">PDF File Details</h2>
          <p className="text-sm">File name: {result.fileName}</p>
          <p className="text-sm">File size: {result.size} bytes</p>
          <p className="text-sm">File type: {result.type}</p>
          <p className="text-sm">Number of pages: {result.pages}</p>
          <p className="text-sm">Total characters extracted: {result.extractedTotalCharacters}</p>
        </div>
      )}

      {summaryAIData && (
        <div className="mt-4 w-full max-w-2xl overflow-y-auto p-4 bg-white rounded shadow dark:bg-zinc-800">
          <h2 className="text-xl font-bold mb-2">Summary:</h2>
          <div className="mb-2 border p-4">
            <p className="text-sm text-white">Prompt tokens used: {summaryAIData.tokensUsed}</p>
            <p className="text-sm text-white">Input tokens: {summaryAIData.inputTokens}</p>
            <p className="text-sm text-white">Output tokens: {summaryAIData.outputTokens}</p>
            <p className="text-sm text-white">Total tokens: {summaryAIData.totalTokens}</p>
            <p className="text-sm text-white">Summary generation time: {generationTime} seconds</p>
          </div>
          <ReactMarkdown>{summaryAIData.summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
