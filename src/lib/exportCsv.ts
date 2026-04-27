/**
 * CSV Export Utility for ClaimEase
 * Generates CSV files for claims data
 */

interface Claim {
  id: string;
  claimNumber: string;
  billId: string;
  totalAmount: number;
  status: string;
  submittedAt: string;
  approvedAmount?: number;
  rejectionReason?: string;
}

/**
 * Export claims as CSV format
 */
export function exportClaimsAsCsv(claims: Claim[]): void {
  try {
    const headers = ['Claim Number', 'Claim ID', 'Bill ID', 'Amount', 'Approved Amount', 'Status', 'Submitted Date', 'Rejection Reason'];
    
    const rows = claims.map(claim => [
      claim.claimNumber,
      claim.id.substring(0, 8),
      claim.billId.substring(0, 8),
      `₹${claim.totalAmount.toFixed(2)}`,
      claim.approvedAmount ? `₹${claim.approvedAmount.toFixed(2)}` : '-',
      claim.status.charAt(0).toUpperCase() + claim.status.slice(1),
      new Date(claim.submittedAt).toLocaleDateString('en-IN'),
      claim.rejectionReason || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `claims-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting claims to CSV:', error);
    throw new Error('Failed to export claims as CSV');
  }
}

/**
 * Export claims with detailed timeline information
 */
export function exportClaimsWithDetailsAsCsv(claims: Claim[], claimEventsMap?: Map<string, any[]>): void {
  try {
    const headers = ['Claim Number', 'Amount', 'Status', 'Submitted Date', 'Last Updated', 'Timeline Events'];
    
    const rows = claims.map(claim => {
      const events = claimEventsMap?.get(claim.id) || [];
      const lastEvent = events[events.length - 1];
      const eventSummary = events.map((e: any) => `${e.eventType} (${new Date(e.timestamp).toLocaleDateString()})`).join(' → ');
      
      return [
        claim.claimNumber,
        `₹${claim.totalAmount.toFixed(2)}`,
        claim.status.charAt(0).toUpperCase() + claim.status.slice(1),
        new Date(claim.submittedAt).toLocaleDateString('en-IN'),
        lastEvent ? new Date(lastEvent.timestamp).toLocaleDateString('en-IN') : '-',
        eventSummary || 'No events'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `claims-detailed-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting detailed claims to CSV:', error);
    throw new Error('Failed to export claims as CSV');
  }
}
