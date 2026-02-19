import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// e-Boekhouden uses a SOAP API
// This implementation uses their REST/XML endpoint
async function eboekhoudenRequest(
  method: string,
  username: string,
  securityCode: string,
  body: string
): Promise<string> {
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${method} xmlns="https://www.e-boekhouden.nl/bh">
      ${body}
    </${method}>
  </soap:Body>
</soap:Envelope>`

  const res = await fetch(process.env.EBOEKHOUDEN_API_URL || 'https://soap.e-boekhouden.nl/bh.asmx', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `https://www.e-boekhouden.nl/bh/${method}`,
    },
    body: soapEnvelope,
  })

  return res.text()
}

function extractXMLValue(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's'))
  return match?.[1] || ''
}

function extractXMLArray(xml: string, tag: string): string[] {
  const matches = xml.matchAll(new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gs'))
  return Array.from(matches, m => m[1])
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: company } = await admin
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!company?.eboekhouden_username || !company?.eboekhouden_security_code) {
      return NextResponse.json({
        error: 'e-Boekhouden niet gekoppeld',
        message: 'Voer je gebruikersnaam en security code in via Integraties'
      }, { status: 400 })
    }

    // Open session
    const sessionXml = await eboekhoudenRequest(
      'OpenSession',
      company.eboekhouden_username,
      company.eboekhouden_security_code,
      `<Username>${company.eboekhouden_username}</Username>
       <SecurityCode1>${company.eboekhouden_security_code}</SecurityCode1>
       <SecurityCode2></SecurityCode2>`
    )

    const sessionId = extractXMLValue(sessionXml, 'SessionID')
    if (!sessionId) {
      return NextResponse.json({ error: 'Inloggen bij e-Boekhouden mislukt' }, { status: 401 })
    }

    // Get open posts (open debiteuren/crediteuren)
    const postsXml = await eboekhoudenRequest(
      'GetOpenPosten',
      company.eboekhouden_username,
      company.eboekhouden_security_code,
      `<SessionID>${sessionId}</SessionID>
       <SecurityCode2></SecurityCode2>
       <cFilter>
         <DatumVan></DatumVan>
         <DatumTm></DatumTm>
       </cFilter>`
    )

    // Close session
    await eboekhoudenRequest(
      'CloseSession',
      company.eboekhouden_username,
      company.eboekhouden_security_code,
      `<SessionID>${sessionId}</SessionID>`
    )

    // Parse open posts
    const posts = extractXMLArray(postsXml, 'cOpenPost')
    let imported = 0

    for (const post of posts) {
      const relatie = extractXMLValue(post, 'Relatie')
      const bedrag = parseFloat(extractXMLValue(post, 'Bedrag') || '0')
      const datum = extractXMLValue(post, 'Datum')
      const soort = extractXMLValue(post, 'Soort') // D = Debiteur, C = Crediteur
      const factuurNummer = extractXMLValue(post, 'Factuurnummer')

      if (!datum || isNaN(bedrag)) continue

      const formattedDate = datum.match(/\d{4}-\d{2}-\d{2}/)
        ? datum.substring(0, 10)
        : new Date(datum).toISOString().substring(0, 10)

      await admin.from('cashflow_entries').upsert({
        company_id: company.id,
        type: soort === 'D' ? 'inkomst' : 'uitgave',
        bron: 'eboekhouden',
        omschrijving: relatie || 'e-Boekhouden post',
        bedrag: Math.abs(bedrag),
        verwacht_op: formattedDate,
        status: 'verwacht',
        factuur_id: `eb_${factuurNummer || Date.now()}`,
      }, {
        onConflict: 'factuur_id',
        ignoreDuplicates: false,
      })
      imported++
    }

    return NextResponse.json({
      success: true,
      message: `${imported} openstaande posten gesynchroniseerd vanuit e-Boekhouden`,
      imported,
    })
  } catch (error) {
    console.error('e-Boekhouden sync error:', error)
    return NextResponse.json({ error: 'Sync mislukt', details: String(error) }, { status: 500 })
  }
}
