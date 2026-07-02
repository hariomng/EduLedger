// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EduLedger is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    uint256 private _totalMinted;

    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) private _ownedTokens;

    constructor() ERC721("EduLedger", "EDL") {}

    // Allow anyone to mint their own NFT
    function mint(string memory uri) external {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        _ownedTokens[msg.sender].push(tokenId);

        _totalMinted += 1;
    }

    // Get total number of minted NFTs
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Get all token IDs owned by a specific address
    function tokensOfOwner(
        address owner
    ) external view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    // Override to clean up ownership tracking when transferring
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);

        if (from != address(0)) {
            // remove token from old owner list
            uint256[] storage fromTokens = _ownedTokens[from];
            for (uint256 i = 0; i < fromTokens.length; i++) {
                if (fromTokens[i] == tokenId) {
                    fromTokens[i] = fromTokens[fromTokens.length - 1];
                    fromTokens.pop();
                    break;
                }
            }
        }

        if (to != address(0)) {
            _ownedTokens[to].push(tokenId);
        }

        return from;
    }
}
