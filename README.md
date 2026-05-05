# 🚛 Fret-DZ : Plateforme Logistique B2B Algérienne

**Projet de Fin de Module** : Architecture Cloud & Vibe Programming  
**Thème** : Logistique B2B (Fret-DZ)  
**Stack** : Next.js 15 + Supabase + Vercel

---

## 📊 Mapping du Thème Métier

Dans le cadre de ce projet, nous avons implémenté l'architecture suivante :

| Élément du Modèle | Implémentation dans Fret-DZ | Table SQL |
|-------------------|------------------------------|-----------|
| **Table A (Utilisateurs)** | **Commerçants** : Les entreprises qui expédient des marchandises | `public.commercants` |
| **Table B (Ressources)** | **Camionneurs** : Les transporteurs disponibles avec leurs véhicules | `public.camionneurs` |
| **Table C (Interactions)** | **Expéditions** : Les demandes de transport reliant un commerçant à un camionneur | `public.expeditions` |
| **Fichier (Storage)** | **Bon de livraison signé** : Document PDF ou image uploadé lors de la création d'une expédition | Bucket `livraisons` |

### Relations entre les tables :
```
commercants (1) ←→ (N) expeditions ←→ (1) camionneurs
     A                        C                    B
```

Chaque expédition lie un commerçant unique à un camionneur unique, avec un document de livraison associé.

---

## 🏗️ Analyse d'Architecture (500 mots)

### 1. Pourquoi Vercel + Supabase est financièrement plus logique qu'un serveur classique ?

L'utilisation de Vercel et Supabase présente un avantage économique majeur lié aux modèles **CAPEX** (Capital Expenditure) et **OPEX** (Operational Expenditure).

**Modèle traditionnel (Serveur physique - CAPEX)** :
- Investissement initial élevé : achat du matériel (serveur, stockage, onduleurs)
- Coûts fixes indépendants de l'utilisation réelle
- Maintenance matérielle et électricité mensuelles
- Dépréciation du matériel sur 3-5 ans
- Surprovisionnement nécessaire pour anticiper les pics de charge

**Modèle Cloud (Vercel + Supabase - OPEX)** :
- Zéro investissement initial : paiement à l'usage uniquement
- Coûts variables proportionnels au trafic réel
- Pas de maintenance matérielle à prévoir
- Scaling automatique selon les besoins
- Possibilité de commencer gratuitement (Free Tier)

Pour Fret-DZ, cela signifie qu'au lancement, avec 50 commerçants et 500 expéditions/mois, le coût est **quasi nul** (Free Tier Vercel + Supabase). Si le trafic explose à 10 000 expéditions/mois, l'infrastructure scale automatiquement sans intervention humaine, et le coût reste proportionnel aux revenus générés. Un serveur physique, lui, aurait nécessité un investissement de départ de ~200 000 DA même pour 10 utilisateurs.

---

### 2. Comment Vercel gère-t-il la scalabilité par rapport à un Data Center physique local ?

**Data Center physique (modèle traditionnel)** :
- **Scalabilité verticale limitée** : ajout de RAM/CPU sur les serveurs existants jusqu'à saturation
- **Scalabilité horizontale manuelle** : achat et configuration de nouveaux serveurs (délai de plusieurs semaines)
- **Infrastructure fixe** : climatisation surdimensionnée pour absorber les pics de chaleur, génératrices de secours, racks préalloués
- **Goulot d'étranglement humain** : intervention d'un sysadmin pour chaque changement d'infrastructure
- **Coût énergétique constant** : même avec 5% d'utilisation, la climatisation et les serveurs consomment 100% de leur capacité

**Vercel (Serverless - Edge Network)** :
- **Scaling horizontal automatique** : déploiement instantané de nouvelles instances (appelées "Serverless Functions") en quelques secondes lors d'un pic de trafic
- **Géo-réplication mondiale** : le code est dupliqué sur 40+ datacenters (appelés "Edge Locations") automatiquement, réduisant la latence pour les utilisateurs algériens, européens ou africains
- **Auto-scaling down** : si le trafic chute, les instances se désactivent automatiquement, réduisant les coûts à zéro
- **Pas de gestion climatisation/électricité** : Vercel (via AWS/GCP) gère les contraintes physiques (refroidissement, onduleurs, redondance réseau)

**Exemple concret pour Fret-DZ** :  
Lors de l'Aïd (pic saisonnier des expéditions), Vercel peut multiplier par 10 les instances serveur en 30 secondes. Un datacenter local nécessiterait d'avoir ces 10 serveurs allumés et climatisés 365 jours/an "au cas où", alors qu'ils ne servent que 15 jours par an.

---

### 3. Dans Fret-DZ, qu'est-ce qui représente la donnée Structurée et la donnée Non-structurée ?

**Données Structurées (PostgreSQL - Supabase)** :
Ce sont les informations stockées dans les tables relationnelles, avec un schéma fixe et des contraintes :
- **Table `commercants`** : nom_entreprise, téléphone, adresse (données textuelles organisées)
- **Table `camionneurs`** : nom_complet, type_vehicule, capacite_max_kg, wilaya_base (données typées et indexées)
- **Table `expeditions`** : poids_kg (INTEGER), date_depart (DATE), statut (ENUM), relations (FOREIGN KEYS)

Ces données sont **interrogeables via SQL**, peuvent être **filtrées, triées et agrégées** facilement (ex: "nombre d'expéditions par wilaya"), et bénéficient de l'**intégrité référentielle** (on ne peut pas créer une expédition sans camionneur existant).

**Données Non-structurées (Supabase Storage)** :
Ce sont les fichiers binaires sans schéma prévisible :
- **Bons de livraison signés** : PDFs scannés (taille variable, structure interne libre)
- **Photos de permis** (si ajoutées) : JPG/PNG sans métadonnées uniformes
- **Scans de contrats** : Formats hétérogènes (PDF de 1 page ou 20 pages)

Ces fichiers ne peuvent pas être interrogés en SQL. Ils sont accessibles via une **URL publique** (ex: `https://supabase.co/storage/v1/object/public/livraisons/{user_id}/bon.pdf`) et sont référencés dans la colonne `fichier_livraison_url` de la table structurée `expeditions`. Cela permet de lier les deux univers : la **métadonnée structurée** (qui, quoi, quand) pointe vers le **contenu non-structuré** (le document brut).

---

## 🚀 Déploiement

L'application est déployée sur Vercel avec CI/CD automatique :
- **Branche principale** : `main` → Déploiement automatique sur production
- **URL de production** : [https://fret-dz.vercel.app](https://fret-dz.vercel.app)

Chaque `git push` déclenche :
1. Build Next.js (vérification TypeScript + ESLint)
2. Optimisation des assets (images, CSS)
3. Déploiement sur le CDN Edge de Vercel
4. Invalidation du cache

---

## 🔐 Sécurité

- **Authentification** : Supabase Auth (email + password)
- **Row Level Security (RLS)** : Un commerçant ne voit QUE ses expéditions (isolation totale)
- **Storage Policies** : Un utilisateur ne peut uploader que dans son propre dossier (`{user_id}/`)

---

## 📧 Contact

**Développeurs** :  
- Mohammed Abdelghani Abadelia  : m_abadelia@estin.dz  
- Melissa Adjlane : m_adjlane@estin.dz
- Amine Ahmed Tigha : a_tigha@estin.dz
- Zineddine Ainas : z_ainas@estin.dz 

**Groupe** : 6
