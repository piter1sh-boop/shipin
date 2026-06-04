import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="px-8 py-6 border-b border-blue-100">
        <h1 className="text-xl font-bold text-gray-900">30天AI创业执行教练</h1>
      </header>

      <div className="max-w-2xl mx-auto px-8 py-16 space-y-10">
        {/* Hero */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            从模糊想法<br />到可验证MVP
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            面向AI独立开发者和程序员创业者，30天陪你完成真实创业动作：
            20次用户访谈、1个落地页、1个可演示原型、3个潜在付费线索。
          </p>
        </div>

        {/* Who is this for */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">适合你，如果：</h3>
          <ul className="space-y-2">
            {[
              '你有一个AI产品或SaaS想法',
              '你能自己做原型',
              '你经常卡在方向、验证或持续执行',
              '你愿意每天投入1-2小时',
              '你愿意真的去访谈用户',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What you get */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">30天后，你将获得：</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { n: '20+', label: '用户访谈记录' },
              { n: '1', label: '落地页' },
              { n: '1', label: '可演示原型' },
              { n: '3+', label: '潜在付费线索' },
            ].map(({ n, label }) => (
              <div key={label} className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{n}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <p className="text-gray-500 text-sm">
            第一批只招<strong className="text-gray-700">5人</strong>，免费测试。
            用AI+人工陪跑，每天帮你明确下一步，每周复盘一次。
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            申请免费测试 →
          </Link>
        </div>

        {/* Not for */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">不适合你，如果：</h4>
          <ul className="space-y-1">
            {[
              '你只想听创业课，不想执行',
              '你不愿接触真实用户',
              '你希望AI替你完成所有创业决策',
            ].map((item) => (
              <li key={item} className="text-sm text-gray-400 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
