declare module 'nodemailer' {
  interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  interface MailOptions {
    from?: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
  }

  interface Transporter {
    sendMail(mailOptions: MailOptions): Promise<{ messageId: string; response: string }>;
  }

  function createTransport(options: TransportOptions): Transporter;

  export = {
    createTransport
  };
} 