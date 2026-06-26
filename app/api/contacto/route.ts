import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    if (!body) return NextResponse.json({ error: 'Body vacío' }, { status: 400 })

    const { nombre, email, telefono, empresa, mensaje } = JSON.parse(body)

    if (!nombre || !email) {
      return NextResponse.json({ error: 'Nombre y correo son obligatorios' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Servicio de correo no configurado' }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 0; margin: 0;">
  <div style="max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #003087; padding: 28px 32px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">SINTRATEL</h1>
      <p style="color: #93C5FD; margin: 6px 0 0; font-size: 14px;">Nueva solicitud de afiliación</p>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111827; font-size: 18px; margin: 0 0 24px;">Datos del solicitante</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 14px; width: 40%;">Nombre completo</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 14px; font-weight: 600;">${nombre}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">Correo electrónico</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 14px; font-weight: 600;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">Teléfono</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 14px;">${telefono || 'No indicado'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">Empresa</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 14px;">${empresa || 'No indicada'}</td>
        </tr>
        ${mensaje ? `
        <tr>
          <td style="padding: 10px 0; color: #6B7280; font-size: 14px; vertical-align: top;">Mensaje</td>
          <td style="padding: 10px 0; color: #111827; font-size: 14px;">${mensaje.replace(/\n/g, '<br/>')}</td>
        </tr>` : ''}
      </table>
    </div>
    <div style="background: #F9FAFB; padding: 20px 32px; border-top: 1px solid #E5E7EB;">
      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
        Este mensaje fue enviado desde el formulario de contacto de
        <a href="https://sintratel-nine.vercel.app" style="color: #003087;">sintratel-nine.vercel.app</a>
      </p>
    </div>
  </div>
</body>
</html>`

    const { error } = await resend.emails.send({
      from: 'SINTRATEL <onboarding@resend.dev>',
      to: 'sintratelcolombia@gmail.com',
      replyTo: email,
      subject: `Nueva solicitud de afiliación - ${nombre}`,
      html,
    })

    if (error) {
      console.error('[POST /api/contacto] Resend error:', error)
      return NextResponse.json({ error: 'Error al enviar el correo' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/contacto] excepción:', err)
    return NextResponse.json({ error: `Error interno: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 })
  }
}
