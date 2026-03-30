# INEC Voter Data Import Guide

## Overview
This guide explains how to import INEC voter data (with VINs) from CSV or Excel files into the system.

## What's New (October 2025)
- ✅ Support for **CSV files** (including large files up to 1GB)
- ✅ Support for **VIN (Voter Identification Number)** field
- ✅ Separate **first_name** and **last_name** fields
- ✅ **Smart deduplication** (phone number priority)
- ✅ **Automatic text normalization** (UPPERCASE, clean spaces)
- ✅ **Update existing records** with new data (CSV takes priority)

## Step 1: Run Database Migration

Before importing, run the migration to add new columns:

```bash
cd server
psql -U your_username -d obidient_db -f migrations/add_vin_to_voters.sql
```

This adds:
- `vin` column (Voter ID Number)
- `first_name` and `last_name` columns
- `import_batch_id` for tracking imports
- Indexes for performance

## Step 2: Prepare Your CSV File

### Expected CSV Format
Your CSV should have these columns (example from Adamawa/Anambra):

```csv
vin,first_name,last_name,sname,lname,rname,pname,delim,mobile_number
90F5B05696293724563,THOMAS,CECILIA,ADAMAWA,DEMSA,BILLE,BAMORO I/ CENTRAL PRI. SCH.,02-01-01-001,08057752325
```

### Column Descriptions:
- `vin` - Voter Identification Number (unique)
- `first_name` - Voter's first name
- `last_name` - Voter's surname/last name
- `sname` - State name
- `lname` - LGA (Local Government Area)
- `rname` - Ward name
- `pname` - Polling Unit name
- `delim` - Polling Unit Code (format: XX-XX-XX-XXX)
- `mobile_number` - Phone number

### Supported File Formats:
- ✅ CSV (`.csv`) - up to 1GB
- ✅ Excel (`.xlsx`, `.xls`) - up to 1GB

## Step 3: Import Process

### Via Admin Dashboard:

1. **Login** as admin
2. Go to **Call Center** → **Admin Panel**
3. Click **Import Voters** tab
4. **Select your CSV/Excel file**
5. **Column Mapping Modal** will appear
6. **Map your columns** to the system fields:

| Your CSV Column | Map To System Field |
|----------------|---------------------|
| `vin` | VIN (Voter ID Number) |
| `first_name` | First Name |
| `last_name` | Last Name / Surname |
| `sname` | State |
| `lname` | Local Government Area (LGA) |
| `rname` | Ward |
| `pname` | Polling Unit |
| `delim` | Polling Unit Code |
| `mobile_number` | Phone Number |

7. Click **Import** and wait for processing

## Step 4: How Deduplication Works

The system uses **smart deduplication** with this priority:

1. **Phone Number Match** (Primary)
   - If phone number exists → **UPDATE** record with new data
   - CSV/Excel data **takes priority** over existing data
   
2. **VIN Check**
   - Ensures no duplicate VINs are created
   
3. **New Record**
   - If no phone match and VIN is new → **INSERT** new voter

### What Gets Updated:
When a phone number match is found, these fields are **updated**:
- ✅ VIN (if not already set)
- ✅ First Name, Last Name, Full Name
- ✅ **State, LGA, Ward, Polling Unit** (CSV takes priority)
- ✅ Polling Unit Code
- ✅ Email, Gender, Age Group (if provided)

## Step 5: Data Normalization

All text data is automatically normalized:
- ✅ Converted to **UPPERCASE**
- ✅ Extra spaces removed
- ✅ Smart quotes cleaned
- ✅ Multiple spaces → single space

**Example:**
```
Input:  "  bamoro  i/  central   pri. sch.  "
Output: "BAMORO I/ CENTRAL PRI. SCH."
```

## Step 6: Handling Large Files

For large files (like Lagos 750MB):

### Performance Tips:
- Files are processed in **batches of 500 records**
- Progress is logged to console
- Import can take **10-30 minutes** for very large files
- **Don't close the browser** during import

### Monitoring Progress:
Check the backend logs:
```bash
cd server
npm run dev
# Watch the console for progress updates
```

## Common CSV Variations

The column mapping handles different CSV formats:

### Format 1: Separate Names
```csv
vin,first_name,last_name,sname,lname,rname,pname,delim,mobile_number
```

### Format 2: Full Name Only
```csv
vin,full_name,state,lga,ward,polling_unit,pu_code,phone
```
→ System will auto-split full_name into first_name and last_name

### Format 3: Mixed
```csv
voter_id,firstname,surname,state_name,lga_name,ward_name,pu_name,pu_code,phone_number
```
→ Use column mapping to align fields

## Troubleshooting

### Issue: "Missing required field mappings"
**Solution:** Ensure you've mapped:
- State
- LGA
- Ward
- Polling Unit
- Phone Number

### Issue: "Duplicate VIN with different phone"
**Solution:** This is flagged as suspicious. Check your source data.

### Issue: Import is slow
**Solution:** 
- Large files (750MB) take time - be patient
- Check server logs for progress
- Increase batch size in code if needed

### Issue: Phone numbers not matching
**Solution:** Phone numbers are normalized:
- `+234` prefix removed
- Leading `0` removed
- Non-digits removed
- Re-formatted as `+234XXXXXXXXXX`

## Import Results

After import, you'll see:
- **Total Rows:** Number of rows in file
- **Parsed:** Valid rows processed
- **Inserted:** New voters added
- **Updated:** Existing voters updated
- **Errors:** Any issues encountered

## Best Practices

1. ✅ **Start with small state** (Anambra) to test
2. ✅ **Check column mapping** carefully before importing
3. ✅ **Review import results** after completion
4. ✅ **Keep backup** of your CSV files
5. ✅ **Run migration** before first import
6. ✅ **Test with sample** (first 100 rows) before full import

## Database Schema

New columns added to `inec_voters`:

```sql
vin VARCHAR(50) UNIQUE           -- Voter ID Number
first_name VARCHAR(100)          -- First name
last_name VARCHAR(100)           -- Last name/surname
full_name VARCHAR(200)           -- Auto-generated or manual
import_batch_id VARCHAR(100)     -- Batch tracking
data_source VARCHAR(50)          -- 'csv_import', 'xlsx_import', 'legacy'
last_updated_from_import TIMESTAMP
```

## Support

For issues, check:
1. Server logs (`server/logs/`)
2. Invalid rows log (`server/logs/invalid_rows_*.json`)
3. Database constraints (unique phone, unique VIN)

---

**Last Updated:** October 23, 2025
**Author:** Obidient Movement Tech Team
