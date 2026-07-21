import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Ensure user profile is synced to public.users table as a fallback
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        try {
          await supabase.from('users').upsert({
            id: user.id,
            email: user.email!,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            phone_number: user.user_metadata?.phone || '',
            area_of_interest: user.user_metadata?.area_of_interest || '',
          }, { onConflict: 'id' })
        } catch (err) {
          console.error('Error syncing user metadata in auth callback:', err)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}