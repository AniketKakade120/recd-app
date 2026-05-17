import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    // 1. Create a redirect response object immediately so we can write cookies directly to it
    const response = NextResponse.redirect(`${origin}${next || '/home'}`)
    
    // 2. Initialize createServerClient with direct mapping to request cookies and response cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return Array.from(request.cookies.getAll()).map(({ name, value }) => ({ name, value }))
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // 3. Exchange OAuth code for active session (this will set the cookies on the response object)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 4. Check if this user has completed onboarding to decide the final destination
      const { data: { user } } = await supabase.auth.getUser()
      let destination = '/onboarding'
      
      if (user) {
        console.log(`[Rec'd Auth] Checking profile for user: ${user.id}`);
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()
        
        if (fetchError) {
          console.warn(`[Rec'd Auth] Profile fetch error: ${fetchError.message}`);
        }

        if (profile?.onboarding_completed) {
          const redirectDestination = next || '/home';
          console.log(`[Rec'd Auth] User is onboarded. Redirecting to: ${redirectDestination}`);
          destination = redirectDestination; // Returning onboarded users go straight to next or home
        } else {
          console.log('[Rec\'d Auth] User not onboarded. Redirecting to /onboarding');
          destination = next ? `/onboarding?next=${encodeURIComponent(next)}` : '/onboarding';
        }
      }

      // 5. Update the Location header on our response object to redirect to the correct destination
      response.headers.set('Location', `${origin}${destination}`)
      return response
    }
    
    console.error('[Rec\'d Auth] Code exchange failed:', error.message)
  }

  // Return the user to login page with an error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
