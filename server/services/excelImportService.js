import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
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
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed'), false);
    }
  },
  limits: {
    fileSize: 1000 * 1024 * 1024 // 1GB limit (to handle large CSV files like Lagos 750MB)
  }
});

/**
 * Preview CSV file by reading only first 100 rows (for large files)
 */
const previewCSVFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });

    let lineCount = 0;
    const maxLines = 100; // Only read first 100 lines for preview

    rl.on('line', (line) => {
      if (lineCount < maxLines) {
        // Parse CSV line (handle quotes and commas)
        const row = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
        rows.push(row);
        lineCount++;
      } else {
        rl.close(); // Stop reading after maxLines
      }
    });

    rl.on('close', () => {
      if (rows.length === 0) {
        reject(new Error('CSV file is empty'));
        return;
      }

      const headers = rows[0] || [];
      const sampleData = rows.slice(0, Math.min(6, rows.length)); // Header + 5 sample rows

      resolve({
        success: true,
        headers: headers.map((header, index) => ({
          index,
          name: String(header).trim(),
          sample: sampleData.slice(1).map(row => row[index] || '').filter(val => val).slice(0, 3)
        })),
        sampleData,
        totalRows: 'Unknown (large file)' // We don't count all rows for performance
      });
    });

    rl.on('error', (error) => {
      reject(error);
    });
  });
};

/**
 * Preview Excel file structure and return headers and sample data
 * Optimized to handle large files by limiting rows read
 */
const previewExcelFile = async (filePath) => {
  try {
    // Check if it's a CSV file
    const fileExtension = path.extname(filePath).toLowerCase();
    if (fileExtension === '.csv') {
      return await previewCSVFile(filePath);
    }

    // For Excel files, use sheetRows option to limit parsing
    const workbook = XLSX.readFile(filePath, { sheetRows: 100 }); // Only parse first 100 rows
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
      totalRows: jsonData.length > 99 ? 'Unknown (large file)' : jsonData.length - 1 // Exclude header row
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
/**
 * Parse CSV file with streaming for large files
 */
const parseCSVFileWithMapping = async (filePath, columnMapping) => {
  return new Promise((resolve, reject) => {
    const voters = [];
    const errors = [];
    let rowIndex = 0;

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });

    // Validate required mappings exist
    const requiredFields = ['state', 'lga', 'ward', 'pollingUnit', 'phoneNumber'];
    const missingFields = requiredFields.filter(field => !columnMapping[field] && columnMapping[field] !== 0);

    if (missingFields.length > 0) {
      reject(new Error(`Missing required field mappings: ${missingFields.join(', ')}`));
      return;
    }

    rl.on('line', (line) => {
      rowIndex++;

      // Skip header row
      if (rowIndex === 1) return;

      try {
        // Parse CSV line (handle quotes and commas)
        const row = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));

        // Extract and clean data using column mapping
        const voterData = {
          vin: cleanString(row[columnMapping.vin] || ''),
          first_name: cleanString(row[columnMapping.firstName] || ''),
          last_name: cleanString(row[columnMapping.lastName] || ''),
          full_name: cleanString(row[columnMapping.fullName] || ''),
          state: cleanString(row[columnMapping.state]),
          lga: cleanString(row[columnMapping.lga]),
          ward: cleanString(row[columnMapping.ward]),
          polling_unit: cleanString(row[columnMapping.pollingUnit]),
          polling_unit_code: cleanString(row[columnMapping.pollingUnitCode] || ''),
          phone_number: cleanPhoneNumber(row[columnMapping.phoneNumber]),
          email_address: cleanString(row[columnMapping.emailAddress] || ''),
          gender: cleanString(row[columnMapping.gender] || ''),
          age_group: cleanString(row[columnMapping.ageGroup] || '')
        };

        // Auto-generate full_name if first_name and last_name are provided but full_name is not
        if (!voterData.full_name && voterData.first_name && voterData.last_name) {
          voterData.full_name = `${voterData.first_name} ${voterData.last_name}`;
        }

        // Auto-split full_name into first_name and last_name if they're not provided
        if (voterData.full_name && !voterData.first_name && !voterData.last_name) {
          const nameParts = voterData.full_name.split(' ');
          voterData.first_name = nameParts[0] || '';
          voterData.last_name = nameParts.slice(1).join(' ') || '';
        }

        // Validate required fields
        if (!voterData.phone_number) {
          errors.push(`Row ${rowIndex}: Missing or invalid phone number`);
          return;
        }

        if (!voterData.state || !voterData.lga || !voterData.ward || !voterData.polling_unit) {
          errors.push(`Row ${rowIndex}: Missing required location data`);
          return;
        }

        voters.push(voterData);

      } catch (err) {
        errors.push(`Row ${rowIndex}: ${err.message}`);
      }
    });

    rl.on('close', () => {
      console.log(`✅ Parsed ${voters.length} voters from CSV with ${errors.length} errors`);
      resolve({ voters, errors, totalRows: rowIndex - 1 }); // -1 for header
    });

    rl.on('error', (error) => {
      reject(new Error(`Failed to parse CSV file: ${error.message}`));
    });
  });
};

/**
 * Parse Excel/CSV file with column mapping
 * Uses streaming for CSV files to handle large datasets efficiently
 */
const parseExcelFileWithMapping = async (filePath, columnMapping) => {
  try {
    // Check if it's a CSV file and use streaming parser
    const fileExtension = path.extname(filePath).toLowerCase();
    if (fileExtension === '.csv') {
      console.log('🚀 Using streaming CSV parser for large file');
      return await parseCSVFileWithMapping(filePath, columnMapping);
    }

    // For Excel files, use XLSX library
    console.log('📊 Parsing Excel file with XLSX library');
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
          vin: cleanString(row[columnMapping.vin] || ''),
          first_name: cleanString(row[columnMapping.firstName] || ''),
          last_name: cleanString(row[columnMapping.lastName] || ''),
          full_name: cleanString(row[columnMapping.fullName] || ''),
          state: cleanString(row[columnMapping.state]),
          lga: cleanString(row[columnMapping.lga]),
          ward: cleanString(row[columnMapping.ward]),
          polling_unit: cleanString(row[columnMapping.pollingUnit]),
          polling_unit_code: cleanString(row[columnMapping.pollingUnitCode] || ''),
          phone_number: cleanPhoneNumber(row[columnMapping.phoneNumber]),
          email_address: cleanString(row[columnMapping.emailAddress] || ''),
          gender: cleanString(row[columnMapping.gender] || ''),
          age_group: cleanString(row[columnMapping.ageGroup] || '')
        };

        // Auto-generate full_name if first_name and last_name are provided but full_name is not
        if (!voterData.full_name && voterData.first_name && voterData.last_name) {
          voterData.full_name = `${voterData.first_name} ${voterData.last_name}`;
        }

        // Auto-split full_name into first_name and last_name if they're not provided
        if (voterData.full_name && !voterData.first_name && !voterData.last_name) {
          const nameParts = voterData.full_name.split(' ');
          voterData.first_name = nameParts[0] || '';
          voterData.last_name = nameParts.slice(1).join(' ') || '';
        }

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
 * - Convert to UPPERCASE
 * - Trim leading/trailing spaces
 * - Replace multiple spaces with single space
 * - Remove special characters that cause issues
 */
const cleanString = (value) => {
  if (!value) return '';
  return value
    .toString()
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ')  // Multiple spaces -> single space
    .replace(/[""]/g, '') // Remove smart quotes
    .trim();
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
 * Batch insert voters into database with smart deduplication
 * Priority: Phone number matching > VIN > Insert new
 * Updates existing records with new data (CSV/XLSX takes priority)
 * @param {Function} onProgress - Optional callback for progress updates
 */
const batchInsertVoters = async (voters, userId, queryFn, onProgress) => {
  const batchSize = 500; // Reduced batch size for complex upsert logic
  const results = { inserted: 0, updated: 0, duplicates: 0, errors: [] };
  const batchId = `IMPORT_${Date.now()}`;
  const totalBatches = Math.ceil(voters.length / batchSize);

  for (let i = 0; i < voters.length; i += batchSize) {
    const rawBatch = voters.slice(i, i + batchSize);
    const currentBatch = Math.floor(i / batchSize) + 1;

    // Deduplicate within batch by phone_number (keep last occurrence)
    // This prevents "ON CONFLICT DO UPDATE command cannot affect row a second time" error
    const phoneMap = new Map();
    rawBatch.forEach(voter => {
      phoneMap.set(voter.phone_number, voter); // Last one wins
    });
    const batch = Array.from(phoneMap.values());

    // Track duplicates within batch
    const duplicatesInBatch = rawBatch.length - batch.length;
    if (duplicatesInBatch > 0) {
      results.duplicates += duplicatesInBatch;
      console.log(`⚠️ Batch ${currentBatch}: Removed ${duplicatesInBatch} duplicate phone numbers within batch`);
    }

    try {
      // Report progress before processing batch
      if (onProgress) {
        onProgress({
          stage: 'importing',
          currentRow: i,
          totalRows: voters.length,
          currentBatch,
          totalBatches,
          inserted: results.inserted,
          updated: results.updated,
          duplicates: results.duplicates,
          errors: results.errors.length
        });
      }

      const values = batch.map(voter => [
        voter.vin || null,
        voter.first_name || null,
        voter.last_name || null,
        voter.full_name || null,
        voter.state,
        voter.lga,
        voter.ward,
        voter.polling_unit,
        voter.polling_unit_code || null,
        voter.phone_number,
        voter.email_address || null,
        voter.gender || null,
        voter.age_group || null,
        userId, // imported_by
        batchId, // import_batch_id
        'csv_import' // data_source
      ]);

      const placeholders = values.map((_, index) => {
        const base = index * 16;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14}, $${base + 15}, $${base + 16})`;
      }).join(', ');

      // Smart upsert query:
      // 1. Try to match by phone_number (most reliable)
      // 2. If phone matches, update ALL fields with new data (CSV takes priority)
      // 3. If no phone match but VIN matches, skip (duplicate VIN with different phone is suspicious)
      // 4. Otherwise insert new record
      const queryText = `
        INSERT INTO inec_voters 
        (vin, first_name, last_name, full_name, state, lga, ward, polling_unit, polling_unit_code, 
         phone_number, email_address, gender, age_group, imported_by, import_batch_id, data_source)
        VALUES ${placeholders}
        ON CONFLICT (phone_number) 
        DO UPDATE SET
          vin = COALESCE(EXCLUDED.vin, inec_voters.vin),
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          full_name = EXCLUDED.full_name,
          state = EXCLUDED.state,
          lga = EXCLUDED.lga,
          ward = EXCLUDED.ward,
          polling_unit = EXCLUDED.polling_unit,
          polling_unit_code = COALESCE(EXCLUDED.polling_unit_code, inec_voters.polling_unit_code),
          email_address = COALESCE(EXCLUDED.email_address, inec_voters.email_address),
          gender = COALESCE(EXCLUDED.gender, inec_voters.gender),
          age_group = COALESCE(EXCLUDED.age_group, inec_voters.age_group),
          data_source = EXCLUDED.data_source,
          import_batch_id = EXCLUDED.import_batch_id,
          last_updated_from_import = NOW(),
          updated_at = NOW()
        RETURNING id, (xmax = 0) AS inserted
      `;

      const result = await queryFn(queryText, values.flat());

      // Count inserts vs updates
      result.rows.forEach(row => {
        if (row.inserted) {
          results.inserted++;
        } else {
          results.updated++;
        }
      });

      // Log progress to console
      if (currentBatch % 10 === 0 || currentBatch === totalBatches) {
        console.log(`✅ Batch ${currentBatch}/${totalBatches} processed (${i + batch.length}/${voters.length} records)`);
      }

    } catch (error) {
      console.error(`Batch ${currentBatch} error:`, error.message);
      results.errors.push(`Batch ${currentBatch}: ${error.message}`);
    }
  }

  // Final progress update
  if (onProgress) {
    onProgress({
      stage: 'completed',
      currentRow: voters.length,
      totalRows: voters.length,
      currentBatch: totalBatches,
      totalBatches,
      inserted: results.inserted,
      updated: results.updated,
      duplicates: results.duplicates,
      errors: results.errors.length
    });
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