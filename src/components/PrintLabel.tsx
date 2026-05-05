'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Package, MapPin, User, Truck, Phone } from 'lucide-react'

type PrintLabelProps = {
  exp: {
    id: string
    description_marchandise: string
    wilaya_depart: string
    wilaya_arrivee: string
    client_nom: string
    poids_kg: number
    fournisseur_nom: string
  }
}

export default function PrintLabel({ exp }: PrintLabelProps) {
  return (
    <div id={`print-label-${exp.id}`} className="hidden print:block p-8 bg-white text-black w-[100mm] min-h-[150mm] border-2 border-black mx-auto">
      <div className="flex flex-col h-full space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-black pb-4">
          <div>
            <h1 className="text-3xl font-black italic">FRET-DZ</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest">Extranet Logistique</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase">Réf. Expédition</p>
            <p className="text-xl font-black font-mono">#{exp.id.split('-')[0].toUpperCase()}</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="flex justify-center py-4">
          <QRCodeSVG value={`https://fret-dz.vercel.app/tracking/${exp.id}`} size={120} />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-2">
              <p className="text-[8px] font-black uppercase mb-1">Origine</p>
              <p className="text-lg font-black">{exp.wilaya_depart}</p>
            </div>
            <div className="border-2 border-black p-2 bg-black text-white">
              <p className="text-[8px] font-black uppercase mb-1">Destination</p>
              <p className="text-lg font-black">{exp.wilaya_arrivee}</p>
            </div>
          </div>

          <div className="border-2 border-black p-3 space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <p className="text-sm font-bold">Destinataire: {exp.client_nom}</p>
            </div>
            <div className="flex items-center gap-2 border-t border-black/10 pt-2">
              <Package className="w-4 h-4" />
              <p className="text-sm">Contenu: {exp.description_marchandise}</p>
            </div>
            <div className="flex items-center gap-2 border-t border-black/10 pt-2">
              <Truck className="w-4 h-4" />
              <p className="text-sm">Poids: {exp.poids_kg} KG</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t-2 border-black text-center">
          <p className="text-[10px] font-bold italic">Expédié par: {exp.fournisseur_nom}</p>
          <p className="text-[8px] mt-1 opacity-50">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  )
}
