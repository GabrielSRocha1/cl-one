import { ethers } from 'ethers';
import { getWeb3Service } from './web3Service';

/**
 * Configuração de Uniswap Router por chain
 */
const UNISWAP_ROUTER_ADDRESSES: Record<number, string> = {
  1: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Ethereum
  137: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Polygon
  8453: '0x2626664c2603336E57B271c5C0b26F421741e481', // Base
  42161: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Arbitrum
  10: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Optimism
};

const UNISWAP_ROUTER_ABI = [
  'function exactInputSingle((bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum) params) external payable returns (uint256 amountOut)',
  'function exactOutputSingle((bytes path, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum) params) external payable returns (uint256 amountIn)',
  'function multicall(uint256 deadline, bytes[] calldata data) public payable returns (bytes[] memory results)',
];

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function balanceOf(address account) public view returns (uint256)',
];

interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  recipient: string;
  deadline: number;
  fee?: number; // Uniswap fee tier (500, 3000, 10000)
}

interface SwapQuote {
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  fee: number;
  route: string[];
}

/**
 * Uniswap Service - Gerencia operações de swap
 */
export class UniswapService {
  private web3Service = getWeb3Service();

  /**
   * Obtém cotação de swap
   */
  async getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    chainId: number
  ): Promise<SwapQuote | null> {
    try {
      // Em produção, usar Uniswap SDK ou GraphQL
      // Para agora, retornamos uma cotação simulada
      const amountOut = (BigInt(amountIn) * BigInt(99)) / BigInt(100); // 1% slippage

      return {
        amountIn,
        amountOut: amountOut.toString(),
        priceImpact: 0.01,
        fee: 3000, // 0.3%
        route: [tokenIn, tokenOut],
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      return null;
    }
  }

  /**
   * Valida parâmetros de swap
   */
  validateSwapParams(params: SwapParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.web3Service.isValidAddress(params.tokenIn)) {
      errors.push('Invalid tokenIn address');
    }

    if (!this.web3Service.isValidAddress(params.tokenOut)) {
      errors.push('Invalid tokenOut address');
    }

    if (!this.web3Service.isValidAddress(params.recipient)) {
      errors.push('Invalid recipient address');
    }

    if (BigInt(params.amountIn) === BigInt(0)) {
      errors.push('Amount in must be greater than 0');
    }

    if (BigInt(params.minAmountOut) === BigInt(0)) {
      errors.push('Minimum amount out must be greater than 0');
    }

    if (params.deadline < Math.floor(Date.now() / 1000)) {
      errors.push('Deadline must be in the future');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Codifica path de swap para Uniswap V3
   */
  encodeSwapPath(tokenIn: string, tokenOut: string, fee: number = 3000): string {
    // Uniswap V3 path encoding: tokenIn (20 bytes) + fee (3 bytes) + tokenOut (20 bytes)
    const path = ethers.solidityPacked(
      ['address', 'uint24', 'address'],
      [tokenIn, fee, tokenOut]
    );
    return path;
  }

  /**
   * Decodifica path de swap
   */
  decodeSwapPath(path: string): { tokenIn: string; tokenOut: string; fee: number } | null {
    try {
      // Remove '0x' prefix
      const hex = path.slice(2);

      // Extract tokenIn (40 hex chars = 20 bytes)
      const tokenIn = '0x' + hex.slice(0, 40);

      // Extract fee (6 hex chars = 3 bytes)
      const fee = parseInt(hex.slice(40, 46), 16);

      // Extract tokenOut (40 hex chars = 20 bytes)
      const tokenOut = '0x' + hex.slice(46, 86);

      return {
        tokenIn: ethers.getAddress(tokenIn),
        tokenOut: ethers.getAddress(tokenOut),
        fee,
      };
    } catch (error) {
      console.error('Error decoding swap path:', error);
      return null;
    }
  }

  /**
   * Calcula slippage
   */
  calculateSlippage(amountOut: string, minAmountOut: string): number {
    const out = BigInt(amountOut);
    const min = BigInt(minAmountOut);

    if (out === BigInt(0)) return 0;

    const slippage = ((out - min) * BigInt(10000)) / out;
    return Number(slippage) / 100; // Retorna em percentual
  }

  /**
   * Obtém saldo de token
   */
  async getTokenBalance(
    walletAddress: string,
    tokenAddress: string,
    chainId: number
  ): Promise<string | null> {
    const provider = this.web3Service.getProvider(chainId);
    if (!provider) return null;

    try {
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await token.balanceOf(walletAddress);
      return balance.toString();
    } catch (error) {
      console.error('Error getting token balance:', error);
      return null;
    }
  }

  /**
   * Verifica allowance de token
   */
  async getTokenAllowance(
    walletAddress: string,
    tokenAddress: string,
    spenderAddress: string,
    chainId: number
  ): Promise<string | null> {
    const provider = this.web3Service.getProvider(chainId);
    if (!provider) return null;

    try {
      const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const allowance = await token.allowance(walletAddress, spenderAddress);
      return allowance.toString();
    } catch (error) {
      console.error('Error getting token allowance:', error);
      return null;
    }
  }

  /**
   * Codifica dados de transação de approve
   */
  encodeApproveData(tokenAddress: string, spenderAddress: string, amount: string): string {
    const iface = new ethers.Interface(ERC20_ABI);
    return iface.encodeFunctionData('approve', [spenderAddress, amount]);
  }

  /**
   * Codifica dados de transação de swap
   */
  encodeSwapData(params: SwapParams): string {
    const path = this.encodeSwapPath(params.tokenIn, params.tokenOut, params.fee || 3000);

    const iface = new ethers.Interface(UNISWAP_ROUTER_ABI);
    return iface.encodeFunctionData('exactInputSingle', [
      {
        path,
        recipient: params.recipient,
        deadline: params.deadline,
        amountIn: params.amountIn,
        amountOutMinimum: params.minAmountOut,
      },
    ]);
  }

  /**
   * Obtém endereço do router Uniswap
   */
  getRouterAddress(chainId: number): string | null {
    return UNISWAP_ROUTER_ADDRESSES[chainId] || null;
  }

  /**
   * Valida se o router está disponível na chain
   */
  isRouterAvailable(chainId: number): boolean {
    return chainId in UNISWAP_ROUTER_ADDRESSES;
  }
}

// Singleton instance
let uniswapService: UniswapService | null = null;

export function getUniswapService(): UniswapService {
  if (!uniswapService) {
    uniswapService = new UniswapService();
  }
  return uniswapService;
}
