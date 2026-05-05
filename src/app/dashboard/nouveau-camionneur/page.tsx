'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Truck, User, MapPin, Weight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
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

    const { error: insertError } = await supabase.from('camionneurs').insert({
      nom_complet,
      telephone,
      type_vehicule,
      capacite_max_kg: capacite,
      wilaya_base: wilaya,
      disponible: true
    })

    if (insertError) {
      setError(insertError.message)
      console.error(insertError)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center animate-in zoom-in">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Chauffeur ajouté !</h2>
          <p className="text-gray-400 mt-2">Redirection vers le tableau de bord...</p>
        </div>
      </div>
    )
  }

  const inputStyle = "w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
  const selectStyle = "w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour au Dashboard
        </Link>

        <div className="bg-[#111111] border border-white/5 rounded-[32px] p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
              <Truck className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Ajouter un Chauffeur</h1>
              <p className="text-sm text-gray-500 mt-1">Créez le profil de votre nouveau transporteur.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Nom Complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                    <input name="nom_complet" required type="text" placeholder="Abdelghani..." className={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                    <input name="telephone" required type="tel" placeholder="05XX XX XX XX" className={inputStyle} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Type de Véhicule</label>
                  <div className="relative">
                     <Truck className="absolute left-4 top-4 w-5 h-5 text-gray-500 z-10" />
                     <select name="type_vehicule" required className={selectStyle}>
                        <option value="Camion 10 Tonnes" className="bg-[#1a1a1a]">Camion 10 Tonnes</option>
                        <option value="Semi-Remorque" className="bg-[#1a1a1a]">Semi-Remorque</option>
                        <option value="Fourgon" className="bg-[#1a1a1a]">Fourgon</option>
                        <option value="Camionnette" className="bg-[#1a1a1a]">Camionnette</option>
                     </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Capacité (kg)</label>
                  <div className="relative">
                    <Weight className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                    <input name="capacite" required type="number" placeholder="1200" className={inputStyle} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Wilaya de Base</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-500 z-10" />
                  <select name="wilaya" required className={selectStyle}>
                    <option value="" className="bg-[#1a1a1a]">Choisir une wilaya...</option>
                    {WILAYAS.map(w => (
                      <option key={w} value={w} className="bg-[#1a1a1a] text-white py-2">{w}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                Erreur: {error} (Assurez-vous d'avoir activé les RLS Policies)
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-95">
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Enregistrer le Chauffeur"}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
