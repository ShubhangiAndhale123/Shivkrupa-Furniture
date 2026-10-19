import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import { mockOrders } from '../../data/mockData'
import { formatCurrency, formatDate } from '../../utils/helpers'
import Card from '../../components/common/Card'
import StatusBadge from '../../components/common/StatusBadge'

export default function CustomerOrders() {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const order = selectedOrder ? mockOrders.find(o => o.id === selectedOrder) : null

  if (selectedOrder && order) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedOrder(null)} className="text-stone-500 hover:text-stone-800 text-sm font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">{order.id}</h1>
            <p className="text-stone-500 mt-1">{order.design}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="section-title mb-6">Order Timeline</h2>
              <div className="relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-stone-200" />
                {order.timeline.map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 py-3">
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${item.completed ? 'bg-green-500 border-green-500 text-white' : ''} ${item.current ? 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100' : ''} ${!item.completed && !item.current ? 'bg-white border-stone-300 text-stone-400' : ''}`}>
                      {item.completed ? <CheckCircle className="w-5 h-5" /> : item.current ? <Clock className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-stone-300" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`font-medium ${item.completed || item.current ? 'text-stone-900' : 'text-stone-400'}`}>{item.step}</p>
                      {item.date && <p className="text-xs text-stone-400 mt-0.5">{item.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-stone-900 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">Product</span><span className="font-medium">{order.product}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Design</span><span className="font-medium text-right">{order.design}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Amount</span><span className="font-bold text-amber-700">{formatCurrency(order.amount)}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Order Date</span><span>{formatDate(order.orderDate)}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Expected By</span><span>{formatDate(order.expectedCompletion)}</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Orders</h1>
        <p className="text-stone-500 mt-1">Track and manage your orders</p>
      </div>
      <div className="space-y-4">
        {mockOrders.map((order) => (
          <Card key={order.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrder(order.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-stone-900">{order.id}</h3>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-stone-600">{order.design}</p>
                  <p className="text-xs text-stone-400 mt-1">Expected: {formatDate(order.expectedCompletion)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-bold text-stone-900">{formatCurrency(order.amount)}</p>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
