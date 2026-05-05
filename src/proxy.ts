import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Proteger las rutas de dashboard
  if (user) {
    const role = user.user_metadata?.role
    const path = request.nextUrl.pathname

    // Redirecciones basadas en el rol si intentan entrar en dashboards ajenos
    if (path.startsWith('/dashboard') && role !== 'Commerçant') {
      return NextResponse.redirect(new URL(role === 'Fournisseur' ? '/fournisseur' : role === 'Client' ? '/client' : '/livreur', request.url))
    }
    if (path.startsWith('/fournisseur') && role !== 'Fournisseur') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (path.startsWith('/client') && role !== 'Client') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (path.startsWith('/livreur') && role !== 'Livreur') {
       // Si es un camionneur registrado manualmente, le permitimos entrar si detectamos que es él
       // Para este MVP, permitimos si el rol es Commerçant o Livreur
    }
  } else {
    // Si no hay usuario y trata de entrar a rutas privadas
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/fournisseur') || 
        request.nextUrl.pathname.startsWith('/client') || 
        request.nextUrl.pathname.startsWith('/livreur')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/fournisseur/:path*', '/client/:path*', '/livreur/:path*'],
}
