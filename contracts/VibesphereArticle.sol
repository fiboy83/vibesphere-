// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VibesphereArticle
 * @author Vibe Coder AI
 * @notice A standalone, gas-optimized smart contract for publishing articles on-chain.
 * This contract acts as a source of truth and an event emitter for off-chain services.
 * It is intentionally minimal, avoiding complex logic like pagination, editing, or access control.
 */
contract VibesphereArticle {

    // --- Data Structures ---

    /**
     * @dev Represents a single published article.
     * Data is stored minimally to optimize gas costs.
     */
    struct Article {
        uint256 articleId;      // Unique identifier for the article
        address author;         // The wallet address of the publisher
        string title;           // The title of the article
        string contentHash;     // An IPFS or Arweave hash pointing to the full article content
        uint256 createdAt;      // The block timestamp when the article was published
    }

    // --- State Variables ---

    // Counter to track the total number of published articles.
    uint256 public totalArticles;

    // Mapping from an article ID to the corresponding Article struct.
    mapping(uint256 => Article) public articles;

    // --- Events ---

    /**
     * @dev Emitted when a new article is successfully published.
     * Off-chain services can listen to this event to sync data.
     */
    event ArticlePublished(
        uint256 indexed articleId,
        address indexed author,
        string title,
        string contentHash,
        uint256 createdAt
    );

    // --- Functions ---

    /**
     * @notice Publishes a new article to the blockchain.
     * @param _title The title of the article (max 200 chars enforced off-chain).
     * @param _contentHash The content identifier (e.g., IPFS CID).
     * @return articleId The unique ID of the newly published article.
     */
    function publishArticle(string calldata _title, string calldata _contentHash) external returns (uint256) {
        // --- Input Validation ---
        // Ensure that critical data fields are not empty.
        require(bytes(_title).length > 0, "VibesphereArticle: Title cannot be empty");
        require(bytes(_contentHash).length > 0, "VibesphereArticle: Content hash cannot be empty");

        // --- State Modification ---
        // Increment the total article count to generate a new ID.
        totalArticles++;
        uint256 newArticleId = totalArticles;

        // Create and store the new article struct in the mapping.
        articles[newArticleId] = Article({
            articleId: newArticleId,
            author: msg.sender,
            title: _title,
            contentHash: _contentHash,
            createdAt: block.timestamp
        });

        // --- Event Emission ---
        // Emit an event for off-chain indexers to capture the new article data.
        emit ArticlePublished(
            newArticleId,
            msg.sender,
            _title,
            _contentHash,
            block.timestamp
        );
        
        return newArticleId;
    }

    /**
     * @notice Retrieves a published article by its unique ID.
     * @param _articleId The ID of the article to fetch.
     * @return The complete Article struct.
     */
    function getArticle(uint256 _articleId) external view returns (Article memory) {
        // Ensure the requested article exists before returning.
        require(_articleId > 0 && _articleId <= totalArticles, "VibesphereArticle: Article does not exist");
        return articles[_articleId];
    }
}
