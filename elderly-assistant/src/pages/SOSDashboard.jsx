import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

const API_URL = API_ENDPOINTS.SOS

function SOSDashboard() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        navigate('/login')
        return
      }

      setLoading(true)
      setError('')

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setAlerts(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching SOS alerts:', err)
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
      
      setError(err.response?.data?.error || 'Failed to load SOS alerts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  const getMapLink = (location) => {
    if (location && location.latitude && location.longitude) {
      return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    }
    return null
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          🚨 SOS Alert History
        </h1>
        <p className="text-gray-600 text-lg">
          View all your emergency alerts and their details
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your alerts...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex items-center">
            <span className="text-red-500 text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-red-800 font-semibold text-lg">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchAlerts}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && alerts.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No SOS Alerts Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Your emergency alert history will appear here when you trigger an SOS.
          </p>
          <button
            onClick={() => navigate('/help')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition-colors inline-flex items-center"
          >
            <span className="mr-2">🆘</span>
            Go to Help Page
          </button>
        </div>
      )}

      {/* Alerts Grid - Desktop */}
      {!loading && !error && alerts.length > 0 && (
        <>
          <div className="mb-4 text-gray-600">
            <span className="font-semibold">{alerts.length}</span> alert{alerts.length !== 1 ? 's' : ''} found
          </div>

          {/* Mobile: Stacked Cards */}
          <div className="block lg:hidden space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Alert Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🚨</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(alert.status)}`}>
                      {alert.status || 'active'}
                    </span>
                  </div>
                </div>

                {/* Alert Body */}
                <div className="p-4 space-y-3">
                  {/* Date/Time */}
                  <div className="flex items-start">
                    <span className="text-gray-500 text-sm font-medium mr-2">📅</span>
                    <div>
                      <p className="text-gray-900 font-semibold">
                        {formatDate(alert.timestamp || alert.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex items-start">
                    <span className="text-gray-500 text-sm font-medium mr-2">💬</span>
                    <p className="text-gray-700">
                      {alert.message || 'Emergency alert triggered'}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="flex items-start">
                    <span className="text-gray-500 text-sm font-medium mr-2">📍</span>
                    <div className="flex-grow">
                      {getMapLink(alert.location) ? (
                        <div>
                          <p className="text-gray-700 text-sm mb-2">
                            Lat: {alert.location.latitude.toFixed(4)}, 
                            Lng: {alert.location.longitude.toFixed(4)}
                          </p>
                          <a
                            href={getMapLink(alert.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors text-sm"
                          >
                            <span className="mr-2">🗺️</span>
                            View on Google Maps
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Location not available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(alert.status)}`}>
                        {alert.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">🕐</span>
                        <span className="text-gray-900 font-medium">
                          {formatDate(alert.timestamp || alert.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <span className="text-red-500 mr-2 text-lg">🚨</span>
                        <span className="text-gray-700">
                          {alert.message || 'Emergency alert triggered'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getMapLink(alert.location) ? (
                        <div>
                          <p className="text-gray-600 text-sm mb-2">
                            {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                          </p>
                          <a
                            href={getMapLink(alert.location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md transition-colors text-sm"
                          >
                            <span className="mr-1">🗺️</span>
                            View Map
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Not available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}

export default SOSDashboard

