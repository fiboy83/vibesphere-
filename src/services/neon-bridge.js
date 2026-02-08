import { Pool } from 'pg';

let pool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Fetches the layout metadata for a given Pharos address.
 * @param {string} pharos_address The user's Pharos wallet address.
 * @returns {Promise<{vibe_color: string, avatar: string} | null>} The layout metadata or null if not found.
 */
export async function getLayout(pharos_address) {
  if (!pharos_address) return null;

  try {
    const res = await pool.query(
      'SELECT layout_metadata FROM users WHERE pharos_address = $1',
      [pharos_address]
    );

    if (res.rows.length > 0) {
      const metadata = res.rows[0].layout_metadata;
      // Ensure we return an object with expected keys, even if they are null
      return {
        vibe_color: metadata?.vibe_color || null,
        avatar: metadata?.avatar || null,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching layout from Neon:', error);
    throw error;
  }
}

/**
 * Updates or inserts the layout metadata for a given Pharos address.
 * @param {string} pharos_address The user's Pharos wallet address.
 * @param {{vibe_color: string, avatar: string}} metadata The layout metadata to save.
 * @returns {Promise<void>}
 */
export async function updateLayout(pharos_address, metadata) {
  if (!pharos_address || !metadata) return;

  try {
    // This query performs an "upsert":
    // It attempts to INSERT a new user.
    // If the user (based on pharos_address) already exists, it does an UPDATE instead.
    const query = `
      INSERT INTO users (pharos_address, layout_metadata)
      VALUES ($1, $2)
      ON CONFLICT (pharos_address)
      DO UPDATE SET layout_metadata = EXCLUDED.layout_metadata;
    `;
    await pool.query(query, [pharos_address, metadata]);
  } catch (error) {
    console.error('Error updating layout in Neon:', error);
    throw error;
  }
}
