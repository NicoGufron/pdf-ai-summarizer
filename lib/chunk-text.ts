export function chunkText(
    text: string,
    maxChars: number = 3000,
    overlap: number = 300
): string[] {
    const chunks: string[] = [];

    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + maxChars, text.length);

        const chunk = text.slice(start, end).trim();

        if (chunk) {
            chunks.push(chunk);
        }

        if (end === text.length) {
            break;
        }

        start = end - overlap;
    }

    return chunks;
}