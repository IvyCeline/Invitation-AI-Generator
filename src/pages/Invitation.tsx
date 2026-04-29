import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FlipCard from "../components/FlipCard";
import RSVPModal from "../components/RSVPModal";
import CalendarButtons from "../components/CalendarButtons";
import BackgroundEffects from "../components/BackgroundEffects";

// 从URL解析邀请函配置
function parseInvitationFromURL(): any | null {
  const params = new URLSearchParams(window.location.search);
  const data = params.get("d");
  if (!data) return null;

  try {
    // 解码: decodeURIComponent -> JSON.parse
    const decoded = JSON.parse(decodeURIComponent(data));
    return {
      company: {
        name: decoded.c?.n || "",
        nameEn: decoded.c?.ne || "",
        logo: decoded.c?.l || "",
        tagline: decoded.c?.t || "",
        taglineEn: decoded.c?.te || "",
        website: decoded.c?.w || "",
      },
      event: {
        title: decoded.e?.t || "",
        titleEn: decoded.e?.te || "",
        subtitle: decoded.e?.s || "",
        subtitleEn: decoded.e?.se || "",
        date: decoded.e?.d || "",
        dateEn: decoded.e?.de || "",
        time: decoded.e?.tm || "",
        weekday: decoded.e?.w || "",
        weekdayEn: decoded.e?.we || "",
        location: decoded.e?.l || "",
        locationEn: decoded.e?.le || "",
        address: decoded.e?.a || "",
        description: decoded.e?.ds || "",
        descriptionEn: decoded.e?.dse || "",
        dressCode: decoded.e?.dc || "",
        dressCodeEn: decoded.e?.dce || "",
        highlights: (decoded.e?.h || []).map((h: any) => ({
          zh: h.z || "",
          en: h.e || "",
        })),
        contact: {
          name: decoded.e?.cn || "",
          nameEn: decoded.e?.cne || "",
          email: decoded.e?.ce || "",
          phone: decoded.e?.cp || "",
        },
        startDateTime: decoded.e?.st || "",
        endDateTime: decoded.e?.et || "",
      },
      // 客户信息（个性化邀请）
      guest: decoded.g ? {
        name: decoded.g.n || "",
        nameEn: decoded.g.ne || "",
        email: decoded.g.e || "",
      } : null,
    };
  } catch (error) {
    console.error("Failed to parse invitation data:", error);
    return null;
  }
}

export default function Invitation() {
  const [config, setConfig] = useState<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  useEffect(() => {
    const parsed = parseInvitationFromURL();
    if (parsed) {
      setConfig(parsed);
    }
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRSVPSubmit = (data: any) => {
    console.log("RSVP Submitted:", data);
    setRsvpSubmitted(true);
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">邀请函链接无效或已过期</p>
          <p className="text-slate-500 text-sm">请联系活动主办方获取正确的链接</p>
        </div>
      </div>
    );
  }

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
          <FlipCard isFlipped={isFlipped} onFlip={handleFlip} config={config} guest={config.guest} />
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

          <CalendarButtons event={config.event} />
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
                {config.company.name}
              </span>
              <span className="text-slate-500 text-xs tracking-[0.15em] font-elegant">
                {config.company.nameEn}
              </span>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/50" />
          </div>
          <p className="mt-3 text-slate-500 text-xs tracking-wider font-serif-cn">
            {config.company.tagline}
          </p>
          <p className="text-slate-600 text-[10px] tracking-wider font-elegant">
            {config.company.taglineEn}
          </p>
        </motion.div>

        {/* 版权信息 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-8 text-slate-600 text-xs"
        >
          © 2025 {config.company.name}. All rights reserved.
        </motion.p>
      </div>

      {/* RSVP 模态框 */}
      <AnimatePresence>
        {showRSVP && (
          <RSVPModal
            event={config.event}
            guest={config.guest}
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

