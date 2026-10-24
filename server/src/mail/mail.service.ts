import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  /**
   * Gửi mã xác thực OTP 6 số qua email
   */
  async sendOtpEmail(
    email: string,
    code: string,
    type: 'REGISTER_VERIFY' | 'RESET_PASSWORD',
  ): Promise<void> {
    const typeLabel =
      type === 'REGISTER_VERIFY' ? 'XÁC THỰC ĐĂNG KÝ TÀI KHOẢN' : 'KHÔI PHỤC MẬT KHẨU';

    this.logger.log(`
============================================================
[WONDERLAB EMAIL NOTIFICATION]
Đến: ${email}
Mục đích: ${typeLabel}
MÃ XÁC THỰC 6 SỐ: [ ${code} ]
Thời hạn hiệu lực: 15 phút. Vui lòng không chia sẻ mã này.
============================================================
    `);
  }
}
