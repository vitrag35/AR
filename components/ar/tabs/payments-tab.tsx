'use client';

import { useState } from 'react';
import { Customer, PAYMENT_TYPE_LABELS, PaymentStatus, Payment } from '@/lib/ar-data';
import NewPaymentModal from '../modals/new-payment-modal';

interface PaymentsTabProps {
  customer: Customer;
  onAddPayment: (payment: Payment) => void;
}

export default function PaymentsTab({ customer, onAddPayment }: PaymentsTabProps) {
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);

  const getPaymentStatus = (payment: typeof customer.payments[0]): PaymentStatus => {
    if (payment.applied === 0) return 'UNAPPLIED';
    if (payment.applied < payment.amount) return 'PARTIAL';
    return 'APPLIED';
  };

  const getStatusBadgeColor = (status: PaymentStatus) => {
    switch (status) {
      case 'UNAPPLIED':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PARTIAL':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'APPLIED':
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700">Payments</h3>
            <p className="text-xs text-gray-500 mt-1">Payments are unapplied credits until applied to charges.</p>
          </div>
          <button
            onClick={() => setShowNewPaymentModal(true)}
            className="px-4 py-2 bg-teal-700 text-white rounded font-semibold text-sm hover:bg-teal-600 transition-colors"
          >
            + New Payment
          </button>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teal-700 text-white">
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Reference</th>
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Check Date</th>
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Amount</th>
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Applied</th>
              <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Unapplied Credit</th>
              <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {customer.payments.map((payment) => {
              const status = getPaymentStatus(payment);
              const unapplied = payment.amount - payment.applied;
              return (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-gray-800 font-medium">{payment.date}</td>
                  <td className="px-4 py-3 text-gray-600">{PAYMENT_TYPE_LABELS[payment.type]}</td>
                  <td className="px-4 py-3 text-gray-600">{payment.ref}</td>
                  <td className="px-4 py-3 text-gray-600">{payment.checkDate || '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-800 font-bold">${payment.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">${payment.applied.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">${unapplied.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeColor(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NewPaymentModal
        customer={customer}
        isOpen={showNewPaymentModal}
        onClose={() => setShowNewPaymentModal(false)}
        onAddPayment={onAddPayment}
      />
    </>
  );
}
