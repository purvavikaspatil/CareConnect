import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bloodType: '',
    allergies: ''
  })
  
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchUserProfile()
  }, [navigate])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_ENDPOINTS.AUTH}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const userData = response.data.data
        setUser(userData)
        setFormData({
          name: userData.name || '',
          age: userData.age || '',
          phone: userData.phone || '',
          address: userData.address || '',
          emergencyContactName: userData.emergencyContactName || '',
          emergencyContactPhone: userData.emergencyContactPhone || '',
          bloodType: userData.bloodType || '',
          allergies: userData.allergies || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${API_ENDPOINTS.AUTH}/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        setUser(response.data.data)
        setEditMode(false)
        setSuccess('Profile updated successfully!')
        
        // Update localStorage user data
        localStorage.setItem('user', JSON.stringify({
          id: response.data.data.id,
          name: response.data.data.name,
          email: response.data.data.email
        }))

        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setError('')
    setSuccess('')
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        phone: user.phone || '',
        address: user.address || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        bloodType: user.bloodType || '',
        allergies: user.allergies || ''
      })
    }
  }

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white text-lg font-medium">Loading profile...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-4xl w-full">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-6xl sm:text-7xl mb-4">👤</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Your Profile
          </h1>
          <p className="text-lg sm:text-xl text-gray-900 dark:text-gray-100 font-medium">
            User profile and settings
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">✅ {success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 sm:px-8 sm:py-12 text-center">
            <div className="inline-block bg-white rounded-full p-4 mb-4">
              <span className="text-5xl sm:text-6xl">👤</span>
            </div>
            {editMode ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="text-2xl sm:text-3xl font-bold text-gray-900 text-center bg-white rounded-lg px-4 py-2 w-full max-w-md mx-auto block mb-2"
              />
            ) : (
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{user?.name || 'User'}</h2>
            )}
            <p className="text-blue-100 text-base sm:text-lg">
              {formData.age ? `Age: ${formData.age} | ` : ''}
              Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2025'}
            </p>
          </div>

          {/* Profile Details */}
          <div className="p-6 sm:p-8">
            <div className="space-y-4">
              {/* Email (non-editable) */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                <p className="text-base sm:text-lg text-gray-900 dark:text-white">{user?.email || 'Not provided'}</p>
              </div>

              {/* Age */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Age</label>
                {editMode ? (
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter your age"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                ) : (
                  <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                    {user?.age || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone</label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                ) : (
                  <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                    {user?.phone || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Address</label>
                {editMode ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                ) : (
                  <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                    {user?.address || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="pb-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Emergency Contact</label>
                {editMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      placeholder="Contact Name"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      placeholder="Contact Phone"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                ) : (
                  <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                    {user?.emergencyContactName && user?.emergencyContactPhone
                      ? `${user.emergencyContactName} - ${user.emergencyContactPhone}`
                      : 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-green-300"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Health Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="text-3xl mr-3">❤️</span>
            Health Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blood Type */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Blood Type</p>
              {editMode ? (
                <input
                  type="text"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  placeholder="e.g., O+"
                  className="w-full px-3 py-1 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg font-semibold"
                />
              ) : (
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.bloodType || 'Not provided'}
                </p>
              )}
            </div>

            {/* Allergies */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Allergies</p>
              {editMode ? (
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="e.g., Penicillin"
                  className="w-full px-3 py-1 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-lg font-semibold"
                />
              ) : (
                <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.allergies || 'None'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Profile
