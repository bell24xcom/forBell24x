import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudConfigService {
  constructor(private readonly configService: ConfigService) {}

  get cloudflareConfig() {
    return {
      apiToken: this.configService.get<string>('CLOUDFLARE_API_TOKEN'),
      accountId: this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID'),
      workerUrl: this.configService.get<string>('CLOUDFLARE_WORKER_URL'),
      apiUrl: 'https://api.cloudflare.com/client/v4',
    };
  }

  get mongodbConfig() {
    return {
      apiKey: this.configService.get<string>('MONGODB_API_KEY'),
      dataApiUrl: this.configService.get<string>('MONGODB_DATA_API_URL'),
      database: this.configService.get<string>('MONGODB_DATABASE'),
    };
  }

  get awsConfig() {
    return {
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
      s3Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
    };
  }

  get redisConfig() {
    return {
      url: this.configService.get<string>('REDIS_URL'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    };
  }

  get elasticsearchConfig() {
    return {
      node: this.configService.get<string>('ELASTICSEARCH_NODE'),
      username: this.configService.get<string>('ELASTICSEARCH_USERNAME'),
      password: this.configService.get<string>('ELASTICSEARCH_PASSWORD'),
    };
  }
} 