import { PDFParse } from "pdf-parse";

export async function POST(req: Request) {

    let parse: PDFParse | undefined;

    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({ error: "No file uploaded." }), { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return new Response(JSON.stringify({ error: "Uploaded file is not a PDF." }), { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        const signature = new TextDecoder().decode(bytes.slice(0,4));

        if (signature !== "%PDF") {
            return new Response(JSON.stringify({ error: "Uploaded file is not a valid PDF." }), { status: 400 });
        }

        parse = new PDFParse({
            data: bytes,
        });

        const info = await parse.getInfo({ parsePageInfo: true});

        const result = await parse.getText();
        return Response.json({
            success: true,
            message: "PDF file processed successfully.",
            data: {
                fileName: file.name,
                size: file.size,
                pages: info.pages.length,
                type: file.type,
                extractedText: result.text,
                extractedTotalCharacters: result.text.length,
            }
        })

    } catch (error) {
        console.error("Error processing the uploaded file:", error);
        return new Response(JSON.stringify({ error: "Failed to process the uploaded file." }), { status: 500 });
    }
}