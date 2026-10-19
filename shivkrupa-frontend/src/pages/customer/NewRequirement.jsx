import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, DoorOpen, Square, Sofa, Landmark, Shirt,
  Upload, CheckCircle, Ruler, Palette, Wallet, Image, FileText
} from 'lucide-react'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'

const productTypes = [
  { value: 'door', label: 'Door', icon: DoorOpen, desc: 'Main doors, room doors, custom designs' },
  { value: 'window', label: 'Window', icon: Square, desc: 'Sliding, casement, and custom windows' },
  { value: 'sofa', label: 'Sofa', icon: Sofa, desc: 'Sectional, traditional, and custom sofas' },
  { value: 'temple', label: 'Home Temple', icon: Landmark, desc: 'Carved temples and modern mandirs' },
  { value: 'wardrobe', label: 'Wardrobe', icon: Shirt, desc: 'Sliding and hinged door wardrobes' },
]

const materials = [
  { value: 'teak', label: 'Solid Teak Wood' },
  { value: 'bwp', label: 'BWP Plywood' },
  { value: 'mr', label: 'MR Plywood' },
  { value: 'sheesham', label: 'Sheesham Wood' },
  { value: 'engineered', label: 'Engineered Wood' },
]

const finishes = [
  { value: 'natural', label: 'Natural Polish' },
  { value: 'melamine', label: 'Melamine Finish' },
  { value: 'pu', label: 'PU Polish' },
  { value: 'laminate', label: 'Laminate Finish' },
  { value: 'veneer', label: 'Veneer Finish' },
]

const styles = [
  { value: 'traditional', label: 'Traditional' },
  { value: 'modern', label: 'Modern' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'simple', label: 'Simple & Clean' },
]

export default function NewRequirement() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    productType: '',
    length: '',
    width: '',
    height: '',
    unit: 'ft',
    material: '',
    finish: '',
    color: '',
    style: '',
    hardware: '',
    additional: '',
    minBudget: '',
    maxBudget: '',
    referenceImage: null,
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  const totalSteps = 6

  const validateStep = () => {
    const newErrors = {}
    if (step === 1 && !form.productType) newErrors.productType = 'Please select a product type'
    if (step === 2) {
      if (!form.length) newErrors.length = 'Required'
      if (!form.width) newErrors.width = 'Required'
      if (!form.height) newErrors.height = 'Required'
    }
    if (step === 4) {
      if (!form.minBudget) newErrors.minBudget = 'Required'
      if (!form.maxBudget) newErrors.maxBudget = 'Required'
      if (parseFloat(form.minBudget) >= parseFloat(form.maxBudget)) {
        newErrors.maxBudget = 'Max budget must be greater than min budget'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep()) {
      if (step < totalSteps) setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => navigate('/customer/dashboard'), 2000)
  }

  const stepLabels = ['Product', 'Dimensions', 'Preferences', 'Budget', 'Reference', 'Review']

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Requirement Submitted!</h2>
          <p className="text-stone-500 mb-6">Our design team will review your requirement and get back to you within 24 hours.</p>
          <Button onClick={() => navigate('/customer/dashboard')}>Go to Dashboard</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="page-title">New Requirement</h1>
        <p className="text-stone-500 mt-1">Tell us what you need and we'll design it for you</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1
            const isActive = step === stepNum
            const isCompleted = step > stepNum
            return (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isActive ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : ''}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'bg-stone-100 text-stone-400' : ''}
                `}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                <span className={`text-xs mt-2 font-medium ${isActive ? 'text-amber-700' : 'text-stone-400'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-4 h-1 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-600 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-8">
        {/* Step 1: Product Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <DoorOpen className="w-6 h-6 text-amber-700" />
              <h2 className="text-xl font-bold text-stone-900">Select Product Type</h2>
            </div>
            <p className="text-stone-500">Choose the type of furniture or fixture you need</p>

            {errors.productType && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{errors.productType}</p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {productTypes.map((product) => {
                const Icon = product.icon
                const isSelected = form.productType === product.value
                return (
                  <button
                    key={product.value}
                    onClick={() => {
                      setForm({ ...form, productType: product.value })
                      setErrors({})
                    }}
                    className={`
                      p-5 rounded-2xl border-2 text-left transition-all duration-200
                      ${isSelected
                        ? 'border-amber-500 bg-amber-50 shadow-md'
                        : 'border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'}
                      `}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`font-bold ${isSelected ? 'text-amber-900' : 'text-stone-900'}`}>
                          {product.label}
                        </h3>
                        <p className={`text-sm mt-1 ${isSelected ? 'text-amber-700' : 'text-stone-500'}`}>
                          {product.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Dimensions */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Ruler className="w-6 h-6 text-amber-700" />
              <h2 className="text-xl font-bold text-stone-900">Enter Dimensions</h2>
            </div>
            <p className="text-stone-500">Provide the approximate dimensions for your {form.productType}</p>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Length"
                type="number"
                placeholder="0"
                value={form.length}
                onChange={(e) => setForm({ ...form, length: e.target.value })}
                error={errors.length}
                required
              />
              <Input
                label="Width"
                type="number"
                placeholder="0"
                value={form.width}
                onChange={(e) => setForm({ ...form, width: e.target.value })}
                error={errors.width}
                required
              />
              <Input
                label="Height"
                type="number"
                placeholder="0"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                error={errors.height}
                required
              />
            </div>
            <Select
              label="Unit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              options={[
                { value: 'ft', label: 'Feet (ft)' },
                { value: 'in', label: 'Inches (in)' },
                { value: 'cm', label: 'Centimeters (cm)' },
                { value: 'm', label: 'Meters (m)' },
              ]}
            />
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Palette className="w-6 h-6 text-amber-700" />
              <h2 className="text-xl font-bold text-stone-900">Design Preferences</h2>
            </div>
            <p className="text-stone-500">Tell us about your material and style preferences</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Preferred Material"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                options={materials}
              />
              <Select
                label="Finish Type"
                value={form.finish}
                onChange={(e) => setForm({ ...form, finish: e.target.value })}
                options={finishes}
              />
              <Select
                label="Style"
                value={form.style}
                onChange={(e) => setForm({ ...form, style: e.target.value })}
                options={styles}
              />
              <Input
                label="Preferred Color"
                placeholder="e.g., Walnut, Natural, White"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
            <Textarea
              label="Hardware & Additional Requirements"
              placeholder="Any specific hardware, handles, or other requirements..."
              value={form.hardware}
              onChange={(e) => setForm({ ...form, hardware: e.target.value })}
              rows={3}
            />
          </div>
        )}

        {/* Step 4: Budget */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-6 h-6 text-amber-700" />
              <h2 className="text-xl font-bold text-stone-900">Your Budget</h2>
            </div>
            <p className="text-stone-500">Help us recommend designs within your budget range</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Budget (₹)"
                type="number"
                placeholder="e.g., 20000"
                value={form.minBudget}
                onChange={(e) => setForm({ ...form, minBudget: e.target.value })}
                error={errors.minBudget}
                required
              />
              <Input
                label="Maximum Budget (₹)"
                type="number"
                placeholder="e.g., 50000"
                value={form.maxBudget}
                onChange={(e) => setForm({ ...form, maxBudget: e.target.value })}
                error={errors.maxBudget}
                required
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> A wider budget range gives us more flexibility to recommend the best designs for you.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Reference */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Image className="w-6 h-6 text-amber-700" />
              <h2 className="text-xl font-bold text-stone-900">Reference & Notes</h2>
            </div>
            <p className="text-stone-500">Upload a reference image or add any additional notes</p>

            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-10 text-center hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer">
              <Upload className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <p className="text-stone-600 font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-stone-400 mt-1">JPG, PNG up to 5MB</p>
            </div>

            <Textarea
              label="Additional Notes"
              placeholder="Any specific requirements, preferences, or details you'd like to share..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={4}
            />
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-amber-700" />
              <h2 className="text-xl font-bold text-stone-900">Review Your Requirement</h2>
            </div>
            <p className="text-stone-500">Please review all details before submission</p>

            <div className="space-y-4">
              <div className="bg-stone-50 rounded-xl p-5">
                <h3 className="font-semibold text-stone-900 mb-3">Product Details</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-stone-500">Type:</span> <span className="font-medium text-stone-900 capitalize">{form.productType}</span></div>
                  <div><span className="text-stone-500">Dimensions:</span> <span className="font-medium text-stone-900">{form.length} x {form.width} x {form.height} {form.unit}</span></div>
                  <div><span className="text-stone-500">Material:</span> <span className="font-medium text-stone-900">{form.material || 'Not specified'}</span></div>
                  <div><span className="text-stone-500">Style:</span> <span className="font-medium text-stone-900">{form.style || 'Not specified'}</span></div>
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-5">
                <h3 className="font-semibold text-stone-900 mb-3">Budget</h3>
                <p className="text-sm text-stone-700">
                  ₹{form.minBudget} — ₹{form.maxBudget}
                </p>
              </div>

              {form.notes && (
                <div className="bg-stone-50 rounded-xl p-5">
                  <h3 className="font-semibold text-stone-900 mb-3">Additional Notes</h3>
                  <p className="text-sm text-stone-700">{form.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="btn-secondary disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4 inline mr-1" /> Back
          </button>

          <div className="flex gap-3">
            {step < totalSteps ? (
              <button onClick={nextStep} className="btn-primary">
                Continue <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-accent">
                Submit Requirement
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
