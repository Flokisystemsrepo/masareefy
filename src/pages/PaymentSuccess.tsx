import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Clear any pending upgrade data from localStorage
    localStorage.removeItem('pendingUpgrade');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
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
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-green-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                  className="absolute -top-2 -right-2"
                >
                  <Crown className="h-8 w-8 text-yellow-500" />
                </motion.div>
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Payment Successful!
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Your subscription has been upgraded successfully
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mt-1">
                Order ID: {orderId}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Access to premium features</li>
                <li>• Enhanced support</li>
                <li>• Advanced analytics</li>
                <li>• Priority customer service</li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/brand/subscription')}
              className="w-full"
            >
              View Subscription Details
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;