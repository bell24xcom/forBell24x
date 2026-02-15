import { 
  TestConfig, 
  TestResults, 
  SessionData 
} from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class SessionManager {
  private sessionsDir: string;
  private maxSessions: number = 100;
  private sessionIndex: Map<string, SessionData> = new Map();

  constructor(sessionsDir: string = './sessions') {
    this.sessionsDir = sessionsDir;
    this.ensureSessionsDirectory();
    this.loadSessionIndex();
  }

  private ensureSessionsDirectory(): void {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  private loadSessionIndex(): void {
    const indexFile = path.join(this.sessionsDir, 'session-index.json');
    
    try {
      if (fs.existsSync(indexFile)) {
        const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
        this.sessionIndex = new Map(Object.entries(indexData));
      }
    } catch (error) {
      console.warn('Failed to load session index:', error);
      this.sessionIndex = new Map();
    }
  }

  private saveSessionIndex(): void {
    const indexFile = path.join(this.sessionsDir, 'session-index.json');
    
    try {
      const indexData = Object.fromEntries(this.sessionIndex);
      fs.writeFileSync(indexFile, JSON.stringify(indexData, null, 2));
    } catch (error) {
      console.warn('Failed to save session index:', error);
    }
  }

  public async saveSession(config: TestConfig, results?: TestResults): Promise<string> {
    const sessionId = this.generateSessionId();
    const timestamp = new Date();
    
    const sessionData: SessionData = {
      sessionId,
      config,
      results,
      metadata: {
        createdAt: timestamp.toISOString(),
        updatedAt: timestamp.toISOString(),
        configHash: this.hashConfig(config),
        resultsHash: results ? this.hashResults(results) : null,
        configSize: JSON.stringify(config).length,
        resultsSize: results ? JSON.stringify(results).length : 0
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Save session data to file
    const sessionFile = path.join(this.sessionsDir, `${sessionId}.json`);
    
    try {
      fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
      
      // Update session index
      this.sessionIndex.set(sessionId, sessionData);
      this.saveSessionIndex();
      
      // Cleanup old sessions if needed
      this.cleanupOldSessions();
      
      console.log(`💾 Session saved: ${sessionId}`);
      return sessionId;
      
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error(`Failed to save session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async loadSession(sessionId: string): Promise<SessionData> {
    const sessionFile = path.join(this.sessionsDir, `${sessionId}.json`);
    
    try {
      if (!fs.existsSync(sessionFile)) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      
      // Update last accessed time
      sessionData.updatedAt = new Date();
      sessionData.metadata.updatedAt = sessionData.updatedAt.toISOString();
      
      // Save updated session
      fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
      
      console.log(`📂 Session loaded: ${sessionId}`);
      return sessionData;
      
    } catch (error) {
      console.error('Failed to load session:', error);
      throw new Error(`Failed to load session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async listSessions(): Promise<Array<{
    sessionId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    hasResults: boolean;
    config: TestConfig;
  }>> {
    const sessions: Array<{
      sessionId: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      hasResults: boolean;
      config: TestConfig;
    }> = [];

    for (const [sessionId, sessionData] of this.sessionIndex) {
      sessions.push({
        sessionId,
        name: sessionData.config.name,
        createdAt: new Date(sessionData.createdAt),
        updatedAt: new Date(sessionData.updatedAt),
        hasResults: !!sessionData.results,
        config: sessionData.config
      });
    }

    // Sort by most recent first
    sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    return sessions;
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sessionFile = path.join(this.sessionsDir, `${sessionId}.json`);
      
      if (fs.existsSync(sessionFile)) {
        fs.unlinkSync(sessionFile);
      }
      
      this.sessionIndex.delete(sessionId);
      this.saveSessionIndex();
      
      console.log(`🗑️ Session deleted: ${sessionId}`);
      return true;
      
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  public async duplicateSession(sessionId: string, newName?: string): Promise<string> {
    try {
      const originalSession = await this.loadSession(sessionId);
      
      // Create new session with modified config
      const newConfig = {
        ...originalSession.config,
        name: newName || `${originalSession.config.name} (Copy)`,
        description: originalSession.config.description ? `${originalSession.config.description} (Copy)` : 'Copied session'
      };
      
      // Save as new session
      const newSessionId = await this.saveSession(newConfig, originalSession.results);
      
      console.log(`📋 Session duplicated: ${sessionId} -> ${newSessionId}`);
      return newSessionId;
      
    } catch (error) {
      console.error('Failed to duplicate session:', error);
      throw new Error(`Failed to duplicate session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async compareSessions(sessionId1: string, sessionId2: string): Promise<{
    differences: Array<{
      field: string;
      session1Value: any;
      session2Value: any;
      type: 'config' | 'results';
    }>;
    summary: string;
  }> {
    try {
      const session1 = await this.loadSession(sessionId1);
      const session2 = await this.loadSession(sessionId2);
      
      const differences: Array<{
        field: string;
        session1Value: any;
        session2Value: any;
        type: 'config' | 'results';
      }> = [];

      // Compare configurations
      const configDiff = this.compareObjects(session1.config, session2.config);
      for (const [field, values] of Object.entries(configDiff)) {
        differences.push({
          field: `config.${field}`,
          session1Value: values.value1,
          session2Value: values.value2,
          type: 'config'
        });
      }

      // Compare results if both have them
      if (session1.results && session2.results) {
        const resultsDiff = this.compareObjects(session1.results, session2.results);
        for (const [field, values] of Object.entries(resultsDiff)) {
          differences.push({
            field: `results.${field}`,
            session1Value: values.value1,
            session2Value: values.value2,
            type: 'results'
          });
        }
      }

      // Generate summary
      const summary = this.generateComparisonSummary(session1, session2, differences);

      return { differences, summary };
      
    } catch (error) {
      console.error('Failed to compare sessions:', error);
      throw new Error(`Failed to compare sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private compareObjects(obj1: any, obj2: any): Record<string, { value1: any; value2: any }> {
    const differences: Record<string, { value1: any; value2: any }> = {};
    
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    
    for (const key of allKeys) {
      const value1 = obj1[key];
      const value2 = obj2[key];
      
      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        differences[key] = { value1, value2 };
      }
    }
    
    return differences;
  }

  private generateComparisonSummary(
    session1: SessionData, 
    session2: SessionData, 
    differences: Array<{ field: string; session1Value: any; session2Value: any; type: 'config' | 'results' }>
  ): string {
    const configDifferences = differences.filter(d => d.type === 'config').length;
    const resultsDifferences = differences.filter(d => d.type === 'results').length;
    
    let summary = `Comparison Summary:\n`;
    summary += `Session 1: ${session1.config.name} (${session1.sessionId})\n`;
    summary += `Session 2: ${session2.config.name} (${session2.sessionId})\n`;
    summary += `Total differences: ${differences.length}\n`;
    summary += `Configuration differences: ${configDifferences}\n`;
    summary += `Results differences: ${resultsDifferences}\n`;
    
    if (session1.results && session2.results) {
      const score1 = session1.results.summary.score;
      const score2 = session2.results.summary.score;
      summary += `Performance scores: ${score1.toFixed(1)} vs ${score2.toFixed(1)}\n`;
      
      if (score1 > score2) {
        summary += `Session 1 performed better by ${(score1 - score2).toFixed(1)} points\n`;
      } else if (score2 > score1) {
        summary += `Session 2 performed better by ${(score2 - score1).toFixed(1)} points\n`;
      } else {
        summary += `Both sessions performed equally\n`;
      }
    }
    
    return summary;
  }

  public async exportSession(sessionId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const session = await this.loadSession(sessionId);
      
      if (format === 'json') {
        return JSON.stringify(session, null, 2);
      } else {
        // Simplified CSV export
        const csv = [
          'Field,Value',
          `Session ID,${session.sessionId}`,
          `Name,${session.config.name}`,
          `Environment,${session.config.environment}`,
          `Max Users,${session.config.maxUsers}`,
          `Duration,${session.config.duration}s`,
          `Created,${session.createdAt.toISOString()}`,
          `Updated,${session.updatedAt.toISOString()}`,
          `Has Results,${!!session.results}`,
          `Config Size,${session.metadata.configSize} bytes`,
          `Results Size,${session.metadata.resultsSize} bytes`
        ].join('\n');
        return csv;
      }
      
    } catch (error) {
      console.error('Failed to export session:', error);
      throw new Error(`Failed to export session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async importSession(sessionData: string): Promise<string> {
    try {
      const session = JSON.parse(sessionData);
      
      // Validate session structure
      if (!session.sessionId || !session.config) {
        throw new Error('Invalid session data structure');
      }
      
      // Generate new session ID to avoid conflicts
      const newSessionId = this.generateSessionId();
      session.sessionId = newSessionId;
      session.createdAt = new Date();
      session.updatedAt = new Date();
      
      // Save imported session
      await this.saveSession(session.config, session.results);
      
      console.log(`📥 Session imported: ${newSessionId}`);
      return newSessionId;
      
    } catch (error) {
      console.error('Failed to import session:', error);
      throw new Error(`Failed to import session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async searchSessions(query: string): Promise<Array<{
    sessionId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    hasResults: boolean;
    relevance: number;
  }>> {
    const sessions = await this.listSessions();
    const results: Array<{
      sessionId: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      hasResults: boolean;
      relevance: number;
    }> = [];

    const lowerQuery = query.toLowerCase();

    for (const session of sessions) {
      let relevance = 0;
      
      // Check name
      if (session.name.toLowerCase().includes(lowerQuery)) {
        relevance += 10;
      }
      
      // Check description
      if (session.config.description && session.config.description.toLowerCase().includes(lowerQuery)) {
        relevance += 5;
      }
      
      // Check environment
      if (session.config.environment.toLowerCase().includes(lowerQuery)) {
        relevance += 3;
      }
      
      // Check scenarios
      for (const scenario of session.config.scenarios) {
        if (scenario.name.toLowerCase().includes(lowerQuery)) {
          relevance += 2;
        }
      }
      
      if (relevance > 0) {
        results.push({
          ...session,
          relevance
        });
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results;
  }

  public async getSessionStats(): Promise<{
    totalSessions: number;
    sessionsWithResults: number;
    totalSize: number;
    oldestSession: Date | null;
    newestSession: Date | null;
    averageConfigSize: number;
    averageResultsSize: number;
  }> {
    const sessions = await this.listSessions();
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        sessionsWithResults: 0,
        totalSize: 0,
        oldestSession: null,
        newestSession: null,
        averageConfigSize: 0,
        averageResultsSize: 0
      };
    }

    const sessionsWithResults = sessions.filter(s => s.hasResults).length;
    const totalSize = Array.from(this.sessionIndex.values())
      .reduce((sum, session) => sum + session.metadata.configSize + session.metadata.resultsSize, 0);
    
    const dates = sessions.map(s => s.createdAt);
    const oldestSession = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestSession = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const averageConfigSize = Array.from(this.sessionIndex.values())
      .reduce((sum, session) => sum + session.metadata.configSize, 0) / sessions.length;
    
    const averageResultsSize = Array.from(this.sessionIndex.values())
      .reduce((sum, session) => sum + session.metadata.resultsSize, 0) / sessions.length;

    return {
      totalSessions: sessions.length,
      sessionsWithResults,
      totalSize,
      oldestSession,
      newestSession,
      averageConfigSize,
      averageResultsSize
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private hashConfig(config: TestConfig): string {
    return crypto.createHash('md5').update(JSON.stringify(config)).digest('hex');
  }

  private hashResults(results: TestResults): string {
    return crypto.createHash('md5').update(JSON.stringify(results)).digest('hex');
  }

  private cleanupOldSessions(): void {
    if (this.sessionIndex.size <= this.maxSessions) {
      return;
    }

    // Sort sessions by last updated time
    const sortedSessions = Array.from(this.sessionIndex.entries())
      .sort((a, b) => new Date(a[1].updatedAt).getTime() - new Date(b[1].updatedAt).getTime());

    // Remove oldest sessions
    const sessionsToRemove = sortedSessions.slice(0, this.sessionIndex.size - this.maxSessions);
    
    for (const [sessionId, _] of sessionsToRemove) {
      this.deleteSession(sessionId);
    }

    console.log(`🧹 Cleaned up ${sessionsToRemove.length} old sessions`);
  }

  public clearAllSessions(): void {
    try {
      // Remove all session files
      const files = fs.readdirSync(this.sessionsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.sessionsDir, file));
        }
      }
      
      // Clear index
      this.sessionIndex.clear();
      this.saveSessionIndex();
      
      console.log('🗑️ All sessions cleared');
      
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  }
} 