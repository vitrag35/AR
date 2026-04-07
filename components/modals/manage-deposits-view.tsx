'use client';

import { Deposit } from '@/lib/ar-data';

interface ManageDepositsViewProps {
  deposits: Deposit[];
  onFinalizeDeposit: (depositId: string) => void;
  onRemoveFromDeposit: (depositId: string, itemId: string, itemType: 'PAYMENT' | 'ADJUSTMENT' | 'RETURNED_CHECK') => void;
}

export default function ManageDepositsView({
  deposits,
  onFinalizeDeposit,
  onRemoveFromDeposit,
}: ManageDepositsViewProps) {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-800">All Deposits</h3>

      {deposits.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No deposits created yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-teal-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Deposit Date</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Batch</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Reference</th>
                <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Payment Total</th>
                <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Adjustment Total</th>
                <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Return Check Total</th>
                <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit, idx) => (
                <tr key={deposit.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-bold text-gray-800">{deposit.depositId}</td>
                  <td className="px-4 py-3 text-gray-600">{deposit.depositDate}</td>
                  <td className="px-4 py-3 text-gray-600">{deposit.batch || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{deposit.reference || '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-800 font-semibold">${deposit.paymentTotal.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-gray-800 font-semibold">${deposit.adjustmentTotal.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-gray-800 font-semibold">${deposit.returnCheckTotal.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                        deposit.status === 'POSTED'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                      }`}
                    >
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {deposit.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => onFinalizeDeposit(deposit.id)}
                            className="px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 rounded transition"
                          >
                            Post
                          </button>
                          <button
                            className="px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 rounded transition"
                          >
                            Print
                          </button>
                          <button
                            className="px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 rounded transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {deposit.status === 'POSTED' && (
                        <button
                          className="px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 rounded transition"
                        >
                          Print
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
