import React, { useState } from 'react';
import MiniCogQuiz from './MiniCogQuiz';
import TMSEQuiz from './TMSEQuiz';

/* ── shared atoms ────────────────────────────────────────────────────────────*/
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
    color, background: bg, border: `1px solid ${color}33`,
    borderRadius: 20, padding: '3px 10px',
  }}>
    {children}
  </span>
);

const Pill = ({ label, value, color = 'var(--mint-primary)' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 14px', background: 'white',
    border: '1px solid var(--mint-border2)',
    borderRadius: 14, boxShadow: 'var(--shadow-sm)',
  }}>
    <span style={{ fontSize: 16, fontWeight: 800, color }}>{value}</span>
    <span style={{ fontSize: 10, color: 'var(--mint-muted)', marginTop: 2, textAlign: 'center' }}>{label}</span>
  </div>
);

const TestCard = ({ icon, title, sub, badge, bColor, bBg, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'white', border: '1.5px solid var(--mint-border)',
      borderRadius: 22, padding: '22px 20px',
      cursor: 'pointer', transition: 'all 0.22s ease',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex', flexDirection: 'column', gap: 12,
      position: 'relative', overflow: 'hidden',
    }}
    onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = bColor; }}
    onMouseOut={e  => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--mint-border)'; }}
  >
    <div style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.04 }}>
      <Cross s={80} c={bColor} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: bBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
        {icon}
      </div>
      <Tag color={bColor} bg={bBg}>{badge}</Tag>
    </div>
    <div>
      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--mint-text)', marginBottom: 5 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--mint-muted)', lineHeight: 1.6 }}>{sub}</p>
    </div>
    <div style={{ fontSize: 13, fontWeight: 700, color: bColor, display: 'flex', alignItems: 'center', gap: 5 }}>
      เริ่มทดสอบ <span>→</span>
    </div>
  </div>
);

const InfoCard = ({ icon, title, desc }) => (
  <div style={{
    background: 'white', border: '1px solid var(--mint-border2)',
    borderRadius: 16, padding: '18px 16px',
    display: 'flex', gap: 12, boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--mint-primary-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 12, color: 'var(--mint-muted)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  </div>
);

const CriteriaBlock = ({ title, color, children }) => (
  <div style={{
    background: 'white', border: `1.5px solid ${color}33`,
    borderRadius: 22, padding: '24px 20px', boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 5, height: 26, borderRadius: 3, background: color, flexShrink: 0 }} />
      <h3 style={{ fontSize: 17, fontWeight: 800, color }}>{title}</h3>
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

/* ── Patient Form Modal ──────────────────────────────────────────────────────*/
const PatientForm = ({ quizType, onConfirm, onCancel }) => {
  const [name, setName] = useState('');
  const [age,  setAge]  = useState('');
  const [err,  setErr]  = useState('');

  const handleSubmit = () => {
    if (!name.trim()) { setErr('กรุณากรอกชื่อ-นามสกุล'); return; }
    if (!age || isNaN(age) || Number(age) < 1 || Number(age) > 120) {
      setErr('กรุณากรอกอายุที่ถูกต้อง (1–120)'); return;
    }
    onConfirm({ name: name.trim(), age: parseInt(age) });
  };

  const typeLabel = quizType === 'minicog' ? 'Mini-Cog™' : 'TMSE';
  const typeColor = quizType === 'minicog' ? 'var(--mint-primary)' : 'var(--mint-blue)';
  const typeGrad  = quizType === 'minicog'
    ? 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))'
    : 'linear-gradient(135deg, var(--mint-blue), #60a5fa)';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,43,40,0.55)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 22, padding: '28px 22px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(14,159,142,0.2)',
        border: '1.5px solid var(--mint-border)',
        animation: 'scaleIn 0.28s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: quizType === 'minicog' ? 'var(--mint-primary-xl)' : 'var(--mint-blue-xl)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
          }}>
            {quizType === 'minicog' ? '⚡' : '🧠'}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint-text)' }}>ข้อมูลผู้เข้ารับการทดสอบ</div>
            <div style={{ fontSize: 11, color: typeColor, fontWeight: 600 }}>{typeLabel}</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--mint-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          กรอกข้อมูลเพื่อบันทึกผลการทดสอบเข้าระบบ
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>
              ชื่อ-นามสกุล <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text" value={name} placeholder="เช่น สมชาย ใจดี"
              onChange={e => { setName(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 14px', background: 'var(--mint-surface2)',
                border: '1.5px solid var(--mint-border)', borderRadius: 12,
                fontSize: 14, fontWeight: 600, color: 'var(--mint-text)',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s',
              }}
              onFocus={e => e.target.style.borderColor = typeColor}
              onBlur={e  => e.target.style.borderColor = 'var(--mint-border)'}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-text2)', display: 'block', marginBottom: 6 }}>
              อายุ (ปี) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number" value={age} placeholder="เช่น 72" min={1} max={120}
              onChange={e => { setAge(e.target.value); setErr(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%', padding: '12px 14px', background: 'var(--mint-surface2)',
                border: '1.5px solid var(--mint-border)', borderRadius: 12,
                fontSize: 14, fontWeight: 600, color: 'var(--mint-text)',
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s',
              }}
              onFocus={e => e.target.style.borderColor = typeColor}
              onBlur={e  => e.target.style.borderColor = 'var(--mint-border)'}
            />
          </div>
        </div>
        {err && (
          <div style={{ padding: '9px 14px', borderRadius: 10, marginBottom: 14, background: '#fff1f1', border: '1px solid #fca5a5', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
            ⚠️ {err}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)',
            color: 'var(--mint-muted)', cursor: 'pointer',
          }}>
            ยกเลิก
          </button>
          <button onClick={handleSubmit} style={{
            flex: 2, padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: typeGrad, color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: quizType === 'minicog' ? '0 6px 18px rgba(14,159,142,0.3)' : '0 6px 18px rgba(59,130,246,0.3)',
          }}>
            เริ่มทดสอบ →
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── CSV Export ──────────────────────────────────────────────────────────────*/
function exportCSV(results) {
  const BOM = '\uFEFF';
  const headers = [
    'ลำดับ','ชื่อ-นามสกุล','อายุ','ประเภทแบบทดสอบ',
    'คะแนนรวม','คะแนนสูงสุด','การแปลผล','วันที่/เวลา',
    'Clock Drawing (Mini-Cog)','Word Recall (Mini-Cog)',
    'Orientation (TMSE)','Registration (TMSE)','Attention (TMSE)',
    'Calculation (TMSE)','Language (TMSE)','Recall (TMSE)',
  ];
  const rows = results.map((r, i) => {
    const b = r.breakdown || {};
    return [
      i + 1, r.name, r.age, r.type, r.totalScore, r.maxScore,
      r.impaired ? 'มีภาวะ Cognitive Impairment' : 'อยู่ในเกณฑ์ปกติ',
      r.datetime,
      b.clockDrawing ?? '', b.wordRecall ?? '',
      b.orientation ?? '', b.registration ?? '',
      b.attention ?? '', b.calculation ?? '',
      b.language ?? '', b.recall ?? '',
    ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',');
  });
  const csv  = BOM + [headers.map(h => '"' + h + '"').join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'dementia_results_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Results Page ────────────────────────────────────────────────────────────*/
const ResultsPage = ({ results, onExport, onClear }) => (
  <div className="fade-up">
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 12 }}>
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--mint-text)' }}>ผลการทดสอบทั้งหมด</h2>
        <p style={{ fontSize: 14, color: 'var(--mint-muted)', marginTop: 4 }}>
          บันทึกไว้แล้ว <strong style={{ color: 'var(--mint-primary)' }}>{results.length}</strong> รายการ
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {results.length > 0 && (
          <>
            <button onClick={onClear} style={{
              padding: '9px 14px', borderRadius: 11, fontSize: 13, fontWeight: 700,
              background: '#fff1f1', border: '1px solid #fca5a5', color: '#dc2626', cursor: 'pointer',
            }}>
              🗑️ ล้างข้อมูล
            </button>
            <button onClick={onExport} style={{
              padding: '9px 16px', borderRadius: 11, fontSize: 13, fontWeight: 700,
              background: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))',
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(14,159,142,0.28)',
            }}>
              📥 ดาวน์โหลด CSV
            </button>
          </>
        )}
      </div>
    </div>

    {results.length === 0 ? (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        background: 'white', border: '1.5px dashed var(--mint-border)',
        borderRadius: 22, color: 'var(--mint-muted)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>ยังไม่มีข้อมูล</p>
        <p style={{ fontSize: 13 }}>ทำแบบทดสอบก่อนแล้วผลจะปรากฏที่นี่</p>
      </div>
    ) : (
      <div style={{ background: 'white', border: '1.5px solid var(--mint-border)', borderRadius: 22, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
            <thead>
              <tr style={{ background: 'var(--mint-surface2)', borderBottom: '2px solid var(--mint-border2)' }}>
                {['#','ชื่อ-นามสกุล','อายุ','แบบทดสอบ','คะแนน','การแปลผล','วันที่/เวลา'].map(h => (
                  <th key={h} style={{
                    padding: '11px 14px', textAlign: 'left', fontWeight: 700,
                    color: 'var(--mint-text2)', fontSize: 11, letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--mint-border2)', transition: 'background 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--mint-surface2)'}
                  onMouseOut={e  => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 14px', color: 'var(--mint-muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--mint-text)' }}>{r.name}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--mint-text2)' }}>{r.age} ปี</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: r.type === 'Mini-Cog' ? 'var(--mint-primary-xl)' : 'var(--mint-blue-xl)',
                      color: r.type === 'Mini-Cog' ? 'var(--mint-primary)' : 'var(--mint-blue)',
                    }}>
                      {r.type}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 800, fontSize: 15, color: r.impaired ? 'var(--mint-warn)' : 'var(--mint-primary)' }}>
                    {r.totalScore}<span style={{ fontSize: 11, fontWeight: 400, color: 'var(--mint-muted)' }}>/{r.maxScore}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: r.impaired ? '#fff7ed' : '#f0fdf9',
                      color: r.impaired ? '#92400e' : '#065f46',
                      border: '1px solid ' + (r.impaired ? '#fcd34d88' : '#6ee7d588'),
                      whiteSpace: 'nowrap',
                    }}>
                      {r.impaired ? '⚠️ บกพร่อง' : '✅ ปกติ'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--mint-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{r.datetime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* breakdown cards */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--mint-border2)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {results.map((r, i) => {
            const b = r.breakdown || {};
            const isMini = r.type === 'Mini-Cog';
            const color  = isMini ? 'var(--mint-primary)' : 'var(--mint-blue)';
            return (
              <div key={i} style={{
                background: 'var(--mint-surface2)',
                border: '1px solid ' + (isMini ? 'var(--mint-border)' : '#bfdbfe'),
                borderRadius: 14, padding: '14px 14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--mint-muted)' }}>{r.type} · {r.datetime}</p>
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 800, color, flexShrink: 0, marginLeft: 8 }}>{r.totalScore}/{r.maxScore}</span>
                </div>
                {isMini ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['🕐 Clock', b.clockDrawing, 2], ['💬 Recall', b.wordRecall, 3]].map(([lb, sc, mx]) => (
                      <div key={lb} style={{ flex: 1, textAlign: 'center', padding: '6px', background: 'white', borderRadius: 8, fontSize: 11 }}>
                        <div style={{ fontWeight: 700, color }}>{sc}/{mx}</div>
                        <div style={{ color: 'var(--mint-muted)', marginTop: 1 }}>{lb}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                    {[['Ori', b.orientation, 6],['Reg', b.registration, 3],['Att', b.attention, 5],['Cal', b.calculation, 3],['Lng', b.language, 10],['Rec', b.recall, 3]].map(([lb, sc, mx]) => (
                      <div key={lb} style={{ textAlign: 'center', padding: '4px', background: 'white', borderRadius: 6, fontSize: 10 }}>
                        <div style={{ fontWeight: 700, color }}>{sc}/{mx}</div>
                        <div style={{ color: 'var(--mint-muted)' }}>{lb}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

/* ── App ─────────────────────────────────────────────────────────────────────*/
export default function App() {
  const [tab,        setTab]      = useState('home');
  const [quiz,       setQuiz]     = useState(null);
  const [showForm,   setShowForm] = useState(null);
  const [patient,    setPatient]  = useState(null);

  const STORAGE_KEY = 'dementia_eval_results';
  const [allResults, setAllResults] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveResults = (updater) => {
    setAllResults(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_e) { /* storage unavailable */ }
      return next;
    });
  };

  const handleFormConfirm = (info) => {
    const quizType = showForm;
    setPatient(info);
    setShowForm(null);
    setQuiz(quizType);
  };

  const handleComplete = (scoreData) => {
    const now = new Date();
    const datetime =
      now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
      + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    saveResults(prev => [...prev, {
      name:       patient?.name ?? 'ไม่ระบุ',
      age:        patient?.age  ?? '-',
      type:       scoreData.type,
      totalScore: scoreData.totalScore,
      maxScore:   scoreData.maxScore,
      impaired:   scoreData.impaired,
      breakdown:  scoreData.breakdown,
      datetime,
    }]);
    setQuiz(null);
    setPatient(null);
    setTab('home');
  };

  const handleBack = () => { setQuiz(null); setPatient(null); setTab('home'); };

  if (quiz === 'minicog') return <MiniCogQuiz patient={patient} onBack={handleBack} onComplete={handleComplete} />;
  if (quiz === 'tmse')    return <TMSEQuiz    patient={patient} onBack={handleBack} onComplete={handleComplete} />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {showForm && (
        <PatientForm
          quizType={showForm}
          onConfirm={handleFormConfirm}
          onCancel={() => setShowForm(null)}
        />
      )}

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(240,250,248,0.92)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--mint-border)',
        padding: '0 16px', height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }} onClick={() => setTab('home')}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(14,159,142,0.3)', flexShrink: 0,
          }}>
            <Cross s={16} c="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--mint-text)', letterSpacing: '0.02em', lineHeight: 1.2 }}>
              Dementia<span style={{ color: 'var(--mint-primary)' }}>Eval</span>
            </div>
            <div style={{ fontSize: 8, color: 'var(--mint-muted)', letterSpacing: '0.08em', fontWeight: 600 }}>COGNITIVE SCREENING</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 3, background: 'white', borderRadius: 11, padding: 3, border: '1px solid var(--mint-border)', flexShrink: 0 }}>
          {[
            ['home',    'หน้าหลัก'],
            ['results', 'ผล' + (allResults.length > 0 ? ` (${allResults.length})` : '')],
            ['about',   'เกณฑ์'],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.18s',
              background: tab === key ? 'var(--mint-primary)' : 'transparent',
              color: tab === key ? 'white' : 'var(--mint-muted)',
              boxShadow: tab === key ? '0 2px 8px rgba(14,159,142,0.3)' : 'none',
              position: 'relative', whiteSpace: 'nowrap',
            }}>
              {label}
              {key === 'results' && allResults.length > 0 && tab !== 'results' && (
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--mint-warn)', border: '2px solid white',
                }} />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1160, margin: '0 auto', width: '100%', padding: '32px 16px' }}>

        {/* HOME */}
        {tab === 'home' && (
          <div className="fade-up">
            {/* Hero — responsive: 2 cols on wide, 1 col on mobile */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 36, alignItems: 'center', marginBottom: 48,
            }}>
              <div>
                <div style={{ marginBottom: 18 }}>
                  <Tag>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint-primary)', display: 'inline-block', animation: 'breathe 2.2s ease infinite' }} />
                    VALIDATED CLINICAL TOOLS
                  </Tag>
                </div>
                <h1 style={{ fontFamily: "'Lora', 'Sarabun', serif", fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 600, lineHeight: 1.15, color: 'var(--mint-text)', marginBottom: 16 }}>
                  ประเมินสุขภาพ<br />
                  <span style={{ color: 'var(--mint-primary)', fontStyle: 'italic' }}>สมอง </span>
                  <span style={{ color: 'var(--mint-text)' }}>ด้วย</span><br />
                  มาตรฐานสากล
                </h1>
                <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.8, marginBottom: 28, maxWidth: 420 }}>
                  คัดกรองภาวะสมองเสื่อมเบื้องต้นด้วยแบบทดสอบ Mini-Cog และ TMSE ที่ผ่านการรับรองทางการแพทย์
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
                  <button onClick={() => setShowForm('minicog')} style={{
                    padding: '12px 22px',
                    background: 'linear-gradient(135deg, var(--mint-primary), var(--mint-primary-l))',
                    color: 'white', border: 'none', borderRadius: 13,
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(14,159,142,0.35)', transition: 'all 0.2s',
                  }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e  => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    เริ่ม Mini-Cog →
                  </button>
                  <button onClick={() => setShowForm('tmse')} style={{
                    padding: '12px 22px', background: 'var(--mint-blue-xl)',
                    color: 'var(--mint-blue)', border: '1.5px solid var(--mint-blue-l)',
                    borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--mint-ice)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e  => { e.currentTarget.style.background = 'var(--mint-blue-xl)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    เริ่ม TMSE →
                  </button>
                  {allResults.length > 0 && (
                    <button onClick={() => setTab('results')} style={{
                      padding: '12px 18px', background: 'white',
                      color: 'var(--mint-text)', border: '1.5px solid var(--mint-border)',
                      borderRadius: 13, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
                    }}
                      onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseOut={e  => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      📋 ดูผล ({allResults.length})
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Pill label="ความแม่นยำ" value="76–99%" color="var(--mint-primary)" />
                  <Pill label="TMSE สูงสุด" value="30 pts" color="var(--mint-blue)" />
                  <Pill label="ระยะเวลา" value="3–15 min" color="var(--mint-warn)" />
                  {allResults.length > 0 && <Pill label="บันทึกแล้ว" value={allResults.length + ' ราย'} color="var(--mint-primary)" />}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <TestCard
                  icon="⚡" title="Mini-Cog™"
                  sub="การทดสอบความจำ 3 คำ + การวาดรูปนาฬิกา เหมาะสำหรับการคัดกรองเบื้องต้นอย่างรวดเร็ว"
                  badge="5 คะแนน" bColor="var(--mint-primary)" bBg="var(--mint-primary-xl)"
                  onClick={() => setShowForm('minicog')}
                />
                <TestCard
                  icon="🧠" title="TMSE"
                  sub="Thai Mental State Examination ครอบคลุม 6 ด้านของการรับรู้ทางปัญญา"
                  badge="30 คะแนน" bColor="var(--mint-blue)" bBg="var(--mint-blue-xl)"
                  onClick={() => setShowForm('tmse')}
                />
              </div>
            </div>

            {/* Info cards — responsive grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 14 }}>
              <InfoCard icon="🔬" title="Evidence-Based" desc="ทั้ง Mini-Cog และ TMSE ผ่านการรับรองและตีพิมพ์ในวารสารการแพทย์ระดับสากล" />
              <InfoCard icon="🛡️" title="ความเป็นส่วนตัว" desc="ไม่มีการบันทึกหรือส่งข้อมูลใดๆ ออกจากอุปกรณ์ของคุณ ปลอดภัย 100%" />
              <InfoCard icon="📊" title="Export CSV" desc="ดาวน์โหลดผลการทดสอบทุกรายการเป็นไฟล์ CSV รองรับภาษาไทย พร้อมรายละเอียดคะแนน" />
            </div>
          </div>
        )}

        {/* RESULTS */}
        {tab === 'results' && (
          <ResultsPage
            results={allResults}
            onExport={() => exportCSV(allResults)}
            onClear={() => saveResults([])}
          />
        )}

        {/* ABOUT */}
        {tab === 'about' && (
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
            <div style={{ marginBottom: 4 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--mint-text)' }}>เกณฑ์การประเมิน</h2>
              <p style={{ fontSize: 14, color: 'var(--mint-muted)', marginTop: 5 }}>มาตรฐานการตีความผลการทดสอบสมรรถภาพสมอง</p>
            </div>
            <CriteriaBlock title="Mini-Cog™" color="var(--mint-primary)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>
                คะแนนเต็ม <strong style={{ color: 'var(--mint-text)' }}>5 คะแนน</strong> — คะแนน ≤ 3 ถือว่ามีภาวะ Cognitive Impairment
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 4 }}>
                <ScoreRow label="Word Recall" val="3 คะแนน" color="var(--mint-primary)" />
                <ScoreRow label="Clock Drawing" val="2 คะแนน" color="var(--mint-primary)" />
              </div>
              <WarnBadge>คะแนน ≤ 3 → มีแนวโน้มภาวะ Cognitive Impairment</WarnBadge>
            </CriteriaBlock>
            <CriteriaBlock title="TMSE — Thai Mental State Examination" color="var(--mint-blue)">
              <p style={{ fontSize: 14, color: 'var(--mint-text2)', lineHeight: 1.75, marginBottom: 14 }}>
                คะแนนเต็ม <strong style={{ color: 'var(--mint-text)' }}>30 คะแนน</strong> — คะแนน &lt; 24 ถือว่ามีภาวะ Cognitive Impairment
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 4 }}>
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
        borderTop: '1px solid var(--mint-border)', padding: '14px 16px',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'white', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cross s={12} />
          <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>BrainCheck — เครื่องมือคัดกรองเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>Mini-Cog™ © S. Borson</span>
      </footer>
    </div>
  );
}