'use client';

import { useState } from 'react';
import { Customer, FinanceCharge, FinanceChargeStatus } from '@/lib/ar-data';
import { getFinanceChargeStats } from '@/lib/finance-charges';
import FinanceChargesModal from '../modals/finance-charges-modal';
import FinanceChargePaymentModal from '../modals/finance-charge-payment-modal';

interface FinanceChargesTabProps {
  customer: Customer;
  onApplyPaymentToFinanceCharge?: (financeChargeId: string, amount: number) => void;
}

export default function FinanceChargesTab({
  customer,
  onApplyPaymentToFinanceCharge,
}: FinanceChargesTabProps) {
  const [selectedChargeId, setSelectedChargeId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const financeCharges = customer.financeCharges || [];
  const stats = getFinanceChargeStats(customer);

  const getStatusBadgeColor = (status: FinanceChargeStatus) => {
    switch (status) {
      case 'UNPAID':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PARTIAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PAID':
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const selectedCharge = financeCharges.find((fc) => fc.id === selectedChargeId);

  return (
    <>
      <div className="mb-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase font-semibold">Total Interest Charged</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">${stats.totalInterest.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs text-green-700 uppercase font-semibold">Interest Collected</p>
            <p className="text-2xl font-bold text-green-700 mt-2">${stats.totalPaid.toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-xs text-orange-700 uppercase font-semibold">Outstanding Interest</p>
            <p className="text-2xl font-bold text-orange-700 mt-2">${stats.totalOutstanding.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-700 uppercase font-semibold">Total Charges</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{stats.totalCharges}</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700">Finance Charges</h3>
            <p className="text-xs text-gray-500 mt-1">Click a row to view charge details and history.</p>
          </div>
        </div>

        {/* Selected charge info */}
        {selectedChargeId && selectedCharge && (
          <div className="bg-blue-50 border border-blue-200 rounded px-4 py-3 mb-4 flex items-center gap-3">
            <span className="text-sm text-blue-700 font-semibold flex-1">
              Finance Charge {selectedCharge.id} selected
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
            >
              View Details
            </button>
            {selectedCharge.status !== 'PAID' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-3 py-1 bg-teal-50 text-teal-700 rounded text-xs font-semibold hover:bg-teal-100 border border-teal-200"
              >
                Apply Payment
              </button>
            )}
            <button
              onClick={() => setSelectedChargeId(null)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold hover:bg-gray-200"
            >
              Deselect
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal-700 text-white">
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Record ID</th>
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Original Invoice</th>
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Calc Date</th>
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Period</th>
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Principal Amount</th>
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Interest Rate</th>
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Interest Charged</th>
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Amount Paid</th>
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Balance Due</th>
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {financeCharges.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                  No finance charges recorded for this customer.
                </td>
              </tr>
            ) : (
              financeCharges.map((fc) => {
                const balanceDue = fc.interestAmount - fc.paid;
                return (
                  <tr
                    key={fc.id}
                    onClick={() => setSelectedChargeId(fc.id)}
                    className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedChargeId === fc.id ? 'bg-blue-100 border-l-4 border-l-teal-700' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{fc.id}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {customer.charges.find((c) => c.id === fc.chargeId)?.num || fc.chargeId}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fc.calculationDate}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {fc.periodStartDate} to {fc.periodEndDate}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">
                      ${fc.principalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{fc.interestRate}%</td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">
                      ${fc.interestAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">${fc.paid.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">
                      ${balanceDue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(
                          fc.status
                        )}`}
                      >
                        {fc.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedCharge && (
        <FinanceChargesModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          financeCharge={selectedCharge}
          customer={customer}
        />
      )}

      {selectedCharge && (
        <FinanceChargePaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          financeCharge={selectedCharge}
          customer={customer}
          onApplyPayment={onApplyPaymentToFinanceCharge}
        />
      )}
    </>
  );
}
