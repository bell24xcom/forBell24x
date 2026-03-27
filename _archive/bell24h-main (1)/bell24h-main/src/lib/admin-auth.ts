export class AdminAuthService {
  private static readonly ADMIN_TOKEN_KEY = 'admin-auth-token';
  private static readonly ADMIN_SESSION_KEY = 'admin-session';

  // Admin user roles and permissions
  static readonly ADMIN_ROLES = {
    SUPER_ADMIN: 'super_admin',
    PLATFORM_ADMIN: 'platform_admin',
    SUPPORT_ADMIN: 'support_admin',
    ANALYTICS_ADMIN: 'analytics_admin',
  } as const;

  // Admin permissions matrix
  static readonly PERMISSIONS = {
    [this.ADMIN_ROLES.SUPER_ADMIN]: [
      'user_management',
      'system_settings',
      'financial_data',
      'analytics',
      'support',
      'audit_logs',
      'security_settings',
    ],
    [this.ADMIN_ROLES.PLATFORM_ADMIN]: [
      'user_management',
      'analytics',
      'support',
      'content_management',
    ],
    [this.ADMIN_ROLES.SUPPORT_ADMIN]: ['support', 'user_support', 'ticket_management'],
    [this.ADMIN_ROLES.ANALYTICS_ADMIN]: ['analytics', 'reports', 'data_export'],
  };

  // Predefined admin accounts
  static readonly ADMIN_ACCOUNTS = [
    {
      id: 1,
      email: 'superadmin@bell24h.com',
      password: 'Bell24H@SuperAdmin2025!',
      role: this.ADMIN_ROLES.SUPER_ADMIN,
      name: 'Super Administrator',
      lastLogin: null,
      isActive: true,
      twoFactorEnabled: true,
    },
    {
      id: 2,
      email: 'admin@bell24h.com',
      password: 'Bell24H@Admin2025!',
      role: this.ADMIN_ROLES.PLATFORM_ADMIN,
      name: 'Platform Administrator',
      lastLogin: null,
      isActive: true,
      twoFactorEnabled: false,
    },
    {
      id: 3,
      email: 'support@bell24h.com',
      password: 'Bell24H@Support2025!',
      role: this.ADMIN_ROLES.SUPPORT_ADMIN,
      name: 'Support Administrator',
      lastLogin: null,
      isActive: true,
      twoFactorEnabled: false,
    },
    {
      id: 4,
      email: 'analytics@bell24h.com',
      password: 'Bell24H@Analytics2025!',
      role: this.ADMIN_ROLES.ANALYTICS_ADMIN,
      name: 'Analytics Administrator',
      lastLogin: null,
      isActive: true,
      twoFactorEnabled: false,
    },
  ];

  // Admin login with enhanced security
  static async adminLogin(email: string, password: string, twoFactorCode?: string) {
    const admin = this.ADMIN_ACCOUNTS.find(a => a.email === email && a.isActive);

    if (!admin || admin.password !== password) {
      this.logSecurityEvent('FAILED_LOGIN_ATTEMPT', { email, ip: this.getClientIP() });
      throw new Error('Invalid admin credentials');
    }

    if (admin.twoFactorEnabled && !twoFactorCode) {
      throw new Error('Two-factor authentication required');
    }

    if (admin.twoFactorEnabled && !this.verifyTwoFactor(twoFactorCode!)) {
      this.logSecurityEvent('FAILED_2FA_ATTEMPT', { email, ip: this.getClientIP() });
      throw new Error('Invalid two-factor code');
    }

    // Generate secure admin token
    const adminToken = this.generateSecureToken(admin);
    const sessionData = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: this.PERMISSIONS[admin.role],
      loginTime: new Date().toISOString(),
      ip: this.getClientIP(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    };

    // Store secure session
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ADMIN_TOKEN_KEY, adminToken);
      localStorage.setItem(this.ADMIN_SESSION_KEY, JSON.stringify(sessionData));

      // Set secure HTTP-only cookie for additional security
      document.cookie = `admin_session=${adminToken}; path=/admin; httpOnly; secure; samesite=strict; max-age=28800`; // 8 hours
    }

    // Log successful login
    this.logSecurityEvent('ADMIN_LOGIN_SUCCESS', {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      ip: this.getClientIP(),
    });

    // Update last login time
    admin.lastLogin = new Date().toISOString();

    return { admin: sessionData, token: adminToken };
  }

  // Generate secure token
  private static generateSecureToken(admin: any): string {
    const timestamp = Date.now();
    const randomBytes = Math.random().toString(36).substring(2);
    const adminHash = btoa(`${admin.id}:${admin.email}:${timestamp}`);
    return `admin_${timestamp}_${randomBytes}_${adminHash}`;
  }

  // Verify two-factor authentication
  private static verifyTwoFactor(code: string): boolean {
    // In production, implement proper TOTP verification
    // For demo, accept specific codes
    return ['123456', '000000', '111111'].includes(code);
  }

  // Get current admin session
  static getCurrentAdmin() {
    if (typeof window === 'undefined') return null;

    const sessionData = localStorage.getItem(this.ADMIN_SESSION_KEY);
    const token = localStorage.getItem(this.ADMIN_TOKEN_KEY);

    if (!sessionData || !token) return null;

    try {
      const session = JSON.parse(sessionData);

      // Check if session is expired (8 hours)
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 8) {
        this.adminLogout();
        return null;
      }

      return session;
    } catch (error) {
      this.adminLogout();
      return null;
    }
  }

  // Check admin permissions
  static hasPermission(permission: string): boolean {
    const admin = this.getCurrentAdmin();
    return admin?.permissions?.includes(permission) || false;
  }

  // Admin logout
  static adminLogout() {
    const admin = this.getCurrentAdmin();

    if (admin) {
      this.logSecurityEvent('ADMIN_LOGOUT', {
        adminId: admin.adminId,
        email: admin.email,
        sessionDuration: this.getSessionDuration(admin.loginTime),
      });
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ADMIN_TOKEN_KEY);
      localStorage.removeItem(this.ADMIN_SESSION_KEY);
      document.cookie = 'admin_session=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/admin/login';
    }
  }

  // Security event logging
  private static logSecurityEvent(event: string, data: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      severity: this.getEventSeverity(event),
      source: 'admin_auth_system',
    };

    console.log('🔐 Security Event:', logEntry);

    // In production, send to monitoring service
    if (typeof window !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('admin_security_logs') || '[]');
      logs.push(logEntry);

      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem('admin_security_logs', JSON.stringify(logs));
    }
  }

  // Get event severity level
  private static getEventSeverity(event: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const severityMap: { [key: string]: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } = {
      ADMIN_LOGIN_SUCCESS: 'MEDIUM',
      ADMIN_LOGOUT: 'LOW',
      FAILED_LOGIN_ATTEMPT: 'HIGH',
      FAILED_2FA_ATTEMPT: 'CRITICAL',
      PERMISSION_DENIED: 'HIGH',
      DATA_ACCESS: 'MEDIUM',
      SYSTEM_CHANGE: 'HIGH',
    };
    return severityMap[event] || 'MEDIUM';
  }

  // Utility functions
  private static getClientIP(): string {
    // In production, get real IP from headers
    return '127.0.0.1';
  }

  private static getSessionDuration(loginTime: string): string {
    const duration = Date.now() - new Date(loginTime).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}
