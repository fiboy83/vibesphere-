// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VibesphereArticle
 * @author Vibe Coder
 * @notice A gas-efficient smart contract for posting articles on Vibesphere.
 * Content is stored in event logs to minimize on-chain storage costs, while a unique
 * article ID allows for off-chain database integration for interactions like
 * likes and reposts.
 */
contract VibesphereArticle {
    // A counter to ensure each article has a unique ID. Starts at 0, so first ID is 1.
    uint256 private _articleIdCounter;

    // Struct to hold minimal on-chain metadata for each article.
    struct ArticleMeta {
        address author;
        uint256 timestamp;
    }

    // Mapping from article ID to its on-chain metadata.
    mapping(uint256 => ArticleMeta) public articleMetas;

    // Event emitted when a new article is posted. The full content is stored here.
    event ArticlePosted(
        address indexed author,
        uint256 indexed articleId,
        string title,
        string content,
        uint256 timestamp
    );

    /**
     * @notice Posts a new article to the Vibesphere network.
     * @dev This function increments the article counter, stores minimal metadata on-chain,
     *      and emits an event containing the full article content. This is a gas-optimized
     *      approach where clients/indexers read the content from the event logs.
     * @param _title The title of the article.
     * @param _content The full content of the article.
     */
    function postArticle(string memory _title, string memory _content) public {
        _articleIdCounter++;
        uint256 newArticleId = _articleIdCounter;

        // Store minimal, essential data on-chain.
        articleMetas[newArticleId] = ArticleMeta({
            author: msg.sender,
            timestamp: block.timestamp
        });

        // Emit the event with the full content to be captured by off-chain services.
        emit ArticlePosted(
            msg.sender,
            newArticleId,
            _title,
            _content,
            block.timestamp
        );
    }

    /**
     * @notice Returns the total number of articles ever posted.
     * @return The current value of the article counter.
     */
    function getTotalArticles() public view returns (uint256) {
        return _articleIdCounter;
    }
}
