import { motion } from "framer-motion";

interface HighlightItem {
  zh: string;
  en: string;
}

interface InvitationConfig {
  company: {
    name: string;
    nameEn?: string;
    logo: string;
    tagline: string;
    taglineEn?: string;
    website?: string;
  };
  event: {
    title: string;
    titleEn?: string;
    subtitle: string;
    subtitleEn?: string;
    date: string;
    dateEn?: string;
    time: string;
    weekday: string;
    weekdayEn?: string;
    location: string;
    locationEn?: string;
    address: string;
    description: string;
    descriptionEn?: string;
    highlights: HighlightItem[];
    dressCode: string;
    dressCodeEn?: string;
    contact: {
      name: string;
      nameEn?: string;
      email: string;
      phone: string;
    };
  };
}

interface GuestInfo {
  name: string;
  nameEn: string;
  email: string;
}

interface FlipCardProps {
  isFlipped: boolean;
  onFlip: () => void;
  config: InvitationConfig;
  guest?: GuestInfo | null;
}

export default function FlipCard({ isFlipped, onFlip, config, guest }: FlipCardProps) {
  const { company, event } = config;

  return (
    <div
      className="flip-card w-[340px] sm:w-[420px] h-[600px] sm:h-[680px] cursor-pointer"
      onClick={onFlip}
    >
      <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>
        {/* 卡片正面 - 主邀请信息 */}
        <div className="flip-card-front">
          <div className="w-full h-full bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl border border-gold-500/30 glow-gold overflow-hidden">
            {/* 顶部装饰 */}
            <div className="h-2 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

            {/* 角落装饰 */}
            <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-gold-500/50" />
            <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-gold-500/50" />
            <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-gold-500/50" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-gold-500/50" />

            <div className="p-6 sm:p-8 h-full flex flex-col items-center justify-center text-center">
              {/* 公司 Logo + 名称 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 text-center"
              >
                {company.logo && (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-16 sm:h-20 w-16 sm:w-20 rounded-full object-cover mx-auto mb-3 shadow-lg"
                  />
                )}
                <div className="text-gold-500 text-lg sm:text-xl tracking-[0.15em] font-serif-cn font-medium">
                  {company.name}
                </div>
                {company.nameEn && (
                  <div className="text-gold-500/60 text-xs tracking-[0.1em] mt-1 font-elegant">
                    {company.nameEn}
                  </div>
                )}
              </motion.div>

              {/* 装饰性分隔线 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold-500/50" />
                <svg
                  className="w-3 h-3 text-gold-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                </svg>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold-500/50" />
              </div>

              {/* 客人称呼 */}
              {guest?.name && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mb-3"
                >
                  <p className="text-gold-400 text-base tracking-wider font-serif-cn">
                    尊敬的 {guest.name}
                  </p>
                  {guest.nameEn && (
                    <p className="text-gold-500/50 text-xs font-elegant mt-0.5">
                      Dear {guest.nameEn}
                    </p>
                  )}
                </motion.div>
              )}

              {/* 邀请词 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-4"
              >
                <p className="text-slate-400 text-sm tracking-wider font-serif-cn">
                  诚挚邀请您出席
                </p>
                <p className="text-slate-500 text-xs tracking-wide font-elegant mt-1">
                  Cordially Invites You to Attend
                </p>
              </motion.div>

              {/* 活动标题 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-2"
              >
                <h1 className="gold-text text-2xl sm:text-3xl font-bold font-serif-cn">
                  {event.title}
                </h1>
                {event.titleEn && (
                  <p className="text-gold-500/60 text-sm mt-1 font-elegant">
                    {event.titleEn}
                  </p>
                )}
              </motion.div>

              {/* 副标题 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <p className="text-gold-500/70 text-base tracking-widest font-serif-cn">
                  {event.subtitle}
                </p>
                {event.subtitleEn && (
                  <p className="text-gold-500/40 text-xs mt-1 font-elegant">
                    {event.subtitleEn}
                  </p>
                )}
              </motion.div>

              {/* 日期时间 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass rounded-xl p-4 sm:p-5 mb-4 w-full"
              >
                <div className="flex flex-col items-center gap-1 mb-2">
                  <div className="flex items-center gap-2">
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
                    <span className="text-white font-medium text-base font-serif-cn">
                      {event.date}
                    </span>
                    <span className="text-slate-400 text-sm">({event.weekday})</span>
                  </div>
                  {event.dateEn && (
                    <span className="text-slate-500 text-xs font-elegant">
                      {event.dateEn} ({event.weekdayEn})
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-slate-300 font-serif-cn">{event.time}</span>
                </div>
              </motion.div>

              {/* 地点 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <p className="text-white font-medium font-serif-cn">{event.location}</p>
                {event.locationEn && (
                  <p className="text-slate-400 text-xs font-elegant">{event.locationEn}</p>
                )}
                <p className="text-slate-500 text-xs mt-1">{event.address}</p>
              </motion.div>

              {/* 翻转提示 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
              >
                <p className="text-gold-500/40 text-xs tracking-wider">
                  点击翻转查看详情
                </p>
                <p className="text-gold-500/30 text-[10px] font-elegant">
                  Tap to flip for details →
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 卡片背面 - 详细信息 */}
        <div className="flip-card-back">
          <div className="w-full h-full bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl border border-gold-500/30 glow-gold overflow-hidden">
            {/* 顶部装饰 */}
            <div className="h-2 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

            <div className="p-5 sm:p-6 h-full flex flex-col overflow-y-auto">
              {/* 标题 */}
              <div className="text-center mb-4">
                <h2 className="gold-text text-xl font-bold font-serif-cn">
                  活动详情
                </h2>
                <p className="text-gold-500/50 text-xs font-elegant">Event Details</p>
                <div className="w-16 h-px mx-auto mt-2 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
              </div>

              {/* 活动描述 */}
              <div className="mb-4">
                <p className="text-slate-300 text-xs leading-relaxed font-serif-cn mb-2">
                  {event.description}
                </p>
                {event.descriptionEn && (
                  <p className="text-slate-500 text-[10px] leading-relaxed font-elegant italic">
                    {event.descriptionEn}
                  </p>
                )}
              </div>

              {/* 活动亮点 */}
              <div className="mb-4">
                <h3 className="text-gold-500 text-xs font-medium mb-2 flex items-center gap-2 font-serif-cn">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                  </svg>
                  活动亮点 Highlights
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {event.highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex flex-col text-xs"
                    >
                      <div className="flex items-center gap-1.5 text-slate-300 font-serif-cn">
                        <span className="w-1 h-1 bg-gold-500 rounded-full flex-shrink-0" />
                        {highlight.zh}
                      </div>
                      <span className="text-slate-500 text-[10px] ml-2.5 font-elegant">
                        {highlight.en}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 着装要求 */}
              <div className="mb-4 glass rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gold-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                  <div>
                    <span className="text-slate-400 text-[10px]">着装要求 Dress Code</span>
                    <p className="text-white text-xs font-medium font-serif-cn">
                      {event.dressCode} {event.dressCodeEn && `/ ${event.dressCodeEn}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 联系方式 */}
              <div className="mt-auto">
                <h3 className="text-gold-500 text-xs font-medium mb-2 font-serif-cn">
                  如有疑问，请联系 Contact Us
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg
                      className="w-3 h-3 text-gold-500/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-serif-cn">{event.contact.name}</span>
                    {event.contact.nameEn && (
                      <span className="text-slate-500 font-elegant text-[10px]">
                        {event.contact.nameEn}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg
                      className="w-3 h-3 text-gold-500/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{event.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg
                      className="w-3 h-3 text-gold-500/70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{event.contact.phone}</span>
                  </div>
                </div>
              </div>

              {/* 返回提示 */}
              <div className="text-center mt-3">
                <p className="text-gold-500/40 text-[10px] tracking-wider">
                  ← 点击返回 Tap to flip back
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
