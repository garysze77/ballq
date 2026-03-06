import { NextResponse } from 'next/server'

const BACKEND_URL = 'http://172.104.99.225:8000'

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/hkjc`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Backend error' }, { status: 500 })
  }
}
