import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { mockDesigns } from '../../data/mockData'
import { formatCurrency } from '../../utils/helpers'
import Card from '../../components/common/Card'

export default function DesignCompare() {
  const compareDesigns = mockDesigns.slice(0, 3)
  return (
    <div className="space-y-6">
      <Link to="/customer/design/budget" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Designs
      </Link>
      <div>
        <h1 className="page-title">Compare Designs</h1>
        <p className="text-stone-500 mt-1">Compare up to 3 designs side by side</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="text-left p-4 text-stone-500 font-medium text-sm">Feature</th>
              {compareDesigns.map(d => (
                <th key={d.id} className="p-4 text-center min-w-[220px]">
                  <img src={d.image} alt={d.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                  <p className="font-bold text-stone-900 text-sm">{d.name}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { label: 'Price', render: (d) => <span className="font-bold text-amber-700 text-lg">{formatCurrency(d.price)}</span> },
              { label: 'Material', render: (d) => d.material },
              { label: 'Dimensions', render: (d) => d.dimensions },
              { label: 'Style', render: (d) => d.style },
              { label: 'Production Time', render: (d) => d.productionTime },
              { label: 'Durability', render: (d) => d.durability },
              { label: 'Features', render: (d) => (
                <ul className="space-y-1 text-left">
                  {d.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-center gap-1 text-xs"><CheckCircle className="w-3 h-3 text-green-500" /> {f}</li>
                  ))}
                </ul>
              )},
            ].map((row, idx) => (
              <tr key={idx} className="border-t border-stone-100">
                <td className="p-4 text-stone-500 font-medium">{row.label}</td>
                {compareDesigns.map(d => (
                  <td key={d.id} className="p-4 text-center text-stone-700">{row.render(d)}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-stone-100">
              <td className="p-4" />
              {compareDesigns.map(d => (
                <td key={d.id} className="p-4 text-center">
                  <Link to={`/customer/design/${d.id}`} className="btn-primary text-xs py-2 px-4">Select</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
