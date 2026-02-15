import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserService } from '../user/user.service';
import { compare } from 'bcrypt';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  /**
   * Generate JWT token for user
   */
  async generateToken(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: this.configService.get('jwt.accessExpiration'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiration'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Validate user credentials and return user if valid
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
        {
          secret: this.configService.get('jwt.accessSecret'),
          expiresIn: this.configService.get('jwt.accessExpiration'),
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Verify JWT token and return payload
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt.accessSecret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Decode JWT token without verification
   */
  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date {
    const payload = this.decodeToken(token);
    return new Date(payload.exp * 1000);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    return expiration < new Date();
  }

  /**
   * Get token issuer
   */
  getTokenIssuer(token: string): string {
    const payload = this.decodeToken(token);
    return payload.iss;
  }

  /**
   * Get token audience
   */
  getTokenAudience(token: string): string {
    const payload = this.decodeToken(token);
    return payload.aud;
  }

  /**
   * Get token subject (user ID)
   */
  getTokenSubject(token: string): string {
    const payload = this.decodeToken(token);
    return payload.sub;
  }

  /**
   * Get token claims
   */
  getTokenClaims(token: string): any {
    const payload = this.decodeToken(token);
    return {
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    };
  }
} 