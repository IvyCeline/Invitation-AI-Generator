import { useState } from "react";
import { motion } from "framer-motion";

// Formspree 表单 ID（用于收集 RSVP 数据）
const FORMSPREE_FORM_ID = "xzzqgwgp";

interface EventInfo {
  title: string;
  date: string;
  time: string;
  location: string;
}

interface GuestInfo {
  name: string;
  nameEn: string;
  email: string;
}

interface RSVPModalProps {
  event: EventInfo;
  guest?: GuestInfo | null;  // 预填的客户信息
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    attending: boolean;
    guests: number;
    dietaryRequirements?: string;
    message?: string;
  }) => void;
  onClose: () => void;
  submitted: boolean;
}

export default function RSVPModal({
  event,
  guest,
  onSubmit,
  onClose,
  submitted,
}: RSVPModalProps) {
  // 如果有预填的客户信息，使用它
  const [formData, setFormData] = useState({
    name: guest?.name || "",
    email: guest?.email || "",
    phone: "",
    attending: true,
    guests: 1,
    dietaryRequirements: "",
    message: "",
  });
  
  // 是否为个性化邀请（预填了客户信息）
  const isPersonalized = !!guest?.email;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 构建专业的邮件内容
      const attendingStatus = formData.attending ? "✅ 确认出席" : "❌ 无法出席";
      const currentTime = new Date().toLocaleString("zh-CN", { 
        timeZone: "Australia/Sydney",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });

      // 提交到 Formspree
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _subject: `📩 RSVP回复 | ${formData.name} ${attendingStatus}`,
          
          "═══════════════════════════": "═══════════════════════════",
          "📋 活动信息 EVENT INFO": "",
          "活动名称": event.title,
          "活动日期": event.date,
          "活动时间": event.time,
          "活动地点": event.location,
          
          "═══════════════════════════ ": "═══════════════════════════",
          "👤 嘉宾信息 GUEST INFO": "",
          "姓名 Name": formData.name,
          "邮箱 Email": formData.email,
          "电话 Phone": formData.phone || "未填写",
          
          "═══════════════════════════  ": "═══════════════════════════",
          "📝 出席详情 RSVP DETAILS": "",
          "出席状态 Status": attendingStatus,
          "出席人数 Guests": formData.attending ? `${formData.guests} 人` : "N/A",
          "饮食要求 Dietary": formData.dietaryRequirements || "无特殊要求",
          "留言 Message": formData.message || "无",
          
          "═══════════════════════════   ": "═══════════════════════════",
          "⏰ 提交时间": currentTime + " (Sydney Time)",
        }),
      });

      if (response.ok) {
        onSubmit(formData);
      } else {
        setError("提交失败，请稍后重试");
      }
    } catch (err) {
      console.error("Network Error:", err);
      setError("网络错误，请检查网络连接");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {submitted ? (
          /* 提交成功状态 */
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-8 text-center border border-gold-500/30 glow-gold">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2 font-serif-cn">
              感谢您的回复！
            </h3>
            <p className="text-slate-400 mb-6 font-serif-cn">
              我们期待与您相见
            </p>
            <p className="text-slate-500 text-sm mb-6 font-serif-cn">
              确认邮件已发送至您的邮箱
            </p>
            <button onClick={onClose} className="btn-outline">
              关闭
            </button>
          </div>
        ) : (
          /* RSVP 表单 */
          <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl border border-gold-500/30 glow-gold overflow-hidden">
            {/* 顶部装饰 */}
            <div className="h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

            {/* 头部 */}
            <div className="p-6 border-b border-gold-500/10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="gold-text text-xl font-bold font-serif-cn">
                    确认出席
                  </h2>
                  <p className="text-slate-400 text-sm mt-1 font-serif-cn">
                    {event.title}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 活动信息摘要 */}
              <div className="mt-4 glass rounded-lg p-3 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <svg
                    className="w-4 h-4 text-gold-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-serif-cn">{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <svg
                    className="w-4 h-4 text-gold-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="font-serif-cn">{event.location}</span>
                </div>
              </div>
            </div>

            {/* 表单内容 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 是否出席 */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, attending: true })}
                  className={`flex-1 py-3 rounded-lg border transition-all font-serif-cn ${
                    formData.attending
                      ? "bg-gold-500/20 border-gold-500 text-gold-500"
                      : "border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    欣然出席
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, attending: false, guests: 0 })
                  }
                  className={`flex-1 py-3 rounded-lg border transition-all font-serif-cn ${
                    !formData.attending
                      ? "bg-slate-500/20 border-slate-400 text-slate-300"
                      : "border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    无法出席
                  </span>
                </button>
              </div>

              {/* 个性化邀请时显示欢迎信息 */}
              {isPersonalized && (
                <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg">
                  <p className="text-gold-400 text-sm font-serif-cn">
                    尊敬的 {guest?.name}，欢迎确认出席
                  </p>
                  <p className="text-slate-400 text-xs mt-1">{guest?.email}</p>
                </div>
              )}

              {/* 姓名 - 个性化邀请时显示为只读 */}
              {!isPersonalized && (
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5 font-serif-cn">
                    姓名 <span className="text-gold-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="invitation-input w-full"
                    placeholder="请输入您的姓名"
                  />
                </div>
              )}

              {/* 邮箱 - 个性化邀请时显示为只读 */}
              {!isPersonalized && (
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5 font-serif-cn">
                    邮箱 <span className="text-gold-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="invitation-input w-full"
                    placeholder="your@email.com"
                  />
                </div>
              )}

              {/* 电话 */}
              <div>
                <label className="block text-slate-400 text-sm mb-1.5 font-serif-cn">
                  联系电话 {!isPersonalized && "(可选)"}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="invitation-input w-full"
                  placeholder="+61 xxx xxx xxx"
                />
              </div>

              {/* 随行人数 - 仅在出席时显示 */}
              {formData.attending && (
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5 font-serif-cn">
                    出席人数
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          guests: Math.max(1, formData.guests - 1),
                        })
                      }
                      className="w-10 h-10 rounded-lg border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-white text-lg font-medium w-8 text-center">
                      {formData.guests}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          guests: Math.min(5, formData.guests + 1),
                        })
                      }
                      className="w-10 h-10 rounded-lg border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-slate-500 text-sm font-serif-cn">
                      人
                    </span>
                  </div>
                </div>
              )}

              {/* 饮食要求 - 仅在出席时显示 */}
              {formData.attending && (
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5 font-serif-cn">
                    饮食要求（可选）
                  </label>
                  <input
                    type="text"
                    value={formData.dietaryRequirements}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dietaryRequirements: e.target.value,
                      })
                    }
                    className="invitation-input w-full"
                    placeholder="如素食、过敏等"
                  />
                </div>
              )}

              {/* 留言 */}
              <div>
                <label className="block text-slate-400 text-sm mb-1.5 font-serif-cn">
                  留言（可选）
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="invitation-input w-full h-20 resize-none"
                  placeholder="您想说些什么..."
                />
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* 提交按钮 */}
              <button 
                type="submit" 
                className="btn-gold w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    提交中...
                  </span>
                ) : (
                  formData.attending ? "确认出席" : "确认无法出席"
                )}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

