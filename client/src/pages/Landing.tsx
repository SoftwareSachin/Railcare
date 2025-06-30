import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthModal from "@/components/AuthModal";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-railway-blue to-blue-800">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center text-white mb-16">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-train text-4xl"></i>
          </div>
          <h1 className="text-5xl font-bold mb-4">RailCare</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Unified Services Portal for Railway Operations, Safety, and Passenger Services
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-users text-railway-blue text-xl"></i>
              </div>
              <CardTitle className="text-lg">CrowdFlow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Real-time crowd monitoring and density management across stations and platforms
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-heartbeat text-danger-red text-xl"></i>
              </div>
              <CardTitle className="text-lg">MediLink</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Rapid medical emergency response and hospital coordination system
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-shield-alt text-pink-600 text-xl"></i>
              </div>
              <CardTitle className="text-lg">SafeHer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Women's safety features with panic buttons and escort services
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-broadcast-tower text-safe-green text-xl"></i>
              </div>
              <CardTitle className="text-lg">InfoReach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Real-time passenger information and communication system
              </p>
            </CardContent>
          </Card>
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
