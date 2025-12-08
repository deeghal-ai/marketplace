import * as XLSX from 'xlsx';

/**
 * Excel Parser Utility
 * Wrapper around SheetJS for parsing Excel files
 */

/**
 * Parse an Excel file and return data
 * @param {File} file - File object from input
 * @returns {Promise<{data: Object[], columns: string[], sheetName: string}>}
 */
export const parseExcelFile = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  
  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(sheet);
  
  // Extract columns
  const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
  
  return {
    data: jsonData,
    columns,
    sheetName,
    rowCount: jsonData.length,
  };
};

/**
 * Parse multiple sheets from an Excel file
 * @param {File} file - File object from input
 * @returns {Promise<Object>} - Object with sheet names as keys
 */
export const parseAllSheets = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  
  const sheets = {};
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    sheets[sheetName] = XLSX.utils.sheet_to_json(sheet);
  });
  
  return sheets;
};

/**
 * Export data to Excel file
 * @param {Object[]} data - Array of objects to export
 * @param {string} filename - Output filename
 * @param {string} sheetName - Sheet name (default: 'Sheet1')
 */
export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

/**
 * Get sample data for demo/testing (Chinese dealer format with SERIES and MODEL NAME)
 * This matches the format: No, VIN, MODEL NAME, SERIES, Body Type, Year, Brand, Color, Mileage, Price
 * @returns {Object[]} - Sample vehicle data matching Chinese dealer format
 */
export const getSampleData = () => [
  // Honda Crider vehicles (like user's data)
  { 'No': 1, 'VIN': 'LHGFS1635M2039517', 'MODEL NAME': '2019 GAC Honda Crider 180Turbo CVT Comfort China VI', 'SERIES': 'HONDA Crider', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'HONDA', 'Ext.Color': 'White', 'Mileage(km)': 202700, 'CIF Cost (Jebel Ali)': '$6,530' },
  { 'No': 2, 'VIN': 'LHGFS1634M2042943', 'MODEL NAME': '2019 GAC Honda Crider 180Turbo CVT Comfort China VI', 'SERIES': 'HONDA Crider', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'HONDA', 'Ext.Color': 'White', 'Mileage(km)': 121254, 'CIF Cost (Jebel Ali)': '$6,530' },
  { 'No': 3, 'VIN': 'LHGFS1634M2039492', 'MODEL NAME': '2019 GAC Honda Crider 180Turbo CVT Comfort China VI', 'SERIES': 'HONDA Crider', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'HONDA', 'Ext.Color': 'White', 'Mileage(km)': 185213, 'CIF Cost (Jebel Ali)': '$6,640' },
  { 'No': 4, 'VIN': 'LHGFS1633M2039516', 'MODEL NAME': '2019 GAC Honda Crider 180Turbo CVT Comfort China VI', 'SERIES': 'HONDA Crider', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'HONDA', 'Ext.Color': 'White', 'Mileage(km)': 199719, 'CIF Cost (Jebel Ali)': '$6,640' },
  // Nissan Sylphy vehicles 
  { 'No': 5, 'VIN': 'LGBH52E0XMY173095', 'MODEL NAME': '2022 NISSAN SYLPHY 1.6XE CVT Key Account Version', 'SERIES': 'SYLPHY', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'NISSAN', 'Ext.Color': 'White', 'Mileage(km)': 180666, 'CIF Cost (Jebel Ali)': '$6,870' },
  { 'No': 6, 'VIN': 'LGBH52E0XMY173081', 'MODEL NAME': '2022 NISSAN SYLPHY 1.6XE CVT Key Account Version', 'SERIES': 'SYLPHY', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'NISSAN', 'Ext.Color': 'White', 'Mileage(km)': 178680, 'CIF Cost (Jebel Ali)': '$6,980' },
  { 'No': 7, 'VIN': 'LGBH52E0XMY108537', 'MODEL NAME': '2022 NISSAN SYLPHY Classic 1.6XE CVT', 'SERIES': 'SYLPHY', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'NISSAN', 'Ext.Color': 'White', 'Mileage(km)': 143069, 'CIF Cost (Jebel Ali)': '$7,090' },
  { 'No': 8, 'VIN': 'LGBH52E02MY093239', 'MODEL NAME': '2022 NISSAN SYLPHY Classic 1.6XE CVT', 'SERIES': 'SYLPHY', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'NISSAN', 'Ext.Color': 'White', 'Mileage(km)': 150655, 'CIF Cost (Jebel Ali)': '$7,090' },
  // More Honda Crider with different mileage
  { 'No': 9, 'VIN': 'LHGFS1638M2036403', 'MODEL NAME': '2019 GAC Honda Crider 180Turbo CVT Comfort China VI', 'SERIES': 'HONDA Crider', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'HONDA', 'Ext.Color': 'White', 'Mileage(km)': 133867, 'CIF Cost (Jebel Ali)': '$6,980' },
  { 'No': 10, 'VIN': 'LHGFS1638M2038846', 'MODEL NAME': '2019 GAC Honda Crider 180Turbo CVT Comfort China VI', 'SERIES': 'HONDA Crider', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'HONDA', 'Ext.Color': 'White', 'Mileage(km)': 146536, 'CIF Cost (Jebel Ali)': '$6,980' },
  { 'No': 11, 'VIN': 'LHGFS163XM2040744', 'MODEL NAME': '2019 GAC Honda Crider 180Turbo CVT Comfort China VI', 'SERIES': 'HONDA Crider', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'HONDA', 'Ext.Color': 'Silver', 'Mileage(km)': 143876, 'CIF Cost (Jebel Ali)': '$6,980' },
  { 'No': 12, 'VIN': 'LHGFS1632M2040804', 'MODEL NAME': '2019 GAC Honda Crider 180Turbo CVT Comfort China VI', 'SERIES': 'HONDA Crider', 'Body Type': 'sedan', 'Year': '2021', 'Brand': 'HONDA', 'Ext.Color': 'Silver', 'Mileage(km)': 139327, 'CIF Cost (Jebel Ali)': '$6,980' },
];

/**
 * Get simple sample data for demo/testing (original format)
 * @returns {Object[]} - Sample vehicle data
 */
export const getSimpleSampleData = () => [
  { Brand: 'Toyota', Model: 'Camry', Year: 2023, Color: 'Silver', Variant: 'XLE', 'Body Type': 'Sedan', 'Fuel Type': 'Petrol', Transmission: 'Automatic', VIN: 'ABC123456789', Mileage: 15000, 'No of Owners': 1, Price: 95000 },
  { Brand: 'Toyota', Model: 'Camry', Year: 2023, Color: 'Silver', Variant: 'XLE', 'Body Type': 'Sedan', 'Fuel Type': 'Petrol', Transmission: 'Automatic', VIN: 'DEF123456789', Mileage: 18000, 'No of Owners': 1, Price: 92000 },
  { Brand: 'Toyota', Model: 'Camry', Year: 2023, Color: 'Silver', Variant: 'XLE', 'Body Type': 'Sedan', 'Fuel Type': 'Petrol', Transmission: 'Automatic', VIN: 'GHI123456789', Mileage: 12000, 'No of Owners': 2, Price: 98000 },
  { Brand: 'Honda', Model: 'Civic', Year: 2022, Color: 'Black', Variant: 'Sport', 'Body Type': 'Sedan', 'Fuel Type': 'Petrol', Transmission: 'Manual', VIN: 'JKL123456789', Mileage: 25000, 'No of Owners': 1, Price: 78000 },
  { Brand: 'Honda', Model: 'Civic', Year: 2022, Color: 'Black', Variant: 'Sport', 'Body Type': 'Sedan', 'Fuel Type': 'Petrol', Transmission: 'Manual', VIN: 'MNO123456789', Mileage: 28000, 'No of Owners': 2, Price: 75000 },
  { Brand: 'BMW', Model: 'X5', Year: 2024, Color: 'White', Variant: 'xDrive40i', 'Body Type': 'SUV', 'Fuel Type': 'Petrol', Transmission: 'Automatic', VIN: 'PQR123456789', Mileage: 5000, 'No of Owners': 1, Price: 285000 },
  { Brand: 'Mercedes-Benz', Model: 'C-Class', Year: 2023, Color: 'Blue', Variant: 'C300', 'Body Type': 'Sedan', 'Fuel Type': 'Petrol', Transmission: 'Automatic', VIN: 'STU123456789', Mileage: 8000, 'No of Owners': 1, Price: 195000 },
  { Brand: 'Mercedes-Benz', Model: 'C-Class', Year: 2023, Color: 'Blue', Variant: 'C300', 'Body Type': 'Sedan', 'Fuel Type': 'Petrol', Transmission: 'Automatic', VIN: 'VWX123456789', Mileage: 9500, 'No of Owners': 1, Price: 190000 },
  { Brand: 'Tesla', Model: 'Model 3', Year: 2024, Color: 'Red', Variant: 'Long Range', 'Body Type': 'Sedan', 'Fuel Type': 'Electric', Transmission: 'Automatic', VIN: 'YZA123456789', Mileage: 2000, 'No of Owners': 1, Price: 175000 },
  { Brand: 'Tesla', Model: 'Model 3', Year: 2024, Color: 'Red', Variant: 'Long Range', 'Body Type': 'Sedan', 'Fuel Type': 'Electric', Transmission: 'Automatic', VIN: 'BCD123456789', Mileage: 3500, 'No of Owners': 1, Price: 172000 },
  { Brand: 'Tesla', Model: 'Model 3', Year: 2024, Color: 'Red', Variant: 'Long Range', 'Body Type': 'Sedan', 'Fuel Type': 'Electric', Transmission: 'Automatic', VIN: 'EFG123456789', Mileage: 1500, 'No of Owners': 1, Price: 178000 },
  { Brand: 'Tesla', Model: 'Model 3', Year: 2024, Color: 'Red', Variant: 'Long Range', 'Body Type': 'Sedan', 'Fuel Type': 'Electric', Transmission: 'Automatic', VIN: 'HIJ123456789', Mileage: 4000, 'No of Owners': 2, Price: 168000 },
];
