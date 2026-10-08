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
    description: 'Notify admins or team members with website logo when a contact form is submitted',
    name: 'Contact Form Notification',
    subject: 'New contact submission from {{name}}',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px;">
      <div style="margin-bottom: 16px;">
        <img src="https://www.google.com/s2/favicons?domain={{website_domain}}&sz=128" alt="{{website_name}}" style="width: 64px; height: 64px; border-radius: 12px; border: 1px solid #e2e8f0; padding: 6px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.04); display: inline-block; object-fit: contain;" onerror="this.style.display='none'" />
      </div>
      <h1 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 8px 0 4px 0;">New Contact Form Submission</h1>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px;">{{website_name}}</div>
    </div>

    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px;">Sender Name</div>
      <div style="font-size: 15px; color: #0f172a; font-weight: 500;">{{name}}</div>
    </div>

    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px;">Email Address</div>
      <div style="font-size: 15px;"><a href="mailto:{{email}}" style="color: #2563eb; text-decoration: none; font-weight: 500;">{{email}}</a></div>
    </div>

    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px;">Message</div>
      <div style="background-color: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 6px; padding: 14px 16px; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">{{message}}</div>
    </div>

    <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
      Sent automatically by {{website_name}} form system.
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'welcome-email',
    title: 'Welcome Email',
    description: 'Send a clean, branded greeting with website logo to new users or subscribers',
    name: 'Welcome Email',
    subject: 'Welcome to {{website_name}}, {{name}}!',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px 32px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="margin-bottom: 20px;">
      <img src="https://www.google.com/s2/favicons?domain={{website_domain}}&sz=128" alt="{{website_name}}" style="width: 72px; height: 72px; border-radius: 14px; border: 1px solid #e2e8f0; padding: 6px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.05); display: inline-block; object-fit: contain;" onerror="this.style.display='none'" />
    </div>
    <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 12px 0;">Welcome to {{website_name}}, {{name}}!</h1>
    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Thank you for getting in touch with us. We have received your inquiry and our team will get back to you shortly.
    </p>
    <div style="margin-bottom: 24px;">
      <a href="https://{{website_domain}}" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Visit {{website_name}}</a>
    </div>
    <div style="text-align: center; margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
      © {{year}} {{website_name}}. All rights reserved.
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'blank-template',
    title: 'Blank Starter',
    description: 'Clean slate with website logo and basic HTML structure',
    name: 'Custom Template',
    subject: 'Notification from {{website_name}}',
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="margin-bottom: 20px;">
      <img src="https://www.google.com/s2/favicons?domain={{website_domain}}&sz=128" alt="{{website_name}}" style="width: 56px; height: 56px; border-radius: 10px; border: 1px solid #e2e8f0; padding: 4px; background-color: #ffffff; object-fit: contain;" onerror="this.style.display='none'" />
    </div>
    <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Hello {{name}},</h2>
    <p style="font-size: 14px; color: #475569; line-height: 1.6;">Your message content goes here.</p>
    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sent automatically by {{website_name}}</p>
  </div>
</body>
</html>`,
  },
];
