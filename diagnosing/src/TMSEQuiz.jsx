import React, { useState } from 'react';

const REG_WORDS  = ['ต้นไม้', 'รถยนต์', 'มือ'];
const DAYS_ORDER = ['อาทิตย์','เสาร์','ศุกร์','พฤหัสบดี','พุธ','อังคาร','จันทร์'];
const CALC_ANS   = [93, 86, 79];
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
        flex:1, padding:'9px', borderRadius:10, fontSize:13, fontWeight:700,
        border:`1.5px solid ${val===v ? border : 'var(--mint-border)'}`,
        background: val===v ? bg : 'var(--mint-surface2)',
        color: val===v ? col : 'var(--mint-muted)',
        cursor:'pointer', transition:'all 0.18s',
      }}>
        {val===v ? (v===1?'✓ ':'✗ ') : ''}{label}
      </button>
    ))}
  </div>
);

const Section = ({ num, title, max, score, color='var(--mint-primary)', children }) => (
  <div style={{ background:'white', border:`1.5px solid ${color}33`, borderRadius:20, padding:'26px 24px', boxShadow:'var(--shadow-sm)', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', left:0, top:14, bottom:14, width:4, borderRadius:'0 3px 3px 0', background:color }} />
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
      <div style={{ width:30, height:30, borderRadius:9, background:`${color}18`, border:`1.5px solid ${color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color }}>
        {num}
      </div>
      <h2 style={{ flex:1, fontSize:15, fontWeight:700, color:'var(--mint-text)' }}>{title}</h2>
      <span style={{ fontSize:12, fontWeight:700, color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:20, padding:'2px 10px' }}>
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

const FocusInput = ({ value, onChange, placeholder, ...rest }) => (
  <input value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:'100%', padding:'12px 14px', background:'var(--mint-surface2)', border:'1.5px solid var(--mint-border)', borderRadius:11, fontSize:14, fontWeight:700, color:'var(--mint-text)', outline:'none', boxSizing:'border-box', transition:'border-color 0.18s' }}
    onFocus={e => e.target.style.borderColor='var(--mint-primary)'}
    onBlur={e  => e.target.style.borderColor='var(--mint-border)'}
    {...rest}
  />
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

/* ── main ── */
export default function TMSEQuiz({ onBack, onComplete, patient }) {
  const [oriS,  setOriS]  = useState(Array(6).fill(null));
  const [regS,  setRegS]  = useState(null);
  const [days,  setDays]  = useState([...DAYS_ORDER].reverse());
  const [attS,  setAttS]  = useState(null);
  const [calcA, setCalcA] = useState(['','','']);
  const [calcS, setCalcS] = useState(null);
  const [langS, setLangS] = useState({ naming1:null, naming2:null, repeat:null, commands:Array(3).fill(null), read:null, copy:null, similarity:null });
  const [recW,  setRecW]  = useState(['','','']);
  const [recS,  setRecS]  = useState(null);
  const [done,  setDone]  = useState(false);

  const oriTotal  = oriS.filter(v=>v===1).length;
  const langTotal = (langS.naming1??0)+(langS.naming2??0)+(langS.repeat??0)+langS.commands.reduce((a,v)=>a+(v??0),0)+(langS.read??0)+(langS.copy??0)+(langS.similarity??0);
  const total     = oriTotal+(regS??0)+(attS??0)+(calcS??0)+langTotal+(recS??0);
  const impaired  = total < 24;

  const moveDay = (i, d) => {
    const a=[...days], j=i+d;
    if(j<0||j>=a.length) return;
    [a[i],a[j]]=[a[j],a[i]]; setDays(a); setAttS(null);
  };
  const evalAtt  = () => { let s=0; for(let i=0;i<DAYS_ORDER.length;i++){if(days[i]===DAYS_ORDER[i])s++;else break;} setAttS(Math.min(s,5)); };
  const evalCalc = () => { let s=0; calcA.forEach((a,i)=>{if(parseInt(a)===CALC_ANS[i])s++;}); setCalcS(s); };
  const evalRec  = () => { let s=0; recW.forEach(w=>{if(REG_WORDS.includes(w.trim()))s++;}); setRecS(s); };
  const setCmd   = (i, v) => { const c=[...langS.commands]; c[i]=v; setLangS(s=>({...s,commands:c})); };

  const handleFinish = () => {
    setDone(true);
    if (onComplete) {
      onComplete({
        type: 'TMSE',
        totalScore: total,
        maxScore: 30,
        impaired,
        breakdown: {
          orientation:  oriTotal,
          registration: regS ?? 0,
          attention:    attS ?? 0,
          calculation:  calcS ?? 0,
          language:     langTotal,
          recall:       recS ?? 0,
        },
      });
    }
  };

  /* ── Result ── */
  if (done) {
    const sections=[
      {l:'Orientation',  s:oriTotal,   m:6},
      {l:'Registration', s:regS??0,    m:3},
      {l:'Attention',    s:attS??0,    m:5},
      {l:'Calculation',  s:calcS??0,   m:3},
      {l:'Language',     s:langTotal,  m:10},
      {l:'Recall',       s:recS??0,    m:3},
    ];
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <div style={{ position:'sticky',top:0,zIndex:50,background:'rgba(240,250,248,0.9)',backdropFilter:'blur(18px)',borderBottom:'1px solid var(--mint-border)',padding:'0 32px',height:60,display:'flex',alignItems:'center',gap:10 }}>
          <Cross s={14}/><span style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>TMSE — ผลการประเมิน</span>
          {patient && (
            <span style={{ fontSize:12,color:'var(--mint-blue)',fontWeight:600,background:'var(--mint-blue-xl)',padding:'2px 10px',borderRadius:20,border:'1px solid var(--mint-border)',marginLeft:4 }}>
              {patient.name} · {patient.age} ปี
            </span>
          )}
        </div>
        <div style={{ flex:1,maxWidth:520,margin:'0 auto',width:'100%',padding:'40px 20px' }}>

          {/* patient info */}
          {patient && (
            <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:'var(--mint-blue-xl)',border:'1px solid var(--mint-border)',borderRadius:14,marginBottom:20 }}>
              <span style={{ fontSize:18 }}>👤</span>
              <div>
                <p style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>{patient.name}</p>
                <p style={{ fontSize:12,color:'var(--mint-muted)' }}>อายุ {patient.age} ปี</p>
              </div>
              <div style={{ marginLeft:'auto',fontSize:11,color:'var(--mint-blue)',fontWeight:700,background:'white',padding:'4px 10px',borderRadius:20,border:'1px solid var(--mint-border)' }}>
                ✅ บันทึกแล้ว
              </div>
            </div>
          )}

          {/* score ring */}
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
                <span style={{ fontSize:13,color:'var(--mint-text2)',width:110,flexShrink:0 }}>{l}</span>
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
      <div style={{ position:'sticky',top:0,zIndex:50,background:'rgba(240,250,248,0.9)',backdropFilter:'blur(18px)',borderBottom:'1px solid var(--mint-border)',padding:'0 32px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <button onClick={onBack} style={{ background:'none',border:'none',color:'var(--mint-muted)',cursor:'pointer',fontSize:13,fontWeight:600 }}>← กลับ</button>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <Cross s={14}/>
          <span style={{ fontSize:14,fontWeight:700,color:'var(--mint-text)' }}>TMSE</span>
          {patient && (
            <span style={{ fontSize:12,color:'var(--mint-blue)',fontWeight:600,background:'var(--mint-blue-xl)',padding:'2px 10px',borderRadius:20,border:'1px solid var(--mint-border)' }}>
              {patient.name} · {patient.age} ปี
            </span>
          )}
        </div>
        <div style={{ fontSize:12,fontWeight:700,color:'var(--mint-primary)',background:'var(--mint-primary-xl)',border:'1px solid var(--mint-border)',borderRadius:20,padding:'3px 12px' }}>
          {total}/30
        </div>
      </div>

      <div style={{ flex:1,maxWidth:600,margin:'0 auto',width:'100%',padding:'32px 20px',display:'flex',flexDirection:'column',gap:14 }}>

        {/* 1. Orientation */}
        <Section num="1" title="การรับรู้สภาพแวดล้อม (Orientation)" max={6} score={oriTotal}>
          {ORI_Q.map((q,i) => <SubQ key={i} label={q} val={oriS[i]} onChange={v=>{const a=[...oriS];a[i]=v;setOriS(a);}} />)}
        </Section>

        {/* 2. Registration */}
        <Section num="2" title="การลงทะเบียนคำศัพท์ (Registration)" max={3} score={regS??0}>
          <div style={{ background:'var(--mint-primary-xl)',border:'1px solid var(--mint-border)',borderRadius:14,padding:16,marginBottom:14 }}>
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
              <button key={n} onClick={()=>setRegS(n)} style={{ flex:1,padding:'11px',borderRadius:10,fontSize:14,fontWeight:700,border:'1.5px solid',cursor:'pointer',transition:'all 0.18s',
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
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:4 }}>เรียงวันถอยหลัง เริ่มจาก <strong>อาทิตย์</strong></p>
          <p style={{ fontSize:11,color:'var(--mint-muted)',marginBottom:12 }}>กด ↑ ↓ เพื่อจัดเรียง</p>
          <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:12 }}>
            {days.map((day,i)=>(
              <div key={day} style={{ display:'flex',alignItems:'center',gap:8,background:'var(--mint-surface2)',border:'1px solid var(--mint-border2)',borderRadius:10,padding:'8px 12px' }}>
                <span style={{ fontSize:11,color:'var(--mint-muted)',width:18 }}>{i+1}.</span>
                <span style={{ flex:1,fontSize:14,fontWeight:600,color:'var(--mint-text)' }}>{day}</span>
                <button onClick={()=>moveDay(i,-1)} disabled={i===0} style={{ background:'none',border:'none',color:i===0?'var(--mint-border)':'var(--mint-muted)',cursor:i===0?'default':'pointer',fontSize:16,padding:'0 4px' }}>↑</button>
                <button onClick={()=>moveDay(i,1)} disabled={i===days.length-1} style={{ background:'none',border:'none',color:i===days.length-1?'var(--mint-border)':'var(--mint-muted)',cursor:i===days.length-1?'default':'pointer',fontSize:16,padding:'0 4px' }}>↓</button>
              </div>
            ))}
          </div>
          <ActionBtn onClick={evalAtt} variant="ghost">ตรวจคำตอบ</ActionBtn>
          {attS!==null && (
            <p style={{ textAlign:'center',marginTop:8,fontSize:13,fontWeight:700,color:attS>=4?'var(--mint-primary)':'var(--mint-warn)' }}>
              ถูกต้องต่อเนื่อง {attS} วัน (max 5)
            </p>
          )}
        </Section>

        {/* 4. Calculation */}
        <Section num="4" title="การคิดคำนวณ (Calculation)" max={3} score={calcS??0}>
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:14 }}>คิดเลข 100 − 7 ไปเรื่อยๆ 3 ครั้ง</p>
          <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:14 }}>
            <span style={{ fontSize:15,fontWeight:700,color:'var(--mint-text)' }}>100</span>
            {calcA.map((v,i)=>(
              <React.Fragment key={i}>
                <span style={{ color:'var(--mint-muted)',fontSize:16 }}>→</span>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
                  <input type="number" value={v} placeholder="?" onChange={e=>{const a=[...calcA];a[i]=e.target.value;setCalcA(a);setCalcS(null);}}
                    style={{ width:70,padding:'10px 8px',background:'var(--mint-surface2)',border:'1.5px solid var(--mint-border)',borderRadius:10,fontSize:14,fontWeight:700,color:'var(--mint-text)',outline:'none',textAlign:'center',boxSizing:'border-box'}}
                    onFocus={e=>e.target.style.borderColor='var(--mint-primary)'}
                    onBlur={e=>e.target.style.borderColor='var(--mint-border)'}
                  />
                  {calcS!==null && <span style={{ fontSize:11,fontWeight:700,color:parseInt(v)===CALC_ANS[i]?'var(--mint-success)':'var(--mint-danger)' }}>{parseInt(v)===CALC_ANS[i]?'✓':`✗(${CALC_ANS[i]})`}</span>}
                </div>
              </React.Fragment>
            ))}
          </div>
          <ActionBtn onClick={evalCalc} variant="ghost">ตรวจคำตอบ</ActionBtn>
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
                <svg width="120" height="100" viewBox="0 0 120 100" style={{ border:'1px solid var(--mint-border)',borderRadius:12,background:'white' }}>
                  <polygon points="60,10 110,50 10,50" fill="none" stroke="var(--mint-text2)" strokeWidth="2.5" strokeLinejoin="round"/>
                  <rect x="25" y="50" width="70" height="40" fill="none" stroke="var(--mint-text2)" strokeWidth="2.5"/>
                </svg>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                {[0,1,2].map(n=>(
                  <button key={n} onClick={()=>setLangS(s=>({...s,copy:n}))} style={{ flex:1,padding:'10px',borderRadius:10,fontSize:13,fontWeight:700,border:'1.5px solid',cursor:'pointer',transition:'all 0.18s',
                    background:langS.copy===n?'var(--mint-primary-xl)':'var(--mint-surface2)',
                    borderColor:langS.copy===n?'var(--mint-primary)':'var(--mint-border)',
                    color:langS.copy===n?'var(--mint-primary)':'var(--mint-muted)',
                  }}>
                    {n} คะแนน
                  </button>
                ))}
              </div>
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
        <Section num="6" title="การระลึก (Recall)" max={3} score={recS??0}>
          <p style={{ fontSize:13,color:'var(--mint-text2)',marginBottom:12 }}>ให้บอกสิ่งของ 3 อย่างที่จำได้จากตอนแรก</p>
          <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:12 }}>
            {recW.map((w,i)=>(
              <FocusInput key={i} value={w} placeholder={`คำที่ ${i+1}`} style={{ textAlign:'center' }}
                onChange={e=>{const a=[...recW];a[i]=e.target.value;setRecW(a);setRecS(null);}} />
            ))}
          </div>
          <ActionBtn onClick={evalRec} variant="primary">ตรวจคำตอบ</ActionBtn>
          {recS!==null && (
            <div style={{ display:'flex',gap:8,marginTop:10 }}>
              {REG_WORDS.map(word=>{
                const ok=recW.some(w=>w.trim()===word);
                return (
                  <div key={word} style={{ flex:1,textAlign:'center',padding:'8px',borderRadius:10,fontSize:12,fontWeight:700,background:ok?'var(--mint-primary-xl)':'#fff1f1',border:`1px solid ${ok?'var(--mint-primary)':'#fca5a5'}`,color:ok?'var(--mint-primary)':'#ef4444' }}>
                    {ok?'✓':'✗'} {word}
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Submit */}
        <div style={{ background:'white',border:'1.5px solid var(--mint-border)',borderRadius:20,padding:'22px',boxShadow:'var(--shadow-md)' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
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