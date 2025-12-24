# X402 Game

## Deployment

Deployed to Eigen Compute at:

- **URL**: http://34.26.141.193:3000/gm
- **App ID**: 0x954450e70556b56300aba48674f97adaaa8c463c
- **App Explorer**: https://verify-sepolia.eigencloud.xyz/app/0x954450e70556b56300aba48674f97adaaa8c463c

## API Endpoints

### GET /gm

Returns a message challenge for signing.

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

Verifies a signature.

**Request:**

```bash
curl -X POST http://34.26.141.193:3000/gm/verify \
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
