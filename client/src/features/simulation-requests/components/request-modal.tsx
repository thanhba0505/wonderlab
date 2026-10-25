'use client';

import * as React from 'react';
import { FlaskConical, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { AppModal, AppButton, AppInput, AppSelect } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { createSimulationRequest, SimulationRequestItem } from '@/lib/simulation-requests-api';
import { SIMULATION_CATEGORIES } from '../constants';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (created: SimulationRequestItem) => void;
}

export function RequestModal({ isOpen, onClose, onSuccess }: RequestModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState<string>(SIMULATION_CATEGORIES[0]);
  const [description, setDescription] = React.useState('');
  const [whyInteresting, setWhyInteresting] = React.useState('');
  const [proposedControls, setProposedControls] = React.useState('');
  const [referenceUrl, setReferenceUrl] = React.useState('');
  const [guestName, setGuestName] = React.useState('');
  const [guestEmail, setGuestEmail] = React.useState('');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Reset form when opening
  React.useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCategory(SIMULATION_CATEGORIES[0]);
      setDescription('');
      setWhyInteresting('');
      setProposedControls('');
      setReferenceUrl('');
      setGuestName('');
      setGuestEmail('');
      setErrorMessage(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const cleanTitle = title.trim();
    if (cleanTitle.length < 5) {
      setErrorMessage('Tên bài toán phải có ít nhất 5 ký tự.');
      return;
    }

    const cleanDesc = description.trim();
    if (cleanDesc.length < 20) {
      setErrorMessage(
        'Mô tả nội dung bài toán phải có ít nhất 20 ký tự để ban biên tập thẩm định.',
      );
      return;
    }

    if (!user && !guestName.trim()) {
      setErrorMessage('Vui lòng nhập tên người gửi (hoặc biệt danh khoa học của bạn).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createSimulationRequest({
        title: cleanTitle,
        category,
        description: cleanDesc,
        whyInteresting: whyInteresting.trim() || undefined,
        proposedControls: proposedControls.trim() || undefined,
        referenceUrl: referenceUrl.trim() || undefined,
        guestName: !user ? guestName.trim() : undefined,
        guestEmail: !user && guestEmail.trim() ? guestEmail.trim() : undefined,
      });

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Có lỗi xảy ra khi gửi đề xuất.');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(res.data);
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = React.useMemo(() => {
    return SIMULATION_CATEGORIES.map(cat => ({
      value: cat,
      label: cat,
    }));
  }, []);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-blue-600" />
          <span className="font-heading text-lg font-bold text-slate-900">
            Đề xuất Bài toán & Thí nghiệm mới
          </span>
        </div>
      }
      description="Chia sẻ những nghịch lý, bài toán xác suất hoặc hiện tượng vật lý bạn muốn thấy trong Phòng Lab của Wonderlab."
    >
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h4 className="font-heading text-lg font-bold text-slate-900">
            Đề xuất đã được ghi nhận thành công!
          </h4>
          <p className="mt-1 text-sm text-slate-600 max-w-md">
            Cảm ơn bạn đã đóng góp cho kho tri thức mở. Ban biên tập sẽ sớm thẩm định và đưa bài
            toán vào bảng bình chọn cộng đồng.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {errorMessage && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700 leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* Tên bài toán */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Tên bài toán / Nghịch lý <span className="text-red-500">*</span>
            </label>
            <AppInput
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Nghịch lý Fermi, Con mèo của Schrödinger, Nghịch lý Simpson..."
              required
              maxLength={150}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-slate-500">Tối đa 150 ký tự.</p>
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Lĩnh vực khoa học <span className="text-red-500">*</span>
            </label>
            <AppSelect
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={categoryOptions}
              disabled={isSubmitting}
            />
          </div>

          {/* Mô tả cốt lõi */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Mô tả nội dung bài toán / hiện tượng <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Giải thích ngắn gọn tiền đề, câu hỏi cốt lõi và mâu thuẫn cần giải quyết..."
              required
              maxLength={3000}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-300/85 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>Tối thiểu 20 ký tự.</span>
              <span className="font-mono">{description.length}/3000</span>
            </div>
          </div>

          {/* Điểm phản trực giác */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Điểm phản trực giác hoặc vì sao nên trực quan hóa?</span>
              <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <textarea
              value={whyInteresting}
              onChange={e => setWhyInteresting(e.target.value)}
              rows={2}
              placeholder="VD: Kết quả thực nghiệm hoàn toàn trái ngược với suy đoán ban đầu của trực giác thông thường..."
              maxLength={2000}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-300/85 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
            />
          </div>

          {/* Ý tưởng điều khiển tham số */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Ý tưởng tham số / tương tác{' '}
              <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <AppInput
              value={proposedControls}
              onChange={e => setProposedControls(e.target.value)}
              placeholder="VD: Thanh trượt số lượng mẫu thử, công tắc bật/tắt máy đo quan sát..."
              maxLength={2000}
              disabled={isSubmitting}
            />
          </div>

          {/* Nguồn tài liệu */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Đường dẫn tài liệu tham khảo{' '}
              <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <AppInput
              value={referenceUrl}
              onChange={e => setReferenceUrl(e.target.value)}
              placeholder="https://vi.wikipedia.org/... hoặc liên kết bài báo"
              maxLength={500}
              disabled={isSubmitting}
            />
          </div>

          {/* Thông tin khách vãng lai (nếu chưa đăng nhập) */}
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Tên của bạn <span className="text-red-500">*</span>
                </label>
                <AppInput
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  placeholder="Họ tên hoặc biệt danh"
                  required
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Email nhận thông báo{' '}
                  <span className="text-slate-400 font-normal">(tùy chọn)</span>
                </label>
                <AppInput
                  type="email"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="email@example.com"
                  maxLength={150}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Nút hành động */}
          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <AppButton
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="mr-1.5 h-4 w-4" />
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi đề xuất'}</span>
            </AppButton>
          </div>
        </form>
      )}
    </AppModal>
  );
}
