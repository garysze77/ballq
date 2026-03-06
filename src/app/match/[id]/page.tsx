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

interface MatchDetailData {
  match_info: MatchInfo
  info: {
    venue: { stadium: string; city: string; country: string; image: string; capacity: number }
    referee: { name: string; country: string; photo: string; games_recorded: number }
    managers: { home: { name: string; country: string; photo: string }; away: { name: string; country: string; photo: string } }
  }
  sources: any[]
}

interface OddsData {
  bookmaker_name: string
  markets: {
    market_id: number
    market_name: string
    choices: { name: string; decimal: number; trend: string }[]
  }[]
}

interface VoteData {
  match_winner: { home: { percent: number }; draw: { percent: number }; away: { percent: number }; total: number }
  both_teams_score: { yes: { percent: number }; no: { percent: number }; total: number }
  first_team_score: { home: { percent: number }; no_goal: { percent: number }; away: { percent: number }; total: number }
}

export default function MatchDetail() {
  const params = useParams()
  const matchId = params?.id as string
  
  const [matchData, setMatchData] = useState<MatchDetailData | null>(null)
  const [oddsData, setOddsData] = useState<OddsData | null>(null)
  const [voteData, setVoteData] = useState<VoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMatchDetail() {
      if (!matchId) return
      
      try {
        // Fetch match detail
        const res = await fetch(`/api/sportsrc/detail/${matchId}`)
        const data = await res.json()
        if (data.success && data.data) {
          setMatchData(data.data)
        }

        // Fetch odds
        const oddsRes = await fetch(`/api/sportsrc/odds/${matchId}`)
        const oddsData = await oddsRes.json()
        if (oddsData.success && oddsData.data) {
          setOddsData(oddsData.data)
        }

        // Fetch votes
        const votesRes = await fetch(`/api/sportsrc/votes/${matchId}`)
        const votesJson = await votesRes.json()
        if (votesJson.success && votesJson.data) {
          setVoteData(votesJson.data)
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

  if (error || !matchData) {
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

  const { match_info, info, sources } = matchData
  const home = match_info.teams?.home
  const away = match_info.teams?.away

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
          <p className="text-center text-gray-500 mb-2">{match_info.league?.name}</p>
          
          <div className="flex justify-between items-center">
            {/* Home Team */}
            <div className="text-center flex-1">
              {home?.badge && (
                <img src={home.badge} alt={home.name} className="w-24 h-24 mx-auto mb-4" />
              )}
              <h2 className="text-xl font-bold">{home?.name || 'TBD'}</h2>
              {info?.managers?.home && (
                <p className="text-sm text-gray-500">主教練: {info.managers.home.name}</p>
              )}
            </div>

            {/* Score */}
            <div className="text-center px-8">
              <p className="text-lg font-semibold">
                {match_info.status === 'inprogress' ? '⚽ 進行中' : 
                 match_info.status === 'finished' ? '✅ 已完場' : 
                 '未開始'}
              </p>
              {match_info.score?.current && (
                <p className="text-5xl font-bold text-green-600 mt-2">
                  {match_info.score.current.home} - {match_info.score.current.away}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                {formatDate(match_info.timestamp)}
              </p>
            </div>

            {/* Away Team */}
            <div className="text-center flex-1">
              {away?.badge && (
                <img src={away.badge} alt={away.name} className="w-24 h-24 mx-auto mb-4" />
              )}
              <h2 className="text-xl font-bold">{away?.name || 'TBD'}</h2>
              {info?.managers?.away && (
                <p className="text-sm text-gray-500">主教練: {info.managers.away.name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Match Info */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b bg-green-50">
              <h3 className="text-lg font-semibold">📋 賽事資訊</h3>
            </div>
            <div className="p-4 space-y-3">
              {info?.venue && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">🏟️</span>
                  <div>
                    <p className="font-medium">{info.venue.stadium}</p>
                    <p className="text-sm text-gray-500">{info.venue.city}, {info.venue.country} • 容納 {info.venue.capacity.toLocaleString()}人</p>
                  </div>
                </div>
              )}
              {info?.referee && (
                <div className="flex items-start gap-3">
                  <span className="text-xl">👨‍⚖️</span>
                  <div>
                    <p className="font-medium">{info.referee.name}</p>
                    <p className="text-sm text-gray-500">{info.referee.country} • 已執法 {info.referee.games_recorded} 場</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="font-medium">{formatDate(match_info.timestamp)}</p>
                  <p className="text-sm text-gray-500">{match_info.status_detail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Stream */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b bg-red-50">
              <h3 className="text-lg font-semibold">📺 直播</h3>
            </div>
            <div className="p-4">
              {sources && sources.length > 0 ? (
                <iframe 
                  src={sources[0].embedUrl}
                  className="w-full aspect-video bg-black rounded-lg"
                  allowFullScreen
                  title="Live Stream"
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📺</p>
                  <p>暫無直播</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Odds */}
        {oddsData && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-4 border-b bg-yellow-50">
              <h3 className="text-lg font-semibold">💰 赔率 ({oddsData.bookmaker_name})</h3>
            </div>
            <div className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                {oddsData.markets.slice(0, 6).map((market) => (
                  <div key={market.market_id} className="border rounded-lg p-3">
                    <p className="font-medium text-sm mb-2">{market.market_name}</p>
                    <div className="space-y-2">
                      {market.choices.slice(0, 3).map((choice, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm">{choice.name}</span>
                          <span className="font-bold text-green-600">{choice.decimal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Community Votes */}
        {voteData && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b bg-blue-50">
                <h3 className="text-lg font-semibold">🗳️ 誰能取勝？ ({voteData.match_winner.total.toLocaleString()} 票)</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{home?.name}</span>
                    <span>{voteData.match_winner.home.percent}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${voteData.match_winner.home.percent}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>和局</span>
                    <span>{voteData.match_winner.draw.percent}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500" style={{ width: `${voteData.match_winner.draw.percent}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{away?.name}</span>
                    <span>{voteData.match_winner.away.percent}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${voteData.match_winner.away.percent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b bg-purple-50">
                <h3 className="text-lg font-semibold">⚽ 雙方都入球？ ({voteData.both_teams_score.total.toLocaleString()} 票)</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>係</span>
                    <span>{voteData.both_teams_score.yes.percent}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${voteData.both_teams_score.yes.percent}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>否</span>
                    <span>{voteData.both_teams_score.no.percent}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${voteData.both_teams_score.no.percent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Prediction */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow border border-green-200 p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🤖</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">AI 預測建議</h3>
              {voteData ? (
                <>
                  <p className="text-gray-600 mb-3">
                    基於大數據分析同埋 <span className="font-semibold">{voteData.match_winner.total.toLocaleString()}</span> 位球迷既投票：
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="font-medium text-lg">
                      {voteData.match_winner.home.percent > voteData.match_winner.away.percent 
                        ? `🏆 推薦: ${home?.name} (${voteData.match_winner.home.percent}%球迷支持)`
                        : `🏆 推薦: ${away?.name} (${voteData.match_winner.away.percent}%球迷支持)`
                      }
                    </p>
                    {voteData.both_teams_score.yes.percent > 50 && (
                      <p className="text-sm text-green-600 mt-2">
                        📊 另一建議: 雙方都入球 (Yes) - {voteData.both_teams_score.yes.percent}%
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">*此為AI建議，請謹慎投注</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">AI預測功能即將推出...</p>
              )}
            </div>
          </div>
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
