import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthModal from "@/components/AuthModal";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-irctc-light-gray">
      {/* IRCTC Style Header */}
      <div className="irctc-header-gradient text-white px-6 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <i className="fas fa-train text-irctc-navy text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold">RailCare</h1>
                <p className="text-xs opacity-90">Indian Railway</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <span>LOGIN</span>
            <span>REGISTER</span>
            <span>CONTACT US</span>
            <span>HELP & SUPPORT</span>
            <span className="bg-irctc-orange px-3 py-1 rounded text-white font-medium">
              SAFETY
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Main Logo and Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-irctc-navy rounded-full flex items-center justify-center">
              <i className="fas fa-train text-white text-2xl"></i>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-irctc-navy">RailCare Portal</h1>
              <p className="text-gray-600 text-sm">
                Safety • Security • Punctuality
              </p>
            </div>
          </div>
        </div>

        {/* Main Booking Form - IRCTC Style */}
        <div className="mb-12">
          <Card className="max-w-4xl mx-auto shadow-lg border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-irctc-navy to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold text-center">
                RailCare Service Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Station
                  </label>
                  <input
                    type="text"
                    placeholder="Enter station code"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-irctc-orange focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Station
                  </label>
                  <input
                    type="text"
                    placeholder="Enter station code"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-irctc-orange focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Journey Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-irctc-orange focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-irctc-orange focus:outline-none text-sm">
                    <option>All Services</option>
                    <option>Emergency SOS</option>
                    <option>Medical Assistance</option>
                    <option>Safety Alert</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Person With Disability Concession</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Flexible With Date</span>
                  </label>
                </div>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="irctc-button-primary text-white px-8 py-3 text-lg font-semibold rounded-md"
                >
                  Search Services
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Modules - IRCTC Style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "CrowdFlow",
              description: "Real-time crowd monitoring and density management",
              icon: "fas fa-users",
              color: "bg-irctc-navy"
            },
            {
              title: "MediLink",
              description: "Medical emergency response and hospital coordination",
              icon: "fas fa-heartbeat",
              color: "bg-irctc-error"
            },
            {
              title: "SafeHer",
              description: "Women safety features and escort services",
              icon: "fas fa-shield-alt",
              color: "bg-purple-600"
            },
            {
              title: "InfoReach",
              description: "Train information and passenger communication",
              icon: "fas fa-info-circle",
              color: "bg-irctc-success"
            }
          ].map((feature, index) => (
            <Card key={index} className="border border-gray-200 hover:border-irctc-orange transition-colors duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`${feature.icon} text-white text-xl`}></i>
                </div>
                <h3 className="text-lg font-bold text-irctc-navy mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Auth Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Get Started</CardTitle>
              <p className="text-gray-600">
                Secure access with Aadhaar-based authentication
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-railway-blue hover:bg-blue-700 text-white py-3 text-lg"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Login with Aadhaar
              </Button>
              
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <i className="fas fa-shield-alt text-safe-green"></i>
                  <span>Secure OTP verification</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <i className="fas fa-user-check text-railway-blue"></i>
                  <span>Role-based access control</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <i className="fas fa-mobile-alt text-alert-orange"></i>
                  <span>Multi-device support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-white opacity-70 mt-16">
          <p>&copy; 2025 RailCare. Enhancing Railway Safety and Operations.</p>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
