'use client';

import { useState } from 'react';
import { AppointmentList } from '@/components/grooming/AppointmentList';

const groomingServices = [
  {
    name: 'Full Grooming',
    description: 'Complete grooming package including bath, haircut, nail trim, ear cleaning, styling, and finishing powder',
    price: { small: 800, medium: 1200, large: 1500 },
    duration: '2-3 hours',
    icon: '✨',
  },
  {
    name: 'Bath & Brush',
    description: 'Refreshing bath with premium shampoo, blow dry, and thorough brushing',
    price: { small: 500, medium: 700, large: 900 },
    duration: '1-2 hours',
    icon: '🛁',
  },
  {
    name: 'Nail Trim',
    description: 'Professional nail trimming and filing for your pet\'s comfort',
    price: { small: 200, medium: 250, large: 300 },
    duration: '30 mins',
    icon: '💅',
  },
  {
    name: 'Hair Cut',
    description: 'Stylish haircut tailored to your pet\'s breed and your preferences',
    price: { small: 600, medium: 900, large: 1200 },
    duration: '1-2 hours',
    icon: '✂️',
  },
];

const groomingAddOns = [
  {
    id: 'premium-shampoo',
    name: 'Premium Shampoo',
    description: 'Hypoallergenic, moisturizing shampoo for sensitive skin',
    price: 150,
    icon: '🧴',
  },
  {
    id: 'flea-tick',
    name: 'Anti Flea & Tick Treatment',
    description: 'Effective protection against fleas, ticks, and parasites',
    price: 250,
    icon: '🛡️',
  },
  {
    id: 'coat-shine',
    name: 'Coat Shine & Conditioner',
    description: 'Premium conditioning treatment for silky, shiny coat',
    price: 200,
    icon: '✨',
  },
  {
    id: 'teeth-cleaning',
    name: 'Teeth Cleaning',
    description: 'Basic dental cleaning for fresh breath and healthy teeth',
    price: 300,
    icon: '🦷',
  },
];

export default function GroomingPage() {
  const [view, setView] = useState<'services' | 'appointments'>('services');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Pet Grooming Services</h1>
        <p className="text-gray-600">Professional grooming services for your beloved pets</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('services')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            view === 'services'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Services & Pricing
        </button>
        <button
          onClick={() => setView('appointments')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            view === 'appointments'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          My Appointments
        </button>
      </div>

      {view === 'services' ? (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Pricing Guide</h2>
            <p className="text-blue-700 text-sm">
              Prices vary based on pet size: Small (up to 10kg), Medium (10-25kg), Large (25kg+)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groomingServices.map((service) => (
              <div
                key={service.name}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{service.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Small pets:</span>
                        <span className="font-semibold text-green-700">₱{service.price.small}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Medium pets:</span>
                        <span className="font-semibold text-green-700">₱{service.price.medium}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Large pets:</span>
                        <span className="font-semibold text-green-700">₱{service.price.large}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>⏱️</span>
                        <span>Duration: {service.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Add-Ons</h2>
            <p className="text-gray-600 mb-6">Enhance your pet's grooming experience with our premium add-on services</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {groomingAddOns.map((addon) => (
                <div
                  key={addon.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{addon.icon}</div>
                    <h3 className="font-bold mb-2">{addon.name}</h3>
                    <p className="text-xs text-gray-600 mb-3">{addon.description}</p>
                    <div className="text-lg font-semibold text-green-700">₱{addon.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <AppointmentList addOns={groomingAddOns} />
      )}
    </div>
  );
}
