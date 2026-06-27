import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────

interface QuizResultPageProps {
  playerType: string;
  cardImageUrl: string;
  ovr: number;
  position: string;
  description: string;
  level: "rookie" | "semi-pro" | "academy" | "elite" | "legend";
  dna: {
    fysiskDominans: number;
    kampinstinkt: number;
    beslutningsmod: number;
    holdmentalitet: number;
    spilforstaelse: number;
    kreativitet: number;
  };
  strengthWords: string;
  strengthAnalysis: string;
  challenge: {
    text: string;
    xp: number;
    progress: number;
    total: number;
  };
  roleModels: { name: string; imageUrl?: string }[];
  isLoggedIn: boolean;
  onStartChallenge: () => void;
  onUnlockQuiz: () => void;
  onShare: () => void;
  onPremium: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const LEVELS: { key: QuizResultPageProps["level"]; label: string }[] = [
  { key: "rookie", label: "Rookie" },
  { key: "semi-pro", label: "Semi-Pro" },
  { key: "academy", label: "Academy Star" },
  { key: "elite", label: "Elite" },
  { key: "legend", label: "Legend" },
];

const DNA_META: {
  key: keyof QuizResultPageProps["dna"];
  label: string;
  color: string;
  hint: string;
}[] = [
  { key: "fysiskDominans", label: "Fysisk dominans", color: "#FF6B1A", hint: "Din krop er dit våben." },
  { key: "kampinstinkt", label: "Kampinstinkt", color: "#EF4444", hint: "Du mærker kampen i kroppen." },
  { key: "beslutningsmod", label: "Beslutningsmod", color: "#3B82F6", hint: "Du handler hurtigt og præcist." },
  { key: "holdmentalitet", label: "Holdmentalitet", color: "#10B981", hint: "Du løfter dem omkring dig." },
  { key: "spilforstaelse", label: "Spilforståelse", color: "#8B5CF6", hint: "Du ser spillet som et skakbræt." },
  { key: "kreativitet", label: "Kreativitet", color: "#F59E0B", hint: "Du finder løsninger ingen andre ser." },
];

const PREMIUM_FEATURES = [
  { label: "Personlig træningsplan" },
  { label: "Avanceret DNA-analyse" },
  { label: "Rollemodeller", highlight: true },
  { label: "Spillersammenligninger" },
  { label: "Ugentlige udfordringer" },
  { label: "Ingen reklamer" },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function Separator() {
  return (
    <div
      className="w-full my-8"
      style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, #FF6B1A44, transparent)",
      }}
    />
  );
}

function RoleModelRow({ roleModels }: { roleModels: QuizResultPageProps["roleModels"] }) {
  return (
    <div className="flex items-center gap-2 mt-4">
      <span style={{ color: "#6B7280", fontSize: 14 }}>🔒</span>
      <div className="flex -space-x-2">
        {[0, 1, 2].map((i) => {
          const rm = roleModels[i];
          return (
            <div
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
              style={{
                background: "#374151",
                borderColor: "#111827",
                filter: "blur(2px) grayscale(1)",
                opacity: 0.4,
                color: "#fff",
                fontSize: 10,
              }}
            >
              {rm?.imageUrl ? (
                <img src={rm.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                rm?.name?.slice(0, 2).toUpperCase() ?? "??"
              )}
            </div>
          );
        })}
      </div>
      <span style={{ color: "#6B7280", fontSize: 13 }}>
        Dine rollemodeller er låst —{" "}
        <button
          style={{ color: "#FF6B1A", textDecoration: "none", background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0 }}
        >
          Lås op →
        </button>
      </span>
    </div>
  );
}

function DnaCard({
  value,
  label,
  color,
  hint,
}: {
  value: number;
  label: string;
  color: string;
  hint: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: "#1F2937", border: "1px solid #374151" }}
    >
      <span className="text-4xl font-black" style={{ color, lineHeight: 1 }}>
        {value}
      </span>
      <span className="text-sm font-semibold text-white">{label}</span>
      <span className="text-xs" style={{ color: "#ffffff88" }}>
        {hint}
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function QuizResultPage({
  playerType,
  cardImageUrl,
  ovr,
  position,
  description,
  level,
  dna,
  strengthWords,
  strengthAnalysis,
  challenge,
  roleModels,
  isLoggedIn,
  onStartChallenge,
  onUnlockQuiz,
  onShare,
  onPremium,
}: QuizResultPageProps) {
  const radarData = DNA_META.map((d) => ({
    subject: d.label,
    value: dna[d.key],
    fullMark: 100,
  }));

  const pct =
    challenge.total > 0
      ? Math.round((challenge.progress / challenge.total) * 100)
      : 0;

  return (
    <div style={{ background: "#F8F7F4", minHeight: "100vh" }}>
      <div style={{ maxWidth: 430, margin: "0 auto", paddingBottom: 48 }}>

        {/* ── SEKTION 1: HERO ─────────────────────────────────────────── */}
        <div style={{ background: "#111827", borderRadius: "0 0 24px 24px" }}>

          {/* Del-knap øverst */}
          <div className="flex justify-end px-4 pt-4">
            <button
              onClick={onShare}
              className="flex items-center gap-1"
              style={{ background: "none", border: "none", color: "#ffffff88", fontSize: 13, cursor: "pointer" }}
            >
              <ShareIcon />
              Del dit kort
            </button>
          </div>

          {/* FIFA-kort */}
          <div className="flex flex-col items-center px-6 pb-4 pt-2">
            <img
              src={cardImageUrl}
              alt={playerType}
              style={{
                width: "100%",
                maxWidth: 280,
                borderRadius: 16,
                display: "block",
              }}
            />

            {/* Rookie-badge */}
            <div
              className="flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "#FF6B1A", color: "#fff", fontSize: 12 }}
            >
              ⭐ Rookie
            </div>
          </div>
        </div>

        {/* Spillertype-info på lys baggrund */}
        <div className="px-4 pt-5">
          <p className="uppercase font-bold tracking-widest mb-1" style={{ fontSize: 11, color: "#FF6B1A" }}>
            Din spillertype
          </p>
          <h1 className="font-black" style={{ fontSize: 28, color: "#111827", marginBottom: 6 }}>
            {playerType}
          </h1>
          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, marginBottom: 16 }}>
            {description}
          </p>

          {/* Niveau-progression */}
          <div className="flex gap-2 flex-wrap mb-4">
            {LEVELS.map((l) => {
              const active = l.key === level;
              return (
                <span
                  key={l.key}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={
                    active
                      ? { background: "#FF6B1A", color: "#fff" }
                      : { background: "transparent", color: "#9CA3AF", border: "1px solid #D1D5DB" }
                  }
                >
                  {l.label}
                </span>
              );
            })}
          </div>

          {/* Låste rollemodeller */}
          <RoleModelRow roleModels={roleModels} />

          {/* CTA-knapper */}
          <div className="flex flex-col gap-2 mt-5">
            <button
              onClick={onStartChallenge}
              className="w-full rounded-xl font-bold text-white"
              style={{ background: "#FF6B1A", border: "none", padding: "14px 20px", fontSize: 15, cursor: "pointer" }}
            >
              Start dagens udfordring →
            </button>
            <button
              onClick={onUnlockQuiz}
              className="w-full rounded-xl font-semibold"
              style={{
                background: "transparent",
                border: "1.5px solid #D1D5DB",
                color: "#374151",
                padding: "13px 20px",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Lås op for avanceret quiz
            </button>
          </div>
        </div>

        <div className="px-4">
          <Separator />
        </div>

        {/* ── SEKTION 2: DNA-PROFIL ───────────────────────────────────── */}
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#111827", border: "1px solid #FF6B1A44" }}>
          <div className="px-5 pt-5 pb-2">
            <p className="uppercase font-bold tracking-widest" style={{ fontSize: 11, color: "#FF6B1A" }}>
              🧬 Din DNA-profil
            </p>
            <p style={{ fontSize: 13, color: "#ffffff88", marginTop: 4, marginBottom: 16 }}>
              Se hvordan dine egenskaber former din spillestil.
            </p>

            {/* Radar */}
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#ffffff22" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#ffffff88", fontSize: 10, fontWeight: 600 }}
                  />
                  <Radar
                    name="DNA"
                    dataKey="value"
                    stroke="#FF6B1A"
                    fill="#FF6B1A"
                    fillOpacity={0.25}
                    dot={{ fill: "#FF6B1A", r: 3 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Dimensions-grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {DNA_META.map((d) => (
                <DnaCard
                  key={d.key}
                  value={dna[d.key]}
                  label={d.label}
                  color={d.color}
                  hint={d.hint}
                />
              ))}
            </div>

            {/* Styrke-ord */}
            <div className="mt-6 pb-5 text-center">
              <p
                className="font-black uppercase tracking-widest"
                style={{ fontSize: 22, color: "#fff", letterSpacing: "0.12em" }}
              >
                {strengthWords}
              </p>
              <p style={{ fontSize: 14, color: "#ffffff88", marginTop: 8, lineHeight: 1.7 }}>
                {strengthAnalysis}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4">
          <Separator />
        </div>

        {/* ── SEKTION 3: DAGENS UDFORDRING ────────────────────────────── */}
        <div
          className="mx-4 rounded-2xl p-5"
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderLeft: "4px solid #10B981",
          }}
        >
          <h2 className="font-bold" style={{ fontSize: 18, color: "#111827", marginBottom: 12 }}>
            Din første udfordring er klar
          </h2>

          {/* Udfordringskort */}
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{ background: "#111827" }}
          >
            <p className="font-semibold text-white" style={{ fontSize: 14 }}>
              {challenge.text}
            </p>
            <p style={{ fontSize: 12, color: "#ffffff66", marginTop: 4 }}>
              Personlig udfordring · {playerType} · 7 dage
            </p>
          </div>

          {/* XP-række */}
          <div className="flex items-center gap-3 mb-1">
            <span
              className="rounded-full px-2 py-0.5 font-bold text-xs"
              style={{ background: "#D1FAE5", color: "#065F46" }}
            >
              +{challenge.xp} XP
            </span>
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "#E5E7EB" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: "#10B981", transition: "width 0.4s" }}
              />
            </div>
            <span style={{ fontSize: 12, color: "#6B7280", whiteSpace: "nowrap" }}>
              {challenge.progress} / {challenge.total}
            </span>
          </div>
          <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 16 }}>
            500 XP giver kortopgradering
          </p>

          <button
            onClick={onStartChallenge}
            className="w-full rounded-xl font-bold text-white"
            style={{ background: "#10B981", border: "none", padding: "13px 20px", fontSize: 15, cursor: "pointer" }}
          >
            Start udfordring →
          </button>

          {!isLoggedIn && (
            <p className="flex items-center justify-center gap-1 mt-3" style={{ fontSize: 12, color: "#9CA3AF" }}>
              🔒 Log ind for at gemme dine fremskridt
            </p>
          )}
        </div>

        <div className="px-4">
          <Separator />
        </div>

        {/* ── SEKTION 4: PREMIUM ──────────────────────────────────────── */}
        <div
          className="mx-4 rounded-2xl p-5"
          style={{ background: "#111827", border: "1px solid #8B5CF644" }}
        >
          <h2 className="font-black text-white" style={{ fontSize: 20, marginBottom: 6 }}>
            Vil du udvikle dig hurtigere?
          </h2>
          <p style={{ fontSize: 14, color: "#ffffff88", lineHeight: 1.6, marginBottom: 20 }}>
            Få adgang til avancerede analyser, personlige træningsplaner og professionelle værktøjer.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {PREMIUM_FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-2">
                <span style={{ color: "#8B5CF6", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>✓</span>
                <span
                  style={{
                    fontSize: 13,
                    color: f.highlight ? "#fff" : "#ffffff88",
                    fontWeight: f.highlight ? 600 : 400,
                  }}
                >
                  {f.label}
                </span>
              </div>
            ))}
          </div>

          <p className="font-black text-white mb-4" style={{ fontSize: 28 }}>
            29 kr<span style={{ fontSize: 16, fontWeight: 400, color: "#ffffff88" }}>/md</span>
          </p>

          <button
            onClick={onPremium}
            className="w-full rounded-xl font-bold text-white mb-2"
            style={{ background: "#8B5CF6", border: "none", padding: "14px 20px", fontSize: 15, cursor: "pointer" }}
          >
            Lås op for Premium — 29 kr/md →
          </button>
          <button
            className="w-full rounded-xl font-semibold"
            style={{
              background: "transparent",
              border: "1.5px solid #4B5563",
              color: "#ffffff88",
              padding: "12px 20px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Se hvad der er inkluderet
          </button>
        </div>

        <div className="px-4">
          <Separator />
        </div>

        {/* ── SEKTION 5: ØVRIGE HANDLINGER ────────────────────────────── */}
        <div className="px-4 grid grid-cols-3 gap-2">
          {[
            { label: "Del dit kort", icon: <ShareIcon />, onClick: onShare },
            { label: "Avanceret quiz", icon: <BrainIcon />, onClick: onUnlockQuiz },
            { label: "Se Premium", icon: <StarIcon />, onClick: onPremium },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              className="flex flex-col items-center gap-1 rounded-xl py-3"
              style={{
                background: "transparent",
                border: "1px solid #D1D5DB",
                color: "#9CA3AF",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

// ── Inline SVG icons ─────────────────────────────────────────────────────────

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
