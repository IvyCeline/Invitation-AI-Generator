import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { llmAgent, ParsedInvitation, LLMMessage } from "../agent/llm";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  parsedData?: ParsedInvitation;
  error?: string;
}

interface AIChatProps {
  onApplyData: (data: ParsedInvitation) => void;
}

const EXAMPLE_PROMPTS = [
  "帮我生成一个年终晚宴邀请函，12月25日在悉尼四季酒店",
  "Generate an annual meeting invitation for next Friday",
  "创建一个新品发布会邀请函，11月15日，北京国际会议中心",
  "2026年度客户答谢晚宴，1月20日，墨尔本皇冠酒店，商务正装",
];

export default function AIChat({ onApplyData }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `您好！我是您的AI邀请函助手。

请告诉我您想要举办的活动基本信息，例如：

• "帮我生成一个年终晚宴邀请函，12月25日在悉尼四季酒店"
• "2026年度客户答谢晚宴，1月20日，墨尔本皇冠酒店"

我会自动识别活动类型，生成：
✅ 活动名称（中英文）
✅ 活动描述和亮点
✅ 着装要求
✅ 时间地点等基本信息

生成后可随时调整，直到您满意后再应用。`,
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExamples, setShowExamples] = useState(true);

  // 多轮对话历史（不含 system 消息）
  const [conversationHistory, setConversationHistory] = useState<LLMMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isConfigured = llmAgent.isConfigured();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversationHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");
    setShowExamples(false);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: "assistant", content: "" },
    ]);

    try {
      const result = await llmAgent.generateInvitation(
        userMessage.content,
        conversationHistory
      );

      // 将对话加入历史（用户消息 + assistant回复）
      const newHistory: LLMMessage[] = [
        ...conversationHistory,
        { role: "user", content: userMessage.content },
        { role: "assistant", content: result.assistantReply },
      ];
      setConversationHistory(newHistory);

      const summaryMsg =
        result.parsed.eventTitle
          ? `已生成：「${result.parsed.eventTitle}」
请查看下方预览，确认内容无误后点击「✅ 确认应用」将其填入表单。
如需调整，可直接输入修改意见，我会重新生成。`
          : "已生成内容，请查看下方预览，确认无误后点击「✅ 确认应用」。";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: summaryMsg,
                parsedData: result.parsed,
              }
            : msg
        )
      );
    } catch (err: any) {
      const errorMsg = err.message || "生成失败，请稍后重试。";
      setError(errorMsg);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "", error: errorMsg }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    setShowExamples(false);
  };

  const handleApply = (data: ParsedInvitation) => {
    onApplyData(data);
    // 应用后清除对话历史，重新开始
    setConversationHistory([]);
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          "内容已应用到表单中！您可以在左侧表单中查看和手动调整，或继续描述新活动需求。",
      },
    ]);
  };

  // 重置对话
  const handleReset = () => {
    setConversationHistory([]);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `好的，已重新开始！请描述您想要举办的下一场活动，我会为您生成邀请函内容。`,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-navy-900/50 rounded-2xl border border-gold-500/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gold-500/10 bg-navy-800/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <svg
                className="w-5 h-5 text-navy-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-navy-800" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm font-serif-cn">
              AI 智能生成
            </h3>
            <p className="text-slate-500 text-xs">
              {isConfigured ? (
                <span className="text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  {conversationHistory.length > 0
                    ? `对话中 · ${Math.floor(conversationHistory.length / 2)} 轮`
                    : "服务就绪"}
                </span>
              ) : (
                <span className="text-yellow-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full inline-block" />
                  未配置API密钥
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 重置按钮 */}
        {conversationHistory.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded border border-slate-700 hover:border-slate-600 cursor-pointer"
            title="重新开始"
          >
            🗑️ 新对话
          </button>
        )}
      </div>

      {/* Not configured warning */}
      {!isConfigured && (
        <div className="mx-4 mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-xs leading-relaxed">
            <strong>⚠️ 尚未配置AI密钥</strong>
            <br />
            请在项目根目录创建 <code className="bg-yellow-900/40 px-1 rounded">.env</code> 文件，添加以下内容：
            <br />
            <code className="bg-yellow-900/40 px-1 rounded mt-1 inline-block">
              VITE_OPENAI_API_KEY=sk-你的密钥
            </code>
            <br />
            支持 OpenAI / 兼容 API（DeepSeek、Groq 等）
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 rounded-br-md"
                  : msg.error
                  ? "bg-red-900/30 border border-red-500/30 text-red-300 rounded-bl-md"
                  : "bg-navy-800/60 border border-gold-500/15 text-slate-300 rounded-bl-md"
              }`}
            >
              {/* User avatar */}
              {msg.role === "user" && (
                <div className="flex items-center gap-2 mb-2 text-navy-800/70 text-xs">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>您</span>
                </div>
              )}

              {/* Content */}
              <div className="whitespace-pre-wrap font-serif-cn">{msg.content}</div>

              {/* Parsed data preview */}
              {msg.parsedData && !msg.error && (
                <div className="mt-4 space-y-3">
                  <div className="border-t border-gold-500/20 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-navy-900/50 rounded-lg p-2.5">
                        <p className="text-slate-500 mb-0.5">活动名称</p>
                        <p className="text-gold-400 font-medium">{msg.parsedData.eventTitle}</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {msg.parsedData.eventTitleEn}
                        </p>
                      </div>
                      <div className="bg-navy-900/50 rounded-lg p-2.5">
                        <p className="text-slate-500 mb-0.5">日期 & 时间</p>
                        <p className="text-white text-xs">{msg.parsedData.eventDateRaw}</p>
                        <p className="text-slate-400 text-xs">
                          {msg.parsedData.startTime} - {msg.parsedData.endTime}
                        </p>
                      </div>
                      <div className="bg-navy-900/50 rounded-lg p-2.5">
                        <p className="text-slate-500 mb-0.5">活动地点</p>
                        <p className="text-white text-xs">{msg.parsedData.eventLocation}</p>
                        <p className="text-slate-400 text-xs">
                          {msg.parsedData.eventLocationEn}
                        </p>
                      </div>
                      <div className="bg-navy-900/50 rounded-lg p-2.5">
                        <p className="text-slate-500 mb-0.5">着装要求</p>
                        <p className="text-white text-xs">{msg.parsedData.eventDressCode}</p>
                        <p className="text-slate-400 text-xs">
                          {msg.parsedData.eventDressCodeEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {[
                    msg.parsedData.highlight1,
                    msg.parsedData.highlight2,
                    msg.parsedData.highlight3,
                    msg.parsedData.highlight4,
                  ].some(Boolean) && (
                    <div className="bg-navy-900/30 rounded-lg p-2.5">
                      <p className="text-slate-500 text-xs mb-2">活动亮点</p>
                      <div className="space-y-1">
                        {[
                          { zh: msg.parsedData.highlight1, en: msg.parsedData.highlight1En },
                          { zh: msg.parsedData.highlight2, en: msg.parsedData.highlight2En },
                          { zh: msg.parsedData.highlight3, en: msg.parsedData.highlight3En },
                          { zh: msg.parsedData.highlight4, en: msg.parsedData.highlight4En },
                        ]
                          .filter((h) => h.zh)
                          .map((h, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <span className="text-gold-500 mt-0.5 flex-shrink-0">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                              <span className="text-slate-300">{h.zh}</span>
                              <span className="text-slate-500">· {h.en}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApply(msg.parsedData!)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold text-sm rounded-lg hover:from-green-500 hover:to-green-600 transition-all shadow-lg shadow-green-900/30 cursor-pointer"
                    >
                      ✅ 确认应用
                    </button>
                    <button
                      onClick={() => {
                        setInput("请把活动名称改为XXX，地点改为YYY，其他地方也相应调整一下");
                        setShowExamples(false);
                      }}
                      className="flex-1 py-2.5 bg-navy-700 border border-gold-500/30 text-gold-400 font-semibold text-sm rounded-lg hover:bg-navy-600 hover:border-gold-500/50 transition-all cursor-pointer"
                    >
                      🔄 调整内容
                    </button>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {msg.role === "assistant" && msg.content === "" && !msg.error && (
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-xs">AI 正在生成...</span>
                </div>
              )}

              {/* Error indicator */}
              {msg.error && (
                <div className="mt-2 text-xs text-red-400">错误: {msg.error}</div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Example prompts */}
        <AnimatePresence>
          {showExamples && isConfigured && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className="text-slate-500 text-xs pl-1">试试这样说：</p>
              {EXAMPLE_PROMPTS.map((example, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleExampleClick(example)}
                  className="block w-full text-left px-3 py-2.5 bg-navy-800/40 border border-gold-500/10 rounded-xl text-slate-400 text-xs hover:bg-navy-800 hover:border-gold-500/30 hover:text-slate-200 transition-all cursor-pointer"
                >
                  <span className="text-gold-500/60 mr-2">·</span>
                  {example}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gold-500/10 bg-navy-800/30">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isConfigured
                ? conversationHistory.length > 0
                  ? "描述修改意见，比如'把时间改到晚上7点'..."
                  : "描述您想要的邀请函..."
                : "配置API密钥后可使用AI功能"
            }
            disabled={!isConfigured || isLoading}
            className="flex-1 bg-navy-900/60 border border-gold-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConfigured || isLoading || !input.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 font-bold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
