import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Get company with Moneybird credentials
    const { data: company } = await admin
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 404 })
    }

    if (!company.moneybird_access_token || !company.moneybird_admin_id) {
      return NextResponse.json({ 
        error: 'Moneybird niet gekoppeld',
        message: 'Koppel eerst Moneybird via de Integraties pagina'
      }, { status: 400 })
    }

    // Fetch sales invoices from Moneybird
    const baseUrl = `https://moneybird.com/api/v2/${company.moneybird_admin_id}`
    const headers = {
      'Authorization': `Bearer ${company.moneybird_access_token}`,
      'Content-Type': 'application/json',
    }

    // Fetch outstanding sales invoices
    const [salesRes, purchaseRes] = await Promise.all([
      fetch(`${baseUrl}/sales_invoices.json?filter=state:open`, { headers }),
      fetch(`${baseUrl}/purchase_invoices.json?filter=state:open`, { headers }),
    ])

    let imported = 0

    if (salesRes.ok) {
      const salesInvoices = await salesRes.json()
      
      for (const invoice of salesInvoices) {
        const dueDate = invoice.due_date || invoice.invoice_date
        if (!dueDate) continue

        // Upsert entry
        await admin.from('cashflow_entries').upsert({
          company_id: company.id,
          type: 'inkomst',
          bron: 'moneybird',
          omschrijving: invoice.contact?.company_name || invoice.reference || 'Verkoopfactuur',
          bedrag: parseFloat(invoice.total_price_incl_tax || 0),
          verwacht_op: dueDate,
          status: 'verwacht',
          factuur_id: invoice.id,
        }, {
          onConflict: 'factuur_id',
          ignoreDuplicates: false,
        })
        imported++
      }
    }

    if (purchaseRes.ok) {
      const purchaseInvoices = await purchaseRes.json()
      
      for (const invoice of purchaseInvoices) {
        const dueDate = invoice.due_date || invoice.date
        if (!dueDate) continue

        await admin.from('cashflow_entries').upsert({
          company_id: company.id,
          type: 'uitgave',
          bron: 'moneybird',
          omschrijving: invoice.contact?.company_name || 'Inkoopfactuur',
          bedrag: parseFloat(invoice.total_price_incl_tax || 0),
          verwacht_op: dueDate,
          status: 'verwacht',
          factuur_id: `purchase_${invoice.id}`,
        }, {
          onConflict: 'factuur_id',
          ignoreDuplicates: false,
        })
        imported++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${imported} facturen gesynchroniseerd vanuit Moneybird`,
      imported,
    })
  } catch (error) {
    console.error('Moneybird sync error:', error)
    return NextResponse.json({ error: 'Sync mislukt' }, { status: 500 })
  }
}
