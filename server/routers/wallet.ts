import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { wallets, tokens, balances, InsertWallet } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { getWeb3Service } from '../services/web3Service';
import { getSafeService } from '../services/safeService';

const web3Service = getWeb3Service();
const safeService = getSafeService();

export const walletRouter = router({
  /**
   * Cria uma nova Smart Wallet para o usuário em uma chain específica
   */
  createWallet: protectedProcedure
    .input(
      z.object({
        chainId: z.number().int().positive(),
        owners: z.array(z.string()).min(1),
        threshold: z.number().int().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Validar configuração de Safe
      const validation = safeService.validateSafeConfig({
        owners: input.owners,
        threshold: input.threshold,
        chainId: input.chainId,
      });

      if (!validation.valid) {
        throw new Error(`Invalid Safe configuration: ${validation.errors.join(', ')}`);
      }

      // Validar se chain é suportada
      if (!web3Service.isChainSupported(input.chainId)) {
        throw new Error(`Chain ${input.chainId} is not supported`);
      }

      try {
        // Prever endereço da Safe
        const predictedAddress = await safeService.predictSafeAddress(
          input.owners,
          input.threshold,
          input.chainId
        );

        if (!predictedAddress) {
          throw new Error('Failed to predict Safe address');
        }

        // Salvar wallet no banco de dados
        const wallet: InsertWallet = {
          userId: ctx.user.id,
          address: predictedAddress,
          chainId: input.chainId,
          safeAddress: predictedAddress,
          owners: JSON.stringify(input.owners),
          threshold: input.threshold,
          isActive: 1,
        };

        await db.insert(wallets).values(wallet);

        return {
          id: 0,
          address: predictedAddress,
          chainId: input.chainId,
          owners: input.owners,
          threshold: input.threshold,
        };
      } catch (error) {
        console.error('Error creating wallet:', error);
        throw error;
      }
    }),

  /**
   * Obtém todas as carteiras do usuário
   */
  listWallets: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    try {
      const userWallets = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, ctx.user.id));

      return userWallets.map((wallet) => ({
        id: wallet.id,
        address: wallet.address,
        chainId: wallet.chainId,
        owners: JSON.parse(wallet.owners),
        threshold: wallet.threshold,
        isActive: wallet.isActive === 1,
        createdAt: wallet.createdAt,
      }));
    } catch (error) {
      console.error('Error listing wallets:', error);
      throw error;
    }
  }),

  /**
   * Obtém detalhes de uma carteira específica
   */
  getWallet: protectedProcedure
    .input(z.object({ walletId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      try {
        const wallet = await db
          .select()
          .from(wallets)
          .where(and(eq(wallets.id, input.walletId), eq(wallets.userId, ctx.user.id)))
          .limit(1);

        if (wallet.length === 0) {
          throw new Error('Wallet not found');
        }

        const w = wallet[0];
        const safeInfo = await safeService.getSafeInfo(w.address, w.chainId);

        return {
          id: w.id,
          address: w.address,
          chainId: w.chainId,
          owners: JSON.parse(w.owners),
          threshold: w.threshold,
          isActive: w.isActive === 1,
          balance: safeInfo?.balance,
          createdAt: w.createdAt,
        };
      } catch (error) {
        console.error('Error getting wallet:', error);
        throw error;
      }
    }),

  /**
   * Obtém saldo de um token específico em uma carteira
   */
  getTokenBalance: protectedProcedure
    .input(
      z.object({
        walletId: z.number().int(),
        tokenId: z.number().int(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      try {
        // Verificar se wallet pertence ao usuário
        const wallet = await db
          .select()
          .from(wallets)
          .where(and(eq(wallets.id, input.walletId), eq(wallets.userId, ctx.user.id)))
          .limit(1);

        if (wallet.length === 0) {
          throw new Error('Wallet not found');
        }

        const w = wallet[0];

        // Obter token
        const token = await db.select().from(tokens).where(eq(tokens.id, input.tokenId)).limit(1);

        if (token.length === 0) {
          throw new Error('Token not found');
        }

        const t = token[0];

        // Buscar saldo no blockchain
        const balance = await web3Service.getTokenBalance(w.address, t.address, w.chainId);

        if (!balance) {
          throw new Error('Failed to fetch token balance');
        }

        // Salvar no banco de dados
        const existing = await db
          .select()
          .from(balances)
          .where(and(eq(balances.walletId, input.walletId), eq(balances.tokenId, input.tokenId)))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(balances)
            .set({ balance: balance.toString() })
            .where(and(eq(balances.walletId, input.walletId), eq(balances.tokenId, input.tokenId)));
        } else {
          await db.insert(balances).values({
            walletId: input.walletId,
            tokenId: input.tokenId,
            balance: balance.toString(),
          });
        }

        return {
          tokenId: input.tokenId,
          balance,
          symbol: t.symbol,
          decimals: t.decimals,
        };
      } catch (error) {
        console.error('Error getting token balance:', error);
        throw error;
      }
    }),

  /**
   * Obtém saldo nativo (ETH, MATIC, etc) de uma carteira
   */
  getNativeBalance: protectedProcedure
    .input(z.object({ walletId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      try {
        const wallet = await db
          .select()
          .from(wallets)
          .where(and(eq(wallets.id, input.walletId), eq(wallets.userId, ctx.user.id)))
          .limit(1);

        if (wallet.length === 0) {
          throw new Error('Wallet not found');
        }

        const w = wallet[0];
        const balance = await web3Service.getNativeBalance(w.address, w.chainId);

        if (!balance) {
          throw new Error('Failed to fetch native balance');
        }

        return {
          balance,
          chainId: w.chainId,
        };
      } catch (error) {
        console.error('Error getting native balance:', error);
        throw error;
      }
    }),

  /**
   * Obtém lista de chains suportadas
   */
  getSupportedChains: protectedProcedure.query(() => {
    return web3Service.getSupportedChains();
  }),

  /**
   * Valida um endereço Ethereum
   */
  validateAddress: protectedProcedure
    .input(z.object({ address: z.string() }))
    .query(({ input }) => {
      return {
        valid: web3Service.isValidAddress(input.address),
        checksumAddress: web3Service.isValidAddress(input.address)
          ? web3Service.toChecksumAddress(input.address)
          : null,
      };
    }),
});
