'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  const role = data.user?.user_metadata?.role
  
  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'page')

  if (role === 'Fournisseur') redirect('/fournisseur')
  else if (role === 'Client') redirect('/client')
  else if (role === 'Livreur') redirect('/livreur')
  else redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nom_entreprise = formData.get('nom_entreprise') as string
  const telephone = formData.get('telephone') as string
  const role = formData.get('role') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: role || 'Commerçant',
        nom_entreprise,
        telephone
      }
    }
  })

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message))
  }

  const user = data.user
  if (user) {
    // Manually create the profile to ensure foreign keys work
    if (role === 'Livreur') {
      await supabase.from('camionneurs').insert({
        user_id: user.id,
        nom_complet: nom_entreprise || 'Nouveau Chauffeur',
        telephone: telephone,
        type_vehicule: 'Camionnette',
        disponible: true
      })
    } else {
      await supabase.from('commercants').insert({
        id: user.id,
        nom_entreprise: nom_entreprise,
        telephone: telephone,
        email: email
      })
    }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'page')
  
  if (role === 'Fournisseur') redirect('/fournisseur')
  else if (role === 'Client') redirect('/client')
  else if (role === 'Livreur') redirect('/livreur')
  else redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createExpedition(payload: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non autorisé')

  // Check if merchant profile exists, if not create it (Self-healing)
  const { data: merchant } = await supabase
    .from('commercants')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!merchant) {
    const { error: profileError } = await supabase.from('commercants').insert({
      id: user.id,
      nom_entreprise: user.user_metadata?.nom_entreprise || 'Entreprise',
      telephone: user.user_metadata?.telephone || ''
    })
    
    if (profileError) {
      throw new Error(`Erreur Création Profil: ${profileError.message} (Code: ${profileError.code})`)
    }
  }

  // 1. Insert into Database
  const { data, error } = await supabase.from('expeditions').insert({
    ...payload,
    commercant_id: user.id
  }).select().single()

  if (error) throw new Error(error.message)
  return data
}

