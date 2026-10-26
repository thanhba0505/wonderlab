import { ServerDictionary } from '../i18n.types';

export const enTranslations: ServerDictionary = {
  auth: {
    invalid_credentials: 'Incorrect username or password',
    google_account_only:
      'This account was registered via Google. Please log in with Google or set a password.',
    account_disabled: 'This account has been disabled or deleted.',
    email_not_verified: 'Email is not verified. Please verify your email before logging in.',
    username_exists: 'Username already exists.',
    email_exists: 'This email is already in use by another account.',
    invalid_or_expired_otp: 'Verification code is invalid or has expired.',
    otp_resent: 'A new verification code has been sent to your email.',
    email_verified_success: 'Account verified successfully! You can now log in.',
    password_reset_success:
      'Password reset successfully! You can now log in with your new password.',
    password_changed_success: 'Password changed successfully.',
    old_password_incorrect: 'Current password is incorrect.',
    password_already_set: 'Account already has a password. Please use Change Password instead.',
    password_set_success: 'Password set successfully.',
    unauthorized: 'You are not logged in or your session has expired.',
    forbidden: 'You do not have permission to perform this action.',
  },
  mail: {
    subject_register: 'Wonderlab Account Verification',
    subject_reset_password: 'Wonderlab Password Recovery',
    purpose_register: 'ACCOUNT REGISTRATION VERIFICATION',
    purpose_reset_password: 'PASSWORD RECOVERY',
    otp_code_label: '6-DIGIT VERIFICATION CODE',
    otp_validity: 'Valid for 15 minutes. Please do not share this code.',
  },
  common: {
    internal_error: 'An internal system error occurred.',
    invalid_data: 'Invalid data.',
    resource_not_found: 'Requested resource not found.',
    success: 'Operation successful.',
  },
  comments: {
    not_found: 'Comment does not exist or has been deleted.',
    deleted: 'Comment deleted successfully.',
  },
  simulation_requests: {
    not_found: 'Simulation request not found.',
  },
  users: {
    not_found: 'User not found.',
  },
};
