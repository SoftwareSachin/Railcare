import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Handle authentication callback if needed
    // For now, just redirect to dashboard
    setLocation("/dashboard");
  }, [setLocation]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-railway-blue rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <i className="fas fa-train text-white text-2xl"></i>
        </div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}
