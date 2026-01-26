
// import { v4 as uuidv4 } from 'uuid';
import { AES, enc } from 'crypto-js';
 import {
  Account,
  AleoNetworkClient,
  initThreadPool,
  NetworkRecordProvider,
  ProgramManager,
  AleoKeyProvider,
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
    await initThreadPool();
    const account = new Account();
    return {
      address: account.address().to_string(),
      privateKey: account.privateKey().to_string(),
      viewKey: account.viewKey().to_string(),
      blockchain: 'Aleo'
    };
  }

  async getBalance(
    address: string
   ): Promise<{ name: string; balance: string; chainBalance: string }> {
    const networkClient = new AleoNetworkClient(this.rpcUrl);

    // Get public balance
    const publicBalance = BigInt(
      (
        await networkClient.getProgramMappingValue(
          'credits.aleo',
          'account',
          address
        )
      )?.replace('u64.public', '') ?? '0'
    );

    // Get private balance from records
    // const keyProvider = new AleoKeyProvider();
    // keyProvider.useCache(true);
    // const account = new Account({
    //   privateKey: new PrivateKey().to_string(), // Temporary private key, not used for record fetching with view key
    //   viewKey,
    //   address,
    // });
    // const recordProvider = new NetworkRecordProvider(account, networkClient);
    // await recordProvider.findRecords();
    // const records = recordProvider.getRecords();
    // let privateBalance = 0n;
    // for (const record of records) {
    //     const recordPlaintext = RecordPlaintext.from_ciphertext(record);
    //     if (recordPlaintext.program_id() === 'credits.aleo' && !recordPlaintext.is_spent()) {
    //         const microcredits = recordPlaintext.microcredits();
    //         if (microcredits) {
    //             privateBalance += microcredits;
    //         }
    //     }
    // }


    const totalBalance = publicBalance;

    return {
      name: 'Aleo',
      balance: totalBalance.toString(),
      chainBalance: totalBalance.toString()
    };
  }

  async sendToken(
    privateKey: string,
    recipientAddress: string,
    amount: number,
    fee: number,
  ): Promise<any> {
    // If the threadpool has not been initialized, do so (this step can be skipped if it's been initialized elsewhere).
    await initThreadPool();

    const account = new Account({ privateKey });
    const networkClient = new AleoNetworkClient(this.rpcUrl);

    const keyProvider = new AleoKeyProvider();
    keyProvider.useCache(true);

    const recordProvider = new NetworkRecordProvider(account, networkClient);

    const programManager = new ProgramManager(
      this.rpcUrl,
      keyProvider,
      recordProvider
    );
    programManager.setAccount(account);

    const tx_id = await programManager.transfer(
      amount,
      recipientAddress,
      'public',
      fee, // Fee is optional, SDK will estimate if not provided
      false
    );

    const transaction = await programManager.networkClient.getTransaction(
      tx_id
    );

    return {
      transactionId: tx_id,
      transaction,
    };
  }
}

export default AleoService;
