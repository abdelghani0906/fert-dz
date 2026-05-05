import Link from 'next/link'
import { ArrowRight, Truck, Package, ShieldCheck, Zap } from 'lucide-react'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Truck className="w-6 h-6 text-indigo-400" />
            Fret-Dz
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.15),transparent)]">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Plateforme Logistique B2B — Algérie 🇩🇿
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent leading-tight">
          Expédiez vos<br />marchandises<br />sans friction.
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mb-10">
          Connectez-vous avec des camionneurs vérifiés à travers toutes les wilayas d'Algérie. 
          Créez, suivez et gérez vos expéditions en temps réel.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all group">
            Créer un compte gratuit
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all">
            Se connecter
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <Package className="w-6 h-6 text-indigo-400" />,
            title: 'Gestion des Expéditions',
            desc: 'Créez des expéditions, sélectionnez un transporteur et uploadez vos bons de livraison en quelques clics.'
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
            title: 'Sécurité RLS Native',
            desc: 'Chaque commerçant ne voit que ses propres données. La sécurité est garantie au niveau du moteur PostgreSQL.'
          },
          {
            icon: <Zap className="w-6 h-6 text-yellow-400" />,
            title: 'Déploiement Serverless',
            desc: 'Hébergé sur Vercel Edge et Supabase Cloud. Zéro serveur à gérer, scalabilité automatique.'
          }
        ].map((f, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
              {f.icon}
            </div>
            <h3 className="font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer Area */}
      <Footer />
    </div>
  )
}
