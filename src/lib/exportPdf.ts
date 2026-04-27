/**
 * PDF Export Utility for ClaimEase
 * Generates PDF documents for bills and claims
 */

interface Bill {
  id: string;
  title: string;
  category: string;
  amount: number;
  billDate: string;
  description?: string;
  status: string;
  createdAt: string;
}

/**
 * Generate a simple PDF invoice for a bill
 * Uses data URLs to create downloadable PDF
 */
export async function exportBillAsPdf(bill: Bill): Promise<void> {
  try {
    // Create HTML content for the bill
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bill - ${bill.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 40px; background: white; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #0d8b95; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #0d8b95; }
          .title { text-align: right; }
          .title h1 { font-size: 24px; color: #0d8b95; margin-bottom: 5px; }
          .title p { color: #666; font-size: 14px; }
          .bill-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
          .detail-section { padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .detail-section h3 { color: #0d8b95; font-size: 12px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; letter-spacing: 1px; }
          .detail-section p { font-size: 16px; font-weight: 500; color: #333; }
          .amount { font-size: 32px; font-weight: bold; color: #0d8b95; }
          .status { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
          .status.submitted { background: #fef08a; color: #854d0e; }
          .status.verified { background: #bfdbfe; color: #1e40af; }
          .status.approved { background: #bbf7d0; color: #065f46; }
          .description-section { margin-top: 30px; padding: 20px; background: #f9f9f9; border-left: 4px solid #0d8b95; }
          .description-section h3 { color: #0d8b95; margin-bottom: 10px; font-size: 14px; }
          .description-section p { color: #555; line-height: 1.8; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px; }
          .timestamp { color: #999; font-size: 13px; margin-top: 10px; }
          @media print { body { margin: 0; padding: 0; } .container { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💊 ClaimEase</div>
            <div class="title">
              <h1>Medical Bill</h1>
              <p>Bill ID: ${bill.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div class="bill-details">
            <div class="detail-section">
              <h3>Bill Details</h3>
              <p class="amount">₹${bill.amount.toFixed(2)}</p>
            </div>
            <div class="detail-section">
              <h3>Category</h3>
              <p class="amount" style="font-size: 18px; text-transform: capitalize;">${bill.category}</p>
            </div>
          </div>

          <div class="bill-details">
            <div class="detail-section">
              <h3>Bill Date</h3>
              <p>${new Date(bill.billDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="detail-section">
              <h3>Status</h3>
              <span class="status ${bill.status}">${bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}</span>
            </div>
          </div>

          <div class="bill-details">
            <div class="detail-section">
              <h3>Bill Title</h3>
              <p>${bill.title}</p>
            </div>
            <div class="detail-section">
              <h3>Created Date</h3>
              <p>${new Date(bill.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          ${bill.description ? `
            <div class="description-section">
              <h3>Description</h3>
              <p>${bill.description}</p>
            </div>
          ` : ''}

          <div class="footer">
            <p>This is an official bill from ClaimEase Insurance Claims Management System</p>
            <div class="timestamp">Generated on ${new Date().toLocaleString('en-IN')}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Convert HTML to PDF using print dialog or library
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Use browser's print to PDF
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  } catch (error) {
    console.error('Error exporting bill to PDF:', error);
    throw new Error('Failed to export bill as PDF');
  }
}

/**
 * Export multiple bills as CSV
 */
export function exportBillsAsCsv(bills: Bill[]): void {
  try {
    const headers = ['Bill ID', 'Title', 'Category', 'Amount', 'Status', 'Date', 'Description'];
    const rows = bills.map(bill => [
      bill.id.substring(0, 8),
      bill.title,
      bill.category,
      `₹${bill.amount.toFixed(2)}`,
      bill.status,
      new Date(bill.billDate).toLocaleDateString('en-IN'),
      bill.description || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `bills-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting bills to CSV:', error);
    throw new Error('Failed to export bills as CSV');
  }
}
