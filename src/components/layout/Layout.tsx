import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  MessageSquare,
  Users,
  Target,
  BarChart3,
  Shield,
  Home,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/today', label: '今日任务', icon: CalendarDays },
  { to: '/plan', label: '30天计划', icon: CheckSquare },
  { to: '/interviews', label: '用户访谈', icon: Users },
  { to: '/leads', label: '潜在线索', icon: Target },
  { to: '/coach', label: 'AI教练', icon: MessageSquare },
  { to: '/review', label: '复盘', icon: BarChart3 },
  { to: '/admin', label: '管理后台', icon: Shield },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">创业执行教练</h1>
          <p className="text-xs text-gray-400 mt-0.5">30天AI陪跑</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <LayoutDashboard size={16} />
            主控台
          </NavLink>

          {NAV_ITEMS.slice(1).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
              创
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">测试用户</p>
              <p className="text-xs text-gray-400">AI创业者</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
