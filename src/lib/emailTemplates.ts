export interface EmailRenderOptions {
  recipientName?: string;
  recipientEmail: string;
  type: 'activation' | 'welcome' | 'announcement' | 'debit_alert' | 'credit_alert' | 'generic';
  subject: string;
  activationCode?: string;
  temporaryPassword?: string;
  customerId?: string;
  accountNumber?: string;
  amount?: number;
  balanceAfter?: number;
  reference?: string;
  senderName?: string;
  announcementCategory?: 'general' | 'security_alert' | 'maintenance' | 'policy_update';
  content?: string;
}

export function renderBrandedEmailHtml(options: EmailRenderOptions): string {
  const {
    recipientName = 'Valued Customer',
    type,
    subject,
    activationCode,
    temporaryPassword,
    customerId,
    accountNumber,
    amount,
    balanceAfter,
    reference,
    senderName,
    announcementCategory = 'general',
    content,
  } = options;

  let bodyContent = '';

  if (type === 'activation') {
    bodyContent = `
      <h2 style="color: #0f3d1d; margin-top: 0; font-size: 20px;">Welcome to Greendot Bank, ${recipientName}!</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Your banking profile has been provisioned. To activate your account and set up secure access, please enter the one-time activation code below:
      </p>
      <div style="background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
        <span style="font-size: 13px; color: #15803d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Activation Code</span>
        <div style="font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #166534; font-family: monospace; margin: 10px 0;">
          ${activationCode || 'GRD-8821-4912-3011'}
        </div>
        <span style="font-size: 12px; color: #64748b;">Valid for 48 hours. Never share this code with anyone.</span>
      </div>
      <div style="text-align: center; margin: 30px 0 15px;">
        <a href="#activate" style="background: linear-gradient(135deg, #1db954 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 600; border-radius: 8px; display: inline-block;">Activate My Account Now</a>
      </div>
    `;
  } else if (type === 'welcome') {
    bodyContent = `
      <h2 style="color: #0f3d1d; margin-top: 0; font-size: 20px;">Account Successfully Activated</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Congratulations, ${recipientName}. Your Greendot online banking portal is now live and fully activated.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; overflow: hidden;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 16px; font-size: 14px; color: #64748b;">Customer ID</td>
          <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #0f172a;">${customerId || 'CUST-849201'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 16px; font-size: 14px; color: #64748b;">Primary Account Number</td>
          <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #0f172a;">${accountNumber || '9482019482'}</td>
        </tr>
        ${temporaryPassword ? `
        <tr>
          <td style="padding: 12px 16px; font-size: 14px; color: #64748b;">Temporary Password</td>
          <td style="padding: 12px 16px; font-size: 14px; font-weight: 700; color: #0f172a; font-family: monospace;">${temporaryPassword}</td>
        </tr>
        ` : ''}
      </table>
      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 6px; margin: 20px 0;">
        <strong style="color: #92400e; font-size: 13px;">Security Notice:</strong>
        <p style="margin: 4px 0 0; color: #b45309; font-size: 13px;">For your protection, remember to update your password and set your 4-digit Transaction PIN upon first login.</p>
      </div>
      <div style="text-align: center; margin: 30px 0 10px;">
        <a href="#login" style="background: linear-gradient(135deg, #1db954 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 600; border-radius: 8px; display: inline-block;">Access Online Banking</a>
      </div>
    `;
  } else if (type === 'debit_alert') {
    bodyContent = `
      <h2 style="color: #0f3d1d; margin-top: 0; font-size: 20px;">Debit Alert — Account Notification</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        A debit transaction occurred on your Greendot Bank account.
      </p>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <div style="font-size: 24px; font-weight: 800; color: #dc2626;">-$${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div style="color: #7f1d1d; font-size: 13px; margin-top: 4px;">Debited from Account ${accountNumber || '••••9482'}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Reference</td><td style="padding: 8px 0; font-weight: 600; text-align: right; font-size: 13px;">${reference || 'TXN-982104'}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Recipient / Merchant</td><td style="padding: 8px 0; font-weight: 600; text-align: right; font-size: 13px;">${senderName || 'External Transfer'}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Remaining Balance</td><td style="padding: 8px 0; font-weight: 700; text-align: right; color: #166534; font-size: 13px;">$${(balanceAfter || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
      </table>
    `;
  } else if (type === 'credit_alert') {
    bodyContent = `
      <h2 style="color: #0f3d1d; margin-top: 0; font-size: 20px;">Credit Alert — Funds Deposited</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Your Greendot Bank account has been credited.
      </p>
      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; padding: 16px; margin: 20px 0;">
        <div style="font-size: 24px; font-weight: 800; color: #16a34a;">+$${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div style="color: #14532d; font-size: 13px; margin-top: 4px;">Credited to Account ${accountNumber || '••••9482'}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Reference</td><td style="padding: 8px 0; font-weight: 600; text-align: right; font-size: 13px;">${reference || 'TXN-741920'}</td></tr>
        <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Depositor / Source</td><td style="padding: 8px 0; font-weight: 600; text-align: right; font-size: 13px;">${senderName || 'Payroll / Wire'}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">New Total Balance</td><td style="padding: 8px 0; font-weight: 700; text-align: right; color: #166534; font-size: 13px;">$${(balanceAfter || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
      </table>
    `;
  } else if (type === 'announcement') {
    const bannerColors = {
      general: { bg: '#dcfce7', text: '#15803d', label: 'OFFICIAL ANNOUNCEMENT' },
      security_alert: { bg: '#fee2e2', text: '#b91c1c', label: 'SECURITY ADVISORY' },
      maintenance: { bg: '#fef3c7', text: '#b45309', label: 'SCHEDULED MAINTENANCE' },
      policy_update: { bg: '#e0f2fe', text: '#0369a1', label: 'POLICY & TERMS UPDATE' },
    };
    const b = bannerColors[announcementCategory] || bannerColors.general;
    bodyContent = `
      <div style="background: ${b.bg}; color: ${b.text}; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 6px 12px; border-radius: 4px; display: inline-block; margin-bottom: 16px;">
        ${b.label}
      </div>
      <h2 style="color: #0f3d1d; margin-top: 0; font-size: 20px;">${subject}</h2>
      <div style="color: #334155; font-size: 15px; line-height: 1.7; margin: 15px 0;">
        ${content || 'Important update regarding your Greendot Bank account and security services.'}
      </div>
      <div style="text-align: center; margin: 30px 0 10px;">
        <a href="#dashboard" style="background: linear-gradient(135deg, #1db954 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; font-weight: 600; border-radius: 8px; display: inline-block;">Visit Your Account</a>
      </div>
    `;
  } else {
    bodyContent = `
      <h2 style="color: #0f3d1d; margin-top: 0; font-size: 20px;">${subject}</h2>
      <div style="color: #334155; font-size: 15px; line-height: 1.7; margin: 15px 0;">
        ${content || ''}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f2;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border-top: 5px solid #39d353;">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 36px 20px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="vertical-align: middle;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: #1db954; box-shadow: inset 0 2px 4px rgba(255,255,255,0.4), 0 3px 6px rgba(29,185,84,0.35); margin-right: 12px;"></div>
                          </td>
                          <td style="vertical-align: middle;">
                            <span style="font-size: 22px; font-weight: 800; color: #0b2912; letter-spacing: -0.5px;">greendot</span>
                            <div style="font-size: 11px; font-weight: 500; color: #1db954; text-transform: uppercase; letter-spacing: 2px; margin-top: -3px;">BANK</div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #16a34a; font-weight: 600; background: #dcfce7; padding: 4px 10px; border-radius: 12px;">Secure Banking</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #1a2e1a; color: #94a3b8; padding: 28px 36px; font-size: 12px; line-height: 1.6;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="color: #ffffff; font-weight: 700; font-size: 14px; margin-bottom: 4px;">Greendot Bank Online</div>
                    <div>100 Financial Plaza, New York, NY 10005</div>
                    <div style="margin-top: 10px; color: #6ee7b7;">
                      Email: support@greendotbank.com &bull; Phone: 1-800-GREENDOT &bull; Telegram: @greendotbanksupport
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 18px;">
                    <div style="color: #64748b; font-size: 11px;">
                      &copy; 2026 Greendot Bank. Member FDIC. Equal Housing Lender. All rights reserved. Your security is our highest priority.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
