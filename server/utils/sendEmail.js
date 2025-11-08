const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer
 * 
 * IMPORTANT: This function works for ANY user's email address.
 * - All emails are sent through the configured SMTP account (EMAIL_USER/EMAIL_PASS) for authentication
 * - The "From" display name shows the user's name and email address
 * - The "Reply-To" header is set to the user's actual email address
 * - When recipients reply, the email goes directly to the user's email address
 * 
 * This design allows multi-user support while using a single SMTP account.
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email body
 * @param {string} html - HTML email body (optional)
 * @param {string} fromName - Sender name (optional, defaults to 'CareConnect Emergency Alert')
 * @param {string} fromEmail - Sender email for Reply-To header (optional, defaults to EMAIL_USER)
 * @returns {Promise<Object>} - Email sending result
 */
const sendEmail = async (to, subject, text, html = null, fromName = null, fromEmail = null) => {
  try {
    // Validate email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ EMAIL_USER or EMAIL_PASS not configured in environment variables');
      return {
        success: false,
        error: 'Email service not configured. Please contact administrator.',
        recipient: to,
      };
    }

    // Create transporter using environment variables
    // This uses a single SMTP account for authentication, but emails can be sent
    // on behalf of any user by setting Reply-To to their email address
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to other services
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use app-specific password for Gmail
      },
    });

    // Determine sender info
    const senderName = fromName || 'CareConnect Emergency Alert';
    const senderEmail = fromEmail || process.env.EMAIL_USER;

    // Build the "From" display name to show user's name and email
    // The actual sending email must be EMAIL_USER for SMTP authentication
    // But we display the user's info in the display name
    let fromDisplayName;
    if (fromName && fromEmail && fromEmail !== process.env.EMAIL_USER) {
      // Show user's name and email in the display name
      fromDisplayName = `${fromName} (${fromEmail}) via CareConnect`;
    } else {
      fromDisplayName = `${senderName} via CareConnect`;
    }

    // Email options
    const mailOptions = {
      from: `"${fromDisplayName}" <${process.env.EMAIL_USER}>`, // Always use EMAIL_USER for SMTP auth
      replyTo: fromEmail || process.env.EMAIL_USER, // Reply goes to user's email (critical for multi-user support)
      to: to,
      subject: subject,
      text: text,
    };

    // Add HTML version if provided
    if (html) {
      mailOptions.html = html;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   From: ${mailOptions.from}`);
    console.log(`   Reply-To: ${mailOptions.replyTo}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: to,
    };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      recipient: to,
    };
  }
};

/**
 * Send SOS alert emails to multiple contacts
 * @param {Array} contacts - Array of contact objects with email addresses
 * @param {Object} alertData - SOS alert data (user info, location, etc.)
 * @returns {Promise<Object>} - Results of all email attempts
 */
const sendSOSAlertEmails = async (contacts, alertData) => {
  const { userName, userEmail, location, message, timestamp } = alertData;

  // Filter contacts with valid email addresses
  const contactsWithEmail = contacts.filter(
    (contact) => contact.email && contact.email.trim() !== ''
  );

  if (contactsWithEmail.length === 0) {
    console.log('No contacts with email addresses found');
    return {
      success: true,
      message: 'No contacts with email addresses',
      emailsSent: 0,
      results: [],
    };
  }

  // Prepare email content
  const subject = `🚨 EMERGENCY ALERT from ${userName}`;
  
  let locationText = 'Location not available';
  let locationHTML = '<p><strong>Location:</strong> Not available</p>';
  let mapLink = '';

  if (location && location.latitude && location.longitude) {
    locationText = `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
    locationHTML = `
      <p><strong>Location:</strong></p>
      <ul>
        <li>Latitude: ${location.latitude}</li>
        <li>Longitude: ${location.longitude}</li>
        ${location.accuracy ? `<li>Accuracy: ${location.accuracy} meters</li>` : ''}
      </ul>
    `;
    mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  }

  // Plain text version
  const textContent = `
🚨 EMERGENCY ALERT 🚨

${userName} (${userEmail}) has triggered an emergency alert and needs your help!

${message || 'Emergency assistance needed immediately!'}

${locationText}
${mapLink ? `\nView location on map: ${mapLink}` : ''}

Time: ${timestamp || new Date().toLocaleString()}

⚠️ IMMEDIATE ACTION REQUIRED:
- Check on ${userName} immediately
- Call them at their phone number
- Contact emergency services (911) if needed

---
This alert was sent by ${userName} through CareConnect Emergency System.
You can reply to this email to reach ${userName} directly at: ${userEmail}
  `.trim();

  // HTML version
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 5px; text-align: center; }
    .content { background: #f9fafb; padding: 20px; border-radius: 5px; margin-top: 20px; }
    .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 EMERGENCY ALERT</h1>
    </div>
    <div class="content">
      <div class="alert-box">
        <h2>${userName} has triggered an emergency alert</h2>
        <p><strong>Sent by:</strong> ${userName} (${userEmail})</p>
        <p><strong>Time:</strong> ${timestamp || new Date().toLocaleString()}</p>
      </div>
      
      <p><strong>Message:</strong> ${message || 'Emergency assistance needed immediately!'}</p>
      
      ${locationHTML}
      
      ${mapLink ? `<a href="${mapLink}" class="button">📍 View Location on Google Maps</a>` : ''}
      
      <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
        <p style="margin: 0;"><strong>⚠️ IMMEDIATE ACTION REQUIRED:</strong></p>
        <ul style="margin-top: 10px;">
          <li>Check on ${userName} immediately</li>
          <li>Call them at their phone number</li>
          <li>Contact emergency services if needed (911)</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>This alert was sent by <strong>${userName}</strong> through CareConnect Emergency System.</p>
      <p>Reply to this email to reach ${userName} directly at: <strong>${userEmail}</strong></p>
    </div>
  </div>
</body>
</html>
  `.trim();

  // Send emails to all contacts with email addresses
  // Use the user's name and email as the sender
  const emailPromises = contactsWithEmail.map((contact) =>
    sendEmail(contact.email, subject, textContent, htmlContent, userName, userEmail)
  );

  // Wait for all emails to be sent (or fail)
  const results = await Promise.all(emailPromises);

  // Count successful sends
  const successCount = results.filter((result) => result.success).length;
  const failureCount = results.length - successCount;

  console.log(
    `SOS Alert Emails: ${successCount} sent successfully, ${failureCount} failed`
  );

  return {
    success: true,
    emailsSent: successCount,
    emailsFailed: failureCount,
    totalContacts: contactsWithEmail.length,
    results: results,
  };
};

module.exports = {
  sendEmail,
  sendSOSAlertEmails,
};

