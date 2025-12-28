import bcrypt from 'bcrypt';
import { getDb } from '../db';
import { admins, InsertAdmin } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

/**
 * Admin Authentication Service
 */
export class AdminAuthService {
  /**
   * Hash de senha com bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verifica se a senha está correta
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Cria um novo admin
   */
  async createAdmin(username: string, email: string, password: string, role: 'superadmin' | 'admin' | 'moderator' = 'admin'): Promise<{ id: number; username: string; email: string; role: string } | null> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    try {
      const passwordHash = await this.hashPassword(password);

      const admin: InsertAdmin = {
        username,
        email,
        passwordHash,
        role,
        isActive: 1,
      };

      await db.insert(admins).values(admin);

      return {
        id: 0,
        username,
        email,
        role,
      };
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  /**
   * Busca admin por username
   */
  async getAdminByUsername(username: string) {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting admin by username:', error);
      return null;
    }
  }

  /**
   * Busca admin por ID
   */
  async getAdminById(id: number) {
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting admin by id:', error);
      return null;
    }
  }

  /**
   * Autentica admin
   */
  async authenticate(username: string, password: string): Promise<{ id: number; username: string; email: string; role: string } | null> {
    try {
      const admin = await this.getAdminByUsername(username);

      if (!admin || admin.isActive === 0) {
        return null;
      }

      const isPasswordValid = await this.verifyPassword(password, admin.passwordHash);

      if (!isPasswordValid) {
        return null;
      }

      // Atualizar lastLogin
      const db = await getDb();
      if (db) {
        await db.update(admins).set({ lastLogin: new Date() }).where(eq(admins.id, admin.id));
      }

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role || 'admin',
      };
    } catch (error) {
      console.error('Error authenticating admin:', error);
      return null;
    }
  }

  /**
   * Altera senha do admin
   */
  async changePassword(adminId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      const admin = await this.getAdminById(adminId);

      if (!admin) {
        return false;
      }

      const isPasswordValid = await this.verifyPassword(oldPassword, admin.passwordHash);

      if (!isPasswordValid) {
        return false;
      }

      const newPasswordHash = await this.hashPassword(newPassword);

      await db.update(admins).set({ passwordHash: newPasswordHash, passwordChangedAt: new Date() }).where(eq(admins.id, adminId));

      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }

  /**
   * Reseta senha do admin (apenas para superadmin)
   */
  async resetPassword(adminId: number, newPassword: string): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      const newPasswordHash = await this.hashPassword(newPassword);

      await db.update(admins).set({ passwordHash: newPasswordHash, passwordChangedAt: new Date() }).where(eq(admins.id, adminId));

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  /**
   * Desativa um admin
   */
  async deactivateAdmin(adminId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      await db.update(admins).set({ isActive: 0 }).where(eq(admins.id, adminId));
      return true;
    } catch (error) {
      console.error('Error deactivating admin:', error);
      return false;
    }
  }

  /**
   * Ativa um admin
   */
  async activateAdmin(adminId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    try {
      await db.update(admins).set({ isActive: 1 }).where(eq(admins.id, adminId));
      return true;
    } catch (error) {
      console.error('Error activating admin:', error);
      return false;
    }
  }
}

// Singleton instance
let adminAuthService: AdminAuthService | null = null;

export function getAdminAuthService(): AdminAuthService {
  if (!adminAuthService) {
    adminAuthService = new AdminAuthService();
  }
  return adminAuthService;
}
