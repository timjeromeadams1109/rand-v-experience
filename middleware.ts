import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // Check for auth code in URL and handle email confirmation/password reset
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const type = searchParams.get('type')

  // If there's an auth code, exchange it for a session
  if (code && !request.nextUrl.pathname.startsWith('/auth/callback')) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Check if this is a password recovery flow
      if (type === 'recovery') {
        const redirectUrl = new URL('/auth/reset-password', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      // Regular email confirmation - redirect to home
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    } else {
      // Redirect to error page
      const redirectUrl = new URL('/auth/auth-error', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If there's an error from Supabase (like expired link), redirect to error page
  if (error === 'access_denied' && errorDescription) {
    const redirectUrl = new URL('/auth/auth-error', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Refresh session if it exists
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
