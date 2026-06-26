import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)

    const body = await request.json()
    const { nombre, email, telefono, empresa, mensaje } = body

    if (!nombre || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'SINTRATEL <onboarding@resend.dev>',
      to: ['tesoreriasintratel@gmail.com'],
      subject: `Nueva Solicitud de Afiliación - ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #003087; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">SINTRATEL</h1>
            <p style="color: #cce0ff; margin: 5px 0;">Nueva Solicitud de Afiliación</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Correo:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
            <p><strong>Empresa:</strong> ${empresa || 'No proporcionada'}</p>
            <p><strong>Mensaje:</strong> ${mensaje || 'Sin mensaje'}</p>
          </div>
          <div style="background: #003087; padding: 15px; text-align: center;">
            <p style="color: #cce0ff; margin: 0; font-size: 12px;">SINTRATEL - Sindicato de Trabajadores TIC</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', JSON.stringify(error))
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: data?.id })

  } catch (err: unknown) {
    console.error('Unexpected error:', err)
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
