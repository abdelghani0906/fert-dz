import { createClient } from '@/lib/supabase/server'
import CreateExpeditionForm from '@/components/CreateExpeditionForm'
import { Truck, PackagePlus } from 'lucide-react'
import Link from 'next/link'

export default async function NouvelleExpeditionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient()
  const { camionneurId } = await searchParams

  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch merchant profile for auto-fill
  const { data: profile } = await supabase
    .from('commercants')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: camionneurs } = await supabase
    .from('camionneurs')
    .select('id, nom_complet, type_vehicule, capacite_max_kg, wilaya_base, telephone')
    .eq('disponible', true)
    .order('wilaya_base', { ascending: true })

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <PackagePlus className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Nouvelle Expédition
            </h1>
          </div>
          <p className="text-gray-400 ml-[52px]">
            Suivez les étapes pour créer et confirmer votre expédition.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-white border border-white/10 px-4 py-2 rounded-xl transition-colors">
          ← Retour
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-2xl p-6 md:p-8">
        {camionneurs && camionneurs.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Aucun transporteur disponible</h3>
            <p className="text-gray-400 text-sm">Tous les camionneurs sont actuellement en mission.</p>
          </div>
        ) : (
          <CreateExpeditionForm 
            camionneurs={camionneurs || []} 
            selectedCamionneurId={camionneurId as string}
            merchantProfile={profile}
          />
        )}
      </div>
    </div>
  )
}
