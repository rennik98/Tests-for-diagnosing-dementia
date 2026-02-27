import React, { useState, useRef, useCallback } from 'react';

const CORRECT_WORDS = ['หลานสาว', 'สวรรค์', 'ภูเขา'];
const TARGET_HOUR   = 330;
const TARGET_MIN    = 60;
const TOLERANCE     = 25;
const CLOCK_NUMS    = [12,1,2,3,4,5,6,7,8,9,10,11];

const norm  = a => ((a % 360) + 360) % 360;
const close = (a, b) => { const d = Math.abs(norm(a) - norm(b)); return d <= TOLERANCE || d >= 360 - TOLERANCE; };

/* ── shared ui ── */
const Cross = ({ s = 14, c = 'var(--mint-primary)' }) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill={c}>
    <rect x="7.5" y="1"   width="5" height="18" rx="1.4"/>
    <rect x="1"   y="7.5" width="18" height="5" rx="1.4"/>
  </svg>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'white',
    border: '1.5px solid var(--mint-border)',
    borderRadius: 22,
    padding: '30px 28px',
    boxShadow: 'var(--shadow-md)',
    ...style,
  }}>
    {children}
  </div>
);

const StepBar = ({ step }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
    {[1,2,3].map((n, i) => (
      <React.Fragment key={n}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
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

const YN = ({ val, onChange, yL = 'ถูก', nL = 'ผิด' }) => (
  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
    {[[1, yL, 'var(--mint-primary)', 'var(--mint-primary-xl)', 'var(--mint-primary)'],
      [0, nL, '#ef4444', '#fff1f1', '#fca5a5']].map(([v, label, col, bg, border]) => (
      <button key={v} onClick={() => onChange(v)} style={{
        flex: 1, padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 700,
        border: `1.5px solid ${val === v ? border : 'var(--mint-border)'}`,
        background: val === v ? bg : 'var(--mint-surface2)',
        color: val === v ? col : 'var(--mint-muted)',
        cursor: 'pointer', transition: 'all 0.18s',
      }}>
        {val === v ? (v===1?'✓ ':'✗ ') : ''}{label}
      </button>
    ))}
  </div>
);

const SectionHead = ({ n, title, color = 'var(--mint-primary)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <div style={{
      width: 30, height: 30, borderRadius: 9,
      background: color === 'var(--mint-primary)' ? 'var(--mint-primary-xl)' : 'var(--mint-blue-xl)',
      border: `1.5px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 800, color,
    }}>
      {n}
    </div>
    <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--mint-text)' }}>{title}</h2>
  </div>
);

/* ── main ── */
export default function MiniCogQuiz({ onBack }) {
  const [step, setStep]           = useState(1);
  const [clockScore, setCS]       = useState(null);
  const [words, setWords]         = useState(['','','']);
  const [result, setResult]       = useState(null);
  const [hourA, setHourA]         = useState(0);
  const [minA,  setMinA]          = useState(0);
  const [drag,  setDrag]          = useState(null);
  const clockRef = useRef(null);

  const getAngle = useCallback(e => {
    if (!clockRef.current) return 0;
    const r = clockRef.current.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return norm(Math.atan2(y-cy, x-cx)*(180/Math.PI)+90);
  }, []);

  const onMove = useCallback(e => {
    if (!drag) return;
    const a = getAngle(e);
    drag === 'hour' ? setHourA(a) : setMinA(a);
  }, [drag, getAngle]);

  const evalClock = () => {
    const sc = (close(hourA, TARGET_HOUR) && close(minA, TARGET_MIN)) ? 2 : 0;
    setCS(sc); setStep(3);
  };

  const evalRecall = () => {
    const rc = words.filter(w => CORRECT_WORDS.includes(w.trim())).length;
    const total = (clockScore??0) + rc;
    setResult({ clockScore: clockScore??0, recallScore: rc, total, impaired: total <= 3 });
    setStep(4);
  };

  const reset = () => { setStep(1); setWords(['','','']); setCS(null); setResult(null); setHourA(0); setMinA(0); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* topbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(240,250,248,0.9)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--mint-border)',
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--mint-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
          ← กลับ
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Cross s={14} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--mint-text)' }}>Mini-Cog™</span>
          <span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>แบบประเมินภาวะการรู้คิด</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--mint-muted)', fontWeight: 600 }}>ขั้นตอน {Math.min(step,3)}/3</div>
      </div>

      <div style={{ flex: 1, maxWidth: 540, margin: '0 auto', width: '100%', padding: '40px 20px' }}>
        <StepBar step={step} />

        {/* ── Step 1 ── */}
        {step === 1 && (
          <Card className="scale-in">
            <SectionHead n="1" title="การลงทะเบียนคำศัพท์" />
            <div style={{ background: 'var(--mint-primary-xl)', border: '1px solid var(--mint-border)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--mint-text2)', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.75, marginBottom: 16 }}>
                "ให้ตั้งใจฟังดีๆ เดี๋ยวจะบอกคำ 3 คำ เมื่อพูดจบแล้วให้พูดตามและจำไว้ เดี๋ยวจะกลับมาถามซ้ำ"
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {CORRECT_WORDS.map(w => (
                  <div key={w} style={{ background: 'white', border: '1.5px solid var(--mint-border)', borderRadius: 12, padding: '14px 8px', textAlign: 'center', fontWeight: 800, fontSize: 15, color: 'var(--mint-primary)', boxShadow: 'var(--shadow-sm)' }}>
                    {w}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,var(--mint-primary),var(--mint-primary-l))', color: 'white', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px rgba(14,159,142,0.3)' }}>
              จำคำศัพท์ได้แล้ว →
            </button>
          </Card>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <Card className="scale-in">
            <SectionHead n="2" title="การวาดรูปนาฬิกา" color="var(--mint-blue)" />
            <p style={{ fontSize: 13, color: 'var(--mint-text2)', marginBottom: 24, paddingLeft: 40 }}>
              ลากเข็มไปที่เวลา <strong style={{ color: 'var(--mint-blue)' }}>11:10 น.</strong>
              <br /><span style={{ fontSize: 11, color: 'var(--mint-muted)' }}>🔵 น้ำเงิน = ชั่วโมง &nbsp;|&nbsp; 🟣 ม่วง = นาที</span>
            </p>

            {/* clock */}
            <div
              ref={clockRef}
              onMouseMove={onMove} onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}
              onTouchMove={onMove} onTouchEnd={() => setDrag(null)}
              style={{ position: 'relative', width: 260, height: 260, margin: '0 auto 24px', userSelect: 'none', touchAction: 'none' }}
            >
              {/* face */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(145deg,#f8fffe,white)', border: '3px solid var(--mint-border)', boxShadow: '0 4px 24px rgba(14,159,142,0.12), inset 0 1px 4px rgba(255,255,255,0.8)' }} />

              {/* ticks */}
              {[...Array(60)].map((_,i) => {
                const ang = (i*6-90)*(Math.PI/180), maj = i%5===0;
                const r1 = maj?91:96, r2=103;
                return (
                  <svg key={i} style={{ position:'absolute',inset:0,pointerEvents:'none' }} width="260" height="260">
                    <line x1={130+r1*Math.cos(ang)} y1={130+r1*Math.sin(ang)} x2={130+r2*Math.cos(ang)} y2={130+r2*Math.sin(ang)}
                      stroke={maj?'var(--mint-text2)':'var(--mint-border)'} strokeWidth={maj?2:1} />
                  </svg>
                );
              })}

              {/* numbers */}
              {CLOCK_NUMS.map((num,i) => {
                const ang = (i*30-90)*(Math.PI/180), r=108;
                return (
                  <span key={num} style={{ position:'absolute', left:130+r*Math.cos(ang), top:130+r*Math.sin(ang), transform:'translate(-50%,-50%)', fontSize:11, fontWeight:700, color:'var(--mint-text2)', pointerEvents:'none' }}>
                    {num}
                  </span>
                );
              })}

              {/* hour hand */}
              <div onMouseDown={() => setDrag('hour')} onTouchStart={() => setDrag('hour')}
                style={{ position:'absolute', left:130, top:130, width:6, height:72, marginLeft:-3, marginTop:-72, transformOrigin:'bottom center', transform:`rotate(${hourA}deg)`, cursor:'grab' }}>
                <div style={{ width:'100%', height:'100%', background:'linear-gradient(to top,#0e9f8e,#34d9c5)', borderRadius:4, boxShadow:'0 2px 6px rgba(14,159,142,0.35)' }} />
                <div style={{ position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)', width:22, height:22, background:'var(--mint-primary)', borderRadius:'50%', border:'3px solid white', boxShadow:'0 2px 8px rgba(14,159,142,0.4)' }} />
              </div>

              {/* minute hand */}
              <div onMouseDown={() => setDrag('min')} onTouchStart={() => setDrag('min')}
                style={{ position:'absolute', left:130, top:130, width:4, height:90, marginLeft:-2, marginTop:-90, transformOrigin:'bottom center', transform:`rotate(${minA}deg)`, cursor:'grab' }}>
                <div style={{ width:'100%', height:'100%', background:'linear-gradient(to top,#3b82f6,#93c5fd)', borderRadius:4, boxShadow:'0 2px 6px rgba(59,130,246,0.35)' }} />
                <div style={{ position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)', width:22, height:22, background:'var(--mint-blue)', borderRadius:'50%', border:'3px solid white', boxShadow:'0 2px 8px rgba(59,130,246,0.4)' }} />
              </div>

              {/* center */}
              <div style={{ position:'absolute', left:130, top:130, width:12, height:12, background:'var(--mint-text)', borderRadius:'50%', transform:'translate(-50%,-50%)', zIndex:10 }} />
            </div>

            {/* angle display */}
            <div style={{ display:'flex', justifyContent:'center', gap:20, marginBottom:20 }}>
              {[['🔵','ชั่วโมง',hourA,'var(--mint-primary)'],['🟣','นาที',minA,'var(--mint-blue)']].map(([em,lb,a,c]) => (
                <span key={lb} style={{ fontSize:12, color:'var(--mint-muted)', display:'flex', alignItems:'center', gap:4 }}>
                  {em} {lb}: <strong style={{ color:c }}>{Math.round(norm(a))}°</strong>
                </span>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:8 }}>
              <button onClick={evalClock} style={{ padding:13, background:'var(--mint-text)', color:'white', border:'none', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                ตรวจอัตโนมัติ
              </button>
              <button onClick={() => { setCS(2); setStep(3); }} style={{ padding:13, background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer' }}>
                ✓ ถูกต้อง (2 คะแนน)
              </button>
            </div>
            <button onClick={() => { setCS(0); setStep(3); }} style={{ width:'100%', padding:10, background:'none', border:'none', color:'var(--mint-muted)', fontSize:12, cursor:'pointer' }}>
              ไม่ถูกต้อง (0 คะแนน) →
            </button>
          </Card>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <Card className="scale-in">
            <SectionHead n="3" title="การทดสอบความจำ" />
            <p style={{ fontSize:13, color:'var(--mint-text2)', marginBottom:24, paddingLeft:40 }}>พิมพ์คำศัพท์ 3 คำที่จำได้จากตอนแรก</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {words.map((w,i) => (
                <input key={i} type="text" placeholder={`คำที่ ${i+1}`} value={w}
                  onChange={e => { const a=[...words]; a[i]=e.target.value; setWords(a); }}
                  style={{ width:'100%', padding:'13px 16px', background:'var(--mint-surface2)', border:'1.5px solid var(--mint-border)', borderRadius:12, fontSize:15, fontWeight:700, color:'var(--mint-text)', outline:'none', textAlign:'center', boxSizing:'border-box', transition:'border-color 0.18s' }}
                  onFocus={e => e.target.style.borderColor='var(--mint-primary)'}
                  onBlur={e  => e.target.style.borderColor='var(--mint-border)'}
                />
              ))}
            </div>
            <button onClick={evalRecall} style={{ width:'100%', padding:14, background:'linear-gradient(135deg,var(--mint-primary),var(--mint-primary-l))', color:'white', border:'none', borderRadius:13, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 18px rgba(14,159,142,0.3)' }}>
              ส่งคำตอบและดูผล →
            </button>
          </Card>
        )}

        {/* ── Step 4 Result ── */}
        {step === 4 && result && (
          <Card className="scale-in">
            {/* circle */}
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ position:'relative', width:110, height:110, margin:'0 auto 10px' }}>
                <svg width="110" height="110" style={{ position:'absolute',inset:0 }}>
                  <circle cx="55" cy="55" r="48" fill="none" stroke="var(--mint-border2)" strokeWidth="7"/>
                  <circle cx="55" cy="55" r="48" fill="none"
                    stroke={result.impaired ? 'var(--mint-warn)' : 'var(--mint-primary)'} strokeWidth="7"
                    strokeDasharray={`${(result.total/5)*301.6} 301.6`}
                    strokeLinecap="round" transform="rotate(-90 55 55)"
                    style={{ transition:'stroke-dasharray 0.9s ease' }}
                  />
                </svg>
                <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
                  <span style={{ fontSize:30, fontWeight:800, color: result.impaired?'var(--mint-warn)':'var(--mint-primary)' }}>{result.total}</span>
                  <span style={{ fontSize:11, color:'var(--mint-muted)' }}>/ 5</span>
                </div>
              </div>
              <p style={{ fontSize:11, color:'var(--mint-muted)', letterSpacing:'0.08em', textTransform:'uppercase' }}>คะแนนรวม</p>
            </div>

            {/* status */}
            <div style={{ borderRadius:14, padding:'14px 18px', marginBottom:20, background: result.impaired?'#fff7ed':'#f0fdf9', border:`1.5px solid ${result.impaired?'#fcd34d':'#6ee7d5'}` }}>
              <p style={{ fontWeight:700, textAlign:'center', fontSize:14, color: result.impaired?'#92400e':'#065f46' }}>
                {result.impaired ? '⚠️ มีภาวะการรู้คิดบกพร่อง (Cognitive Impairment)' : '✅ ผลการประเมินเบื้องต้นอยู่ในเกณฑ์ปกติ'}
              </p>
            </div>

            {/* breakdown */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[['Clock Drawing',result.clockScore,2,'var(--mint-primary)'],['Word Recall',result.recallScore,3,'var(--mint-blue)']].map(([lb,sc,mx,c]) => (
                <div key={lb} style={{ background:'var(--mint-surface2)', border:'1px solid var(--mint-border2)', borderRadius:12, padding:'14px', textAlign:'center' }}>
                  <p style={{ fontSize:24, fontWeight:800, color:c }}>{sc}<span style={{ fontSize:13, fontWeight:400, color:'var(--mint-muted)' }}>/{mx}</span></p>
                  <p style={{ fontSize:11, color:'var(--mint-muted)', marginTop:3 }}>{lb}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize:11, color:'var(--mint-muted)', textAlign:'center', marginBottom:18 }}>* ผลนี้เป็นการประเมินเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</p>

            <button onClick={reset} style={{ width:'100%', padding:13, background:'var(--mint-surface2)', border:'1.5px solid var(--mint-border)', color:'var(--mint-text)', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:8 }}>
              ทำแบบทดสอบใหม่
            </button>
            <button onClick={onBack} style={{ width:'100%', padding:9, background:'none', border:'none', color:'var(--mint-muted)', fontSize:12, cursor:'pointer' }}>
              ← กลับหน้าหลัก
            </button>
          </Card>
        )}
      </div>
      <p style={{ textAlign:'center', fontSize:11, color:'var(--mint-muted)', padding:'14px', background:'white', borderTop:'1px solid var(--mint-border2)' }}>Mini-Cog™ © S. Borson</p>
    </div>
  );
}