import { GoogleGenAI, Type } from "@google/genai";
import { DocType, Section } from '../types';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// OPTION 1: Paste your Gemini API Key directly here (Easier for local testing)
const HARDCODED_API_KEY = "AIzaSyB0QTCYneYOt4KaJ-l6KpHLIgjK3qOhzwA"; 

// OPTION 2: Use .env file (Recommended for security)
// Create a .env file in project root and add: VITE_API_KEY=your_key
// ------------------------------------------------------------------

// Helper to safely access env vars in Vite or standard node environments
const getApiKey = () => {
  // 1. Check hardcoded value first
  // We simply check if it has a value and isn't a generic placeholder instruction
  if (HARDCODED_API_KEY && !HARDCODED_API_KEY.includes("PASTE_YOUR")) {
    return HARDCODED_API_KEY;
  }

  try {
    // 2. Check for Vite environment variable
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
    // 3. Check for standard process.env (Node/Webpack)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing environment variables", e);
  }
  return undefined;
};

const apiKey = getApiKey();

if (!apiKey) {
  console.error("⚠️ GEMINI API KEY MISSING ⚠️");
  console.error("Please set const HARDCODED_API_KEY in services/geminiService.ts OR add VITE_API_KEY to your .env file.");
}

// Initialize with key or fallback to avoid immediate crash (calls will fail gracefully)
const ai = new GoogleGenAI({ apiKey: apiKey || 'MISSING_API_KEY' });
const modelId = 'gemini-2.5-flash';

export const generateOutline = async (topic: string, type: DocType, count?: number): Promise<string[]> => {
  if (!apiKey) {
    console.error("Cannot generate outline: API Key is missing.");
    return ["Error: API Key Missing", "Please open services/geminiService.ts", "Paste your key into HARDCODED_API_KEY"];
  }

  const itemType = type === DocType.DOCX ? 'section headers' : 'slide titles';
  
  const countInstruction = count 
    ? `Return a list of exactly ${count} ${itemType}.`
    : `Return a list of 5-8 ${itemType}.`;

  const prompt = `
    Act as a professional document structurer. 
    Create a structured outline for a ${type === DocType.DOCX ? 'Microsoft Word document' : 'PowerPoint presentation'} 
    about the following topic: "${topic}".
    
    ${countInstruction}
    The output must be a valid JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const text = response.text;
    if (!text) return ["Introduction", "Overview", "Key Points", "Conclusion"];
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to generate outline:", error);
    return ["Introduction", "Overview", "Key Points", "Conclusion"];
  }
};

export const generateSectionContent = async (
  topic: string, 
  sectionTitle: string, 
  type: DocType,
  context?: string
): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing. Please set HARDCODED_API_KEY in services/geminiService.ts";

  let systemInstruction = "";
  let formattingInstruction = "";

  if (type === DocType.PPTX) {
    systemInstruction = "You are an expert presentation designer creating content for slide decks.";
    formattingInstruction = `
      - Write 4-6 concise bullet points.
      - Start each point with a simple dash "- ".
      - Keep text punchy and impactful, suitable for a slide.
      - Do NOT use Markdown formatting (like **bold** or *italics*).
      - Do NOT use headers (##).
      - Do NOT use 'Slide 1' or similar prefixes.
      - Do NOT include the slide title in the output.
    `;
  } else {
    systemInstruction = "You are a professional business writer creating a formal report.";
    formattingInstruction = `
      - Write detailed professional prose in clear paragraphs.
      - Elaborate on the concepts deeply.
      - Do NOT use Markdown formatting (like **bold** or *italics*).
      - Do NOT use Markdown headers.
      - Use standard punctuation and capitalization.
      - Do NOT include the section title in the output.
    `;
  }

  const prompt = `
    ${systemInstruction}
    
    Topic: ${topic}
    Current Section Title: ${sectionTitle}
    
    ${context ? `Context from previous sections (for continuity):\n${context}\n` : ''}
    
    Task: Write the body content for this section.
    ${formattingInstruction}
    
    Return ONLY the content text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text?.trim() || "Failed to generate content.";
  } catch (error) {
    console.error("Failed to generate content:", error);
    return "Error generating content. Please check your API Key and network connection.";
  }
};

export const refineContent = async (
  currentContent: string,
  instruction: string,
  type: DocType
): Promise<string> => {
  if (!apiKey) return currentContent;

  const constraints = type === DocType.PPTX
    ? "Maintain a bullet-point format (using dashes '-'). Keep it concise. No Markdown (** or *)."
    : "Maintain professional prose in paragraphs. No Markdown (** or *).";

  const prompt = `
    Original Content:
    "${currentContent}"

    User Refinement Instruction:
    "${instruction}"

    Constraints:
    ${constraints}

    Task: Rewrite the content following the user's instruction and constraints. 
    Return only the plain text result.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text?.trim() || currentContent;
  } catch (error) {
    console.error("Failed to refine content:", error);
    return currentContent;
  }
};