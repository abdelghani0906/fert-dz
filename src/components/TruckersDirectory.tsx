'use client'

import { useState } from 'react'
import { Truck, MapPin, Weight, Search, Package } from 'lucide-react'

type Camionneur = {
  id: string;
  nom_complet: string;
  telephone: string;
  type_vehicule: string;
  capacite_max_kg: number;
  wilaya_base: string;
  disponible: boolean;
}

export default function TruckersDirectory({ initialTruckers }: { initialTruckers: Camionneur[] }) {
  const [search, setSearch] = useState('')

  const filteredTruckers = initialTruckers.filter(cam => 
    cam.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
    cam.wilaya_base.toLowerCase().includes(search.toLowerCase()) ||
    cam.type_vehicule.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden mt-8">
      {/* Header with Search */}
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            Annuaire des Transporteurs
          </h2>
          <p className="text-sm text-gray-400 mt-1">Recherchez et réservez un transporteur pour vos colis.</p>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un chauffeur, wilaya..."
            className="bg-[#1a1a1a] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#161616] text-gray-400 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-medium">Chauffeur</th>
              <th className="px-6 py-4 font-medium">Téléphone</th>
              <th className="px-6 py-4 font-medium">Véhicule</th>
              <th className="px-6 py-4 font-medium">Capacité max</th>
              <th className="px-6 py-4 font-medium">Localisation</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTruckers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Truck className="w-12 h-12 mb-3 opacity-20" />
                    <p>Aucun transporteur ne correspond à votre recherche.</p>
                  </div>
                </td>
              </tr>
            )}
            {filteredTruckers.map((cam) => (
              <tr key={cam.id} className="hover:bg-white/[0.04] transition-colors group cursor-pointer relative">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                     <div className="font-medium text-white">{cam.nom_complet}</div>
                     <span className={`h-1.5 w-1.5 rounded-full ${cam.disponible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                     {cam.disponible ? 'Disponible' : 'En Course'}
                  </div>
                  <a href={`/dashboard/nouvelle-expedition?camionneurId=${cam.id}`} className="absolute inset-0 z-10" aria-label={`Réserver ${cam.nom_complet}`}></a>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-400">{cam.telephone || 'Non renseigné'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">
                    <Truck className="w-3.5 h-3.5" />
                    {cam.type_vehicule}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-gray-300">
                    <Weight className="w-4 h-4 text-gray-500" />
                    {cam.capacite_max_kg?.toLocaleString() || '0'} kg
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {cam.wilaya_base}
                  </span>
                </td>
                <td className="px-6 py-4 text-right relative z-20">
                  <span className="inline-block px-4 py-2 bg-indigo-600 group-hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
                    Réserver
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
