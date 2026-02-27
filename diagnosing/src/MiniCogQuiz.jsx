import React, { useState, useRef, useCallback } from 'react';

const CORRECT_WORDS = ['หลานสาว', 'สวรรค์', 'ภูเขา'];

// Target: 11:10
// Hour hand at 11 = 330°, Minute hand at 10 min = 60°
const TARGET_HOUR = 330;
const TARGET_MIN = 60;
const TOLERANCE = 25; // degrees

const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

const anglesClose = (a, b, tol = TOLERANCE) => {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return diff <= tol || diff >= 360 - tol;
};

// Clock face numbers positioned correctly
const CLOCK_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default function MiniCogQuiz({ onBack }) {
  const [step, setStep] = useState(1);
  const [clockScore, setClockScore] = useState(null);
  const [userWords, setUserWords] = useState(['', '', '']);
  const [result, setResult] = useState(null);

  // Clock state
  const [hourAngle, setHourAngle] = useState(0);
  const [minAngle, setMinAngle] = useState(0);
  const [dragging, setDragging] = useState(null); // 'hour' | 'min' | null
  const clockRef = useRef(null);

  const getAngleFromEvent = useCallback((e) => {
    if (!clockRef.current) return 0;
    const rect = clockRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI) + 90;
    return normalizeAngle(angle);
  }, []);

  const handleClockMouseMove = useCallback((e) => {
    if (!dragging) return;
    const angle = getAngleFromEvent(e);
    if (dragging === 'hour') setHourAngle(angle);
    else setMinAngle(angle);
  }, [dragging, getAngleFromEvent]);

  const handleClockMouseUp = useCallback(() => setDragging(null), []);

  const evaluateClock = () => {
    const hourCorrect = anglesClose(hourAngle, TARGET_HOUR);
    const minCorrect = anglesClose(minAngle, TARGET_MIN);
    const score = (hourCorrect && minCorrect) ? 2 : 0;
    setClockScore(score);
    setStep(3);
  };

  const checkRecallAnswers = () => {
    const correctCount = userWords.filter(w => CORRECT_WORDS.includes(w.trim())).length;
    const total = (clockScore ?? 0) + correctCount;
    setResult({ clockScore: clockScore ?? 0, recallScore: correctCount, total, impaired: total <= 3 });
    setStep(4);
  };

  return (
    <div
      style={{ fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif" }}
      className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mini-Cog™</h1>
          <p className="text-slate-400 text-sm mt-1">แบบประเมินภาวะการรู้คิด</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step >= i ? 'bg-blue-500 w-10' : 'bg-slate-200 w-6'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 overflow-hidden">

          {/* ── Step 1: Registration ── */}
          {step === 1 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                <h2 className="text-lg font-bold text-slate-800">การลงทะเบียนคำศัพท์</h2>
              </div>
              <div className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-100">
                <p className="text-blue-700 text-sm leading-relaxed italic mb-5 text-center">
                  "ให้ตั้งใจฟังดีๆ เดี๋ยวจะบอกคำ 3 คำ เมื่อพูดจบแล้วให้พูดตามและจำไว้ เดี๋ยวจะกลับมาถามซ้ำ"
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {CORRECT_WORDS.map(word => (
                    <div key={word} className="bg-white border border-blue-100 rounded-xl py-4 text-center text-lg font-black text-blue-600 shadow-sm">
                      {word}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-blue-200"
              >
                จำคำศัพท์ได้แล้ว →
              </button>
            </div>
          )}

          {/* ── Step 2: Clock Drawing ── */}
          {step === 2 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                <h2 className="text-lg font-bold text-slate-800">การวาดรูปนาฬิกา</h2>
              </div>
              <p className="text-slate-500 text-sm mb-6 ml-11">
                ลากเข็มนาฬิกาไปที่เวลา <span className="font-bold text-indigo-600">11:10 น.</span>
                <br /><span className="text-xs text-slate-400">เข็มน้ำเงิน = ชั่วโมง | เข็มม่วง = นาที</span>
              </p>

              {/* Interactive Clock */}
              <div
                className="relative mx-auto mb-6 select-none touch-none"
                style={{ width: 260, height: 260 }}
                ref={clockRef}
                onMouseMove={handleClockMouseMove}
                onMouseUp={handleClockMouseUp}
                onMouseLeave={handleClockMouseUp}
                onTouchMove={handleClockMouseMove}
                onTouchEnd={handleClockMouseUp}
              >
                {/* Clock face */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-700 bg-white shadow-inner" />

                {/* Numbers */}
                {CLOCK_NUMBERS.map((num, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const r = 110;
                  const x = 130 + r * Math.cos(angle);
                  const y = 130 + r * Math.sin(angle);
                  return (
                    <span
                      key={num}
                      className="absolute text-sm font-bold text-slate-700 pointer-events-none"
                      style={{
                        left: x,
                        top: y,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {num}
                    </span>
                  );
                })}

                {/* Tick marks */}
                {[...Array(60)].map((_, i) => {
                  const angle = (i * 6 - 90) * (Math.PI / 180);
                  const isMajor = i % 5 === 0;
                  const r1 = isMajor ? 92 : 96;
                  const r2 = 102;
                  const x1 = 130 + r1 * Math.cos(angle);
                  const y1 = 130 + r1 * Math.sin(angle);
                  const x2 = 130 + r2 * Math.cos(angle);
                  const y2 = 130 + r2 * Math.sin(angle);
                  return (
                    <svg key={i} className="absolute inset-0 pointer-events-none" width="260" height="260" style={{ top: 0, left: 0 }}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMajor ? '#374151' : '#d1d5db'} strokeWidth={isMajor ? 2 : 1} />
                    </svg>
                  );
                })}

                {/* Hour hand */}
                <div
                  className="absolute cursor-grab active:cursor-grabbing"
                  style={{
                    left: 130,
                    top: 130,
                    width: 6,
                    height: 72,
                    marginLeft: -3,
                    marginTop: -72,
                    transformOrigin: 'bottom center',
                    transform: `rotate(${hourAngle}deg)`,
                  }}
                  onMouseDown={() => setDragging('hour')}
                  onTouchStart={() => setDragging('hour')}
                >
                  <div className="w-full h-full bg-blue-600 rounded-full" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                </div>

                {/* Minute hand */}
                <div
                  className="absolute cursor-grab active:cursor-grabbing"
                  style={{
                    left: 130,
                    top: 130,
                    width: 4,
                    height: 88,
                    marginLeft: -2,
                    marginTop: -88,
                    transformOrigin: 'bottom center',
                    transform: `rotate(${minAngle}deg)`,
                  }}
                  onMouseDown={() => setDragging('min')}
                  onTouchStart={() => setDragging('min')}
                >
                  <div className="w-full h-full bg-violet-500 rounded-full" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-violet-400 rounded-full border-2 border-white shadow-md" />
                </div>

                {/* Center dot */}
                <div className="absolute w-4 h-4 bg-slate-800 rounded-full" style={{ left: 130, top: 130, transform: 'translate(-50%, -50%)', zIndex: 10 }} />
              </div>

              {/* Current angle hint */}
              <div className="flex justify-center gap-6 text-xs text-slate-400 mb-6">
                <span>🔵 ชั่วโมง: {Math.round(normalizeAngle(hourAngle))}°</span>
                <span>🟣 นาที: {Math.round(normalizeAngle(minAngle))}°</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={evaluateClock} className="py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-sm transition-all shadow-md">
                  ตรวจคำตอบอัตโนมัติ
                </button>
                <button onClick={() => { setClockScore(2); setStep(3); }} className="py-4 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-2xl font-bold text-sm transition-all">
                  ให้คะแนนเอง (2 คะแนน)
                </button>
              </div>
              <button onClick={() => { setClockScore(0); setStep(3); }} className="w-full mt-2 py-3 text-slate-400 hover:text-slate-600 text-sm transition-all">
                ไม่ถูกต้อง (0 คะแนน) →
              </button>
            </div>
          )}

          {/* ── Step 3: Recall ── */}
          {step === 3 && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                <h2 className="text-lg font-bold text-slate-800">การทดสอบความจำ</h2>
              </div>
              <p className="text-slate-500 text-sm mb-6 ml-11">พิมพ์คำศัพท์ 3 คำที่จำได้จากตอนแรก</p>

              <div className="space-y-3 mb-6">
                {userWords.map((w, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`คำที่ ${i + 1}`}
                    value={w}
                    onChange={(e) => {
                      const updated = [...userWords];
                      updated[i] = e.target.value;
                      setUserWords(updated);
                    }}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 focus:border-emerald-400 rounded-2xl text-center text-lg font-bold outline-none transition-all"
                  />
                ))}
              </div>

              <button
                onClick={checkRecallAnswers}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100"
              >
                ส่งคำตอบและดูผล
              </button>
            </div>
          )}

          {/* ── Step 4: Result ── */}
          {step === 4 && result && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black mb-3 ${result.impaired ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                  {result.total}
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-widest">คะแนนรวม / 5</p>
              </div>

              <div className={`rounded-2xl p-5 mb-6 border ${result.impaired ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                <p className={`font-bold text-center text-base ${result.impaired ? 'text-orange-700' : 'text-green-700'}`}>
                  {result.impaired
                    ? '⚠️ มีภาวะการรู้คิดบกพร่อง (cognitive impairment)'
                    : '✅ ผลการประเมินเบื้องต้นอยู่ในเกณฑ์ปกติ'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-black text-slate-800">{result.clockScore}<span className="text-sm font-normal text-slate-400">/2</span></p>
                  <p className="text-xs text-slate-500 mt-1">Clock Drawing</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-2xl font-black text-slate-800">{result.recallScore}<span className="text-sm font-normal text-slate-400">/3</span></p>
                  <p className="text-xs text-slate-500 mt-1">Word Recall</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center mb-6">
                * ผลนี้เป็นการประเมินเบื้องต้นเท่านั้น ไม่ใช่การวินิจฉัยทางการแพทย์
              </p>

              <button
                onClick={onBack ?? (() => { setStep(1); setUserWords(['', '', '']); setClockScore(null); setResult(null); setHourAngle(0); setMinAngle(0); })}
                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold transition-all"
              >
                เริ่มต้นใหม่
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-xs text-slate-400 mt-4">Mini-Cog™ © S. Borson</p>
      </div>
    </div>
  );
}