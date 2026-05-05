'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Truck, Package, ArrowRight, ShieldCheck, Globe } from 'lucide-react'
import Link from 'next/link'

export default function TrackingSearchPage() {
  const [trackingId, setTrackingId] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingId.trim()) {
      router.push(`/tracking/${trackingId.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
          <Truck className="w-8 h-8 text-indigo-500" />
          FRET-DZ
        </Link>
        <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
          Connexion Espace Pro
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-3xl w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-indigo-400 text-xs font-bold tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Globe className="w-3 h-3" /> Suivi en temps réel • Algérie
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            Suivez votre <span className="text-indigo-500">Colis</span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Entrez votre numéro d'expédition pour connaître l'état de votre livraison et la position de votre marchandise.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[22px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-[#111] border border-white/10 rounded-[20px] p-2 shadow-2xl">
              <div className="pl-4">
                <Package className="w-6 h-6 text-gray-500" />
              </div>
              <input 
                type="text" 
                placeholder="Ex: 550e8400-e29b-41d4-a716..."
                className="flex-1 bg-transparent border-none text-white px-4 py-4 outline-none placeholder-gray-600 font-mono text-sm md:text-base"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                Tracer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left">
            <div className="space-y-3 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <h3 className="font-bold">Sécurisé</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Données protégées et accès restreint aux destinataires autorisés.</p>
            </div>
            <div className="space-y-3 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <Clock className="w-6 h-6 text-indigo-400" />
              <h3 className="font-bold">24h/7j</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Suivi disponible à tout moment, de jour comme de nuit.</p>
            </div>
            <div className="space-y-3 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <MapPin className="w-6 h-6 text-purple-500" />
              <h3 className="font-bold">Localisation</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Précision sur la wilaya actuelle de votre colis.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-12 text-center text-gray-600 text-xs border-t border-white/5">
        &copy; {new Date().getFullYear()} Fret-Dz Logistics. Tous droits réservés.
      </footer>
    </div>
  )
}

import { Clock, MapPin } from 'lucide-react'
