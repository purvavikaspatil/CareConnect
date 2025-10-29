function Profile() {
  return (
    <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-4xl w-full">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-6xl sm:text-7xl mb-4">👤</div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your Profile
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            User profile and settings.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 sm:px-8 sm:py-12 text-center">
            <div className="inline-block bg-white rounded-full p-4 mb-4">
              <span className="text-5xl sm:text-6xl">👤</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">John Doe</h2>
            <p className="text-blue-100 text-base sm:text-lg">Age: 75 | Member since 2025</p>
          </div>

          {/* Profile Details */}
          <div className="p-6 sm:p-8">
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-base sm:text-lg text-gray-900">johndoe@example.com</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <p className="text-base sm:text-lg text-gray-900">+1 (555) 123-4567</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <p className="text-base sm:text-lg text-gray-900">123 Main Street, Springfield, USA</p>
              </div>
              <div className="pb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Emergency Contact</label>
                <p className="text-base sm:text-lg text-gray-900">Jane Doe - +1 (555) 987-6543</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-blue-300">
                Edit Profile
              </button>
              <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-gray-300">
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Health Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">❤️</span>
            Health Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Blood Type</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">O+</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Allergies</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">Penicillin</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Medications</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">3 Active</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Last Checkup</p>
              <p className="text-lg sm:text-xl font-semibold text-gray-900">Jan 15, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Profile

