'use client';

import { useState } from 'react';
import { FinanceChargeConfig, FinanceChargeFrequency } from '@/lib/ar-data';
import { X } from 'lucide-react';

interface FinanceChargesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FinanceChargeConfig;
  onUpdateConfig: (config: FinanceChargeConfig) => void;
}

export default function FinanceChargesSettingsModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}: FinanceChargesSettingsModalProps) {
  const [formData, setFormData] = useState(config);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.annualInterestRate < 0 || formData.annualInterestRate > 100) {
      newErrors.annualInterestRate = 'Interest rate must be between 0 and 100%';
    }

    if (formData.daysUntilInterestApplies < 0) {
      newErrors.daysUntilInterestApplies = 'Days must be 0 or greater';
    }

    if (formData.minimumChargeAmount < 0) {
      newErrors.minimumChargeAmount = 'Minimum charge must be 0 or greater';
    }

    return newErrors;
  };

  const handleSave = () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdateConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 sticky top-0">
          <h2 className="text-xl font-bold text-gray-900">Finance Charges Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Enable/Disable */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="isEnabled"
                checked={formData.isEnabled}
                onChange={(e) => handleChange('isEnabled', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="isEnabled" className="text-sm font-semibold text-gray-700">
                Enable Finance Charges
              </label>
            </div>
            <p className="text-xs text-gray-600">
              When disabled, finance charges will not be calculated or applied.
            </p>
          </div>

          {/* Annual Interest Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Annual Interest Rate (%)
            </label>
            <input
              type="number"
              value={formData.annualInterestRate}
              onChange={(e) => handleChange('annualInterestRate', parseFloat(e.target.value))}
              step="0.1"
              min="0"
              max="100"
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent ${
                errors.annualInterestRate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.annualInterestRate && (
              <p className="text-sm text-red-600 mt-1">{errors.annualInterestRate}</p>
            )}
            <p className="text-xs text-gray-600 mt-2">
              The annual percentage rate used to calculate interest on overdue invoices. For example, 18 means 18% per year.
            </p>
          </div>

          {/* Days Until Interest Applies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Days Until Interest Applies
            </label>
            <input
              type="number"
              value={formData.daysUntilInterestApplies}
              onChange={(e) => handleChange('daysUntilInterestApplies', parseInt(e.target.value))}
              step="1"
              min="0"
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent ${
                errors.daysUntilInterestApplies ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.daysUntilInterestApplies && (
              <p className="text-sm text-red-600 mt-1">{errors.daysUntilInterestApplies}</p>
            )}
            <p className="text-xs text-gray-600 mt-2">
              The number of days an invoice must be overdue before interest begins to accrue. For example, 30 means interest starts on day 31 after the due date.
            </p>
          </div>

          {/* Calculation Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Calculation Frequency
            </label>
            <select
              value={formData.calculationFrequency}
              onChange={(e) => handleChange('calculationFrequency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
            <p className="text-xs text-gray-600 mt-2">
              How often finance charges should be calculated and applied. You must manually trigger the calculation by clicking "Run Calculation Now".
            </p>
          </div>

          {/* Minimum Charge Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Charge Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-700 font-semibold">
                $
              </span>
              <input
                type="number"
                value={formData.minimumChargeAmount}
                onChange={(e) => handleChange('minimumChargeAmount', parseFloat(e.target.value))}
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent ${
                  errors.minimumChargeAmount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.minimumChargeAmount && (
              <p className="text-sm text-red-600 mt-1">{errors.minimumChargeAmount}</p>
            )}
            <p className="text-xs text-gray-600 mt-2">
              Minimum interest amount before a finance charge entry is created. Charges smaller than this amount will not be recorded.
            </p>
          </div>

          {/* Last Run Date (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Last Run Date
            </label>
            <input
              type="text"
              value={formData.lastRunDate || 'Never'}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-600 mt-2">
              The date when finance charges were last calculated. This is automatically updated when you run the calculation.
            </p>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">How Finance Charges Work</p>
            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
              <li>Invoices must be overdue by the configured number of days before interest accrues</li>
              <li>Interest is calculated on the unpaid balance of the invoice</li>
              <li>Finance charges are created based on the calculation frequency, but only when you manually run the calculation</li>
              <li>Each finance charge is tracked separately and can be paid like a regular invoice</li>
              <li>All calculations are logged for audit purposes</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-semibold text-sm hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-teal-700 text-white rounded font-semibold text-sm hover:bg-teal-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
