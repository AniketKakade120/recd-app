import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * OAuth Callback — Server-Side Code Exchange
 *
 * This is the ONLY route that exchanges the OAuth code for a session.
 * The exchange happens server-side so that session cookies are written
 * directly into the redirect response — no client-side exchange needed.
 *
 * Flow:
 *   /login → Google → Supabase → /api/auth/callback?code=XXX
 *   → exchangeCodeForSession (sets cookies) → redirect to /home
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  let next = requestUrl.searchParams.get('next') ?? '/home'

  // Prevent open-redirect attacks: only allow internal paths
  if (!next.startsWith('/')) {
    next = '/home'
  }

  if (!code) {
    console.error('[Rec\'d Auth] No OAuth code in callback URL')
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=missing_code`
    )
  }

  // Create a Supabase server client that reads/writes cookies on this response.
  // We build a NextResponse first, then attach cookies to it so they travel
  // with the final redirect.
  const response = NextResponse.redirect(`${requestUrl.origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Write cookies onto the outgoing redirect response
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Rec\'d Auth] OAuth code exchange failed:', error.message)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_callback_failed`
    )
  }

  console.log('[Rec\'d Auth] Code exchanged successfully. Redirecting to:', next)
  return response
}
