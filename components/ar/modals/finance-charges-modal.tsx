'use client';

import { Customer, FinanceCharge } from '@/lib/ar-data';
import { X } from 'lucide-react';

interface FinanceChargesModalProps {
  isOpen: boolean;
  onClose: () => void;
  financeCharge: FinanceCharge;
  customer: Customer;
}

export default function FinanceChargesModal({
  isOpen,
  onClose,
  financeCharge,
  customer,
}: FinanceChargesModalProps) {
  if (!isOpen) return null;

  const originalInvoice = customer.charges.find((c) => c.id === financeCharge.chargeId);
  const balanceDue = financeCharge.interestAmount - financeCharge.paid;
  const percentPaid =
    financeCharge.interestAmount > 0
      ? (financeCharge.paid / financeCharge.interestAmount) * 100
      : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 sticky top-0">
          <h2 className="text-xl font-bold text-gray-900">Finance Charge Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Primary Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Finance Charge ID</p>
                <p className="text-sm font-mono text-gray-900 mt-1">{financeCharge.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Status</p>
                <p className="text-sm font-semibold mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      financeCharge.status === 'UNPAID'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : financeCharge.status === 'PARTIAL'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}
                  >
                    {financeCharge.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Original Invoice</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {originalInvoice?.num} {originalInvoice?.ref && `(${originalInvoice.ref})`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Calculation Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {financeCharge.calculationDate}
                </p>
              </div>
            </div>
          </div>

          {/* Calculation Period */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Calculation Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-700 font-semibold">Period Start</p>
                <p className="text-sm font-medium text-blue-900 mt-1">
                  {financeCharge.periodStartDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 font-semibold">Period End</p>
                <p className="text-sm font-medium text-blue-900 mt-1">
                  {financeCharge.periodEndDate}
                </p>
              </div>
            </div>
          </div>

          {/* Interest Calculation Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interest Calculation</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Principal Amount</span>
                <span className="text-sm font-medium text-gray-900">
                  ${financeCharge.principalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Annual Interest Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {financeCharge.interestRate}%
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Interest Calculated</span>
                <span className="text-lg font-bold text-gray-900">
                  ${financeCharge.interestAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Interest</span>
                <span className="text-sm font-medium text-gray-900">
                  ${financeCharge.interestAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount Paid</span>
                <span className="text-sm font-medium text-green-700 font-semibold">
                  ${financeCharge.paid.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Balance Due</span>
                <span
                  className={`text-lg font-bold ${
                    balanceDue > 0 ? 'text-red-700' : 'text-green-700'
                  }`}
                >
                  ${balanceDue.toFixed(2)}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-600">Collection Progress</span>
                  <span className="text-xs font-semibold text-gray-600">
                    {percentPaid.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(percentPaid, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Original Invoice Details */}
          {originalInvoice && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Related Invoice Details
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Invoice Number</span>
                  <span className="text-sm font-medium text-gray-900">
                    {originalInvoice.num}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reference</span>
                  <span className="text-sm font-medium text-gray-900">
                    {originalInvoice.ref}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Invoice Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {originalInvoice.date}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Due Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {originalInvoice.due}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Invoice Balance Due</span>
                  <span className="text-sm font-bold text-gray-900">
                    ${(originalInvoice.amount - originalInvoice.paid).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Audit Trail */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {financeCharge.createdDate}
                </span>
              </div>
              {financeCharge.notes && (
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <span className="text-sm text-gray-600 block mb-2">Notes</span>
                  <p className="text-sm text-gray-700">{financeCharge.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-semibold text-sm hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
