import { Gauge, Counter, collectDefaultMetrics, Registry } from 'prom-client';
import AWS from 'aws-sdk';

// Create a registry to register the metrics
const register = new Registry();

// Enable collection of default Node.js metrics
collectDefaultMetrics({ register });

// Custom metrics
export const activeConnections = new Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections',
  labelNames: ['node'] as const,
});

export const messagesReceived = new Counter({
  name: 'websocket_messages_received_total',
  help: 'Total number of messages received',
  labelNames: ['type'] as const,
});

export const messagesSent = new Counter({
  name: 'websocket_messages_sent_total',
  help: 'Total number of messages sent',
  labelNames: ['type'] as const,
});

export const connectionErrors = new Counter({
  name: 'websocket_connection_errors_total',
  help: 'Total number of connection errors',
  labelNames: ['errorType'] as const,
});

// Register custom metrics
register.registerMetric(activeConnections);
register.registerMetric(messagesReceived);
register.registerMetric(messagesSent);
register.registerMetric(connectionErrors);

// CloudWatch configuration
const cloudwatch = new AWS.CloudWatch({
  region: process.env.AWS_REGION || 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Function to publish metrics to CloudWatch
export async function publishMetrics() {
  try {
    const metrics = await register.metrics();
    const metricData = [];

    // Add active connections
    metricData.push({
      MetricName: 'ActiveConnections',
      Dimensions: [
        {
          Name: 'Node',
          Value: process.env.NODE_APP_INSTANCE || '0',
        },
      ],
      Unit: 'Count',
      Value: parseInt((await register.getSingleMetricAsString('websocket_active_connections')).match(/\d+/)?.at(0) || '0'),
    });

    // Add more metrics as needed...
    if (metricData.length > 0) {
      await cloudwatch.putMetricData({
        Namespace: 'Bell24H/WebSocket',
        MetricData: metricData,
      }).promise();
    }
  } catch (error) {
    console.error('Error publishing metrics to CloudWatch:', error);
  }
}

// Publish metrics every minute
const metricsInterval = setInterval(publishMetrics, 60000);

// Clean up on process exit
process.on('SIGTERM', () => {
  clearInterval(metricsInterval);
  publishMetrics().finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  clearInterval(metricsInterval);
  publishMetrics().finally(() => process.exit(0));
});

export default {
  activeConnections,
  messagesReceived,
  messagesSent,
  connectionErrors,
  register,
  publishMetrics,
};
