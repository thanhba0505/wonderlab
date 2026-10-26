export type SupportedLocale = 'vi' | 'en';

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['vi', 'en'] as const;
export const DEFAULT_LOCALE: SupportedLocale = 'vi';

export interface ServerDictionary {
  auth: {
    invalid_credentials: string;
    google_account_only: string;
    account_disabled: string;
    email_not_verified: string;
    username_exists: string;
    email_exists: string;
    invalid_or_expired_otp: string;
    otp_resent: string;
    email_verified_success: string;
    password_reset_success: string;
    password_changed_success: string;
    old_password_incorrect: string;
    password_already_set: string;
    password_set_success: string;
    unauthorized: string;
    forbidden: string;
  };
  mail: {
    subject_register: string;
    subject_reset_password: string;
    purpose_register: string;
    purpose_reset_password: string;
    otp_code_label: string;
    otp_validity: string;
  };
  common: {
    internal_error: string;
    invalid_data: string;
    resource_not_found: string;
    success: string;
  };
  comments: {
    not_found: string;
    deleted: string;
  };
  simulation_requests: {
    not_found: string;
  };
  users: {
    not_found: string;
  };
}
