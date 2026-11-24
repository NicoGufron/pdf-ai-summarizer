import { ai } from "@/lib/gemini";

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();

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

        const interaction = await ai.models.countTokens({
            model: "gemini-3.5-flash-lite",
            contents: text,
        });

        const usageInfo = await ai.interactions.create({
            model: "gemini-3.5-flash-lite",
            input: text,
        })

        const summary = response.text;

        if (!summary) {
            return new Response(JSON.stringify({ error: "Failed to generate summary." }), { status: 500 });
        }

        return Response.json({
            success: true,
            data: {
                tokensUsed: interaction.totalTokens,
                inputTokens: usageInfo.usage?.total_input_tokens,
                outputTokens: usageInfo.usage?.total_output_tokens,
                totalTokens: usageInfo.usage?.total_tokens,
                summary,
            }
        });

    } catch (error: any) {
        console.error("Error generating summary:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}