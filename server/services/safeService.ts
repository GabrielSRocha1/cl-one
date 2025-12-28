import { ethers } from 'ethers';
import { getWeb3Service } from './web3Service';

/**
 * Configuração de Safe Factory por chain
 */
const SAFE_FACTORY_ADDRESSES: Record<number, string> = {
  1: '0xa6B71E26C5e0845f74c812102Ca7114b6a8ee132', // Ethereum
  137: '0xa6B71E26C5e0845f74c812102Ca7114b6a8ee132', // Polygon
  8453: '0xa6B71E26C5e0845f74c812102Ca7114b6a8ee132', // Base
  42161: '0xa6B71E26C5e0845f74c812102Ca7114b6a8ee132', // Arbitrum
  10: '0xa6B71E26C5e0845f74c812102Ca7114b6a8ee132', // Optimism
};

const SAFE_PROXY_FACTORY_ABI = [
  'function createProxyWithNonce(address _singleton, bytes initializer, uint256 _saltNonce) public returns (address proxy)',
];

const SAFE_ABI = [
  'function setup(address[] calldata _owners, uint256 _threshold, address to, bytes calldata data, address fallbackHandler, address paymentToken, uint256 payment, address payable paymentReceiver) external',
  'function getOwners() public view returns (address[] memory)',
  'function getThreshold() public view returns (uint256)',
  'function isOwner(address owner) public view returns (bool)',
  'function addOwnerWithThreshold(address owner, uint256 _threshold) public',
  'function removeOwner(address prevOwner, address owner, uint256 _threshold) public',
  'function execTransaction(address to, uint256 value, bytes calldata data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address payable refundReceiver, bytes memory signatures) public payable returns (bool success)',
];

interface SafeWalletConfig {
  owners: string[];
  threshold: number;
  chainId: number;
}

interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation: number;
}

/**
 * Safe Service - Gerencia Smart Wallets com Account Abstraction
 */
export class SafeService {
  private web3Service = getWeb3Service();

  /**
   * Calcula o endereço de uma Safe antes de criá-la
   */
  async predictSafeAddress(
    owners: string[],
    threshold: number,
    chainId: number,
    saltNonce: number = 0
  ): Promise<string | null> {
    const provider = this.web3Service.getProvider(chainId);
    if (!provider || !SAFE_FACTORY_ADDRESSES[chainId]) return null;

    try {
      const factoryAddress = SAFE_FACTORY_ADDRESSES[chainId];
      const factory = new ethers.Contract(factoryAddress, SAFE_PROXY_FACTORY_ABI, provider);

      // Implementação simplificada - em produção usar Safe SDK
      // Para agora, retornamos um endereço calculado
      const salt = ethers.solidityPacked(['uint256'], [saltNonce]);
      const hash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(['address[]', 'uint256', 'bytes'], [owners, threshold, salt])
      );

      return ethers.getAddress(hash.slice(0, 42));
    } catch (error) {
      console.error('Error predicting Safe address:', error);
      return null;
    }
  }

  /**
   * Obtém proprietários de uma Safe
   */
  async getSafeOwners(safeAddress: string, chainId: number): Promise<string[] | null> {
    const provider = this.web3Service.getProvider(chainId);
    if (!provider) return null;

    try {
      const safe = new ethers.Contract(safeAddress, SAFE_ABI, provider);
      const owners = await safe.getOwners();
      return owners;
    } catch (error) {
      console.error('Error fetching Safe owners:', error);
      return null;
    }
  }

  /**
   * Obtém threshold de uma Safe
   */
  async getSafeThreshold(safeAddress: string, chainId: number): Promise<number | null> {
    const provider = this.web3Service.getProvider(chainId);
    if (!provider) return null;

    try {
      const safe = new ethers.Contract(safeAddress, SAFE_ABI, provider);
      const threshold = await safe.getThreshold();
      return threshold.toNumber();
    } catch (error) {
      console.error('Error fetching Safe threshold:', error);
      return null;
    }
  }

  /**
   * Verifica se um endereço é proprietário de uma Safe
   */
  async isSafeOwner(safeAddress: string, ownerAddress: string, chainId: number): Promise<boolean> {
    const provider = this.web3Service.getProvider(chainId);
    if (!provider) return false;

    try {
      const safe = new ethers.Contract(safeAddress, SAFE_ABI, provider);
      return await safe.isOwner(ownerAddress);
    } catch (error) {
      console.error('Error checking Safe owner:', error);
      return false;
    }
  }

  /**
   * Valida configuração de Safe
   */
  validateSafeConfig(config: SafeWalletConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.owners || config.owners.length === 0) {
      errors.push('At least one owner is required');
    }

    if (config.threshold < 1 || config.threshold > (config.owners?.length || 0)) {
      errors.push('Threshold must be between 1 and number of owners');
    }

    config.owners?.forEach((owner, index) => {
      if (!this.web3Service.isValidAddress(owner)) {
        errors.push(`Invalid owner address at index ${index}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Codifica dados de inicialização para Safe
   */
  encodeSafeInitializer(owners: string[], threshold: number): string {
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    return abiCoder.encode(['address[]', 'uint256'], [owners, threshold]);
  }

  /**
   * Decodifica dados de inicialização de Safe
   */
  decodeSafeInitializer(data: string): { owners: string[]; threshold: number } | null {
    try {
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const [owners, threshold] = abiCoder.decode(['address[]', 'uint256'], data);
      return { owners, threshold: threshold.toNumber() };
    } catch (error) {
      console.error('Error decoding Safe initializer:', error);
      return null;
    }
  }

  /**
   * Calcula hash de uma transação Safe
   */
  calculateSafeTransactionHash(
    safeAddress: string,
    transaction: SafeTransaction,
    nonce: number,
    chainId: number
  ): string {
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const transactionHash = ethers.keccak256(
      abiCoder.encode(
        ['address', 'uint256', 'bytes', 'uint8', 'uint256', 'uint256', 'uint256', 'address', 'address', 'uint256'],
        [
          safeAddress,
          transaction.value,
          transaction.data,
          transaction.operation,
          0, // safeTxGas
          0, // baseGas
          0, // gasPrice
          ethers.ZeroAddress, // gasToken
          ethers.ZeroAddress, // refundReceiver
          nonce,
        ]
      )
    );

    return transactionHash;
  }

  /**
   * Valida assinatura de transação Safe
   */
  validateSignature(
    safeAddress: string,
    transactionHash: string,
    signature: string,
    signer: string
  ): boolean {
    try {
      const recovered = ethers.recoverAddress(transactionHash, signature);
      return recovered.toLowerCase() === signer.toLowerCase();
    } catch (error) {
      console.error('Error validating signature:', error);
      return false;
    }
  }

  /**
   * Obtém informações completas de uma Safe
   */
  async getSafeInfo(safeAddress: string, chainId: number) {
    const provider = this.web3Service.getProvider(chainId);
    if (!provider) return null;

    try {
      const owners = await this.getSafeOwners(safeAddress, chainId);
      const threshold = await this.getSafeThreshold(safeAddress, chainId);
      const balance = await this.web3Service.getNativeBalance(safeAddress, chainId);

      return {
        address: safeAddress,
        owners,
        threshold,
        balance,
        chainId,
      };
    } catch (error) {
      console.error('Error fetching Safe info:', error);
      return null;
    }
  }
}

// Singleton instance
let safeService: SafeService | null = null;

export function getSafeService(): SafeService {
  if (!safeService) {
    safeService = new SafeService();
  }
  return safeService;
}
