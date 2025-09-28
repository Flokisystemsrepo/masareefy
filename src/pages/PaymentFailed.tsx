import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason');

  const getFailureMessage = (reason: string | null) => {
    switch (reason) {
      case 'invalid_signature':
        return 'Payment verification failed. Please contact support.';
      case 'payment_not_found':
        return 'Payment record not found. Please try again.';
      case 'server_error':
        return 'A server error occurred. Please try again later.';
      default:
        return 'Your payment could not be processed. Please try again.';
    }
  };

  const handleRetry = () => {
    navigate('/brand/subscription', {
      state: { showUpgradeModal: true }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <XCircle className="h-20 w-20 text-red-500" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-red-800">
              Payment Failed
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {getFailureMessage(reason)}
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mt-1">
                Order ID: {orderId}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-900 mb-2 flex items-center justify-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Common Issues
              </h3>
              <ul className="text-sm text-red-700 space-y-1 text-left">
                <li>• Insufficient funds</li>
                <li>• Card declined by bank</li>
                <li>• Network timeout</li>
                <li>• Invalid card details</li>
              </ul>
            </div>

            <Button
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="text-sm text-gray-500">
              Need help? Contact our support team
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;