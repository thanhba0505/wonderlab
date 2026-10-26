'use client';

import * as React from 'react';
import { FlaskConical, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import {
  AppModal,
  AppButton,
  AppSelect,
  AppForm,
  AppFormField,
  AppFormSubmit,
  type AppFormHelpers,
} from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { createSimulationRequest, SimulationRequestItem } from '@/lib/simulation-requests-api';
import { SIMULATION_CATEGORIES, CATEGORY_LOCALIZATIONS } from '../constants';
import { useTranslation } from '@/i18n';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (created: SimulationRequestItem) => void;
}

interface RequestFormValues extends Record<string, unknown> {
  title: string;
  category: string;
  description: string;
  whyInteresting: string;
  proposedControls: string;
  referenceUrl: string;
  guestName: string;
  guestEmail: string;
}

const defaultInitialValues: RequestFormValues = {
  title: '',
  category: SIMULATION_CATEGORIES[0],
  description: '',
  whyInteresting: '',
  proposedControls: '',
  referenceUrl: '',
  guestName: '',
  guestEmail: '',
};

export function RequestModal({ isOpen, onClose, onSuccess }: RequestModalProps) {
  const { user } = useAuth();
  const { locale, dict } = useTranslation();
  const isEn = locale === 'en';

  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Reset states when opening modal
  React.useEffect(() => {
    if (isOpen) {
      setGeneralError(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const categoryOptions = React.useMemo(() => {
    return SIMULATION_CATEGORIES.map(cat => ({
      value: cat,
      label: CATEGORY_LOCALIZATIONS[cat]?.[locale] || cat,
    }));
  }, [locale]);

  const handleSubmit = async (
    values: RequestFormValues,
    helpers: AppFormHelpers<RequestFormValues>,
  ) => {
    setGeneralError(null);

    const cleanTitle = String(values.title || '').trim();
    const cleanCategory = String(values.category || SIMULATION_CATEGORIES[0]).trim();
    const cleanDesc = String(values.description || '').trim();
    const cleanWhy = String(values.whyInteresting || '').trim();
    const cleanControls = String(values.proposedControls || '').trim();
    const cleanRef = String(values.referenceUrl || '').trim();
    const cleanGuestName = String(values.guestName || '').trim();
    const cleanGuestEmail = String(values.guestEmail || '').trim();

    if (!user && !cleanGuestName) {
      helpers.setFieldError(
        'guestName',
        isEn
          ? 'Please enter your name or scientific alias'
          : 'Vui lòng nhập tên hoặc biệt danh khoa học của bạn',
      );
      return;
    }

    const res = await createSimulationRequest({
      title: cleanTitle,
      category: cleanCategory,
      description: cleanDesc,
      whyInteresting: cleanWhy || undefined,
      proposedControls: cleanControls || undefined,
      referenceUrl: cleanRef || undefined,
      guestName: !user ? cleanGuestName : undefined,
      guestEmail: !user && cleanGuestEmail ? cleanGuestEmail : undefined,
    });

    if (!res.success || !res.data) {
      if (res.errors) {
        helpers.setErrors(res.errors);
      } else {
        setGeneralError(
          res.error ||
            (isEn
              ? 'An error occurred while submitting your proposal.'
              : 'Có lỗi xảy ra khi gửi đề xuất.'),
        );
      }
      return;
    }

    setIsSuccess(true);
    if (onSuccess) {
      onSuccess(res.data);
    }

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-blue-600" />
          <span className="font-heading text-lg font-bold text-slate-900">
            {dict.requests.modal_title}
          </span>
        </div>
      }
      description={dict.requests.modal_desc}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h4 className="font-heading text-lg font-bold text-slate-900">
            {dict.requests.success_title}
          </h4>
          <p className="mt-1 text-sm text-slate-600 max-w-md">{dict.requests.success_desc}</p>
        </div>
      ) : (
        <AppForm<RequestFormValues>
          initialValues={defaultInitialValues}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 py-2"
        >
          {generalError && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700 leading-relaxed font-sans">
              {generalError}
            </div>
          )}

          {/* Tên bài toán */}
          <AppFormField
            name="title"
            label={isEn ? 'Problem / Paradox Name' : 'Tên bài toán / Nghịch lý'}
            required={isEn ? 'Problem name cannot be empty' : 'Tên bài toán không được để trống'}
            placeholder={
              isEn
                ? 'e.g. Fermi Paradox, Schrödinger’s Cat, Simpson’s Paradox...'
                : 'VD: Nghịch lý Fermi, Con mèo của Schrödinger, Nghịch lý Simpson...'
            }
            maxLength={150}
            rules={[
              {
                required: true,
                message: isEn ? 'Problem name cannot be empty' : 'Tên bài toán không được để trống',
              },
              {
                minLength: 5,
                message: isEn
                  ? 'Problem name must have at least 5 characters'
                  : 'Tên bài toán phải có ít nhất 5 ký tự',
              },
              {
                maxLength: 150,
                message: isEn
                  ? 'Problem name cannot exceed 150 characters'
                  : 'Tên bài toán không quá 150 ký tự',
              },
            ]}
            helperText={isEn ? 'Max 150 characters.' : 'Tối đa 150 ký tự.'}
          />

          {/* Lĩnh vực khoa học */}
          <AppFormField
            name="category"
            label={isEn ? 'Scientific Domain' : 'Lĩnh vực khoa học'}
            required={
              isEn ? 'Please select a scientific domain' : 'Vui lòng chọn lĩnh vực khoa học'
            }
            rules={[{ required: true }]}
          >
            {({ value, onChange, onBlur, disabled, hasError }) => (
              <AppSelect
                value={String(value || SIMULATION_CATEGORIES[0])}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                hasError={hasError}
                options={categoryOptions}
              />
            )}
          </AppFormField>

          {/* Mô tả cốt lõi */}
          <AppFormField
            name="description"
            label={isEn ? 'Core Description & Question' : 'Mô tả nội dung bài toán / hiện tượng'}
            required={isEn ? 'Description cannot be empty' : 'Mô tả không được để trống'}
            multiline
            rows={4}
            placeholder={
              isEn
                ? 'Briefly explain the premise, core paradox, and problem to be solved...'
                : 'Giải thích ngắn gọn tiền đề, câu hỏi cốt lõi và mâu thuẫn cần giải quyết...'
            }
            maxLength={3000}
            showCount
            helperText={
              isEn
                ? 'Minimum 20 characters for editorial review.'
                : 'Tối thiểu 20 ký tự để ban biên tập thẩm định.'
            }
            rules={[
              {
                required: true,
                message: isEn
                  ? 'Description cannot be empty'
                  : 'Mô tả nội dung bài toán không được để trống',
              },
              {
                minLength: 20,
                message: isEn
                  ? 'Description must have at least 20 characters for review'
                  : 'Mô tả tối thiểu phải có 20 ký tự để ban biên tập thẩm định',
              },
              {
                maxLength: 3000,
                message: isEn
                  ? 'Description cannot exceed 3000 characters'
                  : 'Mô tả tối đa không quá 3000 ký tự',
              },
            ]}
          />

          {/* Điểm phản trực giác */}
          <AppFormField
            name="whyInteresting"
            label={
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  {isEn
                    ? 'Counter-intuitive hook or why visualize?'
                    : 'Điểm phản trực giác hoặc vì sao nên trực quan hóa?'}
                </span>
                <span className="text-slate-400 font-normal">
                  {isEn ? '(optional)' : '(tùy chọn)'}
                </span>
              </span>
            }
            multiline
            rows={2}
            placeholder={
              isEn
                ? 'e.g. Empirical observation sharply contradicts common intuition...'
                : 'VD: Kết quả thực nghiệm hoàn toàn trái ngược với suy đoán ban đầu của trực giác thông thường...'
            }
            maxLength={2000}
            showCount
            rules={[
              {
                maxLength: 2000,
                message: isEn ? 'Max 2000 characters' : 'Tối đa 2000 ký tự',
              },
            ]}
          />

          {/* Ý tưởng tham số điều khiển */}
          <AppFormField
            name="proposedControls"
            label={
              <span className="text-xs font-semibold text-slate-800">
                {isEn ? 'Proposed parameters / controls' : 'Ý tưởng tham số / tương tác'}{' '}
                <span className="text-slate-400 font-normal">
                  {isEn ? '(optional)' : '(tùy chọn)'}
                </span>
              </span>
            }
            multiline
            rows={2}
            placeholder={
              isEn
                ? 'e.g. Sample size slider, observer detector on/off switch...'
                : 'VD: Thanh trượt số lượng mẫu thử, công tắc bật/tắt máy đo quan sát...'
            }
            maxLength={2000}
            showCount
            rules={[
              {
                maxLength: 2000,
                message: isEn ? 'Max 2000 characters' : 'Tối đa 2000 ký tự',
              },
            ]}
          />

          {/* Đường dẫn tham khảo */}
          <AppFormField
            name="referenceUrl"
            label={
              <span className="text-xs font-semibold text-slate-800">
                {isEn ? 'Reference literature link' : 'Đường dẫn tài liệu tham khảo'}{' '}
                <span className="text-slate-400 font-normal">
                  {isEn ? '(optional)' : '(tùy chọn)'}
                </span>
              </span>
            }
            placeholder={
              isEn
                ? 'https://en.wikipedia.org/... or paper link'
                : 'https://vi.wikipedia.org/... hoặc liên kết bài báo'
            }
            maxLength={500}
            rules={[
              {
                maxLength: 500,
                message: isEn ? 'Max 500 characters' : 'Tối đa 500 ký tự',
              },
            ]}
          />

          {/* Thông tin khách vãng lai (khi chưa đăng nhập) */}
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <AppFormField
                name="guestName"
                label={isEn ? 'Your Name or Alias' : 'Tên của bạn'}
                required={isEn ? 'Please enter your name' : 'Vui lòng nhập họ tên hoặc biệt danh'}
                placeholder={isEn ? 'Name or scientific alias' : 'Họ tên hoặc biệt danh'}
                maxLength={100}
                rules={[
                  {
                    required: true,
                    message: isEn
                      ? 'Please enter your name or alias'
                      : 'Vui lòng nhập tên người gửi (hoặc biệt danh khoa học)',
                  },
                  {
                    maxLength: 100,
                    message: isEn ? 'Max 100 characters' : 'Tối đa 100 ký tự',
                  },
                ]}
              />

              <AppFormField
                name="guestEmail"
                label={
                  <span className="text-xs font-semibold text-slate-800">
                    {isEn ? 'Notification email' : 'Email nhận thông báo'}{' '}
                    <span className="text-slate-400 font-normal">
                      {isEn ? '(optional)' : '(tùy chọn)'}
                    </span>
                  </span>
                }
                type="email"
                placeholder="email@example.com"
                maxLength={150}
                rules={[
                  {
                    email: true,
                    message: isEn ? 'Invalid email format' : 'Định dạng email không hợp lệ',
                  },
                  {
                    maxLength: 150,
                    message: isEn ? 'Max 150 characters' : 'Tối đa 150 ký tự',
                  },
                ]}
              />
            </div>
          )}

          {/* Nút hành động */}
          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <AppButton type="button" variant="outline" size="md" onClick={onClose}>
              {dict.common.cancel}
            </AppButton>
            <AppFormSubmit
              variant="primary"
              size="md"
              loadingText={isEn ? 'Submitting...' : 'Đang gửi...'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="mr-1.5 h-4 w-4" />
              <span>{isEn ? 'Submit Proposal' : 'Gửi đề xuất'}</span>
            </AppFormSubmit>
          </div>
        </AppForm>
      )}
    </AppModal>
  );
}
