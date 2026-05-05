'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Package, Truck, Calendar, ExternalLink, Loader2, 
  FileText, MapPin, ArrowRight, Eye, CheckCircle2,
  Clock, AlertCircle, RefreshCw, User, Printer, Camera
} from 'lucide-react'
import Link from 'next/link'
import PrintLabel from '@/components/PrintLabel'

type Expedition = {
  id: string
  description_marchandise: string
  date_depart: string
  statut: 'En attente' | 'Récupéré' | 'Transit' | 'Livré'
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
  'Récupéré': {
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    icon: Package,
    dot: 'bg-indigo-400',
    progress: 35,
  },
  'Transit': {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: Truck,
    dot: 'bg-blue-400',
    progress: 65,
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
  const [statusFilter, setStatusFilter] = useState<'active' | 'delivered' | 'all'>('active')
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
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchExpeditions() }, [])

  const filteredExpeditions = expeditions.filter(exp => {
    const matchesSearch = 
      exp.description_marchandise.toLowerCase().includes(search.toLowerCase()) ||
      exp.id.toLowerCase().includes(search.toLowerCase()) ||
      exp.client_nom.toLowerCase().includes(search.toLowerCase())
    
    if (statusFilter === 'active') return matchesSearch && exp.statut !== 'Livré'
    if (statusFilter === 'delivered') return matchesSearch && exp.statut === 'Livré'
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#111111] border border-white/5 rounded-[32px] shadow-2xl">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Chargement de vos expéditions...</p>
      </div>
    )
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-[32px] shadow-2xl overflow-hidden relative">
      {/* Header & Tabs */}
      <div className="p-8 border-b border-white/5 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-400" />
              Suivi des Livraisons
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Gérez et suivez l'état de vos marchandises en temps réel.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group flex-1 md:flex-none">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-72 transition-all shadow-inner"
              />
            </div>
            <button onClick={fetchExpeditions} className="p-3.5 rounded-2xl border border-white/10 hover:bg-white/5 text-gray-500 hover:text-white transition-all shadow-lg active:scale-95">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 w-full sm:w-auto shadow-inner">
            <button 
              onClick={() => setStatusFilter('active')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === 'active' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-gray-500 hover:text-white'}`}
            >
              En cours ({expeditions.filter(e => e.statut !== 'Livré').length})
            </button>
            <button 
              onClick={() => setStatusFilter('delivered')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === 'delivered' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-gray-500 hover:text-white'}`}
            >
              Terminé ({expeditions.filter(e => e.statut === 'Livré').length})
            </button>
            <button 
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Tout
            </button>
          </div>

          <div className="flex border border-white/10 rounded-2xl overflow-hidden p-1.5 bg-black/40 shadow-inner">
            <button onClick={() => setView('cards')} className={`p-2.5 rounded-xl transition-all ${view === 'cards' ? 'bg-white/10 text-white' : 'text-gray-600'}`} title="Vue Cartes">
              <Package className="w-5 h-5" />
            </button>
            <button onClick={() => setView('table')} className={`p-2.5 rounded-xl transition-all ${view === 'table' ? 'bg-white/10 text-white' : 'text-gray-600'}`} title="Vue Tableau">
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {filteredExpeditions.length === 0 ? (
        <div className="px-8 py-24 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-white/5">
            <Package className="w-10 h-10 opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucune expédition trouvée</h3>
          <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
            {search ? "Aucun résultat ne correspond à votre recherche." : "Vous n'avez pas encore d'expéditions dans cette catégorie."}
          </p>
        </div>
      ) : view === 'cards' ? (
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          {filteredExpeditions.map((exp) => {
            const cfg = STATUS_CONFIG[exp.statut] || STATUS_CONFIG['En attente']
            const Icon = cfg.icon
            const cam = exp.camionneurs as any

            return (
              <div key={exp.id} className={`group relative border rounded-[32px] p-8 transition-all overflow-hidden ${exp.statut === 'Livré' ? 'bg-emerald-500/[0.02] border-emerald-500/10 hover:border-emerald-500/30' : 'bg-white/[0.02] border-white/5 hover:border-indigo-500/30'}`}>
                <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl border shadow-inner ${cfg.bg} ${cfg.border}`}>
                          <Icon className={`w-6 h-6 ${cfg.color}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight">{exp.description_marchandise}</h3>
                          <p className="text-[10px] text-gray-500 mt-1 font-mono tracking-widest uppercase font-bold">Réf: {exp.id.split('-')[0]}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <span className={`w-2 h-2 rounded-full ${cfg.dot} ${exp.statut === 'Transit' ? 'animate-pulse' : ''}`} />
                        {exp.statut}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-black/20 rounded-[24px] p-6 border border-white/5">
                      <div>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Destination</p>
                        <p className="font-bold text-white flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-500" /> {exp.wilaya_arrivee}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Livreur</p>
                        <p className="font-bold text-white flex items-center gap-2 italic">
                          <Truck className="w-4 h-4 text-indigo-400" /> {cam?.nom_complet || 'Non assigné'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1.5">Destinataire</p>
                        <p className="font-bold text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-400" /> {exp.client_nom}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-72 flex flex-col justify-between border-l border-white/5 lg:pl-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/tracking/${exp.id}`} target="_blank"
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                          <Eye className="w-3.5 h-3.5" /> Suivre
                        </Link>
                        
                        <button 
                          onClick={() => {
                            const element = document.getElementById(`print-label-${exp.id}`);
                            if (element) {
                              element.classList.remove('hidden');
                              window.print();
                              element.classList.add('hidden');
                            }
                          }}
                          className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10" title="Imprimer l'étiquette"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {(exp as any).photo_livraison_url && (
                          <a href={(exp as any).photo_livraison_url} target="_blank" rel="noopener noreferrer"
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl transition-all border border-emerald-500/20" title="Voir preuve de livraison">
                            <Camera className="w-4 h-4" />
                          </a>
                        )}

                        {exp.fichier_livraison_url && (
                          <a href={exp.fichier_livraison_url} target="_blank" rel="noopener noreferrer"
                            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all border border-white/10" title="Bon de livraison">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Hidden Label for Printing */}
                      <div className="hidden">
                        <PrintLabel exp={exp} />
                      </div>
                    </div>
                    <div className="mt-6 text-right">
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Poids Total</p>
                      <p className="text-2xl font-black text-white leading-none mt-1">{exp.poids_kg} <span className="text-xs text-gray-600 uppercase">kg</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/40 text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-white/5">
              <tr>
                <th className="px-8 py-5">Marchandise</th>
                <th className="px-8 py-5">Route</th>
                <th className="px-8 py-5">Client</th>
                <th className="px-8 py-5">Statut</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpeditions.map((exp) => {
                const cfg = STATUS_CONFIG[exp.statut] || STATUS_CONFIG['En attente']
                return (
                  <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{exp.description_marchandise}</p>
                      <p className="text-[10px] text-gray-600 font-mono mt-0.5 uppercase tracking-tighter">#{exp.id.split('-')[0]}</p>
                    </td>
                    <td className="px-8 py-6 text-gray-400">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span>{exp.wilaya_depart}</span>
                        <ArrowRight className="w-3 h-3 text-gray-700" />
                        <span className="text-indigo-400">{exp.wilaya_arrivee}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-medium text-gray-300">{exp.client_nom}</td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {exp.statut}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link href={`/tracking/${exp.id}`} target="_blank" className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl transition-all border border-indigo-500/20 inline-block">
                        <Eye className="w-4 h-4" />
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
