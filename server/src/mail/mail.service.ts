import { Injectable, Logger } from '@nestjs/common';
import { I18nService } from '../i18n/i18n.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly i18nService?: I18nService) {}

  /**
   * Gửi mã xác thực OTP 6 số qua email
   */
  async sendOtpEmail(
    email: string,
    code: string,
    type: 'REGISTER_VERIFY' | 'RESET_PASSWORD',
    locale?: string,
  ): Promise<void> {
    const isRegister = type === 'REGISTER_VERIFY';
    const typeLabel = this.i18nService
      ? this.i18nService.t(
          isRegister ? 'mail.purpose_register' : 'mail.purpose_reset_password',
          locale,
        )
      : isRegister
        ? 'XÁC THỰC ĐĂNG KÝ TÀI KHOẢN'
        : 'KHÔI PHỤC MẬT KHẨU';

    const codeLabel = this.i18nService
      ? this.i18nService.t('mail.otp_code_label', locale)
      : 'MÃ XÁC THỰC 6 SỐ';

    const validityText = this.i18nService
      ? this.i18nService.t('mail.otp_validity', locale)
      : 'Thời hạn hiệu lực: 15 phút. Vui lòng không chia sẻ mã này.';

    this.logger.log(`
============================================================
[WONDERLAB EMAIL NOTIFICATION]
Đến / To: ${email}
Mục đích / Purpose: ${typeLabel}
${codeLabel}: [ ${code} ]
${validityText}
============================================================
    `);
  }
}
