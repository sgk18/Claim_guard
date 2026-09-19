import { OCRProvider } from "./ocr";
import { MockOCRProvider } from "./ocr/mock";
import { BedrockVisionOCRProvider } from "./ocr/bedrockVision";
import { AIProvider } from "./ai";
import { MockAIProvider } from "./ai/mock";
import { BedrockAIProvider } from "./ai/bedrock";

// CLAIMGUARD_MOCK_MODE defaults to mock so local dev and demos work without
// AWS credentials. Set it to "false" once AWS_REGION / AWS_BEDROCK_MODEL_ID
// are configured to switch to real Bedrock-vision OCR + Bedrock explanations.
// (src/services/ocr/textract.ts is a working Textract-based OCR alternative,
// kept but not wired in by default -- swap it in via this factory if needed.)
function isMockMode(): boolean {
  return process.env.CLAIMGUARD_MOCK_MODE !== "false";
}

let ocrProvider: OCRProvider | null = null;
export function getOCRProvider(): OCRProvider {
  if (!ocrProvider) {
    ocrProvider = isMockMode() ? new MockOCRProvider() : new BedrockVisionOCRProvider();
  }
  return ocrProvider;
}

let aiProvider: AIProvider | null = null;
export function getAIProvider(): AIProvider {
  if (!aiProvider) {
    aiProvider = isMockMode() ? new MockAIProvider() : new BedrockAIProvider();
  }
  return aiProvider;
}
