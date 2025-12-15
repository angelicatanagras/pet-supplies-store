'use client';

import { useState, useEffect } from 'react';

interface Appointment {
  _id: string;
  petName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  service: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const services = ['Full Grooming', 'Bath & Brush', 'Nail Trim', 'Hair Cut'] as const;
const petSizes = ['small', 'medium', 'large'] as const;
const petTypes = ['dog', 'cat', 'bird'] as const;

const servicePricing = {
  'Full Grooming': { small: 800, medium: 1200, large: 1500 },
  'Bath & Brush': { small: 500, medium: 700, large: 900 },
  'Nail Trim': { small: 200, medium: 250, large: 300 },
  'Hair Cut': { small: 600, medium: 900, large: 1200 },
};

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

interface AppointmentListProps {
  addOns?: AddOn[];
}

export function AppointmentList({ addOns = [] }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    service: 'Full Grooming' as typeof services[number],
    petSize: 'medium' as typeof petSizes[number],
    petType: 'dog' as typeof petTypes[number],
    date: '',
    time: '',
    notes: '',
  });
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const calculatePrice = () => {
    const basePrice = servicePricing[formData.service][formData.petSize];
    const addOnsPrice = selectedAddOns.reduce((total, addonId) => {
      const addon = addOns.find(a => a.id === addonId);
      return total + (addon?.price || 0);
    }, 0);
    return basePrice + addOnsPrice;
  };

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      petName: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      service: 'Full Grooming',
      petSize: 'medium',
      petType: 'dog',
      date: '',
      time: '',
      notes: '',
    });
    setSelectedAddOns([]);
    setEditingAppointment(null);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      petName: appointment.petName,
      ownerName: appointment.ownerName,
      ownerEmail: appointment.ownerEmail,
      ownerPhone: appointment.ownerPhone || '',
      service: appointment.service as typeof services[number],
      petSize: 'medium',
      petType: 'dog',
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: appointment.time,
      notes: appointment.notes || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('Appointment deleted successfully!');
        fetchAppointments();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to delete appointment');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      const appointment = appointments.find(a => a._id === id);
      if (!appointment) return;

      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...appointment, status: newStatus }),
      });

      if (res.ok) {
        setSuccess(`Appointment marked as ${newStatus}!`);
        fetchAppointments();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to update appointment status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment._id}`
        : '/api/appointments';
      const method = editingAppointment ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
      } else {
        setSuccess(
          editingAppointment
            ? 'Appointment updated successfully!'
            : 'Appointment created successfully!'
        );
        resetForm();
        setShowForm(false);
        fetchAppointments();
      }
    } catch (error) {
      setError('An error occurred');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
              setShowForm(false);
            } else {
              setShowForm(true);
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Appointment'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">
            {editingAppointment ? 'Edit Appointment' : 'Book an Appointment'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-blue-900">Estimated Price</h3>
                  <p className="text-sm text-blue-700">Based on selected service and pet size</p>
                </div>
                <div className="text-3xl font-bold text-green-700">₱{calculatePrice()}</div>
              </div>
              {selectedAddOns.length > 0 && (
                <div className="pt-2 border-t border-blue-200 mt-2">
                  <p className="text-xs text-blue-700">
                    Base: ₱{servicePricing[formData.service][formData.petSize]} +
                    Add-ons: ₱{selectedAddOns.reduce((total, id) => {
                      const addon = addOns.find(a => a.id === id);
                      return total + (addon?.price || 0);
                    }, 0)}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  required
                  placeholder="e.g., Max, Bella"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.petType}
                  onChange={(e) => setFormData({ ...formData, petType: e.target.value as typeof petTypes[number] })}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dog">🐕 Dog</option>
                  <option value="cat">🐈 Cat</option>
                  <option value="bird">🐦 Bird</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Size <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.petSize}
                  onChange={(e) => setFormData({ ...formData, petSize: e.target.value as typeof petSizes[number] })}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="small">Small (up to 10kg)</option>
                  <option value="medium">Medium (10-25kg)</option>
                  <option value="large">Large (25kg+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value as typeof services[number] })}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                  placeholder="Your full name"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  required
                  placeholder="your.email@example.com"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
            </div>

            {addOns.length > 0 && (
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add-Ons (Optional)
                </label>
                <p className="text-xs text-gray-600 mb-4">Select additional services to enhance your pet's grooming experience</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addOns.map((addon) => (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`cursor-pointer border-2 rounded-lg p-3 transition-all ${
                        selectedAddOns.includes(addon.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{addon.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm">{addon.name}</h4>
                            <span className="font-bold text-green-700">₱{addon.price}</span>
                          </div>
                          <p className="text-xs text-gray-600">{addon.description}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedAddOns.includes(addon.id)}
                          onChange={() => {}}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {selectedAddOns.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>{selectedAddOns.length}</strong> add-on{selectedAddOns.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Notes or Requests
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special instructions or concerns about your pet..."
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                {editingAppointment ? 'Update Appointment' : `Confirm Booking - ₱${calculatePrice()}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No appointments yet
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.petName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.ownerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(appointment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment._id, e.target.value as 'scheduled' | 'completed' | 'cancelled')}
                      className={`px-2 py-1 text-xs rounded-md border ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                        'bg-red-100 text-red-800 border-red-300'
                      }`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
