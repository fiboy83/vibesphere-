require('dotenv').config({ path: '.env' });
const { syncArticlesFromChain } = require('../src/services/neon-bridge.js');

const main = async () => {
  console.log('[INDEXER]: Starting manual sync process...');
  try {
    await syncArticlesFromChain();
    console.log('[INDEXER]: Manual sync process completed successfully.');
    // Force exit because the PG pool might keep the script alive
    process.exit(0); 
  } catch (error) {
    console.error('[INDEXER ERROR]: The sync process failed:', error);
    process.exit(1);
  }
};

main();
