import { createClient } from '@/lib/supabase/server'
import { Package, MapPin, Truck, CheckCircle2, Clock, Calendar, ArrowLeft, Info, QrCode, Printer, User, Phone, Star } from 'lucide-react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

export const dynamic = "force-dynamic"

export default async function TrackingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient(true) // BYPASS RLS for public tracking access

  // S-grade Optimized Query: Search by ID directly (Blazing Fast)
  const { data: exp, error: fetchError } = await supabase
    .from('expeditions')
    .select(`
      *,
      commercants (nom_entreprise, telephone),
      camionneurs (nom_complet, type_vehicule, telephone)
    `)
    .eq('id', resolvedParams.id) // Direct UUID matching
    .maybeSingle()

  if (fetchError || !exp) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <Package className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Code Invalide</h1>
        <p className="text-gray-500 max-w-md">Aucune expédition trouvée pour ce numéro.</p>
        <div className="bg-white/5 p-3 rounded-lg mt-4 font-mono text-indigo-400 text-xs">{resolvedParams.id}</div>
        <Link href="/tracking" className="mt-8 px-6 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          Réessayer
        </Link>
      </div>
    )
  }

  const stages = [
    { label: 'Enregistré', status: 'En attente', desc: 'Commande enregistrée' },
    { label: 'Récupéré', status: 'Récupéré', desc: 'Sائق استلم السلعة' },
    { label: 'En Transit', status: 'Transit', desc: 'En route vers destination' },
    { label: 'Livré', status: 'Livré', desc: 'Livraison effectuée' }
  ]

  const currentStageIndex = stages.findIndex(s => s.status === exp.statut)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-6">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
        <Link href="/tracking" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
             <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                   <div>
                      <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/20 mb-4 inline-block">
                         {exp.statut}
                      </span>
                      <h2 className="text-4xl font-black tracking-tighter font-mono">{exp.id.split('-')[0].toUpperCase()}</h2>
                   </div>
                   <div className="p-4 bg-white rounded-3xl">
                      <QRCodeSVG value={`https://fret-dz.vercel.app/tracking/${exp.id}`} size={80} />
                   </div>
                </div>

                <div className="space-y-12">
                  <div className="relative pl-12 border-l-2 border-dashed border-white/5 ml-4">
                     <div className="absolute -left-[11px] top-1 w-5 h-5 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1.5 animate-ping" />
                     </div>
                     <div>
                        <p className="font-bold text-indigo-400 uppercase text-[10px] tracking-widest mb-1">Position Actuelle</p>
                        <p className="text-xl font-black text-white flex items-center gap-2">
                           <MapPin className="w-5 h-5 text-emerald-500" />
                           {exp.current_location || exp.wilaya_depart}
                        </p>
                     </div>
                  </div>

                  <div className="space-y-8">
                    {stages.map((stage, idx) => (
                      <div key={idx} className={`relative pl-12 ${idx > currentStageIndex ? 'opacity-20' : 'opacity-100'}`}>
                        <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-[#111] flex items-center justify-center ${idx <= currentStageIndex ? 'bg-indigo-500 text-white' : 'bg-[#1a1a1a] text-gray-700'}`}>
                          {idx < currentStageIndex ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                        </div>
                        <p className="font-bold text-sm">{stage.label}</p>
                        <p className="text-[10px] text-gray-500">{stage.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-[#111] border border-white/5 rounded-[32px] p-6 shadow-xl">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-indigo-400">Détails Colis</h3>
                <div className="space-y-4">
                   <div>
                      <p className="text-[9px] text-gray-500 uppercase font-black">Marchandise</p>
                      <p className="font-bold text-sm">{exp.description_marchandise}</p>
                   </div>
                   <div className="pt-4 border-t border-white/5 flex justify-between">
                      <div>
                         <p className="text-[9px] text-gray-500 uppercase font-black">Poids</p>
                         <p className="font-bold text-sm">{exp.poids_kg} kg</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] text-gray-500 uppercase font-black">Départ</p>
                         <p className="font-bold text-sm">{exp.wilaya_depart}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-indigo-600 rounded-[32px] p-6 shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-3xl -mr-12 -mt-12" />
                
                <h4 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Phone className="w-4 h-4" /> 
                   Assistance Directe
                </h4>
                
                <div className="space-y-4 relative z-10">
                   {/* Livreur Info */}
                   <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                      <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Transporteur / Livreur</p>
                      {exp.camionneurs ? (
                        <>
                          <p className="font-bold text-sm mb-2">{exp.camionneurs.nom_complet}</p>
                          <a href={`tel:${exp.camionneurs.telephone}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-lg">
                             <Phone className="w-3.5 h-3.5" />
                             {exp.camionneurs.telephone}
                          </a>
                        </>
                      ) : (
                        <p className="text-xs text-indigo-200/50 italic">En attente d'attribution...</p>
                      )}
                   </div>

                   {/* Fournisseur Info */}
                   <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                      <p className="text-[10px] font-black uppercase text-indigo-200 mb-1">Expéditeur (Fournisseur)</p>
                      <p className="font-bold text-sm mb-2">{exp.commercants?.nom_entreprise || 'Fret-Dz Partner'}</p>
                      {exp.commercants?.telephone ? (
                        <a href={`tel:${exp.commercants.telephone}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold transition-transform active:scale-95 border border-white/10">
                           <Phone className="w-3.5 h-3.5" />
                           {exp.commercants.telephone}
                        </a>
                      ) : (
                        <p className="text-xs text-indigo-200/50 italic">Numéro non disponible</p>
                      )}
                   </div>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  )
}
