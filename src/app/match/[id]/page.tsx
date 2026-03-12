'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import 'video.js/dist/video-js.css'
import VideoJS from 'video.js'

interface MatchInfo {
  id: string
  title: string
  timestamp: number
  status: string
  status_detail?: string
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

interface LineupPlayer {
  name: string
  number: string
  position: string
  is_captain: boolean
  photo: string
  rating: number
  minutes: number
}

interface LineupData {
  confirmed: boolean
  data: {
    home: { coach: any; formation: string; start_xi: LineupPlayer[]; subs: LineupPlayer[] }
    away: { coach: any; formation: string; start_xi: LineupPlayer[]; subs: LineupPlayer[] }
  }
}

interface ShotmapData {
  success: boolean
  data: {
    home: any[]
    away: any[]
  }
}

interface LastMatchesData {
  success: boolean
  data: {
    home: any[]
    away: any[]
  }
}

interface StreamData {
  success: boolean
  stream_url?: string
  embed_url?: string
  iframe_url?: string
  type: string
  message?: string
}

// VideoPlayer component for m3u8 streams with CORS proxy
function VideoPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)

  // Use allorigins CORS proxy
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`

  useEffect(() => {
    if (!videoRef.current) return

    if (!playerRef.current) {
      const videoElement = videoRef.current
      if (!videoElement) return

      playerRef.current = VideoJS(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{
          src: proxyUrl,
          type: 'application/x-mpegURL'
        }]
      })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [proxyUrl])

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        playsInline
      />
    </div>
  )
}

export default function MatchDetail() {
  const params = useParams()
  const [matchId, setMatchId] = useState<string>('')
  const [matchData, setMatchData] = useState<MatchDetailData | null>(null)
  const [oddsData, setOddsData] = useState<OddsData | null>(null)
  const [voteData, setVoteData] = useState<VoteData | null>(null)
  const [lineupData, setLineupData] = useState<LineupData | null>(null)
  const [shotmapData, setShotmapData] = useState<ShotmapData | null>(null)
  const [lastMatchesData, setLastMatchesData] = useState<LastMatchesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'lineups' | 'shotmap' | 'form' | 'h2h'>('lineups')
  const [streamData, setStreamData] = useState<StreamData | null>(null)

  useEffect(() => {
    async function initParams() {
      const resolvedParams = await params
      if (resolvedParams?.id) {
        setMatchId(resolvedParams.id as string)
      } else {
        setLoading(false)
      }
    }
    initParams()
  }, [params])

  useEffect(() => {
    async function fetchMatchDetail() {
      if (!matchId) return
      
      try {
        // Fetch match detail
        const res = await fetch(`/api/sportsrc/detail/${matchId}`)
        const data = await res.json()
        console.log('Detail response:', data)
        if (data.success && data.data) {
          setMatchData(data.data)
        } else {
          setError(data.message || 'Match not found')
        }

        // Fetch odds
        const oddsRes = await fetch(`/api/sportsrc/odds/${matchId}`)
        const oddsData = await oddsRes.json()
        console.log('Odds response:', oddsData)
        if (oddsData.success && oddsData.data) {
          setOddsData(oddsData.data)
        }

        // Fetch votes
        const votesRes = await fetch(`/api/sportsrc/votes/${matchId}`)
        const votesJson = await votesRes.json()
        console.log('Votes response:', votesJson)
        if (votesJson.success && votesJson.data) {
          setVoteData(votesJson.data)
        }

        // Fetch lineups
        const lineupRes = await fetch(`/api/sportsrc/lineups/${matchId}`)
        const lineupJson = await lineupRes.json()
        console.log('Lineup response:', lineupJson)
        if (lineupJson.success && lineupJson.data) {
          setLineupData(lineupJson)
        }

        // Fetch shotmap
        const shotmapRes = await fetch(`/api/sportsrc/shotmap/${matchId}`)
        const shotmapJson = await shotmapRes.json()
        console.log('Shotmap response:', shotmapJson)
        if (shotmapJson.success && shotmapJson.data) {
          setShotmapData(shotmapJson)
        }

        // Fetch last matches
        const lastMatchesRes = await fetch(`/api/sportsrc/last_matches/${matchId}`)
        const lastMatchesJson = await lastMatchesRes.json()
        console.log('Last matches response:', lastMatchesJson)
        if (lastMatchesJson.success && lastMatchesJson.data) {
          setLastMatchesData(lastMatchesJson)
        }

        // Fetch stream
        const streamRes = await fetch(`/api/sportsrc/stream/${matchId}`)
        const streamJson = await streamRes.json()
        console.log('Stream response:', streamJson)
        if (streamJson.success) {
          setStreamData(streamJson)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error loading match: ' + (err as Error).message)
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
                    <p className="text-sm text-gray-500">{info.venue.city}, {info.venue.country} • 容納 {info.venue.capacity?.toLocaleString() || 'N/A'}人</p>
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
                  <p className="font-medium">{match_info?.timestamp ? formatDate(match_info.timestamp) : 'N/A'}</p>
                  <p className="text-sm text-gray-500">{match_info?.status_detail || ''}</p>
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
              {(() => {
                const streamType = streamData?.type
                const streamUrl = streamData?.iframe_url || streamData?.embed_url || sources?.[0]?.embedUrl

                if (!streamUrl) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-4xl mb-2">📺</p>
                      <p>暫無直播</p>
                    </div>
                  )
                }

                // Use video.js with CORS proxy for m3u8 streams
                if (streamType === 'm3u8' || streamUrl.endsWith('.m3u8')) {
                  return <VideoPlayer url={streamUrl} />
                }

                // Use iframe for other streams
                return (
                  <iframe
                    src={streamUrl}
                    className="w-full aspect-video bg-black rounded-lg"
                    allowFullScreen
                    title="Live Stream"
                  />
                )
              })()}
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
        {voteData?.match_winner && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b bg-blue-50">
                <h3 className="text-lg font-semibold">🗳️ 誰能取勝？ ({voteData.match_winner.total?.toLocaleString() || 0} 票)</h3>
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
                <h3 className="text-lg font-semibold">⚽ 雙方都入球？ ({voteData.both_teams_score.total?.toLocaleString() || 0} 票)</h3>
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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow border border-green-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🤖</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">AI 預測建議</h3>
              {voteData ? (
                <>
                  <p className="text-gray-600 mb-3">
                    基於大數據分析同埋 <span className="font-semibold">{voteData.match_winner.total?.toLocaleString() || 0}</span> 位球迷既投票：
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

        {/* Tabbed Section: Lineups, Shotmap, Form */}
        <div className="bg-white rounded-lg shadow mb-8">
          {/* Tab Headers */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('lineups')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'lineups' 
                  ? 'border-b-2 border-green-500 text-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 陣容
            </button>
            <button
              onClick={() => setActiveTab('shotmap')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'shotmap' 
                  ? 'border-b-2 border-green-500 text-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎯 射門
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === 'form' 
                  ? 'border-b-2 border-green-500 text-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📈 近績
            </button>
          </div>

          <div className="p-4">
            {/* Lineups Tab */}
            {activeTab === 'lineups' && (
              <div>
                {lineupData?.data ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Home Team */}
                    <div>
                      <h4 className="font-semibold text-center mb-3">{home?.name}</h4>
                      <p className="text-sm text-gray-500 text-center mb-2">
                        陣式: {lineupData.data.home.formation} | 教練: {lineupData.data.home.coach?.name}
                      </p>
                      <div className="space-y-1">
                        <p className="font-medium text-sm text-green-600">正選 (XI)</p>
                        {lineupData.data.home.start_xi?.map((player, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                            <span>{player.number} {player.name}</span>
                            <span className="text-xs text-gray-500">{player.position}</span>
                          </div>
                        ))}
                        {lineupData.data.home.subs?.length > 0 && (
                          <>
                            <p className="font-medium text-sm text-blue-600 mt-3">後備</p>
                            {lineupData.data.home.subs?.map((player, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                                <span>{player.number} {player.name}</span>
                                <span className="text-xs text-gray-500">{player.position}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div>
                      <h4 className="font-semibold text-center mb-3">{away?.name}</h4>
                      <p className="text-sm text-gray-500 text-center mb-2">
                        陣式: {lineupData.data.away.formation} | 教練: {lineupData.data.away.coach?.name}
                      </p>
                      <div className="space-y-1">
                        <p className="font-medium text-sm text-green-600">正選 (XI)</p>
                        {lineupData.data.away.start_xi?.map((player, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                            <span>{player.number} {player.name}</span>
                            <span className="text-xs text-gray-500">{player.position}</span>
                          </div>
                        ))}
                        {lineupData.data.away.subs?.length > 0 && (
                          <>
                            <p className="font-medium text-sm text-blue-600 mt-3">後備</p>
                            {lineupData.data.away.subs?.map((player, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1">
                                <span>{player.number} {player.name}</span>
                                <span className="text-xs text-gray-500">{player.position}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">暫無陣容資料</p>
                )}
              </div>
            )}

            {/* Shotmap Tab */}
            {activeTab === 'shotmap' && (
              <div>
                {shotmapData?.data ? (
                  <div>
                    <div className="flex justify-center gap-8 mb-4 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        主隊射門: {shotmapData.data.home?.length || 0}次
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        客隊射門: {shotmapData.data.away?.length || 0}次
                      </span>
                    </div>
                    
                    {/* Pitch with shots */}
                    <div className="relative mx-auto max-w-2xl bg-green-600 rounded-lg" style={{ height: '340px' }}>
                      {/* Pitch lines */}
                      <div className="absolute inset-2 border-2 border-white/50 rounded">
                        {/* Center line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30"></div>
                        {/* Center circle */}
                        <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        {/* Left penalty area */}
                        <div className="absolute left-0 top-1/2 w-16 h-24 border-2 border-white/30 -translate-y-1/2"></div>
                        {/* Right penalty area */}
                        <div className="absolute right-0 top-1/2 w-16 h-24 border-2 border-white/30 -translate-y-1/2"></div>
                        {/* Left goal area */}
                        <div className="absolute left-0 top-1/2 w-6 h-10 border-2 border-white/30 -translate-y-1/2"></div>
                        {/* Right goal area */}
                        <div className="absolute right-0 top-1/2 w-6 h-10 border-2 border-white/30 -translate-y-1/2"></div>
                      </div>
                      
                      {/* Home team shots (from left to right) */}
                      {shotmapData.data.home?.map((shot: any, idx: number) => {
                        const x = (shot.coordinates?.x / 100) * 100 // 0-100 scale
                        const y = (shot.coordinates?.y / 100) * 100
                        return (
                          <div
                            key={`home-${idx}`}
                            className="absolute w-3 h-3 rounded-full bg-green-400 border border-white shadow-lg"
                            style={{
                              left: `${4 + x * 0.92}%`,
                              top: `${y}%`,
                              transform: 'translate(-50%, -50%)',
                              opacity: Math.max(0.3, shot.xg || 0.1)
                            }}
                            title={`${shot.player?.name}: xG=${shot.xg || 0}`}
                          />
                        )
                      })}
                      
                      {/* Away team shots (from right to left - mirror) */}
                      {shotmapData.data.away?.map((shot: any, idx: number) => {
                        const x = (shot.coordinates?.x / 100) * 100
                        const y = (shot.coordinates?.y / 100) * 100
                        return (
                          <div
                            key={`away-${idx}`}
                            className="absolute w-3 h-3 rounded-full bg-red-400 border border-white shadow-lg"
                            style={{
                              left: `${96 - x * 0.92}%`,
                              top: `${y}%`,
                              transform: 'translate(-50%, -50%)',
                              opacity: Math.max(0.3, shot.xg || 0.1)
                            }}
                            title={`${shot.player?.name}: xG=${shot.xg || 0}`}
                          />
                        )
                      })}
                    </div>
                    
                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-green-50 rounded p-3">
                        <p className="font-medium text-green-700">主隊 xG</p>
                        <p className="text-2xl font-bold">
                          {(shotmapData.data.home?.reduce((sum: number, s: any) => sum + (s.xg || 0), 0) || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded p-3">
                        <p className="font-medium text-red-700">客隊 xG</p>
                        <p className="text-2xl font-bold">
                          {(shotmapData.data.away?.reduce((sum: number, s: any) => sum + (s.xg || 0), 0) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">暫無射門資料</p>
                )}
              </div>
            )}

            {/* Form Tab */}
            {activeTab === 'form' && (
              <div>
                {lastMatchesData?.data ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Home Team Form */}
                    <div>
                      <h4 className="font-semibold text-center mb-3">{home?.name} 近5場</h4>
                      <div className="space-y-2">
                        {lastMatchesData.data.home?.slice(0, 5).map((match: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                            <span className="text-gray-600">{match.home_team?.name} {match.home_score}-{match.away_score} {match.away_team?.name}</span>
                            <span className={`font-medium ${match.winner_code === 1 ? 'text-green-600' : match.winner_code === 2 ? 'text-red-600' : 'text-gray-500'}`}>
                              {match.winner_code === 1 ? 'W' : match.winner_code === 2 ? 'L' : 'D'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Away Team Form */}
                    <div>
                      <h4 className="font-semibold text-center mb-3">{away?.name} 近5場</h4>
                      <div className="space-y-2">
                        {lastMatchesData.data.away?.slice(0, 5).map((match: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                            <span className="text-gray-600">{match.home_team?.name} {match.home_score}-{match.away_score} {match.away_team?.name}</span>
                            <span className={`font-medium ${match.winner_code === 1 ? 'text-green-600' : match.winner_code === 2 ? 'text-red-600' : 'text-gray-500'}`}>
                              {match.winner_code === 1 ? 'W' : match.winner_code === 2 ? 'L' : 'D'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">暫無近績資料</p>
                )}
              </div>
            )}
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
