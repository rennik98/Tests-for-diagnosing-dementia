import React, { useState } from 'react';
import MiniCogQuiz from './MiniCogQuiz';
import TMSEQuiz from './TMSEQuiz';

/* ── tiny shared atoms ─────────────────────────────────────────────────────── */

const Cross = ({ s = 16, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1" width="5" height="18" rx="1.4"/>
    <rect x="1"   y="7.5" width="18" height="5" rx="1.4"/>
  </svg>
);

const Tag = ({ children, color = 'var(--mint-primary)', bg = 'var(--mint-primary-xl)' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
    color, background: bg,
    border: `1px solid ${color}33`,
    borderRadius: 20, padding: '3px 10px',
  }}>
    {children}
  </span>
);

const Pill = ({ label, value, color = 'var(--mint-primary)' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 18px', background: 'white',
    border: '1px solid var(--mint-border2)',
    borderRadius: 14, boxShadow: 'var(--shadow-sm)',
  }}>
    <span style={{ fontSize: 17, fontWeight: 800, color }}>{value}</span>
    <span style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 2 }}>{label}</span>
  </div>
);

const TestCard = ({ icon, title, sub, badge, bColor, bBg, onClick, coming }) => (
  <div
    onClick={coming ? undefined : onClick}
    style={{
      background: 'white',
      border: `1.5px solid ${coming ? 'var(--mint-border2)' : 'var(--mint-border)'}`,
      borderRadius: 22,
      padding: '28px 26px',
      cursor: coming ? 'default' : 'pointer',
      opacity: coming ? 0.55 : 1,
      transition: 'all 0.22s ease',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex', flexDirection: 'column', gap: 14,
      position: 'relative', overflow: 'hidden',
    }}
    onMouseOver={e => { if (!coming) { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = bColor; }}}
    onMouseOut={e =>  { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = coming ? 'var(--mint-border2)' : 'var(--mint-border)'; }}
  >
    {/* watermark cross */}
    <div style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.04 }}>
      <Cross s={80} c={bColor} />
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: bBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        {icon}
      </div>
      <Tag color={bColor} bg={bBg}>{badge}</Tag>
    </div>

    <div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--mint-text)', marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--mint-muted)', lineHeight: 1.65 }}>{sub}</p>
    </div>

    {!coming && (
      <div style={{ fontSize: 13, fontWeight: 700, color: bColor, display: 'flex', alignItems: 'center', gap: 5 }}>
        เริ่มทดสอบ <span>→</span>
      </div>
    )}
    {coming && <div style={{ fontSize: 12, color: 'var(--mint-muted)' }}>เร็วๆ นี้</div>}
  </div>
);

const InfoCard = ({ icon, title, desc }) => (
  <div style={{
    background: 'white', border: '1px solid var(--mint-border2)',
    borderRadius: 18, padding: '22px 20px',
    display: 'flex', gap: 14, boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--mint-primary-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 5 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--mint-muted)', lineHeight: 1.65 }}>{desc}</p>
    </div>
  </div>
);

/* ── Criteria section ────────────────────────────────────────────────────────*/
const CriteriaBlock = ({ title, color, bg, children }) => (
  <div style={{
    background: 'white', border: `1.5px solid ${color}33`,
    borderRadius: 22, padding: '32px',
    boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ width: 5, height: 26, borderRadius: 3, background: color }} />
      <h3 style={{ fontSize: 18, fontWeight: 800, color }}>{title}</h3>
    </div>
    {children}
  </div>
);

const ScoreRow = ({ label, val, color }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'var(--mint-surface2)',
    border: '1px solid var(--mint-border2)', borderRadius: 10,
  }}>
    <span style={{ fontSize: 13, color: 'var(--mint-text2)' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 800, color }}>{val}</span>
  </div>
);

const WarnBadge = ({ children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
    background: '#fff7ed', border: '1px solid #fcd34d55',
    borderRadius: 10, marginTop: 12,
  }}>
    <span style={{ fontSize: 14 }}>⚠️</span>
    <p style={{ fontSize: 13, color: '#92400e' }}>{children}</p>
  </div>
);

/* ── App ─────────────────────────────────────────────────────────────────────*/
export default function App() {
  const [tab, setTab]   = useState('home');
  const [quiz, setQuiz] = useState(null);

  if (quiz === 'minicog') return <MiniCogQuiz onBack={() => setQuiz(null)} />;
  if (quiz === 'tmse')    return <TMSEQuiz    onBack={() => setQuiz(null)} />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(240,250,248,0.88)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--mint-border)',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))',
            borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(14,159,142,0.3)',
          }}>
            <Cross s={18} c="white" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--mint-text)', letterSpacing: '0.03em' }}>
              Dementia<span style={{ color: 'var(--mint-primary)' }}>Evaluation</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--mint-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>
              COGNITIVE SCREENING
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, border: '1px solid var(--mint-border)' }}>
          {[['home', 'หน้าหลัก'], ['about', 'เกณฑ์คะแนน']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '7px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.18s',
              background: tab === key ? 'var(--mint-primary)' : 'transparent',
              color: tab === key ? 'white' : 'var(--mint-muted)',
              boxShadow: tab === key ? '0 2px 8px rgba(14,159,142,0.3)' : 'none',
            }}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{ flex: 1, maxWidth: 1160, margin: '0 auto', width: '100%', padding: '64px 40px' }}>

        {tab === 'home' ? (
          <div className="fade-up">
            {/* Hero */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center', marginBottom: 72 }}>

              {/* Left */}
              <div>
                <div style={{ marginBottom: 22 }}>
                  <Tag>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint-primary)', display: 'inline-block', animation: 'breathe 2.2s ease infinite' }} />
                    VALIDATED CLINICAL TOOLS
                  </Tag>
                </div>

                <h1 style={{
                  fontFamily: "'Lora', 'Sarabun', serif",
                  fontSize: 52, fontWeight: 600, lineHeight: 1.15,
                  color: 'var(--mint-text)', marginBottom: 20,
                }}>
                  ประเมินสุขภาพ<br />
                  <span style={{ color: 'var(--mint-primary)', fontStyle: 'italic' }}>สมอง </span>
                  <span style={{ color: 'var(--mint-text)' }}>ด้วย</span><br />
                  มาตรฐานสากล
                </h1>

                <p style={{ fontSize: 15, color: 'var(--mint-text2)', lineHeight: 1.8, marginBottom: 32, maxWidth: 420 }}>
                  คัดกรองภาวะสมองเสื่อมเบื้องต้นด้วยแบบทดสอบ Mini-Cog และ TMSE ที่ผ่านการรับรองทางการแพทย์
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                  <button onClick={() => setQuiz('minicog')} style={{
                    padding: '13px 26px',
                    background: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))',
                    color: 'white', border: 'none', borderRadius: 13,
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(14,159,142,0.35)',
                    transition: 'all 0.2s',
                  }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e  => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    เริ่ม Mini-Cog →
                  </button>
                  <button onClick={() => setQuiz('tmse')} style={{
                    padding: '13px 26px',
                    background: 'var(--mint-blue-xl)',
                    color: 'var(--mint-blue)', border: '1.5px solid var(--mint-blue-l)',
                    borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--mint-ice)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e  => { e.currentTarget.style.background = 'var(--mint-blue-xl)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    เริ่ม TMSE →
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Pill label="ความแม่นยำ" value="76–99%" color="var(--mint-primary)" />
                  <Pill label="คะแนนสูงสุด TMSE" value="30 pts" color="var(--mint-blue)" />
                  <Pill label="ระยะเวลา" value="3–15 min" color="var(--mint-warn)" />
                </div>
              </div>

              {/* Right: cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TestCard
                  icon="⚡"
                  title="Mini-Cog™"
                  sub="การทดสอบความจำ 3 คำ + การวาดรูปนาฬิกา เหมาะสำหรับการคัดกรองเบื้องต้นอย่างรวดเร็ว"
                  badge="5 คะแนน"
                  bColor="var(--mint-primary)"
                  bBg="var(--mint-primary-xl)"
                  onClick={() => setQuiz('minicog')}
                />
                <TestCard
                  icon="🧠"
                  title="TMSE"
                  sub="Thai Mental State Examination ครอบคลุม 6 ด้านของการรับรู้ทางปัญญา"
                  badge="30 คะแนน"
                  bColor="var(--mint-blue)"
                  bBg="var(--mint-blue-xl)"
                  onClick={() => setQuiz('tmse')}
                />
              </div>
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <InfoCard icon="🔬" title="Evidence-Based" desc="ทั้ง Mini-Cog และ TMSE ผ่านการรับรองและตีพิมพ์ในวารสารการแพทย์ระดับสากล" />
              <InfoCard icon="🛡️" title="ความเป็นส่วนตัว" desc="ไม่มีการบันทึกหรือส่งข้อมูลใดๆ ออกจากอุปกรณ์ของคุณ ปลอดภัย 100%" />
              <InfoCard icon="📊" title="ผลทันที" desc="รับผลการประเมินพร้อมคำแนะนำเบื้องต้นทันทีหลังทำแบบทดสอบ" />
            </div>
          </div>

        ) : (
          /* About */
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }} className="fade-up">
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--mint-text)' }}>เกณฑ์การประเมิน</h2>
              <p style={{ fontSize: 14, color: 'var(--mint-muted)', marginTop: 5 }}>มาตรฐานการตีความผลการทดสอบสมรรถภาพสมอง</p>
            </div>

            <CriteriaBlock title="Mini-Cog™" color="var(--mint-primary)" bg="var(--mint-primary-xl)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 16 }}>
                คะแนนเต็ม <strong style={{ color: 'var(--mint-text)' }}>5 คะแนน</strong> — คะแนน ≤ 3 ถือว่ามีภาวะ Cognitive Impairment
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="Word Recall" val="3 คะแนน" color="var(--mint-primary)" />
                <ScoreRow label="Clock Drawing" val="2 คะแนน" color="var(--mint-primary)" />
              </div>
              <WarnBadge>คะแนน ≤ 3 → มีแนวโน้มภาวะ Cognitive Impairment</WarnBadge>
            </CriteriaBlock>

            <CriteriaBlock title="TMSE — Thai Mental State Examination" color="var(--mint-blue)" bg="var(--mint-blue-xl)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 16 }}>
                คะแนนเต็ม <strong style={{ color: 'var(--mint-text)' }}>30 คะแนน</strong> — คะแนน &lt; 24 ถือว่ามีภาวะ Cognitive Impairment
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
                {[['Orientation','6 คะแนน'],['Registration','3 คะแนน'],['Attention','5 คะแนน'],['Calculation','3 คะแนน'],['Language','10 คะแนน'],['Recall','3 คะแนน']].map(([n,v]) => (
                  <ScoreRow key={n} label={n} val={v} color="var(--mint-blue)" />
                ))}
              </div>
              <WarnBadge>คะแนน &lt; 24 → มีแนวโน้มภาวะ Cognitive Impairment</WarnBadge>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 14 }}>
                ที่มา: กลุ่มฟื้นฟูสมรรถภาพสมอง สารศิริราช 45(6) มิถุนายน 2536 : 359-374
              </p>
            </CriteriaBlock>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--mint-border)',
        padding: '18px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cross s={12} />
          <span style={{ fontSize: 12, color: 'var(--mint-muted)' }}>BrainCheck — เครื่องมือคัดกรองเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>Mini-Cog™ © S. Borson</span>
      </footer>
    </div>
  );
}