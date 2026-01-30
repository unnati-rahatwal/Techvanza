import { ethers } from 'ethers';
import dbConnect from '@/lib/mongodb';
import BlockchainLog from '@/models/BlockchainLog';
import crypto from 'crypto';

const ContractABI = [
    "function createListing(string _listingId, string _supplierHash, uint256 _price, uint256 _quantity) public",
    "function purchaseItem(string _listingId, string _buyerHash) public",
    "function updateState(string _listingId, uint8 _newState) public",
    "function getItem(string _listingId) public view returns (tuple(string listingId, string supplierHash, string buyerHash, uint256 price, uint256 quantity, uint8 currentState, address supplierWallet))",
    "function getHistory(string _listingId) public view returns (tuple(uint8 state, uint256 timestamp, address updatedBy, string txHash)[])",
    "event ListingCreated(string indexed listingId, address indexed supplier, uint256 timestamp)",
    "event Purchased(string indexed listingId, address indexed buyer, string buyerHash, uint256 timestamp)",
    "event StateUpdated(string indexed listingId, uint8 newState, uint256 timestamp)"
];

// Check if blockchain is enabled
const isBlockchainEnabled = () => {
    return !!(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS &&
        process.env.PRIVATE_KEY &&
        (process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL));
};

const getContract = () => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
        throw new Error("Missing Blockchain Config");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    return new ethers.Contract(contractAddress, ContractABI, wallet);
};

// MongoDB Fallback Functions
const simulateBlockchainCreate = async (listingId, supplierHash, price, quantity) => {
    await dbConnect();
    const log = await BlockchainLog.create({
        listingId,
        eventType: 'CREATED',
        supplierHash,
        amount: price,
        metadata: { quantity },
        isSimulated: true
    });
    return log.txHash;
};

const simulateBlockchainPurchase = async (listingId, buyerHash) => {
    await dbConnect();
    const log = await BlockchainLog.create({
        listingId,
        eventType: 'PURCHASED',
        buyerHash,
        isSimulated: true
    });
    return log.txHash;
};

const simulateBlockchainHistory = async (listingId) => {
    await dbConnect();
    const logs = await BlockchainLog.find({ listingId }).sort({ timestamp: 1 });

    const stateMap = {
        'CREATED': 0,
        'PURCHASED': 1,
        'PROCESSING': 2,
        'SHIPPED': 3,
        'DELIVERED': 4,
        'CANCELLED': 5
    };

    return logs.map(log => ({
        state: stateMap[log.eventType] || 0,
        timestamp: log.timestamp.getTime(),
        updatedBy: log.updatedBy || '0x0000000000000000000000000000000000000000',
        txHash: log.txHash
    }));
};

// Main Functions with Fallback
export const createBlockchainListing = async (listingId, supplierHash, price, quantity) => {
    if (!isBlockchainEnabled()) {
        console.log('⚠️ Blockchain disabled, using MongoDB simulation');
        return await simulateBlockchainCreate(listingId, supplierHash, price, quantity);
    }

    try {
        const contract = getContract();
        const tx = await contract.createListing(listingId, supplierHash, price, quantity);
        await tx.wait();

        // Also log to MongoDB for backup
        await dbConnect();
        await BlockchainLog.create({
            listingId,
            eventType: 'CREATED',
            supplierHash,
            amount: price,
            metadata: { quantity },
            txHash: tx.hash,
            isSimulated: false
        });

        return tx.hash;
    } catch (error) {
        console.error("Blockchain Error, falling back to MongoDB:", error.message);
        return await simulateBlockchainCreate(listingId, supplierHash, price, quantity);
    }
};

export const recordBlockchainPurchase = async (listingId, buyerHash) => {
    if (!isBlockchainEnabled()) {
        console.log('⚠️ Blockchain disabled, using MongoDB simulation');
        return await simulateBlockchainPurchase(listingId, buyerHash);
    }

    try {
        const contract = getContract();
        const tx = await contract.purchaseItem(listingId, buyerHash);
        await tx.wait();

        // Also log to MongoDB
        await dbConnect();
        await BlockchainLog.create({
            listingId,
            eventType: 'PURCHASED',
            buyerHash,
            txHash: tx.hash,
            isSimulated: false
        });

        return tx.hash;
    } catch (error) {
        console.error("Blockchain Error, falling back to MongoDB:", error.message);
        return await simulateBlockchainPurchase(listingId, buyerHash);
    }
};

export const getBlockchainHistory = async (listingId) => {
    if (!isBlockchainEnabled()) {
        console.log('⚠️ Blockchain disabled, using MongoDB simulation');
        return await simulateBlockchainHistory(listingId);
    }

    try {
        const contract = getContract();
        const history = await contract.getHistory(listingId);

        return history.map(h => ({
            state: Number(h[0]),
            timestamp: Number(h[1]) * 1000,
            updatedBy: h[2],
            txHash: h[3]
        }));
    } catch (error) {
        console.warn("Blockchain read failed, using MongoDB:", error.message);
        return await simulateBlockchainHistory(listingId);
    }
};
