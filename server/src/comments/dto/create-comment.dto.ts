import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Nội dung bình luận hoặc phản hồi khoa học',
    example:
      'Kết quả mô phỏng Monte Carlo sau 1000 lượt hoàn toàn tiệm cận giá trị lý thuyết 66.7%!',
    minLength: 2,
    maxLength: 2000,
  })
  @IsString({ message: 'Nội dung bình luận phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @MinLength(2, { message: 'Bình luận tối thiểu phải có 2 ký tự' })
  @MaxLength(2000, { message: 'Bình luận tối đa không vượt quá 2000 ký tự' })
  content!: string;

  @ApiPropertyOptional({
    description:
      'ID của bình luận gốc Cấp 1 (để trả lời). Nếu gửi bình luận gốc mới thì bỏ trống. Lưu ý: Không thể trả lời một phản hồi Cấp 2.',
    example: 'b7c06eb1-8840-4228-a40d-b15d2db17094',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Mã định danh bình luận cha phải là UUID v4 hợp lệ' })
  parentId?: string;
}
