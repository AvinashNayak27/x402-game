import { mnemonicToAccount } from "viem/accounts";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { verifyMessage } from "viem/utils";
import OpenAI from "openai";
import { paymentMiddleware } from "@x402/express";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { createPaywall } from "@x402/paywall";
import { evmPaywall } from "@x402/paywall/evm";
import {facilitator} from "@coinbase/x402"


dotenv.config();

const app = express();
app.use(express.json());

const payTo = "0xAD7c065112dCF8891b10F8e70eF74F5E4A168Fa4"; // DEV ADDRESS

// Create facilitator client (testnet)
const facilitatorClient = new HTTPFacilitatorClient(facilitator);

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:8453", new ExactEvmScheme()); // Base on mainnet

// Create paywall instance
const paywall = createPaywall()
  .withNetwork(evmPaywall)
  .withConfig({
    appName: "X402 Game",
    testnet: false,
  })
  .build();

app.use((req, res, next) => {
  if (
    req.path === "/image" &&
    req.query.idx &&
    typeof req.query.idx === "string"
  ) {
    const idxParam = req.query.idx as string;

    if (!idxParam) {
      return res.status(400).json({
        error:
          "Missing required query parameter: idx (e.g., idx=1,2 or idx=1,2,3,4,5)",
      });
    }

    // Parse indices from query parameter (e.g., "1,2,3" -> [1, 2, 3])
    const indices = idxParam.split(",").map((i) => parseInt(i.trim(), 10));

    // Check for duplicates
    const uniqueIndices = [...new Set(indices)];
    if (uniqueIndices.length !== indices.length) {
      return res.status(400).json({
        error: "Duplicate indices are not allowed. Each index must be unique.",
      });
    }

    if (
      indices.length < 2 ||
      indices.length > 23 ||
      indices.some((i) => isNaN(i) || i < 0 || i > 23)
    ) {
      return res.status(400).json({
        error:
          "Invalid idx format. Expected 2-23 unique numbers in range 0-23 (e.g., idx=1,2 or idx=1,2,3,4,5)",
      });
    }
    

    const pricing_dict: Record<number, number> = {
      2: 7,
      3: 6.5,
      4: 6,
      5: 5.5,
      6: 5,
      7: 4.5,
      8: 4,
      9: 3.5,
      10: 3,
      11: 2.5,
      12: 2,
      13: 1.5,
      14: 1,
      15: 0.9,
      16: 0.8,
      17: 0.7,
      18: 0.6,
      19: 0.5,
      20: 0.4,
      21: 0.3,
      22: 0.2,
      23: 0.1,
      24: 0,
    };

    const price = pricing_dict[indices.length];

    const originalMiddleware = paymentMiddleware(
      {
        "GET /image": {
          accepts: [
            {
              scheme: "exact",
              price: `$${price}`,
              network: "eip155:8453",
              payTo,
            },
          ],
          description:
            "Generate an image combining the words at the specified indices",
          mimeType: "image/png",
          resource: `${req.protocol}://${req.headers.host}${req.originalUrl}`, // Include full URL with query params
        },
      },
      server,
      undefined,
      paywall
    );
    return originalMiddleware(req, res, next);
  }
  next();
});

const port = process.env.PORT || 3000;
const mnemonic = process.env.MNEMONIC;

if (!mnemonic) {
  throw new Error("MNEMONIC environment variable is not set");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/gm", async (req: Request, res: Response) => {
  try {
    if (!mnemonic) {
      return res
        .status(500)
        .json({ error: "MNEMONIC environment variable is not set" });
    }

    const account = mnemonicToAccount(mnemonic);
    const timestamp = Date.now();
    const message = `gm${timestamp}`;
    const signature = await account.signMessage({ message });

    res.json({
      address: account.address,
      timestamp: timestamp,
      message: message,
      signature: signature,
    });
  } catch (error) {
    console.error("Error in /gm route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/gm/verify", async (req: Request, res: Response) => {
  try {
    const { address, message, signature } = req.body || {};

    if (!address || !message || !signature) {
      return res.status(400).json({
        error: "Missing required fields: address, message, and signature",
      });
    }

    const account = mnemonicToAccount(mnemonic);
    if (!account) {
      return res.status(400).json({ error: "Invalid mnemonic" });
    }

    if (account.address.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: "Invalid address" });
    }

    const isValid = await verifyMessage({ address, message, signature });

    res.json({ isValid });
  } catch (error) {
    console.error("Error in /gm/verify route:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as Error).message,
    });
  }
});

app.get("/image", async (req: Request, res: Response) => {
  try {
    const idxParam = req.query.idx as string;

    if (!idxParam) {
      return res.status(400).json({
        error:
          "Missing required query parameter: idx (e.g., idx=1,2 or idx=1,2,3,4,5)",
      });
    }

    // Parse indices from query parameter (e.g., "1,2,3" -> [1, 2, 3])
    const indices = idxParam.split(",").map((i) => parseInt(i.trim(), 10));

    // Check for duplicates
    const uniqueIndices = [...new Set(indices)];
    if (uniqueIndices.length !== indices.length) {
      return res.status(400).json({
        error: "Duplicate indices are not allowed. Each index must be unique.",
      });
    }

    if (
      indices.length < 2 ||
      indices.length > 23 ||
      indices.some((i) => isNaN(i) || i < 0 || i > 23)
    ) {
      return res.status(400).json({
        error:
          "Invalid idx format. Expected 2-23 unique numbers in range 0-23 (e.g., idx=1,2 or idx=1,2,3,4,5)",
      });
    }

    // Split mnemonic into words
    const mnemonicWords = mnemonic.split(" ");

    // Check if indices are valid
    if (indices.some((idx) => idx >= mnemonicWords.length)) {
      return res.status(400).json({
        error: `Index out of range. Mnemonic has ${
          mnemonicWords.length
        } words (0-${mnemonicWords.length - 1})`,
      });
    }

    // Get words at specified indices
    const words = indices.map((idx) => mnemonicWords[idx]);

    // Generate image prompt
    const prompt = `generate image combining ${words.join(
      " and "
    )} with no text or words in the image`;

    // Generate image using OpenAI
    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
      tools: [{ type: "image_generation" }],
    });

    const imageData = response.output
      .filter((output) => output.type === "image_generation_call")
      .map((output) => output.result);

    if (imageData.length === 0 || !imageData[0]) {
      console.error(
        "[IMAGE] Failed to generate image - no image data returned"
      );
      return res.status(500).json({ error: "Failed to generate image" });
    }

    const imageBase64 = imageData[0];
    const imageBuffer = Buffer.from(imageBase64, "base64");

    console.log(`Image generated for indices: ${indices.join(", ")}`);

    // Return image as PNG
    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (error) {
    console.error("Error in /image route:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as Error).message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
