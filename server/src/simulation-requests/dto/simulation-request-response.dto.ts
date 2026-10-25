import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SimulationRequestStatus } from '@prisma/client';

export class SimulationRequestAuthorDto {
  @ApiProperty({ description: 'Mã định danh người dùng (nếu có)' })
  id?: string;

  @ApiProperty({ description: 'Tên người gửi (hoặc tên khách vãng lai)' })
  name!: string;

  @ApiPropertyOptional({ description: 'Vai trò tài khoản' })
  role?: string;

  @ApiPropertyOptional({ description: 'Ảnh đại diện tác giả (nếu có)' })
  avatarUrl?: string | null;
}

export class SimulationRequestItemDto {
  @ApiProperty({ description: 'Mã định danh duy nhất của đề xuất' })
  id!: string;

  @ApiProperty({ description: 'Tiêu đề đề xuất' })
  title!: string;

  @ApiProperty({ description: 'Lĩnh vực hoặc chủ đề' })
  category!: string;

  @ApiProperty({ description: 'Nội dung mô tả' })
  description!: string;

  @ApiPropertyOptional({ description: 'Điểm thú vị phản trực giác' })
  whyInteresting?: string | null;

  @ApiPropertyOptional({ description: 'Ý tưởng điều khiển tương tác' })
  proposedControls?: string | null;

  @ApiPropertyOptional({ description: 'Đường dẫn tham khảo' })
  referenceUrl?: string | null;

  @ApiProperty({ enum: SimulationRequestStatus, description: 'Trạng thái xử lý' })
  status!: SimulationRequestStatus;

  @ApiProperty({ description: 'Số lượt bình chọn hiện tại' })
  voteCount!: number;

  @ApiProperty({ description: 'Người dùng hiện tại đã bình chọn hay chưa' })
  hasVoted!: boolean;

  @ApiProperty({ description: 'Thông tin người gửi' })
  author!: SimulationRequestAuthorDto;

  @ApiPropertyOptional({ description: 'Ghi chú ban biên tập' })
  adminNotes?: string | null;

  @ApiPropertyOptional({ description: 'Slug mô phỏng tương ứng khi hoàn tất' })
  targetSlug?: string | null;

  @ApiProperty({ description: 'Thời điểm tạo' })
  createdAt!: Date;

  @ApiProperty({ description: 'Thời điểm cập nhật' })
  updatedAt!: Date;
}

export class PaginatedSimulationRequestsDto {
  @ApiProperty({ type: [SimulationRequestItemDto] })
  data!: SimulationRequestItemDto[];

  @ApiProperty({ description: 'Tổng số bản ghi thỏa mãn điều kiện lọc' })
  total!: number;

  @ApiProperty({ description: 'Trang hiện tại' })
  page!: number;

  @ApiProperty({ description: 'Số lượng bản ghi trên một trang' })
  limit!: number;

  @ApiProperty({ description: 'Tổng số trang' })
  totalPages!: number;
}

export class ToggleVoteResponseDto {
  @ApiProperty({ description: 'Thao tác thành công hay không' })
  success!: boolean;

  @ApiProperty({ description: 'Trạng thái vote mới (true = đã vote, false = đã hủy vote)' })
  voted!: boolean;

  @ApiProperty({ description: 'Tổng số vote mới sau khi cập nhật' })
  voteCount!: number;
}
