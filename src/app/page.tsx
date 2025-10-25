import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  BizOptimize Pro
                </h1>
                <p className="text-xs text-gray-600">AI-Powered Business Optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                Sign In
              </button>
              <Link 
                href="/dashboard"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:opacity-90"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto text-center max-w-6xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 text-blue-700 text-sm font-medium mb-6">
            🚀 Trusted by 500+ businesses across Canada
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-green-800 bg-clip-text text-transparent">
            Optimize Your Business,
            <br />
            Maximize Your Profits
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered optimization modules for construction, trucking, restaurants, manufacturing, retail, and services. 
            <strong className="text-blue-600"> Only pay after we prove measurable savings.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/dashboard"
              className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:opacity-90 inline-flex items-center justify-center"
            >
              Start Free Trial
              <span className="ml-2">→</span>
            </Link>
            <button className="px-8 py-6 text-lg border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">$2.3M+</div>
              <div className="text-sm text-gray-600">Savings Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-sm text-gray-600">Active Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">98%</div>
              <div className="text-sm text-gray-600">Client Retention</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">22%</div>
              <div className="text-sm text-gray-600">Average Cost Reduction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Modules Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Industry-Specific Optimization Modules</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the modules that fit your business. Each powered by advanced AI to identify cost-saving opportunities.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🏗️",
                name: "Construction Estimator",
                description: "AI-powered project estimation with building code compliance",
                savings: "Save 15-25% on project costs",
                features: ["Automated material calculations", "Labor cost optimization", "Code compliance checks", "Project timeline forecasting"]
              },
              {
                icon: "🚛",
                name: "Fleet Optimizer",
                description: "Route optimization and fuel efficiency tracking",
                savings: "Reduce fuel costs by 18-30%",
                features: ["Fuel consumption analysis", "Predictive maintenance", "Route optimization", "Driver performance tracking"]
              },
              {
                icon: "🍽️",
                name: "Restaurant Manager",
                description: "Inventory optimization and waste reduction",
                savings: "Cut food costs by 12-22%",
                features: ["Smart inventory tracking", "Waste analysis", "Supplier optimization", "Menu profitability analysis"]
              },
              {
                icon: "🏭",
                name: "Manufacturing Optimizer",
                description: "Production efficiency and quality control",
                savings: "Boost efficiency by 20-35%",
                features: ["Production line analysis", "Quality metrics tracking", "Equipment optimization", "Supply chain efficiency"]
              },
              {
                icon: "🛍️",
                name: "Retail Analytics",
                description: "Sales forecasting and inventory management",
                savings: "Increase margins by 10-18%",
                features: ["Demand forecasting", "Inventory optimization", "Price optimization", "Customer behavior analysis"]
              },
              {
                icon: "📅",
                name: "Service Scheduler",
                description: "Appointment and resource optimization",
                savings: "Reduce downtime by 25-40%",
                features: ["Smart scheduling", "Resource allocation", "Customer flow optimization", "Service efficiency tracking"]
              }
            ].map((module, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl">{module.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{module.name}</h3>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      {module.savings}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{module.description}</p>
                <ul className="space-y-2">
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with a free trial. We only charge after proving measurable cost savings to your business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: 99,
                description: "Perfect for small businesses",
                features: ["1 optimization module", "Basic analytics", "Email support", "Up to 20 employees"],
                badge: null
              },
              {
                name: "Professional",
                price: 299,
                description: "Most popular for growing businesses",
                features: ["3 optimization modules", "Advanced analytics", "Priority support", "Up to 100 employees", "Custom reports"],
                badge: "Most Popular"
              },
              {
                name: "Enterprise",
                price: 599,
                description: "For large organizations",
                features: ["All 6 modules", "Real-time analytics", "Dedicated support", "Unlimited employees", "API access", "White-label option"],
                badge: null
              }
            ].map((plan, index) => (
              <div key={index} className={`relative border border-gray-200 rounded-lg p-8 ${plan.badge ? 'ring-2 ring-blue-500 scale-105' : ''} hover:shadow-xl transition-all`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    {plan.badge}
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <div className="text-4xl font-bold text-blue-600 my-4">
                    ${plan.price}<span className="text-lg text-gray-500">/mo</span>
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={`w-full block text-center py-3 px-6 rounded-lg transition-colors ${
                    plan.badge ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to See Results?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of Canadian businesses already saving money with AI-powered optimization.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-50"
          >
            Try Dashboard Demo
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                  <span className="text-white">📊</span>
                </div>
                <h3 className="text-xl font-bold">BizOptimize Pro</h3>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered business optimization for Canadian companies. Reduce costs, increase profits.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Business Modules</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Construction Estimator</li>
                <li>Fleet Optimizer</li>
                <li>Restaurant Manager</li>
                <li>Manufacturing Optimizer</li>
                <li>Retail Analytics</li>
                <li>Service Scheduler</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Case Studies</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Help Center</li>
                <li>Status Page</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 BizOptimize Pro. All rights reserved. Built for Canadian businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}