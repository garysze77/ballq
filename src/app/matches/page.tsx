'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Match {
  position: number
  name: string
  league: string
  home_team: string
  away_team: string
  start_date: string
  prediction?: string
  hkjc_json?: string
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch('/api/db/matches')
        const data = await res.json()
        
        if (data.success && data.data) {
          setMatches(data.data)
        } else {
          setError('Failed to load matches')
        }
      } catch (err) {
        setError('Error loading matches')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMatches()
    const interval = setInterval(fetchMatches, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-TW', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return dateStr
    }
  }

  const parseHKJC = (hkjcStr?: string) => {
    if (!hkjcStr) return null
    try {
      return JSON.parse(hkjcStr)
    } catch {
      return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">BallQ</Link>
          <nav className="space-x-4">
            <Link href="/matches" className="underline">賽事</Link>
            <Link href="/dashboard">用戶中心</Link>
            <Link href="/login">登入</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">今日賽事</h2>
        
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-600">{matches.length} 場賽事</p>
            
            <div className="grid gap-4">
              {matches.map((match) => {
                const hkjc = parseHKJC(match.hkjc_json)
                const had = hkjc?.HAD?.selections || []
                
                return (
                  <div key={match.position} className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">{match.league}</p>
                        <p className="text-lg font-semibold">
                          {match.home_team} vs {match.away_team}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(match.start_date)}</p>
                        {match.prediction && (
                          <p className="text-sm text-green-600 mt-2">
                            🤖 {match.prediction}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        {had.length > 0 && (
                          <div className="bg-red-50 p-2 rounded text-sm">
                            <p className="text-red-600 font-medium mb-1">HKJC 讓球</p>
                            <div className="space-y-1">
                              {had.slice(0, 3).map((sel: any, idx: number) => (
                                <div key={idx} className="flex justify-between gap-4">
                                  <span className="text-gray-600">{sel.name}</span>
                                  <span className="font-semibold">{sel.odds}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <Link 
                          href={`/match/${match.position}`}
                          className="inline-block mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          查看詳情
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
