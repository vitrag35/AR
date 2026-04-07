'use client';

import { useState, useMemo } from 'react';
import { DB, Deposit, Payment, CreditEntry, USERS } from '@/lib/ar-data';
import CreateNewDepositView from './create-new-deposit-view';
import ManageDepositsView from './manage-deposits-view';

interface UniversalDepositsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposits: Deposit[];
  onCreateDeposit: (paymentIds: string[], adjustmentIds: string[], depositDate: string, reference: string) => void;
  onDeleteDeposit: (depositId: string) => void;
}

export default function UniversalDepositsModal({
  isOpen,
  onClose,
  deposits,
  onCreateDeposit,
  onDeleteDeposit,
}: UniversalDepositsModalProps) {
  const [view, setView] = useState<'create' | 'manage'>('create');

  // Gather all transactions from all customers
  const allTransactions = useMemo(() => {
    const transactions: Array<{
      id: string;
      customerId: string;
      customerName: string;
      type: 'PAYMENT' | 'ADJUSTMENT' | 'RETURNED_CHECK';
      subType: string;
      date: string;
      amount: number;
      reference: string;
      user: string;
      raw: Payment | CreditEntry;
    }> = [];

    Object.values(DB).forEach((customer) => {
      // Add payments
      customer.payments.forEach((payment) => {
        if (!payment.isDeposited) {
          transactions.push({
            id: payment.id,
            customerId: customer.id,
            customerName: customer.name,
            type: payment.transactionType,
            subType: payment.type,
            date: payment.date,
            amount: payment.amount,
            reference: payment.ref,
            user: payment.user || 'Unknown',
            raw: payment,
          });
        }
      });

      // Add credit entries (adjustments)
      customer.creditEntries.forEach((entry) => {
        if (!entry.isDeposited && !entry.isDeleted) {
          transactions.push({
            id: entry.id,
            customerId: customer.id,
            customerName: customer.name,
            type: 'ADJUSTMENT',
            subType: entry.type,
            date: entry.date,
            amount: entry.amount,
            reference: entry.ref || 'N/A',
            user: entry.user || 'Unknown',
            raw: entry,
          });
        }
      });
    });

    return transactions;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-700 to-teal-600 text-white px-6 py-4 flex items-center justify-between border-b border-teal-800">
          <h2 className="text-2xl font-bold">Bank Deposits</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-teal-800 rounded px-3 py-1 transition"
          >
            ✕
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setView('create')}
            className={`px-6 py-3 font-semibold transition ${
              view === 'create'
                ? 'border-b-2 border-teal-700 text-teal-700 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Create New Deposit
          </button>
          <button
            onClick={() => setView('manage')}
            className={`px-6 py-3 font-semibold transition ${
              view === 'manage'
                ? 'border-b-2 border-teal-700 text-teal-700 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Manage Deposits
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {view === 'create' && (
            <CreateNewDepositView
              allTransactions={allTransactions}
              onCreateDeposit={onCreateDeposit}
              onExit={onClose}
            />
          )}
          {view === 'manage' && (
            <ManageDepositsView
              deposits={deposits}
              onDeleteDeposit={onDeleteDeposit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
