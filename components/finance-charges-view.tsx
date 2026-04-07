'use client';

import { useState } from 'react';
import { Customer, FinanceCharge, FinanceChargeStatus, DB, DEFAULT_FINANCE_CHARGE_CONFIG } from '@/lib/ar-data';
import { calculateFinanceChargesForAllCustomers } from '@/lib/finance-charges';
import FinanceChargesSettingsModal from './modals/finance-charges-settings-modal';
import FinanceChargesModal from './ar/modals/finance-charges-modal';
import { Settings, Play } from 'lucide-react';

interface FinanceChargesViewProps {
  onClose: () => void;
}

export default function FinanceChargesView({ onClose }: FinanceChargesViewProps) {
  const [config, setConfig] = useState(DEFAULT_FINANCE_CHARGE_CONFIG);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedFinanceChargeId, setSelectedFinanceChargeId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FinanceChargeStatus | 'ALL'>('ALL');
  const [financeChargeLogs, setFinanceChargeLogs] = useState<any[]>([]);

  // Gather all finance charges from all customers
  const allFinanceCharges: (FinanceCharge & { customerName: string; customerId: string })[] = [];
  Object.entries(DB).forEach(([customerId, customer]) => {
    customer.financeCharges?.forEach((fc) => {
      allFinanceCharges.push({
        ...fc,
        customerName: customer.name,
        customerId: customer.id,
      });
    });
  });

  const filteredCharges =
    statusFilter === 'ALL'
      ? allFinanceCharges
      : allFinanceCharges.filter((fc) => fc.status === statusFilter);

  const selectedCharge = allFinanceCharges.find((fc) => fc.id === selectedFinanceChargeId);
  const selectedCustomer = selectedCustomerId ? (DB[selectedCustomerId as keyof typeof DB] as Customer) : null;

  // Calculate totals
  const totalCharges = allFinanceCharges.length;
  const totalInterestCharged = allFinanceCharges.reduce((sum, fc) => sum + fc.interestAmount, 0);
  const totalCollected = allFinanceCharges.reduce((sum, fc) => sum + fc.paid, 0);
  const totalOutstanding = allFinanceCharges.reduce((sum, fc) => sum + (fc.interestAmount - fc.paid), 0);

  const handleRunFinanceCharges = () => {
    const today = new Date().toISOString().split('T')[0];
    const customers = Object.values(DB) as Customer[];
    const { charges, log } = calculateFinanceChargesForAllCustomers(customers, config, today);

    // Add new charges to customers
    charges.forEach((charge) => {
      const customer = DB[charge.customerId as keyof typeof DB];
      if (customer) {
        customer.financeCharges.push(charge);
      }
    });

    // Add to logs
    setFinanceChargeLogs([...financeChargeLogs, log]);

    // Update config last run date
    setConfig({ ...config, lastRunDate: today });

    // Refresh UI by clearing selection
    setSelectedFinanceChargeId(null);
  };

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finance Charges</h1>
            <p className="text-gray-600 mt-1">Company-wide interest and finance charge tracking</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to AR
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-600 uppercase font-semibold">Total Charges</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalCharges}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-600 uppercase font-semibold">Total Interest</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">${totalInterestCharged.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs text-green-700 uppercase font-semibold">Collected</p>
            <p className="text-3xl font-bold text-green-700 mt-2">${totalCollected.toFixed(2)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs text-orange-700 uppercase font-semibold">Outstanding</p>
            <p className="text-3xl font-bold text-orange-700 mt-2">${totalOutstanding.toFixed(2)}</p>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">Annual Rate: {config.annualInterestRate}% | Days Until Interest: {config.daysUntilInterestApplies} | Frequency: {config.calculationFrequency}</p>
              {config.lastRunDate && (
                <p className="text-sm text-gray-500 mt-2">Last Run: {config.lastRunDate}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRunFinanceCharges}
                disabled={!config.isEnabled}
                className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded font-semibold hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Run Calculation Now
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Filter by Status:</span>
            <div className="flex gap-2">
              {(['ALL', 'UNPAID', 'PARTIAL', 'PAID'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                    statusFilter === status
                      ? 'bg-teal-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status} ({allFinanceCharges.filter((fc) => status === 'ALL' || fc.status === status).length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Calc Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Principal</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Interest Rate</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Interest Charged</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Paid</th>
                  <th className="px-4 py-3 text-right font-semibold text-xs uppercase">Balance</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCharges.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No finance charges recorded.
                    </td>
                  </tr>
                ) : (
                  filteredCharges.map((fc) => {
                    const balanceDue = fc.interestAmount - fc.paid;
                    return (
                      <tr
                        key={fc.id}
                        onClick={() => {
                          setSelectedFinanceChargeId(fc.id);
                          setSelectedCustomerId(fc.customerId);
                        }}
                        className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                          selectedFinanceChargeId === fc.id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">{fc.customerName}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {Object.values(DB)
                            .flatMap((c) => c.charges)
                            .find((ch) => ch.id === fc.chargeId)?.num}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{fc.calculationDate}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          ${fc.principalAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">{fc.interestRate}%</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          ${fc.interestAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">${fc.paid.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
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
        </div>

        {/* Finance Charge Logs */}
        {financeChargeLogs.length > 0 && (
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Calculation History</h2>
            <div className="space-y-3">
              {financeChargeLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Run Date: {log.runDate}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {log.totalChargesCreated} charges created • Total: ${log.totalInterestAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ${log.totalInterestAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <FinanceChargesSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        config={config}
        onUpdateConfig={setConfig}
      />

      {/* Finance Charge Details Modal */}
      {selectedCharge && selectedCustomer && (
        <FinanceChargesModal
          isOpen={!!selectedFinanceChargeId}
          onClose={() => {
            setSelectedFinanceChargeId(null);
            setSelectedCustomerId(null);
          }}
          financeCharge={selectedCharge}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
}
