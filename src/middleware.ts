import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase SSR middleware — required for @supabase/ssr v0.5+
 *
 * Without this, the browser-side Supabase client cannot read the session
 * cookies set by the OAuth callback, causing onAuthStateChange to fire with
 * no session and leaving the user permanently stuck on the loading spinner.
 *
 * This middleware runs on every request and:
 * 1. Refreshes expired access tokens using the refresh token cookie
 * 2. Writes the updated session back to cookies so client components can read it
 */
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
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

  // Refreshes the session — this is the critical step.
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Protected routes
  const protectedRoutes = ['/home', '/profile', '/settings', '/crew', '/watchlist', '/list', '/discover', '/explore', '/title', '/journal']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  
  if (!user && isProtectedRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Auth routes (redirect logged in users to home)
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(path)

  if (user && isAuthRoute) {
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (OAuth callback and auth API routes — must NOT be intercepted)
     * - auth/callback (deprecated client-side callback — must NOT be intercepted)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!api/auth|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
