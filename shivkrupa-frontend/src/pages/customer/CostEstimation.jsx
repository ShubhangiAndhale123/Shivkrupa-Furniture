import React, { useState } from 'react'
import { Calculator, PieChart } from 'lucide-react'
import Select from '../../components/common/Select'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'

export default function CostEstimation() {
  const [form, setForm] = useState({ productType: '', length: '', width: '', height: '', material: '', finish: '' })
  const [result, setResult] = useState(null)

  const calculate = () => {
    const base = parseFloat(form.length||6) * parseFloat(form.width||2) * parseFloat(form.height||7)
    const mult = { teak: 3500, bwp: 2500, mr: 1800, engineered: 1500, sheesham: 2800 }[form.material] || 2000
    const materialCost = base * mult * 0.5
    setResult({
      material: Math.round(materialCost),
      hardware: Math.round(materialCost*0.15),
      labour: Math.round(materialCost*0.25),
      other: Math.round(materialCost*0.1),
      total: Math.round(materialCost*1.5),
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Get Cost Estimate</h1>
        <p className="text-stone-500 mt-1">Calculate an approximate cost for your furniture</p>
      </div>
      <Card className="p-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Product Type" value={form.productType} onChange={(e)=>setForm({...form,productType:e.target.value})}
            options={[{value:'',label:'Select product'},{value:'door',label:'Door'},{value:'window',label:'Window'},{value:'sofa',label:'Sofa'},{value:'temple',label:'Home Temple'},{value:'wardrobe',label:'Wardrobe'}]} required />
          <div className="grid grid-cols-3 gap-2">
            <Input label="Length (ft)" type="number" value={form.length} onChange={(e)=>setForm({...form,length:e.target.value})} />
            <Input label="Width (ft)" type="number" value={form.width} onChange={(e)=>setForm({...form,width:e.target.value})} />
            <Input label="Height (ft)" type="number" value={form.height} onChange={(e)=>setForm({...form,height:e.target.value})} />
          </div>
          <Select label="Material" value={form.material} onChange={(e)=>setForm({...form,material:e.target.value})}
            options={[{value:'',label:'Select material'},{value:'teak',label:'Teak Wood'},{value:'bwp',label:'BWP Plywood'},{value:'mr',label:'MR Plywood'},{value:'engineered',label:'Engineered Wood'},{value:'sheesham',label:'Sheesham'}]} />
          <Select label="Finish" value={form.finish} onChange={(e)=>setForm({...form,finish:e.target.value})}
            options={[{value:'',label:'Select finish'},{value:'natural',label:'Natural Polish'},{value:'melamine',label:'Melamine'},{value:'pu',label:'PU Polish'},{value:'laminate',label:'Laminate'}]} />
        </div>
        <button onClick={calculate} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
          <Calculator className="w-4 h-4" /> Calculate Estimate
        </button>
      </Card>
      {result && (
        <Card className="p-8 border-2 border-amber-200">
          <h2 className="text-lg font-bold text-stone-900 mb-5 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-600" /> Cost Breakdown
          </h2>
          <div className="space-y-3">
            {[{label:'Material Cost',value:result.material},{label:'Hardware Cost',value:result.hardware},{label:'Labour Cost',value:result.labour},{label:'Other Charges',value:result.other}].map(item=> (
              <div key={item.label} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-600">{item.label}</span>
                <span className="font-semibold text-stone-900">₹{item.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <span className="text-lg font-bold text-stone-900">Estimated Total</span>
              <span className="text-2xl font-bold text-amber-700">₹{result.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-4">*This is an approximate estimate. Final quotation may vary.</p>
        </Card>
      )}
    </div>
  )
}
