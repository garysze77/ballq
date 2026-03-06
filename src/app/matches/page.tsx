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
  odds?: any
}

export default function Matches() {
  const [sportSrcData, setSportSrcData] = useState<SportSRCLeague[]>([])
  const [hkjcData, setHkjcData] = useState<HKJCMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'sportsrc' | 'hkjc'>('sportsrc')

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch SportSRC scores
        const srRes = await fetch('/api/sportsrc/scores')
        const srData = await srRes.json()
        
        if (srData.data) {
          setSportSrcData(srData.data)
        }

        // Fetch HKJC matches
        const hkjcRes = await fetch('/api/hkjc')
        const hkjcData = await hkjcRes.json()
        
        if (hkjcData.data) {
          setHkjcData(hkjcData.data)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error loading matches')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

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

  const totalMatches = sportSrcData.reduce((acc, league) => acc + league.matches.length, 0)

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
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('sportsrc')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'sportsrc' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border'
            }`}
          >
            🌍 全球賽事 ({totalMatches}場)
          </button>
          <button
            onClick={() => setActiveTab('hkjc')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'hkjc' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-700 border'
            }`}
          >
            🇭🇰 HKJC 赔率 ({hkjcData.length}場)
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        {/* SportSRC Matches */}
        {activeTab === 'sportsrc' && (
          <div>
            {sportSrcData.map((league) => (
              league.matches.length > 0 && (
                <div key={league.id} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>{league.country}</span>
                    <span className="text-gray-500">-</span>
                    <span>{league.name}</span>
                    <span className="text-sm text-gray-500">({league.matches.length}場)</span>
                  </h3>
                  <div className="grid gap-3">
                    {league.matches.map((match: any) => (
                      <div key={match.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="text-center w-12">
                              {match.home?.badge && (
                                <img src={match.home.badge} alt="" className="w-8 h-8 mx-auto" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{match.home?.name} vs {match.away?.name}</p>
                              <p className="text-sm text-gray-500">
                                {match.status === 'inprogress' ? '⚽ 進行中' : 
                                 match.status === 'finished' ? '✅ 已完場' : 
                                 formatDate(match.timestamp)}
                              </p>
                              {match.is_live && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                  LIVE
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {match.score?.current && (
                              <div className="text-xl font-bold">
                                {match.score.current.home} - {match.score.current.away}
                              </div>
                            )}
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
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* HKJC Matches */}
        {activeTab === 'hkjc' && (
          <div>
            {hkjcData.length > 0 ? (
              <div className="grid gap-4">
                {hkjcData.map((match) => (
                  <div key={match.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">
                          {match.homeTeam} vs {match.awayTeam}
                        </p>
                        <p className="text-sm text-gray-500">{match.matchDate}</p>
                      </div>
                      <Link 
                        href={`/match/${match.id}`}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        查看赔率
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">暫無HKJC賽事</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
