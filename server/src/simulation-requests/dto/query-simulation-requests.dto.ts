import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SimulationRequestStatus } from '@prisma/client';

export enum SimulationRequestSortBy {
  VOTES = 'votes',
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class QuerySimulationRequestsDto {
  @ApiPropertyOptional({
    description: 'Số thứ tự trang (bắt đầu từ 1)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bản ghi trên mỗi trang (mặc định 20)',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đề xuất',
    enum: SimulationRequestStatus,
  })
  @IsOptional()
  @IsEnum(SimulationRequestStatus, { message: 'Trạng thái đề xuất không hợp lệ' })
  status?: SimulationRequestStatus;

  @ApiPropertyOptional({
    description: 'Lọc theo danh mục hoặc chủ đề khoa học',
    example: 'Toán học & Xác suất',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm theo tiêu đề hoặc nội dung',
    example: 'Fermi',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Tiêu chí sắp xếp: votes (nhiều vote nhất), newest (mới nhất), oldest (cũ nhất)',
    enum: SimulationRequestSortBy,
    default: SimulationRequestSortBy.VOTES,
  })
  @IsOptional()
  @IsEnum(SimulationRequestSortBy)
  sortBy?: SimulationRequestSortBy = SimulationRequestSortBy.VOTES;

  @ApiPropertyOptional({
    description: 'Mã phiên khách để kiểm tra trạng thái đã upvote hay chưa',
    example: 'sess_123456',
  })
  @IsOptional()
  @IsString()
  clientSession?: string;
}
