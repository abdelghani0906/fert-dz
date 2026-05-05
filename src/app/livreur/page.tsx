'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Truck, MapPin, CheckCircle2, Navigation, Loader2, Package, History, Camera, Printer } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PrintLabel from '@/components/PrintLabel'

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

export default function LivreurDashboard() {
  const [expeditions, setExpeditions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchMyMissions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login/livreur')
        return
      }

      const { data: driverData } = await supabase
        .from('camionneurs')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!driverData) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('expeditions')
        .select('*')
        .eq('camionneur_id', driverData.id)
        .neq('statut', 'Livré')
        .order('created_at', { ascending: false })

      if (data) setExpeditions(data)
      setLoading(false)
    }
    fetchMyMissions()
  }, [])

  const updateLocation = async (expId: string, newLocation: string, newStatus: string) => {
    let photoUrl = null
    
    if (newStatus === 'Livré') {
      const confirmed = window.confirm("Confirmer que le colis a été livré au client ?")
      if (!confirmed) return

      if (deliveryPhoto) {
        setUpdating(expId)
        const fileExt = deliveryPhoto.name.split('.').pop()
        const fileName = `${expId}_proof_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('livraisons')
          .upload(fileName, deliveryPhoto)
        
        if (uploadError) {
          alert("Erreur upload photo: " + uploadError.message)
        } else {
          const { data: { publicUrl } } = supabase.storage.from('livraisons').getPublicUrl(fileName)
          photoUrl = publicUrl
        }
      } else {
        alert("Veuillez prendre une photo de preuve de livraison.")
        return
      }
    }

    setUpdating(expId)
    const updateData: any = { statut: newStatus, current_location: newLocation }
    if (photoUrl) updateData.photo_livraison_url = photoUrl

    const { error } = await supabase.from('expeditions').update(updateData).eq('id', expId)

    if (error) {
      alert("Erreur: " + error.message)
    } else {
      if (newStatus === 'Livré') {
        setExpeditions(prev => prev.filter(ex => ex.id !== expId))
        setDeliveryPhoto(null)
      } else {
        setExpeditions(prev => prev.map(ex => ex.id === expId ? { ...ex, statut: newStatus, current_location: newLocation } : ex))
      }
    }
    setUpdating(null)
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
              <Truck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Espace Chauffeur</h1>
              <p className="text-sm text-gray-500">Mettez à jour vos livraisons en temps réel.</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-sm text-gray-500 hover:text-white">Déconnexion</button>
        </header>

        <div className="grid gap-6">
          {expeditions.length === 0 ? (
            <div className="p-12 border border-white/5 bg-[#111] rounded-3xl text-center">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-gray-500">Aucune mission active.</p>
            </div>
          ) : (
            expeditions.map(exp => (
              <div key={exp.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{exp.description_marchandise}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">REF: {exp.id.split('-')[0]}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                    {exp.statut}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase font-black mb-1">Arrivée</p>
                    <p className="font-bold flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-emerald-500" /> {exp.wilaya_arrivee}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase font-black mb-1">Position</p>
                    <p className="font-bold flex items-center gap-2 text-sm"><Navigation className="w-4 h-4 text-indigo-400" /> {exp.current_location || exp.wilaya_depart}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex flex-col gap-4">
                    <select 
                      disabled={updating === exp.id}
                      onChange={(e) => updateLocation(exp.id, e.target.value, exp.statut)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="" className="text-gray-900">🗺️ Modifier ma position...</option>
                      {WILAYAS.map(w => <option key={w} value={w} className="text-gray-900">{w}</option>)}
                    </select>

                    <div className="flex flex-wrap gap-3">
                      {exp.statut === 'En attente' && (
                        <button 
                          onClick={() => updateLocation(exp.id, exp.current_location || exp.wilaya_depart, 'Transit')} 
                          disabled={updating === exp.id} 
                          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                           <Package className="w-4 h-4" /> Colis Récupéré
                        </button>
                      )}

                      {(exp.statut === 'Récupéré' || exp.statut === 'Transit') && (
                        <div className="w-full space-y-3">
                           <div className="flex gap-2">
                              <label className="flex-1 cursor-pointer bg-white/5 border border-dashed border-white/20 rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-xs text-gray-400">
                                 <Camera className="w-5 h-5 text-indigo-400" />
                                 {deliveryPhoto ? "Photo jointe ✅" : "Photo Preuve de Livraison"}
                                 <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setDeliveryPhoto(e.target.files?.[0] || null)} />
                              </label>
                              <button onClick={() => window.print()} className="p-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white">
                                 <Printer className="w-5 h-5" />
                              </button>
                           </div>
                           
                           {exp.statut === 'Récupéré' && (
                             <button onClick={() => updateLocation(exp.id, exp.wilaya_depart, 'Transit')} disabled={updating === exp.id} className="w-full py-4 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                                <Truck className="w-4 h-4" /> Démarrer le trajet
                             </button>
                           )}

                           <button onClick={() => updateLocation(exp.id, exp.wilaya_arrivee, 'Livré')} disabled={updating === exp.id} className="w-full py-4 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 ring-4 ring-emerald-500/10">
                              <CheckCircle2 className="w-4 h-4" /> Confirmer la Livraison ✅
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden print:block"><PrintLabel exp={exp} /></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
