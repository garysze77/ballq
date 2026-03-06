import { NextResponse } from 'next/server'

const BACKEND_URL = 'http://172.104.99.225:8000'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Extract numeric ID from the URL (e.g., "stade-lavallois-guingamp-14064721" -> "14064721")
    const matchId = id.replace(/.*-(\d+)$/, '$1')
    const res = await fetch(`${BACKEND_URL}/sportsrc/detail/${matchId}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Backend error' }, { status: 500 })
  }
}
