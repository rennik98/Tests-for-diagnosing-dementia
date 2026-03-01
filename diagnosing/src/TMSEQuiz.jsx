import React, { useState, useRef, useCallback, useEffect } from 'react';
import nurseImg from './assets/nurse.jpg';

/* ── useTimer hook ── */
function useTimer(autoStart = false) {
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef  = useRef(0);
  const intervalRef = useRef(null);
  const startedAt   = useRef(null);
  const stoppedRef  = useRef(false);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current); // clear any leftover (StrictMode)
    stoppedRef.current = false;
    startedAt.current = Date.now() - elapsedRef.current * 1000;
    intervalRef.current = setInterval(() => {
      if (stoppedRef.current) return;
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      elapsedRef.current = s;
      setElapsed(s);
    }, 500); // 500ms tick so display updates feel snappy
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const snapshot = useCallback(() => elapsedRef.current, []);

  // autoStart support
  useEffect(() => {
    if (autoStart) start();
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
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

const DAYS_ORDER = ['อาทิตย์','เสาร์','ศุกร์','พฤหัสบดี','พุธ','อังคาร','จันทร์'];
const ORI_Q      = [
  'วันนี้เป็นวันอะไร?',
  'วันนี้วันที่เท่าไร?',
  'เดือนนี้เดือนอะไร?',
  'ช่วงเวลาปัจจุบัน (เช้า/เที่ยง/บ่าย/เย็น)?',
  'ที่นี่ที่ไหน?',
  'คนในภาพนี้อาชีพอะไร?',
];

/* ── shared atoms ── */
const Cross = ({ s=14, c='var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1"   width="5"  height="18" rx="1.4"/>
    <rect x="1"   y="7.5" width="18" height="5"  rx="1.4"/>
  </svg>
);

const YN = ({ val, onChange, yL='ถูก', nL='ผิด' }) => (
  <div style={{ display:'flex', gap:8, marginTop:8 }}>
    {[[1,yL,'var(--mint-primary)','var(--mint-primary-xl)','var(--mint-primary)'],
      [0,nL,'#ef4444','#fff1f1','#fca5a5']].map(([v,label,col,bg,border]) => (
      <button key={v} onClick={() => onChange(v)} style={{
        flex:1, padding:'10px 8px', borderRadius:10, fontSize:13, fontWeight:700,
        border:`1.5px solid ${val===v ? border : 'var(--mint-border)'}`,
        background: val===v ? bg : 'var(--mint-surface2)',
        color: val===v ? col : 'var(--mint-muted)',
        cursor:'pointer', transition:'all 0.18s',
        minHeight: 42,
      }}>
        {val===v ? (v===1?'✓ ':'✗ ') : ''}{label}
      </button>
    ))}
  </div>
);

const Section = ({ num, title, max, score, color='var(--mint-primary)', children }) => (
  <div style={{ background:'white', border:`1.5px solid ${color}33`, borderRadius:20, padding:'22px 18px', boxShadow:'var(--shadow-sm)', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', left:0, top:14, bottom:14, width:4, borderRadius:'0 3px 3px 0', background:color }} />
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
      <div style={{ width:30, height:30, borderRadius:9, background:`${color}18`, border:`1.5px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color, flexShrink:0 }}>
        {num}
      </div>
      <h2 style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--mint-text)', lineHeight:1.3 }}>{title}</h2>
      <span style={{ fontSize:12, fontWeight:700, color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:20, padding:'2px 10px', flexShrink:0 }}>
        {score}/{max}
      </span>
    </div>
    {children}
  </div>
);

const SubQ = ({ label, val, onChange }) => (
  <div style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
    <p style={{ fontSize:13, color:'var(--mint-text2)', fontWeight:500 }}>{label}</p>
    <YN val={val} onChange={onChange} />
  </div>
);

const ActionBtn = ({ children, onClick, variant='primary' }) => {
  const styles = {
    primary: { background:'linear-gradient(135deg,var(--mint-primary),var(--mint-primary-l))', color:'white', border:'none', boxShadow:'0 6px 18px rgba(14,159,142,0.28)' },
    ghost:   { background:'var(--mint-surface2)', color:'var(--mint-text2)', border:'1.5px solid var(--mint-border)' },
    blue:    { background:'linear-gradient(135deg,var(--mint-blue),#60a5fa)', color:'white', border:'none', boxShadow:'0 6px 18px rgba(59,130,246,0.25)' },
    outline: { background:'none', color:'var(--mint-muted)', border:'none' },
  };
  return (
    <button onClick={onClick} style={{ width:'100%', padding:'13px', borderRadius:13, fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s', ...styles[variant] }}
      onMouseOver={e => { if(variant!=='outline') e.currentTarget.style.opacity='0.88'; }}
      onMouseOut={e  => e.currentTarget.style.opacity='1'}>
      {children}
    </button>
  );
};

/* ── Improved Freehand Drawing Canvas with undo + always-visible ── */
function DrawingCanvas({ width=280, height=200, onScoreSelect }) {
  const canvasRef   = useRef(null);
  const drawing     = useRef(false);
  const strokesRef  = useRef([]);   // completed strokes
  const currentRef  = useRef([]);   // points in current stroke
  const [confirmed, setConfirmed] = React.useState(false);
  const [isEmpty,   setIsEmpty]   = React.useState(true);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#0f2b28';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    for (const stroke of strokesRef.current) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  }, [width, height]);

  useEffect(() => { redrawAll(); }, [redrawAll]);

  const getPos = (e, canvas) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return { x:(src.clientX-rect.left)*scaleX, y:(src.clientY-rect.top)*scaleY };
  };

  const startDraw = (e) => {
    if (confirmed) return; e.preventDefault();
    drawing.current = true;
    currentRef.current = [];
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    currentRef.current.push(pos);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = '#0f2b28'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!drawing.current || confirmed) return; e.preventDefault();
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    currentRef.current.push(pos);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
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
    strokesRef.current = [];
    currentRef.current = [];
    redrawAll();
    setIsEmpty(true);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {/* Canvas always visible */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display:'block',
          border: confirmed ? '1.5px solid var(--mint-primary)' : '1.5px dashed var(--mint-border)',
          borderRadius:14,
          cursor: confirmed ? 'default' : 'crosshair',
          background:'white',
          touchAction:'none',
          opacity: confirmed ? 0.92 : 1,
          transition: 'border-color 0.2s, opacity 0.2s',
          margin: '0 auto',
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
        /* ── Drawing controls ── */
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handleUndo} disabled={isEmpty} style={{
            flex:1, padding:'10px', borderRadius:10, fontSize:13, fontWeight:700,
            background: isEmpty ? 'var(--mint-border2)' : 'var(--mint-surface2)',
            border:'1.5px solid var(--mint-border)',
            color: isEmpty ? 'var(--mint-muted)' : 'var(--mint-text2)',
            cursor: isEmpty ? 'not-allowed' : 'pointer', transition:'all 0.18s',
          }}>↩ ย้อนกลับ</button>
          <button onClick={handleClear} disabled={isEmpty} style={{
            flex:1, padding:'10px', borderRadius:10, fontSize:13, fontWeight:700,
            background: isEmpty ? 'var(--mint-border2)' : 'var(--mint-surface2)',
            border:'1.5px solid var(--mint-border)', color:'var(--mint-muted)',
            cursor: isEmpty ? 'not-allowed' : 'pointer', transition:'all 0.18s',
          }}>🗑️ ล้างใหม่</button>
          <button onClick={()=>setConfirmed(true)} disabled={isEmpty} style={{
            flex:2, padding:'10px', borderRadius:10, fontSize:13, fontWeight:700,
            background: isEmpty ? 'var(--mint-border2)' : 'linear-gradient(135deg,var(--mint-primary),var(--mint-primary-l))',
            color: isEmpty ? 'var(--mint-muted)' : 'white', border:'none',
            cursor: isEmpty ? 'not-allowed' : 'pointer', transition:'all 0.2s',
          }}>ยืนยันการวาด ✓</button>
        </div>
      ) : (
        /* ── Scoring controls ── */
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--mint-text)', marginBottom:10, textAlign:'center' }}>ให้คะแนนการวาดภาพ</p>
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            {[0,1,2].map(n=>(
              <button key={n} onClick={()=>onScoreSelect(n)} style={{
                flex:1, padding:'14px 6px', borderRadius:12, fontSize:14, fontWeight:800,
                display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                background: n===2 ? 'var(--mint-primary-xl)' : n===1 ? '#fef9c3' : '#fff1f1',
                border: `1.5px solid ${n===2?'var(--mint-primary)':n===1?'#fcd34d':'#fca5a5'}`,
                color: n===2 ? 'var(--mint-primary)' : n===1 ? '#92400e' : '#dc2626',
                cursor:'pointer', transition:'all 0.18s',
              }}
                onMouseOver={e=>e.currentTarget.style.opacity='0.85'}
                onMouseOut={e=>e.currentTarget.style.opacity='1'}
              >
                <span style={{fontSize:20}}>{n===2?'✓✓':n===1?'△':'✗'}</span>
                <span>{n} คะแนน</span>
                <span style={{fontSize:10,opacity:0.7}}>{n===2?'สมบูรณ์':n===1?'บางส่วน':'ไม่ถูกต้อง'}</span>
              </button>
            ))}
          </div>
          <button onClick={()=>{ setConfirmed(false); }} style={{
            width:'100%', padding:'8px', borderRadius:9, background:'none', border:'none',
            color:'var(--mint-muted)', fontSize:12, cursor:'pointer',
          }}>← วาดใหม่ / แก้ไข</button>
        </div>
      )}
    </div>
  );
}

/* ── Word Set Picker ── */
function WordSetPicker({ selectedSet, onSelect }) {
  return (
    <div style={{ marginBottom:14 }}>
      <p style={{ fontSize:12, color:'var(--mint-text2)', fontWeight:700, marginBottom:8 }}>
        เลือกชุดคำศัพท์
        <span style={{ fontSize:10, color:'var(--mint-muted)', fontWeight:400, marginLeft:6 }}>
          (กดสุ่มหรือเลือกเอง)
        </span>
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:8 }}>
        {WORD_SET_LABELS.map((label, i) => (
          <button key={i} onClick={() => onSelect(i)} style={{
            padding:'8px 4px', borderRadius:9, fontSize:11, fontWeight:700,
            border:`1.5px solid ${selectedSet===i ? 'var(--mint-primary)' : 'var(--mint-border)'}`,
            background: selectedSet===i ? 'var(--mint-primary-xl)' : 'var(--mint-surface2)',
            color: selectedSet===i ? 'var(--mint-primary)' : 'var(--mint-muted)',
            cursor:'pointer', transition:'all 0.15s',
          }}>
            {label}
          </button>
        ))}
        <button onClick={() => onSelect(Math.floor(Math.random() * WORD_SETS.length))} style={{
          padding:'8px 4px', borderRadius:9, fontSize:11, fontWeight:700,
          border:'1.5px solid var(--mint-border)',
          background:'linear-gradient(135deg,var(--mint-primary),var(--mint-primary-l))',
          color:'white', cursor:'pointer', transition:'all 0.15s',
        }}>
          🎲 สุ่ม
        </button>
      </div>
    </div>
  );
}

/* ── main ── */
export default function TMSEQuiz({ onBack, onComplete, patient }) {
  // Pick a random word set on mount
  const [wordSetIdx, setWordSetIdx] = useState(() => Math.floor(Math.random() * WORD_SETS.length));
  const REG_WORDS = WORD_SETS[wordSetIdx];

  const [oriS,  setOriS]  = useState(Array(6).fill(null));
  const [regS,  setRegS]  = useState(null);
  const [attS,  setAttS]  = useState(null);
  const [calcChk, setCalcChk] = useState([false,false,false]);
  const [calcS, setCalcS] = useState(null);
  const [langS, setLangS] = useState({ naming1:null, naming2:null, repeat:null, commands:Array(3).fill(null), read:null, copy:null, similarity:null });
  const [recS,  setRecS]  = useState(Array(3).fill(null));
  const [done,        setDone]        = useState(false);
  const [finalDuration, setFinalDuration] = useState(0);
  const timer = useTimer(true); // autoStart on mount

  // Reset recall scores when word set changes
  const handleWordSetChange = (idx) => {
    setWordSetIdx(idx);
    setRegS(null);
    setRecS(Array(3).fill(null));
  };

  const oriTotal  = oriS.filter(v=>v===1).length;
  const langTotal = (langS.naming1??0)+(langS.naming2??0)+(langS.repeat??0)+langS.commands.reduce((a,v)=>a+(v??0),0)+(langS.read??0)+(langS.copy??0)+(langS.similarity??0);
  const recTotal  = recS.reduce((a,v) => a + (v??0), 0);
  const total     = oriTotal+(regS??0)+(attS??0)+(calcS??0)+langTotal+recTotal;
  const impaired  = total < 24;

  const setCmd = (i, v) => { const c=[...langS.commands]; c[i]=v; setLangS(s=>({...s,commands:c})); };
  const setRec = (i, v) => { const a=[...recS]; a[i]=v; setRecS(a); };

  const handleFinish = () => {
    const duration = timer.snapshot();  // read ref before stop
    timer.stop();
    setFinalDuration(duration);
    setDone(true);
    if (onComplete) {
      onComplete({
        type: 'TMSE',
        totalScore: total,
        maxScore: 30,
        impaired,
        duration,
        breakdown: {
          orientation:  oriTotal,
          registration: regS ?? 0,
          attention:    attS ?? 0,
          calculation:  calcS ?? 0,
          language:     langTotal,
          recall:       recTotal,
        },
      });
    }
  };

  /* ── Result ── */
  if (done) {
    const sections=[
      {l:'Orientation',  s:oriTotal,    m:6},
      {l:'Registration', s:regS??0,     m:3},
      {l:'Attention',    s:attS??0,     m:5},
      {l:'Calculation',  s:calcS??0,    m:3},
      {l:'Language',     s:langTotal,   m:10},
      {l:'Recall',       s:recTotal,    m:3},
    ];
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <div style={{ position:'sticky',top:0,zIndex:50,background:'rgba(240,250,248,0.9)',backdropFilter:'blur(18px)',borderBottom:'1px solid var(--mint-border)',padding:'0 16px',height:56,display:'flex',alignItems:'center',gap:8 }}>
          <Cross s={14}/><span style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>TMSE — ผลการประเมิน</span>
          {patient && (
            <span style={{ fontSize:11,color:'var(--mint-blue)',fontWeight:600,background:'var(--mint-blue-xl)',padding:'2px 8px',borderRadius:20,border:'1px solid var(--mint-border)',marginLeft:4,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
              {patient.name} · {patient.age} ปี
            </span>
          )}
        </div>
        <div style={{ flex:1,maxWidth:520,margin:'0 auto',width:'100%',padding:'28px 16px' }}>
          {patient && (
            <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:'var(--mint-blue-xl)',border:'1px solid var(--mint-border)',borderRadius:14,marginBottom:20 }}>
              <span style={{ fontSize:18 }}>👤</span>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{patient.name}</p>
                <p style={{ fontSize:12,color:'var(--mint-muted)' }}>อายุ {patient.age} ปี</p>
              </div>
              <div style={{ marginLeft:'auto',fontSize:11,color:'var(--mint-blue)',fontWeight:700,background:'white',padding:'4px 10px',borderRadius:20,border:'1px solid var(--mint-border)',flexShrink:0 }}>
                ✅ บันทึกแล้ว
              </div>
            </div>
          )}

          {/* Word set used + duration */}
          <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:10,marginBottom:16,flexWrap:'wrap' }}>
            <span style={{ fontSize:11,color:'var(--mint-muted)' }}>ชุดคำที่ใช้:</span>
            <span style={{ fontSize:11,fontWeight:700,color:'var(--mint-primary)' }}>{WORD_SET_LABELS[wordSetIdx]}</span>
            <div style={{ display:'flex',gap:4,marginLeft:4 }}>
              {REG_WORDS.map(w=>(
                <span key={w} style={{ fontSize:10,background:'var(--mint-primary-xl)',color:'var(--mint-primary)',padding:'1px 6px',borderRadius:6,fontWeight:700 }}>{w}</span>
              ))}
            </div>
            <span style={{ marginLeft:'auto',fontSize:11,fontWeight:700,color:'var(--mint-text2)',background:'white',border:'1px solid var(--mint-border)',borderRadius:8,padding:'2px 8px',flexShrink:0 }}>
              ⏱ {String(Math.floor(finalDuration/60)).padStart(2,'0')}:{String(finalDuration%60).padStart(2,'0')}
            </span>
          </div>

          <div style={{ textAlign:'center',marginBottom:28 }}>
            <div style={{ position:'relative',width:130,height:130,margin:'0 auto 12px' }}>
              <svg width="130" height="130" style={{ position:'absolute',inset:0 }}>
                <circle cx="65" cy="65" r="56" fill="none" stroke="var(--mint-border2)" strokeWidth="8"/>
                <circle cx="65" cy="65" r="56" fill="none"
                  stroke={impaired?'var(--mint-warn)':'var(--mint-primary)'} strokeWidth="8"
                  strokeDasharray={`${(total/30)*351.9} 351.9`}
                  strokeLinecap="round" transform="rotate(-90 65 65)"
                  style={{ transition:'stroke-dasharray 0.9s ease' }}/>
              </svg>
              <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                <span style={{ fontSize:34,fontWeight:800,color:impaired?'var(--mint-warn)':'var(--mint-primary)' }}>{total}</span>
                <span style={{ fontSize:12,color:'var(--mint-muted)' }}>/ 30</span>
              </div>
            </div>
            <p style={{ fontSize:11,color:'var(--mint-muted)',letterSpacing:'0.08em',textTransform:'uppercase' }}>คะแนนรวม TMSE</p>
          </div>
          <div style={{ borderRadius:14,padding:'14px 18px',marginBottom:22,background:impaired?'#fff7ed':'#f0fdf9',border:`1.5px solid ${impaired?'#fcd34d':'#6ee7d5'}` }}>
            <p style={{ fontWeight:700,textAlign:'center',fontSize:14,color:impaired?'#92400e':'#065f46' }}>
              {impaired?'⚠️ มีภาวะ Cognitive Impairment (คะแนน < 24)':'✅ ผลการประเมินอยู่ในเกณฑ์ปกติ'}
            </p>
          </div>
          <div style={{ background:'white',border:'1px solid var(--mint-border2)',borderRadius:18,padding:'20px',marginBottom:20,boxShadow:'var(--shadow-sm)' }}>
            <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:14,fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase' }}>คะแนนแยกหมวด</p>
            {sections.map(({l,s,m}) => (
              <div key={l} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                <span style={{ fontSize:12,color:'var(--mint-text2)',width:90,flexShrink:0 }}>{l}</span>
                <div style={{ flex:1,height:7,borderRadius:4,background:'var(--mint-border2)',overflow:'hidden' }}>
                  <div style={{ height:'100%',borderRadius:4,background:`linear-gradient(90deg,var(--mint-primary),var(--mint-primary-l))`,width:`${(s/m)*100}%`,transition:'width 0.8s ease' }}/>
                </div>
                <span style={{ fontSize:12,fontWeight:700,color:'var(--mint-primary)',width:36,textAlign:'right' }}>{s}/{m}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:11,color:'var(--mint-muted)',textAlign:'center',marginBottom:20 }}>
            * ผลนี้เป็นการประเมินเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์<br/>
            ที่มา: สารศิริราช 45(6) มิถุนายน 2536 : 359-374
          </p>
          <ActionBtn onClick={onBack} variant="primary">← กลับหน้าหลัก</ActionBtn>
        </div>
        <div style={{ textAlign:'center',fontSize:11,color:'var(--mint-muted)',padding:14,background:'white',borderTop:'1px solid var(--mint-border2)' }}>TMSE · สารศิริราช 45(6) มิถุนายน 2536</div>
      </div>
    );
  }

  /* ── Quiz ── */
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* topbar */}
      <div style={{ position:'sticky',top:0,zIndex:50,background:'rgba(240,250,248,0.9)',backdropFilter:'blur(18px)',borderBottom:'1px solid var(--mint-border)',padding:'0 16px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <button onClick={onBack} style={{ background:'none',border:'none',color:'var(--mint-muted)',cursor:'pointer',fontSize:13,fontWeight:600,padding:'8px 0' }}>← กลับ</button>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <Cross s={14}/>
          <span style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>TMSE</span>
          {patient && (
            <span style={{ fontSize:11,color:'var(--mint-blue)',fontWeight:600,background:'var(--mint-blue-xl)',padding:'2px 8px',borderRadius:20,border:'1px solid var(--mint-border)',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
              {patient.name}
            </span>
          )}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ fontSize:12,fontWeight:700,color:'var(--mint-primary)',background:'var(--mint-primary-xl)',border:'1px solid var(--mint-border)',borderRadius:20,padding:'3px 10px' }}>
            {total}/30
          </div>
          <div style={{ fontSize:12,fontWeight:700,color:'var(--mint-text2)',background:'white',border:'1px solid var(--mint-border)',borderRadius:20,padding:'3px 10px',fontVariantNumeric:'tabular-nums',display:'flex',alignItems:'center',gap:4 }}>
            <span>⏱</span><span>{timer.fmt}</span>
          </div>
        </div>
      </div>

      <div style={{ flex:1,maxWidth:600,margin:'0 auto',width:'100%',padding:'20px 14px',display:'flex',flexDirection:'column',gap:12 }}>

        {/* 1. Orientation */}
        <Section num="1" title="การรับรู้สภาพแวดล้อม (Orientation)" max={6} score={oriTotal}>
          {ORI_Q.map((q,i) => (
            <div key={i}>
                {i === 5 && (
  <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
    <img src={nurseImg} alt="nurse" style={{ width:'100%', maxWidth:320, borderRadius:16, border:'1.5px solid var(--mint-border)', boxShadow:'var(--shadow-md)', display:'block' }} />
  </div>
)}
              <SubQ label={q} val={oriS[i]} onChange={v=>{const a=[...oriS];a[i]=v;setOriS(a);}} />
            </div>
          ))}
        </Section>

        {/* 2. Registration */}
        <Section num="2" title="การลงทะเบียนคำศัพท์ (Registration)" max={3} score={regS??0}>
          {/* Word set picker */}
          <WordSetPicker selectedSet={wordSetIdx} onSelect={handleWordSetChange} />

          <div style={{ background:'var(--mint-primary-xl)',border:'1px solid var(--mint-border)',borderRadius:14,padding:14,marginBottom:14 }}>
            <p style={{ fontSize:13,color:'var(--mint-text2)',fontStyle:'italic',textAlign:'center',lineHeight:1.7,marginBottom:12 }}>
              "เดี๋ยวจะบอกชื่อของ 3 อย่าง ให้ฟังดีๆ จะบอกเพียงครั้งเดียว เมื่อพูดจบแล้วให้พูดตาม"
            </p>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
              {REG_WORDS.map(w=>(
                <div key={w} style={{ background:'white',border:'1.5px solid var(--mint-border)',borderRadius:10,padding:'12px 8px',textAlign:'center',fontWeight:800,fontSize:14,color:'var(--mint-primary)',boxShadow:'var(--shadow-sm)' }}>{w}</div>
              ))}
            </div>
          </div>
          <p style={{ fontSize:12,color:'var(--mint-muted)',marginBottom:8 }}>ผู้ถูกทดสอบพูดตามได้กี่คำ?</p>
          <div style={{ display:'flex',gap:8 }}>
            {[0,1,2,3].map(n=>(
              <button key={n} onClick={()=>setRegS(n)} style={{ flex:1,padding:'12px 4px',borderRadius:10,fontSize:14,fontWeight:700,border:'1.5px solid',cursor:'pointer',transition:'all 0.18s',
                background:regS===n?'var(--mint-primary-xl)':'var(--mint-surface2)',
                borderColor:regS===n?'var(--mint-primary)':'var(--mint-border)',
                color:regS===n?'var(--mint-primary)':'var(--mint-muted)',
              }}>
                {n}
              </button>
            ))}
          </div>
        </Section>

        {/* 3. Attention */}
        <Section num="3" title="ความสนใจ (Attention)" max={5} score={attS??0}>
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:4 }}>ให้ผู้ถูกทดสอบบอกวันถอยหลัง เริ่มจาก <strong>อาทิตย์</strong></p>
          <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:12 }}>กดจำนวนวันที่ตอบถูกต้องต่อเนื่องจากต้น (หยุดนับเมื่อตอบผิดครั้งแรก, max 5)</p>
          <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:14 }}>
            {DAYS_ORDER.map((day,i)=>{
              const checked = attS !== null && i < (attS??0);
              return (
                <div key={day} style={{
                  display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:11,
                  background: checked ? 'var(--mint-primary-xl)' : 'var(--mint-surface2)',
                  border:`1.5px solid ${checked ? 'var(--mint-primary)' : 'var(--mint-border2)'}`,
                  opacity: i >= 5 ? 0.4 : 1, transition:'all 0.18s',
                }}>
                  <div style={{
                    width:22,height:22,borderRadius:6,flexShrink:0,
                    border:`2px solid ${checked?'var(--mint-primary)':'var(--mint-border)'}`,
                    background:checked?'var(--mint-primary)':'white',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:13,color:'white',fontWeight:700,transition:'all 0.15s',
                  }}>{checked?'✓':''}</div>
                  <span style={{ fontSize:14,fontWeight:600,color:checked?'var(--mint-primary)':'var(--mint-text)',flex:1 }}>{day}</span>
                  <span style={{ fontSize:11,color:'var(--mint-muted)' }}>ลำดับที่ {i+1}{i>=5?' (ไม่นับ)':''}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize:12,color:'var(--mint-text2)',marginBottom:8,fontWeight:600 }}>ตอบถูกต้องต่อเนื่องกี่วัน?</p>
          <div style={{ display:'flex',gap:6 }}>
            {[0,1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setAttS(n)} style={{
                flex:1,padding:'11px 2px',borderRadius:10,fontSize:14,fontWeight:700,
                border:'1.5px solid',cursor:'pointer',transition:'all 0.18s',
                background:attS===n?'var(--mint-primary-xl)':'var(--mint-surface2)',
                borderColor:attS===n?'var(--mint-primary)':'var(--mint-border)',
                color:attS===n?'var(--mint-primary)':'var(--mint-muted)',
              }}>{n}</button>
            ))}
          </div>
          {attS!==null && (
            <p style={{ textAlign:'center',marginTop:10,fontSize:13,fontWeight:700,color:attS>=4?'var(--mint-primary)':'var(--mint-warn)' }}>
              ✓ บันทึก {attS} คะแนน
            </p>
          )}
        </Section>

        {/* 4. Calculation */}
        <Section num="4" title="การคิดคำนวณ (Calculation)" max={3} score={calcS??0}>
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:4 }}>คิดเลข <strong>100 − 7</strong> ไปเรื่อยๆ 3 ครั้ง</p>
          <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:14 }}>เฉลย: 100 → 93 → 86 → 79</p>
          <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:14 }}>
            {[[100,93,0],[93,86,1],[86,79,2]].map(([from,to,i])=>{
              const isChecked = calcChk[i];
              return (
                <button key={i} onClick={()=>{ const a=[...calcChk]; a[i]=!a[i]; setCalcChk(a); const s=a.filter(Boolean).length; setCalcS(s); }} style={{
                  display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:12,
                  background: isChecked ? 'var(--mint-primary-xl)' : 'var(--mint-surface2)',
                  border:`1.5px solid ${isChecked ? 'var(--mint-primary)' : 'var(--mint-border2)'}`,
                  cursor:'pointer',transition:'all 0.18s',textAlign:'left',
                }}>
                  <div style={{
                    width:24,height:24,borderRadius:7,flexShrink:0,
                    border:`2px solid ${isChecked?'var(--mint-primary)':'var(--mint-border)'}`,
                    background:isChecked?'var(--mint-primary)':'white',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:14,color:'white',fontWeight:700,transition:'all 0.15s',
                  }}>{isChecked?'✓':''}</div>
                  <span style={{ fontSize:14,fontWeight:700,color:isChecked?'var(--mint-primary)':'var(--mint-text)' }}>
                    {from} − 7 = <strong>{to}</strong>
                  </span>
                  <span style={{ marginLeft:'auto',fontSize:12,color:isChecked?'var(--mint-primary)':'var(--mint-muted)',fontWeight:600 }}>
                    {isChecked?'✓ ถูก':'ยังไม่ระบุ'}
                  </span>
                </button>
              );
            })}
          </div>
          {calcS!==null && (
            <p style={{ textAlign:'center',fontSize:13,fontWeight:700,color:calcS>=2?'var(--mint-primary)':'var(--mint-warn)' }}>
              ✓ บันทึก {calcS}/3 คะแนน
            </p>
          )}
        </Section>

        {/* 5. Language */}
        <Section num="5" title="ภาษา (Language)" max={10} score={langTotal}>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            <SubQ label="5.1 ชี้นาฬิกาข้อมือ → 'สิ่งนี้เรียกว่าอะไร?'" val={langS.naming1} onChange={v=>setLangS(s=>({...s,naming1:v}))} />
            <SubQ label="5.2 ชี้เสื้อ → 'สิ่งนี้เรียกว่าอะไร?'" val={langS.naming2} onChange={v=>setLangS(s=>({...s,naming2:v}))} />

            <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
              <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500 }}>5.3 พูดตามประโยค</p>
              <div style={{ margin:'8px 0',padding:'10px 14px',background:'var(--mint-primary-xl)',border:'1px solid var(--mint-border)',borderRadius:10 }}>
                <p style={{ fontSize:13,color:'var(--mint-primary)',fontStyle:'italic',textAlign:'center' }}>"ยายพาหลานไปซื้อขนมที่ตลาด"</p>
              </div>
              <YN val={langS.repeat} onChange={v=>setLangS(s=>({...s,repeat:v}))} />
            </div>

            <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
              <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:4 }}>5.4 ทำตามคำสั่ง 3 ขั้นตอน (3 คะแนน)</p>
              <div style={{ padding:'8px 12px',background:'var(--mint-primary-xl)',border:'1px solid var(--mint-border)',borderRadius:10,marginBottom:10 }}>
                <p style={{ fontSize:12,color:'var(--mint-primary)',fontStyle:'italic' }}>"หยิบกระดาษด้วยมือขวา → พับครึ่ง → ส่งคืน"</p>
              </div>
              {['หยิบด้วยมือขวา','พับครึ่ง','ส่งคืนผู้ทดสอบ'].map((cmd,i)=>(
                <div key={i} style={{ marginBottom:6 }}>
                  <p style={{ fontSize:12,color:'var(--mint-muted)',marginBottom:2 }}>{i+1}. {cmd}</p>
                  <YN val={langS.commands[i]} onChange={v=>setCmd(i,v)} />
                </div>
              ))}
            </div>

            <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
              <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:8 }}>5.5 อ่านและทำตาม</p>
              <div style={{ textAlign:'center',fontSize:26,fontWeight:900,color:'var(--mint-text)',border:'1.5px solid var(--mint-border)',borderRadius:12,padding:16,marginBottom:8,background:'white',letterSpacing:'0.08em' }}>
                หลับตา
              </div>
              <YN val={langS.read} onChange={v=>setLangS(s=>({...s,read:v}))} />
            </div>

            <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
              <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:10 }}>5.6 วาดภาพตามตัวอย่าง (2 คะแนน)</p>
              <div style={{ display:'flex',justifyContent:'center',marginBottom:12 }}>
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:6 }}>ภาพตัวอย่าง</p>
                  <svg width="130" height="100" viewBox="0 0 130 100" style={{ border:'1.5px solid var(--mint-border)',borderRadius:12,background:'white',padding:4 }}>
                    <polygon points="65,8 118,48 12,48" fill="none" stroke="var(--mint-text2)" strokeWidth="2.5" strokeLinejoin="round"/>
                    <rect x="22" y="48" width="86" height="44" fill="none" stroke="var(--mint-text2)" strokeWidth="2.5"/>
                  </svg>
                </div>
              </div>
              <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:10 }}>วาดภาพตามตัวอย่างด้านบน (สี่เหลี่ยมทับสามเหลี่ยมที่มีสองส่วนทับกัน)</p>
              {langS.copy===null
                ? <DrawingCanvas width={280} height={180} onScoreSelect={v=>setLangS(s=>({...s,copy:v}))} />
                : (
                  <div>
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:langS.copy===2?'var(--mint-primary-xl)':langS.copy===1?'#fef9c3':'#fff1f1',border:`1px solid ${langS.copy===2?'var(--mint-primary)':langS.copy===1?'#fcd34d':'#fca5a5'}`,borderRadius:10 }}>
                      <span style={{ fontWeight:700,fontSize:14,color:langS.copy===2?'var(--mint-primary)':langS.copy===1?'#92400e':'#dc2626' }}>
                        {langS.copy===2?'✓✓ 2 คะแนน (สมบูรณ์)':langS.copy===1?'△ 1 คะแนน (บางส่วน)':'✗ 0 คะแนน'}
                      </span>
                      <button onClick={()=>setLangS(s=>({...s,copy:null}))} style={{ fontSize:11,color:'var(--mint-muted)',background:'none',border:'none',cursor:'pointer' }}>แก้ไข</button>
                    </div>
                  </div>
                )
              }
            </div>

            <div style={{ background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:12,padding:'12px 14px' }}>
              <p style={{ fontSize:13,color:'var(--mint-text2)',fontWeight:500,marginBottom:4 }}>5.7 ความเหมือน</p>
              <div style={{ padding:'8px 12px',background:'var(--mint-primary-xl)',border:'1px solid var(--mint-border)',borderRadius:10,marginBottom:8 }}>
                <p style={{ fontSize:12,color:'var(--mint-primary)',fontStyle:'italic' }}>"กล้วยกับส้มเหมือนกันคือเป็นผลไม้ แมวกับหมาเหมือนกันคือ..."</p>
              </div>
              <YN val={langS.similarity} onChange={v=>setLangS(s=>({...s,similarity:v}))} yL="ตอบได้" nL="ตอบไม่ได้" />
            </div>
          </div>
        </Section>

        {/* 6. Recall */}
        <Section num="6" title="การระลึก (Recall)" max={3} score={recTotal}>
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:8 }}>
            ผู้ถูกทดสอบระลึกคำแต่ละคำได้หรือไม่?
          </p>
          {/* reminder of which set is active */}
          <div style={{ display:'flex',gap:6,marginBottom:12,padding:'8px 12px',background:'var(--mint-primary-xl)',border:'1px solid var(--mint-border)',borderRadius:10 }}>
            <span style={{ fontSize:11,color:'var(--mint-primary)',fontWeight:700 }}>{WORD_SET_LABELS[wordSetIdx]}:</span>
            {REG_WORDS.map(w=>(
              <span key={w} style={{ fontSize:11,color:'var(--mint-text)',fontWeight:800 }}>{w}</span>
            ))}
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {REG_WORDS.map((word, i) => (
              <div key={word} style={{
                background: recS[i]===1 ? 'var(--mint-primary-xl)' : recS[i]===0 ? '#fff1f1' : 'var(--mint-surface2)',
                border: `1.5px solid ${recS[i]===1 ? 'var(--mint-primary)' : recS[i]===0 ? '#fca5a5' : 'var(--mint-border2)'}`,
                borderRadius:12, padding:'12px 14px', transition:'all 0.2s',
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{
                      width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                      background: recS[i]===1 ? 'var(--mint-primary)' : recS[i]===0 ? '#ef4444' : 'var(--mint-border2)',
                      fontSize:14, transition:'all 0.2s',
                    }}>
                      {recS[i]===1 ? '✓' : recS[i]===0 ? '✗' : <span style={{fontSize:10,color:'var(--mint-muted)'}}>{i+1}</span>}
                    </span>
                    <span style={{ fontSize:15, fontWeight:800, color: recS[i]===1 ? 'var(--mint-primary)' : recS[i]===0 ? '#ef4444' : 'var(--mint-text)' }}>
                      {word}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => setRec(i, 1)} style={{
                      padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:700,
                      border:`1.5px solid ${recS[i]===1 ? 'var(--mint-primary)' : 'var(--mint-border)'}`,
                      background: recS[i]===1 ? 'var(--mint-primary)' : 'white',
                      color: recS[i]===1 ? 'white' : 'var(--mint-muted)',
                      cursor:'pointer', transition:'all 0.18s',
                    }}>จำได้</button>
                    <button onClick={() => setRec(i, 0)} style={{
                      padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:700,
                      border:`1.5px solid ${recS[i]===0 ? '#fca5a5' : 'var(--mint-border)'}`,
                      background: recS[i]===0 ? '#ef4444' : 'white',
                      color: recS[i]===0 ? 'white' : 'var(--mint-muted)',
                      cursor:'pointer', transition:'all 0.18s',
                    }}>ลืม</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, padding:'10px 14px', background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'var(--mint-text2)' }}>ระลึกได้ทั้งหมด</span>
            <span style={{ fontSize:16, fontWeight:800, color:'var(--mint-primary)' }}>{recTotal}/3 คำ</span>
          </div>
        </Section>

        {/* Submit */}
        <div style={{ background:'white',border:'1.5px solid var(--mint-border)',borderRadius:20,padding:'20px 16px',boxShadow:'var(--shadow-md)' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
            <span style={{ fontSize:15,fontWeight:700,color:'var(--mint-text)' }}>คะแนนรวมทั้งหมด</span>
            <span style={{ fontSize:28,fontWeight:800,color:total>=24?'var(--mint-primary)':'var(--mint-warn)' }}>
              {total}<span style={{ fontSize:14,color:'var(--mint-muted)',fontWeight:400 }}>/30</span>
            </span>
          </div>
          <div style={{ height:8,borderRadius:4,background:'var(--mint-border2)',overflow:'hidden',marginBottom:20 }}>
            <div style={{ height:'100%',borderRadius:4,background:`linear-gradient(90deg,${total>=24?'var(--mint-primary),var(--mint-primary-l)':'var(--mint-warn),#fcd34d'})`,width:`${(total/30)*100}%`,transition:'width 0.5s ease' }}/>
          </div>
          <ActionBtn onClick={handleFinish} variant="primary">ดูผลการประเมิน →</ActionBtn>
          <div style={{ height:8 }}/>
          <ActionBtn onClick={onBack} variant="outline">← กลับหน้าหลัก</ActionBtn>
        </div>

        <p style={{ textAlign:'center',fontSize:11,color:'var(--mint-muted)',paddingBottom:20 }}>
          TMSE · สารศิริราช 45(6) มิถุนายน 2536 : 359-374
        </p>
      </div>
    </div>
  );
}