'use client';

import { useState } from 'react';
import { Customer, Payment, PaymentApplication, CreditEntry, Charge } from '@/lib/ar-data';
import ChargesTab from './tabs/charges-tab';
import PaymentsTab from './tabs/payments-tab';
import RefundsTab from './tabs/refunds-tab';
import DeletedRecordsModal from '@/components/modals/deleted-records-modal';
import { Trash2 } from 'lucide-react';

interface ArPanelProps {
  customer: Customer;
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (paymentId: string) => void;
  onAddCharge: (charge: Charge) => void;
  onDeleteCharge: (chargeId: string) => void;
  onAddCreditEntry: (entry: CreditEntry) => void;
  onDeleteCreditEntry: (entryId: string) => void;
  onApplyPayment: (applications: PaymentApplication[]) => void;
  onUnapplyPayment: (applicationId: string) => void;
}

export default function ArPanel({ customer, onAddPayment, onDeletePayment, onAddCharge, onDeleteCharge, onAddCreditEntry, onDeleteCreditEntry, onApplyPayment, onUnapplyPayment }: ArPanelProps) {
  const [showDeletedRecordsModal, setShowDeletedRecordsModal] = useState(false);

  return (
    <div className="mt-6 px-6">
      {/* Header with Deleted Records Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Customer Transactions</h2>
        <button
          onClick={() => setShowDeletedRecordsModal(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="View Deleted Records"
        >
          <Trash2 className="w-4 h-4" />
          <span>Deleted Records ({customer.deletedEntries.length})</span>
        </button>
      </div>

      {/* Three-Column Concurrent Layout */}
      <div className="grid grid-cols-3 gap-4 auto-rows-max">
        {/* Charges Column */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-3 border-b border-blue-200 z-10">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Charges</h3>
            <p className="text-xs text-blue-700 mt-1">{customer.charges.length} invoices</p>
          </div>
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            <ChargesTab 
              customer={customer} 
              onAddCharge={onAddCharge} 
              onDeleteCharge={onDeleteCharge} 
              onAddCreditEntry={onAddCreditEntry} 
              onUnapplyPayment={onUnapplyPayment} 
              onApplyPayment={onApplyPayment} 
            />
          </div>
        </div>

        {/* Payments Column */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="sticky top-0 bg-gradient-to-r from-green-50 to-green-100 px-5 py-3 border-b border-green-200 z-10">
            <h3 className="text-sm font-bold text-green-900 uppercase tracking-wide">Payments</h3>
            <p className="text-xs text-green-700 mt-1">{customer.payments.length} payments</p>
          </div>
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            <PaymentsTab 
              customer={customer} 
              onAddPayment={onAddPayment} 
              onDeletePayment={onDeletePayment} 
              onApplyPayment={onApplyPayment} 
              onUnapplyPayment={onUnapplyPayment} 
            />
          </div>
        </div>

        {/* Credits Column */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-purple-100 px-5 py-3 border-b border-purple-200 z-10">
            <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">Credits</h3>
            <p className="text-xs text-purple-700 mt-1">{customer.creditEntries.length} credits</p>
          </div>
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            <RefundsTab 
              customer={customer} 
              onDeleteCreditEntry={onDeleteCreditEntry} 
              onAddCreditEntry={onAddCreditEntry} 
              onApplyPayment={onApplyPayment} 
              onUnapplyPayment={onUnapplyPayment} 
            />
          </div>
        </div>
      </div>

      {/* Deleted Records Modal */}
      <DeletedRecordsModal
        isOpen={showDeletedRecordsModal}
        onClose={() => setShowDeletedRecordsModal(false)}
        deletedEntries={customer.deletedEntries}
        customerName={customer.name}
      />
    </div>
  );
}
