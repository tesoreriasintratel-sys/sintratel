import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'tesoreriasintratel@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Panel2026!'
const ADMIN_SECRET = process.env.ADMIN_TOKEN_SECRET ?? 'sintratel-secret-k9x2m7p4q8'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const { email, password } = JSON.parse(body)

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set('sintratel_token', ADMIN_SECRET, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    )
  }
}
