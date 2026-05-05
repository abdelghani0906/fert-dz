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

  // NOTE: No manual inserts here. 
  // Database Triggers will handle everything automatically to avoid conflicts.

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

  // 1. Insert into Database
  const { data, error } = await supabase.from('expeditions').insert({
    ...payload,
    commercant_id: user.id
  }).select().single()

  if (error) throw new Error(error.message)

  // 2. Send SMS Notification to the Client
  try {
    const { sendSMS, SMS_TEMPLATES } = await import('@/lib/sms')
    await sendSMS(
      payload.client_tel, 
      SMS_TEMPLATES.NEW_EXPEDITION(data.id.split('-')[0], payload.description_marchandise)
    )
  } catch (smsErr) {
    console.error('SMS Notification failed but expedition was created', smsErr)
  }

  return data
}
