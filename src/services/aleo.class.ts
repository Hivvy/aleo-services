
import { v4 as uuidv4 } from 'uuid';
import { AES, enc } from 'crypto-js';
 import {
  Account,
  PrivateKey,
  AleoNetworkClient,
  initThreadPool,
  NetworkRecordProvider,
  ProgramManager,
  AleoKeyProvider
} from '@provablehq/sdk';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-bytes-long';

class AleoService {
  private rpcUrl: string;
  private contractAddress: string;
//   account = new Account();

  constructor(rpcUrl: string, contractAddress: string) {
    this.rpcUrl = rpcUrl;
    this.contractAddress = contractAddress;
  }

  private encrypt(text: string): string {
    return AES.encrypt(text, ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedText: string): string {
    const bytes = AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(enc.Utf8);
  }

  async createWallet(): Promise<{
    address: string;
    privateKey: string;
    blockchain: string;
    viewKey: string;
    computeKey: string;
  }> {
   const password = 'password';
   const ciphertext = PrivateKey.newEncrypted(password);
   const account = Account.fromCiphertext(ciphertext, password);
    return {
      address: account.address(),
      privateKey: ciphertext,
      viewKey: account.viewKey(),
      computeKey: account.computeKey(),
      blockchain: 'Aleo'
    };
  }

  async getBalance(
    address: string
  ): Promise<{ name: string; balance: string; chainBalance: string }> {
    const networkClient = new AleoNetworkClient(this.rpcUrl);
     const public_balance = await networkClient.getProgramMappingValue(
      'credits.aleo',
      'account',
      address
    );
    return {
      name: 'Aleo',
      balance: public_balance, // Placeholder
      chainBalance: public_balance // Placeholder
    };
  }

  async sendToken(
    privateKey: string,
    recipientAddress: string,
    amount: string
  ): Promise<any> {
    // In a real implementation, you'd use the Aleo SDK to create and broadcast a transaction
    console.log(
      `Sending ${amount} to ${recipientAddress} from wallet with privateKey ${privateKey}`
    );
    const transactionId = `txn_${uuidv4()}`;
    return {
      transactionId
    };
  }
}

export default AleoService;
