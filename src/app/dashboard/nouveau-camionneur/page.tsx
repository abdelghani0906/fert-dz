'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Truck, User, MapPin, Weight, ArrowLeft, Loader2, CheckCircle2, Phone } from 'lucide-react'
import Link from 'next/link'

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  "M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj',
  'Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela',
  'Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane'
]

export default function NouveauCamionneur() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const nom_complet = formData.get('nom_complet') as string
    const telephone = formData.get('telephone') as string
    const type_vehicule = formData.get('type_vehicule') as string
    const capacite = Number(formData.get('capacite'))
    const wilaya = formData.get('wilaya') as string

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: insertError } = await supabase.from('camionneurs').insert({
        nom_complet,
        telephone,
        type_vehicule,
        capacite_max_kg: capacite,
        wilaya_base: wilaya,
        disponible: true
      })

      if (insertError) throw insertError
      
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: any) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white">
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold">Chauffeur ajouté !</h2>
          <p className="text-gray-400 mt-2">Le nouveau profil est maintenant disponible dans votre annuaire.</p>
        </div>
      </div>
    )
  }

  const inputStyle = "w-full pl-12 pr-4 py-3.5 bg-[#141414] border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-inner"
  const selectStyle = "w-full pl-12 pr-4 py-3.5 bg-[#141414] border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer shadow-inner"

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour au Tableau de Bord
        </Link>

        <div className="bg-[#111111] border border-white/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center gap-6 mb-10 relative">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-[24px] flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <Truck className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Nouveau Chauffeur</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Enregistrez un nouveau transporteur dans votre réseau.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nom Complet</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input name="nom_complet" required type="text" placeholder="Abdelghani..." className={inputStyle} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Téléphone</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input name="telephone" required type="tel" placeholder="05XX XX XX XX" className={inputStyle} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type de Véhicule</label>
                <div className="relative group">
                   <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 z-10 group-focus-within:text-indigo-400 transition-colors" />
                   <select name="type_vehicule" required className={selectStyle}>
                      <option value="Camion 10 Tonnes" className="bg-[#1a1a1a]">Camion 10 Tonnes</option>
                      <option value="Semi-Remorque" className="bg-[#1a1a1a]">Semi-Remorque</option>
                      <option value="Fourgon" className="bg-[#1a1a1a]">Fourgon</option>
                      <option value="Camionnette" className="bg-[#1a1a1a]">Camionnette</option>
                   </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Capacité (kg)</label>
                <div className="relative group">
                  <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input name="capacite" required type="number" placeholder="1200" className={inputStyle} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Wilaya de Base</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 z-10 group-focus-within:text-indigo-400 transition-colors" />
                <select name="wilaya" required className={selectStyle}>
                  <option value="" className="bg-[#1a1a1a]">Choisir une wilaya...</option>
                  {WILAYAS.map(w => (
                    <option key={w} value={w} className="bg-[#1a1a1a] text-white py-2">{w}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Erreur: {error}
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-4 active:scale-[0.98]">
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                <>
                  <Truck className="w-5 h-5" />
                  Enregistrer le Chauffeur
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
