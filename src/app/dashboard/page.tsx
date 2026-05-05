import { createClient } from '@/lib/supabase/server'
import { Package, Truck, CheckCircle, Clock, MapPin, Weight } from 'lucide-react'
import ExpeditionsTable from '@/components/ExpeditionsTable'
import TruckersDirectory from '@/components/TruckersDirectory'
import Link from 'next/link'

export const dynamic = "force-dynamic"
export const revalidate = 0

// Define types for our data
type Camionneur = {
  id: string;
  nom_complet: string;
  telephone: string;
  type_vehicule: string;
  capacite_max_kg: number;
  wilaya_base: string;
  disponible: boolean;
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Fetch merchant profile
  const { data: profile } = await supabase
    .from('commercants')
    .select('nom_entreprise')
    .eq('id', user?.id)
    .single()

  // 3. Fetch KPI data
  const { data: expeditions, error: expError } = await supabase
    .from('expeditions')
    .select('statut')
    .eq('commercant_id', user?.id)
    
  const activeExpeditions = expeditions?.filter(e => e.statut === 'En attente' || e.statut === 'Transit').length || 0
  const completedExpeditions = expeditions?.filter(e => e.statut === 'Livré').length || 0
  const totalExpeditions = expeditions?.length || 0

  // 4. Fetch Available Truckers
  const { data: camionneurs, error: camError } = await supabase
    .from('camionneurs')
    .select('*')
    .eq('disponible', true)
    .order('created_at', { ascending: false }) as { data: Camionneur[] | null, error: any }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Tableau de Bord
          </h1>
          <p className="text-gray-400 mt-1">
            Gérez votre logistique et trouvez des transporteurs en temps réel.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/nouveau-camionneur" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-sm font-medium transition-all">
            <Truck className="w-4 h-4 text-indigo-400" />
            Ajouter un Livreur
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            {profile?.nom_entreprise || 'Sans nom'} ({user?.user_metadata?.role || 'Commerçant'})
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 shadow-xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Package className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Toutes vos Expéditions</p>
            <p className="text-3xl font-bold text-white">{totalExpeditions}</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 shadow-xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">En cours / Transit</p>
            <p className="text-3xl font-bold text-white">{activeExpeditions}</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-white/5 shadow-xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400">Livrées (Historique)</p>
            <p className="text-3xl font-bold text-white">{completedExpeditions}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area - Expeditions Tracking Table */}
      <ExpeditionsTable />

      {/* Available Truckers with Search Filter */}
      <TruckersDirectory initialTruckers={camionneurs || []} />
    </div>
  )
}
