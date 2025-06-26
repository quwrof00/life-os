import { CohereClientV2 } from "cohere-ai";

const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

export const embedText = async (texts: string[]): Promise<number[][]> => {
  const response = await cohere.embed({
    texts,
    model: "embed-english-v3.0",
    inputType: "search_document",
    embeddingTypes: ["float"],
  });

  const embeddings = response.embeddings?.float;
  if (!Array.isArray(embeddings) || embeddings.length !== texts.length) {
    throw new Error("Invalid or missing embeddings in response");
  }
  return embeddings;
};

// export const runChatCompletion = async (prompt:string, context:string) => {
//   const systemPrompt = `You are an AI assistant in an ongoing casual conversation. Reply naturally, match the user's tone, and flow with the chat. Never repeat old points or ask for the same info.`;
//   const fullPrompt = `${systemPrompt}\n\n${context}\n\nUser: ${prompt}`;
//   console.log(fullPrompt);
  
//   const result = await ai.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
//   });

//   if (!result.text) throw new Error("No response from Gemini");
//   return result.text;
// };
