import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Package, FileText, Palette, CheckCircle, Clock, ArrowRight,
  TrendingUp, Sparkles, Phone
} from 'lucide-react'
import { mockOrders, mockQuotations } from '../../data/mockData'
import { formatCurrency, formatDate } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Card from '../../components/common/Card'

const stats = [
  { label: 'Active Orders', value: '2', icon: Package, color: 'bg-blue-50 text-blue-700', trend: '+1 this month' },
  { label: 'Pending Quotations', value: '3', icon: FileText, color: 'bg-amber-50 text-amber-700', trend: '2 under review' },
  { label: 'My Designs', value: '5', icon: Palette, color: 'bg-purple-50 text-purple-700', trend: '1 new' },
  { label: 'Completed', value: '4', icon: CheckCircle, color: 'bg-green-50 text-green-700', trend: 'All delivered' },
]

const quickActions = [
  { label: 'New Requirement', desc: 'Submit a new furniture request', icon: Sparkles, path: '/customer/requirements/new', color: 'bg-amber-600' },
  { label: 'Budget Design', desc: 'Find designs within your budget', icon: TrendingUp, path: '/customer/design/budget', color: 'bg-stone-800' },
  { label: 'Upload Reference', desc: 'Get estimate from your design', icon: Palette, path: '/customer/design/reference', color: 'bg-stone-600' },
  { label: 'Track Order', desc: 'Check your order status', icon: Clock, path: '/customer/orders', color: 'bg-amber-700' },
]

const timelineSteps = [
  { step: 'Requirement Submitted', completed: true, date: '15 Aug 2026' },
  { step: 'Design Prepared', completed: true, date: '16 Aug 2026' },
  { step: 'Quotation Sent', completed: true, date: '16 Aug 2026' },
  { step: 'Quotation Approved', completed: true, date: '17 Aug 2026' },
  { step: 'Production', completed: false, current: true, date: 'In Progress' },
  { step: 'Quality Check', completed: false, current: false, date: 'Pending' },
  { step: 'Ready', completed: false, current: false, date: 'Pending' },
  { step: 'Completed', completed: false, current: false, date: 'Pending' },
]

export default function CustomerDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
          <p className="text-stone-500 mt-1">Here's what's happening with your projects</p>
        </div>
        <Link to="/customer/requirements/new" className="btn-accent inline-flex items-center gap-2 self-start">
          <Sparkles className="w-4 h-4" /> New Requirement
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-500 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-stone-900 mt-2">{stat.value}</p>
                <p className="text-xs text-stone-400 mt-1">{stat.trend}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Order Timeline + Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Order Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title">Order Progress</h2>
                <p className="text-sm text-stone-500 mt-1">ORD-2026-0045 — Premium Teak Main Door</p>
              </div>
              <StatusBadge status="Production" />
            </div>

            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-stone-200" />
              <div className="space-y-0">
                {timelineSteps.map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 py-3">
                    <div className={`
                      relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0
                      ${item.completed ? 'bg-green-500 border-green-500 text-white' : ''}
                      ${item.current ? 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100' : ''}
                      ${!item.completed && !item.current ? 'bg-white border-stone-300 text-stone-400' : ''}
                    `}>
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : item.current ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`font-medium text-sm ${item.completed || item.current ? 'text-stone-900' : 'text-stone-400'}`}>
                        {item.step}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
              <p className="text-sm text-stone-500">
                Expected completion: <span className="font-semibold text-stone-900">28 Aug 2026</span>
              </p>
              <Link to="/customer/orders" className="text-amber-700 text-sm font-semibold hover:text-amber-800 flex items-center gap-1">
                View Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          {/* Quick Actions */}
          <div>
            <h2 className="section-title mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.path}
                  className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">{action.label}</h3>
                    <p className="text-sm text-stone-500 mt-0.5">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Recent Quotations & Notifications */}
        <div className="space-y-8">
          {/* Recent Quotations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">Recent Quotations</h2>
              <Link to="/customer/quotations" className="text-amber-700 text-sm font-semibold hover:text-amber-800">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {mockQuotations.slice(0, 3).map((qt) => (
                <div key={qt.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-stone-900">{qt.id}</p>
                    <p className="text-xs text-stone-500">{qt.design}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-stone-900">{formatCurrency(qt.amount)}</p>
                    <StatusBadge status={qt.status} className="text-[10px]" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">Recent Orders</h2>
              <Link to="/customer/orders" className="text-amber-700 text-sm font-semibold hover:text-amber-800">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {mockOrders.slice(0, 2).map((order) => (
                <div key={order.id} className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm text-stone-900">{order.id}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-stone-600">{order.design}</p>
                  <div className="flex items-center justify-between mt-3 text-xs text-stone-500">
                    <span>{formatCurrency(order.amount)}</span>
                    <span>Due: {formatDate(order.expectedCompletion)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Support Card */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Need Help?</h3>
            <p className="text-stone-400 text-sm mb-4">Our team is here to assist you with your requirements.</p>
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <Phone className="w-4 h-4" />
              <span>+91 98765 43210</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
