import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/contacts'

function Contacts() {
  const [contacts, setContacts] = useState([])
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  // Check authentication and fetch contacts on component mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      navigate('/login')
      return
    }
    
    fetchContacts()
  }, [navigate])

  // Fetch all contacts
  const fetchContacts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (response.data.success) {
        setContacts(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
      
      setErrorMessage('Unable to load contacts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Add new contact
  const handleAddContact = async (e) => {
    e.preventDefault()
    
    // Clear messages
    setErrorMessage('')
    setSuccessMessage('')
    
    // Validation
    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Please enter contact name and phone number')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')
      
      const newContact = {
        name: name.trim(),
        relation: relation.trim(),
        phone: phone.trim(),
        email: email.trim()
      }

      const response = await axios.post(API_URL, newContact, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setContacts([...contacts, response.data.data])
        setSuccessMessage('Contact added successfully!')
        
        // Clear form
        setName('')
        setRelation('')
        setPhone('')
        setEmail('')
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error adding contact:', error)
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
      
      setErrorMessage(
        error.response?.data?.error || 'Failed to add contact. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Delete contact
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setContacts(contacts.filter(contact => contact._id !== id))
        setSuccessMessage('Contact deleted successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }
      
      setErrorMessage('Failed to delete contact. Please try again.')
    }
  }

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-6">
          <div className="text-4xl sm:text-5xl mb-3">📞</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Emergency Contacts
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Manage your emergency contact information
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-2 border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
            ✅ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Add Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 mb-5">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Add New Contact
          </h2>
          
          <form onSubmit={handleAddContact} className="space-y-4">
            {/* Name */}
            <div>
              <label 
                htmlFor="name" 
                className="block text-base sm:text-lg font-medium text-gray-700 mb-2"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              />
            </div>

            {/* Relation */}
            <div>
              <label 
                htmlFor="relation" 
                className="block text-base sm:text-lg font-medium text-gray-700 mb-2"
              >
                Relationship
              </label>
              <input
                type="text"
                id="relation"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g., Son, Daughter, Doctor"
                className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label 
                htmlFor="phone" 
                className="block text-base sm:text-lg font-medium text-gray-700 mb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +1 (555) 123-4567 or 1234567890"
                className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-base sm:text-lg font-medium text-gray-700 mb-2"
              >
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., contact@example.com"
                className="w-full px-4 sm:px-5 py-3 text-base sm:text-lg text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold text-lg sm:text-xl px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              {submitting ? 'Adding Contact...' : 'Add Contact'}
            </button>
          </form>
        </div>

        {/* Contacts List */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Your Contacts ({contacts.length})
          </h2>

          {loading ? (
            <div className="bg-gray-50 rounded-lg p-8 sm:p-12 text-center">
              <div className="text-blue-600 mb-4">
                <svg
                  className="animate-spin mx-auto h-12 w-12"
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
              </div>
              <p className="text-gray-600 text-base sm:text-lg">
                Loading your contacts...
              </p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 sm:p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16 sm:h-20 sm:w-20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-base sm:text-lg">
                No contacts yet. Add your first emergency contact above!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="bg-white rounded-lg shadow-md p-5 sm:p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">👤</span>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                          {contact.name}
                        </h3>
                      </div>
                      
                      {contact.relation && (
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="text-sm sm:text-base font-medium">
                            {contact.relation}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <a 
                          href={`tel:${contact.phone}`}
                          className="text-base sm:text-lg font-medium hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                      
                      {contact.email && (
                        <div className="flex items-center gap-2 text-gray-600">
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
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-sm sm:text-base hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      className="flex-shrink-0 bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Delete contact"
                    >
                      <svg
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Contacts

