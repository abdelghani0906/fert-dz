'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Truck, MapPin, CheckCircle2, Navigation, Loader2, Package, History } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchMyMissions() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login/livreur')
        return
      }

      // 1. Get the driver record linked to this user
      const { data: driverData } = await supabase
        .from('camionneurs')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!driverData) {
        setLoading(false)
        return // No driver profile linked to this user
      }

      // 2. Fetch missions assigned to this specific driver
      const { data, error } = await supabase
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
    setUpdating(expId)
    const { error } = await supabase
      .from('expeditions')
      .update({ 
        statut: newStatus,
        current_location: newLocation
      })
      .eq('id', expId)

    if (error) {
      alert("خطأ في التحديث: " + error.message)
      console.error(error)
    } else {
      setExpeditions(prev => prev.map(ex => ex.id === expId ? { ...ex, statut: newStatus, current_location: newLocation } : ex))
    }
    setUpdating(null)
  }


  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
              <Truck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Espace Chauffeur</h1>
              <p className="text-sm text-gray-500">Gérez vos livraisons et mettez à jour votre position.</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="text-sm text-gray-500 hover:text-white">Déconnexion</button>
        </header>

        <div className="grid gap-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
            <Navigation className="w-5 h-5" /> Missions en cours
          </h2>

          {expeditions.length === 0 ? (
            <div className="p-12 border border-white/5 bg-[#111] rounded-3xl text-center">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-gray-500">Aucune mission assignée pour le moment.</p>
            </div>
          ) : (
            expeditions.map(exp => (
              <div key={exp.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{exp.description_marchandise}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase">REF: {exp.id.split('-')[0]}</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold border border-indigo-500/20">
                    {exp.statut}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Destination</p>
                    <p className="font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {exp.wilaya_arrivee}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Position Actuelle</p>
                    <p className="font-bold flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-indigo-400" /> 
                      {exp.current_location || exp.wilaya_depart}
                    </p>
                  </div>

                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mettre à jour ma position</p>
                  <div className="flex flex-wrap gap-3">
                    <select 
                      disabled={updating === exp.id}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) updateLocation(exp.id, val, exp.statut);
                      }}
                      className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">🗺️ Ma Position Actuelle...</option>
                      {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>

                    
                    {exp.statut === 'En attente' && (
                      <button 
                        onClick={() => updateLocation(exp.id, exp.wilaya_depart, 'Récupéré')}
                        disabled={updating === exp.id}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                      >
                        {updating === exp.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Package className="w-4 h-4" />}
                        J'ai récupéré la marchandise
                      </button>
                    )}

                    {exp.statut === 'Récupéré' && (
                      <button 
                        onClick={() => updateLocation(exp.id, exp.wilaya_depart, 'Transit')}
                        disabled={updating === exp.id}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                        {updating === exp.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Truck className="w-4 h-4" />}
                        Je suis en route (Transit)
                      </button>
                    )}

                    {(exp.statut === 'Transit' || exp.statut === 'Récupéré') && (
                      <button 
                        onClick={() => updateLocation(exp.id, exp.wilaya_arrivee, 'Livré')}
                        disabled={updating === exp.id}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                      >
                        {updating === exp.id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        Colis Livré
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
