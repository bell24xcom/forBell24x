import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { sendEmail } from '../lib/email';
import { validateEmail, validatePassword } from '../lib/validation';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

// Generate tokens
const generateTokens = (userId: string, role: string) => {
  const accessToken = sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
      },
    });

    if (!user || !(await compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, companyName, companyType, role } = req.body;

    if (!validateEmail(email) || !validatePassword(password)) {
      return res.status(400).json({ error: 'Invalid email or password format' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hash(password, 10);

    // Create company first
    const company = await prisma.company.create({
      data: {
        name: companyName,
        type: companyType,
      },
    });

    // Create user with company
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        companyId: company.id,
      },
      include: {
        company: true,
      },
    });

    // Generate verification token
    const verificationToken = sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Verify your email',
      text: `Please verify your email by clicking this link: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
    });

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const decoded = verify(refreshToken, REFRESH_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        company: true,
      },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user.id, user.role);

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { userId } = req.user;

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken },
    });

    await sendEmail({
      to: email,
      subject: 'Reset your password',
      text: `Click this link to reset your password: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
    });

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const decoded = verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.resetToken !== token) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
      },
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// Resend verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const verificationToken = sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    await sendEmail({
      to: email,
      subject: 'Verify your email',
      text: `Please verify your email by clicking this link: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`,
    });

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    logger.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

export default router; 