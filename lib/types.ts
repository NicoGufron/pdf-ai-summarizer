type PDFData = {
  fileName: string;
  size: number;
  type: string;
  pages: string;
  extractedText: string;
  extractedTotalCharacters: number;
};

type GoogleGenAIData = {
    tokensUsed: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    summary: string;
}