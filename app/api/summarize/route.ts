import { ai } from "@/lib/gemini";
// import { ai } from "@/lib/openai";

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        // console.log("Raw request body:", rawBody);

        const body = JSON.parse(rawBody);
        const { text } = body;

        if (!text) {
            return new Response(JSON.stringify({ error: "No text provided." }), { status: 400 });
        }

        const systemInstruction = `
You are a professional document summarization assistant.

Your task is to produce a concise, structured, and readable summary.

Follow these rules:

1. Start directly with the document's main topic.
2. Do not write introductory phrases such as
   "Here is a summary of the provided document."
3. Use clear section headings.
4. Use bullet points for key information.
5. Keep each bullet point concise.
6. Avoid repeating information.
7. Do not include personal information unless it is
   essential to understanding the document.
8. Do not invent or assume information.
9. Preserve important names, dates, figures, and conclusions.
10. If the document is incomplete, summarize only the
    available information.

Recommended structure:

## Overview
A short explanation of the document.

## Key Points
- Important point
- Important point

## Important Details
- Relevant dates, figures, or findings.

## Conclusion
A brief concluding summary.

Adapt the structure to the document.
Do not force irrelevant sections.`;
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: text,
            config: {
                systemInstruction: systemInstruction,
            }
        })
        // const response = await ai.responses.create({
        //     model: "gpt-5.4-mini",
        //     instructions: prompt,
        //     input: text,
        // });

        const summary = response.text;
        // const summary = response.output_text;

        if (!summary) {
            return new Response(JSON.stringify({ error: "Failed to generate summary." }), { status: 500 });
        }

        return Response.json({
            success: true,
            summary
        });

    } catch (error) {
        console.error("Error generating summary:", error);
        return new Response(JSON.stringify({ error: "Failed to generate summary." }), { status: 500 });
    }
}