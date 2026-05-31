import { AIExplanation } from '../types';
import { getAnthropicKey, getOpenAIKey } from './storage';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert code analyst. When given a code snippet, provide:
1. A clear explanation of what the code does
2. A short one-sentence summary
3. 2-3 specific improvement suggestions

Always respond in this exact JSON format:
{
  "explanation": "Detailed explanation here...",
  "summary": "One sentence summary",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

export const explainWithAnthropic = async (
  code: string,
  language: string,
  apiKey: string
): Promise<AIExplanation> => {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';
  return parseAIResponse(text);
};

export const explainWithOpenAI = async (
  code: string,
  language: string,
  apiKey: string
): Promise<AIExplanation> => {
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  return parseAIResponse(text);
};

const parseAIResponse = (text: string): AIExplanation => {
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      explanation: text,
      summary: 'AI analysis complete.',
      suggestions: [],
    };
  }
};

export const generateExplanation = async (
  code: string,
  language: string,
  provider: 'anthropic' | 'openai'
): Promise<AIExplanation> => {
  if (provider === 'anthropic') {
    const key = await getAnthropicKey();
    if (!key) throw new Error('No Anthropic API key configured. Please add it in Settings.');
    return await explainWithAnthropic(code, language, key);
  } else {
    const key = await getOpenAIKey();
    if (!key) throw new Error('No OpenAI API key configured. Please add it in Settings.');
    return await explainWithOpenAI(code, language, key);
  }
};
