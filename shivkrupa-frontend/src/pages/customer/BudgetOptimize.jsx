import React from 'react'
import { TrendingDown, ArrowRight } from 'lucide-react'
import Card from '../../components/common/Card'
import { formatCurrency } from '../../utils/helpers'

export default function BudgetOptimize() {
  const current = 52000, target = 45000
  const options = [
    { name: 'Alternative Material', current: 'BWP Plywood', alternative: 'Engineered Wood', saving: 4000 },
    { name: 'Simplified Structure', current: 'Full internal shelves', alternative: 'Basic hanging + 2 shelves', saving: 2500 },
    { name: 'Standard Hardware', current: 'Premium soft-close', alternative: 'Standard hinges', saving: 1800 },
  ]
  const totalSaving = options.reduce((s, o) => s + o.saving, 0)
  const optimized = current - totalSaving

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Budget Optimization</h1>
        <p className="text-stone-500 mt-1">Find ways to reduce your estimate</p>
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div><p className="text-sm text-stone-500">Current Estimate</p><p className="text-2xl font-bold text-stone-900">{formatCurrency(current)}</p></div>
          <div className="text-right"><p className="text-sm text-stone-500">Your Target</p><p className="text-2xl font-bold text-amber-700">{formatCurrency(target)}</p></div>
        </div>
      </Card>
      <h2 className="section-title">Optimization Suggestions</h2>
      <div className="space-y-4">
        {options.map((opt, idx) => (
          <Card key={idx} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-stone-900">{opt.name}</h3>
                <p className="text-sm text-stone-500 mt-1">Current: {opt.current}</p>
                <p className="text-sm text-amber-700 mt-0.5">Alternative: {opt.alternative}</p>
              </div>
              <div className="text-right"><p className="text-lg font-bold text-green-600">-₹{opt.saving.toLocaleString('en-IN')}</p></div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">Potential Optimized Estimate</p>
            <p className="text-3xl font-bold text-green-800">{formatCurrency(optimized)}</p>
          </div>
          <button className="btn-primary bg-green-700 hover:bg-green-800">Apply Options <ArrowRight className="w-4 h-4 inline ml-1" /></button>
        </div>
      </Card>
    </div>
  )
}
