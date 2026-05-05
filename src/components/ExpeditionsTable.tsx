'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Package, Truck, Calendar, ExternalLink, Loader2, 
  FileText, MapPin, ArrowRight, Eye, CheckCircle2,
  Clock, AlertCircle, RefreshCw, User, Printer
} from 'lucide-react'
import Link from 'next/link'

type Expedition = {
  id: string
  description_marchandise: string
  date_depart: string
  statut: 'En attente' | 'Transit' | 'Livré'
  fichier_livraison_url: string | null
  wilaya_depart: string
  wilaya_arrivee: string
  fournisseur_nom: string
  client_nom: string
  poids_kg: number
  camionneurs: { nom_complet: string; type_vehicule: string } | null
}

const STATUS_CONFIG = {
  'En attente': {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: Clock,
    dot: 'bg-yellow-500',
    progress: 10,
  },
  'Transit': {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: Truck,
    dot: 'bg-blue-400',
    progress: 55,
  },
  'Livré': {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
    dot: 'bg-emerald-400',
    progress: 100,
  },
}

export default function ExpeditionsTable() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'table' | 'cards'>('cards')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchExpeditions() {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: fetchError } = await supabase
        .from('expeditions')
        .select(`
          id, description_marchandise, date_depart, statut, 
          fichier_livraison_url, wilaya_depart, wilaya_arrivee,
          fournisseur_nom, client_nom, poids_kg,
          camionneurs(nom_complet, type_vehicule)
        `)
        .eq('commercant_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setExpeditions((data as any) || [])
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || 'Une erreur est survenue lors du chargement.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchExpeditions() }, [])

  const filteredExpeditions = expeditions.filter(exp => 
    exp.description_marchandise.toLowerCase().includes(search.toLowerCase()) ||
    exp.id.toLowerCase().includes(search.toLowerCase()) ||
    exp.client_nom.toLowerCase().includes(search.toLowerCase()) ||
    exp.wilaya_depart.toLowerCase().includes(search.toLowerCase()) ||
    exp.wilaya_arrivee.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-[#111111] border border-white/5 rounded-2xl shadow-xl">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-400">Chargement des expéditions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-2xl text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-white font-bold mb-2">Erreur de chargement</h3>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button onClick={fetchExpeditions} className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all">
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            Suivi des Livraisons
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {filteredExpeditions.length} expédition{filteredExpeditions.length !== 1 ? 's' : ''} trouvée(s)
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Package className="h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher une expédition, client..."
              className="bg-[#1a1a1a] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={fetchExpeditions} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Actualiser">
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setView('cards')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'cards' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-white'}`}>
                Cartes
              </button>
              <button onClick={() => setView('table')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'table' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-white'}`}>
                Tableau
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredExpeditions.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Package className="w-14 h-14 mx-auto mb-4 opacity-10" />
          <h3 className="text-white font-semibold mb-1">Aucune expédition</h3>
          <p className="text-gray-500 text-sm">Créeز votre première expédition pour commencer.</p>
          <Link href="/dashboard/nouvelle-expedition" className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
            Nouvelle expédition <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : view === 'cards' ? (
        /* CARDS VIEW */
        <div className="p-6 grid gap-4">
          {filteredExpeditions.map((exp) => {
            const cfg = STATUS_CONFIG[exp.statut] || STATUS_CONFIG['En attente']
            const Icon = cfg.icon
            const cam = exp.camionneurs as any

            return (
              <div key={exp.id} className="group relative border border-white/5 rounded-2xl p-6 transition-all bg-gradient-to-br from-[#0d0d0d] to-[#121212] hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5">
                {/* Glow Effect */}
                <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl border ${cfg.bg} ${cfg.border} shrink-0 shadow-inner`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight tracking-tight group-hover:text-indigo-300 transition-colors">{exp.description_marchandise}</h3>
                        <p className="text-xs text-gray-500 mt-1 font-mono tracking-widest uppercase">ID: {exp.id.split('-')[0]}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`}>
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} ${exp.statut === 'Transit' ? 'animate-pulse' : ''}`} />
                      {exp.statut}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase tracking-tighter mb-2 px-1">
                      <span className={exp.statut === 'En attente' ? 'text-yellow-500' : ''}>Préparation</span>
                      <span className={exp.statut === 'Transit' ? 'text-blue-400' : ''}>En Route</span>
                      <span className={exp.statut === 'Livré' ? 'text-emerald-400' : ''}>Terminé</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full p-0.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)] ${exp.statut === 'Livré' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : exp.statut === 'Transit' ? 'bg-gradient-to-r from-blue-500 to-indigo-400' : 'bg-gradient-to-r from-yellow-500 to-orange-400'}`}
                        style={{ width: `${cfg.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Route Visual */}
                  <div className="flex items-center gap-4 mb-6 bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Origine</p>
                      <p className="font-bold text-white text-sm">{exp.wilaya_depart}</p>
                    </div>
                    <div className="flex-[2] flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent relative">
                        <Truck className="w-5 h-5 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d0d0d] px-1 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Destination</p>
                      <p className="font-bold text-indigo-400 text-sm">{exp.wilaya_arrivee}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center border border-gray-500/20 shrink-0">
                        <Truck className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Livreur</p>
                        <p className="text-gray-200 font-semibold truncate text-sm">{cam?.nom_complet || 'En attente'}</p>
                      </div>
                    </div>
                    <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                        <User className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Destinataire</p>
                        <p className="text-gray-200 font-semibold truncate text-sm">{exp.client_nom}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Link href={`/tracking/${exp.id}`} target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        <Eye className="w-3.5 h-3.5" /> Suivre
                      </Link>
                      <button 
                        onClick={() => window.print()}
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10" title="Imprimer l'étiquette"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {exp.fichier_livraison_url && (
                        <a href={exp.fichier_livraison_url} target="_blank" rel="noopener noreferrer"
                          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10" title="Bon de livraison">
                          <FileText className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Poids Brut</p>
                      <p className="text-white font-black text-sm">{exp.poids_kg.toLocaleString()} <span className="text-gray-500 text-[10px]">KG</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#161616] text-gray-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Marchandise</th>
                <th className="px-6 py-4 font-medium">Trajet</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpeditions.map((exp) => {
                const cfg = STATUS_CONFIG[exp.statut] || STATUS_CONFIG['En attente']
                return (
                  <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{exp.description_marchandise}</p>
                      <p className="text-xs text-gray-600 font-mono">#{exp.id.split('-')[0].toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <span className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3 h-3 text-gray-500" />{exp.wilaya_depart}
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <MapPin className="w-3 h-3 text-indigo-400" />{exp.wilaya_arrivee}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{exp.client_nom}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{new Date(exp.date_depart).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {exp.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/tracking/${exp.id}`} target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium transition-colors border border-indigo-500/20">
                        <Eye className="w-3.5 h-3.5" /> Suivre
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
