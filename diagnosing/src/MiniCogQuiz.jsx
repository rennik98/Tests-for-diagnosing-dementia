import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ── useTimer hook ── */
function useTimer(autoStart = false) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef  = useRef(0);
  const intervalRef = useRef(null);
  const startedAt   = useRef(null);
  const stoppedRef  = useRef(false);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stoppedRef.current = false;
    startedAt.current = Date.now() - elapsedRef.current * 1000;
    intervalRef.current = setInterval(() => {
      if (stoppedRef.current) return;
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      elapsedRef.current = s;
      setElapsed(s);
    }, 500);
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const snapshot = useCallback(() => elapsedRef.current, []);

  useEffect(() => {
    if (autoStart) start();
    return () => { clearInterval(intervalRef.current); intervalRef.current = null; };
  }, [autoStart, start]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  return { elapsed, fmt: fmt(elapsed), start, stop, snapshot };
}

/* ── Word sets (7 sets × 3 words each) ── */
const WORD_SETS = [
  ['กล้วย', 'ผู้นำ', 'หมู่บ้าน'],
  ['แม่น้ำ', 'กัปตันเรือ', 'ลูกสาว'],
  ['บ้าน', 'พระอาทิตย์ขึ้น', 'ฤดูกาล'],
  ['ห้องครัว', 'ประเทศ', 'สวน'],
  ['สวรรค์', 'แมว', 'เก้าอี้'],
  ['โต๊ะ', 'เด็ก', 'นิ้ว'],
  ['รูปภาพ', 'ภูเขา', 'สีเขียว'],
];

const WORD_SET_LABELS = [
  'ชุดคำที่ 1', 'ชุดคำที่ 2', 'ชุดคำที่ 3',
  'ชุดคำที่ 4', 'ชุดคำที่ 5', 'ชุดคำที่ 6',
  'ชุดคำที่ 7*',
];

/* ── shared ui ── */
const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1"   width="5" height="18" rx="1.4"/>
    <rect x="1"   y="7.5" width="18" height="5" rx="1.4"/>
  </svg>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'white', border: '1.5px solid var(--mint-border)',
    borderRadius: 22, padding: '24px 20px', boxShadow: 'var(--shadow-md)', ...style,
  }}>
    {children}
  </div>
);

const StepBar = ({ step }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
    {[1, 2, 3].map((n, i) => (
      <React.Fragment key={n}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
          background:   step > n ? 'var(--mint-primary)' : step === n ? 'var(--mint-primary-xl)' : 'var(--mint-border2)',
          border:       `2px solid ${step >= n ? 'var(--mint-primary)' : 'var(--mint-border)'}`,
          color:        step > n ? 'white' : step === n ? 'var(--mint-primary)' : 'var(--mint-muted)',
          transition:   'all 0.3s',
        }}>
          {step > n ? '✓' : n}
        </div>
        {i < 2 && (
          <div style={{
            flex: 1, height: 2.5, margin: '0 4px',
            background: step > n ? 'var(--mint-primary)' : 'var(--mint-border2)',
            borderRadius: 2, transition: 'background 0.4s',
          }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const SectionHead = ({ n, title, color = 'var(--mint-primary)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
    <div style={{
      width: 30, height: 30, borderRadius: 9,
      background: color === 'var(--mint-primary)' ? 'var(--mint-primary-xl)' : 'var(--mint-blue-xl)',
      border: `1.5px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 800, color, flexShrink: 0,
    }}>
      {n}
    </div>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--mint-text)' }}>{title}</h2>
  </div>
);

/* ── Word Set Picker ── */
function WordSetPicker({ selectedSet, onSelect }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 12, color: 'var(--mint-text2)', fontWeight: 700, marginBottom: 8 }}>
        เลือกชุดคำศัพท์
        <span style={{ fontSize: 10, color: 'var(--mint-muted)', fontWeight: 400, marginLeft: 6 }}>
          (กดสุ่มหรือเลือกเอง)
        </span>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
        {WORD_SET_LABELS.map((label, i) => (
          <button key={i} onClick={() => onSelect(i)} style={{
            padding: '8px 4px', borderRadius: 9, fontSize: 11, fontWeight: 700,
            border: `1.5px solid ${selectedSet === i ? 'var(--mint-primary)' : 'var(--mint-border)'}`,
            background: selectedSet === i ? 'var(--mint-primary-xl)' : 'var(--mint-surface2)',
            color: selectedSet === i ? 'var(--mint-primary)' : 'var(--mint-muted)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {label}
          </button>
        ))}
        <button onClick={() => onSelect(Math.floor(Math.random() * WORD_SETS.length))} style={{
          padding: '8px 4px', borderRadius: 9, fontSize: 11, fontWeight: 700,
          border: 'none',
          background: 'linear-gradient(135deg,var(--mint-primary),var(--mint-primary-l))',
          color: 'white', cursor: 'pointer', transition: 'all 0.15s',
        }}>
          🎲 สุ่ม
        </button>
      </div>
    </div>
  );
}

/* ── Freehand Clock Canvas ── */
function ClockCanvas({ onConfirm }) {
  const canvasRef    = useRef(null);
  const drawing      = useRef(false);
  const strokesRef   = useRef([]);
  const currentRef   = useRef([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isEmpty,   setIsEmpty]   = useState(true);

  const SIZE = Math.min(280, (typeof window !== 'undefined' ? window.innerWidth : 400) - 60);
  const CX   = SIZE / 2;

  const drawBase = useCallback((ctx) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CX, CX - 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#0e9f8e';
    ctx.lineWidth   = 3;
    ctx.stroke();
    ctx.restore();
  }, [CX]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);
    drawBase(ctx);
    ctx.strokeStyle = '#0f2b28';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    for (const stroke of strokesRef.current) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    }
  }, [SIZE, drawBase]);

  useEffect(() => { redrawAll(); }, [redrawAll]);

  const getPos = (e, canvas) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    if (confirmed) return; e.preventDefault();
    drawing.current = true; currentRef.current = [];
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    currentRef.current.push(pos);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f2b28'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!drawing.current || confirmed) return; e.preventDefault();
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    currentRef.current.push(pos); ctx.lineTo(pos.x, pos.y); ctx.stroke();
    setIsEmpty(false);
  };

  const stopDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentRef.current.length > 0) {
      strokesRef.current = [...strokesRef.current, [...currentRef.current]];
      currentRef.current = [];
    }
  };

  const handleUndo = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    redrawAll();
    setIsEmpty(strokesRef.current.length === 0);
  };

  const handleClear = () => {
    strokesRef.current = []; currentRef.current = [];
    redrawAll(); setIsEmpty(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <p style={{ fontSize: 13, color: 'var(--mint-text2)', textAlign: 'center', lineHeight: 1.7 }}>
        วาด <strong>ตัวเลข 1–12</strong> และ <strong>เข็มนาฬิกา</strong> ให้แสดงเวลา{' '}
        <strong style={{ color: 'var(--mint-blue)' }}>11:10 น.</strong>
      </p>

      {/* Canvas always visible */}
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        style={{
          borderRadius: '50%',
          cursor: confirmed ? 'default' : 'crosshair',
          display: 'block',
          boxShadow: '0 4px 20px rgba(14,159,142,0.15)',
          touchAction: 'none',
          border: confirmed ? '2px solid var(--mint-primary)' : '2px solid var(--mint-border2)',
          opacity: confirmed ? 0.92 : 1,
          transition: 'border-color 0.2s, opacity 0.2s',
        }}
        onMouseDown={!confirmed ? startDraw : undefined}
        onMouseMove={!confirmed ? draw : undefined}
        onMouseUp={!confirmed ? stopDraw : undefined}
        onMouseLeave={!confirmed ? stopDraw : undefined}
        onTouchStart={!confirmed ? startDraw : undefined}
        onTouchMove={!confirmed ? draw : undefined}
        onTouchEnd={!confirmed ? stopDraw : undefined}
      />

      {!confirmed ? (
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button onClick={handleUndo} disabled={isEmpty} style={{
            flex: 1, padding: '11px', borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: isEmpty ? 'var(--mint-border2)' : 'var(--mint-surface2)',
            border: '1.5px solid var(--mint-border)',
            color: isEmpty ? 'var(--mint-muted)' : 'var(--mint-text2)',
            cursor: isEmpty ? 'not-allowed' : 'pointer', transition: 'all 0.18s',
          }}>↩ ย้อนกลับ</button>
          <button onClick={handleClear} disabled={isEmpty} style={{
            flex: 1, padding: '11px', borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: isEmpty ? 'var(--mint-border2)' : 'var(--mint-surface2)',
            border: '1.5px solid var(--mint-border)',
            color: isEmpty ? 'var(--mint-muted)' : 'var(--mint-muted)',
            cursor: isEmpty ? 'not-allowed' : 'pointer', transition: 'all 0.18s',
          }}>🗑️ ล้างใหม่</button>
          <button onClick={() => setConfirmed(true)} disabled={isEmpty} style={{
            flex: 2, padding: '11px', borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: isEmpty ? 'var(--mint-border2)' : 'linear-gradient(135deg,var(--mint-blue),#60a5fa)',
            color: isEmpty ? 'var(--mint-muted)' : 'white', border: 'none',
            cursor: isEmpty ? 'not-allowed' : 'pointer',
            boxShadow: isEmpty ? 'none' : '0 4px 14px rgba(59,130,246,0.3)',
            transition: 'all 0.2s',
          }}>ยืนยันการวาด ✓</button>
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <div style={{ padding: '10px 14px', background: 'var(--mint-blue-xl)', border: '1px solid var(--mint-blue-l)', borderRadius: 10, marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--mint-blue)', textAlign: 'center', lineHeight: 1.7 }}>
              ✓ ถูกต้อง = มีตัวเลข 1–12 ครบ, เข็มชั่วโมงชี้ที่ <strong>11</strong> และเข็มนาทีชี้ที่ <strong>2</strong>
            </p>
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)', marginBottom: 10, textAlign: 'center' }}>ให้คะแนนการวาดนาฬิกา</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <button onClick={() => onConfirm(0)} style={{
              flex: 1, padding: '18px 10px', borderRadius: 14, fontSize: 15, fontWeight: 800,
              background: '#fff1f1', border: '1.5px solid #fca5a5', color: '#dc2626',
              cursor: 'pointer', transition: 'all 0.18s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}
              onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
              onMouseOut={e  => e.currentTarget.style.background = '#fff1f1'}
            >
              <span style={{ fontSize: 26 }}>✗</span><span>0 คะแนน</span>
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7 }}>ไม่ถูกต้อง</span>
            </button>
            <button onClick={() => onConfirm(2)} style={{
              flex: 1, padding: '18px 10px', borderRadius: 14, fontSize: 15, fontWeight: 800,
              background: 'var(--mint-primary-xl)', border: '1.5px solid var(--mint-primary)',
              color: 'var(--mint-primary)', cursor: 'pointer', transition: 'all 0.18s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}
              onMouseOver={e => e.currentTarget.style.background = '#c8f0eb'}
              onMouseOut={e  => e.currentTarget.style.background = 'var(--mint-primary-xl)'}
            >
              <span style={{ fontSize: 26 }}>✓</span><span>2 คะแนน</span>
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7 }}>ถูกต้อง</span>
            </button>
          </div>
          <button onClick={() => setConfirmed(false)} style={{
            width: '100%', padding: '9px', borderRadius: 10,
            background: 'none', border: 'none', color: 'var(--mint-muted)', fontSize: 12, cursor: 'pointer',
          }}>← วาดใหม่ / แก้ไข</button>
        </div>
      )}
    </div>
  );
}

/* ── Word Recall with Answer Key ── */
function WordRecall({ words, onConfirm }) {
  const [checked, setChecked] = useState([null, null, null]);

  const toggle = (i, val) => {
    setChecked(prev => { const a = [...prev]; a[i] = a[i] === val ? null : val; return a; });
  };

  const allAnswered = checked.every(v => v !== null);
  const score       = checked.filter(v => v === true).length;

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--mint-text2)', marginBottom: 6, lineHeight: 1.6 }}>
        ตรวจสอบว่าผู้รับการทดสอบจำคำแต่ละคำได้หรือไม่
      </p>
      <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginBottom: 18 }}>
        กดติ๊กถูก/ผิดสำหรับแต่ละคำ (คำเฉลยแสดงด้านล่าง)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {words.map((word, i) => (
          <div key={word} style={{
            background: checked[i] === true ? 'var(--mint-primary-xl)' : checked[i] === false ? '#fff1f1' : 'var(--mint-surface2)',
            border: `1.5px solid ${checked[i] === true ? 'var(--mint-primary)' : checked[i] === false ? '#fca5a5' : 'var(--mint-border2)'}`,
            borderRadius: 14, padding: '14px 16px', transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: checked[i] === true ? 'var(--mint-primary)' : checked[i] === false ? '#ef4444' : 'var(--mint-border2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, transition: 'background 0.2s',
                }}>
                  {checked[i] === true ? <span style={{ color: 'white' }}>✓</span> : checked[i] === false ? <span style={{ color: 'white' }}>✗</span> : <span style={{ fontSize: 13, color: 'var(--mint-muted)' }}>{i + 1}</span>}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: checked[i] === true ? 'var(--mint-primary)' : checked[i] === false ? '#dc2626' : 'var(--mint-text)', transition: 'color 0.2s' }}>
                    {word}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--mint-muted)', marginTop: 1 }}>คำเฉลยคำที่ {i + 1}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggle(i, true)} style={{
                  padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${checked[i] === true ? 'var(--mint-primary)' : 'var(--mint-border)'}`,
                  background: checked[i] === true ? 'var(--mint-primary)' : 'white',
                  color: checked[i] === true ? 'white' : 'var(--mint-muted)',
                  cursor: 'pointer', transition: 'all 0.18s', minWidth: 60,
                }}>จำได้</button>
                <button onClick={() => toggle(i, false)} style={{
                  padding: '8px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${checked[i] === false ? '#fca5a5' : 'var(--mint-border)'}`,
                  background: checked[i] === false ? '#ef4444' : 'white',
                  color: checked[i] === false ? 'white' : 'var(--mint-muted)',
                  cursor: 'pointer', transition: 'all 0.18s', minWidth: 60,
                }}>ลืม</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--mint-text2)' }}>คะแนนความจำ</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--mint-primary)' }}>
          {checked.filter(v => v === true).length}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--mint-muted)' }}>/3</span>
        </span>
      </div>

      <button onClick={() => onConfirm(score)} disabled={!allAnswered} style={{
        width: '100%', padding: 14, borderRadius: 13, fontSize: 15, fontWeight: 700,
        background: allAnswered ? 'linear-gradient(135deg,var(--mint-primary),var(--mint-primary-l))' : 'var(--mint-border2)',
        color: allAnswered ? 'white' : 'var(--mint-muted)', border: 'none',
        cursor: allAnswered ? 'pointer' : 'not-allowed',
        boxShadow: allAnswered ? '0 6px 18px rgba(14,159,142,0.3)' : 'none', transition: 'all 0.2s',
      }}>ยืนยันคะแนนและดูผล →</button>
    </div>
  );
}

/* ── main ── */
export default function MiniCogQuiz({ onBack, onComplete, patient }) {
  const [wordSetIdx, setWordSetIdx] = useState(() => Math.floor(Math.random() * WORD_SETS.length));
  const [step,       setStep]       = useState(1);
  const [clockScore, setCS]         = useState(null);
  const [result,     setResult]     = useState(null);
  const timer = useTimer();

  const currentWords = WORD_SETS[wordSetIdx];

  // Start timer when moving from step 1 → 2 (test begins)
  const handleStart = () => { timer.start(); setStep(2); };

  const handleWordSetChange = (idx) => {
    setWordSetIdx(idx);
    if (step > 1) { setStep(1); setCS(null); timer.stop(); }
  };

  const handleClockScore = (sc) => { setCS(sc); setStep(3); };

  const handleRecallScore = (rc) => {
    const duration = timer.snapshot();  // read ref before stop
    timer.stop();
    const cs    = clockScore ?? 0;
    const total = cs + rc;
    const r     = { clockScore: cs, recallScore: rc, total, impaired: total <= 3, duration };
    setResult(r);
    setStep(4);
    if (onComplete) {
      onComplete({ type: 'Mini-Cog', totalScore: total, maxScore: 5, impaired: total <= 3, duration, breakdown: { clockDrawing: cs, wordRecall: rc } });
    }
  };

  const reset = () => { setStep(1); setCS(null); setResult(null); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* topbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(240,250,248,0.9)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--mint-border)',
        padding: '0 16px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>← กลับ</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cross s={14} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>Mini-Cog™</span>
          {patient && (
            <span style={{ fontSize: 11, color: 'var(--mint-primary)', fontWeight: 600, background: 'var(--mint-primary-xl)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--mint-border)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {patient.name}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--mint-muted)', fontWeight: 600 }}>ขั้นตอน {Math.min(step, 3)}/3</div>
      </div>
      {/* Timer bar — shows once test started */}
      {step >= 2 && step <= 3 && (
        <div style={{ background: 'var(--mint-primary-xl)', borderBottom: '1px solid var(--mint-border)', padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--mint-text2)', fontWeight: 600 }}>⏱ เวลาที่ใช้</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em' }}>{timer.fmt}</span>
        </div>
      )}

      <div style={{ flex: 1, maxWidth: 520, margin: '0 auto', width: '100%', padding: '28px 14px' }}>
        <StepBar step={step} />

        {/* ── Step 1: Word Registration ── */}
        {step === 1 && (
          <Card>
            <SectionHead n="1" title="การลงทะเบียนคำศัพท์" />
            <WordSetPicker selectedSet={wordSetIdx} onSelect={handleWordSetChange} />
            <div style={{ background: 'var(--mint-primary-xl)', border: '1px solid var(--mint-border)', borderRadius: 16, padding: 18, marginBottom: 22 }}>
              <p style={{ fontSize: 13, color: 'var(--mint-text2)', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.75, marginBottom: 14 }}>
                "ให้ตั้งใจฟังดีๆ เดี๋ยวจะบอกคำ 3 คำ เมื่อพูดจบแล้วให้พูดตามและจำไว้ เดี๋ยวจะกลับมาถามซ้ำ"
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {currentWords.map(w => (
                  <div key={w} style={{ background: 'white', border: '1.5px solid var(--mint-border)', borderRadius: 12, padding: '12px 6px', textAlign: 'center', fontWeight: 800, fontSize: 14, color: 'var(--mint-primary)', boxShadow: 'var(--shadow-sm)' }}>
                    {w}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleStart} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,var(--mint-primary),var(--mint-primary-l))', color: 'white', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px rgba(14,159,142,0.3)' }}>
              จำคำศัพท์ได้แล้ว →
            </button>
          </Card>
        )}

        {/* ── Step 2: Clock Drawing ── */}
        {step === 2 && (
          <Card>
            <SectionHead n="2" title="การวาดรูปนาฬิกา" color="var(--mint-blue)" />
            <ClockCanvas onConfirm={handleClockScore} />
          </Card>
        )}

        {/* ── Step 3: Word Recall ── */}
        {step === 3 && (
          <Card>
            <SectionHead n="3" title="การทดสอบความจำ" />
            <WordRecall words={currentWords} onConfirm={handleRecallScore} />
          </Card>
        )}

        {/* ── Step 4: Result ── */}
        {step === 4 && result && (
          <Card>
            {patient && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--mint-primary-xl)', border: '1px solid var(--mint-border)', borderRadius: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 16 }}>👤</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--mint-muted)' }}>อายุ {patient.age} ปี</p>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--mint-primary)', fontWeight: 700, flexShrink: 0 }}>✅ บันทึกแล้ว</div>
              </div>
            )}

            {/* Word set used + duration */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>ชุดคำที่ใช้:</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--mint-primary)' }}>{WORD_SET_LABELS[wordSetIdx]}</span>
              {currentWords.map(w => (
                <span key={w} style={{ fontSize: 10, background: 'var(--mint-primary-xl)', color: 'var(--mint-primary)', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>{w}</span>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--mint-text2)', background: 'white', border: '1px solid var(--mint-border)', borderRadius: 8, padding: '2px 8px', flexShrink: 0 }}>
                ⏱ {String(Math.floor((result.duration||0) / 60)).padStart(2,'0')}:{String((result.duration||0) % 60).padStart(2,'0')}
              </span>
            </div>

            {/* Score ring */}
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 10px' }}>
                <svg width="110" height="110" style={{ position: 'absolute', inset: 0 }}>
                  <circle cx="55" cy="55" r="48" fill="none" stroke="var(--mint-border2)" strokeWidth="7"/>
                  <circle cx="55" cy="55" r="48" fill="none"
                    stroke={result.impaired ? 'var(--mint-warn)' : 'var(--mint-primary)'} strokeWidth="7"
                    strokeDasharray={`${(result.total / 5) * 301.6} 301.6`}
                    strokeLinecap="round" transform="rotate(-90 55 55)"
                    style={{ transition: 'stroke-dasharray 0.9s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: result.impaired ? 'var(--mint-warn)' : 'var(--mint-primary)' }}>{result.total}</span>
                  <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>/ 5</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--mint-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>คะแนนรวม</p>
            </div>

            <div style={{ borderRadius: 14, padding: '14px 18px', marginBottom: 18, background: result.impaired ? '#fff7ed' : '#f0fdf9', border: `1.5px solid ${result.impaired ? '#fcd34d' : '#6ee7d5'}` }}>
              <p style={{ fontWeight: 700, textAlign: 'center', fontSize: 13, color: result.impaired ? '#92400e' : '#065f46' }}>
                {result.impaired ? '⚠️ มีภาวะการรู้คิดบกพร่อง (Cognitive Impairment)' : '✅ ผลการประเมินเบื้องต้นอยู่ในเกณฑ์ปกติ'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {[['Clock Drawing', result.clockScore, 2, 'var(--mint-primary)'], ['Word Recall', result.recallScore, 3, 'var(--mint-blue)']].map(([lb, sc, mx, c]) => (
                <div key={lb} style={{ background: 'var(--mint-surface2)', border: '1px solid var(--mint-border2)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: c }}>{sc}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--mint-muted)' }}>/{mx}</span></p>
                  <p style={{ fontSize: 11, color: 'var(--mint-muted)', marginTop: 3 }}>{lb}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: 'var(--mint-muted)', textAlign: 'center', marginBottom: 16 }}>* ผลนี้เป็นการประเมินเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</p>

            <button onClick={reset} style={{ width: '100%', padding: 13, background: 'var(--mint-surface2)', border: '1.5px solid var(--mint-border)', color: 'var(--mint-text)', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 8 }}>
              ทำแบบทดสอบใหม่
            </button>
            <button onClick={onBack} style={{ width: '100%', padding: 9, background: 'none', border: 'none', color: 'var(--mint-muted)', fontSize: 12, cursor: 'pointer' }}>
              ← กลับหน้าหลัก
            </button>
          </Card>
        )}
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--mint-muted)', padding: '14px', background: 'white', borderTop: '1px solid var(--mint-border2)' }}>Mini-Cog™ © S. Borson</p>
    </div>
  );
}