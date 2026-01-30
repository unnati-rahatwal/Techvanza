# Blockchain Supply Chain - Deployment Guide

## 🎯 Two Deployment Options

### Option A: Full Blockchain (Sepolia Testnet)

### Option B: MongoDB Simulation (Instant Demo)

---

## ⚡ Quick Start (MongoDB Simulation - Recommended for Demo)

### Step 1: Verify Environment Variables

Check your `.env` file has these (blockchain vars can be empty):

```env
# MongoDB (Required)
MONGODB_URI=your_mongodb_connection_string

# Razorpay (Required for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Blockchain (Optional - leave empty for simulation mode)
NEXT_PUBLIC_CONTRACT_ADDRESS=
PRIVATE_KEY=
NEXT_PUBLIC_RPC_URL=
```

### Step 2: Test the System

1. **Start the server** (if not running):

   ```bash
   npm run dev
   ```

2. **Create a listing** as a Supplier

3. **Purchase as a Buyer** - Payment will trigger MongoDB simulation

4. **View Tracking**:
   - Go to `/tracking/{listingId}`
   - You'll see "Demo Mode" banner
   - Simulated transaction hashes will be displayed

✅ **That's it!** The system works fully without blockchain deployment.

---

## 🚀 Full Blockchain Deployment (Optional)

### Prerequisites

- MetaMask wallet with Sepolia ETH
- Get free Sepolia ETH from: https://sepoliafaucet.com/

### Step 1: Deploy Smart Contract

#### Option 1: Using Remix (Easiest)

1. Go to https://remix.ethereum.org/

2. Create new file: `SupplyChain.sol`

3. Copy the contract from `contracts/SupplyChain.sol`

4. Compile:
   - Click "Solidity Compiler" tab
   - Select compiler version: `0.8.19+`
   - Click "Compile SupplyChain.sol"

5. Deploy:
   - Click "Deploy & Run Transactions" tab
   - Environment: Select "Injected Provider - MetaMask"
   - Connect MetaMask to Sepolia network
   - Click "Deploy"
   - Confirm transaction in MetaMask

6. **Copy the deployed contract address**

#### Option 2: Using Hardhat

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init

# Copy contract to contracts/ folder
# Then deploy:
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 2: Update Environment Variables

Add to your `.env`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
PRIVATE_KEY=your_wallet_private_key_without_0x
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

**Get Infura RPC URL:**

1. Sign up at https://infura.io/
2. Create new project
3. Copy Sepolia endpoint

### Step 3: Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test Blockchain Integration

1. Create a new listing
2. Purchase it
3. Go to tracking page
4. Click the transaction hash link
5. Verify on Sepolia Etherscan

---

## 🔍 Verification

### Check if Blockchain is Active

Look for console logs:

- ✅ `Blockchain enabled` = Using real blockchain
- ⚠️ `Blockchain disabled, using MongoDB simulation` = Simulation mode

### Tracking Page Indicators

- **Real Blockchain**: Blue clickable Etherscan links
- **Simulation**: Yellow "Demo Mode" banner + gray tx hashes

---

## 🐛 Troubleshooting

### Issue: "Missing Blockchain Config"

**Solution**: Either:

1. Fill in all blockchain env vars (CONTRACT_ADDRESS, PRIVATE_KEY, RPC_URL)
2. OR leave them empty to use simulation mode

### Issue: Transaction Failing

**Possible causes**:

- Insufficient Sepolia ETH
- Wrong network selected in MetaMask
- Contract not deployed

**Solution**: Use simulation mode for demo

### Issue: Payment Not Recording

**Check**:

1. Razorpay keys are correct
2. MongoDB is connected
3. Check server logs for errors

---

## 📊 Feature Comparison

| Feature                | Blockchain Mode | Simulation Mode |
| ---------------------- | --------------- | --------------- |
| Payment Processing     | ✅              | ✅              |
| Transaction Tracking   | ✅              | ✅              |
| Etherscan Verification | ✅              | ❌              |
| Setup Time             | ~30 min         | Instant         |
| Cost                   | Free (testnet)  | Free            |
| Demo Ready             | ✅              | ✅              |

---

## 🎓 Recommended Approach

**For Hackathon Demo:**

1. Start with **Simulation Mode** (works immediately)
2. Deploy blockchain **if time permits**
3. Both modes are fully functional

**For Production:**

- Use real blockchain on mainnet
- Implement proper key management
- Add transaction queuing

---

## 📝 Next Steps

After deployment:

1. Test full purchase flow
2. Verify tracking page
3. Check MongoDB logs
4. (Optional) Verify on Etherscan if using blockchain

---

## 🆘 Support

If you encounter issues:

1. Check console logs
2. Verify .env variables
3. Ensure MongoDB is connected
4. Try simulation mode first
