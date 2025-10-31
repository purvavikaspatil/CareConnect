import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

const API_URL = API_ENDPOINTS.SOS

function Help() {
  const [showSOSModal, setShowSOSModal] = useState(false)
  const [sosMessage, setSOSMessage] = useState('')
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [sendingAlert, setSendingAlert] = useState(false)
  const [alertError, setAlertError] = useState('')
  const [locationWarning, setLocationWarning] = useState('')
  const navigate = useNavigate()

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  // Handle SOS button click
  const handleSOSClick = async () => {
    // Clear previous messages
    setAlertError('')
    setLocationWarning('')
    setSOSMessage('')
    setSendingAlert(true)

    // Check authentication
    const token = localStorage.getItem('token')
    if (!token) {
      setAlertError('You must be logged in to send an SOS alert')
      setSendingAlert(false)
      navigate('/login')
      return
    }

    // Try to get location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success - send alert with location
        async (position) => {
          console.log('📍 Location captured successfully:')
          console.log('   Latitude:', position.coords.latitude)
          console.log('   Longitude:', position.coords.longitude)
          console.log('   Accuracy:', position.coords.accuracy, 'meters')
          console.log('   Timestamp:', new Date(position.timestamp).toLocaleString())
          
          // Warn if accuracy is poor (>100m)
          if (position.coords.accuracy > 100) {
            console.warn('⚠️ Location accuracy is poor:', Math.round(position.coords.accuracy), 'meters')
            console.warn('💡 Tip: Use a mobile device with GPS for better accuracy')
            setLocationWarning(`Location accuracy is low (${Math.round(position.coords.accuracy/1000)}km). Using a phone/tablet will give better results.`)
          }
          
          await sendSOSAlert(token, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        // Error - send alert without location
        async (error) => {
          console.warn('Location access denied or unavailable:', error.message)
          setLocationWarning('Location not shared - sending alert without coordinates')
          await sendSOSAlert(token, null)
        },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
      )
    } else {
      // Geolocation not supported - send alert without location
      setLocationWarning('Geolocation not supported - sending alert without coordinates')
      await sendSOSAlert(token, null)
    }
  }

  // Send SOS alert to backend
  const sendSOSAlert = async (token, locationData) => {
    try {
      // Always include location fields (null if unavailable)
      const alertPayload = {
        message: 'Emergency! Need immediate assistance!',
        latitude: locationData ? locationData.latitude : null,
        longitude: locationData ? locationData.longitude : null,
        accuracy: locationData ? locationData.accuracy : null
      }

      // Log the payload being sent
      console.log('📤 Sending SOS alert with payload:', alertPayload)
      console.log('📍 Location data:', locationData ? 
        `Lat: ${locationData.latitude}, Lng: ${locationData.longitude}, Accuracy: ${locationData.accuracy}m` : 
        'Location not available'
      )

      const response = await axios.post(API_URL, alertPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setSOSMessage('Emergency alert sent successfully!')
        setShowSOSModal(true)
        
        // Auto-hide modal after 4 seconds
        setTimeout(() => {
          setShowSOSModal(false)
        }, 4000)

        console.log('✅ SOS alert sent successfully:', response.data.data)
        console.log('💾 Alert saved with location:', response.data.data.location)
      }
    } catch (error) {
      console.error('Error sending SOS alert:', error)
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setAlertError('Session expired. Please log in again.')
        setTimeout(() => navigate('/login'), 2000)
        return
      }
      
      setAlertError(
        error.response?.data?.error || 
        'Failed to send SOS alert. Please try again or call emergency services directly.'
      )
    } finally {
      setSendingAlert(false)
    }
  }

  // Handle Call Emergency Contact
  const handleCallEmergency = () => {
    // In a real app, this would call a stored emergency contact
    // For now, we'll show an alert
    alert('Calling emergency contact...\n\nIn production, this would dial your emergency contact number.')
  }

  // Handle Share Location
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setLoadingLocation(true)
    setLocationError('')
    setLocation(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toLocaleString()
        }
        
        setLocation(locationData)
        setLoadingLocation(false)
        
        // Warn if accuracy is poor
        if (position.coords.accuracy > 100) {
          setLocationError(`⚠️ Location accuracy is low (${Math.round(position.coords.accuracy/1000)}km). For emergency situations, please use a mobile device with GPS for better accuracy.`)
        }
        
        // Here you would send location to backend
        console.log('Location data:', locationData)
        console.log('Accuracy quality:', position.coords.accuracy < 50 ? '✅ Excellent (GPS)' : 
                                       position.coords.accuracy < 100 ? '✅ Good (GPS)' : 
                                       position.coords.accuracy < 1000 ? '⚠️ Fair (WiFi)' : 
                                       '❌ Poor (IP-based)')
      },
      (error) => {
        setLoadingLocation(false)
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out.')
            break
          default:
            setLocationError('An unknown error occurred while getting your location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-4xl sm:text-5xl mb-3">🆘</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Emergency Help
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Need immediate assistance? Use the buttons below to alert your contacts or share your location.
          </p>
        </div>

        {/* Alert Error Message */}
        {alertError && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-4 rounded-lg mb-6 text-sm sm:text-base">
            <div className="flex items-start space-x-2">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-semibold mb-1">Alert Error</p>
                <p>{alertError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Warning Message */}
        {locationWarning && (
          <div className="bg-yellow-50 border-2 border-yellow-300 text-yellow-800 px-4 py-4 rounded-lg mb-6 text-sm sm:text-base">
            <div className="flex items-start space-x-2">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold mb-1">Warning</p>
                <p>{locationWarning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main SOS Button */}
        <div className="mb-8 sm:mb-10">
          <button
            onClick={handleSOSClick}
            disabled={sendingAlert}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold text-2xl sm:text-3xl px-8 py-8 sm:py-12 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-300 border-4 border-red-700 disabled:border-red-400"
          >
            <div className="flex flex-col items-center space-y-3">
              {sendingAlert ? (
                <>
                  <svg
                    className="animate-spin h-12 w-12 sm:h-16 sm:w-16"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Sending Alert...</span>
                  <span className="text-base sm:text-lg font-normal">Please wait</span>
                </>
              ) : (
                <>
                  <div className="text-5xl sm:text-6xl">🚨</div>
                  <span>SOS - EMERGENCY</span>
                  <span className="text-base sm:text-lg font-normal">Tap to send alert</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* SOS Success Modal */}
        {showSOSModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-bounce">
              <div className="text-center">
                <div className="text-5xl sm:text-6xl mb-4">✅</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-3">
                  Alert Sent!
                </h2>
                <p className="text-base sm:text-lg text-gray-700 mb-2">
                  {sosMessage || 'Emergency alert sent to your contacts!'}
                </p>
                {locationWarning && (
                  <p className="text-sm sm:text-base text-yellow-700 mt-3 font-medium">
                    ⚠️ {locationWarning}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Secondary Action Buttons */}
        <div className="space-y-4 mb-8">
          {/* Call Emergency Contact Button */}
          <button
            onClick={handleCallEmergency}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg sm:text-xl px-6 py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center space-x-3"
          >
            <svg
              className="h-6 w-6 sm:h-7 sm:w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>Call Emergency Contact</span>
          </button>

          {/* Share Location Button */}
          <button
            onClick={handleShareLocation}
            disabled={loadingLocation}
            className="w-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-lg sm:text-xl px-6 py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500 flex items-center justify-center space-x-3"
          >
            <svg
              className="h-6 w-6 sm:h-7 sm:w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{loadingLocation ? 'Getting Location...' : 'Share My Location'}</span>
          </button>
        </div>

        {/* Location Error Message */}
        {locationError && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-4 rounded-lg mb-6 text-sm sm:text-base">
            <div className="flex items-start space-x-2">
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-semibold mb-1">Location Error</p>
                <p>{locationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Location Display */}
        {location && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5 sm:p-6 mb-6">
            <div className="flex items-start space-x-3 mb-4">
              <svg
                className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">
                  Location Captured Successfully
                </h3>
                <p className="text-sm sm:text-base text-green-700 mb-3">
                  Your location has been recorded and is ready to share with emergency contacts.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-2 text-sm sm:text-base">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Latitude:</span>
                <span className="text-gray-900 font-mono">{location.latitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Longitude:</span>
                <span className="text-gray-900 font-mono">{location.longitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Accuracy:</span>
                <span className="text-gray-900">
                  {location.accuracy < 1000 ? 
                    `${Math.round(location.accuracy)} meters` : 
                    `${Math.round(location.accuracy/1000)} km`}
                  {location.accuracy < 50 && <span className="ml-2 text-green-600">✅ Excellent</span>}
                  {location.accuracy >= 50 && location.accuracy < 100 && <span className="ml-2 text-green-600">✅ Good</span>}
                  {location.accuracy >= 100 && location.accuracy < 1000 && <span className="ml-2 text-yellow-600">⚠️ Fair</span>}
                  {location.accuracy >= 1000 && <span className="ml-2 text-red-600">❌ Poor</span>}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-gray-700">Timestamp:</span>
                <span className="text-gray-900 text-sm">{location.timestamp}</span>
              </div>
            </div>

            {/* Google Maps Link */}
            <div className="mt-4">
              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base hover:underline"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span>View on Google Maps</span>
              </a>
            </div>
          </div>
        )}

        {/* Help Information */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-3 flex items-center space-x-2">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>How to Use Emergency Help</span>
          </h3>
          <ul className="space-y-2 text-sm sm:text-base text-blue-800">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
              <span>Press the large <strong>SOS button</strong> in case of emergency to alert your contacts.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
              <span>Use <strong>Call Emergency Contact</strong> to directly reach your designated contact.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
              <span><strong>Share Location</strong> will capture your current position to help responders find you quickly.</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default Help
