
const { Pool } = require('pg');
const { createPublicClient, http, defineChain, decodeEventLog, encodeEventTopics } = require('viem');

// --- Self-contained constants to avoid alias/TS issues in Node script context ---

const articleContractAddress = "0xeea92f3946f0901828908772b61e3c05c6a07d40"; 

const articleContractAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "articleId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "content",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ArticlePosted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getTotalArticles",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const pharosTestnet = defineChain({
  id: 688689,
  name: 'Pharos Atlantic Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PHAROS',
    symbol: 'PHRS',
  },
  rpcUrls: {
    default: {
      http: ['https://atlantic.dplabs-internal.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Pharos Scan', url: 'https://pharos-testnet.socialscan.io' },
  },
  testnet: true,
});

const INDEXER_STATE_KEY = `last_synced_block_articles_${articleContractAddress}`;

let pool;

const getDbPool = () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('CRITICAL: DATABASE_URL environment variable is NOT set. Database connection will fail.');
    }
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false, // In production, consider using a CA cert
            },
        });
    }
    return pool;
}

// --- Indexer State Management ---

async function getLastSyncedBlock() {
  const dbPool = getDbPool();
  const client = await dbPool.connect();
  try {
    // Ensure the state table exists, creating it if it doesn't.
    await client.query(`
      CREATE TABLE IF NOT EXISTS indexer_state (
        key VARCHAR(255) PRIMARY KEY,
        value BIGINT NOT NULL
      );
    `);
    const res = await client.query("SELECT value FROM indexer_state WHERE key = $1", [INDEXER_STATE_KEY]);
    if (res.rows.length > 0) {
      return BigInt(res.rows[0].value);
    }
    return null; // No state saved yet
  } finally {
    client.release();
  }
}

async function setLastSyncedBlock(blockNumber) {
    const dbPool = getDbPool();
    const client = await dbPool.connect();
    try {
        await client.query(
            `INSERT INTO indexer_state (key, value) VALUES ($1, $2)
             ON CONFLICT (key) DO UPDATE SET value = $2;`,
            [INDEXER_STATE_KEY, blockNumber.toString()]
        );
    } finally {
        client.release();
    }
}


/**
 * A long-running indexer process that fetches ArticlePosted events and syncs them to the DB.
 */
async function syncArticlesFromChain() {
  const BATCH_SIZE = 1000n;

  const publicClient = createPublicClient({
    chain: pharosTestnet,
    transport: http('https://atlantic.dplabs-internal.com'),
  });

  console.log(`[vibesphere] 🌐 Bridge Active: Listening for PHRS articles on ${articleContractAddress.slice(0, 6)}...`);

  // Pre-calculate the event topic for "ArticlePosted"
  const articlePostedTopic = encodeEventTopics({
    abi: articleContractAbi,
    eventName: 'ArticlePosted',
  })[0];

  while (true) {
    try {
      const latestBlock = await publicClient.getBlockNumber();
      const lastSyncedBlock = await getLastSyncedBlock();
      
      // If we've never synced, start from the current block to only get new events.
      // Otherwise, start from the block after the last one we synced.
      let fromBlock = lastSyncedBlock ? lastSyncedBlock + 1n : latestBlock;

      if (fromBlock > latestBlock) {
        // We are caught up, switch to polling mode.
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1-second poll
        continue;
      }

      const toBlock = fromBlock + BATCH_SIZE - 1n < latestBlock ? fromBlock + BATCH_SIZE - 1n : latestBlock;
      
      let rawLogs = [];
      try {
          rawLogs = await publicClient.getLogs({
            address: articleContractAddress,
            fromBlock,
            toBlock,
          });
      } catch (rpcError) {
          console.error(`[INDEXER RPC ERROR] Failed to fetch logs for blocks ${fromBlock}-${toBlock}:`, rpcError);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
      }

      // Filter for 'ArticlePosted' events client-side.
      const logs = rawLogs.filter(log => log.topics[0] === articlePostedTopic);
      
      if (logs.length > 0) {
        const client = await getDbPool().connect();
        try {
          await client.query('BEGIN');
          for (const log of logs) {
            // Decode the event log to get the arguments
            const decodedEvent = decodeEventLog({
              abi: articleContractAbi,
              data: log.data,
              topics: log.topics,
            });

            const { author, title, content, timestamp } = decodedEvent.args;
            const timestampDate = new Date(Number(timestamp) * 1000);

            console.log(`[vibesphere] ✨ New Article Detected: ${title}`);
            
            await client.query(
              `INSERT INTO articles (author_address, title, content, "timestamp", visibility, contract_address)
               VALUES ($1, $2, $3, $4, 'public', $5);`,
              [author, title, content, timestampDate, articleContractAddress]
            );
          }
          await client.query('COMMIT');
        } catch (dbError) {
          await client.query('ROLLBACK');
          console.error('[INDEXER DB ERROR]: Database transaction failed.', dbError);
        } finally {
          client.release();
        }
      }
      
      await setLastSyncedBlock(toBlock);
      if (logs.length === 0) {
          console.log(`[vibesphere] ⚡ Blocks #${fromBlock}-${toBlock} synced. No new articles.`);
      } else {
          console.log(`[vibesphere] ⚡ Block #${toBlock} synced with ${logs.length} new articles.`);
      }

    } catch (error) {
      console.error('[INDEXER LOOP ERROR]: An error occurred during the sync cycle:', error);
      // Wait for 5 seconds before retrying on a major error
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Fetches the sovereign layout for a given Pharos address.
 * @param {string} pharos_address The user's Pharos wallet address.
 * @returns {Promise<{vibe_color: string, avatar: string, username: string, handle: string, bio: string, extendedBio: string, websiteUrl: string} | null>} The layout metadata or null if not found.
 */
async function getLayout(pharos_address) {
  const dbPool = getDbPool();
  if (!pharos_address || !dbPool) return null;

  try {
    const res = await dbPool.query(
      'SELECT sovereign_layout, extended_bio, website_url FROM users WHERE pharos_address = $1::text',
      [pharos_address]
    );

    if (res.rows.length > 0) {
      const row = res.rows[0];
      const layout = row.sovereign_layout || {};
      return {
        vibe_color: layout?.vibe_color || null,
        avatar: layout?.avatar || null,
        username: layout?.username || null,
        handle: layout?.handle || null,
        bio: layout?.bio || null,
        extendedBio: row.extended_bio || null,
        websiteUrl: row.website_url || null,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching layout from Neon:', error);
    throw error;
  }
}

/**
 * Updates or inserts user data for a given Pharos address.
 * @param {string} pharos_address The user's Pharos wallet address.
 * @param {object} [metadata] The JSONB layout metadata to merge.
 * @param {string} [extendedBio] The user's extended bio text.
 * @param {string} [websiteUrl] The user's primary website URL.
 * @returns {Promise<void>}
 */
async function updateLayout(pharos_address, metadata, extendedBio, websiteUrl) {
  const dbPool = getDbPool();
  if (!pharos_address || !dbPool) return;

  const updates = [];
  const values = [pharos_address];
  let paramIndex = 2;

  if (metadata && Object.keys(metadata).length > 0) {
    updates.push(`sovereign_layout = COALESCE(users.sovereign_layout, '{}'::jsonb) || $${paramIndex++}`);
    values.push(metadata);
  }

  if (extendedBio !== undefined) {
    updates.push(`extended_bio = $${paramIndex++}`);
    values.push(extendedBio);
  }
  
  if (websiteUrl !== undefined) {
    updates.push(`website_url = $${paramIndex++}`);
    values.push(websiteUrl);
  }

  if (updates.length === 0) {
    return;
  }

  try {
    const query = `
      INSERT INTO users (pharos_address)
      VALUES ($1)
      ON CONFLICT (pharos_address)
      DO UPDATE SET ${updates.join(', ')};
    `;
    await dbPool.query(query, values);
  } catch (error) {
    console.error('Error updating layout in Neon:', error);
    throw error;
  }
}


/**
 * Fetches the global feed from the database with user-specific interaction data.
 * @param {string | null} pharos_address The requesting user's Pharos wallet address.
 * @returns {Promise<any[]>} A list of posts with user data and interaction counts.
 */
async function getFeed(pharos_address) {
  console.log(`[NEON GET_FEED]: Fetching unified feed for address: ${pharos_address || 'guest'}`);
  const dbPool = getDbPool();
  if (!dbPool) {
    console.error('[NEON GET_FEED]: DB Pool not available. Returning empty feed.');
    return [];
  }

  try {
    const postQuery = `
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
        'post' as type,
        (
          COALESCE(u.sovereign_layout, '{}'::jsonb) || 
          jsonb_build_object('extendedBio', u.extended_bio, 'websiteUrl', u.website_url)
        ) as sovereign_layout,
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
                    (
                      COALESCE(cu.sovereign_layout, '{}'::jsonb) || 
                      jsonb_build_object('extendedBio', cu.extended_bio, 'websiteUrl', cu.website_url)
                    ) as user_layout
                FROM comments c
                LEFT JOIN users cu ON c.pharos_address = cu.pharos_address
                WHERE c.post_id_onchain = p.id::text
            ) as c_sub
        ) as comments
      FROM posts p
      LEFT JOIN users u ON p.pharos_address = u.pharos_address
    `;

    const articleQuery = `
      SELECT
        a.id,
        a.title,
        a.content,
        a."timestamp" as created_at,
        a.author_address as pharos_address,
        'article' as type,
        (
          COALESCE(u.sovereign_layout, '{}'::jsonb) || 
          jsonb_build_object('extendedBio', u.extended_bio, 'websiteUrl', u.website_url)
        ) as sovereign_layout
      FROM articles a
      LEFT JOIN users u ON a.author_address = u.pharos_address
      WHERE ($1::text IS NULL OR a.author_address = $1::text)
    `;

    const [postRes, articleRes] = await Promise.all([
        dbPool.query(postQuery, [pharos_address || null]),
        dbPool.query(articleQuery, [pharos_address || null])
    ]);
    
    const combinedFeed = [...postRes.rows, ...articleRes.rows];
    combinedFeed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log(`[NEON GET_FEED]: Query successful, found ${combinedFeed.length} total items.`);
    return combinedFeed.slice(0, 100);

  } catch (error) {
    console.error('[NEON GET_FEED ERROR]: Error fetching unified feed from Neon:', error);
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
async function savePost(pharos_address, content, tx_hash, image_url) {
  const dbPool = getDbPool();
  if (!pharos_address || (!content && !image_url) || !dbPool) return;
  try {
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


async function addLike(postId, pharos_address) {
  const dbPool = getDbPool();
  if (!dbPool) return;
  await dbPool.query('INSERT INTO likes (post_id_onchain, pharos_address) VALUES ($1::text, $2::text) ON CONFLICT (post_id_onchain, pharos_address) DO NOTHING', [postId, pharos_address]);
}

async function removeLike(postId, pharos_address) {
  const dbPool = getDbPool();
  if (!dbPool) return;
  await dbPool.query('DELETE FROM likes WHERE post_id_onchain = $1::text AND pharos_address = $2::text', [postId, pharos_address]);
}

async function addBookmark(postId, pharos_address) {
  const dbPool = getDbPool();
  if (!dbPool) return;
  await dbPool.query('INSERT INTO bookmarks (post_id_onchain, pharos_address) VALUES ($1::text, $2::text) ON CONFLICT (post_id_onchain, pharos_address) DO NOTHING', [postId, pharos_address]);
}

async function removeBookmark(postId, pharos_address) {
  const dbPool = getDbPool();
  if (!dbPool) return;
  await dbPool.query('DELETE FROM bookmarks WHERE post_id_onchain = $1::text AND pharos_address = $2::text', [postId, pharos_address]);
}

async function addComment(postId, pharos_address, content, parentId = null) {
    const dbPool = getDbPool();
    if (!dbPool) return null;
    const res = await dbPool.query(
        'INSERT INTO comments (post_id_onchain, pharos_address, content, parent_id) VALUES ($1::text, $2::text, $3::text, $4::integer) RETURNING *',
        [postId, pharos_address, content, parentId]
    );
    return res.rows[0];
}


async function saveMessage(sender_address, receiver_address, content) {
  const dbPool = getDbPool();
  if (!sender_address || !receiver_address || !content || !dbPool) return null;
  try {
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

async function getMessages(address1, address2) {
    const dbPool = getDbPool();
    if (!address1 || !address2 || !dbPool) return [];
    try {
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

async function getConversations(pharos_address) {
  const dbPool = getDbPool();
  if (!pharos_address || !dbPool) return [];
  try {
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

async function saveArticle(author_address, title, content, tx_hash) {
  const dbPool = getDbPool();
  if (!author_address || !title || !content || !dbPool) return;
  try {
    await dbPool.query(
      `INSERT INTO articles (author_address, title, content, "timestamp", visibility, contract_address)
       VALUES ($1, $2, $3, NOW(), 'public', $4);`,
      [author_address, title, content, articleContractAddress]
    );
    console.log(`[NEON SAVE ARTICLE]: Successfully saved article (tx: ${tx_hash}).`);
  } catch (error) {
    console.error('[NEON SAVE ARTICLE ERROR]', error);
    throw error;
  }
}

async function getArticles(author_address) {
  console.log(`[NEON GET_ARTICLES]: Fetching articles for: ${author_address || 'all'}`);
  const dbPool = getDbPool();
  if (!dbPool) {
    console.error('[NEON GET_ARTICLES]: DB Pool not available. Returning empty array.');
    return [];
  }

  try {
    const params = [];
    let query = `
      SELECT
        a.id,
        a.title,
        a.content,
        a."timestamp" as created_at,
        a.author_address,
        a.visibility,
        (
          COALESCE(u.sovereign_layout, '{}'::jsonb) || 
          jsonb_build_object('extendedBio', u.extended_bio, 'websiteUrl', u.website_url)
        ) as sovereign_layout
      FROM articles a
      LEFT JOIN users u ON a.author_address = u.pharos_address
    `;

    if (author_address) {
      query += ' WHERE a.author_address = $1::text';
      params.push(author_address);
    }
    
    query += `
      ORDER BY a."timestamp" DESC
      LIMIT 50;
    `;

    const res = await dbPool.query(query, params);
    console.log(`[NEON GET_ARTICLES]: Query successful, found ${res.rows.length} rows.`);
    return res.rows;
  } catch (error) {
    console.error('[NEON GET_ARTICLES ERROR]: Error fetching articles from Neon:', error);
    throw error;
  }
}

module.exports = {
    getLayout,
    updateLayout,
    getFeed,
    savePost,
    addLike,
    removeLike,
    addBookmark,
    removeBookmark,
    addComment,
    saveMessage,
    getMessages,
    getConversations,
    saveArticle,
    getArticles,
    syncArticlesFromChain
};
