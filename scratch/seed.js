const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vknmnpkbyicvdvdwcgra.supabase.co';
const supabaseKey = 'sb_publishable__0Ya5zCdpYvDwazIfCpM8A_i8JEJgke';
const supabase = createClient(supabaseUrl, supabaseKey);

const camionneurs = [
  // Alger & Région
  { nom_complet: 'Ahmed Benali', type_vehicule: 'Fourgon Trafic', capacite_max_kg: 1500, wilaya_base: 'Alger', disponible: true },
  { nom_complet: 'Karim Meziane', type_vehicule: 'Camion 10 Tonnes', capacite_max_kg: 10000, wilaya_base: 'Alger', disponible: true },
  { nom_complet: 'Djamel Aouadi', type_vehicule: 'Semi-Remorque 40t', capacite_max_kg: 40000, wilaya_base: 'Alger', disponible: true },

  // Oran & Région
  { nom_complet: 'Sofiane Gharbi', type_vehicule: 'Camion Frigorifique', capacite_max_kg: 5000, wilaya_base: 'Oran', disponible: true },
  { nom_complet: 'Mohamed Bekhti', type_vehicule: 'Pick-up Benne', capacite_max_kg: 1200, wilaya_base: 'Oran', disponible: true },
  { nom_complet: 'Hicham Lagha', type_vehicule: 'Camion Citerne', capacite_max_kg: 20000, wilaya_base: 'Oran', disponible: true },

  // Constantine & Est
  { nom_complet: 'Yacine Ferhat', type_vehicule: 'Fourgon Transit', capacite_max_kg: 2000, wilaya_base: 'Constantine', disponible: true },
  { nom_complet: 'Rachid Boulahia', type_vehicule: 'Camion Plateau', capacite_max_kg: 8000, wilaya_base: 'Constantine', disponible: true },
  { nom_complet: 'Nabil Hamidi', type_vehicule: 'Semi-Remorque 40t', capacite_max_kg: 40000, wilaya_base: 'Annaba', disponible: true },
  { nom_complet: 'Tarek Chouiref', type_vehicule: 'Camion 5 Tonnes', capacite_max_kg: 5000, wilaya_base: 'Sétif', disponible: true },

  // Centre
  { nom_complet: 'Omar Touati', type_vehicule: 'Camion Frigorifique', capacite_max_kg: 7000, wilaya_base: 'Blida', disponible: true },
  { nom_complet: 'Mourad Belkacemi', type_vehicule: 'Camion Bétaillère', capacite_max_kg: 6000, wilaya_base: 'Médéa', disponible: true },
  { nom_complet: 'Abdelkader Chikhi', type_vehicule: 'Camion Plateau', capacite_max_kg: 12000, wilaya_base: 'Tizi Ouzou', disponible: true },
  { nom_complet: 'Farid Slimani', type_vehicule: 'Camionette', capacite_max_kg: 900, wilaya_base: 'Boumerdès', disponible: true },

  // Sud & Hauts Plateaux
  { nom_complet: 'Lotfi Mansouri', type_vehicule: 'Camion 10 Tonnes', capacite_max_kg: 10000, wilaya_base: 'Biskra', disponible: true },
  { nom_complet: 'Khaled Brahimi', type_vehicule: 'Camion Citerne', capacite_max_kg: 25000, wilaya_base: 'Ghardaïa', disponible: true },
  { nom_complet: 'Anis Benaissa', type_vehicule: 'Semi-Remorque 40t', capacite_max_kg: 40000, wilaya_base: 'Ouargla', disponible: true },
  { nom_complet: 'Sami Belouizdad', type_vehicule: 'Camion Benne', capacite_max_kg: 15000, wilaya_base: 'Batna', disponible: true },
  { nom_complet: 'Bilal Zerrouki', type_vehicule: 'Fourgon Trafic', capacite_max_kg: 1500, wilaya_base: 'Béjaïa', disponible: true },
  { nom_complet: 'Réda Amrani', type_vehicule: 'Camion 5 Tonnes', capacite_max_kg: 5000, wilaya_base: 'Tiaret', disponible: true },
];

async function seed() {
  console.log('🌱 Démarrage du seeding...');

  // Delete old data first
  const { error: deleteError } = await supabase.from('camionneurs').delete().gt('capacite_max_kg', 0);
  if (deleteError) {
    console.log('⚠️  Impossible de vider la table (RLS ou table manquante):', deleteError.message);
    console.log('→ Continuons quand même avec l\'insertion...');
  } else {
    console.log('🗑️  Anciens camionneurs supprimés.');
  }

  // Insert new data
  const { data, error } = await supabase.from('camionneurs').insert(camionneurs).select();

  if (error) {
    console.error('❌ Erreur insertion camionneurs:', error.message);
    console.error('Details:', error);
  } else {
    console.log(`✅ ${data.length} camionneurs insérés avec succès !`);
    console.log('\n📋 Résumé des données:');
    
    const wilayas = [...new Set(camionneurs.map(c => c.wilaya_base))];
    const vehicules = [...new Set(camionneurs.map(c => c.type_vehicule))];
    
    console.log(`   📍 Wilayas couvertes (${wilayas.length}): ${wilayas.join(', ')}`);
    console.log(`   🚚 Types de véhicules (${vehicules.length}): ${vehicules.join(', ')}`);
    console.log(`   👷 Chauffeurs enregistrés: ${data.length}`);
  }
}

seed();
