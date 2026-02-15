import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  userId?: string;
  type: 'USER' | 'SYSTEM';
  category: 'NOTIFICATIONS' | 'PRIVACY' | 'PREFERENCES' | 'INTEGRATIONS';
  settings: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  userId: {
    type: String,
    required: function() {
      return this.type === 'USER';
    },
    index: true
  },
  type: {
    type: String,
    enum: ['USER', 'SYSTEM'],
    required: true
  },
  category: {
    type: String,
    enum: ['NOTIFICATIONS', 'PRIVACY', 'PREFERENCES', 'INTEGRATIONS'],
    required: true
  },
  settings: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
SettingsSchema.index({ userId: 1, type: 1, category: 1 }, { unique: true });
SettingsSchema.index({ type: 1, category: 1 });

// Middleware
SettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
SettingsSchema.methods.updateSetting = async function(key: string, value: any) {
  this.settings[key] = value;
  return this.save();
};

SettingsSchema.methods.getSetting = function(key: string) {
  return this.settings[key];
};

SettingsSchema.methods.removeSetting = async function(key: string) {
  delete this.settings[key];
  return this.save();
};

// Static methods
SettingsSchema.statics.getUserSettings = function(userId: string, category?: string) {
  const query: any = { userId, type: 'USER' };
  if (category) {
    query.category = category;
  }
  return this.find(query);
};

SettingsSchema.statics.getSystemSettings = function(category?: string) {
  const query: any = { type: 'SYSTEM' };
  if (category) {
    query.category = category;
  }
  return this.find(query);
};

// Default settings
const defaultUserSettings = {
  NOTIFICATIONS: {
    email: true,
    push: true,
    sms: false,
    whatsapp: true,
    frequency: 'REALTIME'
  },
  PRIVACY: {
    profileVisibility: 'PUBLIC',
    showContactInfo: true,
    dataSharing: 'LIMITED'
  },
  PREFERENCES: {
    language: 'en',
    timezone: 'UTC',
    theme: 'LIGHT',
    currency: 'USD'
  },
  INTEGRATIONS: {
    googleCalendar: false,
    slack: false,
    trello: false
  }
};

const defaultSystemSettings = {
  NOTIFICATIONS: {
    defaultChannel: 'EMAIL',
    retryAttempts: 3,
    batchSize: 100
  },
  PRIVACY: {
    dataRetentionDays: 365,
    encryptionLevel: 'HIGH',
    auditLogging: true
  },
  PREFERENCES: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr', 'de'],
    maintenanceMode: false
  },
  INTEGRATIONS: {
    maxConnections: 10,
    syncInterval: 3600,
    webhookTimeout: 30
  }
};

// Initialize default settings
SettingsSchema.statics.initializeDefaultSettings = async function() {
  // Initialize system settings
  for (const [category, settings] of Object.entries(defaultSystemSettings)) {
    await this.findOneAndUpdate(
      { type: 'SYSTEM', category },
      { settings },
      { upsert: true, new: true }
    );
  }
};

// Create default user settings
SettingsSchema.statics.createDefaultUserSettings = async function(userId: string) {
  for (const [category, settings] of Object.entries(defaultUserSettings)) {
    await this.findOneAndUpdate(
      { userId, type: 'USER', category },
      { settings },
      { upsert: true, new: true }
    );
  }
};

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema); 