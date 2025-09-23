import { query } from './config/db.js';

async function findUsersWithoutLGA() {
  try {
    // Query for Abia users with no LGA
    const sqlQuery = `
      SELECT 
        id,
        name,
        "votingState", 
        "votingLGA",
        "isVoter"
      FROM users 
      WHERE "votingState" = 'Abia' AND ("votingLGA" IS NULL OR "votingLGA" = '')
      ORDER BY id
    `;

    console.log('Executing query to find Abia users with no LGA...');
    const result = await query(sqlQuery);

    console.log(`Found ${result.rows.length} users from Abia with no LGA assigned:`);
    console.log(JSON.stringify(result.rows, null, 2));

    return result.rows;
  } catch (error) {
    console.error('Error finding users without LGA:', error);
    throw error;
  }
}

// Run the query
findUsersWithoutLGA();