import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    if (!supabase) {
      console.error('[Rec\'d Auth] Supabase client could not be initialized');
      return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Use the request origin for redirects to ensure it matches the current domain
      const baseUrl = origin

      // Check if this user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()
      let destination = '/onboarding' // Default: new users go to onboarding
      
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
          console.log('[Rec\'d Auth] User is onboarded. Redirecting to /home');
          destination = '/home' // Returning onboarded users go straight to home
        } else {
          console.log('[Rec\'d Auth] User not onboarded. Redirecting to /onboarding');
        }
      }

      return NextResponse.redirect(`${baseUrl}${destination}`)
    }
  }

  // return the user to login page with an error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
