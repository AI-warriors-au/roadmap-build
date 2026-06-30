import {
  useHostTheme,
  useCanvasState,
  H1, H2, H3,
  Text,
  Row, Stack, Grid,
  Card, CardHeader, CardBody,
  Divider, Pill, Spacer,
  Table,
} from 'cursor/canvas';

type Tab = 'brand' | 'colors' | 'type' | 'spacing' | 'shadows' | 'components';

const TABS: { id: Tab; label: string }[] = [
  { id: 'brand',      label: 'Brand' },
  { id: 'colors',     label: 'Colors' },
  { id: 'type',       label: 'Type' },
  { id: 'spacing',    label: 'Spacing' },
  { id: 'shadows',    label: 'Shadows' },
  { id: 'components', label: 'Components' },
];

// ── Palette data ──────────────────────────────────────────────────────────────

const VIOLET: [string, string][] = [
  ['50',  '#F5F3FF'], ['100', '#EDE9FE'], ['200', '#DDD6FE'],
  ['300', '#C4B5FD'], ['400', '#A78BFA'], ['500', '#8B5CF6'],
  ['600', '#7C3AED'], ['700', '#6D28D9'], ['800', '#5B21B6'],
  ['900', '#4C1D95'], ['950', '#2E1065'],
];

const TEAL: [string, string][] = [
  ['50',  '#F0FDFA'], ['100', '#CCFBF1'], ['200', '#99F6E4'],
  ['300', '#5EEAD4'], ['400', '#2DD4BF'], ['500', '#14B8A6'],
  ['600', '#0D9488'], ['700', '#0F766E'], ['800', '#115E59'],
  ['900', '#134E4A'],
];

const NEUTRAL: [string, string][] = [
  ['0',   '#FFFFFF'], ['50',  '#FAFAFA'], ['100', '#F5F5F5'],
  ['200', '#E5E5E5'], ['300', '#D4D4D4'], ['400', '#A3A3A3'],
  ['500', '#737373'], ['600', '#525252'], ['700', '#404040'],
  ['800', '#262626'], ['900', '#171717'], ['950', '#0A0A0A'],
];

const STATUS: { name: string; light: string; dark: string; surface: string }[] = [
  { name: 'Success',     light: '#16A34A', dark: '#4ADE80', surface: '#F0FDF4' },
  { name: 'Warning',     light: '#D97706', dark: '#FCD34D', surface: '#FFFBEB' },
  { name: 'Destructive', light: '#DC2626', dark: '#F87171', surface: '#FEF2F2' },
  { name: 'Info',        light: '#2563EB', dark: '#60A5FA', surface: '#EFF6FF' },
];

const SEMANTIC_LIGHT: { token: string; value: string; usage: string }[] = [
  { token: 'background.default',  value: '#FFFFFF', usage: 'Page background' },
  { token: 'background.subtle',   value: '#FAFAFA', usage: 'Sidebar, panels' },
  { token: 'background.brand',    value: '#F5F3FF', usage: 'Hero tint' },
  { token: 'text.primary',        value: '#171717', usage: 'Headings, body' },
  { token: 'text.secondary',      value: '#737373', usage: 'Supporting copy' },
  { token: 'text.link',           value: '#7C3AED', usage: 'Links' },
  { token: 'border.default',      value: '#E5E5E5', usage: 'Dividers, card borders' },
  { token: 'action.primary.bg',   value: '#7C3AED', usage: 'Primary button' },
];

const SEMANTIC_DARK: { token: string; value: string; usage: string }[] = [
  { token: 'background.default',  value: '#0A0A0A', usage: 'Page background' },
  { token: 'background.subtle',   value: '#111111', usage: 'Sidebar, panels' },
  { token: 'background.brand',    value: '#1A1030', usage: 'Hero tint' },
  { token: 'text.primary',        value: '#FAFAFA', usage: 'Headings, body' },
  { token: 'text.secondary',      value: '#A3A3A3', usage: 'Supporting copy' },
  { token: 'text.link',           value: '#A78BFA', usage: 'Links' },
  { token: 'border.default',      value: '#404040', usage: 'Dividers' },
  { token: 'action.primary.bg',   value: '#7C3AED', usage: 'Primary button' },
];

// ── Type scale data ───────────────────────────────────────────────────────────

const TYPE_SCALE: { name: string; size: string; weight: number; lh: string; usage: string }[] = [
  { name: 'Display 2XL', size: '60px', weight: 800, lh: '1.0', usage: 'Hero headline desktop' },
  { name: 'Display XL',  size: '48px', weight: 800, lh: '1.2', usage: 'Hero tablet' },
  { name: 'Display LG',  size: '36px', weight: 700, lh: '1.2', usage: 'Large display' },
  { name: 'H1',          size: '30px', weight: 700, lh: '1.2', usage: 'Page section heading' },
  { name: 'H2',          size: '24px', weight: 600, lh: '1.35', usage: 'Subsection' },
  { name: 'H3',          size: '20px', weight: 600, lh: '1.35', usage: 'Card title' },
  { name: 'H4',          size: '18px', weight: 600, lh: '1.5', usage: 'Lead / h4' },
  { name: 'Body LG',     size: '16px', weight: 400, lh: '1.625', usage: 'Intro paragraph' },
  { name: 'Body',        size: '14px', weight: 400, lh: '1.5', usage: 'Default body' },
  { name: 'Body SM',     size: '12px', weight: 400, lh: '1.5', usage: 'Captions, tags' },
  { name: 'Label',       size: '12px', weight: 500, lh: '1.5', usage: 'UI labels' },
  { name: 'Label SM',    size: '11px', weight: 500, lh: '1.5', usage: 'Eyebrow / caps' },
];

const FONT_WEIGHTS: { name: string; value: number; usage: string }[] = [
  { name: 'Regular',   value: 400, usage: 'Body copy, descriptions' },
  { name: 'Medium',    value: 500, usage: 'Labels, navigation items' },
  { name: 'Semibold',  value: 600, usage: 'Subheadings, card titles, stats' },
  { name: 'Bold',      value: 700, usage: 'Display headings, emphasis' },
  { name: 'Extrabold', value: 800, usage: "Hero display — 'Warriors'" },
];

// ── Spacing data ──────────────────────────────────────────────────────────────

const SPACING_SCALE: { token: string; px: number; usage: string }[] = [
  { token: 'spacing.1',  px: 4,   usage: 'Icon gap, tight inline' },
  { token: 'spacing.2',  px: 8,   usage: 'Pill padding-y, label gap' },
  { token: 'spacing.3',  px: 12,  usage: 'Button padding-y (sm)' },
  { token: 'spacing.4',  px: 16,  usage: 'Default padding, card inner' },
  { token: 'spacing.6',  px: 24,  usage: 'Nav height component, card gap' },
  { token: 'spacing.8',  px: 32,  usage: 'Section internal padding' },
  { token: 'spacing.10', px: 40,  usage: 'Larger section gaps' },
  { token: 'spacing.12', px: 48,  usage: 'Nav bar height' },
  { token: 'spacing.16', px: 64,  usage: 'Section padding-y (mobile)' },
  { token: 'spacing.20', px: 80,  usage: 'Section padding-y (tablet)' },
  { token: 'spacing.24', px: 96,  usage: 'Section padding-y (desktop)' },
  { token: 'spacing.32', px: 128, usage: 'Hero vertical padding' },
];

// ── Border radius data ────────────────────────────────────────────────────────

const RADII: { token: string; px: string; usage: string }[] = [
  { token: 'radius.none', px: '0px',    usage: 'Sharp edges, rule lines' },
  { token: 'radius.xs',   px: '4px',    usage: 'Tags, chips, badges' },
  { token: 'radius.sm',   px: '6px',    usage: 'Buttons (sm), inputs' },
  { token: 'radius.md',   px: '8px',    usage: 'Inputs, dropdowns' },
  { token: 'radius.lg',   px: '10px',   usage: 'Cards, modals — base radius' },
  { token: 'radius.xl',   px: '14px',   usage: 'Large cards, sheets' },
  { token: 'radius.2xl',  px: '18px',   usage: 'Feature cards' },
  { token: 'radius.3xl',  px: '22px',   usage: 'Popovers' },
  { token: 'radius.4xl',  px: '26px',   usage: 'Hero search bar' },
  { token: 'radius.full', px: '9999px', usage: 'Pills, badges, avatars' },
];

// ── Shadow data ───────────────────────────────────────────────────────────────

const SHADOWS: { token: string; value: string; usage: string }[] = [
  { token: 'shadow.none',       value: 'none',                                                            usage: 'Flat elements' },
  { token: 'shadow.xs',         value: '0 1px 2px 0 rgba(0,0,0,.05)',                                    usage: 'Inputs, hair-thin lift' },
  { token: 'shadow.sm',         value: '0 1px 3px 0 rgba(0,0,0,.10), 0 1px 2px -1px rgba(0,0,0,.08)',   usage: 'Default card' },
  { token: 'shadow.md',         value: '0 4px 6px -1px rgba(0,0,0,.10), 0 2px 4px -2px rgba(0,0,0,.08)',usage: 'Hover cards, dropdowns' },
  { token: 'shadow.lg',         value: '0 10px 15px -3px rgba(0,0,0,.10), 0 4px 6px -4px rgba(0,0,0,.08)',usage: 'Modals, drawers' },
  { token: 'shadow.xl',         value: '0 20px 25px -5px rgba(0,0,0,.10), 0 8px 10px -6px rgba(0,0,0,.08)',usage: 'Command palette' },
  { token: 'shadow.brand-glow', value: '0 0 0 3px rgba(124,58,237,.25)',                                  usage: 'Focus ring on brand elements' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ColorRow({ label, swatches }: { label: string; swatches: [string, string][] }) {
  const theme = useHostTheme();
  return (
    <Stack gap={8}>
      <Text weight="medium" style={{ color: theme.text.secondary }}>{label}</Text>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {swatches.map(([step, hex]) => (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                background: hex,
                border: hex === '#FFFFFF' ? `1px solid ${theme.stroke.secondary}` : 'none',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 4,
              }}
            >
              <span style={{ fontSize: 9, color: isLight(hex) ? '#525252' : '#FAFAFA', fontWeight: 500 }}>{step}</span>
            </div>
            <span style={{ fontSize: 9, color: theme.text.tertiary, fontFamily: 'monospace' }}>{hex}</span>
          </div>
        ))}
      </div>
    </Stack>
  );
}

function SemanticTable({ rows, title }: { rows: { token: string; value: string; usage: string }[]; title: string }) {
  const theme = useHostTheme();
  return (
    <Stack gap={8}>
      <Text weight="medium" style={{ color: theme.text.secondary }}>{title}</Text>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.map(r => (
          <div
            key={r.token}
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 80px 1fr',
              alignItems: 'center',
              gap: 12,
              padding: '6px 0',
              borderBottom: `1px solid ${theme.stroke.tertiary}`,
            }}
          >
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: theme.text.secondary }}>{r.token}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: r.value,
                  border: `1px solid ${theme.stroke.secondary}`,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: theme.text.tertiary }}>{r.value}</span>
            </div>
            <span style={{ fontSize: 12, color: theme.text.secondary }}>{r.usage}</span>
          </div>
        ))}
      </div>
    </Stack>
  );
}

// ── Tab views ─────────────────────────────────────────────────────────────────

function BrandView() {
  const theme = useHostTheme();
  return (
    <Stack gap={32}>
      <div>
        <H2>Brand Identity</H2>
        <Text style={{ color: theme.text.secondary, marginTop: 4 }}>
          Learnmap — structured learning paths built by the community.
        </Text>
      </div>

      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Logo lockup</CardHeader>
          <CardBody>
            <div style={{
              background: theme.bg.chrome,
              borderRadius: 8,
              padding: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
              border: `1px solid ${theme.stroke.secondary}`,
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="7" fill="#7C3AED"/>
                <path d="M16 5L9 16h7l-4 7 12-13h-7l3-5z" fill="white" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 18, fontWeight: 700, color: theme.text.primary, letterSpacing: '-0.02em' }}>
                Learnmap
              </span>
            </div>
            <Text style={{ color: theme.text.secondary, fontSize: 12 }}>
              Horizontal lockup — default for nav bars and headers.
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Icon only</CardHeader>
          <CardBody>
            <div style={{
              background: theme.bg.chrome,
              borderRadius: 8,
              padding: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 12,
              border: `1px solid ${theme.stroke.secondary}`,
            }}>
              {[48, 32, 20].map(size => (
                <svg key={size} width={size} height={size} viewBox="0 0 28 28" fill="none">
                  <rect width="28" height="28" rx="7" fill="#7C3AED"/>
                  <path d="M16 5L9 16h7l-4 7 12-13h-7l3-5z" fill="white" strokeLinejoin="round"/>
                </svg>
              ))}
            </div>
            <Text style={{ color: theme.text.secondary, fontSize: 12 }}>
              48px · 32px · 20px — favicons, avatars, loading states.
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Logo on dark</CardHeader>
          <CardBody>
            <div style={{
              background: '#0A0A0A',
              borderRadius: 8,
              padding: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="7" fill="#8B5CF6"/>
                <path d="M16 5L9 16h7l-4 7 12-13h-7l3-5z" fill="white" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em' }}>
                Learnmap
              </span>
            </div>
            <Text style={{ color: theme.text.secondary, fontSize: 12 }}>
              Icon uses violet-500 on dark surfaces for legibility.
            </Text>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Logo on brand</CardHeader>
          <CardBody>
            <div style={{
              background: '#7C3AED',
              borderRadius: 8,
              padding: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="7" fill="rgba(255,255,255,0.2)"/>
                <path d="M16 5L9 16h7l-4 7 12-13h-7l3-5z" fill="white" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Learnmap
              </span>
            </div>
            <Text style={{ color: theme.text.secondary, fontSize: 12 }}>
              Full white version on brand violet surfaces.
            </Text>
          </CardBody>
        </Card>
      </Grid>

      <Divider />

      <Stack gap={16}>
        <H3>Category icons</H3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Frontend',  bg: '#F5F3FF', fg: '#7C3AED' },
            { label: 'Backend',   bg: '#F5F5F5', fg: '#525252' },
            { label: 'DevOps',    bg: '#F5F5F5', fg: '#525252' },
            { label: 'AI / ML',   bg: '#F5F3FF', fg: '#7C3AED' },
            { label: 'Mobile',    bg: '#F5F5F5', fg: '#525252' },
            { label: 'Data Sci.', bg: '#F5F5F5', fg: '#525252' },
          ].map(cat => (
            <div key={cat.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: cat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 7l6-4 6 4v8l-6 4-6-4V7z" stroke={cat.fg} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
              <Text style={{ fontSize: 11, color: theme.text.secondary }}>{cat.label}</Text>
            </div>
          ))}
        </div>
        <Text style={{ color: theme.text.tertiary, fontSize: 12 }}>
          Brand categories: violet-50 bg + violet-600 icon. Neutral categories: neutral-100 bg + neutral-600 icon.
        </Text>
      </Stack>
    </Stack>
  );
}

function ColorsView() {
  const theme = useHostTheme();
  const [mode, setMode] = useCanvasState<'light' | 'dark'>('semanticMode', 'light');
  return (
    <Stack gap={32}>
      <div>
        <H2>Brand Palette</H2>
        <Text style={{ color: theme.text.secondary, marginTop: 4 }}>
          Raw colour tokens. Always reference semantic tokens in product code.
        </Text>
      </div>

      <Stack gap={20}>
        <ColorRow label="Brand Violet — primary brand colour" swatches={VIOLET} />
        <ColorRow label="Brand Teal — secondary accent" swatches={TEAL} />
        <ColorRow label="Neutral Scale" swatches={NEUTRAL} />
      </Stack>

      <Divider />

      <Stack gap={16}>
        <H3>Status colours</H3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {STATUS.map(s => (
            <div key={s.name} style={{ minWidth: 140 }}>
              <Card>
                <CardBody>
                  <Stack gap={8}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: s.light }} />
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: s.dark }} />
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: s.surface, border: `1px solid ${theme.stroke.secondary}` }} />
                    </div>
                    <Text weight="medium" style={{ fontSize: 13 }}>{s.name}</Text>
                    <div>
                      <Text style={{ fontSize: 10, color: theme.text.tertiary, fontFamily: 'monospace' }}>light {s.light}</Text>
                      <Text style={{ fontSize: 10, color: theme.text.tertiary, fontFamily: 'monospace' }}>dark  {s.dark}</Text>
                      <Text style={{ fontSize: 10, color: theme.text.tertiary, fontFamily: 'monospace' }}>surf  {s.surface}</Text>
                    </div>
                  </Stack>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </Stack>

      <Divider />

      <Stack gap={16}>
        <Row gap={12} align="center">
          <H3>Semantic tokens</H3>
          <Spacer />
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: `1px solid ${theme.stroke.secondary}` }}>
            {(['light', 'dark'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '4px 14px',
                  fontSize: 12,
                  fontWeight: 500,
                  background: mode === m ? '#7C3AED' : 'transparent',
                  color: mode === m ? '#FFFFFF' : theme.text.secondary,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {m === 'light' ? 'Light' : 'Dark'}
              </button>
            ))}
          </div>
        </Row>
        <SemanticTable
          title={mode === 'light' ? 'Semantic — Light' : 'Semantic — Dark'}
          rows={mode === 'light' ? SEMANTIC_LIGHT : SEMANTIC_DARK}
        />
      </Stack>
    </Stack>
  );
}

function TypeView() {
  const theme = useHostTheme();
  return (
    <Stack gap={32}>
      <div>
        <H2>Typography</H2>
        <Text style={{ color: theme.text.secondary, marginTop: 4 }}>
          Geist Variable — a variable-font built for clarity at every weight.
        </Text>
      </div>

      <Stack gap={24}>
        <H3>Display & Headings</H3>
        {TYPE_SCALE.slice(0, 7).map(t => (
          <div key={t.name} style={{ borderBottom: `1px solid ${theme.stroke.tertiary}`, paddingBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
              <div style={{ width: 200, flexShrink: 0 }}>
                <Text style={{ fontSize: 11, color: theme.text.tertiary, fontFamily: 'monospace' }}>{t.name}</Text>
                <Text style={{ fontSize: 10, color: theme.text.tertiary, marginTop: 2 }}>
                  {t.size} · {t.weight} · {t.lh}lh
                </Text>
              </div>
              <span style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: t.lh, color: theme.text.primary, letterSpacing: '-0.02em' }}>
                Learning paths for everyone
              </span>
            </div>
          </div>
        ))}
      </Stack>

      <Divider />

      <Stack gap={20}>
        <H3>Type Scale — Body & UI</H3>
        {TYPE_SCALE.slice(7).map(t => (
          <div key={t.name} style={{ borderBottom: `1px solid ${theme.stroke.tertiary}`, paddingBottom: 12 }}>
            <Row gap={16} align="center">
              <div style={{ width: 200, flexShrink: 0 }}>
                <Text style={{ fontSize: 11, color: theme.text.tertiary, fontFamily: 'monospace' }}>{t.name}</Text>
                <Text style={{ fontSize: 10, color: theme.text.tertiary, marginTop: 2 }}>
                  {t.size} · {t.weight} · {t.lh}lh
                </Text>
              </div>
              <span style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: t.lh, color: theme.text.primary }}>
                {t.usage}
              </span>
            </Row>
          </div>
        ))}
      </Stack>

      <Divider />

      <Stack gap={16}>
        <H3>Font Weights</H3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {FONT_WEIGHTS.map(w => (
            <div key={w.name} style={{ flex: '1 1 160px' }}>
              <Card>
                <CardBody>
                  <Stack gap={4}>
                    <span style={{ fontSize: 28, fontWeight: w.value, color: theme.text.primary, lineHeight: 1.1 }}>Aa</span>
                    <Text weight="medium" style={{ fontSize: 13 }}>{w.name}</Text>
                    <Text style={{ fontSize: 11, color: theme.text.secondary }}>{w.value}</Text>
                    <Text style={{ fontSize: 11, color: theme.text.tertiary }}>{w.usage}</Text>
                  </Stack>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </Stack>
    </Stack>
  );
}

function SpacingView() {
  const theme = useHostTheme();
  return (
    <Stack gap={32}>
      <div>
        <H2>Spacing</H2>
        <Text style={{ color: theme.text.secondary, marginTop: 4 }}>
          4px base unit. All tokens are multiples of 4px for consistent rhythm.
        </Text>
      </div>

      <Stack gap={0}>
        {SPACING_SCALE.map((s, i) => (
          <div
            key={s.token}
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 48px 1fr',
              alignItems: 'center',
              gap: 16,
              padding: '10px 0',
              borderBottom: `1px solid ${theme.stroke.tertiary}`,
            }}
          >
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: theme.text.secondary }}>{s.token}</span>
            <span style={{ fontSize: 12, color: theme.text.tertiary }}>{s.px}px</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                height: 12,
                width: Math.min(s.px, 200),
                background: '#7C3AED',
                borderRadius: 2,
                opacity: 0.7 - i * 0.03,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 12, color: theme.text.tertiary }}>{s.usage}</span>
            </div>
          </div>
        ))}
      </Stack>

      <Divider />

      <Stack gap={16}>
        <H3>Spacing Scale — Visual</H3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, padding: 16, background: theme.bg.chrome, borderRadius: 8 }}>
          {[4, 8, 12, 16, 24, 32, 40, 48, 64].map(px => (
            <div key={px} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 24, height: px, background: '#7C3AED', borderRadius: 2, opacity: 0.8 }} />
              <span style={{ fontSize: 9, color: theme.text.tertiary }}>{px}</span>
            </div>
          ))}
        </div>
      </Stack>
    </Stack>
  );
}

function ShadowsView() {
  const theme = useHostTheme();
  return (
    <Stack gap={32}>
      <div>
        <H2>Shadows & Elevation</H2>
        <Text style={{ color: theme.text.secondary, marginTop: 4 }}>
          Flat aesthetic — use elevation only to signal interactivity or focus, not decoration.
        </Text>
      </div>

      <Grid columns={3} gap={16}>
        {SHADOWS.map(s => (
          <div
            key={s.token}
            style={{
              padding: 20,
              borderRadius: 10,
              background: theme.bg.elevated,
              border: `1px solid ${theme.stroke.secondary}`,
              boxShadow: s.value === 'none' ? 'none' : s.value,
            }}
          >
            <Stack gap={6}>
              <Text weight="medium" style={{ fontSize: 13 }}>{s.token.replace('shadow.', '')}</Text>
              <Text style={{ fontSize: 11, color: theme.text.tertiary }}>{s.usage}</Text>
            </Stack>
          </div>
        ))}
      </Grid>
    </Stack>
  );
}

function ComponentsView() {
  const theme = useHostTheme();
  return (
    <Stack gap={32}>
      <div>
        <H2>Core Components</H2>
        <Text style={{ color: theme.text.secondary, marginTop: 4 }}>
          Border radius reference and component sizing system.
        </Text>
      </div>

      <Stack gap={16}>
        <H3>Border Radius</H3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {RADII.map(r => (
            <div key={r.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 56, height: 56,
                background: '#7C3AED',
                borderRadius: r.px,
                opacity: 0.85,
              }} />
              <Text style={{ fontSize: 10, color: theme.text.secondary, fontFamily: 'monospace' }}>{r.px}</Text>
              <Text style={{ fontSize: 10, color: theme.text.tertiary }}>{r.token.replace('radius.', '')}</Text>
            </div>
          ))}
        </div>
      </Stack>

      <Divider />

      <Stack gap={16}>
        <H3>Button sizes</H3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[
            { size: 'xs', h: 28, px: 10, fs: 12 },
            { size: 'sm', h: 32, px: 12, fs: 12 },
            { size: 'md', h: 36, px: 16, fs: 14 },
            { size: 'lg', h: 44, px: 20, fs: 16 },
            { size: 'xl', h: 52, px: 24, fs: 18 },
          ].map(b => (
            <div key={b.size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button style={{
                height: b.h,
                paddingLeft: b.px,
                paddingRight: b.px,
                borderRadius: 9999,
                background: '#7C3AED',
                color: '#FFFFFF',
                fontSize: b.fs,
                fontWeight: 500,
                border: 'none',
                cursor: 'default',
                fontFamily: 'inherit',
                letterSpacing: '-0.01em',
              }}>
                Button
              </button>
              <Text style={{ fontSize: 10, color: theme.text.tertiary }}>{b.size} — {b.h}px</Text>
            </div>
          ))}
        </div>
      </Stack>

      <Divider />

      <Stack gap={16}>
        <H3>Pill / Category chip</H3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All', 'Frontend', 'Backend', 'DevOps', 'AI / ML', 'Mobile', 'Data Science'].map((label, i) => (
            <div key={label} style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: 9999,
              background: i === 0 ? '#7C3AED' : theme.bg.chrome,
              color: i === 0 ? '#FFFFFF' : theme.text.secondary,
              fontSize: 13,
              fontWeight: 500,
              border: i === 0 ? 'none' : `1px solid ${theme.stroke.secondary}`,
            }}>
              {label}
            </div>
          ))}
        </div>
      </Stack>

      <Divider />

      <Stack gap={16}>
        <H3>Stat block</H3>
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { value: '80+',   label: 'Roadmaps' },
            { value: '50k+',  label: 'Learners' },
            { value: '200+',  label: 'Contributors' },
            { value: 'Free',  label: 'Always & forever' },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1,
              padding: '16px 24px',
              borderRight: i < 3 ? `1px solid ${theme.stroke.secondary}` : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#7C3AED', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: theme.text.secondary, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Stack>

      <Divider />

      <Stack gap={16}>
        <H3>Roadmap card</H3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { title: 'Frontend Developer',    desc: 'From HTML basics to production-ready React.', topics: 102, color: '#7C3AED' },
            { title: 'Backend Engineer',       desc: 'REST APIs, databases, and server architecture.', topics: 89,  color: '#525252' },
            { title: 'DevOps & Cloud',         desc: 'CI/CD pipelines, Docker, Kubernetes.', topics: 74,  color: '#525252' },
          ].map(c => (
            <div key={c.title} style={{
              flex: '1 1 220px',
              borderRadius: 10,
              background: theme.bg.elevated,
              border: `1px solid ${theme.stroke.secondary}`,
              overflow: 'hidden',
            }}>
              <div style={{ height: 4, background: c.color }} />
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text.primary, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: theme.text.secondary, marginBottom: 12 }}>{c.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: theme.text.tertiary }}>{c.topics} topics</span>
                  <button style={{
                    padding: '5px 14px',
                    borderRadius: 9999,
                    background: '#171717',
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'default',
                    fontFamily: 'inherit',
                  }}>
                    Start →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Stack>
    </Stack>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function DesignSystem() {
  const theme = useHostTheme();
  const [tab, setTab] = useCanvasState<Tab>('tab', 'brand');

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" }}>
      {/* Sidebar nav */}
      <div style={{
        width: 180,
        flexShrink: 0,
        borderRight: `1px solid ${theme.stroke.secondary}`,
        padding: '24px 0',
        background: theme.bg.chrome,
      }}>
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#7C3AED"/>
              <path d="M16 5L9 16h7l-4 7 12-13h-7l3-5z" fill="white" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.text.primary, letterSpacing: '-0.01em' }}>
              Design System
            </span>
          </div>
        </div>

        {[
          { heading: 'Brand', items: [
            { id: 'brand' as Tab, label: 'Brand' },
          ]},
          { heading: 'Foundations', items: [
            { id: 'colors' as Tab, label: 'Colors' },
            { id: 'type' as Tab,   label: 'Type' },
            { id: 'spacing' as Tab, label: 'Spacing' },
            { id: 'shadows' as Tab, label: 'Shadows' },
          ]},
          { heading: 'UI', items: [
            { id: 'components' as Tab, label: 'Components' },
          ]},
        ].map(group => (
          <div key={group.heading} style={{ marginBottom: 8 }}>
            <div style={{
              padding: '6px 16px 4px',
              fontSize: 10,
              fontWeight: 600,
              color: theme.text.tertiary,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {group.heading}
            </div>
            {group.items.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 16px',
                  fontSize: 13,
                  fontWeight: tab === item.id ? 600 : 400,
                  color: tab === item.id ? '#7C3AED' : theme.text.secondary,
                  background: tab === item.id ? 'rgba(124,58,237,0.08)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  borderLeft: tab === item.id ? '2px solid #7C3AED' : '2px solid transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
        {tab === 'brand'      && <BrandView />}
        {tab === 'colors'     && <ColorsView />}
        {tab === 'type'       && <TypeView />}
        {tab === 'spacing'    && <SpacingView />}
        {tab === 'shadows'    && <ShadowsView />}
        {tab === 'components' && <ComponentsView />}
      </div>
    </div>
  );
}
