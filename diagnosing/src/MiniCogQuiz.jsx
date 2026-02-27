import React, { useState, useRef, useCallback } from 'react';

const CORRECT_WORDS = ['หลานสาว', 'สวรรค์', 'ภูเขา'];
const TARGET_HOUR = 330;
const TARGET_MIN = 60;
const TOLERANCE = 25;

const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;
const anglesClose = (a, b, tol = TOLERANCE) => {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return diff <= tol || diff >= 360 - tol;
};
const CLOCK_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// ── Shared UI ────────────────────────────────────────────────────────────────

const MedCross = ({ size = 14, color = '#2e7df7' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="9" y="2" width="6" height="20" rx="1.5"/>
    <rect x="2" y="9" width="20" height="6" rx="1.5"/>
  </svg>
);

const Card = ({ children, style }) => (
  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:32, ...style }}>
    {children}
  </div>
);

const StepDot = ({ n, active, done }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
    <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, transition:'all 0.3s',
      background: done ? '#2e7df7' : active ? 'rgba(46,125,247,0.2)' : 'rgba(255,255,255,0.05)',
      border: active ? '2px solid #2e7df7' : done ? '2px solid #2e7df7' : '2px solid rgba(255,255,255,0.1)',
      color: done || active ? '#f0f4fa' : '#8098bc'
    }}>
      {done ? '✓' : n}
    </div>
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────

export default function MiniCogQuiz({ onBack }) {
  const [step, setStep] = useState(1);
  const [clockScore, setClockScore] = useState(null);
  const [userWords, setUserWords] = useState(['', '', '']);
  const [result, setResult] = useState(null);
  const [hourAngle, setHourAngle] = useState(0);
  const [minAngle, setMinAngle] = useState(0);
  const [dragging, setDragging] = useState(null);
  const clockRef = useRef(null);

  const getAngleFromEvent = useCallback((e) => {
    if (!clockRef.current) return 0;
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return normalizeAngle(Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    const angle = getAngleFromEvent(e);
    if (dragging === 'hour') setHourAngle(angle);
    else setMinAngle(angle);
  }, [dragging, getAngleFromEvent]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  const evaluateClock = () => {
    const score = (anglesClose(hourAngle, TARGET_HOUR) && anglesClose(minAngle, TARGET_MIN)) ? 2 : 0;
    setClockScore(score);
    setStep(3);
  };

  const checkRecall = () => {
    const correct = userWords.filter(w => CORRECT_WORDS.includes(w.trim())).length;
    const total = (clockScore ?? 0) + correct;
    setResult({ clockScore: clockScore ?? 0, recallScore: correct, total, impaired: total <= 3 });
    setStep(4);
  };

  const S = { fontFamily:"'DM Sans','Sarabun',sans-serif" };

  return (
    <div style={{ ...S, minHeight:'100vh', background:'transparent', position:'relative', zIndex:1, display:'flex', flexDirection:'column' }}>

      {/* Top bar */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(10,22,40,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 32px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'#8098bc', cursor:'pointer', fontSize:13, fontWeight:600 }}>
          ← กลับ
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <MedCross size={14} color="#2e7df7" />
          <span style={{ fontSize:14, fontWeight:700, color:'#f0f4fa' }}>Mini-Cog™</span>
          <span style={{ fontSize:11, color:'#8098bc' }}>แบบประเมินภาวะการรู้คิด</span>
        </div>
        <div style={{ fontSize:12, color:'#8098bc' }}>ขั้นตอน {Math.min(step,3)}/3</div>
      </div>

      <div style={{ flex:1, maxWidth:560, margin:'0 auto', width:'100%', padding:'40px 24px' }}>

        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:40 }}>
          {[1,2,3].map((n, i) => (
            <React.Fragment key={n}>
              <StepDot n={n} active={step === n} done={step > n} />
              {i < 2 && (
                <div style={{ flex:1, height:2, margin:'0 4px', background: step > n ? '#2e7df7' : 'rgba(255,255,255,0.08)', borderRadius:1, transition:'background 0.4s' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
              <div style={{ width:28, height:28, background:'rgba(46,125,247,0.15)', border:'1px solid rgba(46,125,247,0.3)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#2e7df7' }}>1</div>
              <h2 style={{ fontSize:17, fontWeight:700, color:'#f0f4fa' }}>การลงทะเบียนคำศัพท์</h2>
            </div>

            <div style={{ background:'rgba(46,125,247,0.08)', border:'1px solid rgba(46,125,247,0.18)', borderRadius:16, padding:20, marginBottom:24 }}>
              <p style={{ fontSize:13, color:'#8098bc', lineHeight:1.7, marginBottom:16, fontStyle:'italic', textAlign:'center' }}>
                "ให้ตั้งใจฟังดีๆ เดี๋ยวจะบอกคำ 3 คำ เมื่อพูดจบแล้วให้พูดตามและจำไว้ เดี๋ยวจะกลับมาถามซ้ำ"
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {CORRECT_WORDS.map(word => (
                  <div key={word} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(46,125,247,0.25)', borderRadius:12, padding:'14px 8px', textAlign:'center', fontWeight:800, fontSize:15, color:'#5b9bff' }}>
                    {word}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setStep(2)} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#2e7df7,#1a56cc)', color:'white', border:'none', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 8px 24px rgba(46,125,247,0.3)', transition:'all 0.2s' }}
              onMouseOver={e=>e.target.style.transform='translateY(-1px)'}
              onMouseOut={e=>e.target.style.transform='translateY(0)'}>
              จำคำศัพท์ได้แล้ว →
            </button>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div style={{ width:28, height:28, background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#a78bfa' }}>2</div>
              <h2 style={{ fontSize:17, fontWeight:700, color:'#f0f4fa' }}>การวาดรูปนาฬิกา</h2>
            </div>
            <p style={{ fontSize:13, color:'#8098bc', marginBottom:24, paddingLeft:38 }}>
              ลากเข็มนาฬิกาไปที่เวลา <strong style={{ color:'#a78bfa' }}>11:10 น.</strong>
              <br /><span style={{ fontSize:11 }}>🔵 เข็มน้ำเงิน = ชั่วโมง &nbsp;|&nbsp; 🟣 เข็มม่วง = นาที</span>
            </p>

            {/* Clock */}
            <div
              ref={clockRef}
              onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
              onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
              style={{ position:'relative', width:260, height:260, margin:'0 auto 24px', userSelect:'none', touchAction:'none' }}
            >
              {/* Face */}
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.07), rgba(255,255,255,0.02))', border:'3px solid rgba(255,255,255,0.15)', boxShadow:'0 0 40px rgba(46,125,247,0.12), inset 0 0 30px rgba(0,0,0,0.3)' }} />

              {/* Tick marks */}
              {[...Array(60)].map((_, i) => {
                const angle = (i * 6 - 90) * (Math.PI / 180);
                const isMajor = i % 5 === 0;
                const r1 = isMajor ? 92 : 97, r2 = 103;
                return (
                  <svg key={i} style={{ position:'absolute', inset:0, pointerEvents:'none' }} width="260" height="260">
                    <line x1={130+r1*Math.cos(angle)} y1={130+r1*Math.sin(angle)} x2={130+r2*Math.cos(angle)} y2={130+r2*Math.sin(angle)}
                      stroke={isMajor ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'} strokeWidth={isMajor?2:1} />
                  </svg>
                );
              })}

              {/* Numbers */}
              {CLOCK_NUMBERS.map((num, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const r = 110;
                return (
                  <span key={num} style={{ position:'absolute', left:130+r*Math.cos(angle), top:130+r*Math.sin(angle), transform:'translate(-50%,-50%)', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.7)', pointerEvents:'none' }}>
                    {num}
                  </span>
                );
              })}

              {/* Hour hand */}
              <div
                onMouseDown={() => setDragging('hour')} onTouchStart={() => setDragging('hour')}
                style={{ position:'absolute', left:130, top:130, width:6, height:72, marginLeft:-3, marginTop:-72, transformOrigin:'bottom center', transform:`rotate(${hourAngle}deg)`, cursor:'grab' }}
              >
                <div style={{ width:'100%', height:'100%', background:'linear-gradient(to top,#2e7df7,#5b9bff)', borderRadius:4 }} />
                <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', width:20, height:20, background:'#2e7df7', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', boxShadow:'0 0 10px rgba(46,125,247,0.5)' }} />
              </div>

              {/* Minute hand */}
              <div
                onMouseDown={() => setDragging('min')} onTouchStart={() => setDragging('min')}
                style={{ position:'absolute', left:130, top:130, width:4, height:90, marginLeft:-2, marginTop:-90, transformOrigin:'bottom center', transform:`rotate(${minAngle}deg)`, cursor:'grab' }}
              >
                <div style={{ width:'100%', height:'100%', background:'linear-gradient(to top,#7c3aed,#a78bfa)', borderRadius:4 }} />
                <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', width:20, height:20, background:'#7c3aed', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', boxShadow:'0 0 10px rgba(124,58,237,0.5)' }} />
              </div>

              {/* Center */}
              <div style={{ position:'absolute', left:130, top:130, width:12, height:12, background:'#f0f4fa', borderRadius:'50%', transform:'translate(-50%,-50%)', zIndex:10, boxShadow:'0 0 8px rgba(255,255,255,0.3)' }} />
            </div>

            {/* Angle display */}
            <div style={{ display:'flex', justifyContent:'center', gap:20, marginBottom:20 }}>
              {[['🔵','ชั่วโมง',hourAngle,'#2e7df7'],['🟣','นาที',minAngle,'#a78bfa']].map(([em,label,angle,color]) => (
                <div key={label} style={{ fontSize:12, color:'#8098bc', display:'flex', alignItems:'center', gap:4 }}>
                  <span>{em}</span>
                  <span>{label}:</span>
                  <span style={{ color, fontWeight:700 }}>{Math.round(normalizeAngle(angle))}°</span>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:8 }}>
              <button onClick={evaluateClock} style={{ padding:'13px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', color:'#f0f4fa', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                ตรวจอัตโนมัติ
              </button>
              <button onClick={() => { setClockScore(2); setStep(3); }} style={{ padding:'13px', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', color:'#4ade80', borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
                ถูกต้อง (2 คะแนน)
              </button>
            </div>
            <button onClick={() => { setClockScore(0); setStep(3); }} style={{ width:'100%', padding:'10px', background:'none', border:'none', color:'#8098bc', fontSize:12, cursor:'pointer', transition:'color 0.2s' }}>
              ไม่ถูกต้อง (0 คะแนน) →
            </button>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div style={{ width:28, height:28, background:'rgba(20,184,166,0.15)', border:'1px solid rgba(20,184,166,0.3)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#14b8a6' }}>3</div>
              <h2 style={{ fontSize:17, fontWeight:700, color:'#f0f4fa' }}>การทดสอบความจำ</h2>
            </div>
            <p style={{ fontSize:13, color:'#8098bc', marginBottom:24, paddingLeft:38 }}>พิมพ์คำศัพท์ 3 คำที่จำได้จากตอนแรก</p>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {userWords.map((w, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`คำที่ ${i + 1}`}
                  value={w}
                  onChange={e => { const a=[...userWords]; a[i]=e.target.value; setUserWords(a); }}
                  style={{ width:'100%', padding:'14px 18px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, fontSize:16, fontWeight:700, color:'#f0f4fa', outline:'none', textAlign:'center', transition:'border-color 0.2s', boxSizing:'border-box' }}
                  onFocus={e => e.target.style.borderColor='rgba(20,184,166,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                />
              ))}
            </div>

            <button onClick={checkRecall} style={{ width:'100%', padding:'14px', background:'linear-gradient(135deg,#0d9488,#14b8a6)', color:'white', border:'none', borderRadius:14, fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 8px 24px rgba(13,148,136,0.3)' }}>
              ส่งคำตอบและดูผล →
            </button>
          </Card>
        )}

        {/* Step 4 — Result */}
        {step === 4 && result && (
          <Card>
            {/* Score circle */}
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ position:'relative', width:100, height:100, margin:'0 auto 12px' }}>
                <svg width="100" height="100" style={{ position:'absolute', inset:0 }}>
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                  <circle cx="50" cy="50" r="44" fill="none"
                    stroke={result.impaired ? '#f59e0b' : '#14b8a6'} strokeWidth="6"
                    strokeDasharray={`${(result.total/5)*276.5} 276.5`}
                    strokeLinecap="round" transform="rotate(-90 50 50)"
                    style={{ transition:'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:28, fontWeight:800, color: result.impaired ? '#f59e0b' : '#14b8a6' }}>{result.total}</span>
                  <span style={{ fontSize:10, color:'#8098bc' }}>/ 5</span>
                </div>
              </div>
              <p style={{ fontSize:11, color:'#8098bc', letterSpacing:'0.1em', textTransform:'uppercase' }}>คะแนนรวม</p>
            </div>

            {/* Status */}
            <div style={{ borderRadius:14, padding:'16px 20px', marginBottom:20, background: result.impaired ? 'rgba(245,158,11,0.1)' : 'rgba(20,184,166,0.1)', border:`1px solid ${result.impaired ? 'rgba(245,158,11,0.3)' : 'rgba(20,184,166,0.3)'}` }}>
              <p style={{ fontWeight:700, textAlign:'center', fontSize:14, color: result.impaired ? '#fbbf24' : '#2dd4bf' }}>
                {result.impaired ? '⚠️ มีภาวะการรู้คิดบกพร่อง (Cognitive Impairment)' : '✅ ผลการประเมินเบื้องต้นอยู่ในเกณฑ์ปกติ'}
              </p>
            </div>

            {/* Breakdown */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[['Clock Drawing', result.clockScore, 2, '#5b9bff'], ['Word Recall', result.recallScore, 3, '#14b8a6']].map(([label, score, max, color]) => (
                <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px', textAlign:'center' }}>
                  <p style={{ fontSize:22, fontWeight:800, color }}>{score}<span style={{ fontSize:13, fontWeight:400, color:'#8098bc' }}>/{max}</span></p>
                  <p style={{ fontSize:11, color:'#8098bc', marginTop:4 }}>{label}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize:11, color:'#8098bc', textAlign:'center', marginBottom:20 }}>
              * ผลนี้เป็นการประเมินเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์
            </p>

            <button
              onClick={() => { setStep(1); setUserWords(['','','']); setClockScore(null); setResult(null); setHourAngle(0); setMinAngle(0); }}
              style={{ width:'100%', padding:'14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#f0f4fa', borderRadius:14, fontSize:14, fontWeight:700, cursor:'pointer' }}>
              ทำแบบทดสอบใหม่
            </button>
            <button onClick={onBack} style={{ width:'100%', padding:'10px', background:'none', border:'none', color:'#8098bc', fontSize:12, cursor:'pointer', marginTop:6 }}>
              ← กลับหน้าหลัก
            </button>
          </Card>
        )}
      </div>

      <p style={{ textAlign:'center', fontSize:11, color:'#4a5568', padding:'16px', position:'relative', zIndex:1 }}>Mini-Cog™ © S. Borson</p>
    </div>
  );
}