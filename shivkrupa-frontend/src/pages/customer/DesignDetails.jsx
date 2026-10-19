import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Heart, Share2, CheckCircle, Clock, Shield,
  Ruler, Palette, Wrench, AlertTriangle, Sparkles
} from 'lucide-react'
import { mockDesigns } from '../../data/mockData'
import { formatCurrency } from '../../utils/helpers'
import Card from '../../components/common/Card'

export default function DesignDetails() {
  const { id } = useParams()
  const design = mockDesigns.find(d => d.id === id) || mockDesigns[0]
  const [activeImage, setActiveImage] = useState(0)
  const [liked, setLiked] = useState(false)

  const images = [design.image, design.image, design.image]

  return (
    <div className="space-y-6">
      <Link to="/customer/design/budget" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Designs
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100">
            <img src={images[activeImage]} alt={design.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-amber-500' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Design Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">{design.category}</span>
                <h1 className="text-3xl font-bold text-stone-900 mt-3 font-display">{design.name}</h1>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setLiked(!liked)} className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-colors">
                  <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-stone-600'}`} />
                </button>
                <button className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-colors">
                  <Share2 className="w-5 h-5 text-stone-600" />
                </button>
              </div>
            </div>
            <p className="text-stone-500 mt-3 leading-relaxed">{design.description}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <Ruler className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-stone-500">Dimensions</p>
              <p className="font-semibold text-sm text-stone-900">{design.dimensions}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-stone-500">Production</p>
              <p className="font-semibold text-sm text-stone-900">{design.productionTime}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <Shield className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs text-stone-500">Durability</p>
              <p className="font-semibold text-sm text-stone-900">{design.durability}</p>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold text-stone-900 mb-3">Features</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {design.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-stone-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <Card className="p-5">
            <h3 className="font-semibold text-stone-900 mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(design.costBreakdown).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-stone-500 capitalize">{key}</span>
                  <span className="font-medium text-stone-900">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="font-semibold text-stone-900">Estimated Total</span>
                <span className="text-xl font-bold text-amber-700">{formatCurrency(design.price)}</span>
              </div>
            </div>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Estimated cost may vary based on final dimensions, materials, hardware, design changes, labour and other production factors.
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/customer/quotations" className="btn-accent flex-1 text-center">
              <Sparkles className="w-4 h-4 inline mr-2" /> Request Quotation
            </Link>
            <button className="btn-secondary flex-1">
              <Heart className="w-4 h-4 inline mr-2" /> Save Design
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
