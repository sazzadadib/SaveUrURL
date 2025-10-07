// lib/email-templates.ts

export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 10px;">Verify Your Email</h1>
        <p style="color: #374151; font-size: 16px; margin: 0;">Thank you for signing up!</p>
      </div>
      
      <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
        Please use the verification code below to complete your registration:
      </p>
      
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">
          {verificationCode}
        </div>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
        This code will expire in 15 minutes for security reasons.
      </p>
      
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
        If you didn't request this verification, please ignore this email.
      </p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This is an automated message, please do not reply.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7c3aed; font-size: 28px; margin-bottom: 10px;">Welcome to Our Platform! 🎉</h1>
      </div>
      
      <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
        Hi {userName},
      </p>
      
      <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
        Thank you for verifying your email! Your account is now fully activated and you can start using all our features.
      </p>
      
      <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
        We're excited to have you on board!
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{loginUrl}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #ec4899); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Get Started
        </a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This is an automated message, please do not reply.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 10px;">Reset Your Password</h1>
      </div>
      
      <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
        Hi {userName},
      </p>
      
      <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
        We received a request to reset your password. Use the code below to proceed:
      </p>
      
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">
          {resetCode}
        </div>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
        This code will expire in 15 minutes for security reasons.
      </p>
      
      <p style="color: #ef4444; font-size: 14px; margin-bottom: 20px; font-weight: 600;">
        If you didn't request a password reset, please ignore this email and ensure your account is secure.
      </p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This is an automated message, please do not reply.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; background-color: #10b981; border-radius: 50%; padding: 20px; margin-bottom: 20px;">
          <span style="color: white; font-size: 40px;">✓</span>
        </div>
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 10px;">Password Reset Successful</h1>
      </div>
      
      <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
        Your password has been successfully reset.
      </p>
      
      <p style="color: #374151; font-size: 16px; margin-bottom: 30px;">
        You can now sign in with your new password.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{loginUrl}" style="display: inline-block; background: linear-gradient(to right, #7c3aed, #ec4899); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Sign In
        </a>
      </div>
      
      <p style="color: #ef4444; font-size: 14px; margin-top: 30px; padding: 15px; background-color: #fee2e2; border-radius: 8px; border-left: 4px solid #ef4444;">
        <strong>Security Alert:</strong> If you didn't reset your password, please contact our support team immediately.
      </p>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This is an automated message, please do not reply.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;