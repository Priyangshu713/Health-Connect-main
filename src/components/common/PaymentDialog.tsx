
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Calendar, Lock, CheckCircle2 } from 'lucide-react';
import { GeminiTier } from '@/store/healthStore';
import PaymentSuccessDialog from './PaymentSuccessDialog';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  plan: GeminiTier;
  billingCycle: string;
  amount: number;
}

interface PaymentFormData {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
}

const initialFormData: PaymentFormData = {
  cardNumber: '',
  cardHolderName: '',
  expiryDate: '',
  cvv: '',
};

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  plan,
  billingCycle,
  amount
}) => {
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, '$1 ');
      
      setFormData({ ...formData, [name]: formattedValue });
      return;
    }
    
    // Format expiry date with slash
    if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\//g, '')
        .replace(/\D/g, '')
        .slice(0, 4)
        .replace(/(\d{2})(?=\d)/g, '$1/');
      
      setFormData({ ...formData, [name]: formattedValue });
      return;
    }
    
    // Only allow digits for CVV
    if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '').slice(0, 3);
      setFormData({ ...formData, [name]: formattedValue });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!formData.cardHolderName) {
      newErrors.cardHolderName = 'Please enter card holder name';
    }
    
    if (!formData.expiryDate || formData.expiryDate.length < 5) {
      newErrors.expiryDate = 'Please enter a valid expiry date';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }
    
    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setSuccessDialogOpen(true);
    }, 2000);
  };
  
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    onPaymentSuccess();
  };
  
  const planName = plan === 'pro' ? 'Pro' : 'Lite';
  const formattedAmount = `₹${amount.toFixed(2)}`;
  
  return (
    <>
      <Dialog open={isOpen && !successDialogOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Complete your payment to subscribe to the {planName} plan.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Order summary */}
            <div className="bg-muted/40 p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">Order Summary</div>
              <div className="flex justify-between text-sm">
                <span>{planName} Plan ({billingCycle})</span>
                <span className="font-semibold">{formattedAmount}</span>
              </div>
              <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>{formattedAmount}</span>
              </div>
            </div>
            
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-sm font-medium">
                Card Number
              </Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
                />
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.cardNumber && (
                <p className="text-xs text-red-500">{errors.cardNumber}</p>
              )}
            </div>
            
            {/* Card Holder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardHolderName" className="text-sm font-medium">
                Card Holder Name
              </Label>
              <Input
                id="cardHolderName"
                name="cardHolderName"
                placeholder="John Doe"
                value={formData.cardHolderName}
                onChange={handleInputChange}
                className={errors.cardHolderName ? 'border-red-500' : ''}
              />
              {errors.cardHolderName && (
                <p className="text-xs text-red-500">{errors.cardHolderName}</p>
              )}
            </div>
            
            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-sm font-medium">
                  Expiry Date
                </Label>
                <div className="relative">
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.expiryDate ? 'border-red-500' : ''}`}
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.expiryDate && (
                  <p className="text-xs text-red-500">{errors.expiryDate}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-sm font-medium">
                  CVV
                </Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    name="cvv"
                    type="text"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.cvv ? 'border-red-500' : ''}`}
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.cvv && (
                  <p className="text-xs text-red-500">{errors.cvv}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center text-sm text-muted-foreground gap-1 mt-2">
              <Lock className="h-3 w-3" /> Your payment details are secure and encrypted
            </div>
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? 'Processing...' : `Pay ${formattedAmount}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <PaymentSuccessDialog
        isOpen={successDialogOpen}
        onClose={handleSuccessDialogClose}
        plan={planName}
        amount={formattedAmount}
        billingCycle={billingCycle}
      />
    </>
  );
};

export default PaymentDialog;
