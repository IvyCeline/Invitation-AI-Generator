import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EventInfo {
  title: string;
  description: string;
  location: string;
  address: string;
  startDateTime: string;
  endDateTime: string;
}

interface CalendarButtonsProps {
  event: EventInfo;
}

export default function CalendarButtons({ event }: CalendarButtonsProps) {
  const [showMenu, setShowMenu] = useState(false);

  // 格式化为 ICS 日期格式 (YYYYMMDDTHHMMSS)
  const formatICSDate = (dateStr: string) => {
    return dateStr.replace(/[-:]/g, "").replace("T", "T");
  };

  // 生成 Google Calendar 链接
  const generateGoogleCalendarUrl = () => {
    const startDate = formatICSDate(event.startDateTime);
    const endDate = formatICSDate(event.endDateTime);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(`${event.location}, ${event.address}`);
    const title = encodeURIComponent(event.title);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  // 生成 Outlook 在线日历链接
  const generateOutlookUrl = () => {
    const startDate = event.startDateTime;
    const endDate = event.endDateTime;
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(`${event.location}, ${event.address}`);
    const title = encodeURIComponent(event.title);

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate}&enddt=${endDate}&body=${details}&location=${location}`;
  };

  // 生成 ICS 文件内容
  const generateICSContent = () => {
    const startDate = formatICSDate(event.startDateTime);
    const endDate = formatICSDate(event.endDateTime);
    const now = formatICSDate(new Date().toISOString().slice(0, 19));

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Company Invitation//CN
BEGIN:VEVENT
UID:${Date.now()}@company-invitation
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, "\\n")}
LOCATION:${event.location}, ${event.address}
END:VEVENT
END:VCALENDAR`;
  };

  // 下载 ICS 文件
  const downloadICS = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const calendarOptions = [
    {
      name: "Google 日历",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.5 22h-15A2.5 2.5 0 012 19.5v-15A2.5 2.5 0 014.5 2H6v1.5a.5.5 0 001 0V2h10v1.5a.5.5 0 001 0V2h1.5A2.5 2.5 0 0122 4.5v15a2.5 2.5 0 01-2.5 2.5zM4.5 4A.5.5 0 004 4.5v15a.5.5 0 00.5.5h15a.5.5 0 00.5-.5v-15a.5.5 0 00-.5-.5H18v.5a.5.5 0 01-1 0V4H7v.5a.5.5 0 01-1 0V4H4.5z" />
          <path d="M8 10h2v2H8zM8 14h2v2H8zM12 10h2v2h-2zM12 14h2v2h-2zM16 10h2v2h-2zM16 14h2v2h-2z" />
        </svg>
      ),
      action: () => {
        window.open(generateGoogleCalendarUrl(), "_blank");
        setShowMenu(false);
      },
    },
    {
      name: "Outlook",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V12zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.53v-3zm-3.5-5.25H2.75v1.5h6.5zm0 3H2.75v1.5h6.5zm0 3H2.75v1.5h6.5zm0-9H2.75v1.5h6.5z" />
        </svg>
      ),
      action: () => {
        window.open(generateOutlookUrl(), "_blank");
        setShowMenu(false);
      },
    },
    {
      name: "Apple 日历 (iCal)",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
        </svg>
      ),
      action: downloadICS,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn-outline flex items-center gap-2"
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
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="font-serif-cn">添加到日历</span>
        <svg
          className={`w-4 h-4 transition-transform ${showMenu ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* 下拉菜单 */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-56 z-50 bg-navy-800 border border-gold-500/30 rounded-lg shadow-xl overflow-hidden"
            >
              {calendarOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  className="w-full px-4 py-3 flex items-center gap-3 text-slate-300 hover:bg-gold-500/10 hover:text-gold-500 transition-colors text-left font-serif-cn"
                >
                  <span className="text-gold-500/70">{option.icon}</span>
                  {option.name}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

