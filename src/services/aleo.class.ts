
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

  async createWallet() {
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
    amount: number
  ): Promise<any> {
             // If the threadpool has not been initialized, do so (this step can be skipped if it's been initialized elsewhere). 
        await initThreadPool();

        const account = new Account({ privateKey});
        const networkClient = new AleoNetworkClient(this.rpcUrl);

        const keyProvider = new AleoKeyProvider();
        keyProvider.useCache(true);

        const recordProvider = new NetworkRecordProvider(account, networkClient);

        const programManager = new ProgramManager(this.rpcUrl, keyProvider, recordProvider);
        programManager.setAccount(account);

        const tx_id = await programManager.transfer(
          1,
          recipientAddress,
          'transfer_public',
          amount,
          false
        );

        const transactionId = await programManager.networkClient.getTransaction(tx_id);

    return {
      transactionId
    };
  }
}

export default AleoService;
