'use client'

import { useState, useEffect, useRef } from 'react'
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

interface VoteData {
  home: number
  draw: number
  away: number
}

export default function MatchDetail() {
  const params = useParams()
  const matchId = params?.id as string
  
  const [match, setMatch] = useState<MatchInfo | null>(null)
  const [votes, setVotes] = useState<VoteData | null>(null)
  const [hasStream, setHasStream] = useState(false)
  const [streamUrl, setStreamUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function initPlayer() {
      if (videoRef.current && streamUrl) {
        const Plyr = (await import('plyr')).default
        await import('plyr/dist/plyr.css')
        const player = new Plyr(videoRef.current, {
          controls: ['play', 'volume', 'fullscreen', 'pip'],
          autoplay: true,
        })
        player.source = {
          type: 'video',
          sources: [
            {
              src: streamUrl,
              provider: 'html5',
            },
          ],
        }
        return () => player.destroy()
      }
    }
    initPlayer()
  }, [streamUrl])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMatchDetail() {
      if (!matchId) return
      
      try {
        // Fetch match detail
        const res = await fetch(`/api/sportsrc/detail/${matchId}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          setMatch(data.data.match_info)
          
          // Get stream URL
          const sources = data.data.sources
          if (sources && sources.length > 0) {
            setHasStream(true)
            setStreamUrl(sources[0].embedUrl || '')
          }
        }

        // Fetch votes
        const votesRes = await fetch(`/api/sportsrc/votes/${matchId}`)
        const votesData = await votesRes.json()
        if (votesData.success && votesData.data) {
          setVotes(votesData.data)
        }

        // Check if has stream (from scores)
        const scoresRes = await fetch('/api/sportsrc/scores')
        const scoresData = await scoresRes.json()
        if (scoresData.data) {
          for (const league of scoresData.data) {
            const found = league.matches?.find((m: any) => m.id === matchId)
            if (found) {
              setHasStream(found.has_stream || false)
              break
            }
          }
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
  const totalVotes = votes ? votes.home + votes.draw + votes.away : 0

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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Community Votes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">🗳️ 社區投票</h3>
            </div>
            <div className="p-4">
              {votes && totalVotes > 0 ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{home?.name}</span>
                      <span>{Math.round((votes.home / totalVotes) * 100)}%</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(votes.home / totalVotes) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>和局</span>
                      <span>{Math.round((votes.draw / totalVotes) * 100)}%</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-500 rounded-full" 
                        style={{ width: `${(votes.draw / totalVotes) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{away?.name}</span>
                      <span>{Math.round((votes.away / totalVotes) * 100)}%</span>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(votes.away / totalVotes) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    總投票數: {totalVotes}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">暫無投票數據</p>
              )}
            </div>
          </div>

          {/* Live Stream */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">📺 直播</h3>
            </div>
            <div className="p-4">
              {hasStream && streamUrl ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef}
                    className="w-full h-full"
                    playsInline
                    controls
                    autoPlay
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📺</p>
                  <p>暫無直播</p>
                  <p className="text-sm">呢場比賽暫時無直播提供</p>
                </div>
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
              <p className="text-gray-600">
                {votes && totalVotes > 0 ? (
                  <>
                    基於大數據分析同埋 
                    <span className="font-semibold text-green-600">
                      {votes.home > votes.away ? ` ${home?.name} ` : votes.away > votes.home ? ` ${away?.name} ` : ' 和局 '}
                    </span>
                    既社區投票傾向，建議：
                  </>
                ) : 'AI預測功能即將推出...'}
              </p>
              {votes && totalVotes > 0 && (
                <div className="mt-3 bg-white rounded-lg p-4 border border-green-200">
                  <p className="font-medium text-lg">
                    {votes.home > votes.away ? `支持 ${home?.name}` : 
                     votes.away > votes.home ? `支持 ${away?.name}` : 
                     '建議觀望'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">*此為AI建議，請謹慎投注</p>
                </div>
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
