import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, SlidersHorizontal, ArrowUpDown, Star, Clock, Shield,
  ChevronRight, Heart, Filter, X
} from 'lucide-react'
import { mockDesigns } from '../../data/mockData'
import { formatCurrency } from '../../utils/helpers'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'

export default function BudgetDesign() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recommended')
  const [filters, setFilters] = useState({
    category: '',
    material: '',
    style: '',
    minPrice: '',
    maxPrice: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState([])

  const categories = [
    { value: 'door', label: 'Doors' },
    { value: 'window', label: 'Windows' },
    { value: 'sofa', label: 'Sofas' },
    { value: 'temple', label: 'Temples' },
    { value: 'wardrobe', label: 'Wardrobes' },
  ]

  const materials = [
    { value: 'teak', label: 'Teak Wood' },
    { value: 'bwp', label: 'BWP Plywood' },
    { value: 'mr', label: 'MR Plywood' },
    { value: 'engineered', label: 'Engineered Wood' },
    { value: 'sheesham', label: 'Sheesham' },
  ]

  const styles = [
    { value: 'traditional', label: 'Traditional' },
    { value: 'modern', label: 'Modern' },
    { value: 'contemporary', label: 'Contemporary' },
    { value: 'simple', label: 'Simple' },
  ]

  let filtered = mockDesigns.filter(d => {
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase()) && !d.category.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filters.category && d.category.toLowerCase() !== filters.category) return false
    if (filters.material && !d.material.toLowerCase().includes(filters.material)) return false
    if (filters.style && d.style.toLowerCase() !== filters.style) return false
    if (filters.minPrice && d.price < parseFloat(filters.minPrice)) return false
    if (filters.maxPrice && d.price > parseFloat(filters.maxPrice)) return false
    return true
  })

  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price)
  if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price)
  if (sortBy === 'time') filtered.sort((a, b) => a.productionTime.localeCompare(b.productionTime))

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Design Within Your Budget</h1>
        <p className="text-stone-500 mt-1">Explore designs curated for your needs and budget</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11 w-full"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-amber-500 text-amber-700' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={[
            { value: 'recommended', label: 'Recommended' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
            { value: 'time', label: 'Production Time' },
          ]}
          className="w-48"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-stone-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select label="Category" value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} options={[{value:'',label:'All'},...categories]} />
            <Select label="Material" value={filters.material} onChange={(e) => setFilters({...filters, material: e.target.value})} options={[{value:'',label:'All'},...materials]} />
            <Select label="Style" value={filters.style} onChange={(e) => setFilters({...filters, style: e.target.value})} options={[{value:'',label:'All'},...styles]} />
            <Input label="Min Price" type="number" placeholder="₹" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} />
            <Input label="Max Price" type="number" placeholder="₹" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} />
          </div>
        </Card>
      )}

      {/* Results Count */}
      <p className="text-sm text-stone-500">Showing {filtered.length} design{filtered.length !== 1 ? 's' : ''}</p>

      {/* Design Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((design) => (
          <div key={design.id} className="group card-premium overflow-hidden">
            <div className="relative h-52 overflow-hidden">
              <img src={design.image} alt={design.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <button
                onClick={() => toggleFavorite(design.id)}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <Heart className={`w-4 h-4 ${favorites.includes(design.id) ? 'fill-red-500 text-red-500' : 'text-stone-600'}`} />
              </button>
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-white font-bold text-lg">{formatCurrency(design.price)}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-stone-900">{design.name}</h3>
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">{design.category}</span>
              </div>
              <p className="text-sm text-stone-500 mb-4 line-clamp-2">{design.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="flex items-center gap-1.5 text-stone-600">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>{design.material}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-600">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{design.productionTime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-600">
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                  <span>{design.style}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-600">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>{design.durability}</span>
                </div>
              </div>

              <Link
                to={`/customer/design/${design.id}`}
                className="btn-primary w-full text-center text-sm py-2.5"
              >
                View Details <ChevronRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-900 mb-2">No designs found</h3>
          <p className="text-stone-500">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  )
}
