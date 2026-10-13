import { db } from './db.service.js';
import { roundCurrency } from './validation.service.js';

export async function getInsightsSummary(userId) {
  const { invoices } = await db.getInvoicesByUser(userId, { limit: 500 });
  const findings = await db.getFindingsByUser(userId, 'ALL');

  let totalSpendINR = 0;
  const currencyTotals = {};
  const supplierSpendMap = {};
  const categorySpendMap = {};
  const monthlySpendMap = {};

  let needsReviewCount = 0;
  let possibleDuplicatesCount = 0;
  let duplicateExposureINR = 0;

  invoices.forEach((inv) => {
    const amt = Number(inv.total_amount) || 0;
    const curr = inv.currency_code || 'INR';

    // Accumulate by currency
    currencyTotals[curr] = roundCurrency((currencyTotals[curr] || 0) + amt);
    if (curr === 'INR') {
      totalSpendINR = roundCurrency(totalSpendINR + amt);
    }

    // Review counts
    if (inv.review_status === 'Pending' || inv.validation_status === 'Needs Review' || inv.processing_status === 'Needs Review') {
      needsReviewCount++;
    }

    // Supplier aggregates
    const supp = inv.supplier_name || 'Unknown Supplier';
    if (!supplierSpendMap[supp]) {
      supplierSpendMap[supp] = { name: supp, total: 0, count: 0, currency: curr };
    }
    supplierSpendMap[supp].total = roundCurrency(supplierSpendMap[supp].total + amt);
    supplierSpendMap[supp].count += 1;

    // Category aggregates
    const cat = inv.category || 'Other';
    categorySpendMap[cat] = roundCurrency((categorySpendMap[cat] || 0) + amt);

    // Monthly spend
    if (inv.invoice_date) {
      const monthKey = inv.invoice_date.substring(0, 7); // YYYY-MM
      monthlySpendMap[monthKey] = roundCurrency((monthlySpendMap[monthKey] || 0) + amt);
    }
  });

  // Calculate duplicate exposure from open findings
  const openDuplicates = findings.filter((f) => f.finding_type === 'DUPLICATE_CANDIDATE' && f.status === 'OPEN');
  possibleDuplicatesCount = openDuplicates.length;
  openDuplicates.forEach((dup) => {
    const inv = invoices.find((i) => i.id === dup.invoice_id);
    if (inv && (inv.currency_code === 'INR' || !inv.currency_code)) {
      duplicateExposureINR = roundCurrency(duplicateExposureINR + (Number(inv.total_amount) || 0));
    }
  });

  // Format Top Suppliers
  const topSuppliers = Object.values(supplierSpendMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Format Category Breakdown
  const categoryBreakdown = Object.entries(categorySpendMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpendINR > 0 ? roundCurrency((amount / totalSpendINR) * 100) : 0,
  }));

  // Format Monthly Trend
  const monthlyTrend = Object.entries(monthlySpendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, spend]) => ({ month, spend }));

  // Recommendations based on real data
  const recommendations = [];
  if (possibleDuplicatesCount > 0) {
    recommendations.push({
      type: 'URGENT_ACTION',
      title: 'Halt Duplicate Invoice Approvals',
      description: `${possibleDuplicatesCount} invoices are flagged as potential duplicates representing ₹${duplicateExposureINR.toLocaleString()} in at-risk double payments. Review the queue before approving.`,
    });
  }
  if (needsReviewCount > 0) {
    recommendations.push({
      type: 'AUDIT_QUEUE',
      title: 'Review Backlog Pending',
      description: `You have ${needsReviewCount} invoices requiring human verification due to arithmetic or required field discrepancies.`,
    });
  }
  if (topSuppliers.length > 0) {
    const topVendor = topSuppliers[0];
    recommendations.push({
      type: 'VENDOR_INSIGHT',
      title: `Consolidate Spend with ${topVendor.name}`,
      description: `${topVendor.name} accounts for ${topVendor.total.toLocaleString()} (${topVendor.count} bills). Consider negotiating quarterly bulk rate terms.`,
    });
  }

  return {
    kpis: {
      totalInvoices: invoices.length,
      totalSpendINR,
      needsReviewCount,
      possibleDuplicatesCount,
      duplicateExposureINR,
      currencyTotals,
    },
    topSuppliers,
    categoryBreakdown,
    monthlyTrend,
    recommendations,
    recordsAnalyzed: invoices.length,
  };
}
