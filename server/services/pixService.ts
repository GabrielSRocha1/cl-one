import { randomBytes } from 'crypto';

interface PIXKeyConfig {
  type: 'cpf' | 'email' | 'phone' | 'random';
  value?: string;
}

interface PIXQRCode {
  qrCode: string;
  qrCodeUrl: string;
  brCode: string;
  expiresAt: number;
  amount: string;
  recipient: string;
}

interface PIXTransaction {
  id: string;
  amount: string;
  recipient: string;
  payer: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: number;
  confirmedAt?: number;
}

/**
 * PIX Service - Gerencia transações PIX
 */
export class PIXService {
  private bankProvider: string;
  private apiKey: string;

  constructor(bankProvider: string = 'default', apiKey: string = '') {
    this.bankProvider = bankProvider;
    this.apiKey = apiKey;
  }

  /**
   * Gera QR Code dinâmico para PIX
   */
  async generateQRCode(
    amount: string,
    recipient: string,
    description?: string,
    expiresInSeconds: number = 3600
  ): Promise<PIXQRCode | null> {
    try {
      // Em produção, integrar com API de banco real
      // Para agora, simulamos a geração

      const transactionId = this.generateTransactionId();
      const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

      // Simular BR Code (Brcode é o padrão PIX)
      const brCode = this.generateBRCode(amount, recipient, transactionId);

      // Simular QR Code (em produção, usar biblioteca como 'qrcode')
      const qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;

      return {
        qrCode,
        qrCodeUrl: qrCode,
        brCode,
        expiresAt,
        amount,
        recipient,
      };
    } catch (error) {
      console.error('Error generating PIX QR Code:', error);
      return null;
    }
  }

  /**
   * Valida chave PIX
   */
  validatePIXKey(key: string, type: 'cpf' | 'email' | 'phone' | 'random'): boolean {
    switch (type) {
      case 'cpf':
        return this.validateCPF(key);
      case 'email':
        return this.validateEmail(key);
      case 'phone':
        return this.validatePhone(key);
      case 'random':
        return this.validateRandomKey(key);
      default:
        return false;
    }
  }

  /**
   * Valida CPF
   */
  private validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    const firstDigit = 11 - (sum % 11);
    if (firstDigit !== parseInt(cleanCPF[9])) return false;

    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    const secondDigit = 11 - (sum % 11);
    if (secondDigit !== parseInt(cleanCPF[10])) return false;

    return true;
  }

  /**
   * Valida email
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida telefone
   */
  private validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  /**
   * Valida chave aleatória (UUID)
   */
  private validateRandomKey(key: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(key);
  }

  /**
   * Gera chave PIX aleatória (UUID)
   */
  generateRandomPIXKey(): string {
    const bytes = randomBytes(16);
    return [
      bytes.slice(0, 4).toString('hex'),
      bytes.slice(4, 6).toString('hex'),
      bytes.slice(6, 8).toString('hex'),
      bytes.slice(8, 10).toString('hex'),
      bytes.slice(10, 16).toString('hex'),
    ].join('-');
  }

  /**
   * Gera ID de transação único
   */
  private generateTransactionId(): string {
    return `PIX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera BR Code (simulado)
   */
  private generateBRCode(amount: string, recipient: string, transactionId: string): string {
    // BR Code é um padrão específico do PIX
    // Formato simplificado para demonstração
    return `00020126580014br.gov.bcb.brcode01051.0.0${amount}${recipient}${transactionId}`;
  }

  /**
   * Valida BR Code
   */
  validateBRCode(brCode: string): boolean {
    // Validação básica de formato
    return brCode.startsWith('00020126') && brCode.length > 50;
  }

  /**
   * Obtém informações de transação PIX
   */
  async getPIXTransactionInfo(transactionId: string): Promise<PIXTransaction | null> {
    try {
      // Em produção, consultar banco de dados ou API de banco
      // Para agora, retornamos simulado
      return {
        id: transactionId,
        amount: '100.00',
        recipient: 'user@example.com',
        payer: 'payer@example.com',
        status: 'pending',
        createdAt: Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      console.error('Error getting PIX transaction info:', error);
      return null;
    }
  }

  /**
   * Confirma transação PIX
   */
  async confirmPIXTransaction(transactionId: string): Promise<boolean> {
    try {
      // Em produção, integrar com API de banco
      console.log(`Confirming PIX transaction: ${transactionId}`);
      return true;
    } catch (error) {
      console.error('Error confirming PIX transaction:', error);
      return false;
    }
  }

  /**
   * Calcula taxa de PIX
   */
  calculatePIXFee(amount: string): string {
    // PIX não tem taxa padrão, mas alguns bancos cobram
    // Retornamos 0 por padrão
    return '0';
  }

  /**
   * Valida limite de transação
   */
  validateTransactionLimit(amount: string, kycLevel: 'NONE' | 'BASIC' | 'ADVANCED' | 'FULL'): boolean {
    const amountNum = parseFloat(amount);

    const limits: Record<string, number> = {
      NONE: 0,
      BASIC: 1000, // R$ 1.000
      ADVANCED: 10000, // R$ 10.000
      FULL: 100000, // R$ 100.000
    };

    return amountNum <= (limits[kycLevel] || 0);
  }

  /**
   * Formata valor para PIX
   */
  formatPIXAmount(amount: string): string {
    // PIX usa formato com 2 casas decimais
    const num = parseFloat(amount);
    return num.toFixed(2);
  }

  /**
   * Converte valor de cripto para fiat (simulado)
   */
  async convertCryptoToFiat(cryptoAmount: string, cryptoSymbol: string, fiatCurrency: string = 'BRL'): Promise<string | null> {
    try {
      // Em produção, consultar API de preços
      // Para agora, simulamos conversão
      const rate = 5.0; // 1 token = R$ 5.00
      const fiatAmount = (parseFloat(cryptoAmount) * rate).toFixed(2);
      return fiatAmount;
    } catch (error) {
      console.error('Error converting crypto to fiat:', error);
      return null;
    }
  }

  /**
   * Converte valor de fiat para cripto (simulado)
   */
  async convertFiatToCrypto(fiatAmount: string, cryptoSymbol: string, fiatCurrency: string = 'BRL'): Promise<string | null> {
    try {
      // Em produção, consultar API de preços
      // Para agora, simulamos conversão
      const rate = 0.2; // R$ 5.00 = 1 token
      const cryptoAmount = (parseFloat(fiatAmount) * rate).toFixed(18);
      return cryptoAmount;
    } catch (error) {
      console.error('Error converting fiat to crypto:', error);
      return null;
    }
  }
}

// Singleton instance
let pixService: PIXService | null = null;

export function getPIXService(): PIXService {
  if (!pixService) {
    const bankProvider = process.env.PIX_BANK_PROVIDER || 'default';
    const apiKey = process.env.PIX_API_KEY || '';
    pixService = new PIXService(bankProvider, apiKey);
  }
  return pixService;
}
