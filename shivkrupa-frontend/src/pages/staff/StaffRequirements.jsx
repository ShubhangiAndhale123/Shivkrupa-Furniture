import React from 'react'
import { mockRequirements } from '../../data/mockData'
import { formatCurrency, formatDate } from '../../utils/helpers'
import StatusBadge from '../../components/common/StatusBadge'
import Card from '../../components/common/Card'

export default function StaffRequirements() {
  return (
    <div className="space-y-6">
      <h1 className="page-title">Customer Requirements</h1>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600 font-medium">
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Budget</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockRequirements.map(req => (
                <tr key={req.id} className="border-t border-stone-100">
                  <td className="p-4 font-medium">{req.id}</td>
                  <td className="p-4">{req.customer}</td>
                  <td className="p-4">{req.product}</td>
                  <td className="p-4">{formatCurrency(req.budget)}</td>
                  <td className="p-4 text-stone-500">{formatDate(req.date)}</td>
                  <td className="p-4"><StatusBadge status={req.status} /></td>
                  <td className="p-4"><button className="text-amber-700 font-medium text-sm hover:text-amber-800">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
