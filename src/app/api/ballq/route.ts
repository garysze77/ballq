import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ballq.gonggu.app';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }
  
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to fetch', 
      details: error.message 
    }, { status: 500 });
  }
}
