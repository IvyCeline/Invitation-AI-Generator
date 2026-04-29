import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from "./prompt";

export interface ParsedInvitation {
  eventTitle: string;
  eventTitleEn: string;
  eventSubtitle: string;
  eventSubtitleEn: string;
  eventDateRaw: string;
  startTime: string;
  endTime: string;
  eventLocation: string;
  eventLocationEn: string;
  eventAddress: string;
  eventDescription: string;
  eventDescriptionEn: string;
  eventDressCode: string;
  eventDressCodeEn: string;
  highlight1: string;
  highlight1En: string;
  highlight2: string;
  highlight2En: string;
  highlight3: string;
  highlight3En: string;
  highlight4: string;
  highlight4En: string;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  raw: string;
}

export class LLMAgent {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
    this.baseURL = import.meta.env.VITE_OPENAI_API_BASE_URL || "https://api.openai.com/v1";
    this.model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.isConfigured()) {
      throw new Error("API密钥未配置。请在 .env 文件中设置 VITE_OPENAI_API_KEY。");
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API请求失败 (${response.status}): ${errorData?.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return {
      content,
      raw: JSON.stringify(data, null, 2),
    };
  }

  async generateInvitation(
    userMessage: string,
    conversationHistory: LLMMessage[] = []
  ): Promise<{ parsed: ParsedInvitation; assistantReply: string }> {
    const systemMsg: LLMMessage = { role: "system", content: SYSTEM_PROMPT };
    const userMsg: LLMMessage = { role: "user", content: USER_PROMPT_TEMPLATE(userMessage) };

    const messages: LLMMessage[] = [systemMsg, ...conversationHistory, userMsg];

    const response = await this.chat(messages);
    return {
      parsed: this.parseJSONResponse(response.content),
      assistantReply: response.content,
    };
  }

  private parseJSONResponse(content: string): ParsedInvitation {
    // Try to extract JSON from the response
    let jsonStr = content.trim();

    // Remove markdown code blocks if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Try to find JSON object in the content
    let json: any;
    try {
      json = JSON.parse(jsonStr);
    } catch {
      // Try to find JSON-like content
      const startIdx = jsonStr.indexOf("{");
      const endIdx = jsonStr.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        try {
          json = JSON.parse(jsonStr.slice(startIdx, endIdx + 1));
        } catch (e) {
          throw new Error("无法解析AI返回的数据，请稍后重试。");
        }
      } else {
        throw new Error("AI返回格式异常，请稍后重试。");
      }
    }

    // Validate required fields
    const requiredFields = [
      "eventTitle", "eventTitleEn", "eventSubtitle", "eventSubtitleEn",
      "eventDateRaw", "startTime", "endTime", "eventLocation", "eventLocationEn",
      "eventAddress", "eventDescription", "eventDescriptionEn",
      "eventDressCode", "eventDressCodeEn",
      "highlight1", "highlight1En", "highlight2", "highlight2En",
      "highlight3", "highlight3En", "highlight4", "highlight4En",
    ];

    const result: ParsedInvitation = {} as ParsedInvitation;
    for (const field of requiredFields) {
      result[field as keyof ParsedInvitation] = (json as any)[field] ?? "";
    }

    return result;
  }
}

export const llmAgent = new LLMAgent();
