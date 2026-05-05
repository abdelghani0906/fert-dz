import { createClient } from '@/lib/supabase/server'
import { Truck, Package, ArrowRight, CheckCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function TransporteurPage() {
  const supabase = await createClient()

  // MOCK: Fetch all active expeditions for the demo
  // In a real app, the transporter would login and we filter by camionneur_id
  const { data: expeditions } = await supabase
    .from('expeditions')
    .select(`
      *,
      commercants (nom_entreprise)
    `)
    .order('created_at', { ascending: false })

  async function updateStatus(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const newStatus = formData.get('status') as string

    const supabaseAdmin = await createClient()
    await supabaseAdmin
      .from('expeditions')
      .update({ statut: newStatus })
      .eq('id', id)

    revalidatePath('/transporteur')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Truck className="w-6 h-6 text-amber-500" />
            Portail Transporteur
          </div>
          <div className="px-3 py-1 bg-amber-500/10 text-amber-500 text-sm rounded-full border border-amber-500/20">
            Mode Démo
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Missions Assignées</h1>
        <p className="text-gray-400 mb-8">Gérez le statut de vos livraisons en cours.</p>

        <div className="grid gap-4">
          {expeditions?.length === 0 && (
            <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/[0.01]">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Aucune mission pour le moment.</p>
            </div>
          )}

          {expeditions?.map(exp => (
            <div key={exp.id} className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                    exp.statut === 'En attente' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    exp.statut === 'Transit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {exp.statut}
                  </span>
                  <span className="text-gray-500 text-sm font-mono">{exp.id.split('-')[0]}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{exp.type_marchandise}</h3>
                <p className="text-gray-400 text-sm">Expéditeur: {exp.commercants.nom_entreprise}</p>
              </div>

              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 text-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Départ</p>
                  <p className="font-medium">{exp.ville_depart}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 shrink-0" />
                <div className="flex-1 text-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Arrivée</p>
                  <p className="font-medium">{exp.ville_arrivee}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
                {exp.statut === 'En attente' && (
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={exp.id} />
                    <input type="hidden" name="status" value="Transit" />
                    <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" /> Démarrer le Transit
                    </button>
                  </form>
                )}
                {exp.statut === 'Transit' && (
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={exp.id} />
                    <input type="hidden" name="status" value="Livré" />
                    <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Marquer comme Livré
                    </button>
                  </form>
                )}
                {exp.statut === 'Livré' && (
                  <div className="w-full px-4 py-2 bg-white/5 text-gray-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border border-white/5">
                    <CheckCircle className="w-4 h-4" /> Mission Terminée
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
