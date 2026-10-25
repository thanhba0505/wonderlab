'use client';

import * as React from 'react';
import { ExternalLink, RefreshCw, Sliders, Trash2, CheckCircle2, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import {
  AppTableFilter,
  AppTag,
  AppButton,
  AppModal,
  AppInput,
  AppSelect,
  type AppTableColumn,
  type AppFilterField,
  type AppActiveFilter,
} from '@/components/ui';
import {
  fetchAdminSimulationRequests,
  updateAdminSimulationRequestStatus,
  deleteAdminSimulationRequest,
  SimulationRequestItem,
  SimulationRequestStatus,
} from '@/lib/simulation-requests-api';
import { STATUS_CONFIG, SIMULATION_CATEGORIES } from '@/features/simulation-requests/constants';
import { RequestStatusBadge } from '@/features/simulation-requests/components/request-status-badge';

export function RequestsView() {
  const [requests, setRequests] = React.useState<SimulationRequestItem[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(20);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [appliedStatus, setAppliedStatus] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [appliedCategory, setAppliedCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [appliedSearch, setAppliedSearch] = React.useState<string>('');

  // Moderation Modal state
  const [selectedRequest, setSelectedRequest] = React.useState<SimulationRequestItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
  const [editStatus, setEditStatus] = React.useState<SimulationRequestStatus>('PENDING');
  const [editAdminNotes, setEditAdminNotes] = React.useState<string>('');
  const [editTargetSlug, setEditTargetSlug] = React.useState<string>('');
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  const loadRequests = React.useCallback(
    async (
      targetPage = page,
      targetLimit = limit,
      status = appliedStatus,
      category = appliedCategory,
      search = appliedSearch,
      silent = false,
    ) => {
      if (!silent) setIsLoading(true);
      try {
        const res = await fetchAdminSimulationRequests({
          page: targetPage,
          limit: targetLimit,
          status: status !== 'all' ? (status as SimulationRequestStatus) : undefined,
          category: category !== 'all' ? category : undefined,
          search: search || undefined,
        });
        setRequests(res.data);
        setTotal(res.total);
      } catch (err) {
        console.error('Error loading admin simulation requests:', err);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [page, limit, appliedStatus, appliedCategory, appliedSearch],
  );

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleFilter = () => {
    setPage(1);
    setAppliedStatus(selectedStatus);
    setAppliedCategory(selectedCategory);
    setAppliedSearch(searchQuery);
    loadRequests(1, limit, selectedStatus, selectedCategory, searchQuery);
  };

  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSearchQuery('');
    setAppliedStatus('all');
    setAppliedCategory('all');
    setAppliedSearch('');
    setPage(1);
    loadRequests(1, limit, 'all', 'all', '');
  };

  const handleOpenEditModal = (item: SimulationRequestItem) => {
    setSelectedRequest(item);
    setEditStatus(item.status);
    setEditAdminNotes(item.adminNotes || '');
    setEditTargetSlug(item.targetSlug || '');
    setUpdateError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsUpdating(true);
    setUpdateError(null);

    const res = await updateAdminSimulationRequestStatus(selectedRequest.id, {
      status: editStatus,
      adminNotes: editAdminNotes.trim() || undefined,
      targetSlug: editTargetSlug.trim() || undefined,
    });

    if (res.success && res.data) {
      setRequests(prev => prev.map(r => (r.id === selectedRequest.id ? res.data! : r)));
      setIsEditModalOpen(false);
    } else {
      setUpdateError(res.error || 'Có lỗi khi cập nhật trạng thái');
    }
    setIsUpdating(false);
  };

  const handleDeleteRequest = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);

    const res = await deleteAdminSimulationRequest(deleteConfirmId);
    if (res.success) {
      setRequests(prev => prev.filter(r => r.id !== deleteConfirmId));
      setTotal(prev => Math.max(0, prev - 1));
      setDeleteConfirmId(null);
    } else {
      alert(res.error || 'Có lỗi khi xóa đề xuất');
    }
    setIsDeleting(false);
  };

  // Filter definitions
  const filters: AppFilterField[] = [
    {
      id: 'status',
      value: selectedStatus,
      placeholder: 'Lọc theo trạng thái',
      options: [
        { value: 'all', label: 'Tất cả trạng thái' },
        ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({
          value: k,
          label: v.label,
        })),
      ],
      onChange: setSelectedStatus,
    },
    {
      id: 'category',
      value: selectedCategory,
      placeholder: 'Lọc theo lĩnh vực',
      options: [
        { value: 'all', label: 'Tất cả lĩnh vực' },
        ...SIMULATION_CATEGORIES.map(c => ({ value: c, label: c })),
      ],
      onChange: setSelectedCategory,
    },
  ];

  const activeFilters: AppActiveFilter[] = [];
  if (appliedStatus !== 'all') {
    activeFilters.push({
      id: 'status',
      label: 'Trạng thái',
      valueLabel: STATUS_CONFIG[appliedStatus as SimulationRequestStatus]?.label || appliedStatus,
      onRemove: () => {
        setSelectedStatus('all');
        setAppliedStatus('all');
        setPage(1);
        loadRequests(1, limit, 'all', appliedCategory, appliedSearch);
      },
    });
  }
  if (appliedCategory !== 'all') {
    activeFilters.push({
      id: 'category',
      label: 'Lĩnh vực',
      valueLabel: appliedCategory,
      onRemove: () => {
        setSelectedCategory('all');
        setAppliedCategory('all');
        setPage(1);
        loadRequests(1, limit, appliedStatus, 'all', appliedSearch);
      },
    });
  }

  const columns: AppTableColumn<SimulationRequestItem>[] = [
    {
      key: 'title',
      header: 'Bài toán / Lĩnh vực',
      width: 320,
      render: item => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-500 uppercase">
              {item.category}
            </span>
            <RequestStatusBadge status={item.status} />
          </div>
          <div className="font-heading font-bold text-slate-900 text-sm leading-snug">
            {item.title}
          </div>
          <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Người gửi',
      width: 160,
      render: item => (
        <div className="space-y-0.5 text-xs">
          <div className="font-semibold text-slate-800">{item.author.name}</div>
          <div className="text-slate-500">
            {item.author.role ? (
              <AppTag variant="outline" size="sm">
                {item.author.role}
              </AppTag>
            ) : (
              <span className="text-slate-400">Khách vãng lai</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'voteCount',
      header: 'Bình chọn',
      width: 100,
      render: item => (
        <div className="font-mono tabular-nums text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 rounded px-2 py-1 inline-flex items-center gap-1">
          <span>▲</span>
          <span>{item.voteCount}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      width: 120,
      render: item => {
        const d = new Date(item.createdAt);
        return (
          <span className="font-mono text-xs text-slate-500">
            {d.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: 160,
      align: 'right',
      render: item => (
        <div className="flex items-center justify-end gap-1.5">
          <AppButton
            size="sm"
            variant="outline"
            onClick={() => handleOpenEditModal(item)}
            className="text-xs"
          >
            <Sliders className="h-3.5 w-3.5 mr-1 text-slate-500" />
            <span>Thẩm định</span>
          </AppButton>
          <AppButton
            size="sm"
            variant="outline"
            onClick={() => setDeleteConfirmId(item.id)}
            className="text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
            title="Xóa đề xuất"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </AppButton>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-blue-700 uppercase">
            <FlaskConical className="h-4 w-4 text-blue-600" />
            <span>Kiểm duyệt & Thẩm định Thực nghiệm</span>
          </div>
          <h1 className="font-heading mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Đề xuất Thí nghiệm từ Cộng đồng
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Thẩm định tính khả thi, phân loại tiến độ và đưa các bài toán cộng đồng mong đợi vào lộ
            trình Phòng Lab.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AppButton
            size="sm"
            variant="outline"
            onClick={() => loadRequests(page, limit, appliedStatus, appliedCategory, appliedSearch)}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </AppButton>
          <Link href="/requests" target="_blank">
            <AppButton size="sm" variant="outline">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
              <span>Xem trang Hub</span>
            </AppButton>
          </Link>
        </div>
      </div>

      {/* Table Filter Container */}
      <AppTableFilter<SimulationRequestItem>
        header={{
          title: 'Danh sách Đề xuất Thí nghiệm',
          description:
            'Tổng quan tất cả các ý tưởng nghịch lý và bài toán thực nghiệm do độc giả gửi lên.',
        }}
        data={requests}
        columns={columns}
        filters={filters}
        activeFilters={activeFilters}
        searchPlaceholder="Tìm kiếm theo tiêu đề, nội dung, người gửi..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onFilter={handleFilter}
        onReset={handleResetFilters}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={newLimit => {
          setLimit(newLimit);
          setPage(1);
          loadRequests(1, newLimit, appliedStatus, appliedCategory, appliedSearch);
        }}
        pageSizeOptions={[10, 20, 50]}
        rowKey={(item: SimulationRequestItem) => item.id}
      />

      {/* Moderation Edit Modal */}
      {selectedRequest && (
        <AppModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          size="lg"
          title={
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-600" />
              <span className="font-heading text-lg font-bold text-slate-900">
                Thẩm định & Cập nhật Trạng thái Đề xuất
              </span>
            </div>
          }
          description={`Mã đề xuất: ${selectedRequest.id}`}
        >
          <form onSubmit={handleSaveStatus} className="space-y-4 py-2">
            {updateError && (
              <div className="p-3 text-xs rounded-lg border border-red-300 bg-red-50 text-red-700">
                {updateError}
              </div>
            )}

            {/* Request Summary Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono uppercase font-semibold text-slate-500">
                  {selectedRequest.category}
                </span>
                <span className="font-mono text-slate-500">
                  Bình chọn: <strong>{selectedRequest.voteCount}</strong>
                </span>
              </div>
              <h4 className="font-heading text-sm font-bold text-slate-900">
                {selectedRequest.title}
              </h4>
              <p className="text-slate-700 leading-relaxed">{selectedRequest.description}</p>
              {selectedRequest.whyInteresting && (
                <div className="border-t border-slate-200/80 pt-2 text-slate-600">
                  <strong className="text-slate-700">Điểm phản trực giác:</strong>{' '}
                  {selectedRequest.whyInteresting}
                </div>
              )}
              {selectedRequest.referenceUrl && (
                <div className="border-t border-slate-200/80 pt-2">
                  <a
                    href={selectedRequest.referenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Nguồn tham khảo: {selectedRequest.referenceUrl}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Change Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Trạng thái thẩm định & lộ trình <span className="text-red-500">*</span>
              </label>
              <AppSelect
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as SimulationRequestStatus)}
                options={Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: `${config.label} — ${config.description}`,
                }))}
                disabled={isUpdating}
              />
            </div>

            {/* Target Slug (when in development or completed) */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Slug phòng thí nghiệm tương ứng (khi hoàn thành)
              </label>
              <AppInput
                value={editTargetSlug}
                onChange={e => setEditTargetSlug(e.target.value)}
                placeholder="VD: fermi-paradox, schrodingers-cat..."
                maxLength={64}
                disabled={isUpdating}
              />
              <p className="mt-1 text-xs text-slate-500">
                Khi trạng thái là Hoàn thành, thẻ bài toán trên trang công khai sẽ hiển thị nút dẫn
                thẳng tới /simulations/[slug].
              </p>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Ghi chú & Phản hồi chuyên môn của Ban Biên tập
              </label>
              <textarea
                value={editAdminNotes}
                onChange={e => setEditAdminNotes(e.target.value)}
                rows={3}
                placeholder="VD: Đề xuất rất thú vị. Ban biên tập đang xây dựng mô hình trực quan Monte Carlo và dự kiến ra mắt trong tháng tới..."
                maxLength={2000}
                disabled={isUpdating}
                className="w-full rounded-xl border border-slate-300/85 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
              />
              <p className="mt-1 text-xs text-slate-500">
                Ghi chú này sẽ hiển thị công khai trên thẻ đề xuất để người gửi và cộng đồng theo
                dõi.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <AppButton
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
              >
                Hủy bỏ
              </AppButton>
              <AppButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                <span>{isUpdating ? 'Đang lưu...' : 'Lưu cập nhật'}</span>
              </AppButton>
            </div>
          </form>
        </AppModal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <AppModal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          size="sm"
          title="Xác nhận xóa đề xuất"
          description="Đề xuất này sẽ được chuyển vào thùng rác và không còn hiển thị công khai trên trang web."
        >
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <AppButton
              variant="outline"
              size="md"
              onClick={() => setDeleteConfirmId(null)}
              disabled={isDeleting}
            >
              Hủy
            </AppButton>
            <AppButton
              variant="primary"
              size="md"
              onClick={handleDeleteRequest}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <span>{isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
            </AppButton>
          </div>
        </AppModal>
      )}
    </div>
  );
}
