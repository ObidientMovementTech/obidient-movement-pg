import { query } from '../config/db.js';
import { sendInvolvementInterestEmail } from '../utils/emailHandler.js';

// ──── Submit involvement interest (authenticated) ────
export const submitInterest = async (req, res) => {
  try {
    // Honeypot check — if the hidden "website" field is filled, it's a bot
    if (req.body.website) {
      return res.json({ success: true, message: 'Thank you for your interest! A coordinator will reach out within 48 hours.' });
    }

    const userId = req.user?.userId || req.user?.id;

    const {
      fullName, email, phone, role,
      state, lga, ward,
      isDiaspora, country,
      skills, experienceLevel, contributionType,
      message, directorate,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !role) {
      return res.status(400).json({ success: false, message: 'Full name, email, phone, and role are required.' });
    }

    const validRoles = ['volunteer', 'vote_protection_officer', 'donor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!isDiaspora && !state) {
      return res.status(400).json({ success: false, message: 'Please select your state.' });
    }

    if (isDiaspora && !country) {
      return res.status(400).json({ success: false, message: 'Please provide your country of residence.' });
    }

    // Check for duplicate submission (same email + role in last 24 hours)
    const dupCheck = await query(
      `SELECT id FROM involvement_interests
       WHERE email = $1 AND role = $2 AND created_at > NOW() - INTERVAL '24 hours'
       LIMIT 1`,
      [email.toLowerCase().trim(), role]
    );

    if (dupCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an interest for this role recently. A coordinator will reach out within 48 hours.'
      });
    }

    // Insert into database
    const result = await query(
      `INSERT INTO involvement_interests
       (full_name, email, phone, role, state, lga, ward, is_diaspora, country,
        skills, experience_level, contribution_type, message, ip_address, user_agent, directorate, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING id, created_at`,
      [
        fullName.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        role,
        state || null,
        lga || null,
        ward || null,
        isDiaspora || false,
        country || null,
        skills?.length ? skills : null,
        experienceLevel || null,
        contributionType || null,
        message?.trim() || null,
        req.ip,
        req.get('User-Agent'),
        (role === 'volunteer' && directorate) ? directorate : null,
        userId || null,
      ]
    );

    // Send email notification to admins (fire-and-forget — don't block response)
    sendInvolvementInterestEmail({
      full_name: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      role,
      state, lga, ward,
      is_diaspora: isDiaspora || false,
      country,
      skills,
      experience_level: experienceLevel,
      contribution_type: contributionType,
      message: message?.trim(),
      directorate: (role === 'volunteer' && directorate) ? directorate : null,
    }).catch(err => console.error('[INVOLVEMENT] Email notification error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Thank you for your interest! A coordinator will reach out within 48 hours.',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('submitInterest error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// ──── Get all interests (admin or directorate head) ────
export const getInterests = async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      role, status, state, search, directorate,
      startDate, endDate,
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    // Directorate Head scoping — only see their department's interests
    const callerDesignation = req.userDesignation;
    const callerDirectorate = req.userDirectorate;
    if (callerDesignation === 'Directorate Head' && callerDirectorate) {
      conditions.push(`i.directorate = $${paramIdx++}`);
      params.push(callerDirectorate);
    } else if (directorate) {
      // Admin can filter by directorate
      conditions.push(`i.directorate = $${paramIdx++}`);
      params.push(directorate);
    }

    if (role) {
      conditions.push(`i.role = $${paramIdx++}`);
      params.push(role);
    }
    if (status) {
      conditions.push(`i.status = $${paramIdx++}`);
      params.push(status);
    }
    if (state) {
      conditions.push(`i.state = $${paramIdx++}`);
      params.push(state);
    }
    if (search) {
      conditions.push(`(i.full_name ILIKE $${paramIdx} OR i.email ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (startDate) {
      conditions.push(`i.created_at >= $${paramIdx++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`i.created_at <= $${paramIdx++}`);
      params.push(endDate);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await query(
      `SELECT COUNT(*) FROM involvement_interests i ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await query(
      `SELECT i.*, u.name as contacted_by_name
       FROM involvement_interests i
       LEFT JOIN users u ON i.contacted_by = u.id
       ${where}
       ORDER BY i.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: dataResult.rows,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getInterests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch interests.' });
  }
};

// ──── Get single interest (admin) ────
export const getInterestById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT i.*, u.name as contacted_by_name
       FROM involvement_interests i
       LEFT JOIN users u ON i.contacted_by = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interest not found.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('getInterestById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch interest.' });
  }
};

// ──── Update interest status (admin) ────
export const updateInterestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'contacted', 'active', 'declined'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const updates = [];
    const params = [];
    let paramIdx = 1;

    if (status) {
      updates.push(`status = $${paramIdx++}`);
      params.push(status);

      if (status === 'contacted') {
        updates.push(`contacted_by = $${paramIdx++}`);
        params.push(req.userId);
        updates.push(`contacted_at = NOW()`);
      }
    }
    if (adminNotes !== undefined) {
      updates.push(`admin_notes = $${paramIdx++}`);
      params.push(adminNotes);
    }

    updates.push('updated_at = NOW()');

    if (updates.length === 1) {
      return res.status(400).json({ success: false, message: 'No updates provided.' });
    }

    params.push(id);
    const result = await query(
      `UPDATE involvement_interests SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interest not found.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('updateInterestStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update interest.' });
  }
};

// ──── Delete interest (admin) ────
export const deleteInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'DELETE FROM involvement_interests WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interest not found.' });
    }

    res.json({ success: true, message: 'Interest deleted.' });
  } catch (error) {
    console.error('deleteInterest error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete interest.' });
  }
};

// ──── Get interest stats (admin) ────
export const getInterestStats = async (req, res) => {
  try {
    // Directorate Head scoping
    const callerDesignation = req.userDesignation;
    const callerDirectorate = req.userDirectorate;
    const scopeWhere = (callerDesignation === 'Directorate Head' && callerDirectorate)
      ? `WHERE directorate = '${callerDirectorate}'`
      : '';
    const scopeAnd = (callerDesignation === 'Directorate Head' && callerDirectorate)
      ? `AND directorate = '${callerDirectorate}'`
      : '';

    const [totalResult, byRoleResult, byStatusResult, thisWeekResult, thisMonthResult] = await Promise.all([
      query(`SELECT COUNT(*) FROM involvement_interests ${scopeWhere}`),
      query(`SELECT role, COUNT(*) FROM involvement_interests ${scopeWhere} GROUP BY role`),
      query(`SELECT status, COUNT(*) FROM involvement_interests ${scopeWhere} GROUP BY status`),
      query(`SELECT COUNT(*) FROM involvement_interests WHERE created_at >= NOW() - INTERVAL '7 days' ${scopeAnd}`),
      query(`SELECT COUNT(*) FROM involvement_interests WHERE created_at >= NOW() - INTERVAL '30 days' ${scopeAnd}`),
    ]);

    const byRole = {};
    byRoleResult.rows.forEach(r => { byRole[r.role] = parseInt(r.count, 10); });

    const byStatus = {};
    byStatusResult.rows.forEach(r => { byStatus[r.status] = parseInt(r.count, 10); });

    res.json({
      success: true,
      data: {
        total: parseInt(totalResult.rows[0].count, 10),
        byRole,
        byStatus,
        thisWeek: parseInt(thisWeekResult.rows[0].count, 10),
        thisMonth: parseInt(thisMonthResult.rows[0].count, 10),
      },
    });
  } catch (error) {
    console.error('getInterestStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};
