import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSimulationRequestDto {
  @ApiProperty({
    description: 'Tên bài toán, nghịch lý hoặc hiện tượng cần mô phỏng',
    example: 'Nghịch lý Fermi: Nếu sự sống ngoài Trái Đất tồn tại, họ đang ở đâu?',
    minLength: 5,
    maxLength: 150,
  })
  @IsString({ message: 'Tên đề xuất phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên đề xuất không được để trống' })
  @MinLength(5, { message: 'Tên đề xuất tối thiểu phải có 5 ký tự' })
  @MaxLength(150, { message: 'Tên đề xuất tối đa không quá 150 ký tự' })
  title!: string;

  @ApiProperty({
    description: 'Lĩnh vực hoặc chủ đề khoa học',
    example: 'Vật lý & Lượng tử',
    maxLength: 64,
  })
  @IsString({ message: 'Chủ đề phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Chủ đề không được để trống' })
  @MaxLength(64, { message: 'Chủ đề tối đa không quá 64 ký tự' })
  category!: string;

  @ApiProperty({
    description: 'Mô tả chi tiết nội dung nghịch lý, bài toán hoặc hiện tượng',
    example:
      'Nghịch lý Fermi chỉ ra mâu thuẫn giữa xác suất cao về sự tồn tại của nền văn minh ngoài Trái Đất và sự thiếu vắng bằng chứng liên lạc.',
    minLength: 20,
    maxLength: 3000,
  })
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @MinLength(20, { message: 'Mô tả tối thiểu phải có 20 ký tự' })
  @MaxLength(3000, { message: 'Mô tả tối đa không quá 3000 ký tự' })
  description!: string;

  @ApiPropertyOptional({
    description: 'Tại sao việc trực quan hóa bài toán này thú vị hoặc có tính phản trực giác?',
    example:
      'Mô phỏng phương trình Drake tương tác với các thanh trượt tỷ lệ sao, hành tinh và tuổi thọ nền văn minh.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'Lý do thú vị phải là chuỗi ký tự' })
  @MaxLength(2000, { message: 'Lý do thú vị tối đa không quá 2000 ký tự' })
  whyInteresting?: string;

  @ApiPropertyOptional({
    description: 'Ý tưởng điều khiển tương tác (tham số thanh trượt, nút bấm...)',
    example:
      'Thanh trượt số lượng hệ sao, xác suất tiến hóa sự sống, thời gian tồn tại nền văn minh',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({ message: 'Ý tưởng tương tác phải là chuỗi ký tự' })
  @MaxLength(2000, { message: 'Ý tưởng tương tác tối đa không quá 2000 ký tự' })
  proposedControls?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn tài liệu hoặc liên kết tham khảo khoa học',
    example: 'https://vi.wikipedia.org/wiki/Ngh%E1%BB%8Bch_l%C3%BD_Fermi',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Liên kết tham khảo phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Liên kết tham khảo tối đa không quá 500 ký tự' })
  referenceUrl?: string;

  @ApiPropertyOptional({
    description: 'Tên hiển thị của khách đề xuất (khi chưa đăng nhập)',
    example: 'Nhà vật lý tương lai',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Tên người gửi phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên người gửi tối đa không quá 100 ký tự' })
  guestName?: string;

  @ApiPropertyOptional({
    description: 'Email liên hệ của khách để nhận thông báo tiến độ',
    example: 'learner@example.com',
    maxLength: 150,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email liên hệ không hợp lệ' })
  @MaxLength(150, { message: 'Email tối đa không quá 150 ký tự' })
  guestEmail?: string;

  @ApiPropertyOptional({
    description: 'Mã định danh phiên ẩn danh của khách',
    example: 'sess_1234567890abcdef',
    maxLength: 64,
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  clientSession?: string;
}
