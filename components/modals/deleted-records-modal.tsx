'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DeletedEntry, DeletedEntryType } from '@/lib/ar-data';
import { X } from 'lucide-react';

interface DeletedRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedEntries: DeletedEntry[];
  customerName?: string;
}

export default function DeletedRecordsModal({
  isOpen,
  onClose,
  deletedEntries,
  customerName,
}: DeletedRecordsModalProps) {
  const [filterType, setFilterType] = useState<DeletedEntryType | 'ALL'>('ALL');

  const getTypeBadge = (type: DeletedEntryType) => {
    switch (type) {
      case 'PAYMENT':
        return { label: 'P', color: 'bg-green-100 text-green-700', fullLabel: 'Payment' };
      case 'ADJUSTMENT':
        return { label: 'A', color: 'bg-purple-100 text-purple-700', fullLabel: 'Adjustment' };
      case 'REFUND':
        return { label: 'C', color: 'bg-orange-100 text-orange-700', fullLabel: 'Credit' };
      case 'RETURNED_CHECK':
        return { label: 'R', color: 'bg-red-100 text-red-700', fullLabel: 'Returned Check' };
      default:
        return { label: '?', color: 'bg-gray-100 text-gray-700', fullLabel: 'Unknown' };
    }
  };

  const filteredEntries = filterType === 'ALL' 
    ? deletedEntries 
    : deletedEntries.filter((e) => e.entryType === filterType);

  // Sort by deleted date descending
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.deletedDate).getTime() - new Date(a.deletedDate).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-800">
              Deleted Records History
              {customerName && <span className="text-teal-700 ml-2">- {customerName}</span>}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <DialogDescription className="text-sm text-gray-500">
            View all deleted payments, adjustments, credits, and returned checks
          </DialogDescription>
        </DialogHeader>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-4 flex-shrink-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterType === 'ALL'
                ? 'bg-teal-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({deletedEntries.length})
          </button>
          <button
            onClick={() => setFilterType('PAYMENT')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterType === 'PAYMENT'
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Payments ({deletedEntries.filter((e) => e.entryType === 'PAYMENT').length})
          </button>
          <button
            onClick={() => setFilterType('ADJUSTMENT')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterType === 'ADJUSTMENT'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Adjustments ({deletedEntries.filter((e) => e.entryType === 'ADJUSTMENT').length})
          </button>
          <button
            onClick={() => setFilterType('REFUND')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterType === 'REFUND'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            Credits ({deletedEntries.filter((e) => e.entryType === 'REFUND').length})
          </button>
          <button
            onClick={() => setFilterType('RETURNED_CHECK')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filterType === 'RETURNED_CHECK'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Returned Checks ({deletedEntries.filter((e) => e.entryType === 'RETURNED_CHECK').length})
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
          {sortedEntries.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <p>No deleted records found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-teal-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Record ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Document #</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Reference</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Original Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Deleted Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Customer</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map((entry) => {
                  const badge = getTypeBadge(entry.entryType);
                  return (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-bold ${badge.color}`}
                          title={badge.fullLabel}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono">{entry.entryId}</td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{entry.documentNum || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.reference || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.date}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">
                        ${entry.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-red-600 font-medium">{entry.deletedDate}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.customerName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 flex-shrink-0">
          <p className="text-sm text-gray-500">
            Showing {sortedEntries.length} of {deletedEntries.length} deleted records
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
