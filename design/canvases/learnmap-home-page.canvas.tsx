import { useCanvasState } from 'cursor/canvas';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const B = {
  primary:    '#7C3AED',
  primaryHov: '#6D28D9',
  heroBg:     '#F5F3FF',
  white:      '#FFFFFF',
  n50:        '#FAFAFA',
  n100:       '#F5F5F5',
  n200:       '#E5E5E5',
  n400:       '#A3A3A3',
  n500:       '#737373',
  n600:       '#525252',
  n900:       '#171717',
  teal:       '#14B8A6',
};

// ── Data ──────────────────────────────────────────────────────────────────────

type NavId = 'explore' | 'roadmaps' | 'resources' | 'community';

const NAV: { id: NavId; label: string; chevron?: boolean }[] = [
  { id: 'explore',   label: 'Explore',   chevron: true },
  { id: 'roadmaps',  label: 'Roadmaps' },
  { id: 'resources', label: 'Resources' },
  { id: 'community', label: 'Community' },
];

type FilterId = 'all' | 'frontend' | 'backend' | 'devops' | 'ai' | 'mobile' | 'data' | 'more';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend',  label: 'Backend' },
  { id: 'devops',   label: 'DevOps' },
  { id: 'ai',       label: 'AI / ML' },
  { id: 'mobile',   label: 'Mobile' },
  { id: 'data',     label: 'Data Science' },
  { id: 'more',     label: '+7 more' },
];

const STATS = [
  { value: '80+',  label: 'Roadmaps',           accent: true },
  { value: '50k+', label: 'Learners',            accent: true },
  { value: '200+', label: 'Contributors',        accent: true },
  { value: 'Free', label: 'Always & forever',    accent: false },
];

type CatKey = 'fe' | 'be' | 'do' | 'ai' | 'mo' | 'ds';

const CATEGORIES: { key: CatKey; label: string; sub: string; bg: string; ic: string }[] = [
  { key: 'fe', label: 'Frontend Development',  sub: '12 roadmaps · HTML, CSS, React & more',     bg: '#F5F3FF', ic: B.primary },
  { key: 'be', label: 'Backend Development',   sub: '9 roadmaps · Node.js, Python, SQL & more',   bg: B.n100,    ic: B.n600 },
  { key: 'do', label: 'DevOps & Cloud',        sub: '7 roadmaps · Docker, CI/CD, AWS & more',     bg: B.n100,    ic: B.n600 },
  { key: 'ai', label: 'AI / ML Engineering',   sub: '8 roadmaps · Python, PyTorch, LLMs & more',  bg: '#F5F3FF', ic: B.primary },
  { key: 'mo', label: 'Mobile Development',    sub: '5 roadmaps · React Native, Swift & more',    bg: B.n100,    ic: B.n600 },
  { key: 'ds', label: 'Data Science',          sub: '6 roadmaps · Python, SQL, Pandas & more',    bg: B.n100,    ic: B.n600 },
];

const ROADMAPS = [
  { key: 'fd', title: 'Frontend Developer',  desc: 'A structured path from HTML basics to production-ready React applications.', topics: 102, featured: true,  accent: B.primary },
  { key: 'be', title: 'Backend Engineer',    desc: 'From REST APIs to database design and server architecture.',                  topics: 89,  featured: false, accent: B.n900 },
  { key: 'dc', title: 'DevOps & Cloud',      desc: 'CI/CD pipelines, Docker, Kubernetes, Infrastructure as code.',               topics: 74,  featured: false, accent: B.n900 },
  { key: 'ai', title: 'AI / ML Engineer',   desc: 'Python fundamentals through to training and deploying language models.',      topics: 91,  featured: true,  accent: B.primary },
  { key: 're', title: 'React',              desc: 'Components, hooks, state management, testing and the React ecosystem.',      topics: 58,  featured: false, accent: B.teal },
  { key: 'fs', title: 'Full Stack',         desc: 'Core language fundamentals through to web, data and automation.',            topics: 63,  featured: false, accent: B.n900 },
];

// ── Shared font stack ─────────────────────────────────────────────────────────
const FONT = "'Geist Variable', ui-sans-serif, system-ui, -apple-system, sans-serif";

// ── Icons ─────────────────────────────────────────────────────────────────────

function BrandIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={B.primary} />
      <path d="M16 5L9 16h7l-4 7 12-13h-7l3-5z" fill="white" />
    </svg>
  );
}

function ChevronDown({ size = 11, color = B.n500 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 11 11" fill="none">
      <path d="M2 4L5.5 7.5L9 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryIcon({ type, color }: { type: CatKey; color: string }) {
  const sw = 1.5;
  const vb = '0 0 24 24';
  const s = 20;
  if (type === 'fe') return (
    <svg width={s} height={s} viewBox={vb} fill="none">
      <polyline points="16,18 22,12 16,6" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="8,6 2,12 8,18" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (type === 'be') return (
    <svg width={s} height={s} viewBox={vb} fill="none">
      <rect x="2" y="3" width="20" height="7" rx="2" stroke={color} strokeWidth={sw} />
      <rect x="2" y="14" width="20" height="7" rx="2" stroke={color} strokeWidth={sw} />
      <circle cx="6.5" cy="6.5" r="1" fill={color} />
      <circle cx="6.5" cy="17.5" r="1" fill={color} />
    </svg>
  );
  if (type === 'do') return (
    <svg width={s} height={s} viewBox={vb} fill="none">
      <circle cx="6" cy="4.5" r="2" stroke={color} strokeWidth={sw} />
      <circle cx="6" cy="19.5" r="2" stroke={color} strokeWidth={sw} />
      <circle cx="18" cy="9" r="2" stroke={color} strokeWidth={sw} />
      <line x1="6" y1="6.5" x2="6" y2="17.5" stroke={color} strokeWidth={sw} />
      <path d="M6 8C8 9.5 10 10.5 12 10.5C14 10.5 16 10 18 10V10" stroke={color} strokeWidth={sw} fill="none" />
    </svg>
  );
  if (type === 'ai') return (
    <svg width={s} height={s} viewBox={vb} fill="none">
      <path d="M12 2L13.5 7.5L19 9L13.5 10.5L12 16L10.5 10.5L5 9L10.5 7.5L12 2Z" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      <circle cx="18.5" cy="18.5" r="1.5" stroke={color} strokeWidth={1} />
      <circle cx="5" cy="17" r="1" stroke={color} strokeWidth={1} />
    </svg>
  );
  if (type === 'mo') return (
    <svg width={s} height={s} viewBox={vb} fill="none">
      <rect x="6" y="2" width="12" height="20" rx="2.5" stroke={color} strokeWidth={sw} />
      <line x1="10" y1="18" x2="14" y2="18" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <circle cx="12" cy="5" r="1" fill={color} />
    </svg>
  );
  // ds — bar chart
  return (
    <svg width={s} height={s} viewBox={vb} fill="none">
      <line x1="3" y1="21" x2="21" y2="21" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <rect x="4" y="13" width="4" height="8" rx="1" stroke={color} strokeWidth={sw} />
      <rect x="10" y="8" width="4" height="13" rx="1" stroke={color} strokeWidth={sw} />
      <rect x="16" y="4" width="4" height="17" rx="1" stroke={color} strokeWidth={sw} />
    </svg>
  );
}

// ── Components ────────────────────────────────────────────────────────────────

function Navbar({
  active,
  setActive,
}: {
  active: NavId;
  setActive: (id: NavId) => void;
}) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: B.white,
      borderBottom: `1px solid ${B.n200}`,
      height: 56,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', width: '100%',
        padding: '0 32px',
        display: 'flex', alignItems: 'center',
        height: '100%',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 36 }}>
          <BrandIcon size={24} />
          <span style={{ fontSize: 16, fontWeight: 700, color: B.n900, letterSpacing: '-0.02em', fontFamily: FONT }}>
            Learnmap
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
          {NAV.map(item => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '0 14px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${B.primary}` : '2px solid transparent',
                  borderTop: '2px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? B.primary : B.n600,
                  fontFamily: FONT,
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {item.label}
                {item.chevron && <ChevronDown color={isActive ? B.primary : B.n400} />}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{
            padding: '7px 16px', border: 'none', background: 'transparent',
            fontSize: 14, color: B.n600, cursor: 'pointer', fontFamily: FONT,
          }}>
            Sign in
          </button>
          <button style={{
            padding: '8px 20px', borderRadius: 9999,
            background: B.primary, color: B.white, border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
            letterSpacing: '-0.01em',
          }}>
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}

function Hero({
  filter,
  setFilter,
}: {
  filter: FilterId;
  setFilter: (id: FilterId) => void;
}) {
  return (
    <div style={{ background: B.heroBg, padding: '72px 32px 60px' }}>
      <div style={{ maxWidth: 660, margin: '0 auto', textAlign: 'center' }}>
        {/* Beta badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: B.white, border: `1px solid ${B.n200}`,
          borderRadius: 9999, padding: '5px 14px',
          marginBottom: 28, fontSize: 13, color: B.n600, fontFamily: FONT,
        }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: B.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
              <path d="M5 1L2 5h3L3.5 9l5.5-5H5.5L5 1z" fill="white" />
            </svg>
          </div>
          Now in public beta — join the community
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 18 }}>
          <h1 style={{
            margin: 0, fontSize: 56, fontWeight: 800,
            lineHeight: 1.05, letterSpacing: '-0.035em',
            color: B.n900, fontFamily: FONT,
          }}>
            Warriors
          </h1>
          <h1 style={{
            margin: 0, fontSize: 56, fontWeight: 800,
            lineHeight: 1.05, letterSpacing: '-0.035em',
            color: B.primary, fontFamily: FONT,
          }}>
            are the best!
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{
          fontSize: 16, color: B.n600, lineHeight: 1.65,
          margin: '0 auto 32px', maxWidth: 460, fontFamily: FONT,
        }}>
          Structured learning paths built by the community — from absolute beginner to job-ready developer.
        </p>

        {/* Search bar */}
        <div style={{
          display: 'flex', maxWidth: 500, margin: '0 auto 20px',
          border: `1px solid ${B.n200}`, borderRadius: 9999,
          background: B.white, overflow: 'hidden',
        }}>
          <input
            placeholder="Search roadmaps... e.g."
            readOnly
            style={{
              flex: 1, padding: '12px 20px', border: 'none',
              fontSize: 14, color: B.n400,
              background: 'transparent', outline: 'none', fontFamily: FONT,
            }}
          />
          <button style={{
            padding: '12px 24px', borderRadius: '0 9999px 9999px 0',
            background: B.n900, color: B.white, border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
            flexShrink: 0,
          }}>
            Search
          </button>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap' }}>
          {FILTERS.map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '5px 14px', borderRadius: 9999,
                  border: `1px solid ${active ? B.primary : B.n200}`,
                  background: active ? B.primary : B.white,
                  color: active ? B.white : B.n600,
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', fontFamily: FONT,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatsBar() {
  return (
    <div style={{ background: B.white, borderBottom: `1px solid ${B.n200}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex' }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{
            flex: 1, padding: '24px 16px', textAlign: 'center',
            borderRight: i < STATS.length - 1 ? `1px solid ${B.n200}` : 'none',
          }}>
            <div style={{
              fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', fontFamily: FONT,
              color: s.accent ? B.primary : B.n900,
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: B.n500, marginTop: 4, fontFamily: FONT }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: B.primary,
      letterSpacing: '0.1em', textTransform: 'uppercase' as const,
      marginBottom: 8, fontFamily: FONT,
    }}>
      {label}
    </div>
  );
}

function SectionHeader({ title, link }: { title: string; link: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
      <h2 style={{
        margin: 0, fontSize: 28, fontWeight: 700,
        color: B.n900, letterSpacing: '-0.025em', fontFamily: FONT,
      }}>
        {title}
      </h2>
      <a href="#" style={{
        fontSize: 14, color: B.primary, fontWeight: 500,
        textDecoration: 'none', fontFamily: FONT,
      }}>
        {link}
      </a>
    </div>
  );
}

function CategorySection() {
  return (
    <div style={{ background: B.white, padding: '60px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionEyebrow label="Browse by Topic" />
        <SectionHeader title="Pick your path" link="All categories →" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.key}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '18px 22px',
                border: `1px solid ${B.n200}`, borderRadius: 10,
                background: B.white, cursor: 'pointer',
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: cat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <CategoryIcon type={cat.key} color={cat.ic} />
              </div>
              <div>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: B.n900,
                  marginBottom: 4, fontFamily: FONT,
                }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: 12, color: B.n500, fontFamily: FONT }}>
                  {cat.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PopularRoadmaps() {
  return (
    <div style={{ background: B.n50, padding: '60px 32px 80px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <SectionEyebrow label="Community Favourites" />
        <SectionHeader title="Popular roadmaps" link="Browse all 80+ →" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {ROADMAPS.map(r => {
            const isFeatured = r.featured && r.accent === B.primary;
            return (
              <div
                key={r.key}
                style={{
                  borderRadius: 10, overflow: 'hidden',
                  background: isFeatured ? B.primary : B.white,
                  border: isFeatured ? 'none' : `1px solid ${B.n200}`,
                }}
              >
                {/* Top accent strip for non-featured */}
                {!isFeatured && (
                  <div style={{ height: 4, background: r.accent }} />
                )}
                <div style={{ padding: '20px 20px 18px' }}>
                  <div style={{
                    fontSize: 15, fontWeight: 600,
                    color: isFeatured ? B.white : B.n900,
                    marginBottom: 8, fontFamily: FONT,
                    letterSpacing: '-0.01em',
                  }}>
                    {r.title}
                  </div>
                  <div style={{
                    fontSize: 13, lineHeight: 1.55, marginBottom: 16,
                    color: isFeatured ? 'rgba(255,255,255,0.72)' : B.n500,
                    fontFamily: FONT,
                  }}>
                    {r.desc}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 12,
                      color: isFeatured ? 'rgba(255,255,255,0.55)' : B.n400,
                      fontFamily: FONT,
                    }}>
                      {r.topics} topics
                    </span>
                    <button style={{
                      padding: '6px 16px', borderRadius: 9999,
                      background: isFeatured ? B.white : B.n900,
                      color: isFeatured ? B.primary : B.white,
                      border: 'none',
                      fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', fontFamily: FONT,
                    }}>
                      Start →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PageFooterHint() {
  return (
    <div style={{
      background: B.n200, padding: '8px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24,
    }}>
      <span style={{ fontSize: 11, color: B.n500, fontFamily: FONT }}>
        Click nav items to switch active state
      </span>
      <span style={{ fontSize: 11, color: B.n400 }}>·</span>
      <span style={{ fontSize: 11, color: B.n500, fontFamily: FONT }}>
        Click filter pills to change active category
      </span>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeNav, setActiveNav] = useCanvasState<NavId>('homeNav', 'roadmaps');
  const [activeFilter, setActiveFilter] = useCanvasState<FilterId>('homeFilter', 'all');

  return (
    <div style={{
      height: '100%', overflow: 'auto',
      background: B.white,
      fontFamily: FONT,
    }}>
      <PageFooterHint />
      <Navbar active={activeNav} setActive={setActiveNav} />
      <Hero filter={activeFilter} setFilter={setActiveFilter} />
      <StatsBar />
      <CategorySection />
      <PopularRoadmaps />
    </div>
  );
}
