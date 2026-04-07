'use client';

import { useState } from 'react';
import { Customer, FinanceCharge } from '@/lib/ar-data';
import { X } from 'lucide-react';

interface FinanceChargePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  financeCharge: FinanceCharge;
  customer: Customer;
  onApplyPayment?: (financeChargeId: string, amount: number) => void;
}

export default function FinanceChargePaymentModal({
  isOpen,
  onClose,
  financeCharge,
  customer,
  onApplyPayment,
}: FinanceChargePaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const balanceDue = financeCharge.interestAmount - financeCharge.paid;

  const handleApplyPayment = () => {
    const amount = parseFloat(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (amount > balanceDue) {
      setError(`Payment cannot exceed balance due of $${balanceDue.toFixed(2)}`);
      return;
    }

    onApplyPayment?.(financeCharge.id, amount);
    setPaymentAmount('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Apply Payment to Finance Charge</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-700 uppercase font-semibold mb-3">Finance Charge Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Total Interest</span>
                <span className="text-sm font-bold text-blue-900">
                  ${financeCharge.interestAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Already Paid</span>
                <span className="text-sm font-semibold text-blue-900">
                  ${financeCharge.paid.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-blue-300 pt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-blue-900">Balance Due</span>
                <span className="text-lg font-bold text-blue-900">
                  ${balanceDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-semibold">
                $
              </span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => {
                  setPaymentAmount(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                max={balanceDue}
                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded font-mono focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            {/* Quick amount buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPaymentAmount(balanceDue.toFixed(2))}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Full Amount
              </button>
              <button
                onClick={() => setPaymentAmount((balanceDue / 2).toFixed(2))}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Half
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              This will record a payment application to the finance charge. The payment must already exist in the Payments tab.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-semibold text-sm hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyPayment}
            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
            className="px-4 py-2 bg-teal-700 text-white rounded font-semibold text-sm hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Apply Payment
          </button>
        </div>
      </div>
    </div>
  );
}
