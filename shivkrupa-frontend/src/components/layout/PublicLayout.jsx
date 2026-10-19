import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, Phone, Mail, MapPin, Clock, Facebook, Instagram, ArrowUpRight } from 'lucide-react'
import logo from '../../assets/logo.png'

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const getDashboardPath = () => {
    switch (user?.role) {
      case 'customer': return '/customer/dashboard'
      case 'staff': return '/staff/dashboard'
      case 'admin': return '/admin/dashboard'
      case 'production': return '/production/dashboard'
      default: return '/login'
    }
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '#products' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logo} alt="Shivkrupa" className="h-14 w-auto transition-transform group-hover:scale-105" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight font-display">SHIVKRUPA</h1>
                <p className="text-[11px] text-stone-500 -mt-1 tracking-widest uppercase">Doors & Hardware</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-medium text-sm rounded-lg hover:bg-stone-50 transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <button onClick={() => navigate(getDashboardPath())} className="btn-primary text-sm">
                  Dashboard
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-sm">Login</Link>
                  <Link to="/register" className="btn-accent text-sm">Get Started</Link>
                </>
              )}
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-stone-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block py-3 px-3 text-stone-700 font-medium rounded-lg hover:bg-stone-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-stone-100 flex gap-3">
                <Link to="/login" className="btn-secondary flex-1 text-center text-sm">Login</Link>
                <Link to="/register" className="btn-accent flex-1 text-center text-sm">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <Outlet />

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-300">
        {/* Top CTA Bar */}
        <div className="border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to transform your home?</h3>
                <p className="text-stone-400">Get a free design consultation and cost estimate today.</p>
              </div>
              <Link to="/register" className="btn-accent whitespace-nowrap">
                Start Your Project <ArrowUpRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="Shivkrupa" className="h-12 w-auto brightness-0 invert" />
                <div>
                  <h3 className="font-bold text-white text-lg font-display">SHIVKRUPA</h3>
                  <p className="text-[10px] text-stone-500 -mt-0.5 tracking-widest uppercase">Doors & Hardware</p>
                </div>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed mb-6">
                Your trusted partner for premium doors, windows, sofas, home temples, and wardrobes. 
                Crafting quality furniture since 1996 from Kodoli, Satara.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 bg-stone-800 rounded-lg flex items-center justify-center hover:bg-amber-700 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-stone-800 rounded-lg flex items-center justify-center hover:bg-amber-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-sm tracking-wider uppercase">Our Products</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#products" className="text-stone-400 hover:text-amber-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-amber-600 rounded-full"></span>Wooden Doors</a></li>
                <li><a href="#products" className="text-stone-400 hover:text-amber-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-amber-600 rounded-full"></span>Wooden Windows</a></li>
                <li><a href="#products" className="text-stone-400 hover:text-amber-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-amber-600 rounded-full"></span>Custom Sofas</a></li>
                <li><a href="#products" className="text-stone-400 hover:text-amber-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-amber-600 rounded-full"></span>Home Temples</a></li>
                <li><a href="#products" className="text-stone-400 hover:text-amber-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-amber-600 rounded-full"></span>Wardrobes</a></li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-sm tracking-wider uppercase">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="text-stone-400 hover:text-amber-500 transition-colors">Home</Link></li>
                <li><Link to="/login" className="text-stone-400 hover:text-amber-500 transition-colors">Customer Login</Link></li>
                <li><Link to="/register" className="text-stone-400 hover:text-amber-500 transition-colors">Get Started</Link></li>
                <li><a href="#how-it-works" className="text-stone-400 hover:text-amber-500 transition-colors">How It Works</a></li>
                <li><a href="#about" className="text-stone-400 hover:text-amber-500 transition-colors">About Us</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-6 text-sm tracking-wider uppercase">Contact Us</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-stone-400">Dattanagar, Satara Rahimatpur Road,<br />Kodoli, Satara - 415004,<br />Maharashtra, India</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-stone-400">+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-stone-400">info@shivkrupa.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-stone-400">Mon - Sat: 9:00 AM - 6:00 PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
              <p>© 2026 Shivkrupa Doors & Hardware. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-stone-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-stone-300 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-stone-300 transition-colors">GST: 27XXXXX0000X0X0</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
