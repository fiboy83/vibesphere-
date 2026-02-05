// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VibesphereIdentity is ERC721, Ownable {
    mapping(string => address) private _handleToAddress;
    mapping(address => string) private _addressToHandle;
    mapping(string => bool) public isHandleTaken;

    event HandleMinted(
        address indexed owner,
        uint256 indexed tokenId,
        string handle
    );

    constructor() ERC721("Vibesphere Identity", "VIBE") Ownable(msg.sender) {}

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // You can build a metadata server that returns JSON based on the token ID
        // For now, we return an empty string.
        return "";
    }
    
    function getHandleByAddress(address owner) public view returns (string memory) {
        return _addressToHandle[owner];
    }

    function mintHandle(string calldata handle) external {
        // Uniqueness check: Ensure handle is not already taken
        require(!isHandleTaken[handle], "Handle already taken");
        // Uniqueness check: Ensure the sender doesn't already have a handle
        require(bytes(_addressToHandle[msg.sender]).length == 0, "Address already has a handle");

        uint256 tokenId = uint256(keccak256(abi.encodePacked(handle)));
        
        _handleToAddress[handle] = msg.sender;
        _addressToHandle[msg.sender] = handle;
        isHandleTaken[handle] = true;
        
        _mint(msg.sender, tokenId);

        emit HandleMinted(msg.sender, tokenId, handle);
    }
}
