import AleoService from '@/services/aleo.class';

type Environment = 'production' | 'sandbox';

interface NetworkConfig {
  rpcUrl: string;
  contractAddress: string;
}

const NETWORK_CONFIGS: Record<Environment, NetworkConfig> = {
  production: {
    rpcUrl: 'https://api.provable.com/v2/mainnet',
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // USDC on Aleo Mainnet
  },
  sandbox: {
    rpcUrl: 'https://api.provable.com/v2/testnet',
    contractAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // USDC on Aleo Testnet
  }
};

export interface WalletRepositoryInterface {
  createWallet(environment: Environment): Promise<{
    address: string;
    paraphrase: string;
    blockchain: string;
  }>;
  getBalance(
    address: string,
    environment: Environment
  ): Promise<{ name: string; balance: string; chainBalance: string }>;
  sendToken(
    paraphrase: string,
    recipientAddress: string,
    amount: string,
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
  async createWallet(environment: Environment): Promise<{
    address: string;
    paraphrase: string;
    blockchain: string;
  }> {
    const AleoService = this.getAleoService(environment);
    const wallet = await AleoService.createWallet();
    return {
      address: wallet.address,
      paraphrase: wallet.paraphrase,
      blockchain: wallet.blockchain
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
    paraphrase: string,
    recipientAddress: string,
    amount: string,
    environment: Environment
  ): Promise<void> {
    try {
      const AleoService = this.getAleoService(environment);
      const transaction = await AleoService.sendToken(
        paraphrase,
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
