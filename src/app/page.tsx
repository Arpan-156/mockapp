import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <Link className="font-extrabold text-xl tracking-tight text-slate-900" href="/">
            WB TET Pro
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors hidden sm:block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors hidden sm:block" href="#pattern">
            Exam Pattern
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-full px-6">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 shadow-md shadow-blue-200">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
          
          <div className="container relative px-4 md:px-6 mx-auto text-center z-10">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              2026 Edition Updated Syllabus
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
              Master the WB TET with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Real-Time AI Mocks
              </span>
            </h1>
            <p className="mx-auto max-w-[800px] text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
              Experience the exact exam environment with 150-question full-length tests dynamically generated in real-time. Practice smarter, analyze deeper, and secure your teaching career.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-1">
                  Start Your Free Test Now
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-full transition-all">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            {/* Dashboard Preview Image Placeholder */}
            <div className="mt-16 mx-auto max-w-5xl rounded-2xl border border-slate-200/50 bg-white/50 p-2 shadow-2xl backdrop-blur-sm">
              <div className="rounded-xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center border border-slate-200 relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/40 to-indigo-50/40 z-0"></div>
                <div className="z-10 text-center space-y-4">
                   <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800">State-of-the-Art Exam Engine</h3>
                   <p className="text-slate-500 font-medium">150 Questions • 150 Minutes • Zero Distractions</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full py-24 bg-white relative z-10 border-t border-slate-100">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Succeed</h2>
              <p className="text-lg text-slate-600">Our platform is designed specifically for WB TET aspirants, matching the exact format and difficulty of the real examination.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { title: "Dynamic Question Generation", desc: "Never take the same test twice. Our system fetches and curates 150 fresh questions dynamically.", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
                { title: "Strict Time Simulation", desc: "A continuous 2hr 30min timer that cannot be reset. Practice managing your time under real pressure.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                { title: "Deep Analytics", desc: "Subject-wise performance breakdowns, accuracy rates, and detailed explanations for every single question.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }
              ].map((f, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exam Pattern */}
        <section id="pattern" className="w-full py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-16">Official WB TET Structure</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
              {[
                { name: "Child Development & Pedagogy", color: "from-purple-500 to-indigo-500" },
                { name: "Language I (Bengali/Hindi/Urdu)", color: "from-blue-500 to-cyan-500" },
                { name: "Language II (English)", color: "from-teal-500 to-emerald-500" },
                { name: "Mathematics", color: "from-orange-500 to-red-500" },
                { name: "Environmental Studies", color: "from-pink-500 to-rose-500" }
              ].map((subject, idx) => (
                <div key={idx} className="flex flex-col items-center p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:-translate-y-2 transition-transform">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${subject.color} mb-4 flex items-center justify-center font-bold text-xl`}>{idx + 1}</div>
                  <h3 className="font-bold text-sm mb-4 min-h-[40px] flex items-center justify-center text-slate-300">{subject.name}</h3>
                  <div className="w-full h-px bg-slate-700 mb-4"></div>
                  <div className="flex w-full justify-between px-2">
                    <div className="text-center">
                      <p className="text-2xl font-bold">30</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Qs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">30</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Marks</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 p-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 inline-block">
              <div className="bg-slate-900 rounded-xl p-8 sm:px-12 flex flex-wrap justify-center gap-8 sm:gap-16 text-left">
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Total Score</p>
                  <p className="text-3xl font-bold">150</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-3xl font-bold">150 Min</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Passing</p>
                  <p className="text-3xl font-bold">90 (60%)</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Negative Marking</p>
                  <p className="text-3xl font-bold text-green-400">None</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-10 bg-slate-50 border-t border-slate-200">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">W</span>
            </div>
            <span className="font-bold text-slate-900">WB TET Pro</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 WB TET Mock Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

