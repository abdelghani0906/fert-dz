'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowRight, UploadCloud, Loader2, CheckCircle2, 
  MapPin, Package, Phone, Building2, User, 
  Truck, Weight, Calendar, ChevronDown
} from 'lucide-react'

import { sendSMS, formatNewExpeditionSMS } from '@/lib/sms'

type Camionneur = {
  id: string
  nom_complet: string
  type_vehicule: string
  capacite_max_kg: number
  wilaya_base: string
  telephone?: string
}

type MerchantProfile = {
  nom_entreprise: string
  telephone: string
}

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra',
  'Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret',
  'Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda',
  'Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem',
  "M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj',
  'Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela',
  'Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane'
]

const inputClass = "w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all"
const selectClass = "w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"

export default function CreateExpeditionForm({ 
  camionneurs, 
  selectedCamionneurId,
  merchantProfile 
}: { 
  camionneurs: Camionneur[]
  selectedCamionneurId?: string
  merchantProfile?: MerchantProfile | null
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState(selectedCamionneurId ? 2 : 1)
  
  // Form State to keep data between steps
  const [formData, setFormData] = useState({
    camionneur_id: selectedCamionneurId || '',
    description_marchandise: '',
    poids_kg: '',
    wilaya_depart: '',
    wilaya_arrivee: '',
    date_depart: '',
    fournisseur_nom: merchantProfile?.nom_entreprise || '',
    fournisseur_tel: merchantProfile?.telephone || '',
    client_nom: '',
    client_tel: ''
  })

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.camionneur_id) {
        setStep(1)
        setError("Veuillez sélectionner un transporteur")
        return
    }
    
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Veuillez vous connecter')

      let fichier_url = null
      if (file) {
        const path = `${user.id}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage.from('livraisons').upload(path, file)
        if (uploadError) throw new Error(`Upload échoué: ${uploadError.message}`)
        const { data: { publicUrl } } = supabase.storage.from('livraisons').getPublicUrl(path)
        fichier_url = publicUrl
      }

      const { error: insertError } = await supabase.from('expeditions').insert({
        commercant_id: user.id,
        camionneur_id: formData.camionneur_id,
        description_marchandise: formData.description_marchandise,
        poids_kg: Number(formData.poids_kg),
        wilaya_depart: formData.wilaya_depart,
        wilaya_arrivee: formData.wilaya_arrivee,
        date_depart: formData.date_depart,
        fournisseur_nom: formData.fournisseur_nom,
        client_nom: formData.client_nom,
        fichier_livraison_url: fichier_url,
        statut: 'En attente'
      })

      if (insertError) throw new Error(insertError.message)

      // --- SMS Notification logic ---
      const selectedCamionneur = camionneurs.find(c => c.id === formData.camionneur_id)
      if (selectedCamionneur?.telephone) {
        const smsMessage = formatNewExpeditionSMS({
          description: formData.description_marchandise,
          wilaya_depart: formData.wilaya_depart,
          wilaya_arrivee: formData.wilaya_arrivee,
          fournisseur: formData.fournisseur_nom
        })
        
        // Trigger SMS (async, don't wait for it to finish for the UI response)
        sendSMS(selectedCamionneur.telephone, smsMessage).catch(console.error)
      }

      setSuccess(true)
      setTimeout(() => { router.push('/dashboard'); router.refresh() }, 2500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6" />
        <h3 className="text-3xl font-bold text-white mb-2">Expédition validée !</h3>
        <p className="text-gray-400">Redirection vers votre tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Steps Header */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step === s ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20' : 
              step > s ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-500'
            }`}>
              {step > s ? '✓' : s}
            </div>
            {s < 4 && <div className={`h-px flex-1 mx-2 ${step > s ? 'bg-emerald-500' : 'bg-white/5'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Trucker */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-bold text-white">Choisir un transporteur</h3>
          <div className="grid gap-3">
            {camionneurs.map(cam => (
              <label key={cam.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                formData.camionneur_id === cam.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}>
                <input type="radio" className="hidden" name="cam" checked={formData.camionneur_id === cam.id} onChange={() => updateForm('camionneur_id', cam.id)} />
                <Truck className={`w-6 h-6 ${formData.camionneur_id === cam.id ? 'text-indigo-400' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <p className="font-bold text-white">{cam.nom_complet}</p>
                  <p className="text-sm text-gray-500">{cam.type_vehicule} · {cam.wilaya_base}</p>
                </div>
                {formData.camionneur_id === cam.id && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
              </label>
            ))}
          </div>
          <button onClick={() => setStep(2)} disabled={!formData.camionneur_id} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all">
            Suivant
          </button>
        </div>
      )}

      {/* Step 2: Info */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-bold text-white">Détails de la marchandise</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Description</label>
              <input type="text" value={formData.description_marchandise} onChange={e => updateForm('description_marchandise', e.target.value)} placeholder="Ex: 10 Palettes de carrelage" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Poids (kg)</label>
                <input type="number" value={formData.poids_kg} onChange={e => updateForm('poids_kg', e.target.value)} placeholder="500" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date départ</label>
                <input type="date" value={formData.date_depart} onChange={e => updateForm('date_depart', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select value={formData.wilaya_depart} onChange={e => updateForm('wilaya_depart', e.target.value)} className={selectClass}>
                <option value="">Départ</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <select value={formData.wilaya_arrivee} onChange={e => updateForm('wilaya_arrivee', e.target.value)} className={selectClass}>
                <option value="">Arrivée</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold">Retour</button>
            <button onClick={() => setStep(3)} disabled={!formData.description_marchandise || !formData.wilaya_arrivee} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold">Suivant</button>
          </div>
        </div>
      )}

      {/* Step 3: Parties */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-bold text-white">Fournisseur & Client</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
              <p className="font-bold text-emerald-400 text-sm uppercase">Expéditeur (Fournisseur)</p>
              <input type="text" placeholder="Nom" value={formData.fournisseur_nom} onChange={e => updateForm('fournisseur_nom', e.target.value)} className={inputClass} />
              <input type="tel" placeholder="Téléphone" value={formData.fournisseur_tel} onChange={e => updateForm('fournisseur_tel', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
              <p className="font-bold text-purple-400 text-sm uppercase">Destinataire (Client)</p>
              <input type="text" placeholder="Nom" value={formData.client_nom} onChange={e => updateForm('client_nom', e.target.value)} className={inputClass} />
              <input type="tel" placeholder="Téléphone" value={formData.client_tel} onChange={e => updateForm('client_tel', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold">Retour</button>
            <button onClick={() => setStep(4)} disabled={!formData.client_nom} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold">Suivant</button>
          </div>
        </div>
      )}

      {/* Step 4: Submit */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h3 className="text-xl font-bold text-white">Confirmation & Document</h3>
          <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center hover:border-indigo-500/50 transition-all relative">
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
            <UploadCloud className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-300 font-medium">{file ? file.name : "Ajouter un bon de livraison (Optionnel)"}</p>
          </div>
          {error && <p className="p-4 bg-red-500/10 text-red-400 rounded-xl text-sm border border-red-500/20">{error}</p>}
          <div className="flex gap-4">
            <button onClick={() => setStep(3)} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-bold">Retour</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Confirmer la commande"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
