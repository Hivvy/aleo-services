import express, { Request, Response } from 'express';
import { z } from 'zod';
import AleoService from '@/services/aleo.class';

// --- Zod Schemas for Validation ---

const CreateWalletSchema = z.object({
  userId: z.string(),
  network: z.enum(['testnet', 'mainnet']),
});

const TransferSchema = z.object({
  fromUserId: z.string(),
  toAddress: z.string(),
  amount: z.number(),
  network: z.enum(['testnet', 'mainnet']),
  fee: z.number().optional(),
});

const WebhookRegisterSchema = z.object({
  endpointUrl: z.string().url(),
  eventTypes: z.array(z.string()),
});


const router = express.Router();
const aleoServiceSandbox = new AleoService('https://api.provable.com/v2/testnet', '0x036CbD53842c5426634e7929541eC2318f3dCF7e');
const aleoServiceMainnet = new AleoService('https://api.provable.com/v2/mainnet', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');

const getAleoService = (network: 'testnet' | 'mainnet') => {
    return network === 'mainnet' ? aleoServiceMainnet : aleoServiceSandbox;
}


// --- API Endpoints ---

// Wallet Management
router.post('/create-wallet', async (req: Request, res: Response) => {
  const body = req.body;
  const validation = CreateWalletSchema.safeParse(body);

  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid input', details: validation.error.errors });
  }

  const { userId, network } = validation.data;
  const aleoService = getAleoService(network);
  const wallet = await aleoService.createWallet();


  return res.json({
    message: 'Wallet created successfully',
    wallet: {
      ...wallet,
      userId,
      network,
    },
  });
});

router.get('/balance/:network/:address', async (req: Request, res: Response) => {
    const { network, address } = req.params;
    if (network !== 'testnet' && network !== 'mainnet') {
        return res.status(400).json({ error: 'Invalid network' });
    }
    const aleoService = getAleoService(network);
    const balance = await aleoService.getBalance(address);
    return res.json(balance);
});

// --- Transactions & Balance ---

router.post('/transfer', async (req: Request, res: Response) => {
  const body = req.body;
  const validation = TransferSchema.safeParse(body);

  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid input', details: validation.error.errors });
  }

  const { fromUserId, toAddress, amount, network } = validation.data;

  // We need to get the paraphrase from the user's wallet.
  // This is a placeholder, as we are not storing the wallet in the db yet.
  const paraphrase = "placeholder_paraphrase";

  const aleoService = getAleoService(network);
  const transaction = await aleoService.sendToken(
    paraphrase,
    toAddress,
    amount,
    fee
  );


  return res.json({ message: 'Transfer successful', transaction });
});

export default router;