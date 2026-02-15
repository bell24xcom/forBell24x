declare module 'nodemailer' {
  interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
  }

  interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  function createTransport(options: TransportOptions): Transporter;

  export = nodemailer;
  export as namespace nodemailer;
}
