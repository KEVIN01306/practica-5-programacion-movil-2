export interface EmailPreset {
    id: string;
    title: string;
    description: string;
    name: string;
    subject: string;
    htmlContent: string;
}

export const EMAIL_PRESETS: EmailPreset[] = [
    {
        id: 'contact-notification',
        title: 'Contact Notification',
        description: 'Notify admins or team members when a contact form is submitted',
        name: 'Contact Form Notification',
        subject: 'New contact submission from {{name}}',
        htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Request</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
    .card { background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 560px; margin: 0 auto; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px; }
    .title { color: #0f172a; font-size: 20px; font-weight: 700; margin: 0; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
    .field-group { margin-bottom: 16px; }
    .field-label { font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
    .field-value { font-size: 15px; color: #1e293b; margin-top: 4px; line-height: 1.5; }
    .message-box { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: #334155; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">New Inquiry</span>
      <h1 class="title">New Website Contact Form Submission</h1>
    </div>

    <div class="field-group">
      <div class="field-label">Sender Name</div>
      <div class="field-value">{{name}}</div>
    </div>

    <div class="field-group">
      <div class="field-label">Email Address</div>
      <div class="field-value"><a href="mailto:{{email}}" style="color: #2563eb; text-decoration: none;">{{email}}</a></div>
    </div>

    <div class="field-group">
      <div class="field-label">Message</div>
      <div class="message-box">{{message}}</div>
    </div>

    <div class="footer">
      Sent automatically by your website's submission system.
    </div>
  </div>
</body>
</html>`,
    },
    {
        id: 'welcome-email',
        title: 'Welcome Email',
        description: 'Send a clean, friendly greeting to new users or subscribers',
        name: 'Welcome Email',
        subject: 'Welcome to our platform, {{name}}!',
        htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
    .card { background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 560px; margin: 0 auto; padding: 36px 32px; text-align: center; }
    .icon { font-size: 40px; margin-bottom: 16px; }
    .title { color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; }
    .text { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; margin-top: 28px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✨</div>
    <h1 class="title">Welcome, {{name}}!</h1>
    <p class="text">
      We are thrilled to have you with us. Explore our services and let us know if you have any questions or need assistance getting started.
    </p>
    <div>
      <a href="{{actionUrl}}" class="btn">Get Started</a>
    </div>
    <div class="footer">
      © {{year}} All rights reserved.
    </div>
  </div>
</body>
</html>`,
    },
    {
        id: 'blank-template',
        title: 'Blank Starter',
        description: 'Clean slate with basic HTML structure and styling',
        name: 'Custom Template',
        subject: 'Notification from our website',
        htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 24px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Hello {{name}},</h2>
    <p>Your message content goes here.</p>
  </div>
</body>
</html>`,
    },
];
