'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Truck, Mail, Lock, Loader2, ArrowLeft, ShieldCheck, Globe, Star } from 'lucide-react'
import Link from 'next/link'

export default function LivreurLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError("Identifiants incorrects. Veuillez réessayer.")
      setLoading(false)
    } else {
      router.push('/livreur')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex overflow-hidden font-sans">
      {/* Left Side: Visual Experience (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
          style={{ backgroundImage: "url('/modern_truck_sunset_premium_1777925808549.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent opacity-80" />
        
        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">FRET-DZ<span className="text-indigo-500">.</span></span>
        </div>

        {/* Middle Quote/Content */}
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-4">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800" />)}
             </div>
             <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">+500 Chauffeurs Actifs</span>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Votre route, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">votre destin.</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Rejoignez la plus grande flotte de transporteurs en Algérie. Gérez vos missions avec une précision professionnelle.
          </p>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 flex items-center gap-8 border-t border-white/10 pt-8">
           <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-xs font-bold text-gray-500 uppercase">Support</p>
           </div>
           <div>
              <p className="text-2xl font-bold text-white">Real-time</p>
              <p className="text-xs font-bold text-gray-500 uppercase">Tracking</p>
           </div>
           <div>
              <p className="text-2xl font-bold text-white">Secure</p>
              <p className="text-xs font-bold text-gray-500 uppercase">Payments</p>
           </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[120px]" />

        <div className="w-full max-w-md relative z-10">
          <div className="mb-10 lg:hidden flex items-center gap-3">
             <Truck className="w-8 h-8 text-indigo-500" />
             <span className="text-xl font-black text-white tracking-tighter">FRET-DZ</span>
          </div>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">
              <Star className="w-3 h-3 fill-indigo-400" /> Espace Chauffeur
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Bon retour !</h1>
            <p className="text-gray-500">Entrez vos identifiants pour accéder à votre tableau de bord.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5 group">
              <label className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${focused === 'email' ? 'text-indigo-400' : 'text-gray-500'}`}>
                Email Professionnel
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'email' ? 'text-indigo-400' : 'text-gray-600'}`} />
                <input 
                  name="email" 
                  required 
                  type="email" 
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="nom@fret-dz.com" 
                  className="w-full pl-12 pr-4 py-4 bg-[#111] border border-white/5 rounded-2xl text-white placeholder-gray-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${focused === 'password' ? 'text-indigo-400' : 'text-gray-500'}`}>
                  Mot de passe
                </label>
                <Link href="#" className="text-[11px] font-bold text-gray-600 hover:text-indigo-400 uppercase tracking-wider transition-colors">
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focused === 'password' ? 'text-indigo-400' : 'text-gray-600'}`} />
                <input 
                  name="password" 
                  required 
                  type="password" 
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-4 bg-[#111] border border-white/5 rounded-2xl text-white placeholder-gray-700 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-sm animate-in shake duration-500">
                {error}
              </div>
            )}

            <button 
              disabled={loading} 
              type="submit" 
              className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              {loading ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <>
                  Connecter <Globe className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600">
              Pas encore membre de notre flotte ?{' '}
              <Link href="/register" className="text-white font-bold hover:text-indigo-400 transition-colors">
                Rejoindre maintenant
              </Link>
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
             <div className="flex items-center gap-2 text-gray-700 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
                SÉCURITÉ MILITAIRE • AES-256
             </div>
             
             <Link href="/" className="group inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> 
                Retour au portail
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

