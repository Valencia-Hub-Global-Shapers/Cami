import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { c, sans, serif, SAFE_X } from '../look';
import { APP, T } from '../timing';
import { CHECKED, PROGRAMMES, SAID } from '../data';
import { LabelCaps } from '../ui/Base';
import {
  Badge,
  BROWSER,
  Browser,
  Card,
  CONTENT_TOP,
  Cursor,
  Field,
  HEADER_SCALE,
  LOCKUP,
  LOCKUP_X,
  Lockup,
  Pill,
  Select,
  Waypoint,
} from '../ui/App';
import { Basemap, MAP, project } from '../ui/MapPanel';
import { enter, glide, leave, lerp, rise, typed } from '../ui/motion';

// This scene starts LEAD frames before T.app.from so the lockup can fly from
// the reveal into the browser header. `a` is the app's own clock.
export const LEAD = 40;

const CAPTIONS = [
  {
    at: APP.directory,
    label: 'The directory',
    title: 'Every programme in one place.',
    body: 'What each one covers, who is eligible and its expected dates, with a link to the official source.',
  },
  {
    at: APP.filters,
    label: 'Filters',
    title: 'Find the programmes that fit.',
    body: 'By country, degree level and status. A filtered view can be shared as a link.',
  },
  {
    at: APP.map,
    label: 'Map',
    title: 'See where each opportunity is.',
    body: 'Every programme placed on the map, with its details one click away.',
  },
  {
    at: APP.detail,
    label: 'Programme page',
    title: 'Everything needed to prepare an application.',
    body: 'Coverage, eligibility, required documents and dates, and the date it was last checked.',
  },
  {
    at: APP.submit,
    label: 'Submissions',
    title: 'Any Shaper, from any hub, can add a programme.',
    body: 'A public form, no account needed. The directory grows with every hub that takes part.',
  },
  {
    at: APP.review,
    label: 'Review',
    title: 'Checked before it is published.',
    body: 'A review team checks each submission against the official source. Only then does it go live.',
  },
];

const Caption = ({ a }: { a: number }) => (
  <>
    {CAPTIONS.map((cap, i) => {
      const end = i + 1 < CAPTIONS.length ? CAPTIONS[i + 1].at : APP.out;
      const from = cap.at + 8;
      const to = end - 18;
      if (a < from - 2 || a > to + 20) return null;
      return (
        <div key={cap.label} style={{ position: 'absolute', left: SAFE_X, top: 330, width: 500 }}>
          <div style={rise(a, from, to, 20)}>
            <LabelCaps size={17} color={c.route} style={{ letterSpacing: 3 }}>
              {cap.label}
            </LabelCaps>
          </div>
          <div
            style={{
              ...rise(a, from + 5, to, 24),
              fontFamily: serif,
              fontWeight: 600,
              fontSize: 54,
              lineHeight: 1.12,
              color: c.ink,
              marginTop: 20,
            }}
          >
            {cap.title}
          </div>
          <div
            style={{
              ...rise(a, from + 12, to, 24),
              fontFamily: sans,
              fontSize: 25,
              lineHeight: 1.5,
              color: c.muted,
              marginTop: 24,
            }}
          >
            {cap.body}
          </div>
        </div>
      );
    })}
  </>
);

// --- Directory, filters and map share one page ---------------------------

const DROPDOWNS = [
  { at: 330, label: 'Country', x: 286, options: ['All countries', 'Spain'], pick: 1 },
  { at: 392, label: 'Degree level', x: 490, options: ['All levels', 'Bachelor', "Master's", 'PhD'], pick: 2 },
  {
    at: 454,
    label: 'Status',
    x: 694,
    options: ['All statuses', 'Open', 'Expected next call', 'Renewal only', 'Monitor'],
    pick: 2,
  },
];
const PICK_DELAY = 24;

const DirectoryPage = ({ a }: { a: number }) => {
  const mapOn = glide(a, APP.map + 26, 24);
  const filtered = a >= DROPDOWNS[2].at + PICK_DELAY;
  const cut = enter(a, DROPDOWNS[2].at + PICK_DELAY, 26);
  const scroll = glide(a, 120, 110) * (1 - glide(a, 290, 30));
  const values = DROPDOWNS.map((d) => (a >= d.at + PICK_DELAY ? d.options[d.pick] : d.options[0]));

  return (
    <AbsoluteFill style={{ padding: '26px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 36, color: c.ink }}>Directory</div>
          <div style={{ fontFamily: sans, fontSize: 15, color: c.faint, marginTop: 2 }}>
            {filtered ? '3 of 4 programmes' : '4 programmes'}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            border: `1px solid ${c.border}`,
            borderRadius: 999,
            padding: 3,
            fontFamily: sans,
            fontSize: 15,
            fontWeight: 500,
            background: c.white,
          }}
        >
          {['List', 'Map'].map((v, i) => {
            const on = i === 0 ? 1 - mapOn : mapOn;
            return (
              <span
                key={v}
                style={{
                  padding: '6px 20px',
                  borderRadius: 999,
                  background: `rgba(33,30,25,${on})`,
                  color: on > 0.5 ? c.cream : c.ink,
                }}
              >
                {v}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 20, alignItems: 'flex-end' }}>
        <Field label="Search" value="" placeholder="University or programme" width={240} />
        {DROPDOWNS.map((d, i) => (
          <Select
            key={d.label}
            label={d.label}
            value={values[i]}
            width={190}
            active={a >= d.at - 4 && a < d.at + PICK_DELAY + 6}
          />
        ))}
      </div>

      {/* Cards, scrolling under the filter bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 190, bottom: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 32,
          right: 32,
          top: 0,
          height: 800,
          opacity: 1 - mapOn,
          transform: `translateY(${-scroll * 170 + mapOn * 20}px)`,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {PROGRAMMES.map((p, i) => {
          const gone = p.status !== 'expected' ? cut : 0;
          return (
            <div key={p.id} style={{ ...rise(a, 6 + i * 7, undefined, 30), opacity: enter(a, 6 + i * 7, 26) * (1 - gone) }}>
              <Card p={p} style={{ transform: `scale(${1 - gone * 0.04})` }} />
            </div>
          );
        })}
      </div>
      </div>

      {mapOn > 0 && <MapView a={a} on={mapOn} />}

      {DROPDOWNS.map((d) => {
        const open = enter(a, d.at, 10) * (1 - leave(a, d.at + PICK_DELAY, 8));
        if (open <= 0) return null;
        const hl = a >= d.at + 12 ? d.pick : 0;
        return (
          <div
            key={d.label}
            style={{
              position: 'absolute',
              left: d.x,
              top: 166,
              width: 230,
              background: c.white,
              border: `1px solid ${c.border}`,
              borderRadius: 10,
              boxShadow: '0 12px 30px rgba(33,30,25,0.14)',
              opacity: open,
              transform: `translateY(${(1 - open) * -8}px)`,
              padding: 6,
              fontFamily: sans,
              fontSize: 15,
              zIndex: 10,
            }}
          >
            {d.options.map((o, i) => (
              <div
                key={o}
                style={{
                  padding: '8px 12px',
                  borderRadius: 7,
                  background: i === hl ? c.sand : 'transparent',
                  color: c.ink,
                }}
              >
                {o}
              </div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const PINS = PROGRAMMES.filter((p) => p.status === 'expected');
const POPUP_AT = APP.map + 160;
const OPEN_AT = APP.detail - 30;

const Pin = ({ x, y, drop, color }: { x: number; y: number; drop: number; color: string }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 15,
      top: y - 40 - (1 - drop) * 50,
      opacity: drop,
    }}
  >
    <svg width="30" height="40" viewBox="0 0 30 40">
      <path d="M15 39 C15 39 2 23 2 14 A13 13 0 0 1 28 14 C28 23 15 39 15 39 Z" fill={color} stroke="#fff" strokeWidth="2" />
      <circle cx="15" cy="14" r="5" fill="#fff" />
    </svg>
  </div>
);

const MapView = ({ a, on }: { a: number; on: number }) => {
  const uab = PINS[0];
  const pos = project(uab.lon, uab.lat);
  const popup = enter(a, POPUP_AT, 20);
  const grow = glide(a, OPEN_AT, 30);
  return (
    <div
      style={{
        position: 'absolute',
        left: 32,
        top: 190,
        width: MAP.w,
        height: MAP.h,
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${c.border}`,
        opacity: on,
        transform: `scale(${lerp(on, 0.98, 1)})`,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${lerp(glide(a, APP.map + 40, 200), 1, 1.08)})`, transformOrigin: `${pos.x}px ${pos.y}px` }}>
        <Basemap />
        {PINS.map((p, i) => {
          const q = project(p.lon, p.lat);
          return <Pin key={p.id} x={q.x} y={q.y} drop={enter(a, APP.map + 64 + i * 10, 22)} color={c.terracotta} />;
        })}
      </div>
      {popup > 0 && (
        <div
          style={{
            position: 'absolute',
            left: pos.x + 40,
            top: pos.y - 210,
            width: 340,
            background: c.white,
            borderRadius: 14,
            padding: 18,
            boxShadow: '0 14px 34px rgba(33,30,25,0.18)',
            opacity: popup * (1 - grow),
            transform: `translateY(${(1 - popup) * 10}px) scale(${lerp(grow, 1, 1.4)})`,
            transformOrigin: 'left bottom',
            fontFamily: sans,
          }}
        >
          <div style={{ fontSize: 13, color: c.muted }}>{uab.university}</div>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 20, color: c.ink, marginTop: 4 }}>{uab.name}</div>
          <div style={{ marginTop: 10 }}>
            <Badge status={uab.status} size={12} />
          </div>
          <div style={{ marginTop: 12, color: c.terracotta, fontWeight: 500, fontSize: 15 }}>View programme →</div>
        </div>
      )}
    </div>
  );
};

// --- Programme page -------------------------------------------------------

const DOCUMENTS = [
  'Passport',
  'Transcripts',
  'Degree',
  'CV',
  'Motivation letter',
  'Self-assessment',
  'Declaration',
  'Language certificate (recommended)',
];

const Section = ({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ marginTop: 22, ...style }}>
    <LabelCaps size={12}>{label}</LabelCaps>
    <div style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.55, color: c.muted, marginTop: 5 }}>{children}</div>
  </div>
);

const DetailPage = ({ a }: { a: number }) => {
  const p = PROGRAMMES[0];
  const d = a - APP.detail;
  const scroll = glide(d, 120, 90);
  return (
    <AbsoluteFill style={{ padding: '24px 32px' }}>
      <div style={{ transform: `translateY(${-scroll * 250}px)`, display: 'flex', gap: 36 }}>
        <div style={{ width: 600 }}>
          <div style={{ fontFamily: sans, fontSize: 14, color: c.terracotta, fontWeight: 500 }}>← Back to the directory</div>
          <div style={{ fontFamily: sans, fontSize: 16, color: c.muted, fontWeight: 500, marginTop: 18 }}>{p.university}</div>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 40, lineHeight: 1.15, color: c.ink, marginTop: 6 }}>{p.name}</div>
          <div style={{ fontFamily: sans, fontSize: 16, color: c.faint, marginTop: 8 }}>{p.place}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
            <Badge status={p.status} size={13} />
            {p.levels.map((l) => (
              <Pill key={l}>{l}</Pill>
            ))}
          </div>
          <div style={rise(d, 30)}>
            <Section label="Covers">{p.covers}</Section>
          </div>
          <div style={rise(d, 44)}>
            <Section label="Who it is for">Palestinian students affected by conflict</Section>
          </div>
          <div style={rise(d, 58)}>
            <Section label="Eligibility">Palestinian nationality; meet admission requirements; non-EU nationality</Section>
          </div>
          <div style={rise(d, 72)}>
            <Section label="Required documents">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: 6 }}>
                {DOCUMENTS.map((doc, i) => {
                  const t = enter(d, 150 + i * 8, 14);
                  return (
                    <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: 10, color: c.ink }}>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: `1.5px solid ${t > 0.5 ? c.route : c.border}`,
                          background: t > 0.5 ? c.route : c.white,
                          color: c.white,
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {t > 0.5 ? '✓' : ''}
                      </span>
                      <span style={{ fontSize: 15 }}>{doc}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        </div>
        <div style={{ width: 370, paddingTop: 40, ...rise(d, 20) }}>
          <div
            style={{
              background: c.white,
              border: `1px solid ${c.border}`,
              borderRadius: 16,
              padding: 22,
              display: 'grid',
              gap: 16,
              fontFamily: sans,
              fontSize: 16,
              color: c.ink,
            }}
          >
            {[
              ['Opens', p.opens],
              ['Deadline', p.deadline],
              ['Academic year', p.year],
              ['Language', 'Spanish or English, by programme'],
            ].map(([k, v]) => (
              <div key={k}>
                <LabelCaps size={11}>{k}</LabelCaps>
                <div style={{ marginTop: 3 }}>{v}</div>
              </div>
            ))}
            <div
              style={{
                background: c.terracotta,
                color: c.cream,
                borderRadius: 999,
                padding: '11px 0',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              Official page ↗
            </div>
            <div style={{ fontSize: 14, color: c.muted, textAlign: 'center' }}>fas.refugi@uab.cat</div>
          </div>
          <div
            style={{
              ...rise(d, 60),
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: sans,
              fontSize: 15,
              color: c.route,
              fontWeight: 500,
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 5, background: c.route }} />
            Last checked {CHECKED}
          </div>
          <div style={{ ...rise(d, 70), fontFamily: sans, fontSize: 13, lineHeight: 1.5, color: c.faint, marginTop: 10 }}>
            Dates marked estimated are based on previous calls. Confirm them on the official page.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --- Submit ----------------------------------------------------------------

const TYPE = {
  university: APP.submit + 40,
  country: APP.submit + 66,
  name: APP.submit + 82,
  web: APP.submit + 122,
  scroll: APP.submit + 150,
  hub: APP.submit + 172,
  level: APP.submit + 210,
  opens: APP.submit + 222,
  deadline: APP.submit + 246,
  send: APP.submit + 276,
};

const SubmitPage = ({ a }: { a: number }) => {
  const scroll = glide(a, TYPE.scroll, 26);
  const done = enter(a, TYPE.send + 8, 24);
  const focus = (k: keyof typeof TYPE, next: keyof typeof TYPE) => a >= TYPE[k] - 4 && a < TYPE[next] - 4;
  const legend = (t: string) => (
    <LabelCaps size={12} style={{ marginTop: 22, marginBottom: 12 }}>
      {t}
    </LabelCaps>
  );
  return (
    <AbsoluteFill style={{ padding: '24px 32px' }}>
      <div style={{ opacity: 1 - done, transform: `translateY(${-scroll * 300}px)`, width: 760 }}>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 36, color: c.ink }}>Submit a programme</div>
        <div style={{ fontFamily: sans, fontSize: 16, lineHeight: 1.5, color: c.muted, marginTop: 8 }}>
          Know of a programme that admits or funds Palestinian students? Send it for review. No account needed.
        </div>
        {legend('The programme')}
        <div style={{ display: 'grid', gap: 14 }}>
          <Field label="University or organisation" value={typed('SAID Foundation', a, TYPE.university)} focus={focus('university', 'country')} />
          <div style={{ display: 'flex', gap: 14 }}>
            <Field label="Country" value={typed('UK', a, TYPE.country)} focus={focus('country', 'name')} />
            <Field label="City" value="" />
          </div>
          <Field
            label="Programme or scholarship name"
            value={typed('SAID Foundation Scholarship', a, TYPE.name, 26)}
            focus={focus('name', 'web')}
          />
          <Field
            label="Official web page"
            value={typed('https://saidfoundation.org/apply/', a, TYPE.web, 36)}
            focus={focus('web', 'scroll')}
            placeholder="https://"
          />
        </div>
        {legend('About you')}
        <Field label="Your hub" value={typed('Global Shapers Ramallah', a, TYPE.hub, 30)} focus={focus('hub', 'level')} placeholder="e.g. Global Shapers Nairobi" />
        {legend('Details (optional)')}
        <div style={{ display: 'flex', gap: 22, fontFamily: sans, fontSize: 15, color: c.ink }}>
          {['Bachelor', "Master's", 'PhD'].map((l) => {
            const on = l === "Master's" && a >= TYPE.level;
            return (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 19,
                    height: 19,
                    borderRadius: 5,
                    border: `1.5px solid ${on ? c.terracotta : c.border}`,
                    background: on ? c.terracotta : c.white,
                    color: c.white,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {on ? '✓' : ''}
                </span>
                {l}
              </span>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
          <Field label="Estimated opening" value={typed('1 September 2026', a, TYPE.opens, 30)} focus={focus('opens', 'deadline')} />
          <Field label="Estimated deadline" value={typed('30 October 2026', a, TYPE.deadline, 30)} focus={focus('deadline', 'send')} />
        </div>
        <div
          style={{
            marginTop: 24,
            display: 'inline-block',
            background: a >= TYPE.send && a < TYPE.send + 6 ? '#A34F22' : c.terracotta,
            color: c.cream,
            borderRadius: 999,
            padding: '12px 30px',
            fontFamily: sans,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          Send for review
        </div>
      </div>
      {done > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 32,
            top: 150,
            width: 640,
            opacity: done,
            transform: `translateY(${(1 - done) * 20}px)`,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: c.routeTint,
              color: c.route,
              fontSize: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✓
          </div>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 36, color: c.ink, marginTop: 22 }}>Thank you.</div>
          <div style={{ fontFamily: sans, fontSize: 18, lineHeight: 1.55, color: c.muted, marginTop: 10 }}>
            Your submission is in the review queue. A reviewer will check it against the official source before it is published.
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// --- Review -----------------------------------------------------------------

const APPROVE_AT = APP.review + 150;

const ReviewPage = ({ a }: { a: number }) => {
  const d = a - APP.review;
  const done = enter(a, APPROVE_AT + 6, 24);
  const toast = enter(a, APPROVE_AT + 20, 20);
  const source = enter(a, APP.review + 92, 16);
  return (
    <AbsoluteFill style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <LabelCaps size={12} color={c.route}>Admin</LabelCaps>
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 36, color: c.ink, marginTop: 4 }}>Review queue</div>
        </div>
        <div style={{ fontFamily: sans, fontSize: 15, color: c.faint }}>{done > 0.5 ? 'Nothing waiting' : '1 submission waiting'}</div>
      </div>
      <div
        style={{
          ...rise(d, 14),
          marginTop: 22,
          background: c.white,
          border: `1px solid ${done > 0.5 ? c.route : c.border}`,
          borderRadius: 16,
          padding: 26,
          fontFamily: sans,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: c.muted }}>{SAID.university}</div>
            <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 28, color: c.ink, marginTop: 4 }}>{SAID.name}</div>
            <div style={{ fontSize: 15, color: c.faint, marginTop: 4 }}>{SAID.place}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            {done > 0.5 ? (
              <>
                <Badge status="open" size={13} />
                <span
                  style={{
                    background: '#F6E3D3',
                    color: c.terracotta,
                    borderRadius: 999,
                    padding: '4px 12px',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Closes in 15 days
                </span>
              </>
            ) : (
              <span
                style={{
                  background: c.sand,
                  color: c.expected,
                  borderRadius: 999,
                  padding: '4px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Pending review
              </span>
            )}
          </div>
        </div>
        <div style={{ fontSize: 15, color: c.muted, marginTop: 14 }}>Submitted by a Shaper from Global Shapers Ramallah</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            background: c.cream,
            borderRadius: 10,
            padding: 16,
            marginTop: 18,
            fontSize: 15,
            color: c.ink,
          }}
        >
          {[
            ['Degree level', "Master's"],
            ['Opens', SAID.opens],
            ['Deadline', SAID.deadline],
            ['Academic year', SAID.year],
          ].map(([k, v]) => (
            <div key={k}>
              <LabelCaps size={11}>{k}</LabelCaps>
              <div style={{ marginTop: 3 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, fontSize: 15 }}>
          <span style={{ color: c.faint }}>Official source</span>
          <span style={{ color: c.terracotta, fontWeight: 500, textDecoration: source > 0.5 ? 'underline' : 'none' }}>
            saidfoundation.org/apply ↗
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 22,
            borderTop: `1px solid ${c.border}`,
            paddingTop: 20,
            alignItems: 'center',
          }}
        >
          {done > 0.5 ? (
            <span style={{ color: c.route, fontWeight: 600, fontSize: 16 }}>Published · Last checked {CHECKED}</span>
          ) : (
            <>
              <span
                style={{
                  background: a >= APPROVE_AT ? '#A34F22' : c.terracotta,
                  color: c.cream,
                  borderRadius: 999,
                  padding: '11px 26px',
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                Approve and publish
              </span>
              <span
                style={{
                  border: `1px solid ${c.ink}`,
                  color: c.ink,
                  borderRadius: 999,
                  padding: '10px 24px',
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                Reject
              </span>
            </>
          )}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 32,
          bottom: 28,
          opacity: toast,
          transform: `translateY(${(1 - toast) * 16}px)`,
          background: c.ink,
          color: c.cream,
          borderRadius: 12,
          padding: '14px 22px',
          fontFamily: sans,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: 5, background: '#7FC3B5' }} />
        Published to the directory
      </div>
    </AbsoluteFill>
  );
};

// --- Cursor path (browser coordinates) -----------------------------------

const C = CONTENT_TOP;
const CURSOR: Waypoint[] = [
  { f: 250, x: 820, y: C + 420 },
  { f: DROPDOWNS[0].at, x: 380, y: C + 146, click: true },
  { f: DROPDOWNS[0].at + 14, x: 360, y: C + 232 },
  { f: DROPDOWNS[0].at + PICK_DELAY, x: 360, y: C + 232, click: true },
  { f: DROPDOWNS[1].at, x: 584, y: C + 146, click: true },
  { f: DROPDOWNS[1].at + 14, x: 560, y: C + 270 },
  { f: DROPDOWNS[1].at + PICK_DELAY, x: 560, y: C + 270, click: true },
  { f: DROPDOWNS[2].at, x: 788, y: C + 146, click: true },
  { f: DROPDOWNS[2].at + 14, x: 790, y: C + 270 },
  { f: DROPDOWNS[2].at + PICK_DELAY, x: 790, y: C + 270, click: true },
  { f: APP.map + 22, x: 1030, y: C + 48, click: true },
  { f: POPUP_AT - 4, x: 0, y: 0, click: true },
  { f: OPEN_AT - 4, x: 0, y: 0, click: true },
  { f: APP.submit - 14, x: 900, y: BROWSER.bar + 33, click: true },
  { f: TYPE.level - 2, x: 168, y: 0, click: true },
  { f: TYPE.send, x: 140, y: 0, click: true },
  { f: APP.review + 86, x: 470, y: C + 368, click: true },
  { f: APPROVE_AT, x: 160, y: C + 452, click: true },
  { f: APPROVE_AT + 60, x: 300, y: C + 560 },
];

// Fill in positions that depend on the map projection and the form layout.
const uabPin = project(PROGRAMMES[0].lon, PROGRAMMES[0].lat);
const cursorPath = CURSOR.map((w) => {
  if (w.f === POPUP_AT - 4) return { ...w, x: 32 + uabPin.x, y: C + 190 + uabPin.y - 26 };
  if (w.f === OPEN_AT - 4) return { ...w, x: 32 + uabPin.x + 120, y: C + 190 + uabPin.y - 70 };
  if (w.f === TYPE.level - 2) return { ...w, x: 158, y: C + 587 - 300 };
  if (w.f === TYPE.send) return { ...w, y: C + 723 - 300 };
  return w;
});

// --- The scene ----------------------------------------------------------------

export const Showcase = () => {
  const f = useCurrentFrame();
  const a = f - LEAD;

  // The lockup flies from the reveal into the header.
  const fly = glide(f, 0, LEAD);
  const headerX = BROWSER.x + 28;
  const headerY = BROWSER.y + BROWSER.bar + BROWSER.header / 2;
  const flyX = lerp(fly, LOCKUP_X, headerX);
  const flyY = lerp(fly, 540, headerY);
  const flyS = lerp(fly, 1, HEADER_SCALE);

  const open = enter(f, 8, 36);
  const shrink = glide(a, APP.out - 34, 46);

  const page = (from: number, to: number, slide = 0) => {
    const i = enter(a, from, 26);
    const o = leave(a, to, 18);
    return {
      opacity: i * (1 - o),
      transform: `translateX(${(1 - i) * slide * 60 - o * slide * 60}px)`,
    };
  };

  const url =
    a < DROPDOWNS[0].at + PICK_DELAY
      ? 'cami-gs.vercel.app/directory'
      : a < DROPDOWNS[1].at + PICK_DELAY
        ? 'cami-gs.vercel.app/directory?country=Spain'
        : a < DROPDOWNS[2].at + PICK_DELAY
          ? "cami-gs.vercel.app/directory?country=Spain&degree=Master's"
          : a < APP.map + 22
            ? "cami-gs.vercel.app/directory?country=Spain&degree=Master's&status=expected"
            : a < APP.detail
              ? "cami-gs.vercel.app/directory?view=map&country=Spain&degree=Master's&status=expected"
              : a < APP.submit
                ? 'cami-gs.vercel.app/directory/uabrefugi-palestine-scholarship'
                : a < APP.review
                  ? 'cami-gs.vercel.app/submit'
                  : 'cami-gs.vercel.app/admin';

  return (
    <AbsoluteFill style={{ background: c.cream }}>
      <Caption a={a} />
      <Browser
        url={url}
        navActive={a >= APP.submit - 10 && a < APP.review ? 'submit' : undefined}
        hideLogo={fly < 1}
        overlay={shrink === 0 ? <Cursor frame={a} path={cursorPath} /> : null}
        style={{
          opacity: open * (1 - shrink * 0.9),
          transform: `scale(${lerp(open, 0.97, 1) * lerp(shrink, 1, 0.12)})`,
          borderRadius: lerp(shrink, 18, 60),
        }}
      >
        {a < APP.detail + 4 && (
          <div style={{ position: 'absolute', inset: 0, ...page(-20, APP.detail - 6) }}>
            <DirectoryPage a={a} />
          </div>
        )}
        {a >= APP.detail - 30 && a < APP.submit + 10 && (
          <div style={{ position: 'absolute', inset: 0, ...page(APP.detail - 8, APP.submit - 8, 1) }}>
            <DetailPage a={a} />
          </div>
        )}
        {a >= APP.submit - 20 && a < APP.review + 10 && (
          <div style={{ position: 'absolute', inset: 0, ...page(APP.submit - 4, APP.review - 8, 1) }}>
            <SubmitPage a={a} />
          </div>
        )}
        {a >= APP.review - 20 && (
          <div style={{ position: 'absolute', inset: 0, ...page(APP.review - 2, APP.out + 100, 1) }}>
            <ReviewPage a={a} />
          </div>
        )}
      </Browser>
      {fly < 1 && (
        <div
          style={{
            position: 'absolute',
            left: flyX,
            top: flyY - LOCKUP.mark / 2,
            height: LOCKUP.mark,
            transform: `scale(${flyS})`,
            transformOrigin: 'left center',
          }}
        >
          <Lockup color={c.ink} />
        </div>
      )}
    </AbsoluteFill>
  );
};

export const SHOWCASE_FROM = T.app.from - LEAD;
