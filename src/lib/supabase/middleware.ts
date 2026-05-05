import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/fournisseur') ||
    request.nextUrl.pathname.startsWith('/client')
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const role = user.user_metadata?.role || 'Commerçant'
    const path = request.nextUrl.pathname

    // Prevent access to wrong dashboard
    if (path.startsWith('/dashboard') && role !== 'Commerçant') {
      return NextResponse.redirect(new URL(role === 'Fournisseur' ? '/fournisseur' : '/client', request.url))
    }
    if (path.startsWith('/fournisseur') && role !== 'Fournisseur') {
      return NextResponse.redirect(new URL(role === 'Commerçant' ? '/dashboard' : '/client', request.url))
    }
    if (path.startsWith('/client') && role !== 'Client') {
      return NextResponse.redirect(new URL(role === 'Commerçant' ? '/dashboard' : '/fournisseur', request.url))
    }

    // Redirect away from login/register if already logged in
    if (path === '/login' || path === '/register') {
      if (role === 'Fournisseur') return NextResponse.redirect(new URL('/fournisseur', request.url))
      if (role === 'Client') return NextResponse.redirect(new URL('/client', request.url))
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}
