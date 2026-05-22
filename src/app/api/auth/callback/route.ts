import { NextResponse, NextRequest } from 'next/server'

/**
 * OAuth Callback — Pass-Through Version
 *
 * Instead of exchanging the code server-side (which requires cookies to propagate
 * from server → browser, a notoriously brittle step with @supabase/ssr), we
 * redirect the code directly to a client-side page that exchanges it in the
 * browser. This means the session is established entirely in the browser context
 * where @supabase/ssr can read its own cookies reliably.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (!code) {
    console.error('[Rec\'d Auth] No OAuth code in callback URL')
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  // Pass the code to the client-side exchange page.
  // The code verifier (stored in a browser cookie by signInWithOAuth) is still
  // available in the browser at this point, so the client-side exchange works.
  const params = new URLSearchParams()
  params.set('code', code)
  if (next) params.set('next', next)

  return NextResponse.redirect(`${origin}/auth/callback?${params.toString()}`)
}
