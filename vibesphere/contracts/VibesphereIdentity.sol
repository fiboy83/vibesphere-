// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract VibesphereIdentity is ERC721, Ownable {
    mapping(string => bool) private _handleTaken;
    mapping(address => string) private _addressToHandle;
    uint256 private _tokenIdCounter;

    constructor() ERC721("Vibesphere Identity", "VIBE") Ownable(msg.sender) {}

    function mintHandle(string memory handle) public {
        require(bytes(handle).length > 0, "Handle cannot be empty");
        require(!_handleTaken[handle], "Handle is already taken");
        require(bytes(_addressToHandle[msg.sender]).length == 0, "Address already has a handle");

        _handleTaken[handle] = true;
        _addressToHandle[msg.sender] = handle;
        
        uint256 tokenId = _tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        _tokenIdCounter++;

        emit HandleMinted(msg.sender, tokenId, handle);
    }
    
    function isHandleTaken(string memory handle) public view returns (bool) {
        return _handleTaken[handle];
    }

    function getHandleByAddress(address owner) public view returns (string memory) {
        return _addressToHandle[owner];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        
        string memory handle = getHandleByAddress(ownerOf(tokenId));
        
        string memory json = string(abi.encodePacked(
            '{"name": "', handle, '.vibes", "description": "A sovereign identity on the Vibesphere network.", "attributes": [{"trait_type": "handle", "value": "', handle, '"}]}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", _encode(bytes(json))));
    }

    function _encode(bytes memory data) internal pure returns (string memory) {
        bytes memory-alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        uint256 dataLength = data.length;
        uint256 encodedLength = 4 * ((dataLength + 2) / 3);
        bytes memory-encodedData = new bytes(encodedLength);
        
        uint256 i = 0;
        uint256 j = 0;
        
        while (i < dataLength) {
            uint24 val = 0;
            if (i < dataLength) val = uint24(uint8(data[i])) << 16;
            i++;
            if (i < dataLength) val |= uint24(uint8(data[i])) << 8;
            i++;
            if (i < dataLength) val |= uint24(uint8(data[i]));
            i++;
            
            encodedData[j] =-alphabet[(val >> 18) & 63];
            j++;
            encodedData[j] =-alphabet[(val >> 12) & 63];
            j++;
            encodedData[j] =-alphabet[(val >> 6) & 63];
            j++;
            encodedData[j] =-alphabet[val & 63];
            j++;
        }
        
        uint256 padding = (3 - (dataLength % 3)) % 3;
        if (padding > 0) encodedData[encodedLength - 1] = '=';
        if (padding > 1) encodedData[encodedLength - 2] = '=';
        
        return string(encodedData);
    }

    event HandleMinted(address indexed owner, uint256 indexed tokenId, string handle);
}
