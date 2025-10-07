// components/emails/VerificationEmail.tsx

import * as React from "react";

interface VerificationEmailProps {
  verificationCode: string;
  userName: string;
}

export const VerificationEmail = ({
  verificationCode,
  userName,
}: VerificationEmailProps) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9fafb'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '40px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{
        color: '#7c3aed',
        fontSize: '24px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Verify Your Email
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
        Hi {userName},
      </p>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '30px' }}>
        Thank you for signing up! Please use the verification code below to complete your registration:
      </p>
      
      <div style={{
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        padding: '30px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          letterSpacing: '8px',
          color: '#7c3aed'
        }}>
          {verificationCode}
        </div>
      </div>
      
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
        This code will expire in 15 minutes for security reasons.
      </p>
      
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
        If you didn't request this verification, please ignore this email.
      </p>
      
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          This is an automated message, please do not reply.
        </p>
      </div>
    </div>
  </div>
);

// components/emails/ResetPasswordEmail.tsx

interface ResetPasswordEmailProps {
  resetCode: string;
  userName: string;
}

export const ResetPasswordEmail = ({
  resetCode,
  userName,
}: ResetPasswordEmailProps) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9fafb'
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '40px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{
        color: '#7c3aed',
        fontSize: '24px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Reset Your Password
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
        Hi {userName},
      </p>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '30px' }}>
        We received a request to reset your password. Use the code below to proceed:
      </p>
      
      <div style={{
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        padding: '30px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          letterSpacing: '8px',
          color: '#7c3aed'
        }}>
          {resetCode}
        </div>
      </div>
      
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
        This code will expire in 15 minutes for security reasons.
      </p>
      
      <p style={{ fontSize: '14px', color: '#ef4444', marginBottom: '20px', fontWeight: '600' }}>
        If you didn't request a password reset, please ignore this email and ensure your account is secure.
      </p>
      
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          This is an automated message, please do not reply.
        </p>
      </div>
    </div>
  </div>
);