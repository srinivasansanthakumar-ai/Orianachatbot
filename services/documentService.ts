import { DocumentChunk, UploadedFile } from "../types";
import { getEmbedding } from "./geminiService";

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Simple text chunker
 * Splits text into chunks of ~500 characters with some overlap
 */
const chunkText = (text: string, chunkSize: number = 500, overlap: number = 50): string[] => {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
};

export const processFile = async (
  file: File, 
  onProgress: (msg: string) => void
): Promise<{ chunks: DocumentChunk[], fileInfo: UploadedFile }> => {
  
  onProgress(`Reading ${file.name}...`);
  let textContent = "";

  // Basic handling for text based files. 
  // Note: True PDF/PPT parsing requires heavy libraries like pdfjs-dist which are hard to bundle in a single-file react demo.
  // We will assume the user uploads text content or we do a basic binary read.
  try {
    if (file.type === "application/pdf") {
         onProgress("Note: PDF detected. Attempting raw text extraction. For best results, convert to .txt");
         // Fallback to reading as text (works for some raw formats, but ideally needs pdf.js)
         textContent = await file.text(); 
    } else {
        textContent = await file.text();
    }
  } catch (e) {
    throw new Error("Failed to read file content");
  }

  if (!textContent || textContent.trim().length === 0) {
      throw new Error("File appears empty or content could not be read.");
  }

  onProgress(`Chunking text...`);
  const rawChunks = chunkText(textContent);
  const chunks: DocumentChunk[] = [];

  onProgress(`Vectorizing ${rawChunks.length} chunks (this may take a moment)...`);
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < rawChunks.length; i++) {
    const chunkText = rawChunks[i];
    try {
      const embedding = await getEmbedding(chunkText);
      chunks.push({
        id: generateId(),
        sourceFile: file.name,
        text: chunkText,
        embedding
      });
      // Small delay to be gentle on the API
      await new Promise(r => setTimeout(r, 100)); 
    } catch (err) {
      console.error(`Failed to embed chunk ${i}`, err);
    }
  }

  // Create file info even if some chunks failed, as long as file was read
  const fileInfo: UploadedFile = {
    name: file.name,
    size: file.size,
    type: file.type,
    processed: true,
    chunksCount: chunks.length
  };

  return { chunks, fileInfo };
};