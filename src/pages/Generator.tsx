import { useState, useCallback, memo, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AIChat from "../components/AIChat";
import { ParsedInvitation } from "../agent/llm";

// 压缩并裁剪为圆形
function compressToCircle(imageDataUrl: string, size: number = 80): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      canvas.width = size;
      canvas.height = size;
      
      // 居中裁剪为正方形
      const srcSize = Math.min(img.width, img.height);
      const srcX = (img.width - srcSize) / 2;
      const srcY = (img.height - srcSize) / 2;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 圆形裁剪
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // 绘制图片
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);
      
      resolve(canvas.toDataURL("image/png", 0.9));
    };
    img.src = imageDataUrl;
  });
}

// 免费翻译API (MyMemory)
async function translateToEnglish(text: string): Promise<string> {
  if (!text.trim()) return "";
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=zh-CN|en`
    );
    const data = await response.json();
    return data.responseData?.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

// 日期格式化工具
const weekdaysCN = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const weekdaysEN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthsEN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDateCN(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateEN(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getDate()} ${monthsEN[date.getMonth()]} ${date.getFullYear()}`;
}

function getWeekdayCN(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return weekdaysCN[date.getDay()];
}

function getWeekdayEN(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return weekdaysEN[date.getDay()];
}

interface FormData {
  companyName: string;
  companyNameEn: string;
  companyLogo: string;
  companyTagline: string;
  companyTaglineEn: string;
  companyWebsite: string;
  eventTitle: string;
  eventTitleEn: string;
  eventSubtitle: string;
  eventSubtitleEn: string;
  eventDateRaw: string; // ISO 日期 YYYY-MM-DD
  eventDate: string;
  eventDateEn: string;
  eventTime: string;
  eventWeekday: string;
  eventWeekdayEn: string;
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
  contactName: string;
  contactNameEn: string;
  contactEmail: string;
  contactPhone: string;
  startTime: string;
  endTime: string;
}

const defaultFormData: FormData = {
  companyName: "海侨汇通",
  companyNameEn: "GQC AUSTRALIA PTY LTD",
  companyLogo: "",
  companyTagline: "专业 · 诚信 · 共赢",
  companyTaglineEn: "Professional · Integrity · Win-Win",
  companyWebsite: "",
  eventTitle: "",
  eventTitleEn: "",
  eventSubtitle: "",
  eventSubtitleEn: "",
  eventDateRaw: "",
  eventDate: "",
  eventDateEn: "",
  eventTime: "",
  eventWeekday: "",
  eventWeekdayEn: "",
  eventLocation: "",
  eventLocationEn: "",
  eventAddress: "",
  eventDescription: "",
  eventDescriptionEn: "",
  eventDressCode: "商务正装",
  eventDressCodeEn: "Business Attire",
  highlight1: "",
  highlight1En: "",
  highlight2: "",
  highlight2En: "",
  highlight3: "",
  highlight3En: "",
  highlight4: "",
  highlight4En: "",
  contactName: "活动组委会",
  contactNameEn: "Event Committee",
  contactEmail: "",
  contactPhone: "",
  startTime: "18:00",
  endTime: "22:00",
};

// 独立的输入框组件
interface InputFieldProps {
  label: string;
  labelEn?: string;
  value: string;
  valueEn?: string;
  onChange: (value: string) => void;
  onChangeEn?: (value: string) => void;
  onTranslate?: () => void;
  isTranslating?: boolean;
  placeholder?: string;
  placeholderEn?: string;
  type?: string;
  rows?: number;
  hasEnglish?: boolean;
  disabled?: boolean;
}

const InputField = memo(function InputField({
  label,
  labelEn,
  value,
  valueEn,
  onChange,
  onChangeEn,
  onTranslate,
  isTranslating,
  placeholder,
  placeholderEn,
  type = "text",
  rows,
  hasEnglish = false,
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-slate-300 text-sm font-medium">
        {label} {labelEn && <span className="text-slate-500 text-xs">({labelEn})</span>}
      </label>
      <div className="flex gap-2">
        <div className="flex-1">
          {rows ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              className="w-full bg-navy-800 border border-gold-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full bg-navy-800 border border-gold-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          )}
        </div>
        {hasEnglish && onTranslate && (
          <button
            type="button"
            onClick={onTranslate}
            disabled={isTranslating}
            className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-colors text-xs disabled:opacity-50 whitespace-nowrap"
          >
            {isTranslating ? "翻译中..." : "翻译"}
          </button>
        )}
      </div>
      {hasEnglish && onChangeEn && (
        <input
          type={type}
          value={valueEn || ""}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder={placeholderEn || "English translation"}
          disabled={disabled}
          className="w-full bg-navy-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 placeholder-slate-600 focus:outline-none focus:border-slate-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
      )}
    </div>
  );
});

export default function Generator() {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isTranslating, setIsTranslating] = useState<Record<string, boolean>>({});
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const aiPanelRef = useRef<HTMLDivElement>(null);

  // Apply AI-generated data to form
  const handleApplyAIData = useCallback((data: ParsedInvitation) => {
    setFormData((prev) => ({
      ...prev,
      eventTitle: data.eventTitle || prev.eventTitle,
      eventTitleEn: data.eventTitleEn || prev.eventTitleEn,
      eventSubtitle: data.eventSubtitle || prev.eventSubtitle,
      eventSubtitleEn: data.eventSubtitleEn || prev.eventSubtitleEn,
      eventDateRaw: data.eventDateRaw || prev.eventDateRaw,
      startTime: data.startTime || prev.startTime,
      endTime: data.endTime || prev.endTime,
      eventLocation: data.eventLocation || prev.eventLocation,
      eventLocationEn: data.eventLocationEn || prev.eventLocationEn,
      eventAddress: data.eventAddress || prev.eventAddress,
      eventDescription: data.eventDescription || prev.eventDescription,
      eventDescriptionEn: data.eventDescriptionEn || prev.eventDescriptionEn,
      eventDressCode: data.eventDressCode || prev.eventDressCode,
      eventDressCodeEn: data.eventDressCodeEn || prev.eventDressCodeEn,
      highlight1: data.highlight1 || prev.highlight1,
      highlight1En: data.highlight1En || prev.highlight1En,
      highlight2: data.highlight2 || prev.highlight2,
      highlight2En: data.highlight2En || prev.highlight2En,
      highlight3: data.highlight3 || prev.highlight3,
      highlight3En: data.highlight3En || prev.highlight3En,
      highlight4: data.highlight4 || prev.highlight4,
      highlight4En: data.highlight4En || prev.highlight4En,
    }));
    // Update date fields if date was provided
    if (data.eventDateRaw) {
      setFormData((prev) => ({
        ...prev,
        eventDate: formatDateCN(data.eventDateRaw),
        eventDateEn: formatDateEN(data.eventDateRaw),
        eventWeekday: getWeekdayCN(data.eventDateRaw),
        eventWeekdayEn: getWeekdayEN(data.eventDateRaw),
      }));
    }
    setShowAIPanel(false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 为每个字段创建稳定的回调函数
  const fieldHandlers = useMemo(() => ({
    companyName: (v: string) => setFormData(p => ({ ...p, companyName: v })),
    companyNameEn: (v: string) => setFormData(p => ({ ...p, companyNameEn: v })),
    companyTagline: (v: string) => setFormData(p => ({ ...p, companyTagline: v })),
    companyTaglineEn: (v: string) => setFormData(p => ({ ...p, companyTaglineEn: v })),
    companyLogo: (v: string) => setFormData(p => ({ ...p, companyLogo: v })),
    companyWebsite: (v: string) => setFormData(p => ({ ...p, companyWebsite: v })),
    eventTitle: (v: string) => setFormData(p => ({ ...p, eventTitle: v })),
    eventTitleEn: (v: string) => setFormData(p => ({ ...p, eventTitleEn: v })),
    eventSubtitle: (v: string) => setFormData(p => ({ ...p, eventSubtitle: v })),
    eventSubtitleEn: (v: string) => setFormData(p => ({ ...p, eventSubtitleEn: v })),
    eventLocation: (v: string) => setFormData(p => ({ ...p, eventLocation: v })),
    eventLocationEn: (v: string) => setFormData(p => ({ ...p, eventLocationEn: v })),
    eventAddress: (v: string) => setFormData(p => ({ ...p, eventAddress: v })),
    eventDescription: (v: string) => setFormData(p => ({ ...p, eventDescription: v })),
    eventDescriptionEn: (v: string) => setFormData(p => ({ ...p, eventDescriptionEn: v })),
    eventDressCode: (v: string) => setFormData(p => ({ ...p, eventDressCode: v })),
    eventDressCodeEn: (v: string) => setFormData(p => ({ ...p, eventDressCodeEn: v })),
    highlight1: (v: string) => setFormData(p => ({ ...p, highlight1: v })),
    highlight1En: (v: string) => setFormData(p => ({ ...p, highlight1En: v })),
    highlight2: (v: string) => setFormData(p => ({ ...p, highlight2: v })),
    highlight2En: (v: string) => setFormData(p => ({ ...p, highlight2En: v })),
    highlight3: (v: string) => setFormData(p => ({ ...p, highlight3: v })),
    highlight3En: (v: string) => setFormData(p => ({ ...p, highlight3En: v })),
    highlight4: (v: string) => setFormData(p => ({ ...p, highlight4: v })),
    highlight4En: (v: string) => setFormData(p => ({ ...p, highlight4En: v })),
    contactName: (v: string) => setFormData(p => ({ ...p, contactName: v })),
    contactNameEn: (v: string) => setFormData(p => ({ ...p, contactNameEn: v })),
    contactEmail: (v: string) => setFormData(p => ({ ...p, contactEmail: v })),
    contactPhone: (v: string) => setFormData(p => ({ ...p, contactPhone: v })),
    startTime: (v: string) => setFormData(p => ({ ...p, startTime: v })),
    endTime: (v: string) => setFormData(p => ({ ...p, endTime: v })),
  }), []);

  // 处理日期选择
  const handleDateChange = useCallback((dateStr: string) => {
    if (!dateStr) {
      setFormData((prev) => ({
        ...prev,
        eventDateRaw: "",
        eventDate: "",
        eventDateEn: "",
        eventWeekday: "",
        eventWeekdayEn: "",
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      eventDateRaw: dateStr,
      eventDate: formatDateCN(dateStr),
      eventDateEn: formatDateEN(dateStr),
      eventWeekday: getWeekdayCN(dateStr),
      eventWeekdayEn: getWeekdayEN(dateStr),
    }));
  }, []);

  // 翻译单个字段
  const translateField = useCallback(async (chineseField: keyof FormData, englishField: keyof FormData) => {
    const chineseText = formData[chineseField];
    if (!chineseText) return;

    setIsTranslating((prev) => ({ ...prev, [englishField]: true }));
    try {
      const translated = await translateToEnglish(chineseText);
      setFormData((prev) => ({ ...prev, [englishField]: translated }));
    } finally {
      setIsTranslating((prev) => ({ ...prev, [englishField]: false }));
    }
  }, [formData]);

  // 一键翻译所有
  const handleTranslateAll = async () => {
    setIsTranslatingAll(true);
    const fieldsToTranslate: [keyof FormData, keyof FormData][] = [
      ["companyName", "companyNameEn"],
      ["companyTagline", "companyTaglineEn"],
      ["eventTitle", "eventTitleEn"],
      ["eventSubtitle", "eventSubtitleEn"],
      ["eventLocation", "eventLocationEn"],
      ["eventDescription", "eventDescriptionEn"],
      ["eventDressCode", "eventDressCodeEn"],
      ["highlight1", "highlight1En"],
      ["highlight2", "highlight2En"],
      ["highlight3", "highlight3En"],
      ["highlight4", "highlight4En"],
      ["contactName", "contactNameEn"],
    ];

    for (const [zh, en] of fieldsToTranslate) {
      if (formData[zh] && !formData[en]) {
        setIsTranslating((prev) => ({ ...prev, [en]: true }));
        try {
          const translated = await translateToEnglish(formData[zh]);
          setFormData((prev) => ({ ...prev, [en]: translated }));
        } finally {
          setIsTranslating((prev) => ({ ...prev, [en]: false }));
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    setIsTranslatingAll(false);
  };

  // 生成邀请函链接
  const generateLink = useCallback(() => {
    // 构建开始和结束时间
    const startDateTime = formData.eventDateRaw && formData.startTime 
      ? `${formData.eventDateRaw}T${formData.startTime}:00` 
      : "";
    const endDateTime = formData.eventDateRaw && formData.endTime 
      ? `${formData.eventDateRaw}T${formData.endTime}:00` 
      : "";

    // 检查 logo 是否为 base64 且过大
    let logoToUse = formData.companyLogo;
    if (formData.companyLogo.startsWith("data:") && formData.companyLogo.length > 5000) {
      // Logo 太大，尝试进一步压缩或警告用户
      const confirmUse = window.confirm(
        `Logo 图片较大（${Math.round(formData.companyLogo.length / 1024)}KB），可能导致链接过长。\n\n` +
        `建议：\n` +
        `1. 使用更小的 logo 图片\n` +
        `2. 或使用在线 logo URL\n\n` +
        `是否仍要继续生成？`
      );
      if (!confirmUse) return;
    }

    const config = {
      c: {
        n: formData.companyName,
        ne: formData.companyNameEn,
        l: logoToUse,
        t: formData.companyTagline,
        te: formData.companyTaglineEn,
        w: formData.companyWebsite,
      },
      e: {
        t: formData.eventTitle,
        te: formData.eventTitleEn,
        s: formData.eventSubtitle,
        se: formData.eventSubtitleEn,
        d: formData.eventDate,
        de: formData.eventDateEn,
        tm: `${formData.startTime} - ${formData.endTime}`,
        w: formData.eventWeekday,
        we: formData.eventWeekdayEn,
        l: formData.eventLocation,
        le: formData.eventLocationEn,
        a: formData.eventAddress,
        ds: formData.eventDescription,
        dse: formData.eventDescriptionEn,
        dc: formData.eventDressCode,
        dce: formData.eventDressCodeEn,
        h: [
          { z: formData.highlight1, e: formData.highlight1En },
          { z: formData.highlight2, e: formData.highlight2En },
          { z: formData.highlight3, e: formData.highlight3En },
          { z: formData.highlight4, e: formData.highlight4En },
        ].filter((h) => h.z),
        cn: formData.contactName,
        cne: formData.contactNameEn,
        ce: formData.contactEmail,
        cp: formData.contactPhone,
        st: startDateTime,
        et: endDateTime,
      },
    };

    try {
      const jsonStr = JSON.stringify(config);
      // 使用 encodeURIComponent 直接编码整个 JSON 字符串
      const encoded = encodeURIComponent(jsonStr);
      const baseUrl =
        import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") ||
        window.location.origin;
      const link = `${baseUrl}/invite?d=${encoded}`;
      
      // 检查 URL 长度
      if (link.length > 8000) {
        alert(
          `⚠️ 生成的链接过长（${link.length} 字符）\n\n` +
          `这可能会导致在某些浏览器或平台上无法正常打开。\n\n` +
          `建议：\n` +
          `1. 使用在线 logo URL 代替上传图片\n` +
          `2. 或减少其他内容的长度`
        );
      }
      
      setGeneratedLink(link);
    } catch (error) {
      console.error("生成链接失败:", error);
      alert("生成链接失败，请检查输入内容");
    }
  }, [formData]);

  // 复制链接
  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedLink]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 font-serif-cn">
            邀请函生成器
          </h1>
          <p className="text-slate-400">填写以下信息，自动生成邀请函链接</p>
          <div className="flex gap-4 justify-center mt-2">
            <a href="/" className="text-gold-500 text-sm hover:underline">
              ← 返回预览
            </a>
            <a href="/guests" className="text-blue-400 text-sm hover:underline">
              📧 客户名单管理 →
            </a>
          </div>
          {/* AI 助手切换按钮 */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                showAIPanel
                  ? "bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 shadow-lg shadow-gold-500/25"
                  : "bg-navy-800 border border-gold-500/30 text-gold-400 hover:border-gold-500/60 hover:bg-navy-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {showAIPanel ? "关闭 AI 助手" : "✨ AI 智能生成"}
            </button>
          </div>
        </motion.div>

        {/* AI 助手面板 */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.div
              ref={aiPanelRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <div className="h-[520px]">
                <AIChat onApplyData={handleApplyAIData} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 一键翻译按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-center"
        >
          <button
            type="button"
            onClick={handleTranslateAll}
            disabled={isTranslatingAll}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslatingAll ? "🔄 正在翻译..." : "🌐 一键翻译所有中文为英文"}
          </button>
          <p className="text-slate-500 text-xs mt-2">
            提示：先填写完所有中文内容，再点击翻译按钮
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* 公司信息 */}
          <div className="bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
            <h2 className="text-xl font-bold text-gold-500 mb-4 font-serif-cn">
              📋 公司信息 Company Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="公司名称"
                labelEn="Company Name"
                value={formData.companyName}
                valueEn={formData.companyNameEn}
                onChange={fieldHandlers.companyName}
                onChangeEn={fieldHandlers.companyNameEn}
                onTranslate={() => translateField("companyName", "companyNameEn")}
                isTranslating={isTranslating.companyNameEn}
                placeholder="例：海侨汇通"
                hasEnglish
              />
              <InputField
                label="公司标语"
                labelEn="Tagline"
                value={formData.companyTagline}
                valueEn={formData.companyTaglineEn}
                onChange={fieldHandlers.companyTagline}
                onChangeEn={fieldHandlers.companyTaglineEn}
                onTranslate={() => translateField("companyTagline", "companyTaglineEn")}
                isTranslating={isTranslating.companyTaglineEn}
                placeholder="例：专业 · 诚信 · 共赢"
                hasEnglish
              />
              {/* Logo 设置 */}
              <div className="md:col-span-2 space-y-3">
                <label className="block text-slate-300 text-sm font-medium">
                  公司Logo <span className="text-green-400 text-xs">（推荐使用在线URL，链接更短！）</span>
                </label>
                
                {/* 两种方式选择 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 方式1: 在线URL（推荐） */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="px-2 py-0.5 bg-green-600/20 text-green-400 rounded">推荐</span>
                      <span>方式一：使用在线URL</span>
                    </div>
                    <input
                      type="url"
                      value={formData.companyLogo.startsWith("http") ? formData.companyLogo : ""}
                      onChange={(e) => fieldHandlers.companyLogo(e.target.value)}
                      placeholder="https://your-website.com/logo.png"
                      className="w-full bg-navy-800 border border-green-500/30 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                    />
                    <p className="text-slate-500 text-[10px]">
                      💡 将 logo 上传到公司网站或图床（如 Imgur），粘贴图片链接
                    </p>
                  </div>
                  
                  {/* 方式2: 上传文件 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 rounded">备选</span>
                      <span>方式二：上传文件（会增加链接长度）</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div 
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-navy-800 border border-gold-500/30 border-dashed rounded-lg cursor-pointer hover:border-gold-500 transition-colors"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/gif"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string;
                              if (base64) {
                                compressToCircle(base64, 80).then((processed) => {
                                  fieldHandlers.companyLogo(processed);
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }}
                        />
                        <div className="text-center">
                          <svg className="w-5 h-5 mx-auto text-gold-500/50 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-slate-400 text-xs">
                            {formData.companyLogo && !formData.companyLogo.startsWith("http") ? "✅ 已上传" : "上传图片"}
                          </span>
                        </div>
                      </div>
                      
                      {/* 预览 */}
                      <div className="text-center">
                        {formData.companyLogo ? (
                          <div className="relative">
                            <img 
                              src={formData.companyLogo} 
                              alt="Logo" 
                              className="h-12 w-12 rounded-full object-cover border border-gold-500/30"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "";
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => fieldHandlers.companyLogo("")}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center hover:bg-red-400"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-slate-700/50 flex items-center justify-center">
                            <span className="text-slate-600 text-[10px]">无</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Logo 类型提示 */}
                {formData.companyLogo && (
                  <div className={`text-xs px-3 py-2 rounded-lg ${
                    formData.companyLogo.startsWith("http") 
                      ? "bg-green-900/30 text-green-400 border border-green-500/20" 
                      : "bg-yellow-900/30 text-yellow-400 border border-yellow-500/20"
                  }`}>
                    {formData.companyLogo.startsWith("http") 
                      ? "✅ 使用在线URL - 链接将非常短！" 
                      : `⚠️ 使用Base64编码 - 将增加约 ${Math.round(formData.companyLogo.length / 1024)}KB 链接长度`
                    }
                  </div>
                )}
              </div>
              <InputField
                label="公司网站"
                value={formData.companyWebsite}
                onChange={fieldHandlers.companyWebsite}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* 活动信息 */}
          <div className="bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
            <h2 className="text-xl font-bold text-gold-500 mb-4 font-serif-cn">
              🎉 活动信息 Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="活动名称"
                labelEn="Event Title"
                value={formData.eventTitle}
                valueEn={formData.eventTitleEn}
                onChange={fieldHandlers.eventTitle}
                onChangeEn={fieldHandlers.eventTitleEn}
                onTranslate={() => translateField("eventTitle", "eventTitleEn")}
                isTranslating={isTranslating.eventTitleEn}
                placeholder="例：2025年度答谢晚宴"
                hasEnglish
              />
              <InputField
                label="活动副标题"
                labelEn="Subtitle"
                value={formData.eventSubtitle}
                valueEn={formData.eventSubtitleEn}
                onChange={fieldHandlers.eventSubtitle}
                onChangeEn={fieldHandlers.eventSubtitleEn}
                onTranslate={() => translateField("eventSubtitle", "eventSubtitleEn")}
                isTranslating={isTranslating.eventSubtitleEn}
                placeholder="例：携手共赢 · 共创未来"
                hasEnglish
              />
              
              {/* 日期选择器 */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-sm font-medium">
                      📅 选择活动日期
                    </label>
                    <input
                      type="date"
                      value={formData.eventDateRaw}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full bg-navy-800 border border-gold-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-sm font-medium">
                      中文日期 <span className="text-slate-500 text-xs">(自动生成)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.eventDate}
                      readOnly
                      placeholder="选择日期后自动生成"
                      className="w-full bg-navy-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                    />
                    <input
                      type="text"
                      value={formData.eventWeekday}
                      readOnly
                      placeholder="星期"
                      className="w-full bg-navy-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-500 text-sm cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-sm font-medium">
                      English Date <span className="text-slate-500 text-xs">(Auto)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.eventDateEn}
                      readOnly
                      placeholder="Auto-generated"
                      className="w-full bg-navy-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                    />
                    <input
                      type="text"
                      value={formData.eventWeekdayEn}
                      readOnly
                      placeholder="Weekday"
                      className="w-full bg-navy-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-500 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* 时间选择 */}
              <div className="space-y-2">
                <label className="block text-slate-300 text-sm font-medium">
                  ⏰ 开始时间
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => fieldHandlers.startTime(e.target.value)}
                  className="w-full bg-navy-800 border border-gold-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-300 text-sm font-medium">
                  ⏰ 结束时间
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => fieldHandlers.endTime(e.target.value)}
                  className="w-full bg-navy-800 border border-gold-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <InputField
                label="活动地点"
                labelEn="Location"
                value={formData.eventLocation}
                valueEn={formData.eventLocationEn}
                onChange={fieldHandlers.eventLocation}
                onChangeEn={fieldHandlers.eventLocationEn}
                onTranslate={() => translateField("eventLocation", "eventLocationEn")}
                isTranslating={isTranslating.eventLocationEn}
                placeholder="例：悉尼四季酒店"
                hasEnglish
              />
              <InputField
                label="详细地址"
                value={formData.eventAddress}
                onChange={fieldHandlers.eventAddress}
                placeholder="例：199 George St, Sydney NSW 2000"
              />
            </div>
            <div className="mt-4">
              <InputField
                label="活动描述"
                labelEn="Description"
                value={formData.eventDescription}
                valueEn={formData.eventDescriptionEn}
                onChange={fieldHandlers.eventDescription}
                onChangeEn={fieldHandlers.eventDescriptionEn}
                onTranslate={() => translateField("eventDescription", "eventDescriptionEn")}
                isTranslating={isTranslating.eventDescriptionEn}
                placeholder="活动详细介绍..."
                rows={3}
                hasEnglish
              />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="着装要求"
                labelEn="Dress Code"
                value={formData.eventDressCode}
                valueEn={formData.eventDressCodeEn}
                onChange={fieldHandlers.eventDressCode}
                onChangeEn={fieldHandlers.eventDressCodeEn}
                onTranslate={() => translateField("eventDressCode", "eventDressCodeEn")}
                isTranslating={isTranslating.eventDressCodeEn}
                placeholder="例：商务正装"
                hasEnglish
              />
            </div>
          </div>

          {/* 活动亮点 */}
          <div className="bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
            <h2 className="text-xl font-bold text-gold-500 mb-4 font-serif-cn">
              ⭐ 活动亮点 Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="亮点 1"
                value={formData.highlight1}
                valueEn={formData.highlight1En}
                onChange={fieldHandlers.highlight1}
                onChangeEn={fieldHandlers.highlight1En}
                onTranslate={() => translateField("highlight1", "highlight1En")}
                isTranslating={isTranslating.highlight1En}
                placeholder="例：年度业绩回顾"
                hasEnglish
              />
              <InputField
                label="亮点 2"
                value={formData.highlight2}
                valueEn={formData.highlight2En}
                onChange={fieldHandlers.highlight2}
                onChangeEn={fieldHandlers.highlight2En}
                onTranslate={() => translateField("highlight2", "highlight2En")}
                isTranslating={isTranslating.highlight2En}
                placeholder="例：2026展望规划"
                hasEnglish
              />
              <InputField
                label="亮点 3"
                value={formData.highlight3}
                valueEn={formData.highlight3En}
                onChange={fieldHandlers.highlight3}
                onChangeEn={fieldHandlers.highlight3En}
                onTranslate={() => translateField("highlight3", "highlight3En")}
                isTranslating={isTranslating.highlight3En}
                placeholder="例：客户答谢颁奖"
                hasEnglish
              />
              <InputField
                label="亮点 4"
                value={formData.highlight4}
                valueEn={formData.highlight4En}
                onChange={fieldHandlers.highlight4}
                onChangeEn={fieldHandlers.highlight4En}
                onTranslate={() => translateField("highlight4", "highlight4En")}
                isTranslating={isTranslating.highlight4En}
                placeholder="例：精致晚宴美食"
                hasEnglish
              />
            </div>
          </div>

          {/* 联系方式 */}
          <div className="bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
            <h2 className="text-xl font-bold text-gold-500 mb-4 font-serif-cn">
              📞 联系方式 Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="联系人"
                labelEn="Contact Name"
                value={formData.contactName}
                valueEn={formData.contactNameEn}
                onChange={fieldHandlers.contactName}
                onChangeEn={fieldHandlers.contactNameEn}
                onTranslate={() => translateField("contactName", "contactNameEn")}
                isTranslating={isTranslating.contactNameEn}
                placeholder="例：活动组委会"
                hasEnglish
              />
              <InputField
                label="联系邮箱"
                value={formData.contactEmail}
                onChange={fieldHandlers.contactEmail}
                placeholder="例：info@example.com"
                type="email"
              />
              <InputField
                label="联系电话"
                value={formData.contactPhone}
                onChange={fieldHandlers.contactPhone}
                placeholder="例：+61 2 8888 8888"
              />
            </div>
          </div>

          {/* 生成按钮 */}
          <div className="text-center space-y-4">
            <button
              type="button"
              onClick={generateLink}
              className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 font-bold text-lg rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg shadow-gold-500/25 cursor-pointer"
            >
              ✨ 生成邀请函链接
            </button>

            {generatedLink && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-navy-800 rounded-xl p-4 border border-gold-500/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-400 text-sm">✅ 链接生成成功！</p>
                  <p className={`text-xs ${generatedLink.length > 8000 ? 'text-red-400' : generatedLink.length > 4000 ? 'text-yellow-400' : 'text-slate-500'}`}>
                    链接长度: {generatedLink.length} 字符
                    {generatedLink.length > 8000 && ' ⚠️ 过长'}
                    {generatedLink.length > 4000 && generatedLink.length <= 8000 && ' ⚠️ 较长'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 bg-navy-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-gold-500 text-navy-900 hover:bg-gold-400"
                    }`}
                  >
                    {copied ? "✓ 已复制" : "复制"}
                  </button>
                </div>
                {generatedLink.length > 4000 && (
                  <p className="mt-2 text-yellow-400/80 text-xs">
                    💡 提示：如果链接太长无法分享，请尝试使用在线 logo URL（如公司网站上的 logo）代替上传图片
                  </p>
                )}
                <div className="mt-3 flex gap-4 justify-center">
                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-500 text-sm hover:underline"
                  >
                    🔗 在新窗口预览
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

