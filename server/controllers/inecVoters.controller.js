/**
 * Professional INEC Voters Service - Built for Scale
 * Handles tens of millions of records efficiently
 */

import { query } from '../config/db.js';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 1000;

/**
 * Get INEC voters with advanced filtering, pagination, and search
 * Optimized for large datasets
 */
const getINECVoters = async (req, res) => {
  try {
    // Check admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can access INEC voter data'
      });
    }

    // Extract and validate query parameters
    const {
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
      search = '',
      state = '',
      lga = '',
      ward = '',
      polling_unit = '',
      has_phone = '',
      has_email = '',
      confirmed = '',
      gender = '',
      age_min = '',
      age_max = '',
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build dynamic WHERE clause for filtering
    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    // Always filter by state (assuming Anambra for this project)
    whereConditions.push(`UPPER(state) = $${paramIndex}`);
    queryParams.push('ANAMBRA');
    paramIndex++;

    // Location filters
    if (lga) {
      whereConditions.push(`lga = $${paramIndex}`);
      queryParams.push(lga);
      paramIndex++;
    }

    if (ward) {
      whereConditions.push(`ward = $${paramIndex}`);
      queryParams.push(ward);
      paramIndex++;
    }

    if (polling_unit) {
      whereConditions.push(`polling_unit = $${paramIndex}`);
      queryParams.push(polling_unit);
      paramIndex++;
    }

    // Contact information filters
    if (has_phone === 'true') {
      whereConditions.push(`phone_number IS NOT NULL AND phone_number != '' AND LENGTH(TRIM(phone_number)) > 0`);
    } else if (has_phone === 'false') {
      whereConditions.push(`(phone_number IS NULL OR phone_number = '' OR LENGTH(TRIM(phone_number)) = 0)`);
    }

    if (has_email === 'true') {
      whereConditions.push(`email_address IS NOT NULL AND email_address != '' AND LENGTH(TRIM(email_address)) > 0`);
    } else if (has_email === 'false') {
      whereConditions.push(`(email_address IS NULL OR email_address = '' OR LENGTH(TRIM(email_address)) = 0)`);
    }

    // Status filters
    if (confirmed === 'true') {
      whereConditions.push(`confirmed_to_vote = true`);
    } else if (confirmed === 'false') {
      whereConditions.push(`confirmed_to_vote = false`);
    }

    // Demographic filters
    if (gender) {
      whereConditions.push(`LOWER(gender) = $${paramIndex}`);
      queryParams.push(gender.toLowerCase());
      paramIndex++;
    }

    // Age group filter (since age_group is varchar, we filter by exact match or pattern)
    if (age_min || age_max) {
      // For age_group field, we can filter by specific age group string
      if (age_min && !age_max) {
        whereConditions.push(`age_group ILIKE $${paramIndex}`);
        queryParams.push(`%${age_min}%`);
        paramIndex++;
      } else if (age_max && !age_min) {
        whereConditions.push(`age_group ILIKE $${paramIndex}`);
        queryParams.push(`%${age_max}%`);
        paramIndex++;
      } else if (age_min && age_max) {
        whereConditions.push(`age_group ILIKE $${paramIndex}`);
        queryParams.push(`%${age_min}%`);
        paramIndex++;
      }
    }

    // Search functionality (using PostgreSQL full-text search for performance)
    if (search) {
      whereConditions.push(`(
        to_tsvector('english', COALESCE(full_name, '')) 
        @@ plainto_tsquery('english', $${paramIndex})
        OR phone_number ILIKE $${paramIndex + 1}
        OR email_address ILIKE $${paramIndex + 1}
      )`);
      queryParams.push(search);
      queryParams.push(`%${search}%`);
      paramIndex += 2;
    }

    // Build the WHERE clause
    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Validate sort parameters to prevent SQL injection
    const validSortColumns = [
      'full_name', 'created_at', 'updated_at',
      'lga', 'ward', 'polling_unit', 'age_group', 'last_called_date', 'call_count'
    ];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count query for pagination metadata
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM inec_voters
      ${whereClause}
    `;

    // Main data query with pagination
    const dataQuery = `
      SELECT 
        id,
        state,
        lga,
        ward,
        polling_unit,
        polling_unit_code,
        phone_number,
        full_name,
        email_address,
        gender,
        age_group,
        called_recently,
        last_called_date,
        confirmed_to_vote,
        demands,
        notes,
        call_count,
        created_at,
        updated_at,
        imported_by,
        last_updated_by
      FROM inec_voters
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Add pagination parameters
    queryParams.push(limitNum);
    queryParams.push(offset);

    // Execute both queries in parallel for performance
    const [countResult, dataResult] = await Promise.all([
      query(countQuery, queryParams.slice(0, -2)), // Remove limit/offset params for count
      query(dataQuery, queryParams)
    ]);

    const totalCount = parseInt(countResult.rows[0].total_count);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Response with comprehensive pagination metadata
    res.json({
      success: true,
      data: {
        voters: dataResult.rows,
        pagination: {
          current_page: pageNum,
          page_size: limitNum,
          total_records: totalCount,
          total_pages: totalPages,
          has_next_page: pageNum < totalPages,
          has_previous_page: pageNum > 1,
          next_page: pageNum < totalPages ? pageNum + 1 : null,
          previous_page: pageNum > 1 ? pageNum - 1 : null
        },
        filters_applied: {
          search,
          state: 'Anambra',
          lga,
          ward,
          polling_unit,
          has_phone,
          has_email,
          confirmed,
          gender,
          age_range: age_min || age_max ? { min: age_min, max: age_max } : null
        },
        performance: {
          query_time: new Date().toISOString(),
          results_returned: dataResult.rows.length
        }
      }
    });

  } catch (error) {
    console.error('INEC Voters query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch INEC voter data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get aggregated statistics for dashboard
 * Optimized with database indexes
 */
const getINECVotersStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can access voter statistics'
      });
    }

    // Use efficient aggregation queries
    const statsQuery = `
      SELECT 
        COUNT(*) as total_voters,
        COUNT(CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 1 END) as voters_with_phone,
        COUNT(CASE WHEN email_address IS NOT NULL AND email_address != '' THEN 1 END) as voters_with_email,
        COUNT(CASE WHEN confirmed_to_vote = true THEN 1 END) as confirmed_voters,
        COUNT(CASE WHEN last_called_date IS NOT NULL THEN 1 END) as contacted_voters,
        COUNT(DISTINCT lga) as total_lgas,
        COUNT(DISTINCT ward) as total_wards,
        COUNT(DISTINCT polling_unit) as total_polling_units,
        COUNT(CASE WHEN gender = 'Male' OR gender = 'M' THEN 1 END) as male_voters,
        COUNT(CASE WHEN gender = 'Female' OR gender = 'F' THEN 1 END) as female_voters
      FROM inec_voters 
      WHERE state = 'ANAMBRA'
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        overview: {
          total_voters: parseInt(stats.total_voters),
          voters_with_phone: parseInt(stats.voters_with_phone),
          voters_with_email: parseInt(stats.voters_with_email),
          confirmed_voters: parseInt(stats.confirmed_voters),
          contacted_voters: parseInt(stats.contacted_voters),
          contact_rate: ((parseInt(stats.contacted_voters) / parseInt(stats.total_voters)) * 100).toFixed(2),
          phone_coverage: ((parseInt(stats.voters_with_phone) / parseInt(stats.total_voters)) * 100).toFixed(2)
        },
        demographics: {
          male_voters: parseInt(stats.male_voters),
          female_voters: parseInt(stats.female_voters),
          gender_distribution: {
            male_percentage: ((parseInt(stats.male_voters) / parseInt(stats.total_voters)) * 100).toFixed(1),
            female_percentage: ((parseInt(stats.female_voters) / parseInt(stats.total_voters)) * 100).toFixed(1)
          }
        },
        geographic: {
          total_lgas: parseInt(stats.total_lgas),
          total_wards: parseInt(stats.total_wards),
          total_polling_units: parseInt(stats.total_polling_units),
          average_voters_per_lga: Math.round(parseInt(stats.total_voters) / parseInt(stats.total_lgas)),
          average_voters_per_ward: Math.round(parseInt(stats.total_voters) / parseInt(stats.total_wards))
        }
      }
    });

  } catch (error) {
    console.error('INEC stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get location hierarchy (LGAs, Wards, Polling Units)
 * Cached and optimized for navigation
 */
const getLocationHierarchy = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can access location data'
      });
    }

    const { level = 'lga', parent_lga = '', parent_ward = '' } = req.query;

    let hierarchyQuery;
    let queryParams = ['ANAMBRA'];

    switch (level) {
      case 'lga':
        hierarchyQuery = `
          SELECT 
            lga as name,
            COUNT(*) as voter_count,
            COUNT(DISTINCT ward) as child_count,
            COUNT(CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 1 END) as voters_with_phone
          FROM inec_voters 
          WHERE UPPER(state) = $1
          GROUP BY lga
          ORDER BY lga
        `;
        break;

      case 'ward':
        if (!parent_lga) {
          return res.status(400).json({
            success: false,
            message: 'parent_lga is required for ward level'
          });
        }
        hierarchyQuery = `
          SELECT 
            ward as name,
            COUNT(*) as voter_count,
            COUNT(DISTINCT polling_unit) as child_count,
            COUNT(CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 1 END) as voters_with_phone
          FROM inec_voters 
          WHERE UPPER(state) = $1 AND lga = $2
          GROUP BY ward
          ORDER BY ward
        `;
        queryParams.push(parent_lga);
        break;

      case 'polling_unit':
        if (!parent_lga || !parent_ward) {
          return res.status(400).json({
            success: false,
            message: 'parent_lga and parent_ward are required for polling unit level'
          });
        }
        hierarchyQuery = `
          SELECT 
            polling_unit as name,
            polling_unit_code as code,
            COUNT(*) as voter_count,
            0 as child_count,
            COUNT(CASE WHEN phone_number IS NOT NULL AND phone_number != '' THEN 1 END) as voters_with_phone
          FROM inec_voters 
          WHERE UPPER(state) = $1 AND lga = $2 AND ward = $3
          GROUP BY polling_unit, polling_unit_code
          ORDER BY polling_unit
        `;
        queryParams.push(parent_lga, parent_ward);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid level. Must be lga, ward, or polling_unit'
        });
    }

    const result = await query(hierarchyQuery, queryParams);

    res.json({
      success: true,
      data: {
        level,
        parent: { lga: parent_lga, ward: parent_ward },
        locations: result.rows
      }
    });

  } catch (error) {
    console.error('Location hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location hierarchy',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export {
  getINECVoters,
  getINECVotersStats,
  getLocationHierarchy
};