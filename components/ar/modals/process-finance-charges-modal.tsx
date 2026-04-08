'use client';

import { useState } from 'react';
import { Customer, DEFAULT_FINANCE_CHARGE_CONFIG } from '@/lib/ar-data';
import { X } from 'lucide-react';

interface ProcessFinanceChargesModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onProcess: () => void;
}

export default function ProcessFinanceChargesModal({
  isOpen,
  onClose,
  customer,
  onProcess,
}: ProcessFinanceChargesModalProps) {
  if (!isOpen) return null;

  const config = DEFAULT_FINANCE_CHARGE_CONFIG;
  const today = new Date().toISOString().split('T')[0];

  const handleProcess = () => {
    onProcess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Process Finance Charges</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <p className="text-base font-semibold text-gray-900">
            Process finance charges on overdue invoices for customers with &apos;Finance Charges&apos; = YES
          </p>

          <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div>
              <p className="text-sm text-gray-600">Current Interest Rate (Annual):</p>
              <p className="text-lg font-bold text-gray-900">{config.annualInterestRate}%</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Today&apos;s Date:</p>
              <p className="text-lg font-bold text-gray-900">{today}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Last run:</p>
              <p className="text-lg font-bold text-gray-900">{config.lastRunDate || 'Never'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Last rate:</p>
              <p className="text-lg font-bold text-gray-900">0%</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 p-6 border-t border-gray-200">
          <button
            onClick={handleProcess}
            className="px-8 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition-colors"
          >
            Process
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
