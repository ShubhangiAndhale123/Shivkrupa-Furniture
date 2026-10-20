import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ClipboardList, Palette, Calculator, FileText, Package, CheckCircle } from 'lucide-react'
import Card from '../../components/common/Card'
import { mockRequirements, mockOrders } from '../../data/mockData'
import { formatCurrency, formatDate } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'

const stats = [
  { label: 'New Requirements', value: '5', icon: ClipboardList, color: 'bg-blue-50 text-blue-700' },
  { label: 'Pending Designs', value: '3', icon: Palette, color: 'bg-purple-50 text-purple-700' },
  { label: 'Pending Estimates', value: '2', icon: Calculator, color: 'bg-amber-50 text-amber-700' },
  { label: 'Pending Quotations', value: '4', icon: FileText, color: 'bg-orange-50 text-orange-700' },
  { label: 'Active Orders', value: '8', icon: Package, color: 'bg-green-50 text-green-700' },
  { label: 'Completed', value: '12', icon: CheckCircle, color: 'bg-stone-100 text-stone-700' },
]

export default function StaffDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Staff Dashboard — {user?.name || 'Staff Member'}</h1>
        <p className="text-stone-500 mt-1">
          {user?.department ? `${user.department} Department • ` : ''}Overview of design requirements, estimations, and customer orders
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-500 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Recent Requirements</h2>
            <Link to="/staff/requirements" className="text-amber-700 text-sm font-semibold">View All</Link>
          </div>
          <div className="space-y-3">
            {mockRequirements.slice(0, 4).map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-stone-900">{req.id}</p>
                  <p className="text-xs text-stone-500">{req.customer} • {req.product}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Recent Orders</h2>
            <Link to="/staff/orders" className="text-amber-700 text-sm font-semibold">View All</Link>
          </div>
          <div className="space-y-3">
            {mockOrders.slice(0, 4).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-stone-900">{order.id}</p>
                  <p className="text-xs text-stone-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatCurrency(order.amount)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
