import { createClient } from '@/lib/supabase/server'
import { Users, Truck, UserCircle, Building2, Phone, MapPin, Search, Mail } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function NetworkPage() {
  const supabase = await createClient()

  // Fetch all types of partners
  const { data: truckers } = await supabase.from('camionneurs').select('*')
  const { data: suppliers } = await supabase.from('fournisseurs').select('*')
  const { data: clients } = await supabase.from('clients').select('*')

  const totalPartners = (truckers?.length || 0) + (suppliers?.length || 0) + (clients?.length || 0)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-400" />
            Réseau Logistique
          </h1>
          <p className="text-gray-400 mt-1">
            Gérez vos relations avec les fournisseurs, transporteurs et clients.
          </p>
        </div>
        <div className="bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 text-indigo-400 font-bold text-sm">
          {totalPartners} Partenaires actifs
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un partenaire..." 
          className="w-full bg-[#111] border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Suppliers Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Fournisseurs ({suppliers?.length || 0})
          </h2>
          <div className="space-y-4">
            {suppliers?.map(s => (
              <div key={s.id} className="p-5 glass-card rounded-[24px] group">
                <p className="font-bold text-white group-hover:text-indigo-400 transition-colors text-lg tracking-tight">{s.nom_entreprise}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-3 bg-white/5 w-fit px-3 py-1.5 rounded-full">
                  <Phone className="w-3 h-3 text-indigo-400" /> {s.telephone || 'Non renseigné'}
                </div>
              </div>
            ))}
            {suppliers?.length === 0 && <p className="text-xs text-gray-600 italic">Aucun fournisseur enregistré.</p>}
          </div>
        </div>

        {/* Truckers Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Truck className="w-4 h-4" /> Transporteurs ({truckers?.length || 0})
          </h2>
          <div className="space-y-3">
            {truckers?.map(t => (
              <div key={t.id} className="p-4 bg-[#111] border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all group">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{t.nom_complet}</p>
                  <span className={`h-2 w-2 rounded-full ${t.disponible ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" /> {t.wilaya_base}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3" /> {t.telephone || '---'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clients Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
            <UserCircle className="w-4 h-4" /> Clients ({clients?.length || 0})
          </h2>
          <div className="space-y-3">
            {clients?.map(c => (
              <div key={c.id} className="p-4 bg-[#111] border border-white/5 rounded-2xl hover:border-amber-500/30 transition-all group">
                <p className="font-bold text-white group-hover:text-amber-400 transition-colors">{c.nom_entreprise}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Phone className="w-3 h-3" /> {c.telephone || 'Non renseigné'}
                </div>
              </div>
            ))}
            {clients?.length === 0 && <p className="text-xs text-gray-600 italic">Aucun client enregistré.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
