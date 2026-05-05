'use client'

import { use } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions'
import { ArrowRight, Truck, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full py-3.5 px-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center group shadow-xl shadow-white/5"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 w-5 h-5 animate-spin text-black" />
          Connexion en cours...
        </>
      ) : (
        <>
          Se connecter
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  )
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = use(searchParams)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] px-6">
      <div className="w-full max-w-md p-10 rounded-[40px] bg-[#111111]/80 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16" />
        
        <div className="relative z-10">
          <div className="flex justify-center mb-10">
            <div className="h-20 w-20 rounded-[28px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <Truck className="text-white w-10 h-10" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-center text-white mb-2 tracking-tighter">Bon retour</h2>
          <p className="text-gray-500 text-center mb-12 font-medium">Gérez votre logistique en toute sérénité.</p>

          <form action={login} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1" htmlFor="email">Email professionnel</label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                  placeholder="contact@entreprise.dz"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1" htmlFor="password">Mot de passe</label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <SubmitButton />
          </form>

          <p className="mt-10 text-center text-gray-500 text-sm font-medium">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-white hover:text-indigo-400 underline underline-offset-4 transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
