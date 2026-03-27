import { toast } from 'react-toastify';
import { Client as WhatsAppClient } from 'whatsapp-web.js';

// WhatsApp client instance (to be initialized in server context)
const waClient = new WhatsAppClient();

/**
 * Triggers a toast notification on the client (to be used in React app)
 */
export const sendNotification = (type: string, message: string) => {
  switch (type) {
    case 'rfq-response':
      toast.success('Supplier responded to your RFQ!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      break;
    case 'bid-status':
      toast.info('Your bid has been accepted!');
      break;
    case 'trend-update':
      toast.warning('New trend detected in curtain fabric category!');
      break;
    default:
      toast.info(message);
  }
};

/**
 * Sends a WhatsApp message using whatsapp-web.js
 * @param phoneNumber - WhatsApp number in international format (e.g., '+1234567890')
 * @param message - Message to send
 */
export const sendWhatsAppMessage = (phoneNumber: string, message: string) => {
  waClient.on('qr', (qr) => {
    console.log('Scan this QR code in WhatsApp:', qr);
  });

  waClient.on('ready', () => {
    console.log('WhatsApp client is ready! Sending message...');
    waClient.sendMessage(`whatsapp:${phoneNumber}`, message);
  });

  waClient.initialize();
};

// Note: For production, manage waClient lifecycle and authentication persistently!
