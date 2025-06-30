import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestOtpMutation = useMutation({
    mutationFn: async (aadhaar: string) => {
      const response = await apiRequest('POST', '/api/auth/request-otp', { aadhaarNumber: aadhaar });
      return response.json();
    },
    onSuccess: (data) => {
      setMockOtp(data.mockOtp); // For demo purposes - remove in production
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `OTP sent to registered mobile number. Mock OTP: ${data.mockOtp}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ aadhaar, otpCode }: { aadhaar: string; otpCode: string }) => {
      const response = await apiRequest('POST', '/api/auth/verify-otp', { 
        aadhaarNumber: aadhaar, 
        otp: otpCode 
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome, ${data.user.name}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setStep('login');
    setAadhaarNumber('');
    setOtp('');
    setMockOtp('');
  };

  const handleRequestOtp = () => {
    if (aadhaarNumber.length !== 12) {
      toast({
        title: "Invalid Aadhaar",
        description: "Please enter a valid 12-digit Aadhaar number",
        variant: "destructive",
      });
      return;
    }
    requestOtpMutation.mutate(aadhaarNumber);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate({ aadhaar: aadhaarNumber, otpCode: otp });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-railway-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-train text-white text-2xl"></i>
          </div>
          <DialogTitle className="text-2xl">RailCare Portal</DialogTitle>
          <p className="text-gray-600">Secure Aadhaar-based Authentication</p>
        </DialogHeader>

        {step === 'login' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
                Aadhaar Number
              </Label>
              <Input
                id="aadhaar"
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="Enter 12-digit Aadhaar number"
                maxLength={12}
                className="text-center text-lg tracking-wider"
              />
            </div>
            <Button 
              onClick={handleRequestOtp}
              disabled={requestOtpMutation.isPending || aadhaarNumber.length !== 12}
              className="w-full bg-railway-blue hover:bg-blue-700"
            >
              {requestOtpMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Sending OTP...
                </>
              ) : (
                'Request OTP'
              )}
            </Button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-sm text-gray-500 mt-2">
                OTP sent to mobile number ending with ***7890
              </p>
              {mockOtp && (
                <p className="text-xs text-alert-orange mt-1">
                  Demo OTP: {mockOtp}
                </p>
              )}
            </div>
            <Button 
              onClick={handleVerifyOtp}
              disabled={verifyOtpMutation.isPending || otp.length !== 6}
              className="w-full bg-safe-green hover:bg-green-700"
            >
              {verifyOtpMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </Button>
            <Button 
              onClick={() => setStep('login')}
              variant="outline"
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
