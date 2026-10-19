import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, FolderOpen, ArrowRight } from 'lucide-react'
import { mockDesigns } from '../../data/mockData'
import { formatCurrency } from '../../utils/helpers'
import Card from '../../components/common/Card'

export default function MyDesigns() {
  const myDesigns = mockDesigns.slice(0, 4)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">My Designs</h1>
        <p className="text-stone-500 mt-1">Designs saved and created for you</p>
      </div>
      {myDesigns.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-900 mb-2">No designs yet</h3>
          <p className="text-stone-500 mb-4">Start by exploring designs or submitting a requirement</p>
          <Link to="/customer/design/budget" className="btn-primary">Explore Designs</Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {myDesigns.map((design) => (
            <Card key={design.id} className="overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img src={design.image} alt={design.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-3 right-3">
                  <button className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-stone-900">{design.name}</h3>
                  <span className="text-sm font-bold text-amber-700">{formatCurrency(design.price)}</span>
                </div>
                <p className="text-sm text-stone-500 mb-4">{design.category} • {design.style}</p>
                <Link to={`/customer/design/${design.id}`} className="text-amber-700 text-sm font-semibold hover:text-amber-800 flex items-center gap-1">
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
