import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import {
  LayoutDashboard, FilePlus, Palette, Image, Calculator,
  FolderOpen, FileText, Package, Bell, User, Menu, X,
  ChevronRight, LogOut, Search, Landmark, DoorOpen, Square,
  Sofa, Shirt
} from 'lucide-react'
import logo from '../../assets/logo.png'

const customerNav = [
  { path: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/customer/requirements/new', label: 'New Requirement', icon: FilePlus },
  { path: '/customer/design/budget', label: 'Budget Design', icon: Palette },
  { path: '/customer/design/reference', label: 'Reference Design', icon: Image },
  { path: '/customer/estimation', label: 'Cost Estimate', icon: Calculator },
  { path: '/customer/designs', label: 'My Designs', icon: FolderOpen },
  { path: '/customer/quotations', label: 'Quotations', icon: FileText },
  { path: '/customer/orders', label: 'Orders', icon: Package },
]

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-100 shadow-sidebar
        transform transition-transform duration-300 lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 h-20 px-6 border-b border-stone-100">
          <img src={logo} alt="Shivkrupa" className="h-10 w-auto" />
          <div>
            <h1 className="font-bold text-stone-900 text-sm font-display">SHIVKRUPA</h1>
            <p className="text-[9px] text-stone-500 -mt-0.5 tracking-wider uppercase">Doors & Hardware</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {customerNav.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-100 bg-white">
          <button onClick={handleLogout} className="sidebar-link w-full text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-100 h-16">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-stone-50 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center bg-stone-100 rounded-xl px-4 py-2 w-72">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search designs, orders..."
                  className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-stone-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/customer/quotations" className="relative p-2.5 hover:bg-stone-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-stone-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 p-1.5 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-sm">
                    {user?.name?.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-stone-700">{user?.name?.split(' ')[0]}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="font-semibold text-stone-900 text-sm">{user?.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                        Customer
                      </span>
                    </div>
                    <Link to="/customer/profile" className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50" onClick={() => setProfileOpen(false)}>
                      My Profile
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
