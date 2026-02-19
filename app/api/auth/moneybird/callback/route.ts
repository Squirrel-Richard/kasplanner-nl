import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL('/integraties?error=moneybird_auth', process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://moneybird.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.MONEYBIRD_CLIENT_ID,
        client_secret: process.env.MONEYBIRD_CLIENT_SECRET,
        code,
        redirect_uri: process.env.NEXT_PUBLIC_MONEYBIRD_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      throw new Error('Token exchange failed')
    }

    const { access_token, refresh_token } = await tokenRes.json()

    // Get admin ID
    const adminRes = await fetch('https://moneybird.com/api/v2/administrations.json', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!adminRes.ok) {
      throw new Error('Failed to get administrations')
    }

    const admins = await adminRes.json()
    const adminId = admins[0]?.id

    // Save to company
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL('/integraties?error=not_logged_in', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    const admin = createAdminClient()
    await admin.from('companies').update({
      moneybird_access_token: access_token,
      moneybird_refresh_token: refresh_token,
      moneybird_admin_id: adminId,
    }).eq('user_id', user.id)

    return NextResponse.redirect(
      new URL('/integraties?success=moneybird_connected', process.env.NEXT_PUBLIC_APP_URL!)
    )
  } catch (error) {
    console.error('Moneybird OAuth error:', error)
    return NextResponse.redirect(
      new URL('/integraties?error=moneybird_failed', process.env.NEXT_PUBLIC_APP_URL!)
    )
  }
}
