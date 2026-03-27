import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { emailService } from './emailService';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  deviceId?: string;
  deviceType?: string;
  os?: string;
  browser?: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

export class DeviceManagementService {
  private readonly MAX_DEVICES_PER_USER = 5;
  private readonly DEVICE_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private readonly prisma: PrismaClient) {}

  async registerDevice(userId: string, deviceInfo: DeviceInfo): Promise<{
    deviceId: string;
    verificationToken: string;
  }> {
    // Generate device ID if not provided
    const deviceId = deviceInfo.deviceId || uuidv4();

    // Check device limit
    const deviceCount = await this.prisma.device.count({
      where: { userId }
    });

    if (deviceCount >= this.MAX_DEVICES_PER_USER) {
      throw new Error('Maximum number of devices reached');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Store device info
    await this.prisma.device.create({
      data: {
        id: deviceId,
        userId,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        deviceType: deviceInfo.deviceType,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        location: deviceInfo.location,
        verificationToken,
        verificationExpiry: new Date(Date.now() + this.DEVICE_VERIFICATION_EXPIRY),
        isVerified: false,
        lastActive: new Date(),
        riskScore: this.calculateRiskScore(deviceInfo.userAgent, deviceInfo.ipAddress),
      }
    });

    // Send verification email
    await emailService.sendDeviceVerificationEmail(userId, {
      deviceId,
      verificationToken,
      deviceInfo
    });

    return {
      deviceId,
      verificationToken
    };
  }

  async verifyDevice(userId: string, deviceId: string, token: string): Promise<boolean> {
    const device = await this.prisma.device.findFirst({
      where: {
        id: deviceId,
        userId,
        verificationToken: token,
        verificationExpiry: {
          gt: new Date()
        }
      }
    });

    if (!device) {
      throw new Error('Invalid or expired verification token');
    }

    // Update device status
    await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpiry: null,
        verifiedAt: new Date()
      }
    });

    return true;
  }

  async updateDeviceActivity(deviceId: string): Promise<void> {
    await this.prisma.device.update({
      where: { id: deviceId },
      data: {
        lastActive: new Date()
      }
    });
  }

  async getDevices(userId: string): Promise<any[]> {
    return this.prisma.device.findMany({
      where: { userId },
      orderBy: { lastActive: 'desc' }
    });
  }

  async removeDevice(userId: string, deviceId: string): Promise<boolean> {
    const device = await this.prisma.device.findFirst({
      where: {
        id: deviceId,
        userId
      }
    });

    if (!device) {
      throw new Error('Device not found');
    }

    await this.prisma.device.delete({
      where: { id: deviceId }
    });

    return true;
  }

  async checkDeviceRisk(deviceInfo: DeviceInfo): Promise<{
    riskScore: number;
    riskFactors: string[];
  }> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Check for known malicious IPs
    const isKnownMaliciousIP = await this.checkMaliciousIP(deviceInfo.ipAddress);
    if (isKnownMaliciousIP) {
      riskFactors.push('Known malicious IP address');
      riskScore += 0.4;
    }

    // Check for VPN usage
    const isVPN = await this.checkVPNUsage(deviceInfo.ipAddress);
    if (isVPN) {
      riskFactors.push('VPN detected');
      riskScore += 0.2;
    }

    // Check for suspicious user agent
    if (this.isSuspiciousUserAgent(deviceInfo.userAgent)) {
      riskFactors.push('Suspicious user agent');
      riskScore += 0.2;
    }

    // Check for unusual location
    if (deviceInfo.location) {
      const locationRisk = await this.checkLocationRisk(deviceInfo.location);
      if (locationRisk > 0) {
        riskFactors.push('Unusual location');
        riskScore += locationRisk;
      }
    }

    return {
      riskScore: Math.min(riskScore, 1),
      riskFactors
    };
  }

  private async checkMaliciousIP(ipAddress: string): Promise<boolean> {
    // Implement IP reputation check
    // This could use a third-party service or internal database
    return false;
  }

  private async checkVPNUsage(ipAddress: string): Promise<boolean> {
    // Implement VPN detection
    // This could use a third-party service or internal database
    return false;
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    // Check for common suspicious patterns in user agent
    const suspiciousPatterns = [
      'curl',
      'wget',
      'python-requests',
      'postman',
      'insomnia'
    ];

    return suspiciousPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private async checkLocationRisk(location: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<number> {
    // Implement location risk assessment
    // This could check against known fraud locations, unusual travel patterns, etc.
    return 0;
  }

  private calculateRiskScore(userAgent: string, ipAddress: string): number {
    let score = 0.5; // Base score

    // Check for suspicious user agent patterns
    const suspiciousPatterns = [
      'curl',
      'wget',
      'python-requests',
      'postman',
      'insomnia'
    ];

    if (suspiciousPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
      score += 0.3;
    }

    // Check for VPN/Tor exit nodes (simplified)
    const geo = geoip.lookup(ipAddress);
    if (geo && geo.ll) {
      // Add logic to check if IP is from a known VPN/Tor exit node
      // This is a simplified example
      if (this.isKnownVPNIP(ipAddress)) {
        score += 0.2;
      }
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private isKnownVPNIP(ipAddress: string): boolean {
    // Implement VPN detection logic
    // This is a placeholder - you should use a proper VPN detection service
    return false;
  }

  async getUserDevices(userId: string) {
    try {
      const devices = await this.prisma.device.findMany({
        where: { userId },
        orderBy: { lastActive: 'desc' }
      });

      return devices.map(device => ({
        id: device.id,
        name: this.getDeviceName(device.userAgent),
        os: this.getDeviceOS(device.userAgent),
        browser: this.getDeviceBrowser(device.userAgent),
        location: this.getDeviceLocation(device.ipAddress),
        lastActive: device.lastActive,
        riskScore: device.riskScore,
        verified: device.isVerified
      }));
    } catch (error) {
      logger.error('Failed to fetch user devices:', error);
      throw new Error('Failed to fetch devices');
    }
  }

  private getDeviceName(userAgent: string): string {
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    if (device.model) {
      return `${device.model} (${os.name})`;
    }

    return `${browser.name} on ${os.name}`;
  }

  private getDeviceOS(userAgent: string): string {
    const parser = new UAParser(userAgent);
    const os = parser.getOS();
    return `${os.name} ${os.version}`;
  }

  private getDeviceBrowser(userAgent: string): string {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    return `${browser.name} ${browser.version}`;
  }

  private getDeviceLocation(ipAddress: string): string {
    const geo = geoip.lookup(ipAddress);
    if (!geo) return 'Unknown Location';

    const { city, country } = geo;
    return city ? `${city}, ${country}` : country;
  }
}

export const deviceManagementService = new DeviceManagementService(prisma); 