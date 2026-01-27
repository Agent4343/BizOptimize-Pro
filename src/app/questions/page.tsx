'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FormData {
  businessType: string;
  companySize: string;
  employees: string;
  annualRevenue: string;
  challenges: string[];
  goals: string[];
  name: string;
  email: string;
  phone: string;
}

const questions = [
  {
    id: 'businessType',
    title: 'What type of business do you own?',
    subtitle: 'Select the industry that best describes your business',
    type: 'radio',
    options: [
      { value: 'construction', label: '🏗️ Construction', description: 'Building, renovation, contracting' },
      { value: 'trucking', label: '🚛 Trucking & Logistics', description: 'Transportation, delivery, fleet management' },
      { value: 'restaurant', label: '🍽️ Restaurant & Food Service', description: 'Restaurants, cafes, catering' },
      { value: 'manufacturing', label: '🏭 Manufacturing', description: 'Production, assembly, industrial' },
      { value: 'retail', label: '🛍️ Retail & E-commerce', description: 'Stores, online sales, merchandising' },
      { value: 'services', label: '📅 Services', description: 'Consulting, professional services, maintenance' },
      { value: 'other', label: '🏢 Other', description: 'Other business type' }
    ]
  },
  {
    id: 'companySize',
    title: 'What is your company size?',
    subtitle: 'This helps us recommend the right optimization modules',
    type: 'radio',
    options: [
      { value: 'startup', label: '🚀 Startup (1-10 employees)', description: 'Just getting started' },
      { value: 'small', label: '📈 Small Business (11-50 employees)', description: 'Growing company' },
      { value: 'medium', label: '🏢 Medium Business (51-200 employees)', description: 'Established business' },
      { value: 'large', label: '🏗️ Large Business (200+ employees)', description: 'Enterprise level' }
    ]
  },
  {
    id: 'challenges',
    title: 'What are your biggest business challenges?',
    subtitle: 'Select all that apply to help us identify optimization opportunities',
    type: 'checkbox',
    options: [
      { value: 'high-costs', label: 'High operational costs', description: 'Rising expenses impacting profitability' },
      { value: 'inefficiency', label: 'Operational inefficiencies', description: 'Wasteful processes or poor resource utilization' },
      { value: 'inventory', label: 'Inventory management', description: 'Stock control, overstocking, or stockouts' },
      { value: 'labor', label: 'Labor costs', description: 'High payroll or staffing challenges' },
      { value: 'competition', label: 'Market competition', description: 'Difficulty staying competitive' },
      { value: 'growth', label: 'Scaling challenges', description: 'Difficulty growing sustainably' },
      { value: 'compliance', label: 'Regulatory compliance', description: 'Meeting industry standards and regulations' },
      { value: 'technology', label: 'Technology adoption', description: 'Keeping up with digital transformation' }
    ]
  },
  {
    id: 'goals',
    title: 'What are your primary business goals?',
    subtitle: 'Select your top priorities for the next 12 months',
    type: 'checkbox',
    options: [
      { value: 'reduce-costs', label: 'Reduce operational costs', description: 'Cut expenses by 10-30%' },
      { value: 'increase-profit', label: 'Increase profitability', description: 'Boost profit margins' },
      { value: 'improve-efficiency', label: 'Improve operational efficiency', description: 'Streamline processes and workflows' },
      { value: 'scale-business', label: 'Scale the business', description: 'Grow revenue and market share' },
      { value: 'optimize-inventory', label: 'Optimize inventory', description: 'Better stock management and turnover' },
      { value: 'enhance-quality', label: 'Enhance product/service quality', description: 'Improve customer satisfaction' },
      { value: 'digital-transformation', label: 'Digital transformation', description: 'Modernize business operations' },
      { value: 'sustainability', label: 'Improve sustainability', description: 'Reduce environmental impact' }
    ]
  },
  {
    id: 'contact',
    title: 'Contact Information',
    subtitle: 'We\'ll send you a personalized optimization report',
    type: 'contact',
    fields: [
      { id: 'name', label: 'Full Name', type: 'text', required: true },
      { id: 'email', label: 'Email Address', type: 'email', required: true },
      { id: 'phone', label: 'Phone Number', type: 'tel', required: false }
    ]
  }
];

export default function QuestionsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    businessType: '',
    companySize: '',
    employees: '',
    annualRevenue: '',
    challenges: [],
    goals: [],
    name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentQuestion.type === 'radio' && !formData[currentQuestion.id as keyof FormData]) {
      newErrors[currentQuestion.id] = 'Please select an option';
    }

    if (currentQuestion.type === 'checkbox' && (formData[currentQuestion.id as keyof FormData] as string[]).length === 0) {
      newErrors[currentQuestion.id] = 'Please select at least one option';
    }

    if (currentQuestion.type === 'contact') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Handle form submission
        console.log('Form submitted:', formData);
        alert('Thank you! We\'ll send your personalized optimization report soon.');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'radio':
        return (
          <div className="space-y-4">
            {currentQuestion.options?.map((option) => (
              <label
                key={option.value}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData[currentQuestion.id as keyof FormData] === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.value}
                  checked={formData[currentQuestion.id as keyof FormData] === option.value}
                  onChange={(e) => handleInputChange(currentQuestion.id as keyof FormData, e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{option.label.split(' ')[0]}</div>
                  <div>
                    <div className="font-medium">{option.label.substring(option.label.indexOf(' ') + 1)}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option.value}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  (formData[currentQuestion.id as keyof FormData] as string[]).includes(option.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={(formData[currentQuestion.id as keyof FormData] as string[]).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = formData[currentQuestion.id as keyof FormData] as string[];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleInputChange(currentQuestion.id as keyof FormData, newValues);
                  }}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{option.label.split(' ')[0]}</div>
                  <div>
                    <div className="font-medium">{option.label.substring(option.label.indexOf(' ') + 1)}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            {currentQuestion.fields?.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={field.type}
                  value={formData[field.id as keyof FormData] as string}
                  onChange={(e) => handleInputChange(field.id as keyof FormData, e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[field.id] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                />
                {errors[field.id] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  BizOptimize Pro
                </h1>
                <p className="text-xs text-gray-600">AI-Powered Business Optimization</p>
              </div>
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:opacity-90"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Business Assessment
            </h2>
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQuestion.title}
            </h3>
            <p className="text-gray-600">
              {currentQuestion.subtitle}
            </p>
          </div>

          {errors[currentQuestion.id] && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors[currentQuestion.id]}</p>
            </div>
          )}

          {renderQuestion()}

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {currentStep === questions.length - 1 ? 'Submit Assessment' : 'Next'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Your information is secure and will only be used to provide personalized recommendations.</p>
        </div>
      </div>
    </div>
  );
}