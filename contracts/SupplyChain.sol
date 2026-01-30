// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    
    enum State { CREATED, PURCHASED, PROCESSING, SHIPPED, DELIVERED, CANCELLED }

    struct History {
        State state;
        uint256 timestamp;
        address updatedBy;
        string txHash; // Optional: store reference to related tx or metadata
    }

    struct Item {
        string listingId;
        string supplierHash; // SHA256 of supplier ID
        string buyerHash;    // SHA256 of buyer ID (empty initially)
        uint256 price;
        uint256 quantity;
        State currentState;
        address supplierWallet;
    }

    // Maps listingId -> Item
    mapping(string => Item) public items;
    // Maps listingId -> History[]
    mapping(string => History[]) public itemHistory;
    // Check if listing ID exists
    mapping(string => bool) public listingExists;

    event ListingCreated(string indexed listingId, address indexed supplier, uint256 timestamp);
    event Purchased(string indexed listingId, address indexed buyer, string buyerHash, uint256 timestamp);
    event StateUpdated(string indexed listingId, State newState, uint256 timestamp);

    // Modifiers
    modifier onlySupplier(string memory _listingId) {
        require(items[_listingId].supplierWallet == msg.sender, "Only supplier can perform this action");
        _;
    }

    modifier exists(string memory _listingId) {
        require(listingExists[_listingId], "Listing does not exist");
        _;
    }

    function createListing(
        string memory _listingId,
        string memory _supplierHash,
        uint256 _price,
        uint256 _quantity
    ) public {
        require(!listingExists[_listingId], "Listing ID already exists");

        Item storage newItem = items[_listingId];
        newItem.listingId = _listingId;
        newItem.supplierHash = _supplierHash;
        newItem.price = _price;
        newItem.quantity = _quantity;
        newItem.currentState = State.CREATED;
        newItem.supplierWallet = msg.sender;

        listingExists[_listingId] = true;

        _addHistory(_listingId, State.CREATED);

        emit ListingCreated(_listingId, msg.sender, block.timestamp);
    }

    function purchaseItem(
        string memory _listingId,
        string memory _buyerHash
    ) public exists(_listingId) {
        Item storage item = items[_listingId];
        require(item.currentState == State.CREATED, "Item not available for purchase");

        item.buyerHash = _buyerHash;
        item.currentState = State.PURCHASED;

        _addHistory(_listingId, State.PURCHASED);

        emit Purchased(_listingId, msg.sender, _buyerHash, block.timestamp);
    }

    function updateState(string memory _listingId, State _newState) public exists(_listingId) {
        // Simple access control: only supplier can update to PROCESSING/SHIPPED
        // In real world, logic would be more complex
        Item storage item = items[_listingId];
        
        require(_newState != item.currentState, "New state must be different");
        
        // Validation logic
        if (_newState == State.PROCESSING || _newState == State.SHIPPED) {
            require(msg.sender == item.supplierWallet, "Only supplier can update progress");
        } 
        // Example: Only buyer confirms delivery (simplified, assuming msg.sender isn't tracked as buyer wallet in this MVP, but we can add checks)

        item.currentState = _newState;
        _addHistory(_listingId, _newState);

        emit StateUpdated(_listingId, _newState, block.timestamp);
    }

    function _addHistory(string memory _listingId, State _state) internal {
        itemHistory[_listingId].push(History({
            state: _state,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            txHash: ""
        }));
    }

    function getItem(string memory _listingId) public view returns (Item memory) {
        return items[_listingId];
    }

    function getHistory(string memory _listingId) public view returns (History[] memory) {
        return itemHistory[_listingId];
    }
}
