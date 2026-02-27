import React, { useState } from 'react';
import MiniCogQuiz from './MiniCogQuiz';

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showQuiz, setShowQuiz] = useState(false);

  if (showQuiz) return <MiniCogQuiz onBack={() => setShowQuiz(false)} />;

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F4F7FA]">
      <nav className="w-full bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">B</div>
          <span className="text-xl font-bold text-slate-800">BRAIN<span className="text-blue-600">CHECK</span></span>
        </div>
        <div className="flex gap-8 text-sm font-bold text-slate-500 uppercase">
          <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-blue-600 border-b-2 border-blue-600' : ''}>หน้าหลัก</button>
          <button onClick={() => setActiveTab('about')} className={activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : ''}>เกณฑ์คะแนน</button>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-8 py-12 lg:py-24">
        {activeTab === 'home' ? (
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-tight">
                ประเมินสุขภาพสมอง <br/> <span className="text-blue-600">ด้วยมาตรฐานสากล</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-xl">คัดกรองภาวะสมองเสื่อมเบื้องต้นด้วยแบบทดสอบ Mini-Cog และ TMSE</p>
              <button onClick={() => setShowQuiz(true)} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700">เริ่มทำแบบทดสอบ</button>
            </div>
            
            <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
              <div onClick={() => setShowQuiz(true)} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl cursor-pointer hover:-translate-y-2 transition-all">
                <div className="text-4xl mb-6">⚡</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Mini-Cog</h3>
                <p className="text-slate-500 text-sm">แบบทดสอบที่ใช้เวลาเพียง 3 นาที </p>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl opacity-60">
                <div className="text-4xl mb-6">📋</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">TMSE</h3>
                <p className="text-slate-500 text-sm">Thai Mental State Exam [cite: 26]</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">เกณฑ์การประเมิน Mini-Cog</h3>
                <p className="text-slate-600 text-lg">คะแนนเต็ม 5 คะแนน หากได้คะแนนรวมน้อยกว่าหรือเท่ากับ 3 คะแนน ถือว่ามีภาวะ Cognitive Impairment </p>
             </div>
             <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">เกณฑ์การประเมิน TMSE</h3>
                <p className="text-slate-600 text-lg">คะแนนเต็ม 30 คะแนน หากได้คะแนนรวมน้อยกว่า 24 คะแนน ถือว่ามีภาวะ Cognitive Impairment [cite: 77]</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;