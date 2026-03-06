'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface MatchDetail {
  id: string
  home: { name: string; score: number; badge: string }
  away: { name: string; score: number; badge: string }
  league: string
  status: string
  timestamp: number
  has_stream?: boolean
}

interface Odds {
  home: string
  draw: string
  away: string
}

interface Vote {
  home: number
  draw: number
  away: number
}

export default function MatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [odds, setOdds] = useState<Odds | null>(null)
  const [votes, setVotes] = useState<Vote | null>(null)
  const [loading, setLoading] = useState(true)
  const [showStream, setShowStream] = useState(false)

  useEffect(() => {
    async function fetchMatchData() {
      try {
        // Fetch from SportSRC
        const detailRes = await fetch(`/api/sportsrc/detail/${resolvedParams.id}`)
        const detailData = await detailRes.json()
        
        // Fetch odds
        const oddsRes = await fetch(`/api/sportsrc/odds/${resolvedParams.id}`)
        const oddsData = await oddsRes.json()
        
        // Fetch votes
        const votesRes = await fetch(`/api/sportsrc/votes/${resolvedParams.id}`)
        const votesData = await votesRes.json()

        if (detailData.data) {
          const m = detailData.data
          setMatch({
            id: resolvedParams.id,
            home: { name: m.home?.name || '', score: m.score?.current?.home || 0, badge: m.home?.badge || '' },
            away: { name: m.away?.name || '', score: m.score?.current?.away || 0, badge: m.away?.badge || '' },
            league: m.league?.name || '',
            status: m.status || '',
            timestamp: m.timestamp || 0,
            has_stream: m.has_stream || false,
          })
        }

        if (oddsData.data) {
          const o = oddsData.data
          setOdds({
            home: o.home?.odds?.[0]?.odd || '-',
            draw: o.draw?.odds?.[0]?.odd || '-',
            away: o.away?.odds?.[0]?.odd || '-',
          })
        }

        if (votesData.data) {
          const v = votesData.data
          setVotes({
            home: v.home || 0,
            draw: v.draw || 0,
            away: v.away || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching match:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatchData()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">找不到比賽</p>
          <Link href="/matches" className="text-green-600 hover:underline">
            返回賽事列表
          </Link>
        </div>
      </div>
    )
  }

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
          <p className="text-center text-gray-500 mb-4">{match.league}</p>
          
          <div className="flex justify-between items-center">
            {/* Home Team */}
            <div className="text-center flex-1">
              {match.home.badge && (
                <img src={match.home.badge} alt={match.home.name} className="w-24 h-24 mx-auto mb-4" />
              )}
              <h2 className="text-xl font-bold">{match.home.name}</h2>
              <p className="text-4xl font-bold text-green-600 mt-2">{match.home.score}</p>
            </div>

            {/* Status */}
            <div className="text-center px-8">
              <p className="text-lg font-semibold">{match.status}</p>
              <p className="text-gray-500 text-sm mt-1">
                {new Date(match.timestamp).toLocaleString('zh-TW')}
              </p>
              {match.has_stream && (
                <button 
                  onClick={() => setShowStream(!showStream)}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition"
                >
                  📺 {showStream ? '隱藏直播' : '觀看直播'}
                </button>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center flex-1">
              {match.away.badge && (
                <img src={match.away.badge} alt={match.away.name} className="w-24 h-24 mx-auto mb-4" />
              )}
              <h2 className="text-xl font-bold">{match.away.name}</h2>
              <p className="text-4xl font-bold text-green-600 mt-2">{match.away.score}</p>
            </div>
          </div>
        </div>

        {/* Stream Player */}
        {showStream && match.has_stream && (
          <div className="bg-black rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-4xl mb-4">📺</p>
                <p className="text-gray-400">Stream Player Component</p>
                <p className="text-sm text-gray-500 mt-2">
                  (整合 Video.js / Plyr player here)
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Odds */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">📊 赔率</h3>
            </div>
            <div className="p-4">
              {odds ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500 mb-1">主勝</p>
                    <p className="text-2xl font-bold">{odds.home}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500 mb-1">和局</p>
                    <p className="text-2xl font-bold">{odds.draw}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500 mb-1">客勝</p>
                    <p className="text-2xl font-bold">{odds.away}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">暫無赔率數據</p>
              )}
            </div>
          </div>

          {/* Community Votes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">🗳️ 社區投票</h3>
            </div>
            <div className="p-4">
              {votes ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{match.home.name}</span>
                      <span>{votes.home}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${votes.home}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>和局</span>
                      <span>{votes.draw}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-500 rounded-full" 
                        style={{ width: `${votes.draw}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{match.away.name}</span>
                      <span>{votes.away}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${votes.away}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">暫無投票數據</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Prediction */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow border border-green-200 p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🤖</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">AI 預測建議</h3>
              <p className="text-gray-600 mb-4">
                基於大數據分析同埋社區投票，我地建議：
              </p>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="font-medium text-lg">
                  {votes && votes.home > votes.away ? 
                    `支持 ${match.home.name} (${votes.home}%球迷支持)` :
                    votes && votes.away > votes.home ?
                    `支持 ${match.away.name} (${votes.away}%球迷支持)` :
                    '和局機會較高'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  *此為AI建議，請謹慎投注
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
