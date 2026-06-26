import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = cookies()
  cookieStore.delete('sintratel_token')
  cookieStore.delete('sintratel_refresh')
  return NextResponse.json({ success: true })
}
