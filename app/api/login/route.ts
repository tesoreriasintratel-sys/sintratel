import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const { email, password } = JSON.parse(body)

    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminSecret = process.env.ADMIN_TOKEN_SECRET

    if (!adminEmail || !adminPassword || !adminSecret) {
      return NextResponse.json({ error: 'Servidor no configurado correctamente' }, { status: 500 })
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('sintratel_token', adminSecret, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
