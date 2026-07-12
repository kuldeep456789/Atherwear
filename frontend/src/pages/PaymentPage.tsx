import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { savePaymentMethod } from '../store/slices/cartSlice';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';
import { CreditCard, Wallet, Truck } from 'lucide-react';

const PaymentPage = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const { shippingAddress, paymentMethod: defaultPaymentMethod } = cart;
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod || 'Razorpay');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);
  const submitHandler = () => {
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
      <CheckoutSteps step1 step2 />

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mt-12">
        {/* Left Form Column */}
        <div className="lg:w-3/5">
          <h1 className="text-3xl font-black uppercase tracking-widest mb-8 dark:text-white">Payment Method</h1>
          
          <div className="space-y-4">
            <label className={`block border-2 p-6 cursor-pointer transition-all ${paymentMethod === 'Razorpay' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 accent-black"
                />
                <div className="flex flex-1 justify-between items-center dark:text-white">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">Razorpay Secure</span>
                    <span className="text-sm text-gray-500">Credit Card, UPI, Net Banking</span>
                  </div>
                  <div className="flex gap-2 text-gray-400">
                    <CreditCard className="w-6 h-6" />
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </label>

            <label className={`block border-2 p-6 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}>
              <div className="flex items-center gap-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 accent-black"
                />
                <div className="flex flex-1 justify-between items-center dark:text-white">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">Cash on Delivery</span>
                    <span className="text-sm text-gray-500">Pay when your order is delivered</span>
                  </div>
                  <div className="flex gap-2 text-gray-400">
                    <Truck className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>
        {/* Right Summary Column */}
        <div className="lg:w-2/5">
          <OrderSummarySidebar 
            buttonText="CONTINUE TO REVIEW" 
            buttonAction={submitHandler} 
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default PaymentPage;
