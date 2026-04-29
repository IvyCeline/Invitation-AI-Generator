import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FlipCard from "../components/FlipCard";
import RSVPModal from "../components/RSVPModal";
import CalendarButtons from "../components/CalendarButtons";
import BackgroundEffects from "../components/BackgroundEffects";

// ========================================
// 邀请函配置 - 海侨汇通 GQC Australia
// ========================================
export const invitationConfig = {
  company: {
    name: "海侨汇通",
    nameEn: "GQC AUSTRALIA PTY LTD",
    logo: "/logo.png",
    tagline: "专业 · 诚信 · 共赢",
    taglineEn: "Professional · Integrity · Win-Win",
    website: "https://www.gqcaustralia.com.au/",
  },
  event: {
    title: "2025年度答谢晚宴",
    titleEn: "2025 Annual Appreciation Gala",
    subtitle: "携手共赢 · 共创未来",
    subtitleEn: "Together We Thrive · Building the Future",
    date: "2025年12月20日",
    dateEn: "20 December 2025",
    time: "18:00 - 22:00",
    weekday: "星期六",
    weekdayEn: "Saturday",
    location: "悉尼四季酒店",
    locationEn: "Four Seasons Hotel Sydney",
    address: "199 George St, Sydney NSW 2000",
    description:
      "海侨汇通诚挚邀请您出席2025年度答谢晚宴。感谢您一直以来对我们的信任与支持，让我们共同回顾过去一年的成就，展望未来的无限可能。晚宴将提供精致餐点及精彩表演。",
    descriptionEn:
      "GQC Australia cordially invites you to our 2025 Annual Appreciation Gala. Thank you for your continued trust and support. Join us as we celebrate the achievements of the past year and look forward to endless possibilities. The evening will feature fine dining and entertainment.",
    highlights: [
      { zh: "年度业绩回顾", en: "Annual Review" },
      { zh: "2026展望规划", en: "2026 Outlook" },
      { zh: "客户答谢颁奖", en: "Client Awards" },
      { zh: "精致晚宴美食", en: "Fine Dining" },
    ],
    dressCode: "商务正装",
    dressCodeEn: "Business Attire",
    contact: {
      name: "活动组委会",
      nameEn: "Event Committee",
      email: "info@gqcaustralia.com.au",
      phone: "+61 2 8888 8888",
    },
    startDateTime: "2025-12-20T18:00:00",
    endDateTime: "2025-12-20T22:00:00",
  },
};

export default function Home() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRSVPSubmit = (data: {
    name: string;
    email: string;
    phone: string;
    attending: boolean;
    guests: number;
    dietaryRequirements?: string;
    message?: string;
  }) => {
    console.log("RSVP 提交数据:", data);
    setRsvpSubmitted(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* 顶部特别邀请标识 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 glass rounded-full">
            <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
            <span className="text-gold-500/80 text-sm font-light tracking-[0.3em] uppercase">
              特别邀请
            </span>
            <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
          </div>
        </motion.div>

        {/* 翻转邀请卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <FlipCard
            isFlipped={isFlipped}
            onFlip={handleFlip}
            config={invitationConfig}
          />
        </motion.div>

        {/* 翻转提示按钮 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={handleFlip}
          className="mt-8 flex items-center gap-2 text-gold-500/60 hover:text-gold-500 transition-colors group"
        >
          <svg
            className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-sm tracking-wide font-serif-cn">
            {isFlipped ? "返回正面 / Flip Back" : "翻转查看详情 / Flip for Details"}
          </span>
        </motion.button>

        {/* 操作按钮区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4"
        >
          <button
            onClick={() => setShowRSVP(true)}
            className="btn-gold flex items-center gap-2 text-lg"
          >
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            确认出席 RSVP
          </button>

          <CalendarButtons event={invitationConfig.event} />
        </motion.div>

        {/* 底部公司信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/50" />
            <div className="text-center">
              <span className="text-slate-400 text-sm tracking-[0.2em] font-serif-cn block">
                {invitationConfig.company.name}
              </span>
              <span className="text-slate-500 text-xs tracking-[0.15em] font-elegant">
                {invitationConfig.company.nameEn}
              </span>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/50" />
          </div>
          <p className="mt-3 text-slate-500 text-xs tracking-wider font-serif-cn">
            {invitationConfig.company.tagline}
          </p>
          <p className="text-slate-600 text-[10px] tracking-wider font-elegant">
            {invitationConfig.company.taglineEn}
          </p>
        </motion.div>

        {/* 版权信息 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-8 text-slate-600 text-xs"
        >
          © 2025 {invitationConfig.company.name}. All rights reserved.
        </motion.p>
      </div>

      {/* RSVP 模态框 */}
      <AnimatePresence>
        {showRSVP && (
          <RSVPModal
            event={invitationConfig.event}
            onSubmit={handleRSVPSubmit}
            onClose={() => {
              setShowRSVP(false);
              if (rsvpSubmitted) {
                setRsvpSubmitted(false);
              }
            }}
            submitted={rsvpSubmitted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

