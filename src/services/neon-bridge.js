import { Pool } from 'pg';

let pool;

const getDbPool = () => {
    if (!pool) {
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL is not set in neon-bridge.');
            throw new Error('DATABASE_URL is not set. Cannot connect to Neon.');
        }
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: true,
            },
        });
    }
    return pool;
}

/**
 * Fetches the sovereign layout for a given Pharos address.
 * @param {string} pharos_address The user's Pharos wallet address.
 * @returns {Promise<{vibe_color: string, avatar: string, username: string, handle: string} | null>} The layout metadata or null if not found.
 */
export async function getLayout(pharos_address) {
  if (!pharos_address) return null;

  try {
    const dbPool = getDbPool();
    const res = await dbPool.query(
      'SELECT sovereign_layout FROM users WHERE pharos_address = $1::text',
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
    const dbPool = getDbPool();
    const query = `
      INSERT INTO users (pharos_address, sovereign_layout)
      VALUES ($1, $2)
      ON CONFLICT (pharos_address)
      DO UPDATE SET sovereign_layout = users.sovereign_layout || $2;
    `;
    await dbPool.query(query, [pharos_address, metadata]);
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
    const dbPool = getDbPool();
    const query = 'INSERT INTO posts (pharos_address, content, tx_hash) VALUES ($1, $2, $3)';
    await dbPool.query(query, [pharos_address, content, tx_hash]);
  } catch (error) {
    console.error('Error saving post to Neon:', {
        message: error.message,
        stack: error.stack,
    });
    throw error;
  }
}

/**
 * Fetches the global feed from the database with user-specific interaction data.
 * @param {string | null} pharos_address The requesting user's Pharos wallet address.
 * @returns {Promise<any[]>} A list of posts with user data and interaction counts.
 */
export async function getFeed(pharos_address) {
  try {
    const dbPool = getDbPool();
    const query = `
      SELECT
        p.id,
        p.content,
        p.created_at,
        p.tx_hash,
        p.pharos_address,
        u.sovereign_layout,
        (SELECT COUNT(*) FROM likes WHERE post_id_onchain = p.id::text) AS like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id_onchain = p.id::text) AS comment_count,
        CASE WHEN $1 IS NOT NULL THEN EXISTS(SELECT 1 FROM likes WHERE post_id_onchain = p.id::text AND pharos_address = $1::text) ELSE FALSE END AS user_has_liked,
        CASE WHEN $1 IS NOT NULL THEN EXISTS(SELECT 1 FROM bookmarks WHERE post_id_onchain = p.id::text AND pharos_address = $1::text) ELSE FALSE END AS user_has_bookmarked,
        (
            SELECT COALESCE(json_agg(c_sub.* ORDER BY c_sub.created_at DESC), '[]'::json)
            FROM (
                SELECT
                    c.id,
                    c.content,
                    c.created_at,
                    c.pharos_address,
                    cu.sovereign_layout as user_layout
                FROM comments c
                LEFT JOIN users cu ON c.pharos_address = cu.pharos_address
                WHERE c.post_id_onchain = p.id::text
            ) as c_sub
        ) as comments
      FROM posts p
      LEFT JOIN users u ON p.pharos_address = u.pharos_address
      ORDER BY p.created_at DESC
      LIMIT 50;
    `;
    const res = await dbPool.query(query, [pharos_address || null]);
    return res.rows;
  } catch (error) {
    console.error('Error fetching feed from Neon:', error);
    throw error;
  }
}

// --- Interaction Functions ---

export async function addLike(postId, pharos_address) {
  const dbPool = getDbPool();
  await dbPool.query('INSERT INTO likes (post_id_onchain, pharos_address) VALUES ($1::text, $2) ON CONFLICT (post_id_onchain, pharos_address) DO NOTHING', [postId, pharos_address]);
}

export async function removeLike(postId, pharos_address) {
  const dbPool = getDbPool();
  await dbPool.query('DELETE FROM likes WHERE post_id_onchain = $1::text AND pharos_address = $2::text', [postId, pharos_address]);
}

export async function addBookmark(postId, pharos_address) {
  const dbPool = getDbPool();
  await dbPool.query('INSERT INTO bookmarks (post_id_onchain, pharos_address) VALUES ($1::text, $2) ON CONFLICT (post_id_onchain, pharos_address) DO NOTHING', [postId, pharos_address]);
}

export async function removeBookmark(postId, pharos_address) {
  const dbPool = getDbPool();
  await dbPool.query('DELETE FROM bookmarks WHERE post_id_onchain = $1::text AND pharos_address = $2::text', [postId, pharos_address]);
}

export async function addComment(postId, pharos_address, content) {
    const dbPool = getDbPool();
    const res = await dbPool.query(
        'INSERT INTO comments (post_id_onchain, pharos_address, content) VALUES ($1::text, $2, $3) RETURNING *',
        [postId, pharos_address, content]
    );
    return res.rows[0];
}
