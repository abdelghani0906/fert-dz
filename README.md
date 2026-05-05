# 🚛 Fret-Dz : Plateforme Logistique B2B Algérienne

Fret-Dz est une application web moderne conçue pour simplifier la logistique de transport de marchandises en Algérie. Elle connecte les commerçants (expéditeurs) avec des camionneurs vérifiés pour une gestion fluide des expéditions.

## 🚀 Fonctionnalités Clés

- **Tableau de Bord Commerçant** : Gestion complète des expéditions, suivi en temps réel et annuaire des transporteurs.
- **Espace Chauffeur** : Interface dédiée pour les chauffeurs afin de mettre à jour leur position et le statut des livraisons.
- **Suivi Public** : Page de tracking accessible via QR Code pour les clients finaux.
- **Sécurité Avancée** : Utilisation de Supabase Row Level Security (RLS) pour garantir la confidentialité des données.
- **Design Premium** : Interface moderne, responsive et optimisée pour une expérience utilisateur haut de gamme.

## 🛠️ Stack Technique

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router)
- **Base de données & Auth** : [Supabase](https://supabase.com/)
- **Styling** : Tailwind CSS
- **Icônes** : Lucide React
- **Notifications** : Intégration Twilio (Optionnel)

## 📦 Installation locale

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/votre-username/fret-dz.git
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement** :
   Créez un ملف `.env.local` et ajoutez vos clés Supabase :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

## 📧 Contact & Support

Pour toute question ou partenariat :
- **Email** : m_abadelia@estin.dz
- **Téléphone** : +213 779 891 743
- **Localisation** : Alger, Algérie 🇩🇿

---

## 🏛️ Architecture & Mapping (Rapport SI)

### 1. Mapping du Thème
*   **Thème** : Gestion logistique B2B (Mise en relation Commerçants - Transporteurs).
*   **Table A (Entité)** : `commercants` - Stocke les profils des entreprises expéditrices.
*   **Table B (Ressource)** : `camionneurs` - Liste des transporteurs et leurs véhicules disponibles.
*   **Table C (Interaction)** : `expeditions` - Table centrale liant un commerçant à un chauffeur pour un transport précis.
*   **Fichier (Stockage)** : Bucket Supabase `livraisons` - Stocke les preuves de livraison (photos) et documents PDF.

### 2. Analyse d'Architecture

#### Financièrement : OPEX vs CAPEX
Le choix de **Vercel + Supabase** transforme une dépense d'investissement (**CAPEX**) en dépense de fonctionnement (**OPEX**). Au lieu d'acheter des serveurs physiques, des onduleurs et de payer pour un espace climatisé (coûts initiaux élevés et risqués pour un lancement), nous utilisons un modèle *Pay-as-you-go*. Cela permet de lancer Fret-Dz avec un coût initial quasi nul, en ne payant que pour les ressources réellement consommées au fur et à mesure de la croissance.

#### Scalabilité : Cloud vs Data Center Local
Vercel gère la scalabilité de manière **automatique et serverless**. Contrairement à un Data Center local où une augmentation soudaine de trafic nécessiterait l'installation physique de nouveaux racks de serveurs et une gestion complexe de la climatisation/charge électrique, Vercel distribue l'application sur un réseau mondial (Edge). Si le nombre d'expéditions explose, l'infrastructure s'adapte instantanément sans intervention humaine, garantissant une disponibilité maximale.

#### Données Structurées vs Non-structurées
*   **Données Structurées** : Toutes les informations stockées dans les tables PostgreSQL de Supabase. Elles suivent un schéma strict (ex: le poids en `integer`, le statut de l'expédition, les clés étrangères).
*   **Données Non-structurées** : Les fichiers multimédias stockés dans le Storage (images des colis livrés, scans de bons de transport). Ces fichiers n'ont pas de format fixe analysable par SQL ; nous stockons uniquement leur chemin d'accès (URL) dans la base de données structurée.

---
*Développé avec ❤️ pour la logistique algérienne.*
