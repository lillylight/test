'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout';
import { Header } from './Header';

interface PaymentComponentProps {
  onPaymentSuccess: () => void;
}

export function PaymentComponent({ onPaymentSuccess }: PaymentComponentProps) {
  const { isConnected } = useAccount();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  
  // Get the product ID from environment variables
  const productId = process.env.NEXT_PUBLIC_PRODUCT_ID || '';

  // Set up an effect to listen for payment status changes
  useEffect(() => {
    // This effect should only run on the client side
    if (typeof window === 'undefined') return;
    
    // Flag to track if payment success has been detected
    let paymentSuccessDetected = false;
    
    const handleMessage = (event: MessageEvent) => {
      // Log all message events to help debug
      console.log('Message event received:', event);
      
      if (event.data) {
        console.log('Event data:', JSON.stringify(event.data, null, 2));
        
        // Check for any payment success indicators
        if (
          (event.data.type === 'checkout-status-change' && event.data.status === 'success') ||
          event.data.event_type === 'charge:confirmed' ||
          event.data.event_type === 'charge:resolved' ||
          event.data.event_type === 'charge:completed'
        ) {
          console.log('Payment success detected!');
          
          if (paymentSuccessDetected) {
            console.log('Payment success already detected, ignoring duplicate event');
            return;
          }
          
          paymentSuccessDetected = true;
          
          // Set payment as verified
          setPaymentVerified(true);
          
          // Store receipt URL if available
          if (event.data.hosted_url) {
            setReceiptUrl(event.data.hosted_url);
            // Open receipt in a new tab
            window.open(event.data.hosted_url, '_blank');
          } else if (event.data.receipt_url) {
            setReceiptUrl(event.data.receipt_url);
            // Open receipt in a new tab
            window.open(event.data.receipt_url, '_blank');
          }
          
          // Show payment verified UI first, then transition after a delay
          console.log('Payment verified. Showing verification message...');
          setTimeout(() => {
            console.log('Transitioning to results page...');
            onPaymentSuccess();
          }, 3000); // Show verification message for 3 seconds before transitioning
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Function to check for payment success indicators in the DOM
    const checkForPaymentSuccess = () => {
      if (paymentSuccessDetected) {
        return;
      }
      
      // Check for success message in the DOM
      const successElements = document.querySelectorAll('.ock-text-success, .ock-success-message');
      if (successElements.length > 0) {
        console.log('Payment success detected via DOM check!');
        paymentSuccessDetected = true;
        setPaymentVerified(true);
        setTimeout(() => {
          onPaymentSuccess();
        }, 3000); // Show verification message for 3 seconds before transitioning
        return;
      }
      
      // Check for success text in any element
      const allElements = document.querySelectorAll('*');
      Array.from(allElements).forEach(element => {
        if (
          element.textContent?.includes('Payment successful') ||
          element.textContent?.includes('Payment completed') ||
          element.textContent?.includes('Transaction complete') ||
          element.textContent?.includes('Payment confirmed') ||
          element.textContent?.includes('View payment details')
        ) {
          console.log('Payment success text detected in DOM check!');
          paymentSuccessDetected = true;
          setPaymentVerified(true);
          setTimeout(() => {
            onPaymentSuccess();
          }, 3000); // Show verification message for 3 seconds before transitioning
          return;
        }
      });
    };
    
    // Set up a DOM observer to detect when the Coinbase Commerce UI shows the payment success message
    const observer = new MutationObserver((mutations) => {
      if (paymentSuccessDetected) {
        return;
      }
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any of the added nodes contain text indicating payment success
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              
              // Check for success message in the DOM
              const successElements = document.querySelectorAll('.ock-text-success, .ock-success-message');
              if (successElements.length > 0) {
                console.log('Payment success detected via DOM observer!');
                
                if (paymentSuccessDetected) {
                  return;
                }
                
                paymentSuccessDetected = true;
                
                // Set payment as verified
                setPaymentVerified(true);
                
                // Call onPaymentSuccess immediately to proceed to prediction
                console.log('Payment verified via DOM. Calling onPaymentSuccess immediately...');
                setTimeout(() => {
                  onPaymentSuccess();
                }, 3000); // Show verification message for 3 seconds before transitioning
              }
              
              // Also check for text content that indicates success
              if (
                element.textContent?.includes('Payment successful') ||
                element.textContent?.includes('Payment completed') ||
                element.textContent?.includes('Transaction complete') ||
                element.textContent?.includes('Payment confirmed') ||
                element.textContent?.includes('View payment details')
              ) {
                console.log('Payment success text detected in DOM observer!');
                
                if (paymentSuccessDetected) {
                  return;
                }
                
                paymentSuccessDetected = true;
                
                // Set payment as verified
                setPaymentVerified(true);
                
                // Call onPaymentSuccess immediately to proceed to prediction
                console.log('Payment verified via text. Calling onPaymentSuccess immediately...');
                setTimeout(() => {
                  onPaymentSuccess();
                }, 3000); // Show verification message for 3 seconds before transitioning
              }
            }
          });
        }
      });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Set up a timer to periodically check for payment success indicators
    const checkInterval = setInterval(checkForPaymentSuccess, 1000);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      observer.disconnect();
      clearInterval(checkInterval);
    };
  }, [onPaymentSuccess]);

  const handlePredictClick = () => {
    setShowDisclaimer(true);
  };

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };

  const handleCancelDisclaimer = () => {
    setShowDisclaimer(false);
  };

  const handleViewPrediction = () => {
    console.log('View Prediction button clicked');
    onPaymentSuccess();
  };

  return (
    <>
      <Header isHomePage={false} />
      <div className="max-w-md mx-auto bg-secondary bg-opacity-90 p-6 rounded-3xl shadow-2xl border border-gray-600/30 text-center my-8 mx-4 sm:my-4 sm:mx-2">
        <h2 className="text-2xl font-bold mb-4 sm:text-xl">Complete Your Payment</h2>
        <p className="mb-6 text-gray-300 sm:mb-4 sm:text-sm">
          To receive your personalized birth time prediction, please complete the payment of $1 USDC.
        </p>
        
        {showDisclaimer ? (
          <div className="bg-secondary bg-opacity-90 p-6 rounded-2xl mb-6 border border-gray-600/30 shadow-lg sm:p-4 sm:mb-4">
            <h3 className="text-xl font-bold mb-4 sm:text-lg">Disclaimer</h3>
            <p className="mb-4 text-gray-300 sm:text-sm">
              By proceeding with this payment, you acknowledge that:
            </p>
            <ul className="text-left text-gray-300 mb-6 space-y-2 sm:mb-4 sm:text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>This is an experimental service and results are for entertainment purposes only.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The creator will not be held liable for any funds lost during the transaction.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>The accuracy of birth time predictions cannot be guaranteed.</span>
              </li>
            </ul>
            <div className="flex space-x-4 sm:space-x-2">
              <button
                onClick={handleCancelDisclaimer}
                className="flex-1 py-3 bg-gray-700/80 hover:bg-gray-600/80 rounded-full shadow-lg sm:py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptDisclaimer}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 rounded-full shadow-lg font-medium sm:py-2"
              >
                I Understand
              </button>
            </div>
          </div>
        ) : disclaimerAccepted ? (
          <div className="mb-6 sm:mb-4">
            {!isConnected ? (
              <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 p-4 rounded-2xl mb-4 border border-yellow-700/30 shadow-lg sm:p-3 sm:mb-3">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-yellow-300 mr-2 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-yellow-300 font-medium sm:text-sm">
                    Wallet Connection Required
                  </p>
                </div>
                <p className="text-sm text-yellow-200 mt-2 sm:text-xs">
                  Please connect your wallet using the button in the top right corner.
                </p>
              </div>
            ) : (
              <div>
                <div className="relative mb-6 p-6 bg-secondary bg-opacity-90 rounded-2xl border border-gray-600/30 shadow-lg sm:p-4 sm:mb-4">
                  {error && (
                    <div className="bg-red-900/30 p-3 rounded-xl mb-4 text-red-300 text-sm sm:p-2 sm:mb-3">
                      {error}
                    </div>
                  )}
                  
                  <div className="relative">
                    {/* Always render the Checkout component or the success UI */}
                    {paymentVerified ? (
                      <div className="bg-secondary bg-opacity-90 p-4 rounded-xl border border-gray-600/30 text-green-200 flex flex-col items-center justify-center max-h-[60vh] overflow-hidden sm:p-3">
                        <svg className="w-10 h-10 text-green-400 mb-2 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-bold mb-1 sm:text-base text-green-200">Payment Verified!</h3>
                        <p className="mb-2 text-sm sm:text-xs">Your payment has been successfully processed.</p>
                        <p className="text-xs sm:text-[10px]">Preparing your personalized birth time prediction...</p>
                        <div className="mt-3 w-full bg-gray-700/50 h-2 rounded-full overflow-hidden sm:mt-2">
                          <div className="bg-gradient-to-r from-green-400 to-teal-500 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                        
                        <div className="mt-4 py-2 px-4 bg-gray-700/70 rounded-xl text-gray-100 animate-pulse sm:mt-3 sm:py-1 sm:px-3">
                          <p className="font-medium text-sm sm:text-xs">Generating prediction...</p>
                          <p className="text-xs mt-1 sm:text-[10px]">Please wait while we prepare your results</p>
                        </div>
                        
                        {receiptUrl && (
                          <p className="mt-3 text-xs text-green-200 sm:mt-2 sm:text-[10px]">
                            A receipt has been opened in a new tab.
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Use the Coinbase Commerce Checkout component */}
                        <Checkout productId={productId}>
                          <CheckoutButton className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 rounded-full shadow-lg font-medium sm:py-2" />
                          <CheckoutStatus />
                        </Checkout>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center space-y-2 mb-4 sm:space-y-1 sm:mb-3">
                  <div className="flex items-center text-xs text-gray-400 sm:text-[10px]">
                    <svg className="w-4 h-4 mr-1 text-indigo-400 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Using Base mainnet for payments
                  </div>
                  <div className="text-xs text-gray-500 sm:text-[10px]">
                    Make sure your wallet is connected to the Base network
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 sm:mb-4">
            <button
              onClick={handlePredictClick}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 py-3 px-6 rounded-full w-full shadow-lg font-medium sm:py-2 sm:px-4"
            >
              Predict Birth Time
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-center text-sm text-gray-400 sm:text-xs">
          <svg className="w-4 h-4 mr-1 text-gray-500 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
          </svg>
          Your payment is processed securely through Coinbase Commerce
        </div>
      </div>
    </>
  );
}
