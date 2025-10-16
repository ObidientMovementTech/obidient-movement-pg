import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/excel');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `inec-data-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

/**
 * Preview Excel file structure and return headers and sample data
 */
const previewExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON to get raw data
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Return array of arrays (raw rows)
      defval: '' // Default value for empty cells
    });

    if (jsonData.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Get headers (first row) and sample data (first 5 rows)
    const headers = jsonData[0] || [];
    const sampleData = jsonData.slice(0, Math.min(6, jsonData.length)); // Header + 5 sample rows

    return {
      success: true,
      headers: headers.map((header, index) => ({
        index,
        name: String(header).trim(),
        sample: sampleData.slice(1).map(row => row[index] || '').filter(val => val).slice(0, 3) // First 3 non-empty samples
      })),
      sampleData,
      totalRows: jsonData.length - 1 // Exclude header row
    };

  } catch (error) {
    console.error('Excel preview error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Parse Excel file with column mapping and extract voter data
 */
const parseExcelFileWithMapping = (filePath, columnMapping) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length < 2) {
      throw new Error('Excel file must have at least a header row and one data row');
    }

    const dataRows = jsonData.slice(1); // Skip header row

    // Validate required mappings exist
    const requiredFields = ['state', 'lga', 'ward', 'pollingUnit', 'phoneNumber'];
    const missingFields = requiredFields.filter(field => !columnMapping[field] && columnMapping[field] !== 0);

    if (missingFields.length > 0) {
      throw new Error(`Missing required field mappings: ${missingFields.join(', ')}`);
    }

    // Process data rows
    const voters = [];
    const errors = [];

    dataRows.forEach((row, index) => {
      try {
        const rowNumber = index + 2; // +2 because we start from 0 and skip header

        // Extract and clean data using column mapping
        const voterData = {
          state: cleanString(row[columnMapping.state]),
          lga: cleanString(row[columnMapping.lga]),
          ward: cleanString(row[columnMapping.ward]),
          polling_unit: cleanString(row[columnMapping.pollingUnit]),
          polling_unit_code: cleanString(row[columnMapping.pollingUnitCode] || ''),
          phone_number: cleanPhoneNumber(row[columnMapping.phoneNumber]),
          full_name: cleanString(row[columnMapping.fullName] || ''),
          email_address: cleanString(row[columnMapping.emailAddress] || ''),
          gender: cleanString(row[columnMapping.gender] || ''),
          age_group: cleanString(row[columnMapping.ageGroup] || '')
        };

        // Validate required fields
        if (!voterData.phone_number) {
          errors.push(`Row ${rowNumber}: Missing or invalid phone number`);
          return;
        }

        if (!voterData.state || !voterData.lga || !voterData.ward || !voterData.polling_unit) {
          errors.push(`Row ${rowNumber}: Missing required location data`);
          return;
        }

        voters.push(voterData);

      } catch (err) {
        errors.push(`Row ${index + 2}: ${err.message}`);
      }
    });

    return { voters, errors, totalRows: dataRows.length };

  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

/**
 * Helper function to find column index by multiple possible names
 */
const findColumnIndex = (headers, possibleNames) => {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name));
    if (index !== -1) return index;
  }
  return -1;
};

/**
 * Clean and normalize string data
 */
const cleanString = (value) => {
  if (!value) return '';
  return value.toString().trim().replace(/\s+/g, ' ');
};

/**
 * Clean and validate phone number
 */
const cleanPhoneNumber = (value) => {
  if (!value) return '';

  // Remove all non-digit characters
  let phone = value.toString().replace(/\D/g, '');

  // Handle Nigerian phone number formats
  if (phone.startsWith('234')) {
    phone = phone.substring(3); // Remove country code
  }

  if (phone.startsWith('0')) {
    phone = phone.substring(1); // Remove leading zero
  }

  // Validate length (should be 10 digits for Nigerian mobile numbers)
  if (phone.length !== 10) {
    return '';
  }

  // Add country code back
  return `+234${phone}`;
};

/**
 * Batch insert voters into database
 */
const batchInsertVoters = async (voters, userId, queryFn) => {
  const batchSize = 1000;
  const results = { inserted: 0, duplicates: 0, errors: [] };

  for (let i = 0; i < voters.length; i += batchSize) {
    const batch = voters.slice(i, i + batchSize);

    try {
      const values = batch.map(voter => [
        voter.state,
        voter.lga,
        voter.ward,
        voter.polling_unit,
        voter.polling_unit_code,
        voter.phone_number,
        voter.full_name || null,
        voter.email_address || null,
        voter.gender || null,
        voter.age_group || null,
        userId // imported_by
      ]);

      const placeholders = values.map((_, index) =>
        `($${index * 11 + 1}, $${index * 11 + 2}, $${index * 11 + 3}, $${index * 11 + 4}, $${index * 11 + 5}, $${index * 11 + 6}, $${index * 11 + 7}, $${index * 11 + 8}, $${index * 11 + 9}, $${index * 11 + 10}, $${index * 11 + 11})`
      ).join(', ');

      const queryText = `
        INSERT INTO inec_voters 
        (state, lga, ward, polling_unit, polling_unit_code, phone_number, full_name, email_address, gender, age_group, imported_by)
        VALUES ${placeholders}
        ON CONFLICT (phone_number, polling_unit_code) DO NOTHING
        RETURNING id
      `;

      const result = await queryFn(queryText, values.flat());
      results.inserted += result.rowCount;
      results.duplicates += (batch.length - result.rowCount);

    } catch (error) {
      results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
    }
  }

  return results;
};

export {
  upload,
  parseExcelFileWithMapping as parseExcelFile, // Keep old name for backward compatibility
  parseExcelFileWithMapping,
  previewExcelFile,
  batchInsertVoters
};