'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SportSRCLeague {
  id: number
  name: string
  country: string
  matches: any[]
}

interface HKJCMatch {
  id: number
  homeTeam: string
  awayTeam: string
  matchDate: string
}

export default function Matches() {
  const [sportSrcData, setSportSrcData] = useState<SportSRCLeague[]>([])
  const [hkjcData, setHkjcData] = useState<HKJCMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLeague, setSelectedLeague] = useState<string>('all')

  useEffect(() => {
    async function fetchData() {
      try {
        const srRes = await fetch('/api/sportsrc/scores')
        const srData = await srRes.json()
        if (srData.data) {
          setSportSrcData(srData.data)
        }

        const hkjcRes = await fetch('/api/hkjc')
        const hkjcData = await hkjcRes.json()
        if (hkjcData.data) {
          setHkjcData(hkjcData.data)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error loading matches')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Get all unique leagues
  const leagues = sportSrcData.map(l => ({ id: l.id, name: l.name, country: l.country }))
  
  // Filter matches by selected league
  const filteredData = selectedLeague === 'all' 
    ? sportSrcData 
    : sportSrcData.filter(l => l.id.toString() === selectedLeague)

  // Flatten and sort all matches by timestamp
  const allMatches = filteredData
    .flatMap(league => 
      league.matches.map(m => ({ ...m, leagueName: league.name, leagueCountry: league.country }))
    )
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

  // Check if a match has HKJC odds
  const getHKJCTeamName = (team: any) => {
    if (!team) return ''
    if (typeof team === 'string') return team
    return team.name_en || team.name_ch || ''
  }
  
  const hasHKJCOdds = (homeTeam?: string, awayTeam?: string) => {
    if (!homeTeam || !awayTeam) return false
    const hHome = homeTeam.toLowerCase().split(' ')[0]
    const hAway = awayTeam.toLowerCase().split(' ')[0]
    
    return hkjcData.some(h => {
      const hkHome = getHKJCTeamName(h.homeTeam).toLowerCase()
      const hkAway = getHKJCTeamName(h.awayTeam).toLowerCase()
      const hkHomeFirst = hkHome.split(' ')[0]
      const hkAwayFirst = hkAway.split(' ')[0]
      return (hkHome.includes(hHome) || hHome.includes(hkHomeFirst)) &&
             (hkAway.includes(hAway) || hAway.includes(hkAwayFirst))
    })
  }

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-TW', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
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
        
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* League Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedLeague('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              selectedLeague === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border'
            }`}
          >
            全部 ({allMatches.length})
          </button>
          {leagues.slice(0, 15).map((league) => {
            const count = sportSrcData.find(l => l.id === league.id)?.matches.length || 0
            return (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id.toString())}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  selectedLeague === league.id.toString() 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-gray-700 border'
                }`}
              >
                {league.country} {league.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Matches List - Sorted by time */}
        <div>
          {allMatches.map((match) => {
            const hasHKJC = hasHKJCOdds(match.home?.name, match.away?.name)
            
            return (
              <div key={match.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 mb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {/* Time */}
                    <div className="text-center w-16">
                      <p className="text-sm font-medium">
                        {match.status === 'inprogress' ? '⚽' : 
                         match.status === 'finished' ? '✅' : 
                         formatDate(match.timestamp)}
                      </p>
                    </div>
                    
                    {/* League Badge */}
                    <div className="text-xs text-gray-500 w-24">
                      {match.leagueCountry}
                    </div>
                    
                    {/* Teams */}
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {match.home?.name} vs {match.away?.name}
                        {hasHKJC && <span title="有HKJC赔率">🏇</span>}
                      </p>
                      {match.is_live && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                          LIVE {match.score?.current?.home}-{match.score?.current?.away}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {match.has_stream && (
                      <span className="text-red-500">📺</span>
                    )}
                    <Link 
                      href={`/match/${encodeURIComponent(match.id)}`}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      查看
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
