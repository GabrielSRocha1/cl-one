import { ethers } from 'ethers';
import { createPublicClient, http, Chain } from 'viem';
import * as chains from 'viem/chains';

/**
 * Configuração de chains suportadas com seus respectivos RPC providers
 */
const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', rpc: 'https://eth-mainnet.g.alchemy.com/v2/', chainId: 1 },
  137: { name: 'Polygon', rpc: 'https://polygon-mainnet.g.alchemy.com/v2/', chainId: 137 },
  8453: { name: 'Base', rpc: 'https://base-mainnet.g.alchemy.com/v2/', chainId: 8453 },
  42161: { name: 'Arbitrum', rpc: 'https://arb-mainnet.g.alchemy.com/v2/', chainId: 42161 },
  10: { name: 'Optimism', rpc: 'https://opt-mainnet.g.alchemy.com/v2/', chainId: 10 },
  42220: { name: 'Celo', rpc: 'https://celo-mainnet.g.alchemy.com/v2/', chainId: 42220 },
  100: { name: 'Gnosis', rpc: 'https://gnosis-mainnet.g.alchemy.com/v2/', chainId: 100 },
};

interface TokenBalance {
  address: string;
  symbol: string;
  balance: string;
  decimals: number;
}

interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  status: 'success' | 'failed' | 'pending';
  blockNumber: number;
  timestamp: number;
}

/**
 * Web3 Service - Gerencia interações com blockchain
 */
export class Web3Service {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private alchemyApiKey: string;

  constructor(alchemyApiKey: string) {
    this.alchemyApiKey = alchemyApiKey;
    this.initializeProviders();
  }

  /**
   * Inicializa providers para todas as chains suportadas
   */
  private initializeProviders() {
    Object.entries(SUPPORTED_CHAINS).forEach(([chainId, config]) => {
      const rpcUrl = `${config.rpc}${this.alchemyApiKey}`;
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      this.providers.set(parseInt(chainId), provider);
    });
  }

  /**
   * Obtém provider para uma chain específica
   */
  getProvider(chainId: number): ethers.JsonRpcProvider | null {
    return this.providers.get(chainId) || null;
  }

  /**
   * Obtém saldo de um token específico
   */
  async getTokenBalance(
    walletAddress: string,
    tokenAddress: string,
    chainId: number
  ): Promise<TokenBalance | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)', 'function symbol() view returns (string)'],
        provider
      );

      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals(),
        contract.symbol(),
      ]);

      return {
        address: tokenAddress,
        symbol,
        balance: balance.toString(),
        decimals,
      };
    } catch (error) {
      console.error(`Error fetching token balance for ${tokenAddress}:`, error);
      return null;
    }
  }

  /**
   * Obtém saldo nativo (ETH, MATIC, etc)
   */
  async getNativeBalance(walletAddress: string, chainId: number): Promise<string | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      const balance = await provider.getBalance(walletAddress);
      return balance.toString();
    } catch (error) {
      console.error(`Error fetching native balance:`, error);
      return null;
    }
  }

  /**
   * Obtém histórico de transações
   */
  async getTransactionHistory(
    walletAddress: string,
    chainId: number,
    limit: number = 50
  ): Promise<TransactionData[]> {
    const provider = this.getProvider(chainId);
    if (!provider) return [];

    try {
      const blockNumber = await provider.getBlockNumber();
      const transactions: TransactionData[] = [];

      // Busca transações dos últimos blocos
      for (let i = 0; i < Math.min(limit, 100); i++) {
        const block = await provider.getBlock(blockNumber - i);
        if (!block) continue;

        for (const txHash of block.transactions) {
          const tx = await provider.getTransaction(txHash);
          const receipt = await provider.getTransactionReceipt(txHash);

          if (tx && (tx.from === walletAddress || tx.to === walletAddress)) {
            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to || '',
              value: tx.value.toString(),
              status: receipt?.status === 1 ? 'success' : 'failed',
              blockNumber: block.number,
              timestamp: block.timestamp,
            });
          }
        }

        if (transactions.length >= limit) break;
      }

      return transactions.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching transaction history:`, error);
      return [];
    }
  }

  /**
   * Valida um endereço Ethereum
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Converte endereço para checksum
   */
  toChecksumAddress(address: string): string {
    return ethers.getAddress(address);
  }

  /**
   * Obtém informações de uma transação
   */
  async getTransactionDetails(txHash: string, chainId: number): Promise<TransactionData | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!tx) return null;

      const block = tx.blockNumber ? await provider.getBlock(tx.blockNumber) : null;

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: tx.value.toString(),
        status: receipt?.status === 1 ? 'success' : receipt?.status === 0 ? 'failed' : 'pending',
        blockNumber: tx.blockNumber || 0,
        timestamp: block?.timestamp || 0,
      };
    } catch (error) {
      console.error(`Error fetching transaction details:`, error);
      return null;
    }
  }

  /**
   * Obtém preço de gás atual
   */
  async getGasPrice(chainId: number): Promise<{ standard: string; fast: string; instant: string } | null> {
    const provider = this.getProvider(chainId);
    if (!provider) return null;

    try {
      const feeData = await provider.getFeeData();
      return {
        standard: feeData.gasPrice?.toString() || '0',
        fast: (feeData.gasPrice ? feeData.gasPrice * BigInt(2) : BigInt(0)).toString(),
        instant: (feeData.gasPrice ? feeData.gasPrice * BigInt(3) : BigInt(0)).toString(),
      };
    } catch (error) {
      console.error(`Error fetching gas price:`, error);
      return null;
    }
  }

  /**
   * Obtém lista de chains suportadas
   */
  getSupportedChains() {
    return Object.values(SUPPORTED_CHAINS).map((chain) => ({
      chainId: chain.chainId,
      name: chain.name,
    }));
  }

  /**
   * Verifica se uma chain é suportada
   */
  isChainSupported(chainId: number): boolean {
    return chainId in SUPPORTED_CHAINS;
  }
}

// Singleton instance
let web3Service: Web3Service | null = null;

export function getWeb3Service(): Web3Service {
  if (!web3Service) {
    const alchemyApiKey = process.env.ALCHEMY_API_KEY || '';
    web3Service = new Web3Service(alchemyApiKey);
  }
  return web3Service;
}
