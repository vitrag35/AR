'use client';

import { useState } from 'react';
import { Customer, PaymentApplication } from '@/lib/ar-data';
import ApplyPaymentModal from '../modals/apply-payment-modal';

interface RefundsTabProps {
  customer: Customer;
  onDeleteCreditEntry: (entryId: string) => void;
  onApplyPayment?: (applications: PaymentApplication[]) => void;
  onUnapplyPayment: (applicationId: string) => void;
}

export default function RefundsTab({
  customer,
  onDeleteCreditEntry,
  onApplyPayment,
  onUnapplyPayment,
}: RefundsTabProps) {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get negative adjustments (credit memo)
  const refunds = customer.creditEntries.filter((entry) => entry.type === 'REFUND');

  const getRefundStatusColor = (applied: number, total: number) => {
    if (applied === 0) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (applied < total) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  const handleDelete = (refundId: string) => {
    const refund = refunds.find((r) => r.id === refundId);
    if (!refund) return;

    // Check if applied
    const hasApplications = customer.applications.some((app) => app.paymentId === refundId);
    if (hasApplications) {
      setDeletingId(null);
      return;
    }

    onDeleteCreditEntry(refundId);
    setDeletingId(null);
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700">Refunds / Credits</h3>
            <p className="text-xs text-gray-500 mt-1">
              Negative adjustments and returned order credits. Apply to invoices to reduce what customer owes.
            </p>
          </div>
          <button
            onClick={() => setShowApplyModal(true)}
            disabled={refunds.length === 0}
            className="px-4 py-2 bg-teal-700 text-white rounded font-semibold text-sm hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Apply Refund to Charges
          </button>
        </div>

        {refunds.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded p-6 text-center">
            <p className="text-gray-500 text-sm">No refunds or credit memos yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Reference</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Applied</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Available</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => {
                  const applications = customer.applications.filter((a) => a.paymentId === refund.id);
                  const status =
                    refund.applied === 0
                      ? 'UNAPPLIED'
                      : refund.applied < refund.amount
                      ? 'PARTIAL'
                      : 'APPLIED';

                  return (
                    <tr
                      key={refund.id}
                      onClick={() => setSelectedRefundId(refund.id)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${
                        selectedRefundId === refund.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-3 py-2 text-gray-800 text-sm">{refund.date}</td>
                      <td className="px-3 py-2 text-gray-600 text-sm">{refund.reason || '-'}</td>
                      <td className="px-3 py-2 text-gray-600 text-sm font-mono">{refund.ref}</td>
                      <td className="px-3 py-2 text-right font-bold text-gray-800">${refund.amount.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-bold text-teal-700">${refund.applied.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-bold text-gray-800">
                        ${(refund.amount - refund.applied).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getRefundStatusColor(
                            refund.applied,
                            refund.amount
                          )}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {deletingId === refund.id ? (
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(refund.id);
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded font-semibold hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingId(null);
                              }}
                              className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded font-semibold hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (applications.length > 0) {
                                return;
                              }
                              setDeletingId(refund.id);
                            }}
                            disabled={applications.length > 0}
                            className="text-red-600 font-semibold text-xs hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            {applications.length > 0 ? 'Applied' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ApplyPaymentModal
        customer={customer}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onApplyPayment={onApplyPayment || (() => {})}
      />
    </>
  );
}
