import React from 'react'
import { Link } from 'react-router-dom'
import { Users, ClipboardList, Package, FileText, CheckCircle, DollarSign } from 'lucide-react'
import Card from '../../components/common/Card'
import { mockCustomers, mockOrders, mockQuotations } from '../../data/mockData'
import { formatCurrency } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'

const stats = [
  { label: 'Total Customers', value: '156', icon: Users, color: 'bg-blue-50 text-blue-700', trend: '+12 this month' },
  { label: 'New Requirements', value: '8', icon: ClipboardList, color: 'bg-amber-50 text-amber-700', trend: '3 pending' },
  { label: 'Active Orders', value: '24', icon: Package, color: 'bg-green-50 text-green-700', trend: 'In production' },
  { label: 'Pending Quotations', value: '12', icon: FileText, color: 'bg-orange-50 text-orange-700', trend: 'Awaiting approval' },
  { label: 'Completed Orders', value: '45', icon: CheckCircle, color: 'bg-stone-100 text-stone-700', trend: 'This month' },
  { label: 'Est. Revenue', value: '₹12.5L', icon: DollarSign, color: 'bg-emerald-50 text-emerald-700', trend: '+18% vs last month' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-stone-500 mt-1">Business overview and analytics</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-500 text-xs font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-stone-900 mt-1">{stat.value}</p>
                <p className="text-[10px] text-stone-400 mt-1">{stat.trend}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="section-title mb-5">Recent Orders</h2>
          <div className="space-y-3">
            {mockOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-stone-900">{order.id}</p>
                  <p className="text-xs text-stone-500">{order.customer} • {order.product}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatCurrency(order.amount)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="section-title mb-5">Pending Actions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div>
                <p className="font-medium text-sm text-stone-900">5 New Requirements</p>
                <p className="text-xs text-stone-500">Awaiting design assignment</p>
              </div>
              <Link to="/staff/requirements" className="text-amber-700 text-sm font-semibold">Assign →</Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <div>
                <p className="font-medium text-sm text-stone-900">3 Quotations Pending</p>
                <p className="text-xs text-stone-500">Customer review pending</p>
              </div>
              <Link to="/admin/quotations" className="text-blue-700 text-sm font-semibold">Follow Up →</Link>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
              <div>
                <p className="font-medium text-sm text-stone-900">2 Orders Ready</p>
                <p className="text-xs text-stone-500">Quality check completed</p>
              </div>
              <Link to="/admin/orders" className="text-green-700 text-sm font-semibold">Dispatch →</Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
