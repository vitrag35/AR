import { Customer, Charge, FinanceCharge, FinanceChargeConfig, FinanceChargeLog, FinanceChargeLogEntry } from './ar-data';

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate the number of months between two dates (fractional)
 */
export function monthsBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let months = 0;
  let tempDate = new Date(start);
  
  while (tempDate <= end) {
    months += 1 / 30.44; // Average days per month
    tempDate.setDate(tempDate.getDate() + 1);
  }
  
  return Math.max(0, months);
}

/**
 * Calculate interest amount based on principal, annual rate, and time period
 * Formula: Principal × (Annual Rate / 100 / 12) × Months
 */
export function calculateInterest(
  principalAmount: number,
  annualInterestRate: number,
  monthsPassed: number
): number {
  const monthlyRate = annualInterestRate / 100 / 12;
  const interest = principalAmount * monthlyRate * monthsPassed;
  return parseFloat(interest.toFixed(2)); // Round to 2 decimal places
}

/**
 * Get unpaid invoices for a customer
 */
export function getUnpaidInvoices(customer: Customer): Charge[] {
  return customer.charges.filter((charge) => {
    const balanceDue = charge.amount - charge.paid;
    return balanceDue > 0 && !charge.num.startsWith('RC-'); // Exclude returned checks
  });
}

/**
 * Check if a finance charge already exists for an invoice in a given month
 */
export function hasFinanceChargeForInvoiceInMonth(
  customer: Customer,
  chargeId: string,
  checkDate: string
): boolean {
  const checkMonth = new Date(checkDate).toISOString().slice(0, 7); // YYYY-MM
  return customer.financeCharges.some((fc) => {
    const fcMonth = new Date(fc.calculationDate).toISOString().slice(0, 7);
    return fc.chargeId === chargeId && fcMonth === checkMonth;
  });
}

/**
 * Calculate finance charges for a customer
 */
export function calculateFinanceChargesForCustomer(
  customer: Customer,
  config: FinanceChargeConfig,
  currentDate: string
): FinanceCharge[] {
  const newCharges: FinanceCharge[] = [];

  if (!config.isEnabled) {
    return newCharges;
  }

  const unpaidInvoices = getUnpaidInvoices(customer);

  unpaidInvoices.forEach((invoice) => {
    // Check if invoice is old enough to accrue interest
    const daysOverdue = daysBetween(invoice.due, currentDate);

    if (daysOverdue >= config.daysUntilInterestApplies) {
      // Check if we already have a finance charge for this invoice this month
      if (!hasFinanceChargeForInvoiceInMonth(customer, invoice.id, currentDate)) {
        // Calculate interest from invoice due date to current date
        const months = monthsBetween(invoice.due, currentDate);
        const balanceDue = invoice.amount - invoice.paid;
        
        const interestAmount = calculateInterest(
          balanceDue,
          config.annualInterestRate,
          months
        );

        // Only create charge if interest meets minimum threshold
        if (interestAmount >= config.minimumChargeAmount) {
          const newCharge: FinanceCharge = {
            id: `fc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            customerId: customer.id,
            chargeId: invoice.id,
            calculationDate: currentDate,
            periodStartDate: invoice.due,
            periodEndDate: currentDate,
            principalAmount: balanceDue,
            interestRate: config.annualInterestRate,
            interestAmount,
            status: 'UNPAID',
            paid: 0,
            createdDate: currentDate,
          };

          newCharges.push(newCharge);
        }
      }
    }
  });

  return newCharges;
}

/**
 * Calculate finance charges for all customers
 */
export function calculateFinanceChargesForAllCustomers(
  customers: Customer[],
  config: FinanceChargeConfig,
  currentDate: string
): { charges: FinanceCharge[]; log: FinanceChargeLog } {
  const allNewCharges: FinanceCharge[] = [];
  const chargesProcessed: FinanceChargeLogEntry[] = [];

  customers.forEach((customer) => {
    const customerCharges = calculateFinanceChargesForCustomer(
      customer,
      config,
      currentDate
    );

    if (customerCharges.length > 0) {
      allNewCharges.push(...customerCharges);
      chargesProcessed.push({
        customerId: customer.id,
        chargeCount: customerCharges.length,
        totalAmount: customerCharges.reduce((sum, fc) => sum + fc.interestAmount, 0),
      });
    }
  });

  const log: FinanceChargeLog = {
    id: `fcl-${Date.now()}`,
    runDate: currentDate,
    totalChargesCreated: allNewCharges.length,
    totalInterestAmount: allNewCharges.reduce((sum, fc) => sum + fc.interestAmount, 0),
    chargesProcessed,
  };

  return { charges: allNewCharges, log };
}

/**
 * Apply payment to a finance charge
 */
export function applyPaymentToFinanceCharge(
  financeCharge: FinanceCharge,
  paymentAmount: number
): FinanceCharge {
  const newPaidAmount = Math.min(
    financeCharge.paid + paymentAmount,
    financeCharge.interestAmount
  );

  return {
    ...financeCharge,
    paid: newPaidAmount,
    status:
      newPaidAmount === 0
        ? 'UNPAID'
        : newPaidAmount < financeCharge.interestAmount
        ? 'PARTIAL'
        : 'PAID',
  };
}

/**
 * Get outstanding finance charges for a customer (unpaid + partial)
 */
export function getOutstandingFinanceCharges(customer: Customer): FinanceCharge[] {
  return customer.financeCharges.filter((fc) => fc.status !== 'PAID');
}

/**
 * Get total interest owed by customer
 */
export function getTotalInterestOwed(customer: Customer): number {
  return customer.financeCharges.reduce((sum, fc) => {
    return sum + (fc.interestAmount - fc.paid);
  }, 0);
}

/**
 * Get finance charge statistics for display
 */
export function getFinanceChargeStats(customer: Customer) {
  const financeCharges = customer.financeCharges;
  const totalInterest = financeCharges.reduce((sum, fc) => sum + fc.interestAmount, 0);
  const totalPaid = financeCharges.reduce((sum, fc) => sum + fc.paid, 0);
  const totalOutstanding = totalInterest - totalPaid;

  return {
    totalCharges: financeCharges.length,
    totalInterest,
    totalPaid,
    totalOutstanding,
    unpaidCount: financeCharges.filter((fc) => fc.status === 'UNPAID').length,
    partialCount: financeCharges.filter((fc) => fc.status === 'PARTIAL').length,
    paidCount: financeCharges.filter((fc) => fc.status === 'PAID').length,
  };
}
