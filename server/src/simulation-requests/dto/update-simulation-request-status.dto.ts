import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SimulationRequestStatus } from '@prisma/client';

export class UpdateSimulationRequestStatusDto {
  @ApiPropertyOptional({
    description: 'Trạng thái xử lý đề xuất từ ban biên tập',
    enum: SimulationRequestStatus,
    example: SimulationRequestStatus.UNDER_REVIEW,
  })
  @IsOptional()
  @IsEnum(SimulationRequestStatus, { message: 'Trạng thái đề xuất không hợp lệ' })
  status?: SimulationRequestStatus;

  @ApiPropertyOptional({
    description: 'Ghi chú hoặc phản hồi chuyên môn từ ban biên tập Wonderlab',
    example: 'Đề xuất rất tiềm năng. Đội ngũ đang thiết kế mô hình giải thuật Monte Carlo.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú biên tập phải là chuỗi ký tự' })
  @MaxLength(2000, { message: 'Ghi chú biên tập tối đa không quá 2000 ký tự' })
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Slug mô phỏng tương ứng khi bài toán đã hoàn thành và ra mắt',
    example: 'fermi-paradox',
    maxLength: 64,
  })
  @IsOptional()
  @IsString({ message: 'Slug mô phỏng phải là chuỗi ký tự' })
  @MaxLength(64, { message: 'Slug mô phỏng tối đa không quá 64 ký tự' })
  targetSlug?: string;
}
