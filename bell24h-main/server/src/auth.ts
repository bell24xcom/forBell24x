import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from '../storage';
import { User, InsertUser } from '@shared/schema';

declare global {
  namespace Express {
    // Extend Express.User with the properties from @shared/schema User type
    // You can add only the properties you need for session, e.g. id, email, user_type, etc.
    interface User {
      id: number;
      email: string;
      username: string;
      user_type: string;
      role: string;
      // Add more fields as needed from @shared/schema User
    }
  }
}

const scryptAsync = promisify(scrypt);

/**
 * Hashes a password using scrypt
 * @param password Plain text password
 * @returns The hashed password with salt
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compares a supplied password with a stored hashed password
 * @param supplied Plain text password to check
 * @param stored Stored hashed password with salt
 * @returns Boolean indicating if passwords match
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

/**
 * Sets up authentication routes and middleware
 * @param app Express application instance
 */
export function setupAuth(app: Express): void {
  // Set up session middleware
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'bell24h-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for username/password auth
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      const passwordsMatch = await comparePasswords(password, user.password);
      
      if (!passwordsMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Registration route
  app.post('/api/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken.' });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create the user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      
      // Create supplier profile if user is a supplier
      if (user.user_type === 'supplier' || user.user_type === 'both') {
        // This would create a supplier record linked to the user
        // Assuming req.body contains supplier-specific fields
        await storage.createSupplier({
          user_id: user.id,
          industry: req.body.industry || 'General',
          product_categories: req.body.product_categories || ['General'],
          risk_score: 50, // Default risk score
          verification_status: false // Unverified by default
        });
      }
      
      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Don't return the password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  // Login route
  app.post('/api/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: Error | null, user: Express.User | false, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ error: info?.message || 'Authentication failed.' });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Don't return the password if it exists
        const { password, ...userWithoutPassword } = user as User & { password?: string };
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout route
  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout.' });
      }
      
      res.status(200).json({ message: 'Logged out successfully.' });
    });
  });

  // Current user route
  app.get('/api/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    
    // Don't return the password if it exists
    const { password, ...userWithoutPassword } = req.user as User & { password?: string };
    res.json(userWithoutPassword);
  });
}
