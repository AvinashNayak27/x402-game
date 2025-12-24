import { mnemonicToAccount } from "viem/accounts";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { verifyMessage } from "viem/utils";

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const mnemonic = process.env.MNEMONIC;

if (!mnemonic) {
  throw new Error("MNEMONIC environment variable is not set");
}

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
