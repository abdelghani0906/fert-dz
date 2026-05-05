import { Mail, Phone, MapPin, Truck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Truck className="w-6 h-6 text-indigo-400" />
            Fret-Dz
          </div>
          <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
            La solution logistique moderne pour les entreprises algériennes. 
            Fiabilité, rapidité et transparence totale.
          </p>
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-widest">Contact Support</h4>
          <ul className="space-y-3">
            <li>
              <a href="tel:+213779891743" className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Phone className="w-4 h-4" />
                </div>
                +213 779 891 743
              </a>
            </li>
            <li>
              <a href="mailto:m_abadelia@estin.dz" className="flex items-center gap-3 text-gray-400 hover:text-indigo-400 transition-colors text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                  <Mail className="w-4 h-4" />
                </div>
                m_abadelia@estin.dz
              </a>
            </li>
            <li className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                <MapPin className="w-4 h-4" />
              </div>
              Alger, Algérie 🇩🇿
            </li>
          </ul>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-widest">Plateforme</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <a href="/login/livreur" className="text-gray-500 hover:text-white transition-colors">Espace Chauffeur</a>
            <a href="/tracking" className="text-gray-500 hover:text-white transition-colors">Suivi Public</a>
            <a href="/register" className="text-gray-500 hover:text-white transition-colors">Devenir Partenaire</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 uppercase font-black tracking-widest">
        <p>© 2026 FRET-DZ • TOUS DROITS RÉSERVÉS</p>
        <p>Design & Code by M. Abadelia</p>
      </div>
    </footer>
  )
}
