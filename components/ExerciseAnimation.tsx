'use client'

import type { ReactElement } from 'react'

/* ─────────────────────────────────────────────────────────────────────────────
   Exercise → animation-category map
   ───────────────────────────────────────────────────────────────────────────── */
export const EXERCISE_ANIM: Record<string, string> = {
  knee_push_up: 'pushup', full_push_up: 'pushup', diamond_push_up: 'pushup',
  archer_push_up: 'pushup', negative_push_up: 'pushup', pause_push_up: 'pushup',
  plank: 'plank', extended_plank: 'plank', plank_shoulder_taps: 'plank',
  side_plank_left: 'side_plank', side_plank_right: 'side_plank',
  pike_hold: 'pike', pike_push_up: 'pike', wall_pike_push_up: 'pike',
  dead_hang: 'hang', scapular_pull: 'hang',
  chin_up_negative: 'pullup', pull_up_full: 'pullup', tuck_back_lever: 'pullup',
  knee_raise_hang: 'knee_raise', l_hang: 'knee_raise',
  dip_negative: 'dip',
  squat: 'squat', bulgarian_split_squat: 'squat', pistol_squat: 'squat',
  hip_bridge: 'bridge',
  nordic_curl: 'nordic',
  australian_row: 'row', australian_row_single: 'row',
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared helpers
   ───────────────────────────────────────────────────────────────────────────── */
const DUR = '2.2s'
const SPLINE = '.42 0 .58 1;.42 0 .58 1'
const KT = '0;.5;1'

/** SMIL <animate> shorthand — animates a single SVG attribute on the parent */
function A({ n, v }: { n: string; v: string }) {
  return (
    <animate
      attributeName={n} dur={DUR} values={v}
      repeatCount="indefinite" calcMode="spline"
      keySplines={SPLINE} keyTimes={KT}
    />
  )
}

const FIG = '#d1d5db'  // figure color
const ACC = '#4CAF50'  // green accent (head + equipment highlights)
const EQP = '#6b7280'  // bar / ground color

/* ─────────────────────────────────────────────────────────────────────────────
   1. PUSH-UP  (side view — arms anchored to ground via SMIL)
   ───────────────────────────────────────────────────────────────────────────── */
function PushUp() {
  return (
    <svg viewBox="0 0 260 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ground */}
      <line x1="0" y1="150" x2="260" y2="150" stroke={EQP} strokeWidth="2"/>
      {/* feet (static) */}
      <ellipse cx="22" cy="143" rx="10" ry="7" fill={ACC}/>
      {/* torso — both endpoints animate */}
      <line x1="45" x2="148" stroke={FIG} strokeWidth="6" strokeLinecap="round">
        <A n="y1" v="136;150;136"/><A n="y2" v="122;136;122"/>
      </line>
      {/* head */}
      <circle cx="163" r="13" stroke={ACC} strokeWidth="3">
        <A n="cy" v="110;124;110"/>
      </circle>
      {/* left arm — y1 (shoulder) animates, y2 (hand on ground) is static */}
      <line x1="75" y2="150" x2="75" stroke={FIG} strokeWidth="4" strokeLinecap="round">
        <A n="y1" v="130;150;130"/>
      </line>
      {/* right arm */}
      <line x1="132" y2="150" x2="132" stroke={FIG} strokeWidth="4" strokeLinecap="round">
        <A n="y1" v="122;136;122"/>
      </line>
      {/* legs — hip animates, feet static */}
      <line x2="22" y2="143" x1="45" stroke={FIG} strokeWidth="5" strokeLinecap="round">
        <A n="y1" v="136;150;136"/>
      </line>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. PULL-UP  (front view — whole figure rises toward bar)
   ───────────────────────────────────────────────────────────────────────────── */
function PullUp() {
  return (
    <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes pu-rise { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-58px)} }
        .pu-g { animation: pu-rise 2.4s ease-in-out infinite; transform-origin: 100px 40px; }
      `}</style>
      {/* bar (static) */}
      <rect x="30" y="32" width="140" height="12" rx="6" fill={EQP}/>
      {/* figure group — rises up */}
      <g className="pu-g">
        {/* arms */}
        <line x1="82" y1="44" x2="78" y2="90" stroke={FIG} strokeWidth="4" strokeLinecap="round"/>
        <line x1="118" y1="44" x2="122" y2="90" stroke={FIG} strokeWidth="4" strokeLinecap="round"/>
        {/* head */}
        <circle cx="100" cy="100" r="14" stroke={ACC} strokeWidth="3"/>
        {/* torso */}
        <line x1="100" y1="114" x2="100" y2="165" stroke={FIG} strokeWidth="6" strokeLinecap="round"/>
        {/* left leg */}
        <line x1="100" y1="165" x2="88" y2="210" stroke={FIG} strokeWidth="5" strokeLinecap="round"/>
        {/* right leg */}
        <line x1="100" y1="165" x2="112" y2="210" stroke={FIG} strokeWidth="5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. DEAD HANG  (front view — gentle pendulum swing)
   ───────────────────────────────────────────────────────────────────────────── */
function Hang() {
  return (
    <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes hang-sway { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(4deg)} }
        .hang-g { animation: hang-sway 2.8s ease-in-out infinite; transform-origin: 100px 38px; }
      `}</style>
      <rect x="30" y="30" width="140" height="12" rx="6" fill={EQP}/>
      <g className="hang-g">
        <line x1="84" y1="42" x2="80" y2="90" stroke={FIG} strokeWidth="4" strokeLinecap="round"/>
        <line x1="116" y1="42" x2="120" y2="90" stroke={FIG} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="100" cy="100" r="14" stroke={ACC} strokeWidth="3"/>
        <line x1="100" y1="114" x2="100" y2="165" stroke={FIG} strokeWidth="6" strokeLinecap="round"/>
        <line x1="100" y1="165" x2="88" y2="210" stroke={FIG} strokeWidth="5" strokeLinecap="round"/>
        <line x1="100" y1="165" x2="112" y2="210" stroke={FIG} strokeWidth="5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. PLANK  (side view — subtle breathing pulse + "HOLD" label)
   ───────────────────────────────────────────────────────────────────────────── */
function Plank() {
  return (
    <svg viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes pl-pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
        .pl-g { animation: pl-pulse 2.2s ease-in-out infinite; }
      `}</style>
      <line x1="0" y1="140" x2="260" y2="140" stroke={EQP} strokeWidth="2"/>
      {/* forearms */}
      <line x1="75" y1="115" x2="75" y2="140" stroke={FIG} strokeWidth="4" strokeLinecap="round"/>
      <line x1="130" y1="108" x2="130" y2="140" stroke={FIG} strokeWidth="4" strokeLinecap="round"/>
      <g className="pl-g">
        {/* body */}
        <line x1="45" y1="128" x2="155" y2="112" stroke={FIG} strokeWidth="7" strokeLinecap="round"/>
        {/* head */}
        <circle cx="168" cy="102" r="13" stroke={ACC} strokeWidth="3"/>
        {/* feet */}
        <ellipse cx="26" cy="133" rx="9" ry="7" fill={ACC}/>
      </g>
      <text x="130" y="158" textAnchor="middle" fill={ACC} fontSize="13" fontWeight="bold">HOLD</text>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. SIDE PLANK  (tilted — pulse)
   ───────────────────────────────────────────────────────────────────────────── */
function SidePlank() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes sp-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .sp-g { animation: sp-pulse 2.2s ease-in-out infinite; }
      `}</style>
      {/* ground */}
      <line x1="30" y1="185" x2="195" y2="185" stroke={EQP} strokeWidth="2"/>
      <g className="sp-g">
        {/* forearm (bottom support) */}
        <line x1="60" y1="145" x2="60" y2="185" stroke={FIG} strokeWidth="5" strokeLinecap="round"/>
        {/* body (diagonal) */}
        <line x1="60" y1="145" x2="170" y2="100" stroke={FIG} strokeWidth="7" strokeLinecap="round"/>
        {/* head */}
        <circle cx="178" cy="88" r="13" stroke={ACC} strokeWidth="3"/>
        {/* top arm (raised) */}
        <line x1="125" y1="118" x2="140" y2="85" stroke={FIG} strokeWidth="4" strokeLinecap="round"/>
        {/* feet (stacked) */}
        <ellipse cx="62" cy="180" rx="14" ry="7" fill={ACC} opacity=".8"/>
      </g>
      <text x="110" y="205" textAnchor="middle" fill={ACC} fontSize="13" fontWeight="bold">HOLD</text>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. PIKE  (inverted-V — head drops toward ground for push variant)
   ───────────────────────────────────────────────────────────────────────────── */
function Pike() {
  return (
    <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ground */}
      <line x1="10" y1="175" x2="250" y2="175" stroke={EQP} strokeWidth="2"/>
      {/* feet (static) */}
      <ellipse cx="200" cy="168" rx="12" ry="8" fill={ACC}/>
      {/* hands (static) */}
      <ellipse cx="58" cy="170" rx="12" ry="8" fill={ACC}/>
      {/* left leg (foot→hip) */}
      <line x1="200" y1="168" x2="130" stroke={FIG} strokeWidth="5" strokeLinecap="round">
        <A n="y2" v="60;64;60"/>
      </line>
      {/* left arm (hand→hip) */}
      <line x1="58" y1="170" x2="130" stroke={FIG} strokeWidth="5" strokeLinecap="round">
        <A n="y2" v="60;64;60"/>
      </line>
      {/* head — dips toward ground for pike push-up */}
      <circle r="13" stroke={ACC} strokeWidth="3">
        <A n="cx" v="75;75;75"/><A n="cy" v="155;175;155"/>
      </circle>
      {/* neck */}
      <line x2="75" stroke={FIG} strokeWidth="4" strokeLinecap="round">
        <A n="x1" v="85;85;85"/><A n="y1" v="88;100;88"/>
        <A n="y2" v="142;175;142"/>
      </line>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. DIP  (front view — body between two bars)
   ───────────────────────────────────────────────────────────────────────────── */
function Dip() {
  return (
    <svg viewBox="0 0 220 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes dip-move { 0%,100%{transform:translateY(0)} 50%{transform:translateY(40px)} }
        .dip-g { animation: dip-move 2.2s ease-in-out infinite; }
      `}</style>
      {/* bar handles */}
      <rect x="28" y="65" width="18" height="80" rx="9" fill={EQP}/>
      <rect x="174" y="65" width="18" height="80" rx="9" fill={EQP}/>
      {/* figure */}
      <g className="dip-g">
        {/* arms */}
        <line x1="68" y1="72" x2="82" y2="100" stroke={FIG} strokeWidth="5" strokeLinecap="round"/>
        <line x1="152" y1="72" x2="138" y2="100" stroke={FIG} strokeWidth="5" strokeLinecap="round"/>
        {/* head */}
        <circle cx="110" cy="72" r="14" stroke={ACC} strokeWidth="3"/>
        {/* torso */}
        <line x1="110" y1="86" x2="110" y2="140" stroke={FIG} strokeWidth="6" strokeLinecap="round"/>
        {/* legs */}
        <line x1="110" y1="140" x2="95" y2="185" stroke={FIG} strokeWidth="5" strokeLinecap="round"/>
        <line x1="110" y1="140" x2="125" y2="185" stroke={FIG} strokeWidth="5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   8. SQUAT  (side view — leg path morphs via SMIL)
   ───────────────────────────────────────────────────────────────────────────── */
function Squat() {
  return (
    <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ground */}
      <line x1="20" y1="210" x2="180" y2="210" stroke={EQP} strokeWidth="2"/>
      {/* feet (static) */}
      <ellipse cx="92" cy="204" rx="16" ry="8" fill={ACC}/>
      {/* leg path: M hip L knee L foot — morphs from standing to squat */}
      <path stroke={FIG} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="d"
          dur={DUR}
          values="M 105 115 L 108 165 L 95 205;M 75 160 L 128 185 L 95 205;M 105 115 L 108 165 L 95 205"
          repeatCount="indefinite" calcMode="spline" keySplines={SPLINE} keyTimes={KT}/>
      </path>
      {/* torso */}
      <line x1="105" x2="105" stroke={FIG} strokeWidth="6" strokeLinecap="round">
        <A n="y1" v="72;115;72"/><A n="y2" v="115;160;115"/>
      </line>
      {/* head */}
      <circle cx="105" r="14" stroke={ACC} strokeWidth="3">
        <A n="cy" v="58;100;58"/>
      </circle>
      {/* arms (by sides / forward during squat) */}
      <line stroke={FIG} strokeWidth="4" strokeLinecap="round">
        <A n="x1" v="105;95;105"/><A n="y1" v="85;115;85"/>
        <A n="x2" v="88;62;88"/><A n="y2" v="130;145;130"/>
      </line>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   9. HIP BRIDGE  (side view — hips raise from floor)
   ───────────────────────────────────────────────────────────────────────────── */
function Bridge() {
  return (
    <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ground */}
      <line x1="10" y1="165" x2="250" y2="165" stroke={EQP} strokeWidth="2"/>
      {/* head (static, on ground) */}
      <circle cx="36" cy="152" r="13" stroke={ACC} strokeWidth="3"/>
      {/* upper back (static) */}
      <line x1="49" y1="155" x2="90" y2="163" stroke={FIG} strokeWidth="6" strokeLinecap="round"/>
      {/* feet (static, on ground) */}
      <ellipse cx="210" cy="159" rx="14" ry="8" fill={ACC}/>
      {/* lower body — hips animate up */}
      <line x1="90" x2="170" stroke={FIG} strokeWidth="7" strokeLinecap="round">
        <A n="y1" v="163;118;163"/><A n="y2" v="157;125;157"/>
      </line>
      {/* shins — top (knee) animates, foot static */}
      <line x2="208" y2="160" x1="170" stroke={FIG} strokeWidth="5" strokeLinecap="round">
        <A n="y1" v="157;125;157"/>
      </line>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   10. ROW  (side view — body pulls toward bar)
   ───────────────────────────────────────────────────────────────────────────── */
function Row() {
  return (
    <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* bar / table edge */}
      <line x1="20" y1="55" x2="240" y2="55" stroke={EQP} strokeWidth="8" strokeLinecap="round"/>
      {/* ground */}
      <line x1="10" y1="180" x2="250" y2="180" stroke={EQP} strokeWidth="2"/>
      {/* feet (static) */}
      <ellipse cx="50" cy="174" rx="14" ry="8" fill={ACC}/>
      {/* body (diagonal, torso animates toward bar) */}
      <line x1="70" x2="200" stroke={FIG} strokeWidth="7" strokeLinecap="round">
        <A n="y1" v="165;130;165"/><A n="y2" v="120;82;120"/>
      </line>
      {/* head */}
      <circle r="13" stroke={ACC} strokeWidth="3">
        <A n="cx" v="215;215;215"/><A n="cy" v="108;70;108"/>
      </circle>
      {/* arms: hand at bar (y=55), shoulder follows body */}
      <line x1="195" y2="55" x2="195" stroke={FIG} strokeWidth="4" strokeLinecap="round">
        <A n="y1" v="110;72;110"/>
      </line>
      {/* legs */}
      <line x1="70" x2="52" y2="174" stroke={FIG} strokeWidth="5" strokeLinecap="round">
        <A n="y1" v="165;130;165"/>
      </line>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   11. NORDIC CURL  (side view — upper body falls forward from knees)
   ───────────────────────────────────────────────────────────────────────────── */
function Nordic() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ground */}
      <line x1="10" y1="180" x2="210" y2="180" stroke={EQP} strokeWidth="2"/>
      {/* feet / ankles anchored (with constraint bar) */}
      <rect x="55" y="170" width="60" height="12" rx="5" fill={EQP}/>
      {/* thighs (kneeling, static) */}
      <line x1="82" y1="140" x2="82" y2="175" stroke={FIG} strokeWidth="6" strokeLinecap="round"/>
      <line x1="100" y1="140" x2="100" y2="175" stroke={FIG} strokeWidth="6" strokeLinecap="round"/>
      {/* upper body — rotates forward */}
      <line x2="91" stroke={FIG} strokeWidth="7" strokeLinecap="round">
        <A n="x1" v="91;115;91"/><A n="y1" v="100;158;100"/>
        <A n="y2" v="140;140;140"/>
      </line>
      {/* head */}
      <circle r="14" stroke={ACC} strokeWidth="3">
        <A n="cx" v="91;110;91"/><A n="cy" v="87;145;87"/>
      </circle>
      {/* arms (extended forward as body falls) */}
      <line stroke={FIG} strokeWidth="4" strokeLinecap="round">
        <A n="x1" v="91;105;91"/><A n="y1" v="108;148;108"/>
        <A n="x2" v="72;145;72"/><A n="y2" v="125;158;125"/>
      </line>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   12. KNEE RAISE  (front view — legs swing up while hanging)
   ───────────────────────────────────────────────────────────────────────────── */
function KneeRaise() {
  return (
    <svg viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* bar */}
      <rect x="30" y="30" width="140" height="12" rx="6" fill={EQP}/>
      {/* arms */}
      <line x1="82" y1="42" x2="80" y2="90" stroke={FIG} strokeWidth="4" strokeLinecap="round"/>
      <line x1="118" y1="42" x2="120" y2="90" stroke={FIG} strokeWidth="4" strokeLinecap="round"/>
      {/* head + torso (static) */}
      <circle cx="100" cy="100" r="14" stroke={ACC} strokeWidth="3"/>
      <line x1="100" y1="114" x2="100" y2="165" stroke={FIG} strokeWidth="6" strokeLinecap="round"/>
      {/* legs — raise as knees come up */}
      <line x1="100" x2="88" stroke={FIG} strokeWidth="5" strokeLinecap="round">
        <A n="y1" v="165;165;165"/>
        <A n="y2" v="210;142;210"/>
      </line>
      <line x1="100" x2="112" stroke={FIG} strokeWidth="5" strokeLinecap="round">
        <A n="y1" v="165;165;165"/>
        <A n="y2" v="210;142;210"/>
      </line>
      {/* shins (fold at knee as legs raise) */}
      <line stroke={FIG} strokeWidth="4" strokeLinecap="round">
        <A n="x1" v="88;88;88"/><A n="y1" v="210;142;210"/>
        <A n="x2" v="78;100;78"/><A n="y2" v="235;168;235"/>
      </line>
      <line stroke={FIG} strokeWidth="4" strokeLinecap="round">
        <A n="x1" v="112;112;112"/><A n="y1" v="210;142;210"/>
        <A n="x2" v="122;100;122"/><A n="y2" v="235;168;235"/>
      </line>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Category → component map
   ───────────────────────────────────────────────────────────────────────────── */
const ANIM_MAP: Record<string, () => ReactElement> = {
  pushup: PushUp, pullup: PullUp, hang: Hang, plank: Plank,
  side_plank: SidePlank, pike: Pike, dip: Dip, squat: Squat,
  bridge: Bridge, row: Row, nordic: Nordic, knee_raise: KneeRaise,
}

/* ─────────────────────────────────────────────────────────────────────────────
   Public component
   ───────────────────────────────────────────────────────────────────────────── */
export default function ExerciseAnimation({ exerciseId }: { exerciseId: string }) {
  const key = EXERCISE_ANIM[exerciseId] ?? 'pushup'
  const Anim = ANIM_MAP[key] ?? PushUp
  return <Anim />
}
