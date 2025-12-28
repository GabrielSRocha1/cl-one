import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getAdminAuthService } from '../services/adminAuthService';
import { getDb } from '../db';
import { admins, auditLogs } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const adminAuthService = getAdminAuthService();

/**
 * Middleware para verificar se é admin
 */
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const adminId = ctx.req.headers['x-admin-id'] as string | undefined;
  const adminToken = ctx.req.headers['x-admin-token'] as string | undefined;

  if (!adminId || !adminToken) {
    throw new Error('Unauthorized: Missing admin credentials');
  }

  const admin = await adminAuthService.getAdminById(parseInt(adminId));

  if (!admin || admin.isActive === 0) {
    throw new Error('Unauthorized: Invalid admin');
  }

  return next({
    ctx: {
      ...ctx,
      admin,
    },
  });
});

export const adminRouter = router({
  /**
   * Login do admin
   */
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const admin = await adminAuthService.authenticate(input.username, input.password);

        if (!admin) {
          throw new Error('Invalid credentials');
        }

        // Gerar token simples (em produção, usar JWT)
        const token = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');

        return {
          success: true,
          admin,
          token,
        };
      } catch (error) {
        console.error('Error during admin login:', error);
        throw error;
      }
    }),

  /**
   * Obter informações do admin autenticado
   */
  me: adminProcedure.query(({ ctx }) => {
    return {
      id: ctx.admin.id,
      username: ctx.admin.username,
      email: ctx.admin.email,
      role: ctx.admin.role,
      isActive: ctx.admin.isActive === 1,
    };
  }),

  /**
   * Listar todos os admins
   */
  listAdmins: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    try {
      const allAdmins = await db.select().from(admins);

      return allAdmins.map((admin) => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive === 1,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      }));
    } catch (error) {
      console.error('Error listing admins:', error);
      throw error;
    }
  }),

  /**
   * Criar novo admin (apenas superadmin)
   */
  createAdmin: adminProcedure
    .input(
      z.object({
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(['admin', 'moderator']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.admin.role !== 'superadmin') {
        throw new Error('Forbidden: Only superadmin can create admins');
      }

      try {
        const result = await adminAuthService.createAdmin(input.username, input.email, input.password, input.role);

        if (!result) {
          throw new Error('Failed to create admin');
        }

        return {
          success: true,
          admin: result,
        };
      } catch (error) {
        console.error('Error creating admin:', error);
        throw error;
      }
    }),

  /**
   * Alterar senha do admin
   */
  changePassword: adminProcedure
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const success = await adminAuthService.changePassword(ctx.admin.id, input.oldPassword, input.newPassword);

        if (!success) {
          throw new Error('Failed to change password');
        }

        return {
          success: true,
          message: 'Password changed successfully',
        };
      } catch (error) {
        console.error('Error changing password:', error);
        throw error;
      }
    }),

  /**
   * Resetar senha de um admin (apenas superadmin)
   */
  resetAdminPassword: adminProcedure
    .input(
      z.object({
        adminId: z.number().int(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.admin.role !== 'superadmin') {
        throw new Error('Forbidden: Only superadmin can reset passwords');
      }

      try {
        const success = await adminAuthService.resetPassword(input.adminId, input.newPassword);

        if (!success) {
          throw new Error('Failed to reset password');
        }

        return {
          success: true,
          message: 'Password reset successfully',
        };
      } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
      }
    }),

  /**
   * Desativar um admin
   */
  deactivateAdmin: adminProcedure
    .input(z.object({ adminId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.admin.role !== 'superadmin') {
        throw new Error('Forbidden: Only superadmin can deactivate admins');
      }

      try {
        const success = await adminAuthService.deactivateAdmin(input.adminId);

        if (!success) {
          throw new Error('Failed to deactivate admin');
        }

        return {
          success: true,
          message: 'Admin deactivated successfully',
        };
      } catch (error) {
        console.error('Error deactivating admin:', error);
        throw error;
      }
    }),

  /**
   * Obter logs de auditoria
   */
  getAuditLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().int().default(50),
        offset: z.number().int().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      try {
        const logs = await db
          .select()
          .from(auditLogs)
          .limit(input.limit)
          .orderBy((t) => t.createdAt);

        return logs.map((log) => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          description: log.description,
          ipAddress: log.ipAddress,
          createdAt: log.createdAt,
        }));
      } catch (error) {
        console.error('Error getting audit logs:', error);
        throw error;
      }
    }),
});
