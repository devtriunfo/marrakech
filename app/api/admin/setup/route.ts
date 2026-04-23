import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Use anon key to create user via signUp
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Create the user with signUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          is_admin: true
        }
      }
    })
    
    if (error) {
      console.error('[v0] Error creating user:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    // Check if user was created or already exists
    if (data.user?.identities?.length === 0) {
      return NextResponse.json({ 
        error: 'Este email já está cadastrado. Tente fazer login.' 
      }, { status: 400 })
    }
    
    console.log('[v0] User created successfully:', data.user?.email)
    return NextResponse.json({ 
      success: true, 
      user: data.user,
      needsConfirmation: !data.session // If no session, email confirmation is required
    })
  } catch (error) {
    console.error('[v0] Setup error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
