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
 * Fetches the sovereign layout for a given Pharos address.
 * @param {string} pharos_address The user's Pharos wallet address.
 * @returns {Promise<{vibe_color: string, avatar: string, username: string, handle: string} | null>} The layout metadata or null if not found.
 */
export async function getLayout(pharos_address) {
  if (!pharos_address) return null;

  try {
    const res = await pool.query(
      'SELECT sovereign_layout FROM users WHERE pharos_address = $1',
      [pharos_address]
    );

    if (res.rows.length > 0) {
      const layout = res.rows[0].sovereign_layout;
      // Ensure we return an object with expected keys, even if they are null
      return {
        vibe_color: layout?.vibe_color || null,
        avatar: layout?.avatar || null,
        username: layout?.username || null,
        handle: layout?.handle || null,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching layout from Neon:', error);
    throw error;
  }
}

/**
 * Updates or inserts the sovereign layout for a given Pharos address.
 * @param {string} pharos_address The user's Pharos wallet address.
 * @param {object} metadata The layout metadata to save.
 * @returns {Promise<void>}
 */
export async function updateLayout(pharos_address, metadata) {
  if (!pharos_address || !metadata) return;

  try {
    const query = `
      INSERT INTO users (pharos_address, sovereign_layout)
      VALUES ($1, $2)
      ON CONFLICT (pharos_address)
      DO UPDATE SET sovereign_layout = users.sovereign_layout || $2;
    `;
    await pool.query(query, [pharos_address, metadata]);
  } catch (error) {
    console.error('Error updating layout in Neon:', error);
    throw error;
  }
}


/**
 * Saves a new post to the database.
 * @param {string} pharos_address The author's Pharos wallet address.
 * @param {string} content The content of the post.
 * @param {string} tx_hash The on-chain transaction hash.
 * @returns {Promise<void>}
 */
export async function savePost(pharos_address, content, tx_hash) {
  if (!pharos_address || !content) return;
  try {
    const query = 'INSERT INTO posts (pharos_address, content, tx_hash) VALUES ($1, $2, $3)';
    await pool.query(query, [pharos_address, content, tx_hash]);
  } catch (error) {
    console.error('Error saving post to Neon:', error);
    throw error;
  }
}

/**
 * Fetches the global feed from the database.
 * @returns {Promise<any[]>} A list of posts with user data.
 */
export async function getFeed() {
  try {
    const query = `
      SELECT
        p.id,
        p.content,
        p.created_at,
        p.pharos_address,
        u.sovereign_layout
      FROM posts p
      LEFT JOIN users u ON p.pharos_address = u.pharos_address
      ORDER BY p.created_at DESC
      LIMIT 50;
    `;
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error fetching feed from Neon:', error);
    return [];
  }
}
