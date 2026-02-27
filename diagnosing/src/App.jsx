import React, { useState } from 'react';
import MiniCogQuiz from './MiniCogQuiz';
import TMSEQuiz from './TMSEQuiz';


const MedCross = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <rect x="9" y="2" width="6" height="20" rx="1.5"/>
    <rect x="2" y="9" width="20" height="6" rx="1.5"/>
  </svg>
);

const StatBadge = ({ label, value, color = '#2e7df7' }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12 }}>
    <span style={{ fontSize:18, fontWeight:800, color }}>{value}</span>
    <span style={{ fontSize:11, marginTop:2, color:'#8098bc' }}>{label}</span>
  </div>
);

const TestCard = ({ icon, title, subtitle, badge, badgeColor, onClick, disabled }) => (
  <div
    onClick={disabled ? undefined : onClick}
    style={{
      background:'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      border:`1px solid ${disabled ? 'rgba(255,255,255,0.06)' : `${badgeColor}44`}`,
      cursor: disabled ? 'default' : 'pointer',
      transition:'all 0.25s ease',
      opacity: disabled ? 0.5 : 1,
      borderRadius:20,
      padding:'28px',
      display:'flex',
      flexDirection:'column',
      gap:16,
      position:'relative',
      overflow:'hidden',
    }}
    onMouseOver={e => { if (!disabled) { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 20px 60px rgba(0,0,0,0.4)`; }}}
    onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
  >
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
      <div style={{ width:48, height:48, background:`${badgeColor}18`, border:`1px solid ${badgeColor}44`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
        {icon}
      </div>
      <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:badgeColor, background:`${badgeColor}15`, border:`1px solid ${badgeColor}33`, borderRadius:20, padding:'3px 10px' }}>
        {badge}
      </span>
    </div>
    <div>
      <h3 style={{ fontSize:19, fontWeight:700, color:'#f0f4fa', marginBottom:6 }}>{title}</h3>
      <p style={{ fontSize:13, color:'#8098bc', lineHeight:1.6 }}>{subtitle}</p>
    </div>
    {!disabled && (
      <div style={{ fontSize:12, color:badgeColor, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
        เริ่มทดสอบ <span>→</span>
      </div>
    )}
    {disabled && <div style={{ fontSize:12, color:'#8098bc' }}>เร็วๆ นี้</div>}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showQuiz, setShowQuiz] = useState(null);

  if (showQuiz === 'minicog') return <MiniCogQuiz onBack={() => setShowQuiz(null)} />;
  if (showQuiz === 'tmse') return <TMSEQuiz onBack={() => setShowQuiz(null)} />;

  return (
    <div style={{ position:'relative', zIndex:1, minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:"'DM Sans','Sarabun',sans-serif" }}>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'rgba(10,22,40,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 40px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg,#2e7df7,#1a56cc)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <MedCross size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'#f0f4fa', letterSpacing:'0.04em' }}>
              BRAIN<span style={{ color:'#2e7df7' }}>CHECK</span>
            </div>
            <div style={{ fontSize:9, color:'#8098bc', letterSpacing:'0.12em' }}>COGNITIVE SCREENING SYSTEM</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.04)', borderRadius:12, padding:4, border:'1px solid rgba(255,255,255,0.07)' }}>
          {[['home','หน้าหลัก'],['about','เกณฑ์คะแนน']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ padding:'6px 16px', borderRadius:8, fontSize:13, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.2s', background: activeTab===key ? '#2e7df7' : 'transparent', color: activeTab===key ? 'white' : '#8098bc' }}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex:1, maxWidth:1160, margin:'0 auto', width:'100%', padding:'64px 40px' }}>
        {activeTab === 'home' ? (
          <div>
            {/* Hero grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center', marginBottom:72 }}>
              {/* Left */}
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(46,125,247,0.12)', border:'1px solid rgba(46,125,247,0.3)', borderRadius:20, padding:'5px 14px', marginBottom:24 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'#2e7df7' }} />
                  <span style={{ fontSize:11, color:'#5b9bff', fontWeight:700, letterSpacing:'0.08em' }}>VALIDATED CLINICAL TOOLS</span>
                </div>

                <h1 style={{ fontSize:50, fontWeight:800, lineHeight:1.1, color:'#f0f4fa', marginBottom:18, fontFamily:"'DM Serif Display','Sarabun',serif" }}>
                  ประเมิน<br/>
                  <span style={{ background:'linear-gradient(135deg,#2e7df7 0%,#5b9bff 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>สุขภาพสมอง</span><br/>
                  ด้วยมาตรฐานสากล
                </h1>

                <p style={{ fontSize:15, color:'#8098bc', lineHeight:1.75, marginBottom:32, maxWidth:420 }}>
                  คัดกรองภาวะสมองเสื่อมเบื้องต้นด้วยแบบทดสอบ Mini-Cog และ TMSE ที่ผ่านการรับรองทางการแพทย์
                </p>

                <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
                  <button onClick={() => setShowQuiz('minicog')} style={{ padding:'13px 26px', background:'linear-gradient(135deg,#2e7df7,#1a56cc)', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 8px 32px rgba(46,125,247,0.35)', transition:'all 0.2s' }}
                    onMouseOver={e=>e.target.style.transform='translateY(-2px)'}
                    onMouseOut={e=>e.target.style.transform='translateY(0)'}>
                    เริ่ม Mini-Cog →
                  </button>
                  <button onClick={() => setShowQuiz('tmse')} style={{ padding:'13px 26px', background:'rgba(13,148,136,0.12)', color:'#14b8a6', border:'1px solid rgba(13,148,136,0.3)', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}
                    onMouseOver={e=>{e.target.style.background='rgba(13,148,136,0.22)'}}
                    onMouseOut={e=>{e.target.style.background='rgba(13,148,136,0.12)'}}>
                    เริ่ม TMSE →
                  </button>
                </div>

                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <StatBadge label="ความแม่นยำ" value="76–99%" color="#2e7df7" />
                  <StatBadge label="คะแนนสูงสุด TMSE" value="30 pts" color="#14b8a6" />
                  <StatBadge label="ระยะเวลา" value="3–15 min" color="#f59e0b" />
                </div>
              </div>

              {/* Right: test cards */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <TestCard icon="⚡" title="Mini-Cog™" subtitle="การทดสอบความจำ 3 คำ + การวาดรูปนาฬิกา เหมาะสำหรับการคัดกรองเบื้องต้นอย่างรวดเร็ว" badge="5 คะแนน" badgeColor="#2e7df7" onClick={() => setShowQuiz('minicog')} />
                <TestCard icon="🧠" title="TMSE" subtitle="Thai Mental State Examination ครอบคลุม 6 ด้านของการรับรู้ทางปัญญา" badge="30 คะแนน" badgeColor="#14b8a6" onClick={() => setShowQuiz('tmse')} />
              </div>
            </div>

            {/* Info strip */}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:48, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:32 }}>
              {[
                { icon:'🔬', title:'Evidence-Based', desc:'ทั้ง Mini-Cog และ TMSE ผ่านการรับรองและตีพิมพ์ในวารสารการแพทย์ระดับสากล' },
                { icon:'🛡️', title:'ความเป็นส่วนตัว', desc:'ไม่มีการบันทึกหรือส่งข้อมูลใดๆ ออกจากอุปกรณ์ของคุณ ปลอดภัย 100%' },
                { icon:'📊', title:'ผลทันที', desc:'รับผลการประเมินพร้อมคำแนะนำเบื้องต้นทันทีหลังทำแบบทดสอบ' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display:'flex', gap:14 }}>
                  <div style={{ fontSize:20, flexShrink:0, marginTop:2 }}>{icon}</div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#f0f4fa', marginBottom:6 }}>{title}</p>
                    <p style={{ fontSize:13, color:'#8098bc', lineHeight:1.65 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        ) : (
          <div style={{ maxWidth:700, margin:'0 auto', display:'flex', flexDirection:'column', gap:24 }}>
            <div style={{ marginBottom:8 }}>
              <h2 style={{ fontSize:28, fontWeight:800, color:'#f0f4fa' }}>เกณฑ์การประเมิน</h2>
              <p style={{ fontSize:14, color:'#8098bc', marginTop:4 }}>มาตรฐานการตีความผลการทดสอบสมรรถภาพสมอง</p>
            </div>

            {/* MiniCog criteria */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(46,125,247,0.2)', borderRadius:20, padding:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:4, height:24, borderRadius:2, background:'#2e7df7' }} />
                <h3 style={{ fontSize:18, fontWeight:700, color:'#2e7df7' }}>Mini-Cog™</h3>
              </div>
              <p style={{ fontSize:15, color:'#c8d8f0', lineHeight:1.7, marginBottom:20 }}>
                คะแนนเต็ม <strong style={{ color:'#f0f4fa' }}>5 คะแนน</strong> — คะแนน ≤ 3 ถือว่ามีภาวะ Cognitive Impairment
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {[['Word Recall','3 คะแนน','#2e7df7'],['Clock Drawing','2 คะแนน','#5b9bff']].map(([n,v,c]) => (
                  <div key={n} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${c}33`, borderRadius:12, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:13, color:'#c8d8f0' }}>{n}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:c }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'10px 14px', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:10 }}>
                <p style={{ fontSize:13, color:'#fca5a5' }}>⚠️ คะแนน ≤ 3 → มีแนวโน้มภาวะ Cognitive Impairment</p>
              </div>
            </div>

            {/* TMSE criteria */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(20,184,166,0.2)', borderRadius:20, padding:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:4, height:24, borderRadius:2, background:'#14b8a6' }} />
                <h3 style={{ fontSize:18, fontWeight:700, color:'#14b8a6' }}>TMSE — Thai Mental State Examination</h3>
              </div>
              <p style={{ fontSize:15, color:'#c8d8f0', lineHeight:1.7, marginBottom:20 }}>
                คะแนนเต็ม <strong style={{ color:'#f0f4fa' }}>30 คะแนน</strong> — คะแนน &lt; 24 ถือว่ามีภาวะ Cognitive Impairment
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                {[['Orientation','6 คะแนน'],['Registration','3 คะแนน'],['Attention','5 คะแนน'],['Calculation','3 คะแนน'],['Language','10 คะแนน'],['Recall','3 คะแนน']].map(([n,v]) => (
                  <div key={n} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(20,184,166,0.2)', borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:13, color:'#c8d8f0' }}>{n}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:'#14b8a6' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'10px 14px', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:10 }}>
                <p style={{ fontSize:13, color:'#fca5a5' }}>⚠️ คะแนน &lt; 24 → มีแนวโน้มภาวะ Cognitive Impairment</p>
              </div>
              <p style={{ fontSize:11, color:'#8098bc', marginTop:12 }}>ที่มา: กลุ่มฟื้นฟูสมรรถภาพสมอง สารศิริราช 45(6) มิถุนายน 2536</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'18px 40px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <MedCross size={13} color="#2e7df7" />
          <span style={{ fontSize:12, color:'#8098bc' }}>BrainCheck — เครื่องมือคัดกรองเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์</span>
        </div>
        <span style={{ fontSize:11, color:'#4a5568' }}>Mini-Cog™ © S. Borson</span>
      </footer>
    </div>
  );
}