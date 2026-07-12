import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';
import { MapPin, CreditCard, Loader2 } from 'lucide-react';
import { clearCartItems } from '../store/slices/cartSlice';
import {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} from '../store/slices/orderApiSlice';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PlaceOrderPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const [createRazorpayOrder, { isLoading: isRazorpayLoading }] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment, { isLoading: isPaymentLoading }] = useVerifyRazorpayPaymentMutation();
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    setLocalError('');
    if (!userInfo?.accessToken) {
      setLocalError('You need to sign in again before placing an order.');
      navigate('/login?redirect=/placeorder');
      return;
    }

    if (!Number.isFinite(cart.totalPrice) || cart.totalPrice < 1) {
      setLocalError('Your order total must be at least ₹1 before online payment can be created.');
      return;
    }

    try {
      // Step 1: Create the order in our backend
      const items = cart.cartItems.map((item) => ({
        productId: item._id,
        quantity: item.qty,
      }));
      const normalizedPaymentMethod = cart.paymentMethod === 'COD' ? 'COD' : 'Razorpay';

      const res = await createOrder({
        items,
        totalAmount: cart.totalPrice,
        paymentMethod: normalizedPaymentMethod,
      }).unwrap();

      console.log('Order Response:', res);

      const orderId = res.order._id;

      if (normalizedPaymentMethod === 'COD') {
        dispatch(clearCartItems());
        navigate(`/order/${orderId}`);
        return;
      }

      // Step 2: Create Razorpay order on backend (gets gateway order + key)
      const razorpayRes = await createRazorpayOrder(orderId).unwrap();
      console.log('Razorpay Order Response:', razorpayRes);

      // Step 3: Load the Razorpay checkout SDK
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setLocalError('Failed to load Razorpay checkout. Please check your internet connection and try again.');
        return;
      }

      // Step 4: Open the Razorpay payment popup
      const options = {
        key: razorpayRes.keyId,
        amount: razorpayRes.gatewayOrder.amount,
        currency: razorpayRes.gatewayOrder.currency || 'INR',
        name: 'AETHERWEAR',
        description: `Order #${orderId}`,
        order_id: razorpayRes.gatewayOrder.id,

        // Called by Razorpay after successful payment
        handler: async (response: any) => {
          try {
            await verifyRazorpayPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }).unwrap();

            dispatch(clearCartItems());
            navigate(`/order/${orderId}`);
          } catch (err: any) {
            console.error('Payment verification failed:', err);
            setLocalError(
              err?.data?.message ||
              'Payment was collected but verification failed. Please contact support with your order ID: ' + orderId
            );
          }
        },

        prefill: {
          name: userInfo ? `${userInfo.firstName} ${userInfo.lastName}`.trim() : '',
          email: userInfo?.email || '',
          contact: userInfo?.phone || '',
        },

        notes: {
          order_id: orderId,
        },

        theme: {
          color: '#000000',
        },

        modal: {
          // User closed the payment popup without paying
          ondismiss: () => {
            setLocalError(
              'Payment was cancelled. Your order has been saved — you can complete payment from the order page.'
            );
            // Navigate to the unpaid order so user can retry later
            navigate(`/order/${orderId}`);
          },
        },
      };

      console.log('Razorpay Options:', options);

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', (response: any) => {
        console.error('[Razorpay] Payment failed:', response.error);
        console.log('Razorpay payment.failed payload:', response);
        setLocalError(
          response.error?.description ||
          'Payment failed. Please try a different card or payment method.'
        );
      });

      rzp.open();
    } catch (err: any) {
      console.error('Failed to place order:', err);
      setLocalError(err?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
      <CheckoutSteps step1 step2 step3 />

      {(error || localError) && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-md text-sm font-semibold">
          {localError || (error as any)?.data?.message || 'Failed to place order. Please try again.'}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mt-12">
        {/* Left: Review Details */}
        <div className="lg:w-3/5 space-y-12">
          
          <section>
            <h2 className="text-2xl font-black uppercase tracking-widest mb-6 dark:text-white flex items-center gap-2">
              <MapPin className="w-6 h-6" /> Shipping
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-md border border-gray-200 dark:border-gray-800 dark:text-gray-300 flex justify-between items-start">
              <p className="text-sm leading-relaxed">
                {cart.shippingAddress.address}<br />
                {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}<br />
                {cart.shippingAddress.country}
              </p>
              <Link className="text-xs underline hover:text-black dark:hover:text-white shrink-0 ml-4" to="/shipping">Edit</Link>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black uppercase tracking-widest mb-6 dark:text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6" /> Payment
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-md border border-gray-200 dark:border-gray-800 dark:text-gray-300 flex justify-between items-center">
              <p className="text-sm font-semibold">{cart.paymentMethod}</p>
              <Link className="text-xs underline hover:text-black dark:hover:text-white" to="/payment">Edit</Link>
            </div>
          </section>

        </div>

        {/* Right: Summary + CTA */}
        <div className="lg:w-2/5">
          <OrderSummarySidebar
            buttonText={
              isLoading 
                ? 'PLACING ORDER...' 
                : isRazorpayLoading 
                  ? 'GENERATING PAYMENT...' 
                  : isPaymentLoading 
                    ? 'VERIFYING...' 
                    : 'PLACE ORDER'
            }
            buttonAction={placeOrderHandler}
            disableButton={isLoading || isRazorpayLoading || isPaymentLoading || cart.totalPrice < 1}
          />
          {(isLoading || isRazorpayLoading || isPaymentLoading) && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isLoading 
                ? 'Sending your order to our servers…' 
                : isRazorpayLoading 
                  ? 'Connecting to secure payment gateway…' 
                  : 'Verifying payment signature…'}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
