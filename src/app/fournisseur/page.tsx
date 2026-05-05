import { createClient } from '@/lib/supabase/server'
import { Package, Truck, Clock, CheckCircle2, Building2, MapPin, Search } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = "force-dynamic"

export default async function SupplierDashboard() {
  const supabase = await createClient()

  // Get current user (supplier)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch supplier profile
  const { data: supplier } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch expeditions where this supplier is the source (match by telephone or name)
  const { data: myExpeditions } = await supabase
    .from('expeditions')
    .select('*')
    .eq('fournisseur_tel', supplier?.telephone)
    .order('created_at', { ascending: false })

  const stats = [
    { label: 'Total Sorties', value: myExpeditions?.length || 0, icon: Package, color: 'text-indigo-400' },
    { label: 'En Transit', value: myExpeditions?.filter(e => e.statut === 'Transit').length || 0, icon: Truck, color: 'text-amber-400' },
    { label: 'Livrées', value: myExpeditions?.filter(e => e.statut === 'Livré').length || 0, icon: CheckCircle2, color: 'text-emerald-400' },
  ]

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <Building2 className="w-10 h-10 text-indigo-500" />
              Espace Fournisseur
            </h1>
            <p className="text-gray-400 mt-2 font-medium">Bienvenue, <span className="text-white">{supplier?.nom_entreprise}</span>. Gérez vos sorties de stock.</p>
          </div>
          <div className="flex gap-4">
             {stats.map((s, idx) => (
               <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 min-w-[140px]">
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{s.label}</p>
                    <p className="text-xl font-black">{s.value}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-8">
           <div className="glass-card rounded-[40px] p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Flux des Expéditions
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Rechercher un colis..." className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="space-y-4">
                {myExpeditions?.map((exp) => (
                  <div key={exp.id} className="group p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                          <Package className="w-6 h-6 text-indigo-400" />
                       </div>
                       <div>
                          <p className="font-mono text-sm font-bold text-white mb-1 uppercase tracking-widest">{exp.id.split('-')[0]}</p>
                          <p className="text-xs text-gray-500">{exp.description_marchandise}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-12">
                       <div className="text-center">
                          <p className="text-[10px] text-gray-600 font-black uppercase mb-1">Destination</p>
                          <p className="text-sm font-bold flex items-center gap-1">
                             <MapPin className="w-3 h-3 text-red-500" /> {exp.wilaya_arrivee}
                          </p>
                       </div>
                       <div className="text-right min-w-[120px]">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                             exp.statut === 'Livré' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                             exp.statut === 'Transit' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                             'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                          }`}>
                             {exp.statut}
                          </span>
                       </div>
                    </div>
                  </div>
                ))}
                {(!myExpeditions || myExpeditions.length === 0) && (
                  <div className="text-center py-20 opacity-30">
                    <Package className="w-16 h-16 mx-auto mb-4" />
                    <p>Aucune expédition trouvée pour votre entrepôt.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
