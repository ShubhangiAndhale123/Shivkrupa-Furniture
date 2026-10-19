import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, Eye, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react'
import { mockQuotations } from '../../data/mockData'
import { formatCurrency, formatDate } from '../../utils/helpers'
import Card from '../../components/common/Card'
import StatusBadge from '../../components/common/StatusBadge'

export default function CustomerQuotations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Quotations</h1>
          <p className="text-stone-500 mt-1">Review and manage your quotations</p>
        </div>
      </div>
      <div className="space-y-4">
        {mockQuotations.map((qt) => (
          <Card key={qt.id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-stone-900">{qt.id}</h3>
                    <StatusBadge status={qt.status} />
                  </div>
                  <p className="text-sm text-stone-600">{qt.design}</p>
                  <p className="text-xs text-stone-400 mt-1">Valid until {formatDate(qt.validUntil)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 lg:text-right">
                <div>
                  <p className="text-2xl font-bold text-stone-900">{formatCurrency(qt.amount)}</p>
                  <p className="text-xs text-stone-400">{formatDate(qt.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 bg-stone-100 rounded-xl hover:bg-stone-200" title="View"><Eye className="w-4 h-4 text-stone-600" /></button>
                <button className="p-2.5 bg-stone-100 rounded-xl hover:bg-stone-200" title="Download"><Download className="w-4 h-4 text-stone-600" /></button>
                {qt.status === 'Sent' && (
                  <>
                    <button className="p-2.5 bg-green-50 rounded-xl hover:bg-green-100" title="Approve"><CheckCircle className="w-4 h-4 text-green-600" /></button>
                    <button className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100" title="Reject"><XCircle className="w-4 h-4 text-red-600" /></button>
                  </>
                )}
                {qt.status === 'Under Review' && (
                  <button className="p-2.5 bg-amber-50 rounded-xl hover:bg-amber-100" title="Request Revision"><RefreshCw className="w-4 h-4 text-amber-600" /></button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
