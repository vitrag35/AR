'use client';

import { useState } from 'react';
import { Customer, FinanceCharge } from '@/lib/ar-data';
import ProcessFinanceChargesModal from './process-finance-charges-modal';
import OverrideFinanceChargesModal from './override-finance-charges-modal';
import { X } from 'lucide-react';

interface CustomerFinanceChargesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onProcessFinanceCharges: () => void;
  onOverrideFinanceCharges: (amount: number) => void;
}

export default function CustomerFinanceChargesModal({
  isOpen,
  onClose,
  customer,
  onProcessFinanceCharges,
  onOverrideFinanceCharges,
}: CustomerFinanceChargesModalProps) {
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Finance Charges</h2>
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

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-xs text-gray-600">
                Finance Charges: <span className="font-bold text-gray-900">{customer.financeCharges?.length || 0}</span>
              </p>
              {customer.financeCharges && customer.financeCharges.length > 0 && (
                <p className="text-xs text-gray-600">
                  Total Charged: <span className="font-bold text-gray-900">${customer.financeCharges.reduce((sum, fc) => sum + fc.interestAmount, 0).toFixed(2)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowOverrideModal(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded font-semibold hover:bg-orange-600 transition-colors"
            >
              Override
            </button>
            <button
              onClick={() => setShowProcessModal(true)}
              className="px-6 py-2 bg-teal-700 text-white rounded font-semibold hover:bg-teal-600 transition-colors"
            >
              Process
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <ProcessFinanceChargesModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        customer={customer}
        onProcess={() => {
          onProcessFinanceCharges();
          setShowProcessModal(false);
        }}
      />

      <OverrideFinanceChargesModal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        customer={customer}
        onSave={(amount) => {
          onOverrideFinanceCharges(amount);
          setShowOverrideModal(false);
        }}
      />
    </>
  );
}
