import React, { useState } from 'react';

const REGISTRATION_WORDS = ['ต้นไม้', 'รถยนต์', 'มือ'];
const DAYS_ORDER = ['อาทิตย์', 'เสาร์', 'ศุกร์', 'พฤหัสบดี', 'พุธ', 'อังคาร', 'จันทร์'];

const MedCross = ({ size = 14, color = '#14b8a6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="9" y="2" width="6" height="20" rx="1.5"/>
    <rect x="2" y="9" width="20" height="6" rx="1.5"/>
  </svg>
);

// ── YN Toggle ────────────────────────────────────────────────────────────────
const YN = ({ value, onChange, yesLabel='ถูก', noLabel='ผิด' }) => (
  <div style={{ display:'flex', gap:8, marginTop:8 }}>
    {[[1, yesLabel, '#14b8a6', 'rgba(20,184,166,0.15)', 'rgba(20,184,166,0.4)'],
      [0, noLabel, '#f87171', 'rgba(248,113,113,0.1)', 'rgba(248,113,113,0.35)']].map(([val, label, col, bg, border]) => (
      <button
        key={val}
        onClick={() => onChange(val)}
        style={{
          flex:1, padding:'9px', borderRadius:10, fontSize:13, fontWeight:700, border:`1px solid`, cursor:'pointer', transition:'all 0.2s',
          background: value===val ? bg : 'rgba(255,255,255,0.03)',
          borderColor: value===val ? border : 'rgba(255,255,255,0.08)',
          color: value===val ? col : '#8098bc',
          boxShadow: value===val ? `0 0 16px ${bg}` : 'none',
        }}
      >
        {value===val ? (val===1?'✓ ':'✗ ') : ''}{label}
      </button>
    ))}
  </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ num, title, maxPts, current, color='#14b8a6', children }) => (
  <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid rgba(255,255,255,0.07)`, borderRadius:20, padding:28, position:'relative', overflow:'hidden' }}>
    {/* Left accent bar */}
    <div style={{ position:'absolute', left:0, top:16, bottom:16, width:3, background:color, borderRadius:'0 2px 2px 0' }} />
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
      <div style={{ width:28, height:28, background:`${color}18`, border:`1px solid ${color}44`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color }}>
        {num}
      </div>
      <h2 style={{ flex:1, fontSize:15, fontWeight:700, color:'#f0f4fa' }}>{title}</h2>
      <div style={{ fontSize:11, fontWeight:700, color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:20, padding:'2px 10px' }}>
        {current}/{maxPts}
      </div>
    </div>
    {children}
  </div>
);

// ── Sub-question row ──────────────────────────────────────────────────────────
const SubQ = ({ label, value, onChange }) => (
  <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px', marginBottom:8 }}>
    <p style={{ fontSize:13, color:'#c8d8f0', fontWeight:500, marginBottom:0 }}>{label}</p>
    <YN value={value} onChange={onChange} />
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
export default function TMSEQuiz({ onBack }) {
  const [oriScores, setOriScores] = useState(Array(6).fill(null));
  const [regScore, setRegScore] = useState(null);
  const [dayOrder, setDayOrder] = useState([...DAYS_ORDER].reverse());
  const [attScore, setAttScore] = useState(null);
  const [calcAnswers, setCalcAnswers] = useState(['','','']);
  const [calcScore, setCalcScore] = useState(null);
  const [langScores, setLangScores] = useState({ naming1:null, naming2:null, repeat:null, commands:Array(3).fill(null), read:null, copy:null, similarity:null });
  const [recallWords, setRecallWords] = useState(['','','']);
  const [recallScore, setRecallScore] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const CALC_ANS = [93, 86, 79];
  const ORI_Q = [
    'วันนี้เป็นวันอะไร?',
    'วันนี้วันที่เท่าไร?',
    'เดือนนี้เดือนอะไร?',
    'ช่วงเวลาปัจจุบัน (เช้า/เที่ยง/บ่าย/เย็น)?',
    'ที่นี่ที่ไหน?',
    'คนในภาพนี้อาชีพอะไร?',
  ];

  const oriTotal = oriScores.filter(v=>v===1).length;
  const langTotal = (langScores.naming1??0)+(langScores.naming2??0)+(langScores.repeat??0)+langScores.commands.reduce((a,v)=>a+(v??0),0)+(langScores.read??0)+(langScores.copy??0)+(langScores.similarity??0);
  const totalScore = oriTotal+(regScore??0)+(attScore??0)+(calcScore??0)+langTotal+(recallScore??0);
  const impaired = totalScore < 24;

  const evaluateAttention = () => {
    let sc = 0;
    for (let i=0; i<DAYS_ORDER.length; i++) { if (dayOrder[i]===DAYS_ORDER[i]) sc++; else break; }
    setAttScore(Math.min(sc, 5));
  };

  const evaluateCalc = () => {
    let sc = 0;
    calcAnswers.forEach((a,i) => { if (parseInt(a)===CALC_ANS[i]) sc++; });
    setCalcScore(sc);
  };

  const evaluateRecall = () => {
    let sc = 0;
    recallWords.forEach(w => { if (REGISTRATION_WORDS.includes(w.trim())) sc++; });
    setRecallScore(sc);
  };

  const moveDay = (i, dir) => {
    const arr = [...dayOrder];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setDayOrder(arr);
    setAttScore(null);
  };

  const S = { fontFamily:"'DM Sans','Sarabun',sans-serif" };

  // ── Result screen ──
  if (showResult) {
    const sections = [
      { label:'Orientation', score:oriTotal, max:6 },
      { label:'Registration', score:regScore??0, max:3 },
      { label:'Attention', score:attScore??0, max:5 },
      { label:'Calculation', score:calcScore??0, max:3 },
      { label:'Language', score:langTotal, max:10 },
      { label:'Recall', score:recallScore??0, max:3 },
    ];

    return (
      <div style={{ ...S, minHeight:'100vh', position:'relative', zIndex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(10,22,40,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 32px', height:60, display:'flex', alignItems:'center', gap:12 }}>
          <MedCross size={14} color="#14b8a6" />
          <span style={{ fontSize:14, fontWeight:700, color:'#f0f4fa' }}>TMSE — ผลการประเมิน</span>
        </div>

        <div style={{ flex:1, maxWidth:560, margin:'0 auto', width:'100%', padding:'40px 24px' }}>
          {/* Score circle */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ position:'relative', width:120, height:120, margin:'0 auto 12px' }}>
              <svg width="120" height="120" style={{ position:'absolute', inset:0 }}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                <circle cx="60" cy="60" r="52" fill="none"
                  stroke={impaired ? '#f59e0b' : '#14b8a6'} strokeWidth="7"
                  strokeDasharray={`${(totalScore/30)*326.7} 326.7`}
                  strokeLinecap="round" transform="rotate(-90 60 60)"
                />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:32, fontWeight:800, color: impaired ? '#f59e0b' : '#14b8a6' }}>{totalScore}</span>
                <span style={{ fontSize:11, color:'#8098bc' }}>/ 30</span>
              </div>
            </div>
            <p style={{ fontSize:11, color:'#8098bc', letterSpacing:'0.1em', textTransform:'uppercase' }}>คะแนนรวม TMSE</p>
          </div>

          {/* Status banner */}
          <div style={{ borderRadius:14, padding:'16px 20px', marginBottom:24, background: impaired ? 'rgba(245,158,11,0.1)' : 'rgba(20,184,166,0.1)', border:`1px solid ${impaired ? 'rgba(245,158,11,0.3)' : 'rgba(20,184,166,0.3)'}` }}>
            <p style={{ fontWeight:700, textAlign:'center', fontSize:14, color: impaired ? '#fbbf24' : '#2dd4bf' }}>
              {impaired ? '⚠️ มีภาวะ Cognitive Impairment (คะแนน < 24)' : '✅ ผลการประเมินอยู่ในเกณฑ์ปกติ'}
            </p>
          </div>

          {/* Section bars */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:20 }}>
            <p style={{ fontSize:11, color:'#8098bc', marginBottom:14, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>คะแนนแยกหมวด</p>
            {sections.map(({ label, score, max }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:13, color:'#c8d8f0', width:110, flexShrink:0 }}>{label}</span>
                <div style={{ flex:1, height:6, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,#14b8a6,#2dd4bf)', width:`${(score/max)*100}%`, transition:'width 0.8s ease' }} />
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:'#14b8a6', width:36, textAlign:'right' }}>{score}/{max}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize:11, color:'#8098bc', textAlign:'center', marginBottom:20 }}>
            * ผลนี้เป็นการประเมินเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์<br/>
            ที่มา: สารศิริราช 45(6) มิถุนายน 2536 : 359-374
          </p>

          <button onClick={onBack} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#0d9488,#14b8a6)', color:'white', border:'none', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 8px 24px rgba(13,148,136,0.3)' }}>
            ← กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ──
  return (
    <div style={{ ...S, minHeight:'100vh', position:'relative', zIndex:1, display:'flex', flexDirection:'column' }}>

      {/* Top bar */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(10,22,40,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 32px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'#8098bc', cursor:'pointer', fontSize:13, fontWeight:600 }}>← กลับ</button>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <MedCross size={14} color="#14b8a6" />
          <span style={{ fontSize:14, fontWeight:700, color:'#f0f4fa' }}>TMSE</span>
          <span style={{ fontSize:11, color:'#8098bc' }}>Thai Mental State Examination</span>
        </div>
        <div style={{ fontSize:12, fontWeight:700, color:'#14b8a6', background:'rgba(20,184,166,0.1)', border:'1px solid rgba(20,184,166,0.25)', borderRadius:20, padding:'3px 12px' }}>
          {totalScore}/30
        </div>
      </div>

      <div style={{ flex:1, maxWidth:600, margin:'0 auto', width:'100%', padding:'32px 20px', display:'flex', flexDirection:'column', gap:16 }}>

        {/* ── 1. Orientation ── */}
        <Section num="1" title="การรับรู้สภาพแวดล้อม (Orientation)" maxPts={6} current={oriTotal}>
          {ORI_Q.map((q, i) => (
            <SubQ key={i} label={q} value={oriScores[i]} onChange={v => { const a=[...oriScores]; a[i]=v; setOriScores(a); }} />
          ))}
        </Section>

        {/* ── 2. Registration ── */}
        <Section num="2" title="การลงทะเบียนคำศัพท์ (Registration)" maxPts={3} current={regScore??0}>
          <div style={{ background:'rgba(20,184,166,0.07)', border:'1px solid rgba(20,184,166,0.2)', borderRadius:14, padding:16, marginBottom:16 }}>
            <p style={{ fontSize:13, color:'#8098bc', fontStyle:'italic', marginBottom:12, textAlign:'center' }}>
              "เดี๋ยวจะบอกชื่อของ 3 อย่าง ให้ฟังดีๆ จะบอกเพียงครั้งเดียว เมื่อพูดจบแล้วให้พูดตาม"
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {REGISTRATION_WORDS.map(w => (
                <div key={w} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(20,184,166,0.25)', borderRadius:10, padding:'12px 8px', textAlign:'center', fontWeight:800, fontSize:15, color:'#2dd4bf' }}>{w}</div>
              ))}
            </div>
          </div>
          <p style={{ fontSize:12, color:'#8098bc', marginBottom:8 }}>ผู้ถูกทดสอบพูดตามได้กี่คำ?</p>
          <div style={{ display:'flex', gap:8 }}>
            {[0,1,2,3].map(n => (
              <button key={n} onClick={() => setRegScore(n)} style={{ flex:1, padding:'11px', borderRadius:10, fontSize:14, fontWeight:700, border:'1px solid', cursor:'pointer', transition:'all 0.2s',
                background: regScore===n ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.03)',
                borderColor: regScore===n ? 'rgba(20,184,166,0.5)' : 'rgba(255,255,255,0.08)',
                color: regScore===n ? '#2dd4bf' : '#8098bc',
              }}>
                {n}
              </button>
            ))}
          </div>
        </Section>

        {/* ── 3. Attention ── */}
        <Section num="3" title="ความสนใจ (Attention)" maxPts={5} current={attScore??0}>
          <p style={{ fontSize:13, color:'#8098bc', marginBottom:4 }}>เรียงวันในสัปดาห์ถอยหลัง เริ่มจาก <strong style={{ color:'#f0f4fa' }}>อาทิตย์</strong></p>
          <p style={{ fontSize:11, color:'#8098bc', marginBottom:12 }}>กด ↑ / ↓ เพื่อจัดเรียง</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
            {dayOrder.map((day, i) => (
              <div key={day} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'8px 12px' }}>
                <span style={{ fontSize:11, color:'#8098bc', width:18 }}>{i+1}.</span>
                <span style={{ flex:1, fontSize:14, fontWeight:600, color:'#f0f4fa' }}>{day}</span>
                <button onClick={()=>moveDay(i,-1)} disabled={i===0} style={{ background:'none', border:'none', color:i===0?'#4a5568':'#8098bc', cursor:i===0?'default':'pointer', fontSize:16, padding:'0 4px' }}>↑</button>
                <button onClick={()=>moveDay(i,1)} disabled={i===dayOrder.length-1} style={{ background:'none', border:'none', color:i===dayOrder.length-1?'#4a5568':'#8098bc', cursor:i===dayOrder.length-1?'default':'pointer', fontSize:16, padding:'0 4px' }}>↓</button>
              </div>
            ))}
          </div>
          <button onClick={evaluateAttention} style={{ width:'100%', padding:'11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#f0f4fa', borderRadius:11, fontSize:13, fontWeight:700, cursor:'pointer' }}>
            ตรวจคำตอบ
          </button>
          {attScore !== null && (
            <p style={{ textAlign:'center', marginTop:8, fontSize:13, fontWeight:700, color: attScore>=4?'#2dd4bf':'#f59e0b' }}>
              ถูกต้องต่อเนื่อง {attScore} วัน (max 5)
            </p>
          )}
        </Section>

        {/* ── 4. Calculation ── */}
        <Section num="4" title="การคิดคำนวณ (Calculation)" maxPts={3} current={calcScore??0}>
          <p style={{ fontSize:13, color:'#8098bc', marginBottom:16 }}>คิดเลข 100 − 7 ไปเรื่อยๆ 3 ครั้ง</p>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:14 }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#f0f4fa' }}>100</span>
            {calcAnswers.map((val, i) => (
              <React.Fragment key={i}>
                <span style={{ color:'#8098bc', fontSize:16 }}>→</span>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <input
                    type="number"
                    value={val}
                    onChange={e => { const a=[...calcAnswers]; a[i]=e.target.value; setCalcAnswers(a); setCalcScore(null); }}
                    placeholder="?"
                    style={{ width:72, padding:'10px 8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:15, fontWeight:700, color:'#f0f4fa', outline:'none', textAlign:'center', boxSizing:'border-box' }}
                    onFocus={e=>e.target.style.borderColor='rgba(20,184,166,0.5)'}
                    onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'}
                  />
                  {calcScore !== null && (
                    <span style={{ fontSize:11, fontWeight:700, color: parseInt(val)===CALC_ANS[i]?'#4ade80':'#f87171' }}>
                      {parseInt(val)===CALC_ANS[i] ? '✓' : `✗ (${CALC_ANS[i]})`}
                    </span>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
          <button onClick={evaluateCalc} style={{ width:'100%', padding:'11px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#f0f4fa', borderRadius:11, fontSize:13, fontWeight:700, cursor:'pointer' }}>
            ตรวจคำตอบ
          </button>
        </Section>

        {/* ── 5. Language ── */}
        <Section num="5" title="ภาษา (Language)" maxPts={10} current={langTotal}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

            <SubQ label="5.1 ชี้นาฬิกาข้อมือ → 'สิ่งนี้เรียกว่าอะไร?'" value={langScores.naming1} onChange={v=>setLangScores(s=>({...s,naming1:v}))} />
            <SubQ label="5.2 ชี้เสื้อ → 'สิ่งนี้เรียกว่าอะไร?'" value={langScores.naming2} onChange={v=>setLangScores(s=>({...s,naming2:v}))} />

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px' }}>
              <p style={{ fontSize:13, color:'#c8d8f0', fontWeight:500 }}>5.3 พูดตามประโยค</p>
              <div style={{ margin:'8px 0', padding:'10px 14px', background:'rgba(20,184,166,0.08)', border:'1px solid rgba(20,184,166,0.2)', borderRadius:10 }}>
                <p style={{ fontSize:13, color:'#2dd4bf', fontStyle:'italic', textAlign:'center' }}>"ยายพาหลานไปซื้อขนมที่ตลาด"</p>
              </div>
              <YN value={langScores.repeat} onChange={v=>setLangScores(s=>({...s,repeat:v}))} />
            </div>

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px' }}>
              <p style={{ fontSize:13, color:'#c8d8f0', fontWeight:500, marginBottom:4 }}>5.4 ทำตามคำสั่ง 3 ขั้นตอน (3 คะแนน)</p>
              <div style={{ padding:'8px 12px', background:'rgba(20,184,166,0.06)', border:'1px solid rgba(20,184,166,0.15)', borderRadius:10, marginBottom:10 }}>
                <p style={{ fontSize:12, color:'#2dd4bf', fontStyle:'italic' }}>"หยิบกระดาษด้วยมือขวา → พับครึ่ง → ส่งคืน"</p>
              </div>
              {['หยิบด้วยมือขวา','พับครึ่ง','ส่งคืนผู้ทดสอบ'].map((cmd, i) => (
                <div key={i} style={{ marginBottom:6 }}>
                  <p style={{ fontSize:12, color:'#8098bc', marginBottom:2 }}>{i+1}. {cmd}</p>
                  <YN value={langScores.commands[i]} onChange={v=>{ const c=[...langScores.commands]; c[i]=v; setLangScores(s=>({...s,commands:c})); }} />
                </div>
              ))}
            </div>

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px' }}>
              <p style={{ fontSize:13, color:'#c8d8f0', fontWeight:500, marginBottom:8 }}>5.5 อ่านและทำตาม</p>
              <div style={{ textAlign:'center', fontSize:28, fontWeight:900, color:'#f0f4fa', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'16px', marginBottom:8, background:'rgba(255,255,255,0.03)', letterSpacing:'0.1em' }}>
                หลับตา
              </div>
              <YN value={langScores.read} onChange={v=>setLangScores(s=>({...s,read:v}))} />
            </div>

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px' }}>
              <p style={{ fontSize:13, color:'#c8d8f0', fontWeight:500, marginBottom:10 }}>5.6 วาดภาพตามตัวอย่าง (2 คะแนน)</p>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                <svg width="120" height="100" viewBox="0 0 120 100" style={{ border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, background:'rgba(255,255,255,0.03)' }}>
                  <polygon points="60,10 110,50 10,50" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinejoin="round"/>
                  <rect x="25" y="50" width="70" height="40" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"/>
                </svg>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {[0,1,2].map(n => (
                  <button key={n} onClick={() => setLangScores(s=>({...s,copy:n}))} style={{ flex:1, padding:'10px', borderRadius:10, fontSize:13, fontWeight:700, border:'1px solid', cursor:'pointer', transition:'all 0.2s',
                    background: langScores.copy===n ? 'rgba(20,184,166,0.18)' : 'rgba(255,255,255,0.03)',
                    borderColor: langScores.copy===n ? 'rgba(20,184,166,0.5)' : 'rgba(255,255,255,0.08)',
                    color: langScores.copy===n ? '#2dd4bf' : '#8098bc',
                  }}>
                    {n} คะแนน
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px' }}>
              <p style={{ fontSize:13, color:'#c8d8f0', fontWeight:500, marginBottom:4 }}>5.7 ความเหมือน</p>
              <div style={{ padding:'8px 12px', background:'rgba(20,184,166,0.06)', border:'1px solid rgba(20,184,166,0.15)', borderRadius:10, marginBottom:8 }}>
                <p style={{ fontSize:12, color:'#2dd4bf', fontStyle:'italic' }}>"กล้วยกับส้มเหมือนกันคือเป็นผลไม้ แมวกับหมาเหมือนกันคือ..."</p>
              </div>
              <YN value={langScores.similarity} onChange={v=>setLangScores(s=>({...s,similarity:v}))} yesLabel="ตอบได้" noLabel="ตอบไม่ได้" />
            </div>
          </div>
        </Section>

        {/* ── 6. Recall ── */}
        <Section num="6" title="การระลึก (Recall)" maxPts={3} current={recallScore??0}>
          <p style={{ fontSize:13, color:'#8098bc', marginBottom:14 }}>ให้บอกสิ่งของ 3 อย่างที่จำได้จากตอนแรก</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
            {recallWords.map((w, i) => (
              <input key={i} type="text" placeholder={`คำที่ ${i+1}`} value={w}
                onChange={e=>{ const a=[...recallWords]; a[i]=e.target.value; setRecallWords(a); setRecallScore(null); }}
                style={{ width:'100%', padding:'13px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, fontSize:15, fontWeight:700, color:'#f0f4fa', outline:'none', textAlign:'center', boxSizing:'border-box' }}
                onFocus={e=>e.target.style.borderColor='rgba(20,184,166,0.5)'}
                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.09)'}
              />
            ))}
          </div>
          <button onClick={evaluateRecall} style={{ width:'100%', padding:'12px', background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.3)', color:'#2dd4bf', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer' }}>
            ตรวจคำตอบ
          </button>
          {recallScore !== null && (
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              {REGISTRATION_WORDS.map(word => {
                const ok = recallWords.some(w=>w.trim()===word);
                return (
                  <div key={word} style={{ flex:1, textAlign:'center', padding:'8px', borderRadius:10, fontSize:12, fontWeight:700, background: ok?'rgba(20,184,166,0.12)':'rgba(248,113,113,0.1)', border:`1px solid ${ok?'rgba(20,184,166,0.3)':'rgba(248,113,113,0.25)'}`, color: ok?'#2dd4bf':'#f87171' }}>
                    {ok?'✓':'✗'} {word}
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Submit ── */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#f0f4fa' }}>คะแนนรวมทั้งหมด</span>
            <span style={{ fontSize:28, fontWeight:800, color: totalScore>=24?'#14b8a6':'#f59e0b' }}>{totalScore}<span style={{ fontSize:14, color:'#8098bc', fontWeight:400 }}>/30</span></span>
          </div>
          <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden', marginBottom:20 }}>
            <div style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg,${totalScore>=24?'#0d9488,#14b8a6':'#d97706,#f59e0b'})`, width:`${(totalScore/30)*100}%`, transition:'width 0.5s ease' }} />
          </div>
          <button onClick={() => setShowResult(true)} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#0d9488,#14b8a6)', color:'white', border:'none', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 8px 24px rgba(13,148,136,0.3)', marginBottom:8 }}>
            ดูผลการประเมิน →
          </button>
          <button onClick={onBack} style={{ width:'100%', padding:'10px', background:'none', border:'none', color:'#8098bc', fontSize:12, cursor:'pointer' }}>
            ← กลับหน้าหลัก
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'#4a5568', paddingBottom:16 }}>
          TMSE · สารศิริราช 45(6) มิถุนายน 2536 : 359-374
        </p>
      </div>
    </div>
  );
}