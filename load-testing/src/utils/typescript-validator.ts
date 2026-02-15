import { 
  ValidationCache, 
  ValidationResult, 
  FixResult, 
  TypeScriptError, 
  TypeScriptWarning 
} from '../types';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export class TypeScriptValidator {
  private cache: Map<string, ValidationCache> = new Map();
  private cacheFile: string;
  private maxCacheAge: number = 5 * 60 * 1000; // 5 minutes

  constructor(cacheDir: string = './.cache') {
    this.cacheFile = path.join(cacheDir, 'typescript-validation-cache.json');
    this.loadCache();
  }

  private loadCache(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const cacheData = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        this.cache = new Map(Object.entries(cacheData));
      }
    } catch (error) {
      console.warn('Failed to load validation cache:', error);
      this.cache = new Map();
    }
  }

  private saveCache(): void {
    try {
      const cacheDir = path.dirname(this.cacheFile);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      
      const cacheData = Object.fromEntries(this.cache);
      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.warn('Failed to save validation cache:', error);
    }
  }

  private getFileHash(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return '';
    }
  }

  private isCacheValid(filePath: string, cache: ValidationCache): boolean {
    const currentHash = this.getFileHash(filePath);
    const age = Date.now() - cache.lastValidation.getTime();
    
    return cache.fileHash === currentHash && age < this.maxCacheAge;
  }

  public async validateFile(filePath: string): Promise<ValidationResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cached = this.cache.get(filePath);
    if (cached && this.isCacheValid(filePath, cached)) {
      return {
        isValid: cached.isValid,
        errors: cached.errors,
        warnings: cached.warnings,
        cacheHit: true,
        validationTime: Date.now() - startTime
      };
    }

    // Perform validation
    const validationResult = await this.performValidation(filePath);
    
    // Update cache
    const cacheEntry: ValidationCache = {
      lastValidation: new Date(),
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      isValid: validationResult.isValid,
      fileHash: this.getFileHash(filePath)
    };
    
    this.cache.set(filePath, cacheEntry);
    this.saveCache();

    return {
      ...validationResult,
      cacheHit: false,
      validationTime: Date.now() - startTime
    };
  }

  private async performValidation(filePath: string): Promise<Omit<ValidationResult, 'cacheHit' | 'validationTime'>> {
    try {
      // Simulate TypeScript validation (in real implementation, this would use tsc or ts-node)
      const content = fs.readFileSync(filePath, 'utf8');
      const errors: TypeScriptError[] = [];
      const warnings: TypeScriptWarning[] = [];

      // Basic syntax validation
      const syntaxErrors = this.checkSyntax(content, filePath);
      errors.push(...syntaxErrors);

      // Type checking simulation
      const typeErrors = this.checkTypes(content, filePath);
      errors.push(...typeErrors);

      // Import/export validation
      const importErrors = this.checkImports(content, filePath);
      errors.push(...importErrors);

      // Best practices warnings
      const practiceWarnings = this.checkBestPractices(content, filePath);
      warnings.push(...practiceWarnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [{
          file: filePath,
          line: 1,
          column: 1,
          message: `Failed to validate file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALIDATION_ERROR',
          category: 'error'
        }],
        warnings: []
      };
    }
  }

  private checkSyntax(content: string, filePath: string): TypeScriptError[] {
    const errors: TypeScriptError[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for common syntax errors
      if (line.includes('const') && line.includes('let') && line.includes('var')) {
        errors.push({
          file: filePath,
          line: lineNumber,
          column: 1,
          message: 'Multiple variable declarations on same line',
          code: 'SYNTAX_ERROR',
          category: 'error'
        });
      }

      // Check for missing semicolons (basic check)
      if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        const lastChar = line.trim().slice(-1);
        if (!['{', '}', '(', ')', '[', ']', ';', ':', ',', '='].includes(lastChar)) {
          errors.push({
            file: filePath,
            line: lineNumber,
            column: line.length + 1,
            message: 'Missing semicolon',
            code: 'MISSING_SEMICOLON',
            category: 'error'
          });
        }
      }

      // Check for unclosed brackets
      const openBrackets = (line.match(/[\(\[\{]/g) || []).length;
      const closeBrackets = (line.match(/[\)\]\}]/g) || []).length;
      if (openBrackets !== closeBrackets) {
        errors.push({
          file: filePath,
          line: lineNumber,
          column: 1,
          message: 'Unmatched brackets',
          code: 'UNMATCHED_BRACKETS',
          category: 'error'
        });
      }
    }

    return errors;
  }

  private checkTypes(content: string, filePath: string): TypeScriptError[] {
    const errors: TypeScriptError[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for any usage
      if (line.includes(': any') && !line.includes('// eslint-disable')) {
        errors.push({
          file: filePath,
          line: lineNumber,
          column: line.indexOf(': any') + 1,
          message: 'Avoid using "any" type, prefer specific types',
          code: 'AVOID_ANY',
          category: 'error'
        });
      }

      // Check for missing type annotations
      if (line.includes('function') && !line.includes('=>') && !line.includes(':')) {
        const funcMatch = line.match(/function\s+(\w+)\s*\(/);
        if (funcMatch && !line.includes('// @ts-ignore')) {
          errors.push({
            file: filePath,
            line: lineNumber,
            column: 1,
            message: 'Function should have return type annotation',
            code: 'MISSING_RETURN_TYPE',
            category: 'error'
          });
        }
      }
    }

    return errors;
  }

  private checkImports(content: string, filePath: string): TypeScriptError[] {
    const errors: TypeScriptError[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for unused imports (basic check)
      if (line.startsWith('import') && line.includes('from')) {
        const importMatch = line.match(/import\s+{([^}]+)}\s+from/);
        if (importMatch) {
          const imports = importMatch[1].split(',').map(imp => imp.trim());
          // This is a simplified check - in real implementation, you'd track usage
          if (imports.length > 10) {
            errors.push({
              file: filePath,
              line: lineNumber,
              column: 1,
              message: 'Too many imports on one line, consider splitting',
              code: 'TOO_MANY_IMPORTS',
              category: 'error'
            });
          }
        }
      }
    }

    return errors;
  }

  private checkBestPractices(content: string, filePath: string): TypeScriptWarning[] {
    const warnings: TypeScriptWarning[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for console.log in production code
      if (line.includes('console.log') && !line.includes('// TODO')) {
        warnings.push({
          file: filePath,
          line: lineNumber,
          column: line.indexOf('console.log') + 1,
          message: 'Consider removing console.log for production',
          code: 'CONSOLE_LOG',
          category: 'warning'
        });
      }

      // Check for long lines
      if (line.length > 120) {
        warnings.push({
          file: filePath,
          line: lineNumber,
          column: 121,
          message: 'Line is too long, consider breaking it up',
          code: 'LINE_TOO_LONG',
          category: 'warning'
        });
      }

      // Check for magic numbers
      const magicNumbers = line.match(/\b\d{4,}\b/g);
      if (magicNumbers && !line.includes('// magic number')) {
        warnings.push({
          file: filePath,
          line: lineNumber,
          column: 1,
          message: 'Consider extracting magic numbers to constants',
          code: 'MAGIC_NUMBER',
          category: 'warning'
        });
      }
    }

    return warnings;
  }

  public async autoFixErrors(filePath: string): Promise<FixResult> {
    const startTime = Date.now();
    const validation = await this.validateFile(filePath);
    const appliedFixes: string[] = [];
    let errorsFixed = 0;

    if (validation.errors.length === 0) {
      return {
        fixed: true,
        errorsFixed: 0,
        remainingErrors: [],
        appliedFixes: [],
        fixTime: Date.now() - startTime
      };
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Apply fixes
      for (const error of validation.errors) {
        const fix = this.getFixForError(error, lines);
        if (fix) {
          lines[error.line - 1] = fix;
          appliedFixes.push(`${error.code}: ${error.message}`);
          errorsFixed++;
        }
      }

      // Write fixed content
      const fixedContent = lines.join('\n');
      fs.writeFileSync(filePath, fixedContent, 'utf8');

      // Clear cache for this file
      this.cache.delete(filePath);
      this.saveCache();

      // Re-validate to get remaining errors
      const revalidation = await this.validateFile(filePath);

      return {
        fixed: errorsFixed > 0,
        errorsFixed,
        remainingErrors: revalidation.errors,
        appliedFixes,
        fixTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        fixed: false,
        errorsFixed: 0,
        remainingErrors: validation.errors,
        appliedFixes: [],
        fixTime: Date.now() - startTime
      };
    }
  }

  private getFixForError(error: TypeScriptError, lines: string[]): string | null {
    const line = lines[error.line - 1];

    switch (error.code) {
      case 'MISSING_SEMICOLON':
        return line + ';';
      
      case 'AVOID_ANY':
        return line.replace(': any', ': unknown');
      
      case 'MISSING_RETURN_TYPE':
        if (line.includes('function')) {
          return line.replace(/function\s+(\w+)\s*\(/, 'function $1(): void (');
        }
        break;
      
      case 'TOO_MANY_IMPORTS':
        // Split imports into multiple lines
        const importMatch = line.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
        if (importMatch) {
          const imports = importMatch[1].split(',').map(imp => imp.trim());
          const module = importMatch[2];
          const importLines = imports.map(imp => `import { ${imp} } from '${module}';`);
          return importLines.join('\n');
        }
        break;
    }

    return null;
  }

  public clearCache(): void {
    this.cache.clear();
    if (fs.existsSync(this.cacheFile)) {
      fs.unlinkSync(this.cacheFile);
    }
  }

  public getCacheStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: this.cache.size
    };
  }
} 