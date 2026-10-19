import React from 'react'
import { mockOrders } from '../../data/mockData'
import { formatCurrency, formatDate } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Card from '../../components/common/Card'

export default function StaffOrders() {
  return (
    <div className="space-y-6">
      <h1 className="page-title">Orders</h1>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 font-medium">
              <tr>
                <th className="text-left p-4">Order ID</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Expected</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map(order => (
                <tr key={order.id} className="border-t border-stone-100">
                  <td className="p-4 font-medium">{order.id}</td>
                  <td className="p-4">{order.customer}</td>
                  <td className="p-4">{order.product}</td>
                  <td className="p-4 font-semibold">{formatCurrency(order.amount)}</td>
                  <td className="p-4 text-stone-500">{formatDate(order.expectedCompletion)}</td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
