import { Pool } from 'pg';

let pool;

const getDbPool = () => {
    if (!pool) {
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
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
      VALUES ($1::text, $2)
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
 * @param {string | null} image_url URL of the attached media.
 * @returns {Promise<void>}
 */
export async function savePost(pharos_address, content, tx_hash, image_url) {
  if (!pharos_address || (!content && !image_url)) return;
  try {
    const dbPool = getDbPool();
    const query = 'INSERT INTO posts (pharos_address, content, tx_hash, image_url) VALUES ($1::text, $2::text, $3::text, $4::text)';
    await dbPool.query(query, [pharos_address, content, tx_hash, image_url]);
  } catch (error) {
    console.error('[NEON SAVE POST ERROR]', {
        message: error.message,
        stack: error.stack,
        detail: error.detail,
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
        p.image_url AS media_url,
        CASE
            WHEN p.image_url LIKE 'data:video%' OR p.image_url LIKE '%.mp4' OR p.image_url LIKE '%.webm' THEN 'video'
            WHEN p.image_url IS NOT NULL AND p.image_url != '' THEN 'image'
            ELSE NULL
        END AS media_type,
        u.sovereign_layout,
        (SELECT COUNT(*) FROM likes WHERE post_id_onchain = p.id::text) AS like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id_onchain = p.id::text) AS comment_count,
        CASE WHEN $1::text IS NOT NULL THEN EXISTS(SELECT 1 FROM likes WHERE post_id_onchain = p.id::text AND pharos_address = $1::text) ELSE FALSE END AS user_has_liked,
        CASE WHEN $1::text IS NOT NULL THEN EXISTS(SELECT 1 FROM bookmarks WHERE post_id_onchain = p.id::text AND pharos_address = $1::text) ELSE FALSE END AS user_has_bookmarked,
        (
            SELECT COALESCE(json_agg(c_sub.* ORDER BY c_sub.created_at DESC), '[]'::json)
            FROM (
                SELECT
                    c.id,
                    c.content,
                    c.created_at,
                    c.pharos_address,
                    c.parent_id,
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
  await dbPool.query('INSERT INTO likes (post_id_onchain, pharos_address) VALUES ($1::text, $2::text) ON CONFLICT (post_id_onchain, pharos_address) DO NOTHING', [postId, pharos_address]);
}

export async function removeLike(postId, pharos_address) {
  const dbPool = getDbPool();
  await dbPool.query('DELETE FROM likes WHERE post_id_onchain = $1::text AND pharos_address = $2::text', [postId, pharos_address]);
}

export async function addBookmark(postId, pharos_address) {
  const dbPool = getDbPool();
  await dbPool.query('INSERT INTO bookmarks (post_id_onchain, pharos_address) VALUES ($1::text, $2::text) ON CONFLICT (post_id_onchain, pharos_address) DO NOTHING', [postId, pharos_address]);
}

export async function removeBookmark(postId, pharos_address) {
  const dbPool = getDbPool();
  await dbPool.query('DELETE FROM bookmarks WHERE post_id_onchain = $1::text AND pharos_address = $2::text', [postId, pharos_address]);
}

export async function addComment(postId, pharos_address, content, parentId = null) {
    const dbPool = getDbPool();
    const res = await dbPool.query(
        'INSERT INTO comments (post_id_onchain, pharos_address, content, parent_id) VALUES ($1::text, $2::text, $3::text, $4::integer) RETURNING *',
        [postId, pharos_address, content, parentId]
    );
    return res.rows[0];
}


/**
 * Saves a new message to the database.
 * @param {string} sender_address The sender's Pharos wallet address.
 * @param {string} receiver_address The receiver's Pharos wallet address.
 * @param {string} content The content of the message.
 * @returns {Promise<any>} The newly saved message.
 */
export async function saveMessage(sender_address, receiver_address, content) {
  if (!sender_address || !receiver_address || !content) return null;
  try {
    const dbPool = getDbPool();
    const query = 'INSERT INTO messages (sender_address, receiver_address, content) VALUES ($1::text, $2::text, $3::text) RETURNING *';
    const res = await dbPool.query(query, [sender_address, receiver_address, content]);
    return res.rows[0];
  } catch (error) {
    console.error('[NEON SAVE MESSAGE ERROR]', {
        message: error.message,
        stack: error.stack,
        detail: error.detail,
    });
    throw error;
  }
}

/**
 * Fetches messages between two users.
 * @param {string} address1 One user's Pharos address.
 * @param {string} address2 The other user's Pharos address.
 * @returns {Promise<any[]>} A list of messages.
 */
export async function getMessages(address1, address2) {
    if (!address1 || !address2) return [];
    try {
        const dbPool = getDbPool();
        const query = `
            SELECT
                m.id,
                m.content,
                m.created_at,
                m.sender_address,
                m.receiver_address,
                sender_user.sovereign_layout as sender_layout
            FROM messages m
            LEFT JOIN users sender_user ON m.sender_address = sender_user.pharos_address
            WHERE
                (m.sender_address = $1::text AND m.receiver_address = $2::text)
                OR
                (m.sender_address = $2::text AND m.receiver_address = $1::text)
            ORDER BY m.created_at ASC;
        `;
        const res = await dbPool.query(query, [address1, address2]);
        return res.rows;
    } catch (error) {
        console.error('Error fetching messages from Neon:', error);
        throw error;
    }
}


/**
 * Fetches a list of conversations for a given user.
 * @param {string} pharos_address The user's Pharos wallet address.
 * @returns {Promise<any[]>} A list of the most recent message from each conversation.
 */
export async function getConversations(pharos_address) {
  if (!pharos_address) return [];
  try {
    const dbPool = getDbPool();
    const query = `
      WITH RankedMessages AS (
          SELECT
              m.*,
              CASE
                  WHEN m.sender_address = $1::text THEN m.receiver_address
                  ELSE m.sender_address
              END AS partner_address,
              ROW_NUMBER() OVER(PARTITION BY
                  CASE
                      WHEN m.sender_address = $1::text THEN m.receiver_address
                      ELSE m.sender_address
                  END
                  ORDER BY m.created_at DESC
              ) as rn
          FROM messages m
          WHERE m.sender_address = $1::text OR m.receiver_address = $1::text
      )
      SELECT
          rm.id,
          rm.content,
          rm.created_at,
          rm.sender_address,
          rm.receiver_address,
          rm.partner_address,
          u.sovereign_layout as partner_layout
      FROM RankedMessages rm
      LEFT JOIN users u ON rm.partner_address = u.pharos_address
      WHERE rm.rn = 1
      ORDER BY rm.created_at DESC;
    `;
    const res = await dbPool.query(query, [pharos_address]);
    return res.rows;
  } catch (error) {
    console.error('Error fetching conversations from Neon:', error);
    throw error;
  }
}
