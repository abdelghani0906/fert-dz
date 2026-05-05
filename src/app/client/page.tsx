import { createClient } from '@/lib/supabase/server'
import { Package, Truck, Clock, CheckCircle2, User, MapPin, Search, ArrowRight } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = "force-dynamic"

export default async function ClientDashboard() {
  const supabase = await createClient()

  // Get current logged in client
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch client profile to get their telephone
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch expeditions where this client is the recipient (matching by telephone)
  const { data: myOrders } = await supabase
    .from('expeditions')
    .select('*')
    .eq('destinataire_tel', client?.telephone)
    .order('created_at', { ascending: false })

  const stats = [
    { label: 'En Route', value: myOrders?.filter(e => e.statut !== 'Livré').length || 0, icon: Truck, color: 'text-amber-400' },
    { label: 'Total Reçus', value: myOrders?.filter(e => e.statut === 'Livré').length || 0, icon: CheckCircle2, color: 'text-emerald-400' },
  ]

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <User className="w-10 h-10 text-emerald-500" />
              Mes Commandes
            </h1>
            <p className="text-gray-400 mt-2 font-medium tracking-tight">Bonjour <span className="text-white font-bold">{client?.nom_entreprise || 'Cher Client'}</span>, suivez vos colis en temps réel.</p>
          </div>
          <div className="flex gap-4">
             {stats.map((s, idx) => (
               <div key={idx} className="glass-card rounded-[24px] p-4 flex items-center gap-4 min-w-[140px]">
                  <div className={`p-2 rounded-xl bg-white/5`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{s.label}</p>
                    <p className="text-xl font-black">{s.value}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="glass-card rounded-[40px] p-8 md:p-10">
           <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-400" />
                Détails de mes colis
              </h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {myOrders?.map((order) => (
               <div key={order.id} className="group p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                           <Package className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ID Commande</p>
                           <p className="font-mono font-bold text-white uppercase">{order.id.split('-')[0]}</p>
                        </div>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                        order.statut === 'Livré' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                     }`}>
                        {order.statut}
                     </span>
                  </div>

                  <div className="space-y-4 mb-8">
                     <p className="text-sm text-gray-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" /> 
                        Expédié de: <span className="text-white font-bold">{order.wilaya_depart}</span>
                     </p>
                     <p className="text-sm font-medium text-gray-300 italic">"{order.description_marchandise}"</p>
                  </div>

                  <Link 
                    href={`/tracking/${order.id}`} 
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  >
                    Suivre mon colis <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
             ))}
             
             {(!myOrders || myOrders.length === 0) && (
               <div className="col-span-full text-center py-24 opacity-20">
                  <Clock className="w-20 h-20 mx-auto mb-6" />
                  <p className="text-lg font-bold">Aucune commande en cours pour votre numéro.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}
