'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

interface FavoriteMatch {
  id: string
  home_team: string
  away_team: string
  league: string
  start_date: string
}

interface BetHistory {
  id: number
  match: string
  selection: string
  odds: number
  amount: number
  result: string
  date: string
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteMatch[]>([])
  const [betHistory, setBetHistory] = useState<BetHistory[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Sample data (will connect to Supabase later)
  const sampleFavorites: FavoriteMatch[] = [
    { id: '1', home_team: 'Manchester United', away_team: 'Liverpool', league: 'Premier League', start_date: '2026-03-08T20:00:00Z' },
    { id: '2', home_team: 'Real Madrid', away_team: 'Barcelona', league: 'La Liga', start_date: '2026-03-09T20:00:00Z' },
  ]

  const sampleBetHistory: BetHistory[] = [
    { id: 1, match: 'PSG vs Monaco', selection: 'Monaco +0.5', odds: 1.85, amount: 100, result: 'win', date: '2026-03-05' },
    { id: 2, match: 'Bayern vs Dortmund', selection: 'Over 3.5', odds: 2.10, amount: 50, result: 'lose', date: '2026-03-04' },
  ]

  const totalWins = sampleBetHistory.filter(b => b.result === 'win').length
  const totalBets = sampleBetHistory.length
  const winRate = totalBets > 0 ? Math.round((totalWins / totalBets) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">BallQ</Link>
          <nav className="space-x-4">
            <Link href="/matches" className="hover:underline">賽事</Link>
            <Link href="/dashboard" className="underline">用戶中心</Link>
            <button onClick={handleLogout} className="hover:underline">登出</button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl text-green-600">{user.email?.[0].toUpperCase()}</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{user.displayName || 'User'}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-block mt-2 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                Free Plan
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">總投注次數</p>
            <p className="text-3xl font-bold">{totalBets}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">獲勝次數</p>
            <p className="text-3xl font-bold text-green-600">{totalWins}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">勝率</p>
            <p className="text-3xl font-bold">{winRate}%</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Favorites */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">❤️ 收藏賽事</h3>
            </div>
            <div className="p-4">
              {sampleFavorites.length > 0 ? (
                <div className="space-y-3">
                  {sampleFavorites.map(match => (
                    <div key={match.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{match.home_team} vs {match.away_team}</p>
                        <p className="text-sm text-gray-500">{match.league}</p>
                      </div>
                      <button className="text-green-600 hover:underline text-sm">
                        查看
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">暫無收藏賽事</p>
              )}
              <Link href="/matches" className="block text-center text-green-600 mt-4 hover:underline">
                去收藏 →
              </Link>
            </div>
          </div>

          {/* Bet History */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">📊 投注記錄</h3>
            </div>
            <div className="p-4">
              {sampleBetHistory.length > 0 ? (
                <div className="space-y-3">
                  {sampleBetHistory.map(bet => (
                    <div key={bet.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{bet.match}</p>
                        <p className="text-sm text-gray-500">{bet.selection} @ {bet.odds}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          bet.result === 'win' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {bet.result === 'win' ? '贏' : '輸'}
                        </span>
                        <p className="text-xs text-gray-500">${bet.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">暫無投注記錄</p>
              )}
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow text-white p-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">升級至 Premium</h3>
              <p className="text-green-100">解鎖更多功能，包括：</p>
              <ul className="text-green-100 mt-2 space-y-1">
                <li>✓ AI 預測建議</li>
                <li>✓ HKJC 完整赔率</li>
                <li>✓ 無廣告體驗</li>
                <li>✓ 優先客戶支援</li>
              </ul>
            </div>
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
              立即升級
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
