import { GoogleGenAI } from "@google/genai";
import { DocumentChunk } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

// We use the same instance management pattern to ensure we use the latest key
let genAI: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenAI({ apiKey });
};

/**
 * Calculates cosine similarity between two vectors
 */
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Generates an embedding for a given text using gemini-001 (text-embedding-004)
 */
export const getEmbedding = async (text: string): Promise<number[]> => {
  if (!genAI) throw new Error("API Key not set");
  
  // text-embedding-004 is the recommended model for embeddings
  const response = await genAI.models.embedContent({
    model: "text-embedding-004",
    content: {
      parts: [{ text }],
    },
  });

  const embedding = response.embeddings?.[0]?.values;
  if (!embedding) throw new Error("Failed to generate embedding");
  
  return embedding;
};

/**
 * Performs RAG: 
 * 1. Embeds query
 * 2. Finds top relevant chunks
 * 3. Calls generation model with context
 */
export const generateRAGResponse = async (
  query: string, 
  knowledgeBase: DocumentChunk[]
): Promise<string> => {
  if (!genAI) throw new Error("API Key not set");
  if (knowledgeBase.length === 0) {
    return "I currently have no documents loaded in my knowledge base. Please ask the Admin to upload some training material.";
  }

  // 1. Embed Query
  const queryVector = await getEmbedding(query);

  // 2. Vector Search (Simple in-memory linear scan for demo purposes)
  // In a real production app, use a Vector DB (Pinecone, Chroma, etc.)
  const scoredChunks = knowledgeBase.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryVector, chunk.embedding)
  }));

  // Sort by similarity and take top 3
  scoredChunks.sort((a, b) => b.score - a.score);
  const topChunks = scoredChunks.slice(0, 4).filter(c => c.score > 0.45); // Threshold for relevance

  // 3. Construct Prompt
  const contextText = topChunks.map(c => c.chunk.text).join("\n\n---\n\n");
  
  console.log("RAG Context Found:", topChunks.length, "chunks");

  const fullPrompt = `
Context Information:
${contextText}

User Question: ${query}

Remember strict instructions: Short bullet points, only from context.
`;

  // 4. Generate Answer
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [{ text: fullPrompt }]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.3, // Low temp for factual consistency
    }
  });

  return response.text || "I apologize, I couldn't generate a response.";
};
