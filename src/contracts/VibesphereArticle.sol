// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VibesphereArticle
 * @dev A standalone, gas-optimized contract for publishing articles on-chain.
 * It acts as a source of truth and emits events for off-chain synchronization.
 */
contract VibesphereArticle {
    // --- Data Structures ---

    /**
     * @dev Represents the core data of a published article.
     * Kept minimal to optimize gas costs for on-chain storage.
     */
    struct Article {
        uint256 id;
        address author;
        string title;
        string contentHash; // IPFS/Arweave CID
        uint256 createdAt;
    }

    // --- State Variables ---

    // Counter to ensure a unique, incremental ID for each article.
    uint256 private _articleCounter;

    // Mapping from article ID to the stored Article struct.
    mapping(uint256 => Article) private _articles;

    // --- Events ---

    /**
     * @dev Emitted when a new article is successfully published.
     * Off-chain services should listen to this event to sync data.
     * @param articleId The unique ID of the new article.
     * @param author The address of the article's author.
     * @param title The title of the article.
     * @param contentHash The IPFS/Arweave content identifier (CID).
     * @param createdAt The block timestamp of when the article was published.
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
     * @dev Publishes a new article to the blockchain.
     * Validates inputs, stores the article data, and emits an event.
     * @param _title The title of the article (max 200 chars, enforced off-chain).
     * @param _contentHash The content identifier (CID) from IPFS/Arweave.
     */
    function publishArticle(string calldata _title, string calldata _contentHash) external {
        // Input validation
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_contentHash).length > 0, "Content hash cannot be empty");

        // Increment the counter to get a new unique ID
        _articleCounter++;
        uint256 newArticleId = _articleCounter;

        // Create and store the new article struct
        _articles[newArticleId] = Article({
            id: newArticleId,
            author: msg.sender,
            title: _title,
            contentHash: _contentHash,
            createdAt: block.timestamp
        });

        // Emit the event for off-chain listeners
        emit ArticlePublished(
            newArticleId,
            msg.sender,
            _title,
            _contentHash,
            block.timestamp
        );
    }

    // --- Public Getters ---

    /**
     * @dev Returns the total number of articles ever published.
     */
    function totalArticles() external view returns (uint256) {
        return _articleCounter;
    }

    /**
     * @dev Fetches a single article's data by its ID.
     * @param _articleId The ID of the article to retrieve.
     * @return The complete Article struct.
     */
    function getArticleById(uint256 _articleId) external view returns (Article memory) {
        return _articles[_articleId];
    }
}
