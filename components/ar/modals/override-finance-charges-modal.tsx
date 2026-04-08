'use client';

import { useState } from 'react';
import { Customer, FinanceCharge } from '@/lib/ar-data';
import { X } from 'lucide-react';

interface OverrideFinanceChargesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onSave: (amount: number) => void;
}

export default function OverrideFinanceChargesModal({
  isOpen,
  onClose,
  customer,
  onSave,
}: OverrideFinanceChargesModalProps) {
  const [financeChargeAmount, setFinanceChargeAmount] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = () => {
    const amount = parseFloat(financeChargeAmount);
    if (!isNaN(amount) && amount >= 0) {
      onSave(amount);
      setFinanceChargeAmount('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Override Finance Charges</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Customer: <span className="font-semibold text-gray-900">{customer.name}</span>
          </p>

          <div>
            <label htmlFor="financeCharge" className="block text-sm font-semibold text-gray-700 mb-2">
              Finance Charges:
            </label>
            <div className="flex items-center gap-3">
              <input
                id="financeCharge"
                type="number"
                value={financeChargeAmount}
                onChange={(e) => setFinanceChargeAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!financeChargeAmount || isNaN(parseFloat(financeChargeAmount))}
            className="px-6 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
