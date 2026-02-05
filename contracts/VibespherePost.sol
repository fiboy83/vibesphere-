// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// This contract is optimized for gas savings on post creation.
contract VibespherePost {
    struct Post {
        uint id;
        address author;
        string content;
        uint timestamp;
    }

    mapping(uint => Post) public posts;
    uint public postCount;

    event PostCreated(
        uint id,
        address indexed author,
        string content,
        uint timestamp
    );

    // Using 'calldata' for the _content parameter saves gas as the data
    // is not copied to memory for external function calls.
    function createPost(string calldata _content) public {
        require(bytes(_content).length <= 280, "Content exceeds 280 characters");
        postCount++;
        posts[postCount] = Post(postCount, msg.sender, _content, block.timestamp);
        emit PostCreated(postCount, msg.sender, _content, block.timestamp);
    }

    function getPost(uint _id) public view returns (Post memory) {
        return posts[_id];
    }
}
