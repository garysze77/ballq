import { NextResponse } from 'next/server'

const BACKEND_URL = 'http://ballq.gonggu.app'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const matchId = id
    const res = await fetch(`${BACKEND_URL}/sportsrc/votes/${matchId}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Backend error' }, { status: 500 })
  }
}
