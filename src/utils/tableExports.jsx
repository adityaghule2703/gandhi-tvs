import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { showToast } from './sweetAlerts';

export const exportToExcel = (data, fileName = 'Export') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    showToast(`${fileName} exported to Excel successfully!`);
  } catch (error) {
    console.error('Excel export error:', error);
    showToast('Failed to export to Excel', 'error');
  }
};

export const exportToPdf = (data, headers, fileName = 'Export') => {
  try {
    const doc = new jsPDF({ orientation: 'landscape' });
    autoTable(doc, {
      head: [headers],
      body: data.map(item => headers.map(header => item[header] || '')),
    });
    doc.save(`${fileName}.pdf`);
    showToast(`${fileName} exported to PDF successfully!`);
  } catch (error) {
    console.error('PDF export error:', error);
    showToast('Failed to export to PDF', 'error');
  }
};

export const exportToModelPdf = (data, headers, fileName = 'Export', priceHeaders = [], isFiltered = false) => {
  try {
    const doc = new jsPDF({ orientation: 'landscape' });

    autoTable(doc, {
      head: [headers],
      body: data.map(item => {
        return headers.map(header => {
          if (header === 'model_name') {
            return item.model_name;
          }
          const priceKey = priceHeaders.find(h => h.header_key === header);
          if (!priceKey) return '-';

          const price = item.prices?.find(price => {
            return isFiltered
              ? price.header_key === priceKey.header_key
              : price.header_id === priceKey._id;
          });

          return price?.value || '-';
        });
      }),
    });

    doc.save(`${fileName}.pdf`);
    showToast(`${fileName} exported to PDF successfully!`);
  } catch (error) {
    console.error('PDF export error:', error);
    showToast('Failed to export to PDF', 'error');
  }
};

export const exportToUserPdf = (headers, body, fileName = 'Export') => {
  try {
    const doc = new jsPDF({ orientation: 'landscape' });
    autoTable(doc, {
      head: [headers],
      body: body,
    });
    doc.save(`${fileName}.pdf`);
    showToast(`${fileName} exported to PDF successfully!`);
  } catch (error) {
    console.error('PDF export error:', error);
    showToast('Failed to export to PDF', 'error');
  }
};

export const exportToCsv = (data, fileName = 'Export') => {
  try {
    return {
      data: data,
      filename: `${fileName}.csv`,
      onClick: () => showToast(`${fileName} exported to CSV successfully!`),
    };
  } catch (error) {
    console.error('CSV export error:', error);
    showToast('Failed to export to CSV', 'error');
    return { data: [], filename: 'error.csv' };
  }
};


export const exportToRolesCsv = (data, fileName = 'Export') => {
  try {
    const flattenedData = data.map(item => ({
      name: item.name,
      description: item.description,
      is_default: item.is_default,
      permissionsModule: item.permissions?.map(p => p.resource).join(', '),
      permissionsAction: item.permissions?.map(p => p.actions.join(', ')).join(' | ')
    }));

    return {
      data: flattenedData,
      filename: `${fileName}.csv`,
      onClick: () => showToast(`${fileName} exported to CSV successfully!`)
    };
  } catch (error) {
    console.error('CSV export error:', error);
    showToast('Failed to export to CSV', 'error');
    return { data: [], filename: 'error.csv' };
  }
};

export const exportToUserCsv = (data, fileName = 'Export') => {
  try {
    const headers = [
      'Username',
      'Email',
      'Full Name',
      'Mobile Number',
      'Branch',
      'Role',
      'Created By',
      'Is Active',
    ];

    const formattedData = data.map(user => ({
      Username: user.username,
      Email: user.email,
      'Full Name': user.full_name,
      'Mobile Number': user.mobile || '',
      Branch: user.branch_id?.name || 'N/A',
      Role: user.role_id?.name || 'N/A',
      'Created By': user.created_by?.username || 'N/A',
      'Is Active': user.is_active ? 'Active' : 'Inactive',
    }));

    return {
      data: formattedData,
      headers,
      filename: `${fileName}.csv`,
      onClick: () => showToast(`${fileName} exported to CSV successfully!`),
    };
  } catch (error) {
    console.error('CSV export error:', error);
    showToast('Failed to export to CSV', 'error');
    return { data: [], filename: 'error.csv' };
  }
};

export const copyToClipboard = (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Copy to clipboard error:', error);
    showToast('Failed to copy data', 'error');
    return '';
  }
};


export const getSortedCsvData = (data) => {
  if (!data || data.length === 0) return { data: [], headers: [] };
  const sortedData = [...data].sort((a, b) => a.priority_number - b.priority_number);

  const headers = sortedData.map((item) => ({
    label: item.name,
    key: item.key,
  }));

  const csvData = data.map((item) => {
    const row = {};
    headers.forEach((header) => {
      row[header.key] = item[header.key] || '';
    });
    return row;
  });

  return { data: csvData, headers };
};
