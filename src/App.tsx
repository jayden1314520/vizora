import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type IconName =
  | 'home' | 'spark' | 'folder' | 'user' | 'image' | 'video' | 'store'
  | 'arrow' | 'plus' | 'upload' | 'play' | 'clock' | 'wand' | 'chevron'
  | 'search' | 'bell' | 'settings';

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-7h6v7"/></>,
    spark: <><path d="m12 3 1.8 4.8L19 10l-5.2 2.2L12 17l-1.8-4.8L5 10l5.2-2.2L12 3Z"/><path d="m19 16 .7 1.8L22 19l-2.3 1.2L19 22l-.7-1.8L16 19l2.3-1.2L19 16Z"/></>,
    folder: <path d="M3 6.5h6l2 2h10v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5Z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m4 17 4-4 3 3 3-3 6 6"/></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="3"/><path d="m17 10 4-2v8l-4-2"/></>,
    store: <><path d="M4 10v10h16V10"/><path d="M3 10 5 4h14l2 6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 20v-5h6v5"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 15v5h16v-5"/></>,
    play: <path d="m9 6 9 6-9 6V6Z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    wand: <><path d="m4 20 11-11"/><path d="m14 4 1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"/><path d="m18 12 .7-1.5.8 1.5 1.5.8-1.5.7-.8 1.5-.7-1.5-1.5-.7 1.5-.8Z"/></>,
    chevron: <path d="m9 6 6 6-6 6"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function HeroOrbitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const drawEllipse = (cx: number, cy: number, rx: number, ry: number, rotation: number, opacity: number) => {
      context.beginPath();
      context.ellipse(cx, cy, rx, ry, rotation, 0, Math.PI * 2);
      context.strokeStyle = `rgba(167, 186, 128, ${opacity})`;
      context.lineWidth = 1;
      context.stroke();
    };
    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const cx = Math.min(width - 85, width * .4 + 85);
      const cy = Math.min(height - 85, height * .26 + 85);
      const rxOne = Math.min(width * .47, 250);
      const ryOne = Math.min(height * .24, 95);
      const rxTwo = Math.min(width * .61, 320);
      const ryTwo = Math.min(height * .39, 155);
      const rotationOne = -.44 + time * Math.PI * 2 / 24000;
      const rotationTwo = .31 - time * Math.PI * 2 / 34000;
      drawEllipse(cx, cy, rxTwo, ryTwo, rotationTwo, .26);
      drawEllipse(cx, cy, rxOne, ryOne, rotationOne, .32);

      const angle = time * Math.PI * 2 / 8000;
      const localX = rxOne * Math.cos(angle);
      const localY = ryOne * Math.sin(angle);
      const dotX = cx + localX * Math.cos(rotationOne) - localY * Math.sin(rotationOne);
      const dotY = cy + localX * Math.sin(rotationOne) + localY * Math.cos(rotationOne);
      const glow = context.createRadialGradient(dotX, dotY, 0, dotX, dotY, 13);
      glow.addColorStop(0, 'rgba(216, 255, 98, .9)');
      glow.addColorStop(1, 'rgba(216, 255, 98, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(dotX, dotY, 13, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#d8ff62';
      context.beginPath();
      context.arc(dotX, dotY, 4, 0, Math.PI * 2);
      context.fill();
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(() => { resize(); if (reducedMotion) draw(0); });
    observer.observe(canvas);
    resize();
    draw(0);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return <canvas ref={canvasRef} className="hero-orbit-canvas" aria-hidden="true"/>;
}

const features = [
  { id: 'shop', icon: 'store' as IconName, label: 'AI 探店', desc: '素材成片，一站式创作', tint: 'amber', badge: 'NEW' },
  { id: 'text-image', icon: 'image' as IconName, label: '文生图', desc: '一句话，生成你的想象', tint: 'mint' },
  { id: 'image-image', icon: 'spark' as IconName, label: '图生图', desc: '重绘风格，延展灵感', tint: 'lilac' },
  { id: 'text-video', icon: 'video' as IconName, label: '文生视频', desc: '让文字成为动态叙事', tint: 'blue' },
  { id: 'image-video', icon: 'play' as IconName, label: '图生视频', desc: '让静态画面自然流动', tint: 'rose' },
];

const templates = [
  { title: '流光下的未来城市', tag: '文生视频', ratio: 'wide', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85', prompt: '雨夜的未来都市，霓虹灯在潮湿街道上形成流光倒影，电影感运镜' },
  { title: '春日花园人像', tag: '文生图', ratio: 'tall', image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=85', prompt: '清晨的秘密花园，柔和逆光，人物置身繁盛绿植之间，杂志大片质感' },
  { title: '山野咖啡馆', tag: 'AI 探店', ratio: 'square', image: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=900&q=85', prompt: '跟随镜头走进山野咖啡馆，从门头推镜至手冲咖啡特写，自然松弛氛围' },
  { title: '玻璃质感产品', tag: '图生图', ratio: 'tall', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=85', prompt: '透明玻璃与水面倒影，护肤产品悬浮于纯净空间，商业广告摄影' },
  { title: '京都夜食记', tag: 'AI 探店', ratio: 'wide', image: '/assets/restaurant-case.png', prompt: '夜幕降临后走进一家隐秘日料店，暖光、木质空间、料理制作特写，沉浸式探店' },
  { title: '海边公路电影', tag: '图生视频', ratio: 'square', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85', prompt: '海边公路，风吹动衣角与头发，镜头缓慢环绕，胶片电影色调' },
];

/**
 * Keep the app dependency-free while still giving every main screen a real,
 * bookmarkable URL.  Pages are intentionally named after their product role,
 * rather than the component that happens to render them.
 */
const pagePaths = {
  home: '/',
  create: '/create',
  works: '/works',
  profile: '/profile',
  credits: '/credits',
  notifications: '/notifications',
} as const;

type Page = keyof typeof pagePaths;

const deploymentBasePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');

const pageFromPath = (path: string): Page => {
  const appPath = deploymentBasePath && path.startsWith(deploymentBasePath) ? path.slice(deploymentBasePath.length) || '/' : path;
  const normalized = appPath.replace(/\/+$/, '') || '/';
  return (Object.entries(pagePaths).find(([, pagePath]) => pagePath === normalized)?.[0] as Page | undefined) ?? 'home';
};

const pathForPage = (page: Page) => `${deploymentBasePath}${pagePaths[page]}` || '/';

function Sidebar({ active, setActive, isLoggedIn, onLogin, onLogout }: { active: Page; setActive: (v: Page) => void; isLoggedIn: boolean; onLogin: () => void; onLogout: () => void }) {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!accountOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [accountOpen]);
  const items: Array<{ id: Page; label: string; icon: IconName }> = [
    { id: 'home', label: '首页', icon: 'home' as IconName },
    { id: 'create', label: '创作', icon: 'spark' as IconName },
    { id: 'works', label: '作品', icon: 'folder' as IconName },
    { id: 'profile', label: '我的', icon: 'user' as IconName },
  ];
  return <aside className="sidebar">
    <button className="brand" onClick={() => setActive('home')} aria-label="VIZORA AI 首页">
      <span className="brand-mark"><span /></span><b>VIZORA</b><em>AI</em>
    </button>
    <nav>
      {items.map(item => <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}>
        <Icon name={item.icon} /><span>{item.label}</span>
      </button>)}
    </nav>
    <div className="side-bottom" ref={accountRef}>
      {isLoggedIn ? <><button className="credits" onClick={() => setActive('credits')}><div><span>算力</span><b>68%</b></div><i><i /></i><small>2,480 / 3,600</small></button>
      {accountOpen && <div className="account-menu"><button onClick={() => { onLogout(); onLogin(); setAccountOpen(false); }}><Icon name="user" size={15}/>切换账号</button><button onClick={() => { onLogout(); setAccountOpen(false); }}><Icon name="settings" size={15}/>退出登录</button></div>}
      <button className="avatar" onClick={() => setAccountOpen(!accountOpen)}><span>YL</span><div><b>Yun Lin</b><small>专业创作者</small></div><Icon name="chevron" size={16}/></button></> :
      <div className="guest-card"><span><Icon name="user" size={18}/></span><b>登录 VIZORA</b><small>同步作品，领取免费算力</small><button onClick={onLogin}>登录 / 注册</button></div>}
    </div>
  </aside>
}

function Topbar({ isLoggedIn, onLogin, onNavigate, onSelectTemplate }: { isLoggedIn: boolean; onLogin: () => void; onNavigate: (page: Page) => void; onSelectTemplate: (template: typeof templates[number]) => void }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const results = query.trim() ? templates.filter(t => `${t.title}${t.tag}${t.prompt}`.toLowerCase().includes(query.trim().toLowerCase())) : [];
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);
  return <header className="topbar">
    <div className="search-wrap"><div className="search"><Icon name="search" size={18}/><input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索灵感、模板或作品"/></div>
      {query && <div className="search-results">{results.length ? results.map(t => <button key={t.title} onMouseDown={() => { onSelectTemplate(t); setQuery(''); }}><img src={t.image} alt=""/><div><b>{t.title}</b><small>{t.tag} · {t.prompt}</small></div><Icon name="arrow" size={16}/></button>) : <div className="search-empty"><Icon name="search" size={20}/><span>没有找到相关内容</span><small>试试搜索“探店”或“视频”</small></div>}</div>}
    </div>
    {isLoggedIn ? <div className="top-actions">
      <button onClick={() => onNavigate('notifications')} aria-label="通知"><Icon name="bell" size={19}/><i /></button>
      <button className="invite" onClick={() => setInviteOpen(true)}>邀请好友 <span>+200 算力</span></button>
    </div> : <button className="header-login" onClick={onLogin}>登录 / 注册</button>}
    {inviteOpen && <Modal title="邀请好友，一起创作" onClose={() => setInviteOpen(false)}><div className="invite-modal"><p>每邀请一位好友完成注册，你和好友都将获得 <b>200 算力</b>。</p><label>专属邀请链接</label><div><input readOnly value="https://vizora.ai/invite/YUN2025"/><button onClick={() => navigator.clipboard?.writeText('https://vizora.ai/invite/YUN2025')}>复制链接</button></div><small>已成功邀请 3 位好友 · 累计获得 600 算力</small></div></Modal>}
  </header>
}

function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<'code' | 'password'>('code');
  const [phone, setPhone] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (!/^1\d{10}$/.test(phone)) return setError('请输入正确的手机号码');
    if (!value.trim()) return setError(mode === 'code' ? '请输入验证码' : '请输入密码');
    onSuccess();
  };
  return <Modal title="欢迎来到 VIZORA" onClose={onClose} className="auth-dialog"><div className="auth-modal">
    <div className="auth-brand"><span className="brand-mark"><span /></span><div><b>登录后继续创作</b><small>新用户首次登录即送 200 算力</small></div></div>
    <div className="auth-tabs"><button className={mode === 'code' ? 'active' : ''} onClick={() => { setMode('code'); setError(''); }}>验证码登录</button><button className={mode === 'password' ? 'active' : ''} onClick={() => { setMode('password'); setError(''); }}>密码登录</button></div>
    <label>手机号码<div className="phone-input"><span>+86</span><input inputMode="numeric" maxLength={11} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))} placeholder="请输入手机号码"/></div></label>
    <label>{mode === 'code' ? '验证码' : '密码'}<div className="phone-input"><input type={mode === 'password' ? 'password' : 'text'} value={value} onChange={e => setValue(e.target.value)} placeholder={mode === 'code' ? '请输入 6 位验证码' : '请输入登录密码'}/>{mode === 'code' && <button>获取验证码</button>}</div></label>
    {error && <p className="auth-error">{error}</p>}
    <button className="auth-submit" onClick={submit}>登录 / 注册 <Icon name="arrow" size={17}/></button>
    <p className="auth-terms">登录即代表你同意《用户协议》和《隐私政策》</p>
  </div></Modal>
}

function Modal({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: React.ReactNode; className?: string }) {
  return createPortal(<div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className={`modal-card ${className}`}><div className="modal-head"><h3>{title}</h3><button onClick={onClose} aria-label="关闭">×</button></div>{children}</section>
  </div>, document.body);
}

function WorkDetail({ work, onClose, onReuse }: { work: typeof templates[number]; onClose: () => void; onReuse: () => void }) {
  return <Modal title="作品详情" onClose={onClose}><div className="work-detail"><img src={work.image} alt={work.title}/><div className="work-detail-info"><span>{work.tag}</span><h2>{work.title}</h2><label>创作提示词</label><p>{work.prompt}</p><div><button className="secondary-button" onClick={onClose}>下载作品</button><button className="primary" onClick={onReuse}>复用提示词 <Icon name="arrow" size={16}/></button></div></div></div></Modal>
}

function Home({ startCreate }: { startCreate: (type: string, prompt?: string) => void }) {
  const [filter, setFilter] = useState('全部灵感');
  const filters = ['全部灵感', '热门推荐', '图片创作', '视频创作', 'AI 探店'];
  const visible = templates.filter(t => filter === '全部灵感' || filter === '热门推荐' || (filter === '图片创作' && ['文生图','图生图'].includes(t.tag)) || (filter === '视频创作' && ['文生视频','图生视频'].includes(t.tag)) || (filter === 'AI 探店' && t.tag === 'AI 探店'));
  return <div className="page home-page">
    <section className="hero">
      <div className="eyebrow"><i /> AI CREATIVE STUDIO · 2.0</div>
      <h1>让每一个想象，<br/><span>都有被看见的可能。</span></h1>
      <p>从一个念头到一部作品，以全新 AI 创作方式，释放你的无限创意。</p>
      <button className="primary" onClick={() => startCreate('text-image')}>开始创作 <Icon name="arrow" size={18}/></button>
      <div className="hero-art">
        <HeroOrbitCanvas/>
        <div className="orb"><i/><b>V</b></div>
      </div>
    </section>

    <section className="inspiration">
      <div className="section-heading inspiration-head"><div><span>INSPIRATION GALLERY</span><h2>从灵感开始创作</h2></div></div>
      <div className="filter-row">{filters.map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div>
      <div className="masonry">
        {visible.map((t, i) => <button className={`template-card ${t.ratio}`} key={t.title} onClick={() => startCreate(t.tag === 'AI 探店' ? 'shop' : t.tag.includes('视频') ? 'text-video' : 'text-image', t.prompt)}>
          <img src={t.image} alt=""/><div className="shade"/>{t.tag.includes('视频') || t.tag === 'AI 探店' ? <span className="play"><Icon name="play" size={17}/></span> : null}
          <div className="template-info"><small>{t.tag}</small><h3>{t.title}</h3><p>{t.prompt}</p><span>使用同款 <Icon name="arrow" size={15}/></span></div>
        </button>)}
      </div>
    </section>
  </div>
}

function UploadBox({ title, hint, image }: { title: string; hint: string; image?: string }) {
  const [preview, setPreview] = useState(image || '');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);
  const selectFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreview(URL.createObjectURL(file));
  };
  return <button
    type="button"
    className={`upload-box ${preview ? 'has-image' : ''}`}
    style={preview ? { backgroundImage: `url(${preview})` } : undefined}
    onClick={() => inputRef.current?.click()}
    onDragOver={e => e.preventDefault()}
    onDrop={e => { e.preventDefault(); selectFile(e.dataTransfer.files[0]); }}
  >
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => selectFile(e.target.files?.[0])}/>
    {!preview && <><span><Icon name="plus" size={20}/></span><span className="upload-copy"><b>{title}</b><small>{hint}</small></span><span className="upload-action">选择文件</span></>}
    {preview && <><div className="upload-overlay"/><span className="replace"><Icon name="upload" size={15}/> 更换素材</span></>}
  </button>
}

function ShopCreator({ prompt, setPrompt, onGenerate, submitted }: { prompt: string; setPrompt: (v: string) => void; onGenerate: () => void; submitted: boolean }) {
  const [quality, setQuality] = useState('4K');
  const [duration, setDuration] = useState('30s');
  const [ratio, setRatio] = useState('9:16');
  return <div className="shop-creator">
    <section className="case-banner">
      <img src="/assets/restaurant-case.png" alt="夜间餐厅探店案例"/>
      <div className="case-gradient"/><div className="case-copy"><span>FEATURED CASE · 探店案例</span><h2>把一次到店，<br/>变成一支有故事的影片。</h2><p>上传素材，AI 自动理解空间、产品与人物，完成脚本、分镜和成片。</p><button><span className="round-play"><Icon name="play" size={16}/></span>观看完整案例 <small>00:42</small></button></div>
      <div className="case-stats"><div><b>12</b><span>智能分镜</span></div><div><b>4K</b><span>电影画质</span></div><div><b>3min</b><span>快速成片</span></div></div>
    </section>
    <section className="creation-panel">
      <div className="panel-title"><span>01</span><div><h3>说说你想要的探店故事</h3><p>描述店铺特色、视频风格与想突出的内容</p></div><button><Icon name="wand" size={16}/> AI 帮我写</button></div>
      <div className="prompt-area"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="例如：以第一人称视角探访一家藏在老城区的创意川菜馆，开场从夜晚门头推进，重点展示招牌菜的制作过程和用餐氛围，整体节奏轻快、有烟火气…"/><span>{prompt.length} / 500</span></div>
    </section>
    <section className="creation-panel">
      <div className="panel-title"><span>02</span><div><h3>准备探店素材</h3><p>素材越丰富，故事越生动；每组最多上传 8 张</p></div></div>
      <div className="material-grid">
        <UploadBox title="门头照片" hint="建立场景开篇" image="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80"/>
        <UploadBox title="店内环境" hint="空间与氛围"/>
        <UploadBox title="餐饮 / 产品" hint="核心特写素材" image="https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80"/>
        <UploadBox title="出镜人物" hint="让故事更真实"/>
      </div>
    </section>
    <section className="creation-panel settings-panel">
      <div className="panel-title"><span>03</span><div><h3>成片规格</h3><p>选择最适合发布平台的画面参数</p></div></div>
      <div className="setting-row">
        <Option label="清晰度" options={['1080P','2K','4K']} value={quality} setValue={setQuality}/>
        <Option label="视频时长" options={['15s','30s','60s']} value={duration} setValue={setDuration}/>
        <Option label="画面比例" options={['9:16','16:9','1:1']} value={ratio} setValue={setRatio}/>
      </div>
    </section>
    <div className="generate-bar"><div><Icon name="spark" size={18}/><span>{submitted ? '任务已进入生成队列' : <>本次预计消耗 <b>120 算力</b></>}</span></div><button onClick={onGenerate}>{submitted ? '已提交生成' : '生成探店视频'} <Icon name="arrow" size={18}/></button></div>
  </div>
}

function Option({ label, options, value, setValue }: { label: string; options: string[]; value: string; setValue: (v: string) => void }) {
  return <div className="option"><label>{label}</label><div>{options.map(o => <button key={o} className={value === o ? 'active' : ''} onClick={() => setValue(o)}>{o}</button>)}</div></div>
}

function Create({ initialType, initialPrompt, isLoggedIn, onRequireLogin }: { initialType: string; initialPrompt: string; isLoggedIn: boolean; onRequireLogin: () => void }) {
  const [type, setType] = useState(initialType);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [submitted, setSubmitted] = useState(false);
  const generate = () => { if (!isLoggedIn) { onRequireLogin(); return; } setSubmitted(true); };
  const current = features.find(f => f.id === type) || features[0];
  return <div className="page create-page">
    <div className="page-title"><div><span>AI CREATION</span><h1>{type === 'shop' ? 'AI 探店创作' : '开始你的创作'}</h1><p>{type === 'shop' ? '从真实素材到电影级探店短片，只需要几分钟。' : '选择模型，输入灵感，让 AI 为你的想象赋形。'}</p></div></div>
    <div className="create-tabs">{features.map(f => <button className={type === f.id ? 'active' : ''} key={f.id} onClick={() => { setType(f.id); setSubmitted(false); }}><Icon name={f.icon} size={17}/>{f.label}{f.badge && <small>{f.badge}</small>}</button>)}</div>
    {type === 'shop' ? <ShopCreator prompt={prompt} setPrompt={setPrompt} onGenerate={generate} submitted={submitted}/> : <div className="standard-creator">
      <div className="standard-left">
        {(type === 'image-image' || type === 'image-video') && <div className="form-block reference-upload"><label>上传参考图</label><UploadBox title="添加参考图" hint="点击或拖拽上传 · JPG / PNG / WEBP"/></div>}
        <div className="form-block"><div className="label-row"><label>画面描述</label><button><Icon name="wand" size={15}/> 优化提示词</button></div><div className="large-prompt"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="描述你脑海里的画面，细节越丰富，生成效果越准确…"/><small>{prompt.length} / 1000</small></div></div>
        <div className="form-block"><label>生成设置</label><div className="setting-row"><Option label="画面比例" options={['1:1','3:4','16:9']} value="16:9" setValue={() => {}}/><Option label="生成数量" options={['1 张','2 张','4 张']} value="4 张" setValue={() => {}}/></div></div>
        <button className="big-generate" onClick={generate}><Icon name="spark" size={19}/> {submitted ? '任务已提交' : '立即生成'} <span>{submitted ? '正在生成作品' : '消耗 20 算力'}</span></button>
      </div>
      <div className="preview-empty"><div className={`preview-icon ${current.tint}`}><Icon name={current.icon} size={30}/></div><h3>创意将在这里诞生</h3><p>填写左侧创作信息，点击生成后<br/>即可预览你的作品</p><div className="tip"><Icon name="spark" size={15}/> 试试描述光线、镜头和情绪，效果会更好</div></div>
    </div>}
  </div>
}

function Works({ startCreate }: { startCreate: (type: string, prompt?: string) => void }) {
  const [filter, setFilter] = useState('全部作品');
  const [selected, setSelected] = useState<typeof templates[number] | null>(null);
  const filters = ['全部作品', '图片', '视频'];
  const works = templates.concat(templates.slice(0,2)).filter(t => filter === '全部作品' || (filter === '图片' && !t.tag.includes('视频') && t.tag !== 'AI 探店') || (filter === '视频' && (t.tag.includes('视频') || t.tag === 'AI 探店')));
  return <div className="page works-page"><div className="page-title"><div><span>MY CREATIONS</span><h1>我的作品</h1><p>每一次生成，都是创意旅程的珍贵片段。</p></div><button className="primary" onClick={() => startCreate('text-image')}>新建创作 <Icon name="plus" size={17}/></button></div><div className="work-filters">{filters.map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f} <b>{f === '全部作品' ? 24 : f === '图片' ? 16 : 8}</b></button>)}</div><div className="works-grid">{works.map((t,i)=><button className="work-card" key={i} onClick={() => setSelected(t)}><img src={t.image} alt={t.title}/><span>{t.tag}</span><div><h3>{t.title}</h3><small>2025.03.{18-i} · 生成于 VIZORA AI</small></div></button>)}</div>{selected && <WorkDetail work={selected} onClose={() => setSelected(null)} onReuse={() => startCreate(selected.tag === 'AI 探店' ? 'shop' : selected.tag.includes('视频') ? 'text-video' : 'text-image', selected.prompt)}/>}</div>
}

const creditRecords = [
  { title: 'AI 探店视频', type: '消耗', amount: -120, time: '今天 14:32', detail: '4K · 30 秒 · 9:16' },
  { title: '每日登录奖励', type: '获取', amount: 20, time: '今天 09:18', detail: '连续登录第 7 天' },
  { title: '文生图 · 4 张', type: '消耗', amount: -20, time: '昨天 20:18', detail: 'VIZORA Image V2' },
  { title: '邀请好友奖励', type: '获取', amount: 200, time: '昨天 16:42', detail: '好友尾号 9821 完成注册' },
  { title: '图生视频', type: '消耗', amount: -80, time: '03月18日 11:06', detail: '1080P · 15 秒' },
  { title: '文生视频', type: '消耗', amount: -60, time: '03月17日 22:35', detail: '1080P · 15 秒' },
  { title: 'PRO 月度算力到账', type: '获取', amount: 3600, time: '03月01日 00:00', detail: '专业创作计划' },
];

function CreditsPage() {
  const [filter, setFilter] = useState('全部');
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('3,600');
  const [purchased, setPurchased] = useState(false);
  const records = creditRecords.filter(r => filter === '全部' || r.type === filter);
  return <div className="page records-page">
    <div className="page-title"><div><span>COMPUTE CENTER</span><h1>算力明细</h1><p>查看算力额度、获取与使用记录。</p></div></div>
    <section className="credit-overview"><div><span>当前可用算力</span><b>1,120</b><small>累计获得 3,600 算力</small></div><div><span>本月已使用</span><b>2,480</b><small>较上月节省 12%</small></div><button onClick={() => { setPurchased(false); setPurchaseOpen(true); }}>获取更多算力 <Icon name="arrow" size={17}/></button></section>
    <section className="record-panel"><div className="record-head"><div><h2>收支记录</h2><p>所有算力变动都会记录在这里</p></div><div>{['全部','消耗','获取'].map(f => <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div></div>
      <div className="record-list">{records.map((r,i) => <div className="record-item" key={`${r.title}-${i}`}><span className={r.amount > 0 ? 'record-icon income' : 'record-icon expense'}><Icon name={r.amount > 0 ? 'plus' : 'spark'} size={17}/></span><div><b>{r.title}</b><small>{r.detail}</small></div><time>{r.time}</time><strong className={r.amount > 0 ? 'income' : ''}>{r.amount > 0 ? '+' : ''}{r.amount}</strong></div>)}</div>
      <button className="load-more">加载更多记录</button>
    </section>
    {purchaseOpen && <Modal title="购买算力" onClose={() => setPurchaseOpen(false)} className="credit-dialog">{purchased ? <div className="purchase-success"><span><Icon name="spark" size={28}/></span><h2>算力已到账</h2><p>{selectedPackage} 算力已添加至你的账户</p><button className="primary" onClick={() => setPurchaseOpen(false)}>完成</button></div> : <div className="purchase-modal"><p>按需购买，购买后立即到账。</p><div className="package-grid">{[{amount:'1,000',price:'¥29'},{amount:'3,600',price:'¥89',tag:'推荐'},{amount:'10,000',price:'¥229'}].map(item => <div key={item.amount}>{item.tag && <em>{item.tag}</em>}<b>{item.amount}</b><span>算力</span><strong>{item.price}</strong><button onClick={() => { setSelectedPackage(item.amount); setPurchased(true); }}>购买</button></div>)}</div></div>}</Modal>}
  </div>
}

const notificationItems = [
  { type: '创作动态', icon: 'spark' as IconName, title: '作品生成完成', text: '“京都夜食记”已生成成功，点击查看完整视频。', time: '刚刚', unread: true },
  { type: '创作动态', icon: 'folder' as IconName, title: '本周创作报告', text: '本周你完成了 12 个作品，最常使用的能力是文生图。', time: '2 小时前', unread: true },
  { type: '活动福利', icon: 'plus' as IconName, title: '邀请奖励已到账', text: '好友已完成注册，200 算力已发放至你的账户。', time: '昨天 16:42', unread: true },
  { type: '系统通知', icon: 'bell' as IconName, title: 'VIZORA Image V2 模型上线', text: '全新图像模型现已开放，人物细节与文字表现全面提升。', time: '昨天 10:00', unread: false },
  { type: '账户安全', icon: 'settings' as IconName, title: '新设备登录提醒', text: '你的账户于上海在 Chrome 浏览器登录，如非本人操作请及时修改密码。', time: '03月18日', unread: false },
  { type: '活动福利', icon: 'spark' as IconName, title: '春日创作活动开启', text: '发布春日主题作品，有机会获得最高 2,000 算力奖励。', time: '03月16日', unread: false },
];

function NotificationsPage() {
  const [filter, setFilter] = useState('全部');
  const [readAll, setReadAll] = useState(false);
  const types = ['全部', '创作动态', '系统通知', '活动福利', '账户安全'];
  const items = notificationItems.filter(n => filter === '全部' || n.type === filter);
  return <div className="page notifications-page">
    <div className="page-title"><div><span>MESSAGE CENTER</span><h1>通知中心</h1><p>及时了解作品进度、系统动态与账户消息。</p></div><button className="secondary-button mark-read" onClick={() => setReadAll(true)}>全部标为已读</button></div>
    <div className="notification-tabs">{types.map(t => <button key={t} className={filter === t ? 'active' : ''} onClick={() => setFilter(t)}>{t}{t === '全部' && !readAll && <b>3</b>}</button>)}</div>
    <section className="notification-list">{items.map((n,i) => <button className="notification-item" key={`${n.title}-${i}`}><span className={`notification-type type-${types.indexOf(n.type)}`}><Icon name={n.icon} size={20}/></span><div><span>{n.type}</span><h3>{n.title}{n.unread && !readAll && <i/>}</h3><p>{n.text}</p></div><time>{n.time}</time><Icon name="chevron" size={18}/></button>)}</section>
  </div>
}

function Profile({ setActive, startCreate }: { setActive: (v: Page) => void; startCreate: (type: string, prompt?: string) => void }) {
  const [dialog, setDialog] = useState<'edit' | null>(null);
  const [selected, setSelected] = useState<typeof templates[number] | null>(null);
  const [name, setName] = useState(() => localStorage.getItem('muse-profile-name') || 'Yun Lin');
  const [bio, setBio] = useState(() => localStorage.getItem('muse-profile-bio') || '用影像收集灵感，用 AI 重新想象世界。');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('muse-profile-avatar') || '');
  const updateAvatar = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { const result = String(reader.result); setAvatar(result); localStorage.setItem('muse-profile-avatar', result); };
    reader.readAsDataURL(file);
  };
  const saveProfile = () => {
    localStorage.setItem('muse-profile-name', name);
    localStorage.setItem('muse-profile-bio', bio);
    setDialog(null);
  };
  return <div className="page profile-page">
    <section className="profile-hero"><div className="profile-avatar">{avatar ? <img src={avatar} alt="个人头像"/> : 'YL'}<span/></div><div><span>PRO CREATOR</span><h1>{name}</h1><p>{bio}</p><small>UID 80241957 · 加入 VIZORA 126 天</small></div><button onClick={() => setDialog('edit')}><Icon name="settings" size={17}/> 编辑资料</button></section>
    <div className="profile-stats"><button onClick={() => setActive('works')}><span>总作品</span><b>128</b><small>查看全部作品</small></button><button onClick={() => setActive('credits')}><span>算力</span><b>2,480</b><small>剩余 1,120 算力</small></button><button><span>本月创作</span><b>36</b><small>连续创作 14 天</small></button></div>
    <section className="profile-content"><div className="profile-section-head"><div><span>RECENT CREATIONS</span><h2>最近创作</h2></div><button onClick={() => setActive('works')}>查看全部 <Icon name="arrow" size={16}/></button></div><div className="profile-gallery">{templates.slice(0,4).map((t,i)=><button key={i} onClick={() => setSelected(t)}><img src={t.image} alt={t.title}/>{(i===0||i===3)&&<span><Icon name="play" size={16}/></span>}<p>{t.title}</p><small>{i+2} 天前</small></button>)}</div></section>
    <section className="plan-card"><div><span>COMPUTE PACKS</span><h2>按需购买算力</h2><p>一次购买，长期有效，不订阅、不自动续费</p></div><div className="compute-balance"><span>当前可用</span><b>1,120 <small>算力</small></b></div><button onClick={() => setActive('credits')}>购买算力 <Icon name="chevron" size={16}/></button></section>
    {selected && <WorkDetail work={selected} onClose={() => setSelected(null)} onReuse={() => startCreate(selected.tag === 'AI 探店' ? 'shop' : selected.tag.includes('视频') ? 'text-video' : 'text-image', selected.prompt)}/>}
    {dialog === 'edit' && <Modal title="编辑个人资料" onClose={() => setDialog(null)}><div className="edit-form"><div className="avatar-editor"><div className="profile-avatar">{avatar ? <img src={avatar} alt="头像预览"/> : 'YL'}</div><div><b>个人头像</b><small>建议上传正方形图片，支持 JPG、PNG</small><label>更换头像<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => updateAvatar(e.target.files?.[0])}/></label></div></div><label>昵称<input value={name} onChange={e => setName(e.target.value)}/></label><label>个人简介<textarea value={bio} onChange={e => setBio(e.target.value)}/></label><button className="primary" onClick={saveProfile}>保存修改</button></div></Modal>}
  </div>
}

export default function App() {
  const [active, setActive] = useState<Page>(() => pageFromPath(window.location.pathname));
  const [createType, setCreateType] = useState('text-image');
  const [createPrompt, setCreatePrompt] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('muse-demo-login') === 'true');
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPage, setPendingPage] = useState<Page | null>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [active]);

  useEffect(() => {
    const handlePopState = () => {
      const page = pageFromPath(window.location.pathname);
      if (!isLoggedIn && ['works', 'profile', 'credits', 'notifications'].includes(page)) {
        setPendingPage(page);
        setAuthOpen(true);
        return;
      }
      setActive(page);
    };
    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLoggedIn]);

  const goTo = (page: Page, historyMode: 'push' | 'replace' = 'push') => {
    const path = pathForPage(page);
    if (window.location.pathname !== path) {
      window.history[historyMode === 'replace' ? 'replaceState' : 'pushState']({}, '', path);
    }
    setActive(page);
  };
  const navigate = (page: Page) => {
    if (!isLoggedIn && ['works', 'profile', 'credits', 'notifications'].includes(page)) { setPendingPage(page); setAuthOpen(true); return; }
    goTo(page);
  };
  const startCreate = (type: string, prompt = '') => {
    setCreateType(type); setCreatePrompt(prompt);
    goTo('create'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const login = () => {
    localStorage.setItem('muse-demo-login', 'true');
    setIsLoggedIn(true); setAuthOpen(false);
    if (pendingPage) { goTo(pendingPage); setPendingPage(null); }
  };
  const logout = () => {
    localStorage.removeItem('muse-demo-login');
    setIsLoggedIn(false); goTo('home');
  };
  return <div className="app"><Sidebar active={active} setActive={navigate} isLoggedIn={isLoggedIn} onLogin={() => setAuthOpen(true)} onLogout={logout}/><main><Topbar isLoggedIn={isLoggedIn} onLogin={() => setAuthOpen(true)} onNavigate={navigate} onSelectTemplate={t => startCreate(t.tag === 'AI 探店' ? 'shop' : t.tag.includes('视频') ? 'text-video' : 'text-image', t.prompt)}/>{active === 'home' && <Home startCreate={startCreate}/>} {active === 'create' && <Create key={`${createType}-${createPrompt}`} initialType={createType} initialPrompt={createPrompt} isLoggedIn={isLoggedIn} onRequireLogin={() => setAuthOpen(true)}/>} {active === 'works' && <Works startCreate={startCreate}/>} {active === 'profile' && <Profile setActive={navigate} startCreate={startCreate}/>} {active === 'credits' && <CreditsPage/>} {active === 'notifications' && <NotificationsPage/>}</main>{authOpen && <AuthModal onClose={() => { setAuthOpen(false); setPendingPage(null); }} onSuccess={login}/>}</div>;
}
