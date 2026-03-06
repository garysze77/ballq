import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BallQ</h1>
          <nav className="space-x-4">
            <Link href="/matches" className="hover:underline">賽事</Link>
            <Link href="/dashboard" className="hover:underline">用戶中心</Link>
            <Link href="/login" className="hover:underline">登入</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI-powered 足球分析
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            專業數據分析，每日精選賽事推薦
          </p>
          <Link 
            href="/matches"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
          >
            免費試用 →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">點解選擇 BallQ？</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚽</div>
              <h4 className="text-xl font-semibold mb-2">足球分析</h4>
              <p className="text-gray-600">覆蓋英超、西甲、意甲、德甲、法甲</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🏀</div>
              <h4 className="text-xl font-semibold mb-2">籃球分析</h4>
              <p className="text-gray-600">NBA、NCAA、EuroLeague 數據分析</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-semibold mb-2">專業數據</h4>
              <p className="text-gray-600">提供赔率、數據、投注建議</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2026 BallQ. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
