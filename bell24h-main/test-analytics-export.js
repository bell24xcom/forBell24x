/**
 * Test script for Analytics Export Functionality
 * 
 * This script tests the analytics export functionality
 * ensuring CSV, Excel, and PDF exports are working correctly
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Base URL for the API
const API_BASE_URL = 'http://localhost:3000';

// Function to test CSV export
async function testCsvExport() {
  try {
    console.log('\n=== Testing CSV Export ===');
    const response = await axios.get(`${API_BASE_URL}/api/analytics/export/csv?type=rfqs`, {
      responseType: 'stream'
    });
    
    const filePath = path.join(__dirname, 'test-export.csv');
    const writer = fs.createWriteStream(filePath);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`CSV export saved to ${filePath}`);
        
        // Read the first few bytes to verify it's a CSV
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading CSV file:', err);
            resolve(false);
            return;
          }
          
          console.log('CSV File Preview:');
          console.log(data.substring(0, 300) + '...');
          
          if (data.includes(',')) {
            console.log('CSV export successful!');
            resolve(true);
          } else {
            console.error('CSV export failed: Output does not appear to be CSV format');
            resolve(false);
          }
        });
      });
      
      writer.on('error', (err) => {
        console.error('Error writing CSV file:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('CSV export test failed:', error.response?.data || error.message);
    return false;
  }
}

// Function to test Excel export
async function testExcelExport() {
  try {
    console.log('\n=== Testing Excel Export ===');
    const response = await axios.get(`${API_BASE_URL}/api/analytics/export/excel?type=bids`, {
      responseType: 'stream'
    });
    
    const filePath = path.join(__dirname, 'test-export.xls');
    const writer = fs.createWriteStream(filePath);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Excel export saved to ${filePath}`);
        
        // Read the first few bytes to verify it's an Excel file (HTML format)
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading Excel file:', err);
            resolve(false);
            return;
          }
          
          console.log('Excel File Preview:');
          console.log(data.substring(0, 300) + '...');
          
          if (data.includes('<html') && data.includes('<table')) {
            console.log('Excel export successful!');
            resolve(true);
          } else {
            console.error('Excel export failed: Output does not appear to be in Excel HTML format');
            resolve(false);
          }
        });
      });
      
      writer.on('error', (err) => {
        console.error('Error writing Excel file:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error('Excel export test failed:', error.response?.data || error.message);
    return false;
  }
}

// Function to test PDF export
async function testPdfExport() {
  try {
    console.log('\n=== Testing PDF Export ===');
    const response = await axios.get(`${API_BASE_URL}/api/analytics/export/pdf?type=summary`, {
      responseType: 'text'
    });
    
    const filePath = path.join(__dirname, 'test-export.html');
    
    // Save the HTML content that would trigger the print dialog
    fs.writeFileSync(filePath, response.data);
    console.log(`PDF export (as HTML) saved to ${filePath}`);
    
    // Check if it contains the print script
    if (response.data.includes('window.print')) {
      console.log('PDF export successful! HTML includes print script.');
      console.log('HTML Preview:');
      console.log(response.data.substring(0, 300) + '...');
      return true;
    } else {
      console.error('PDF export failed: HTML does not include print script');
      return false;
    }
  } catch (error) {
    console.error('PDF export test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all export tests
async function runExportTests() {
  console.log('Starting Analytics Export tests...');
  
  let successCount = 0;
  let testCount = 0;
  
  // Test CSV export
  testCount++;
  const csvSuccess = await testCsvExport();
  if (csvSuccess) successCount++;
  
  // Test Excel export
  testCount++;
  const excelSuccess = await testExcelExport();
  if (excelSuccess) successCount++;
  
  // Test PDF export
  testCount++;
  const pdfSuccess = await testPdfExport();
  if (pdfSuccess) successCount++;
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Tests passed: ${successCount}/${testCount}`);
  console.log(`Success rate: ${Math.round((successCount / testCount) * 100)}%`);
  
  if (successCount === testCount) {
    console.log('All export tests passed successfully!');
  } else {
    console.log('Some export tests failed. Check the logs above for details.');
  }
}

// Run the tests
runExportTests().catch(err => {
  console.error('Error running export tests:', err);
});