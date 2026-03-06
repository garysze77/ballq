import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">BallQ</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm">登入</span>
            <span className="px-4 py-2 bg-orange-500 text-white text-sm rounded-full font-medium">
              免費試用
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        {/* Hero Section */}
        <section className="py-20 text-center px-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI-powered 足球分析
          </h1>
          <p className="text-xl text-gray-500 mb-8">
            專業數據分析，每日精選賽事推薦
          </p>
          
          <div className="flex justify-center gap-4">
            <Link 
              href="/matches"
              className="px-8 py-3 bg-green-500 text-white text-lg rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              免費試用 →
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">
              點解選擇 BallQ？
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Football */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">足球分析</h3>
                <p className="text-gray-500 text-sm">
                  覆蓋英超、西甲、意甲、德甲、法甲
                </p>
              </div>

              {/* Basketball */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">籃球分析</h3>
                <p className="text-gray-500 text-sm">
                  NBA、NCAA、EuroLeague 數據分析
                </p>
              </div>

              {/* Professional Data */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zM21 19v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">專業數據</h3>
                <p className="text-gray-500 text-sm">
                  提供赔率、數據、投注建議
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            準備好提升你的投注體驗未？
          </h2>
          <Link 
            href="/matches"
            className="inline-block px-8 py-3 bg-green-500 text-white text-lg rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            免費試用 →
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-400 text-sm">
          © 2026 BallQ. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
