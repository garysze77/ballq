'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface MatchInfo {
  id: string
  title: string
  timestamp: number
  status: string
  league: any
  teams: {
    home: { name: string; code: string; color: string; badge: string }
    away: { name: string; code: string; color: string; badge: string }
  }
  score: any
  time_info: any
}

export default function MatchDetail() {
  const params = useParams()
  const matchId = params?.id as string
  
  const [match, setMatch] = useState<MatchInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMatchDetail() {
      if (!matchId) return
      
      try {
        // Try SportSRC detail endpoint
        const res = await fetch(`/api/sportsrc/detail/${matchId}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          setMatch(data.data.match_info)
        } else {
          setError('Match not found')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error loading match')
      } finally {
        setLoading(false)
      }
    }

    fetchMatchDetail()
  }, [matchId])

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-TW', { 
        year: 'numeric',
        month: 'long', 
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
        <p>Loading...</p>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || '找不到比賽'}</p>
          <Link href="/matches" className="text-green-600 hover:underline">
            返回賽事列表
          </Link>
        </div>
      </div>
    )
  }

  const home = match.teams?.home
  const away = match.teams?.away

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/matches" className="text-2xl font-bold">BallQ</Link>
          <nav className="space-x-4">
            <Link href="/matches" className="hover:underline">賽事</Link>
            <Link href="/dashboard">用戶中心</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Match Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <p className="text-center text-gray-500 mb-4">{match.league?.name}</p>
          
          <div className="flex justify-between items-center">
            {/* Home Team */}
            <div className="text-center flex-1">
              {home?.badge && (
                <img src={home.badge} alt={home.name} className="w-24 h-24 mx-auto mb-4" />
              )}
              <h2 className="text-xl font-bold">{home?.name || 'TBD'}</h2>
            </div>

            {/* Score */}
            <div className="text-center px-8">
              <p className="text-lg font-semibold">
                {match.status === 'inprogress' ? '⚽ 進行中' : 
                 match.status === 'finished' ? '✅ 已完場' : 
                 '未開始'}
              </p>
              {match.score?.current && (
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {match.score.current.home} - {match.score.current.away}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                {formatDate(match.timestamp)}
              </p>
            </div>

            {/* Away Team */}
            <div className="text-center flex-1">
              {away?.badge && (
                <img src={away.badge} alt={away.name} className="w-24 h-24 mx-auto mb-4" />
              )}
              <h2 className="text-xl font-bold">{away?.name || 'TBD'}</h2>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow border border-green-200 p-8 text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold mb-2">更多功能即將推出</h3>
          <p className="text-gray-600">
            赔率、投票、AI預測、直播 - 敬請期待！
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/matches" className="text-green-600 hover:underline">
            ← 返回賽事列表
          </Link>
        </div>
      </main>
    </div>
  )
}
