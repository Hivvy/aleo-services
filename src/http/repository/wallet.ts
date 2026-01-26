import AleoService from '@/services/aleo.class';

type Environment = 'production' | 'sandbox';

interface NetworkConfig {
  rpcUrl: string;
  contractAddress: string;
}

const NETWORK_CONFIGS: Record<Environment, NetworkConfig> = {
  production: {
    rpcUrl: 'https://api.provable.com/v2/mainnet',
    contractAddress:
      '6088188135219746443092391282916151282477828391085949070550825603498725268775field' // USDC on Aleo Mainnet
  },
  sandbox: {
    rpcUrl: 'https://api.provable.com/v2/testnet',
    contractAddress:
      '6088188135219746443092391282916151282477828391085949070550825603498725268775field' // USDC on Aleo Testnet
  }
};

export interface WalletRepositoryInterface {
  createWallet(environment: Environment): Promise<any>;
  getBalance(
    address: string,
    environment: Environment
  ): Promise<{ name: string; balance: string; chainBalance: string }>;
  sendToken(
    privateKey: string,
    recipientAddress: string,
    amount: number,
    environment: Environment
  ): Promise<any>;
}

class WalletRepository implements WalletRepositoryInterface {
  private AleoServices: Map<Environment, AleoService> = new Map();

  constructor() {
    // Initialize AleoService instances for each environment
    Object.entries(NETWORK_CONFIGS).forEach(([env, config]) => {
      this.AleoServices.set(
        env as Environment,
        new AleoService(config.rpcUrl, config.contractAddress)
      );
    });
  }

  private getAleoService(environment: Environment): AleoService {
    const service = this.AleoServices.get(environment);
    if (!service) {
      throw new Error(`Unsupported environment: ${environment}`);
    }
    return service;
  }
  async createWallet(environment: Environment){
    const AleoService = this.getAleoService(environment);
    const wallet = await AleoService.createWallet();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      blockchain: wallet.blockchain,
      computeKey: wallet.computeKey,
      viewKey: wallet.viewKey
    };
  }

  async getBalance(
    address: string,
    environment: Environment
  ): Promise<{ name: string; balance: string; chainBalance: string }> {
    const AleoService = this.getAleoService(environment);
    const balance = await AleoService.getBalance(address);
    return {
      name: balance.name,
      balance: balance.balance,
      chainBalance: balance.chainBalance
    };
  }

  async sendToken(
    privateKey: string,
    recipientAddress: string,
    amount: number,
    environment: Environment
  ): Promise<void> {
    try {
      const AleoService = this.getAleoService(environment);
      const transaction = await AleoService.sendToken(
        privateKey,
        recipientAddress,
        amount
      );
      return transaction;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default new WalletRepository();
