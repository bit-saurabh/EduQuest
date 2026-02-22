import { Link } from 'react-router-dom';

const Feature = ({ icon, title, desc }) => (
  <div className="glass-card p-6">
    <div className="text-2xl mb-3">{icon}</div>
    <h3 className="font-semibold font-display text-white mb-2 text-sm">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }) => (
  <div className="flex gap-4">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono shrink-0 mt-0.5"
      style={{ background: 'rgba(0, 245, 160, 0.1)', color: '#00f5a0', border: '1px solid rgba(0, 245, 160, 0.2)' }}>
      {num}
    </div>
    <div>
      <h4 className="font-semibold font-display text-white text-sm mb-1">{title}</h4>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold font-display text-sm"
            style={{ background: 'linear-gradient(135deg, #00f5a0, #00d4ff)', color: '#0a0a0f' }}>
            EQ
          </div>
          <span className="font-bold font-display text-white">EduQuest</span>
          <span className="text-xs font-mono text-slate-600">2.0</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Login</Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-display font-semibold mb-8"
          style={{ background: 'rgba(0, 245, 160, 0.08)', color: '#00f5a0', border: '1px solid rgba(0, 245, 160, 0.15)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse"></span>
          AI-Powered Goal Execution
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-display text-white leading-[1.1] tracking-tight mb-6">
          Stop setting goals.<br />
          <span style={{ background: 'linear-gradient(135deg, #00f5a0, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Start executing them.
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          EduQuest converts any learning goal into a structured day-by-day roadmap with quizzes, 
          XP rewards, and a live leaderboard to keep you accountable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-8 py-4 w-full sm:w-auto justify-center">
            Create Your First Goal →
          </Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto justify-center">
            Sign In
          </Link>
        </div>

        {/* Stats preview */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {[
            { label: 'XP for completing a day', value: '+10' },
            { label: 'XP for passing a quiz', value: '+5' },
            { label: 'XP for finishing a goal', value: '+50' }
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold font-mono" style={{ color: '#00f5a0' }}>{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-3xl font-bold font-display text-white mb-8 leading-tight">
              From goal to execution<br />in minutes.
            </h2>
            <div className="space-y-6">
              <Step num="01" title="Set Your Goal" desc="Enter any learning goal — a skill, subject, or project. Set your timeline and difficulty." />
              <Step num="02" title="Get Your Roadmap" desc="Our AI generates a structured day-by-day plan with tasks, topics, and quizzes." />
              <Step num="03" title="Execute Daily" desc="Complete daily tasks, take quizzes, earn XP. Your streak keeps you accountable." />
              <Step num="04" title="Compete & Level Up" desc="Climb the leaderboard. Unlock Silver, Gold, and Diamond leagues as your XP grows." />
            </div>
          </div>
          <div className="space-y-3">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-display font-semibold text-white">Learn Machine Learning</span>
                <span className="text-xs font-mono" style={{ color: '#00f5a0' }}>72%</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30, 30, 46, 0.8)' }}>
                <div className="h-full rounded-full" style={{ width: '72%', background: 'linear-gradient(90deg, #00f5a0, #00d4ff)', boxShadow: '0 0 10px rgba(0, 245, 160, 0.4)' }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-mono">Day 22 of 30</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4 text-center">
                <p className="text-xl font-bold font-mono" style={{ color: '#00f5a0' }}>1,240</p>
                <p className="text-xs text-slate-500 mt-0.5">Total XP</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xl font-bold font-mono" style={{ color: '#00d4ff' }}>Diamond</p>
                <p className="text-xs text-slate-500 mt-0.5">League</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-widest mb-2 text-center">Features</p>
        <h2 className="text-3xl font-bold font-display text-white mb-10 text-center">Everything you need to execute.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Feature icon="🧠" title="AI Roadmap Generation" desc="Gemini AI creates a structured daily learning plan from just your goal title and timeline." />
          <Feature icon="📅" title="Daily Task System" desc="Each day has a clear task, topic list, and time estimate. Know exactly what to do." />
          <Feature icon="🎯" title="Built-in Quizzes" desc="Every day has AI-generated quiz questions to test understanding and earn bonus XP." />
          <Feature icon="⚡" title="XP & Leagues" desc="Earn XP by completing days and passing quizzes. Progress from Bronze to Diamond." />
          <Feature icon="🏆" title="Live Leaderboard" desc="See where you rank globally. Competitive pressure makes consistency easier." />
          <Feature icon="🔥" title="Streak Tracking" desc="Track your daily consistency streak. Missing a day resets it — stay committed." />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="glass-card p-12" style={{ border: '1px solid rgba(0, 245, 160, 0.1)' }}>
          <h2 className="text-4xl font-bold font-display text-white mb-4">Ready to actually follow through?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">Join EduQuest and turn your next learning goal into a done deal.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4 inline-flex">
            Start for Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-8 text-center">
        <p className="text-xs text-slate-600 font-display">© 2024 EduQuest 2.0 — Built with React, Node.js & Gemini AI</p>
      </footer>
    </div>
  );
}
