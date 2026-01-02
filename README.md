# The Mnemonic Hunt

A cryptographic treasure hunt game where players compete to discover a hidden mnemonic phrase and claim 100 USDC on Base network.

## 🎮 Game Overview

There's a wallet on Base network containing **100 USDC**. The mnemonic phrase for this wallet is unknown—it's a mystery waiting to be solved. Players can pay to generate AI images that combine words from specific positions in the hidden 24-word mnemonic phrase. Study the images carefully to piece together clues and discover the complete mnemonic phrase.

**Target Wallet:** [`0x924418e5640cd491DF12A5eaCAd78e459e0AD049`](https://basescan.org/address/0x924418e5640cd491DF12A5eaCAd78e459e0AD049) on Base

## 🎯 How It Works

1. **Select Word Indices**: Choose 2-24 unique indices (0-23) from the 24-word mnemonic phrase
2. **Generate Clues**: Pay a fee to generate an AI image that visually combines the words at your selected indices
3. **Study Patterns**: Analyze the generated images for visual patterns that might reveal the mnemonic words
4. **Make Guesses**: Use your clues to guess the complete mnemonic phrase
5. **Claim the Prize**: The first person to discover the correct mnemonic can use it to access the wallet and claim the 100 USDC

## 💰 Pricing Structure

The cost decreases as you select more word indices:

| Indices | Price (USDC) |
|---------|--------------|
| 2       | $7.00        |
| 3       | $6.50        |
| 4       | $6.00        |
| 5       | $5.50        |
| 6       | $5.00        |
| 7       | $4.50        |
| 8       | $4.00        |
| 9       | $3.50        |
| 10      | $3.00        |
| 11      | $2.50        |
| 12      | $2.00        |
| 13      | $1.50        |
| 14      | $1.00        |
| 15      | $0.90        |
| 16      | $0.80        |
| 17      | $0.70        |
| 18      | $0.60        |
| 19      | $0.50        |
| 20      | $0.40        |
| 21      | $0.30        |
| 22      | $0.20        |
| 23      | $0.10        |
| 24      | $0.05        |

Payments are processed via [X402](https://x402.org) protocol on Base network.

## 🚀 Deployment

Deployed to Eigen Compute at:

- **URL**: https://x402.buildweekends.com
- **App ID**: 0x954450e70556b56300aba48674f97adaaa8c463c
- **App Explorer**: https://verify-sepolia.eigencloud.xyz/app/0x954450e70556b56300aba48674f97adaaa8c463c

## 📡 API Endpoints

### GET /image

Generate an AI image combining words from specified mnemonic indices. Requires X402 payment.

**Query Parameters:**
- `idx` (required): Comma-separated list of unique indices (0-23), minimum 2, maximum 24
  - Example: `idx=1,2,3` or `idx=0,5,10,15,20`

**Example Request:**

```bash
curl -X GET "https://x402.buildweekends.com/image?idx=1,2,3" \
  -H "Accept: application/json"
```

**Response:**

```json
{
  "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "indices": [1, 2, 3]
}
```

**Error Responses:**

- `400`: Invalid or missing `idx` parameter, duplicate indices, or out-of-range indices
- `402`: Payment required (handled automatically by X402 client)
- `500`: Server error during image generation

### GET /gm

Returns a message challenge for signing (utility endpoint).

**Response:**

```json
{
  "address": "0x924418e5640cd491DF12A5eaCAd78e459e0AD049",
  "timestamp": 1766597109562,
  "message": "gm1766597109562",
  "signature": "0x86334e41693020f5a239a2a18c08a31b032f5cd212c2f403f05fa08ecea4e3bc68c4be470577eb509465e3def1022f11c40c2b8b277734e09f1cfb3955d86ab21c"
}
```

### POST /gm/verify

Verifies a signature (utility endpoint).

**Request:**

```bash
curl -X POST https://x402.buildweekends.com/gm/verify \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x924418e5640cd491DF12A5eaCAd78e459e0AD049",
    "timestamp": 1766597197598,
    "message": "gm1766597197598",
    "signature": "0x03063fc9a3902edd65834e466cf7c9a0416e60efe6e205e8eba2c50a730d378165750fe0040abf53d1e4da5adfc5c8adb9f95cafe86fa7b198628a7a2686a3a61b"
  }'
```

**Response:**

```json
{
  "isValid": true
}
```

### GET /withdraw

Withdraws USDC from the game wallet to the developer address. Only available after January 31, 2026 12:00 GMT.

**Response:**

```json
{
  "hash": "0x..."
}
```

## 🛠️ Technology Stack

- **Backend**: Express.js with TypeScript
- **Frontend**: Next.js with React
- **Blockchain**: Base network (Ethereum L2)
- **Payment**: X402 protocol for micropayments
- **AI**: OpenAI GPT-5 Mini for image generation
- **Storage**: IndexedDB for client-side clue storage

## 📝 Notes

- The mnemonic phrase is a standard BIP39 24-word phrase
- Generated images contain no text—only visual representations of the combined words
- All payments are processed on-chain via X402 protocol
- The game continues until someone discovers the correct mnemonic phrase
