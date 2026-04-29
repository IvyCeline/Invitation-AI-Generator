import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { EMAILJS_CONFIG } from "../config/emailjs";

// 客户信息
interface Guest {
  id: string;
  name: string;
  nameEn: string;
  email: string;
  status: 'pending' | 'sent' | 'error';
  link?: string;
}

// 活动信息（从 URL 或输入获取）
interface EventInfo {
  companyName: string;
  companyNameEn: string;
  eventTitle: string;
  eventTitleEn: string;
  eventDate: string;
  eventDateEn: string;
  eventTime: string;
  eventLocation: string;
  eventLocationEn: string;
  eventAddress: string;
  contactEmail: string;
  contactPhone: string;
  baseInviteLink: string; // 基础邀请链接（不含客户信息）
}

export default function GuestManager() {
  const [eventInfo, setEventInfo] = useState<EventInfo>({
    companyName: "",
    companyNameEn: "",
    eventTitle: "",
    eventTitleEn: "",
    eventDate: "",
    eventDateEn: "",
    eventTime: "",
    eventLocation: "",
    eventLocationEn: "",
    eventAddress: "",
    contactEmail: "",
    contactPhone: "",
    baseInviteLink: "",
  });
  
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState({ name: "", nameEn: "", email: "" });
  const [bulkInput, setBulkInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });

  // 初始化 EmailJS
  useMemo(() => {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }, []);

  // 添加单个客户
  const addGuest = () => {
    if (!newGuest.name || !newGuest.email) return;
    
    const guest: Guest = {
      id: Date.now().toString(),
      name: newGuest.name,
      nameEn: newGuest.nameEn || newGuest.name,
      email: newGuest.email,
      status: 'pending',
    };
    
    setGuests([...guests, guest]);
    setNewGuest({ name: "", nameEn: "", email: "" });
  };

  // 批量添加客户（格式：姓名,英文名,邮箱 每行一个）
  const addBulkGuests = () => {
    const lines = bulkInput.trim().split('\n');
    const newGuests: Guest[] = [];
    
    lines.forEach((line, index) => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        const [name, emailOrNameEn, maybeEmail] = parts;
        const email = maybeEmail || emailOrNameEn;
        const nameEn = maybeEmail ? emailOrNameEn : name;
        
        if (name && email && email.includes('@')) {
          newGuests.push({
            id: `${Date.now()}-${index}`,
            name,
            nameEn,
            email,
            status: 'pending',
          });
        }
      }
    });
    
    setGuests([...guests, ...newGuests]);
    setBulkInput("");
  };

  // 删除客户
  const removeGuest = (id: string) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  // 生成个性化邀请链接（如果 logo 是 URL 则保留，否则移除以缩短链接）
  const generateGuestLink = (guest: Guest): string => {
    if (!eventInfo.baseInviteLink) return "";
    
    // 解析基础链接
    const url = new URL(eventInfo.baseInviteLink);
    const baseData = url.searchParams.get('d');
    
    if (!baseData) return eventInfo.baseInviteLink;
    
    try {
      const config = JSON.parse(decodeURIComponent(baseData));
      
      // 判断 logo 是否是在线 URL（不是 base64）
      const logo = config.c?.l || "";
      const isLogoUrl = logo.startsWith("http");
      
      // 创建配置（如果 logo 是 URL 则保留，否则移除）
      const compactConfig = {
        c: {
          n: config.c?.n || "",
          ne: config.c?.ne || "",
          ...(isLogoUrl ? { l: logo } : {}), // 只有在线URL才保留
          t: config.c?.t || "",
          te: config.c?.te || "",
        },
        e: {
          t: config.e?.t || "",
          te: config.e?.te || "",
          s: config.e?.s || "",
          se: config.e?.se || "",
          d: config.e?.d || "",
          de: config.e?.de || "",
          tm: config.e?.tm || "",
          w: config.e?.w || "",
          we: config.e?.we || "",
          l: config.e?.l || "",
          le: config.e?.le || "",
          a: config.e?.a || "",
          dc: config.e?.dc || "",
          dce: config.e?.dce || "",
          cn: config.e?.cn || "",
          cne: config.e?.cne || "",
          ce: config.e?.ce || "",
          cp: config.e?.cp || "",
        },
        // 添加客户信息
        g: {
          n: guest.name,
          ne: guest.nameEn,
          e: guest.email,
        },
      };
      
      const newData = encodeURIComponent(JSON.stringify(compactConfig));
      return `${url.origin}${url.pathname}?d=${newData}`;
    } catch {
      return eventInfo.baseInviteLink;
    }
  };

  // 发送单个邀请邮件
  const sendInvitation = async (guest: Guest): Promise<boolean> => {
    const link = generateGuestLink(guest);
    
    const templateParams = {
      to_email: guest.email,
      guest_name: guest.name,
      guest_name_en: guest.nameEn,
      company_name: eventInfo.companyName,
      company_name_en: eventInfo.companyNameEn,
      event_title: eventInfo.eventTitle,
      event_title_en: eventInfo.eventTitleEn,
      event_date: eventInfo.eventDate,
      event_date_en: eventInfo.eventDateEn,
      event_time: eventInfo.eventTime,
      event_location: eventInfo.eventLocation,
      event_location_en: eventInfo.eventLocationEn,
      event_address: eventInfo.eventAddress,
      contact_email: eventInfo.contactEmail,
      contact_phone: eventInfo.contactPhone,
      invitation_link: link,
    };

    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );
      return true;
    } catch (error) {
      console.error("发送失败:", error);
      return false;
    }
  };

  // 批量发送邀请
  const sendAllInvitations = async () => {
    const pendingGuests = guests.filter(g => g.status === 'pending');
    if (pendingGuests.length === 0) return;
    
    setIsSending(true);
    setSendProgress({ current: 0, total: pendingGuests.length });

    for (let i = 0; i < pendingGuests.length; i++) {
      const guest = pendingGuests[i];
      const success = await sendInvitation(guest);
      
      setGuests(prev => prev.map(g => 
        g.id === guest.id 
          ? { ...g, status: success ? 'sent' : 'error', link: generateGuestLink(g) }
          : g
      ));
      
      setSendProgress({ current: i + 1, total: pendingGuests.length });
      
      // 延迟避免发送过快
      if (i < pendingGuests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsSending(false);
  };

  // 从基础链接解析活动信息
  const parseBaseLink = () => {
    if (!eventInfo.baseInviteLink) return;
    
    try {
      const url = new URL(eventInfo.baseInviteLink);
      const data = url.searchParams.get('d');
      if (!data) return;
      
      const config = JSON.parse(decodeURIComponent(data));
      
      setEventInfo(prev => ({
        ...prev,
        companyName: config.c?.n || prev.companyName,
        companyNameEn: config.c?.ne || prev.companyNameEn,
        eventTitle: config.e?.t || prev.eventTitle,
        eventTitleEn: config.e?.te || prev.eventTitleEn,
        eventDate: config.e?.d || prev.eventDate,
        eventDateEn: config.e?.de || prev.eventDateEn,
        eventTime: config.e?.tm || prev.eventTime,
        eventLocation: config.e?.l || prev.eventLocation,
        eventLocationEn: config.e?.le || prev.eventLocationEn,
        eventAddress: config.e?.a || prev.eventAddress,
        contactEmail: config.e?.ce || prev.contactEmail,
        contactPhone: config.e?.cp || prev.contactPhone,
      }));
    } catch (error) {
      console.error("解析链接失败:", error);
    }
  };

  const pendingCount = guests.filter(g => g.status === 'pending').length;
  const sentCount = guests.filter(g => g.status === 'sent').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 font-serif-cn">
            客户名单管理
          </h1>
          <p className="text-slate-400">管理客户名单，批量发送个性化邀请函</p>
          <div className="flex gap-4 justify-center mt-4">
            <a href="/generator" className="text-gold-500 text-sm hover:underline">
              ← 返回生成器
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：活动信息 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* 导入基础链接 */}
            <div className="bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
              <h2 className="text-xl font-bold text-gold-500 mb-4">1. 导入活动信息</h2>
              <p className="text-slate-400 text-sm mb-4">
                粘贴在生成器中创建的邀请函链接，系统会自动提取活动信息
              </p>
              <div className="space-y-3">
                <textarea
                  value={eventInfo.baseInviteLink}
                  onChange={(e) => setEventInfo({ ...eventInfo, baseInviteLink: e.target.value })}
                  placeholder="粘贴邀请函链接..."
                  rows={3}
                  className="w-full bg-navy-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 text-sm"
                />
                <button
                  onClick={parseBaseLink}
                  className="w-full px-4 py-2 bg-gold-500/20 border border-gold-500/30 rounded-lg text-gold-400 hover:bg-gold-500/30 transition-colors"
                >
                  解析链接
                </button>
              </div>
              
              {eventInfo.eventTitle && (
                <div className="mt-4 p-4 bg-navy-900 rounded-lg">
                  <p className="text-green-400 text-sm mb-2">✅ 已解析活动信息：</p>
                  <p className="text-white">{eventInfo.eventTitle}</p>
                  <p className="text-slate-400 text-sm">{eventInfo.eventDate} {eventInfo.eventTime}</p>
                  <p className="text-slate-400 text-sm">{eventInfo.eventLocation}</p>
                </div>
              )}
            </div>

            {/* 添加客户 */}
            <div className="bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
              <h2 className="text-xl font-bold text-gold-500 mb-4">2. 添加客户</h2>
              
              {/* 单个添加 */}
              <div className="space-y-3 mb-6">
                <p className="text-slate-400 text-sm">单个添加：</p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                    placeholder="姓名"
                    className="bg-navy-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 text-sm"
                  />
                  <input
                    type="text"
                    value={newGuest.nameEn}
                    onChange={(e) => setNewGuest({ ...newGuest, nameEn: e.target.value })}
                    placeholder="英文名(可选)"
                    className="bg-navy-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 text-sm"
                  />
                  <input
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    placeholder="邮箱"
                    className="bg-navy-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 text-sm"
                  />
                </div>
                <button
                  onClick={addGuest}
                  disabled={!newGuest.name || !newGuest.email}
                  className="w-full px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                >
                  + 添加客户
                </button>
              </div>
              
              {/* 批量添加 */}
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">批量添加（每行一位客户，格式：姓名,英文名,邮箱）：</p>
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="张三,Zhang San,zhangsan@email.com&#10;李四,Li Si,lisi@email.com"
                  rows={4}
                  className="w-full bg-navy-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 text-sm font-mono"
                />
                <button
                  onClick={addBulkGuests}
                  disabled={!bulkInput.trim()}
                  className="w-full px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                >
                  批量添加
                </button>
              </div>
            </div>
          </motion.div>

          {/* 右侧：客户列表和发送 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* 客户列表 */}
            <div className="bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gold-500">3. 客户列表</h2>
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-400">待发送: {pendingCount}</span>
                  <span className="text-green-400">已发送: {sentCount}</span>
                </div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {guests.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">暂无客户，请添加客户</p>
                ) : (
                  guests.map((guest) => (
                    <div
                      key={guest.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        guest.status === 'sent' 
                          ? 'bg-green-900/20 border border-green-500/30' 
                          : guest.status === 'error'
                          ? 'bg-red-900/20 border border-red-500/30'
                          : 'bg-navy-900 border border-slate-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate">{guest.name}</p>
                        <p className="text-slate-400 text-sm truncate">{guest.email}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {guest.status === 'sent' && (
                          <span className="text-green-400 text-xs">✓ 已发送</span>
                        )}
                        {guest.status === 'error' && (
                          <span className="text-red-400 text-xs">✗ 失败</span>
                        )}
                        {guest.status === 'pending' && (
                          <button
                            onClick={() => removeGuest(guest.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 发送按钮 */}
            <div className="bg-navy-800/50 rounded-2xl p-6 border border-gold-500/20">
              <h2 className="text-xl font-bold text-gold-500 mb-4">4. 发送邀请</h2>
              
              {!eventInfo.baseInviteLink ? (
                <p className="text-yellow-400 text-sm mb-4">⚠️ 请先导入邀请函链接</p>
              ) : pendingCount === 0 ? (
                <p className="text-slate-400 text-sm mb-4">没有待发送的客户</p>
              ) : (
                <div className="mb-4">
                  <p className="text-slate-400 text-sm">
                    将向 {pendingCount} 位客户发送个性化邀请函邮件
                  </p>
                  <p className="text-green-400 text-xs mt-1">
                    ✅ 邮件链接已优化（使用在线URL的Logo会保留，Base64的会移除）
                  </p>
                </div>
              )}

              {isSending && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">发送进度</span>
                    <span className="text-gold-400">{sendProgress.current}/{sendProgress.total}</span>
                  </div>
                  <div className="w-full bg-navy-900 rounded-full h-2">
                    <div 
                      className="bg-gold-500 h-2 rounded-full transition-all"
                      style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={sendAllInvitations}
                disabled={isSending || pendingCount === 0 || !eventInfo.baseInviteLink}
                className="w-full px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 font-bold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? `发送中... (${sendProgress.current}/${sendProgress.total})` : `发送邀请 (${pendingCount})`}
              </button>
              
              <p className="text-slate-500 text-xs mt-3 text-center">
                每封邮件间隔 1 秒发送，避免触发限制
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

