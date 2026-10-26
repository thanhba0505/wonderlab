'use client';

import * as React from 'react';
import { FlaskConical, Send, CheckCircle2, Sparkles } from 'lucide-react';
import {
  AppModal,
  AppForm,
  AppFormField,
  AppFormSubmit,
  AppSelect,
  AppButton,
  type AppFormHelpers,
} from '@/components/ui';
import { SIMULATION_CATEGORIES } from '../constants';
import { createSimulationRequest } from '@/lib/simulation-requests-api';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from '@/i18n';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdItem?: unknown) => void;
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

export function RequestModal({ isOpen, onClose, onSuccess }: RequestModalProps) {
  const { user } = useAuth();
  const { dict } = useTranslation();
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setGeneralError(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const categoryOptions = React.useMemo(() => {
    return SIMULATION_CATEGORIES.map(cat => ({
      value: cat,
      label: cat,
    }));
  }, []);

  const defaultInitialValues: RequestFormValues = React.useMemo(() => {
    return {
      title: '',
      category: SIMULATION_CATEGORIES[0],
      description: '',
      whyInteresting: '',
      proposedControls: '',
      referenceUrl: '',
      guestName: user?.username || '',
      guestEmail: user?.email || '',
    };
  }, [user]);

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
      helpers.setFieldError('guestName', dict.requests.user_name_required);
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
        setGeneralError(res.error || dict.requests.submit_error);
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
            label={dict.requests.name_label}
            required={dict.requests.name_required}
            placeholder={dict.requests.name_placeholder}
            maxLength={150}
            rules={[
              {
                required: true,
                message: dict.requests.name_required,
              },
              {
                minLength: 3,
                message: dict.requests.name_min,
              },
              {
                maxLength: 150,
                message: dict.requests.name_max,
              },
            ]}
            helperText={dict.requests.name_helper}
          />

          {/* Lĩnh vực khoa học */}
          <AppFormField
            name="category"
            label={dict.requests.category_label}
            required={dict.requests.category_required}
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
            label={dict.requests.description_label}
            required={dict.requests.description_required}
            multiline
            rows={4}
            placeholder={dict.requests.description_placeholder}
            maxLength={3000}
            showCount
            helperText={dict.requests.description_helper}
            rules={[
              {
                required: true,
                message: dict.requests.description_required,
              },
              {
                minLength: 10,
                message: dict.requests.description_min,
              },
              {
                maxLength: 3000,
                message: dict.requests.description_max,
              },
            ]}
          />

          {/* Điểm phản trực giác */}
          <AppFormField
            name="whyInteresting"
            label={
              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>{dict.requests.why_interesting_label}</span>
                <span className="text-slate-400 font-normal">{dict.requests.optional}</span>
              </span>
            }
            multiline
            rows={2}
            placeholder={dict.requests.why_interesting_placeholder}
            maxLength={2000}
            showCount
            rules={[
              {
                maxLength: 2000,
                message: dict.requests.parameters_max,
              },
            ]}
          />

          {/* Ý tưởng tham số điều khiển */}
          <AppFormField
            name="proposedControls"
            label={
              <span className="text-xs font-semibold text-slate-800">
                {dict.requests.parameters_label}{' '}
                <span className="text-slate-400 font-normal">{dict.requests.optional}</span>
              </span>
            }
            multiline
            rows={2}
            placeholder={dict.requests.parameters_placeholder}
            maxLength={2000}
            showCount
            rules={[
              {
                maxLength: 2000,
                message: dict.requests.parameters_max,
              },
            ]}
          />

          {/* Đường dẫn tham khảo */}
          <AppFormField
            name="referenceUrl"
            label={
              <span className="text-xs font-semibold text-slate-800">
                {dict.requests.literature_label}{' '}
                <span className="text-slate-400 font-normal">{dict.requests.optional}</span>
              </span>
            }
            placeholder={dict.requests.literature_placeholder}
            maxLength={500}
            rules={[
              {
                maxLength: 500,
                message: dict.requests.literature_max,
              },
            ]}
          />

          {/* Thông tin khách vãng lai (khi chưa đăng nhập) */}
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <AppFormField
                name="guestName"
                label={dict.requests.user_name_label}
                required={dict.requests.user_name_required}
                placeholder={dict.requests.user_name_placeholder}
                maxLength={100}
                rules={[
                  {
                    required: true,
                    message: dict.requests.user_name_required,
                  },
                  {
                    maxLength: 100,
                    message: dict.requests.user_name_max,
                  },
                ]}
              />

              <AppFormField
                name="guestEmail"
                label={
                  <span className="text-xs font-semibold text-slate-800">
                    {dict.requests.email_label}{' '}
                    <span className="text-slate-400 font-normal">{dict.requests.optional}</span>
                  </span>
                }
                type="email"
                placeholder={dict.requests.email_placeholder}
                maxLength={150}
                rules={[
                  {
                    email: true,
                    message: dict.requests.email_invalid,
                  },
                  {
                    maxLength: 150,
                    message: dict.requests.email_max,
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
              loadingText={dict.requests.submitting_btn}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="mr-1.5 h-4 w-4" />
              <span>{dict.requests.submit_btn}</span>
            </AppFormSubmit>
          </div>
        </AppForm>
      )}
    </AppModal>
  );
}
