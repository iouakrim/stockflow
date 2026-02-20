import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  Boxes,
  ChevronRight,
  LayoutDashboard,
  Play,
  ShieldCheck,
  Terminal,
  Zap
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#102219] text-white selection:bg-primary/30 overflow-x-hidden">
      {/* Premium Grid Background */}
      <div className="fixed inset-0 premium-grid opacity-20 pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-50 border-b border-primary/5 bg-[#102219]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <Boxes className="h-6 w-6 text-[#102219]" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">StockFlow <span className="text-primary">Pro</span></span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {['Solutions', 'Ecosystem', 'Pricing', 'Security'].map(item => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-6">Login Access</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-xl h-10 px-6 text-[10px] tracking-widest uppercase shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                Onboard Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-float">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Version 4.0 Intelligence Suite</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-[ -0.05em] leading-[0.9] max-w-4xl mx-auto">
            Modernize Your <span className="text-primary italic">Warehouse</span> Workflow
          </h1>

          <p className="max-w-xl mx-auto text-white/40 font-medium text-lg leading-relaxed">
            The ultimate OS for bulk agricultural inventory. Real-time stock tracking, POS terminal integration, and predictive analytics in one premium command center.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-16 px-10 text-sm tracking-widest uppercase shadow-2xl shadow-primary/20 gap-3 group">
                Deploy System <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/plans">
              <Button variant="outline" className="border-primary/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 rounded-2xl h-16 px-10 text-sm font-bold gap-3">
                <Play className="h-5 w-5 text-primary fill-primary" /> Subscription Matrix
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Component */}
        <div className="max-w-6xl mx-auto mt-24 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative glass-card border-primary/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            {/* Mock UI Header */}
            <div className="h-14 border-b border-white/5 bg-white/5 flex items-center px-6 justify-between">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map(i => <div key={i} className="size-2.5 rounded-full bg-white/10" />)}
              </div>
              <div className="px-4 py-1 rounded-lg bg-[#102219] border border-white/5 text-[9px] font-black text-white/30 tracking-[0.2em] uppercase">
                system.stockflow-pro.int
              </div>
              <div className="size-6 rounded-lg bg-white/5" />
            </div>
            {/* Mock UI Content */}
            <div className="p-8 grid grid-cols-12 gap-8 bg-[#102219]/40 backdrop-blur-3xl">
              <div className="col-span-3 space-y-4">
                <div className="h-32 rounded-3xl bg-primary/10 border border-primary/20 p-6">
                  <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-3"><LayoutDashboard className="h-5 w-5" /></div>
                  <div className="h-2 w-16 bg-primary/20 rounded-full" />
                </div>
                {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-2xl bg-white/5 border border-white/5" />)}
              </div>
              <div className="col-span-9 space-y-8">
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-3xl bg-white/5 border border-white/5 p-6 space-y-3">
                    <div className="size-8 rounded-lg bg-white/5" />
                    <div className="h-2 w-20 bg-white/10 rounded-full" />
                    <div className="h-4 w-12 bg-white/20 rounded-full" />
                  </div>)}
                </div>
                <div className="h-64 rounded-3xl bg-white/5 border border-white/5 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
                  <div className="flex gap-4 items-end h-full">
                    {[40, 70, 45, 90, 65, 80, 55, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-xl hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Matrix (Solutions) */}
      <section id="solutions" className="py-32 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Logistics <span className="text-primary">Ecosystem</span></h2>
          <p className="text-white/40 font-medium max-w-2xl mx-auto uppercase tracking-widest text-[10px]">Integrated modules for every stage of the cycle</p>
        </div>
        <div id="ecosystem" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Real-time Analytics",
              desc: "Instantly process multi-ton sales with latency-free synchronization across all nodes."
            },
            {
              icon: ShieldCheck,
              title: "Audit Grade Compliance",
              desc: "Every gram accounted for with cryptographic ledger tracking and logistics verification."
            },
            {
              icon: Terminal,
              title: "Command Interface",
              desc: "Optimized for speed. A workspace designed by logistics experts for daily high-volume operations."
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card group p-10 space-y-6 hover:border-primary/20 transition-all">
              <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-[#102219] transition-all">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black tracking-tight tracking-[-0.02em]">{feature.title}</h3>
              <p className="text-white/40 font-medium leading-relaxed">{feature.desc}</p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary pt-2 group-hover:translate-x-2 transition-transform">
                Protocol Details <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-32 px-6 border-y border-white/5 bg-black/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Cryptographic Node Protection</span>
              <h2 className="text-5xl font-black tracking-tighter leading-none">Security as a <span className="text-primary italic">Protocol</span></h2>
              <p className="text-white/40 text-lg font-medium leading-relaxed">
                StockFlow Pro utilizes military-grade encryption for every stock transfer. Our decentralized data structure ensures your harvest data remains tamper-proof.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-5" />
                  <span className="text-xs font-black uppercase tracking-widest">TLS 1.3</span>
                </div>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Encrypted Transmissions</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Zap className="size-5" />
                  <span className="text-xs font-black uppercase tracking-widest">SOX-2</span>
                </div>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Compliance Guaranteed</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
            <div className="relative glass-card aspect-video rounded-[2.5rem] flex items-center justify-center border-primary/20 overflow-hidden">
              <Boxes className="size-32 text-primary opacity-20 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto scroll-mt-20">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl font-black tracking-tighter uppercase">Transparent <span className="text-primary italic">Matrix</span></h2>
          <p className="text-white/40 font-medium uppercase tracking-[0.2em] text-[10px]">Scalable pricing tiers for every facility size</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {['Terminal', 'Matrix', 'Enterprise'].map((tier, i) => (
            <div key={tier} className={`p-10 rounded-[2.5rem] border ${i === 1 ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'} flex flex-col items-center text-center space-y-6`}>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{tier} Protocol</span>
              <div className="space-y-1">
                <span className="text-4xl font-black leading-none">{i === 0 ? '$99' : i === 1 ? '$299' : 'Custom'}</span>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Per Node / Month</p>
              </div>
              <Link href="/plans" className="w-full">
                <Button variant={i === 1 ? "default" : "outline"} className={`w-full rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest ${i === 1 ? 'bg-primary text-[#102219]' : 'border-white/10'}`}>
                  Select Plan
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-[3rem] p-16 text-center space-y-8 bg-primary/5 border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Boxes className="size-48 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Ready to Optimize Your <span className="text-primary italic">Harvest Cycle?</span></h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Join the premium network of agricultural logistics centers powered by StockFlow Pro Intelligence.</p>
          <div className="pt-4">
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-16 px-12 text-sm tracking-widest uppercase shadow-2xl shadow-primary/30">
                Initialize Global System
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Boxes className="h-5 w-5 text-[#102219]" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase italic">StockFlow <span className="text-primary">Pro</span></span>
            </div>
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.1em] leading-relaxed">
              Securing the global grain logistics network through intelligence and design.
            </p>
          </div>
          {[
            { title: 'Platform', links: ['Dashboard', 'POS Terminal', 'Analytics', 'WMS'] },
            { title: 'Resources', links: ['Documentation', 'API Guide', 'Security', 'Protocols'] },
            { title: 'Company', links: ['About', 'Partners', 'Contact', 'Privacy'] }
          ].map(col => (col && (
            <div key={col.title} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{col.title}</h4>
              <div className="flex flex-col gap-3">
                {col.links.map(link => (
                  <Link key={link} href="#" className="text-xs font-bold text-white/30 hover:text-primary transition-colors">{link}</Link>
                ))}
              </div>
            </div>
          )))}
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">© 2026 StockFlow Technologies Matrix</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">Privacy Protocol</Link>
            <Link href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
