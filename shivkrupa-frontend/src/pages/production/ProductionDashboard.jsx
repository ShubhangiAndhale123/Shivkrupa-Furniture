import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Card from '../../components/common/Card'
import { mockOrders } from '../../data/mockData'
import { formatCurrency, formatDate } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'

const stats = [
  { label: 'Assigned Orders', value: '6', icon: Package, color: 'bg-blue-50 text-blue-700' },
  { label: 'In Production', value: '4', icon: Clock, color: 'bg-amber-50 text-amber-700' },
  { label: 'Pending', value: '2', icon: AlertCircle, color: 'bg-orange-50 text-orange-700' },
  { label: 'Completed', value: '8', icon: CheckCircle, color: 'bg-green-50 text-green-700' },
]

export default function ProductionDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Production Dashboard — {user?.name || 'Production Team'}</h1>
        <p className="text-stone-500 mt-1">Manage approved production orders, manufacturing progress, and delivery timelines</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
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
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Assigned Orders</h2>
          <Link to="/production/orders" className="text-amber-700 text-sm font-semibold">View All</Link>
        </div>
        <div className="space-y-3">
          {mockOrders.map(order => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div>
                <p className="font-medium text-sm text-stone-900">{order.id}</p>
                <p className="text-xs text-stone-500">{order.customer} • {order.design}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-stone-500">Due: {formatDate(order.expectedCompletion)}</p>
                  <StatusBadge status={order.status} />
                </div>
                <Link to="/production/orders" className="btn-primary text-xs py-2 px-4">Update</Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
