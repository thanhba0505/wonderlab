import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAdminCommentsQueryDto {
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
    description: 'Từ khóa tìm kiếm theo nội dung bình luận hoặc tên tác giả',
    example: 'monty',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo slug phòng thí nghiệm mô phỏng',
    example: 'monty-hall',
  })
  @IsOptional()
  @IsString()
  simulationSlug?: string;
}
