import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CheckCircle, Ruler, Palette, Calculator,
  FileText, Package, Shield, Eye, Clock, Users, Star,
  ChevronRight, Upload, TrendingDown, DoorOpen, Square,
  Sofa, Landmark, Shirt, Sparkles, Award, HeartHandshake,
  Phone
} from 'lucide-react'
import logo from '../../assets/logo.png'

const productCards = [
  {
    icon: DoorOpen,
    title: 'Wooden Doors',
    desc: 'Premium teak, flush, and custom-designed doors for your home entrance and interiors.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&h=350&fit=crop',
    price: 'From ₹12,000',
  },
  {
    icon: Square,
    title: 'Wooden Windows',
    desc: 'Elegant sliding and casement windows with toughened glass and mosquito mesh.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=350&fit=crop',
    price: 'From ₹15,000',
  },
  {
    icon: Sofa,
    title: 'Custom Sofas',
    desc: 'Handcrafted sectional and traditional sofas with premium upholstery and solid frames.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=350&fit=crop',
    price: 'From ₹38,000',
  },
  {
    icon: Landmark,
    title: 'Home Temples',
    desc: 'Beautifully carved wooden pooja mandirs and modern home temples for your sacred space.',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=500&h=350&fit=crop',
    price: 'From ₹15,000',
  },
  {
    icon: Shirt,
    title: 'Wardrobes',
    desc: 'Simple and elegant wardrobe designs with sliding or hinged doors for every bedroom.',
    image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=500&h=350&fit=crop',
    price: 'From ₹28,000',
  },
]

const steps = [
  { icon: FileText, title: 'Share Requirement', desc: 'Tell us what you need — doors, windows, sofas, temples, or wardrobes' },
  { icon: Palette, title: 'Get Design', desc: 'Our designers create custom designs matching your space and style' },
  { icon: Calculator, title: 'Transparent Estimate', desc: 'Receive detailed cost breakdown with no hidden charges' },
  { icon: FileText, title: 'Approve Quotation', desc: 'Review and approve your quotation with complete transparency' },
  { icon: Package, title: 'Track & Receive', desc: 'Track production in real-time and receive quality furniture' },
]

const whyChooseUs = [
  { icon: Award, title: '28+ Years Experience', desc: 'Trusted craftsmanship since 1996 from Kodoli, Satara' },
  { icon: HeartHandshake, title: 'Customized Solutions', desc: 'Every piece is made to order as per your exact requirements' },
  { icon: Shield, title: 'Quality Assurance', desc: 'Premium materials, expert finishing, and thorough quality checks' },
  { icon: Eye, title: 'Complete Transparency', desc: 'Clear pricing, real-time tracking, and honest communication' },
  { icon: Clock, title: 'On-Time Delivery', desc: 'We respect your time with committed delivery schedules' },
  { icon: Sparkles, title: 'After-Sales Support', desc: 'Dedicated support team for maintenance and service' },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920')] bg-cover bg-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/70 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">Est. 1996 — Kodoli, Satara</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 font-display">
                Crafted with Care,<br />
                Built to Last.<br />
                <span className="text-amber-500">Made for Your Home.</span>
              </h1>

              <p className="text-lg text-stone-300 mb-10 leading-relaxed max-w-lg">
                Premium doors, windows, sofas, home temples, and wardrobes — 
                designed, estimated, and delivered with complete transparency.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-accent inline-flex items-center gap-2 text-base px-8 py-4">
                  Start Your Project <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-outline inline-flex items-center gap-2 text-base px-8 py-4">
                  Get Cost Estimate
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-stone-300 text-sm">Free Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-stone-300 text-sm">No Hidden Costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                  <span className="text-stone-300 text-sm">5-Year Warranty</span>
                </div>
              </div>
            </div>

            {/* Hero Image / Logo Display */}
            <div className="hidden lg:flex justify-center animate-float">
              <div className="relative">
                <div className="absolute -inset-4 bg-amber-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                  <img src={logo} alt="Shivkrupa Doors & Hardware" className="w-64 h-auto drop-shadow-2xl" />
                  <div className="mt-6 text-center">
                    <p className="text-white font-bold text-xl font-display">SHIVKRUPA</p>
                    <p className="text-amber-400 text-sm tracking-widest uppercase">Doors & Hardware</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-700 text-sm font-semibold tracking-wider uppercase">What We Make</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-4 font-display">Our Specialties</h2>
            <p className="text-stone-500 max-w-2xl mx-auto text-lg">
              Five categories of premium handcrafted furniture and fixtures, each made with the finest materials and expert craftsmanship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productCards.map((product, idx) => (
              <div
                key={idx}
                className="group card-premium overflow-hidden"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-sm bg-amber-600/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        {product.price}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <product.icon className="w-5 h-5 text-amber-700" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">{product.title}</h3>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed mb-4">{product.desc}</p>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 text-amber-700 font-semibold text-sm hover:text-amber-800 transition-colors"
                  >
                    Explore Designs <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-700 text-sm font-semibold tracking-wider uppercase">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-4 font-display">How It Works</h2>
            <p className="text-stone-500 max-w-2xl mx-auto text-lg">
              From your idea to delivered furniture — a seamless 5-step journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:from-amber-100 group-hover:to-amber-200 transition-all duration-300 shadow-sm">
                  <step.icon className="w-9 h-9 text-amber-700" />
                </div>
                <div className="w-8 h-8 bg-stone-900 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed px-2">{step.desc}</p>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full">
                    <ArrowRight className="w-5 h-5 text-stone-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Approaches */}
      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase">Flexible Options</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 font-display">Choose Your Approach</h2>
            <p className="text-stone-400 max-w-2xl mx-auto text-lg">
              Two convenient ways to get started with your custom furniture
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6">
                <TrendingDown className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Design Within Budget</h3>
              <p className="text-stone-400 mb-8 leading-relaxed">
                Tell us your product type, dimensions, and budget. We will show you the best design options 
                that fit perfectly within your price range.
              </p>
              <ul className="space-y-3 mb-8">
                {['Budget-friendly options', 'Multiple design choices', 'Instant recommendations'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-stone-300">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-accent w-full text-center block">
                Try Budget Design
              </Link>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Estimate From Design</h3>
              <p className="text-stone-400 mb-8 leading-relaxed">
                Already have a design in mind? Upload a reference image and provide dimensions 
                to get an accurate cost estimate instantly.
              </p>
              <ul className="space-y-3 mb-8">
                {['Upload reference images', 'AI-assisted analysis', 'Detailed cost breakdown'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-stone-300">
                    <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-outline w-full text-center block border-white/30">
                Get Estimate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-amber-700 text-sm font-semibold tracking-wider uppercase">Why Shivkrupa</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-6 font-display">
                Trusted by Hundreds of Families<br />Across Maharashtra
              </h2>
              <p className="text-stone-500 text-lg leading-relaxed mb-10">
                For over 28 years, Shivkrupa Doors & Hardware has been the go-to destination 
                for premium custom furniture in Kodoli and surrounding areas. We combine traditional 
                craftsmanship with modern design to create pieces that last a lifetime.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <div className="text-3xl font-bold text-amber-700 mb-1">28+</div>
                  <div className="text-sm text-stone-500">Years of Trust</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <div className="text-3xl font-bold text-amber-700 mb-1">5000+</div>
                  <div className="text-sm text-stone-500">Projects Done</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <div className="text-3xl font-bold text-amber-700 mb-1">98%</div>
                  <div className="text-sm text-stone-500">Happy Customers</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <div className="text-3xl font-bold text-amber-700 mb-1">50+</div>
                  <div className="text-sm text-stone-500">Design Options</div>
                </div>
              </div>

              <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                Start Your Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {whyChooseUs.map((item, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 ${idx === 0 || idx === 3 ? 'lg:mt-8' : ''}`}
                >
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-bold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-amber-700 text-sm font-semibold tracking-wider uppercase">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mt-3 mb-4 font-display">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rahul Patil',
                location: 'Pune',
                text: 'The teak main door they crafted for my new home is absolutely stunning. The carving detail is exceptional and the finishing is top-notch. Highly recommended!',
                rating: 5,
                product: 'Premium Teak Main Door',
              },
              {
                name: 'Sneha Deshmukh',
                location: 'Mumbai',
                text: 'I ordered a custom pooja mandir and it exceeded my expectations. The wood quality, the carving, and the LED lighting — everything is perfect.',
                rating: 5,
                product: 'Carved Wooden Temple',
              },
              {
                name: 'Vikram Joshi',
                location: 'Nashik',
                text: 'Got my living room sofa and wardrobe done. The team understood exactly what I wanted. Transparent pricing and on-time delivery. Will definitely come back.',
                rating: 5,
                product: 'Sofa & Wardrobe',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="card-premium p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-stone-600 leading-relaxed mb-6 text-sm">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-stone-500">{testimonial.location} • {testimonial.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-stone-900 to-stone-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src={logo} alt="Shivkrupa" className="h-20 w-auto mx-auto mb-8 brightness-0 invert opacity-80" />
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 font-display">
            Ready to Build Your<br />
            <span className="text-amber-400">Dream Home?</span>
          </h2>
          <p className="text-stone-300 text-lg mb-10 max-w-2xl mx-auto">
            Get started today with a free design consultation. Share your requirements, 
            get custom designs, and receive a transparent cost estimate — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-accent text-lg px-10 py-4">
              Start Your Project <ArrowRight className="w-5 h-5 inline ml-2" />
            </Link>
            <a href="tel:+919876543210" className="btn-outline text-lg px-10 py-4 flex items-center gap-2">
              <Phone className="w-5 h-5" /> Call Us Now
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
