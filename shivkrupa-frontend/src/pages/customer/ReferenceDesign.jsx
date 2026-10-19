import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, X, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Card from '../../components/common/Card'

export default function ReferenceDesign() {
  const [image, setImage] = useState(null)
  const [analyzed, setAnalyzed] = useState(false)
  const [form, setForm] = useState({ productType: '', length: '', width: '', height: '', material: '', notes: '' })

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = () => setAnalyzed(true)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Estimate From Your Design</h1>
        <p className="text-stone-500 mt-1">Upload a reference image and get a preliminary cost estimate</p>
      </div>
      <Card className="p-8">
        {!image ? (
          <label className="border-2 border-dashed border-stone-300 rounded-2xl p-12 text-center hover:border-amber-400 hover:bg-amber-50/20 transition-all cursor-pointer block">
            <Upload className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <p className="text-stone-700 font-medium">Click to upload or drag and drop</p>
            <p className="text-sm text-stone-400 mt-1">JPG, PNG up to 5MB</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        ) : (
          <div className="relative rounded-2xl overflow-hidden">
            <img src={image} alt="Reference" className="w-full max-h-80 object-contain bg-stone-100" />
            <button onClick={() => { setImage(null); setAnalyzed(false) }} className="absolute top-3 right-3 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </Card>
      <Card className="p-8">
        <h2 className="text-lg font-bold text-stone-900 mb-5">Product Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Product Type" value={form.productType} onChange={(e) => setForm({...form, productType: e.target.value})}
            options={[{value:'',label:'Select type'},{value:'door',label:'Door'},{value:'window',label:'Window'},{value:'sofa',label:'Sofa'},{value:'temple',label:'Home Temple'},{value:'wardrobe',label:'Wardrobe'}]} required />
          <div className="grid grid-cols-3 gap-2">
            <Input label="L" type="number" placeholder="ft" value={form.length} onChange={(e) => setForm({...form, length: e.target.value})} />
            <Input label="W" type="number" placeholder="ft" value={form.width} onChange={(e) => setForm({...form, width: e.target.value})} />
            <Input label="H" type="number" placeholder="ft" value={form.height} onChange={(e) => setForm({...form, height: e.target.value})} />
          </div>
          <Select label="Preferred Material" value={form.material} onChange={(e) => setForm({...form, material: e.target.value})}
            options={[{value:'',label:'Select material'},{value:'teak',label:'Teak Wood'},{value:'bwp',label:'BWP Plywood'},{value:'mr',label:'MR Plywood'},{value:'engineered',label:'Engineered Wood'}]} />
          <div />
        </div>
        <Textarea label="Additional Notes" placeholder="Any specific details..." value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={3} className="mt-4" />
        <button onClick={handleAnalyze} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" /> Analyze Design
        </button>
      </Card>
      {analyzed && (
        <Card className="p-8 border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-stone-900">Preliminary AI-Assisted Analysis</h3>
          </div>
          <div className="bg-amber-50 rounded-xl p-5 space-y-3">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-stone-500">Detected Product:</span> <span className="font-semibold text-stone-900 capitalize">{form.productType || 'Furniture'}</span></div>
              <div><span className="text-stone-500">Style:</span> <span className="font-semibold text-stone-900">Modern</span></div>
              <div><span className="text-stone-500">Estimated Material:</span> <span className="font-semibold text-stone-900">{form.material ? form.material.charAt(0).toUpperCase()+form.material.slice(1) : 'Plywood'}</span></div>
              <div><span className="text-stone-500">Complexity:</span> <span className="font-semibold text-stone-900">Medium</span></div>
            </div>
            <div className="pt-3 border-t border-amber-200">
              <p className="text-stone-600">Estimated Cost Range:</p>
              <p className="text-2xl font-bold text-amber-700">₹35,000 — ₹42,000</p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-stone-500">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p>Final design and quotation will be validated by the company's design/estimation team. This is a preliminary analysis only.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
