import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CommentAuthorDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'scientist_alex' })
  username!: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role!: Role;
}

export class CommentItemDto {
  @ApiProperty({ example: 'c1d2e3f4-g5h6-7890-ijkl-mn1234567890' })
  id!: string;

  @ApiProperty({ example: 'Xác suất 2/3 này thực sự bất ngờ khi lần đầu tiếp cận!' })
  content!: string;

  @ApiProperty({ example: 'monty-hall' })
  simulationSlug!: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  parentId!: string | null;

  @ApiProperty({ type: () => CommentAuthorDto })
  user!: CommentAuthorDto;

  @ApiProperty({ example: '2026-10-24T12:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ example: false })
  isDeleted?: boolean;

  @ApiPropertyOptional({ example: null, nullable: true })
  deletedAt?: Date | null;

  @ApiPropertyOptional({ type: () => [CommentItemDto] })
  replies?: CommentItemDto[];
}

export class DeleteCommentResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Bình luận đã được xóa thành công' })
  message!: string;
}
