-- ==========================================
-- FRET-DZ : SCHÉMA SUPABASE & ARCHITECTURE
-- ==========================================

-- 1. Table A : Commerçants (Utilisateurs)
-- Cette table étend le système d'authentification natif de Supabase (auth.users)
CREATE TABLE public.commercants (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom_entreprise TEXT NOT NULL,
    telephone TEXT,
    adresse TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table B : Camionneurs (Ressources)
CREATE TABLE public.camionneurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Lien vers le compte utilisateur
    nom_complet TEXT NOT NULL,
    type_vehicule TEXT NOT NULL, -- Ex: Fourgon, Camion 10t, Semi-remorque
    capacite_max_kg INTEGER NOT NULL,
    wilaya_base TEXT NOT NULL,
    telephone TEXT, -- Téléphone pour contact
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table C : Expéditions (Interactions)
-- Relie les Commerçants (A) aux Camionneurs (B)
CREATE TABLE public.expeditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commercant_id UUID NOT NULL REFERENCES public.commercants(id) ON DELETE CASCADE,
    camionneur_id UUID NOT NULL REFERENCES public.camionneurs(id) ON DELETE CASCADE,
    description_marchandise TEXT NOT NULL,
    poids_kg INTEGER NOT NULL,
    wilaya_depart TEXT NOT NULL,
    wilaya_arrivee TEXT NOT NULL,
    fournisseur_nom TEXT NOT NULL,
    client_nom TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Récupéré', 'Transit', 'Livré')),
    date_depart DATE NOT NULL,
    fichier_livraison_url TEXT, -- Référence au fichier dans le bucket "livraisons"
    photo_livraison_url TEXT, -- URL de la photo de preuve de livraison
    current_location TEXT, -- Position actuelle mise à jour par le chauffeur
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- STORAGE : BUCKETS
-- ==========================================

-- Création du bucket "livraisons" pour les PDF/images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('livraisons', 'livraisons', true) 
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- SÉCURITÉ : ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Activation du RLS sur toutes les tables
ALTER TABLE public.commercants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camionneurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expeditions ENABLE ROW LEVEL SECURITY;

-- Politiques pour les Commerçants
CREATE POLICY "Les commerçants voient leur propre profil" 
ON public.commercants FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les commerçants modifient leur propre profil" 
ON public.commercants FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les Camionneurs
CREATE POLICY "Tout le monde peut voir les camionneurs" 
ON public.camionneurs FOR SELECT TO authenticated USING (true);

-- ==========================================
-- POLITIQUES EXPÉDITIONS (Strict RLS)
-- ==========================================
CREATE POLICY "SELECT: Commerçants et Camionneurs voient leurs expéditions" 
ON public.expeditions FOR SELECT 
TO authenticated 
USING (
    auth.uid() = commercant_id OR 
    camionneur_id IN (SELECT id FROM public.camionneurs WHERE user_id = auth.uid())
);

CREATE POLICY "INSERT: Commerçants créent leurs propres expéditions" 
ON public.expeditions FOR INSERT 
TO authenticated WITH CHECK (auth.uid() = commercant_id);

CREATE POLICY "UPDATE: Commerçants et Camionneurs modifient leurs expéditions" 
ON public.expeditions FOR UPDATE 
TO authenticated 
USING (
    auth.uid() = commercant_id OR 
    camionneur_id IN (SELECT id FROM public.camionneurs WHERE user_id = auth.uid())
);

-- ==========================================
-- POLITIQUES STORAGE (Dossier personnel)
-- ==========================================
-- Pour garantir que les utilisateurs ne puissent uploader que leurs propres fichiers,
-- on force le chemin du fichier à commencer par leur ID utilisateur. Exemple: {user_id}/fichier.pdf
CREATE POLICY "INSERT: Utilisateurs uploadent dans leur propre dossier" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'livraisons' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "SELECT: Utilisateurs voient leurs propres fichiers" 
ON storage.objects FOR SELECT TO authenticated 
USING (
    bucket_id = 'livraisons' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Trigger pour mettre à jour la date 'updated_at' des expéditions automatiquement
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expeditions_modtime
BEFORE UPDATE ON public.expeditions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
