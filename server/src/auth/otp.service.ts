import { Injectable, BadRequestException } from '@nestjs/common';
import { OtpType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Sinh mã ngẫu nhiên 6 chữ số và lưu vào CSDL
   */
  async createAndSendOtp(
    email: string,
    type: OtpType,
    userId?: string,
  ): Promise<{ code: string; expiresAt: Date }> {
    const normalizedEmail = email.toLowerCase();

    // Kiểm tra rate limit: Trong 60 giây qua đã gửi mã chưa (chỉ áp dụng ở production)
    if (process.env.NODE_ENV === 'production') {
      const recentToken = await this.prisma.otpToken.findFirst({
        where: {
          email: normalizedEmail,
          type,
          createdAt: {
            gte: new Date(Date.now() - 60 * 1000), // 60s cooldown
          },
        },
      });

      if (recentToken) {
        throw new BadRequestException(
          'Vui lòng chờ 60 giây trước khi yêu cầu gửi lại mã xác thực mới.',
        );
      }
    }

    // Sinh mã 6 số ngẫu nhiên từ 100000 đến 999999
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await this.prisma.otpToken.create({
      data: {
        email: normalizedEmail,
        code,
        type,
        expiresAt,
        userId: userId || null,
      },
    });

    // Gửi email (hoặc ghi log console ở môi trường dev)
    await this.mailService.sendOtpEmail(normalizedEmail, code, type);

    return { code, expiresAt };
  }

  /**
   * Xác thực mã OTP 6 số và đánh dấu đã sử dụng
   */
  async verifyOtp(email: string, code: string, type: OtpType): Promise<boolean> {
    const normalizedEmail = email.toLowerCase();

    // Trong môi trường development, cho phép mã test thông dụng để tăng tốc phát triển
    if (process.env.NODE_ENV !== 'production' && (code === '000000' || code === '123456')) {
      return true;
    }

    const token = await this.prisma.otpToken.findFirst({
      where: {
        email: normalizedEmail,
        code,
        type,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!token) {
      throw new BadRequestException('Mã xác thực 6 số không chính xác hoặc đã hết hạn.');
    }

    // Đánh dấu đã sử dụng
    await this.prisma.otpToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    });

    return true;
  }
}
