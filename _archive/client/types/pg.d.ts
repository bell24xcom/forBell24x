declare module "pg" {
  export interface ClientConfig {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    ssl?: boolean | object;
    connectionTimeoutMillis?: number;
    idleTimeoutMillis?: number;
    application_name?: string;
  }
  export class Client {
    constructor(config?: ClientConfig);
    connect(): Promise<void>;
    end(): Promise<void>;
    query<T = any>(queryTextOrConfig: string, values?: any[]): Promise<{ rows: T[] }>;
  }
  export interface PoolConfig extends ClientConfig {
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }
  export class Pool {
    constructor(config?: PoolConfig);
    connect(): Promise<Client>;
    end(): Promise<void>;
    query<T = any>(queryTextOrConfig: string, values?: any[]): Promise<{ rows: T[] }>;
  }
}