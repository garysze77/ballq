'use client'

import { useState, useEffect } from 'react'

interface Match {
  id: number
  name: string
  league: string
  home_team: string
  away_team: string
  start_date: string
}

interface HKJCOdds {
  HAD?: any
  FHL?: any
  [key: string]: any
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [hkjcMatches, setHkjcMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch SportSRC matches
        const srRes = await fetch('http://172.104.99.225:8000/sportsrc/scores')
        const srData = await srRes.json()
        
        // Fetch HKJC matches
        const hkjcRes = await fetch('http://172.104.99.225:8000/hkjc')
        const hkjcData = await hkjcRes.json()
        
        // Flatten SportSRC data
        const flatMatches: Match[] = []
        if (srData.data) {
          srData.data.forEach((league: any) => {
            if (league.matches) {
              league.matches.forEach((match: any) => {
                flatMatches.push({
                  id: match.id,
                  name: `${match.home?.name || ''} vs ${match.away?.name || ''}`,
                  league: league.name,
                  home_team: match.home?.name || '',
                  away_team: match.away?.name || '',
                  start_date: new Date(match.timestamp).toISOString(),
                })
              })
            }
          })
        }
        
        setMatches(flatMatches)
        setHkjcMatches(hkjcData.data || [])
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    
    fetchData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-TW', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BallQ</h1>
          <nav className="space-x-4">
            <a href="/matches" className="underline">賽事</a>
            <a href="/dashboard">用戶中心</a>
            <a href="/login">登入</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">今日賽事</h2>
        
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            {/* HKJC Matches Section */}
            {hkjcMatches.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-sm mr-2">HKJC</span>
                  香港馬會赔率 ({hkjcMatches.length}場)
                </h3>
                <div className="grid gap-4">
                  {hkjcMatches.slice(0, 10).map((match, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{match.league || 'Football'}</p>
                          <p className="text-lg">{match.home} vs {match.away}</p>
                          <p className="text-sm text-gray-500">{formatDate(match.start_time)}</p>
                        </div>
                        <div className="text-right">
                          {match.odds?.HAD && (
                            <div className="text-sm">
                              <span className="text-gray-500">讓球: </span>
                              <span className="font-semibold">{match.odds.HAD.home || '-'}</span>
                              <span className="mx-1">vs</span>
                              <span className="font-semibold">{match.odds.HAD.away || '-'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SportSRC Matches */}
            <div>
              <h3 className="text-lg font-semibold mb-4">全球賽事 ({matches.length}場)</h3>
              <div className="grid gap-4">
                {matches.slice(0, 20).map((match) => (
                  <div key={match.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">{match.league}</p>
                        <p className="text-lg font-semibold">{match.home_team} vs {match.away_team}</p>
                        <p className="text-sm text-gray-500">{formatDate(match.start_date)}</p>
                      </div>
                      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        查看
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
