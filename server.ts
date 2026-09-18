import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Gmail SMTP Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'greendot.bank.supportmail@gmail.com',
    pass: process.env.SMTP_PASS || 'lsob zfki yzsk nath',
  },
});

// API endpoint to send a manual test email on demand
app.post("/api/test-email", async (req, res) => {
  try {
    const { to } = req.body;
    const recipient = to || process.env.SMTP_USER || 'greendot.bank.supportmail@gmail.com';

    const testMailOptions = {
      from: `"Greendot Bank System" <${process.env.SMTP_USER || 'greendot.bank.supportmail@gmail.com'}>`,
      to: recipient,
      subject: 'Greendot Bank Manual Test Email - Success',
      text: 'Greendot Bank Gmail SMTP manual test transmission was successful!',
      html: `
        <div style="font-family:sans-serif; padding:24px; background:#f0fdf4; border-radius:16px; border:1px solid #22c55e; max-width:550px; margin:0 auto;">
          <h2 style="color:#0f3d1d; margin-top:0; font-size:22px;">Greendot Bank Test Email Verification</h2>
          <p style="color:#334155; font-size:15px; line-height:1.6;">
            Your manual test email transmission to <strong>${recipient}</strong> was completed successfully via SMTP.
          </p>
          <div style="background:#ffffff; padding:16px; border-radius:10px; border:1px solid #d1fae5; font-family:monospace; font-size:13px; color:#166534; margin:15px 0;">
            Status: Delivered &bull; Host: smtp.gmail.com &bull; Port: 587 &bull; Auth: App Password Verified
          </div>
          <p style="color:#64748b; font-size:13px;">All customer alerts, deposit notices, and security pins are fully active and operational.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(testMailOptions);
    console.log("🚀 Manual Test Email sent successfully:", info.messageId);
    return res.json({ success: true, messageId: info.messageId, recipient });
  } catch (err: any) {
    console.error("Error sending manual test email via SMTP:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to send test email" });
  }
});

// API endpoint to send email notification
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ success: false, error: "Missing 'to' or 'subject'" });
    }

    const mailOptions = {
      from: `"Greendot Bank Secure Banking" <${process.env.SMTP_USER || 'greendot.bank.supportmail@gmail.com'}>`,
      to,
      subject,
      text: text || subject,
      html: html || `<p>${subject}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return res.json({ success: true, messageId: info.messageId });
  } catch (err: any) {
    console.error("Error sending email via SMTP:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to send email" });
  }
});

// Send an automatic test email on server startup to verify configuration
async function sendStartupTestEmail() {
  try {
    const testMailOptions = {
      from: `"Greendot Bank System" <greendot.bank.supportmail@gmail.com>`,
      to: 'greendot.bank.supportmail@gmail.com',
      subject: 'Greendot Bank SMTP Integration Test - Success',
      text: 'Greendot Bank Gmail SMTP notifications have been successfully linked and verified!',
      html: `
        <div style="font-family:sans-serif; padding:20px; background:#f4f9f5; border-radius:12px; border:1px solid #22c55e;">
          <h2 style="color:#0f3d1d; margin-top:0;">Greendot Bank SMTP Integration Test</h2>
          <p style="color:#334155; font-size:14px;">
            Your Gmail account (<strong>greendot.bank.supportmail@gmail.com</strong>) has been successfully linked to Greendot Bank notification engine.
          </p>
          <div style="background:#ffffff; padding:12px; border-radius:8px; border:1px solid #e2e8f0; font-family:monospace; font-size:12px; color:#166534;">
            Status: Active &bull; Host: smtp.gmail.com &bull; Port: 587 &bull; Auth: App Password Verified
          </div>
          <p style="color:#64748b; font-size:12px; margin-top:15px;">All customer alerts, deposits, transfers, and security notifications will now be securely pushed to email in real-time.</p>
        </div>
      `,
    };
    const info = await transporter.sendMail(testMailOptions);
    console.log("🚀 Startup Test Email sent successfully to greendot.bank.supportmail@gmail.com:", info.messageId);
  } catch (err) {
    console.warn("Could not send startup test email (check network or app password):", err);
  }
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    sendStartupTestEmail();
  });
}

startServer();
