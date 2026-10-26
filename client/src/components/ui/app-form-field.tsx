'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AppInput } from './app-input';
import { AppTextArea } from './app-textarea';
import {
  useOptionalAppFormContext,
  validateFieldWithRules,
  type AppFormFieldRule,
} from './app-form';

export interface AppFormFieldRenderProps {
  id: string;
  name: string;
  value: unknown;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onBlur: (e?: React.FocusEvent<HTMLElement>) => void;
  hasError: boolean;
  errors: string[];
  disabled: boolean;
  isSubmitting: boolean;
  required: boolean;
}

export interface AppFormFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'children' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'required'
> {
  name: string;
  label?: React.ReactNode;
  required?: boolean | string;
  rules?: AppFormFieldRule<unknown>[];
  validate?: (
    value: unknown,
    formValues: Record<string, unknown>,
  ) =>
    | boolean
    | string
    | string[]
    | Promise<boolean | string | string[] | undefined | null>
    | undefined
    | null;
  helperText?: React.ReactNode;
  errors?: string | string[];
  showErrorsImmediately?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  multiline?: boolean;
  rows?: number;
  autoResize?: boolean;
  showCount?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  value?: unknown;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | unknown) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement> | unknown) => void;
  children?: React.ReactNode | ((props: AppFormFieldRenderProps) => React.ReactNode);
}

export const AppFormField: React.FC<AppFormFieldProps> = ({
  name,
  label,
  required,
  rules,
  validate,
  helperText,
  errors: manualErrors,
  showErrorsImmediately = false,
  containerClassName,
  labelClassName,
  errorClassName,
  inputClassName,
  id,
  type = 'text',
  placeholder,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  clearable,
  onClear,
  multiline,
  rows,
  autoResize,
  showCount,
  resize,
  size = 'md',
  disabled: propDisabled,
  value: controlledValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  children,
  ...inputProps
}) => {
  const context = useOptionalAppFormContext();
  const generatedId = React.useId();
  const fieldId =
    id ||
    (context?.formId
      ? `${context.formId}-${name}`
      : `field-${name}-${generatedId.replace(/:/g, '')}`);

  // Determine if required
  const isRequired = Boolean(required || rules?.some(rule => Boolean(rule.required)));

  // Standalone state fallbacks if no form context
  const [standaloneValue, setStandaloneValue] = React.useState<unknown>('');
  const [standaloneTouched, setStandaloneTouched] = React.useState(false);
  const [standaloneErrors, setStandaloneErrors] = React.useState<string[]>([]);

  // Register with Form Context if present
  React.useEffect(() => {
    if (!context) return;
    const unregister = context.registerField(name, {
      rules,
      validate,
      label: typeof label === 'string' ? label : undefined,
      required,
    });
    return unregister;
  }, [context, name, rules, validate, label, required]);

  // Read current value
  const fieldValue =
    controlledValue !== undefined
      ? controlledValue
      : context
        ? (context.values[name] ?? '')
        : standaloneValue;

  // Read touched state
  const isTouched = context ? Boolean(context.touched[name]) : standaloneTouched;
  const isSubmitted = context ? Boolean(context.isSubmitted) : false;
  const isSubmitting = context ? Boolean(context.isSubmitting) : false;

  // Compute visible errors
  const visibleErrors = React.useMemo(() => {
    if (manualErrors !== undefined) {
      if (Array.isArray(manualErrors)) return manualErrors.filter(Boolean);
      if (typeof manualErrors === 'string') return [manualErrors];
      return [];
    }

    const shouldShow = showErrorsImmediately || isSubmitted || isTouched;
    if (!shouldShow) return [];

    const activeErrors = context ? context.errors[name] || [] : standaloneErrors;
    return activeErrors;
  }, [
    manualErrors,
    showErrorsImmediately,
    isSubmitted,
    isTouched,
    context,
    name,
    standaloneErrors,
  ]);

  const hasErrors = visibleErrors.length > 0;
  const isDisabled = Boolean(propDisabled || isSubmitting);

  // Value change handlers
  const handleValueChange = React.useCallback(
    async (nextVal: unknown) => {
      if (controlledOnChange) {
        controlledOnChange(nextVal);
      }
      if (context) {
        context.handleFieldChange(name, nextVal);
      } else {
        setStandaloneValue(nextVal);
        // In standalone mode, validate rules if touched
        if (rules || validate || required) {
          const evaluated = await validateFieldWithRules(
            nextVal,
            {},
            rules,
            typeof label === 'string' ? label : undefined,
            validate,
            required,
          );
          setStandaloneErrors(evaluated);
        }
      }
    },
    [controlledOnChange, context, name, rules, validate, required, label],
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    void handleValueChange(e.target.value);
  };

  const handleInputBlur = async (e?: React.FocusEvent<HTMLElement>) => {
    if (controlledOnBlur) {
      controlledOnBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
    }
    if (context) {
      context.handleFieldBlur(name);
    } else {
      setStandaloneTouched(true);
      if (rules || validate || required) {
        const evaluated = await validateFieldWithRules(
          fieldValue,
          {},
          rules,
          typeof label === 'string' ? label : undefined,
          validate,
          required,
        );
        setStandaloneErrors(evaluated);
      }
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    void handleValueChange('');
  };

  return (
    <div className={cn('w-full flex flex-col', containerClassName)}>
      {label ? (
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-xs font-semibold text-slate-700 mb-1.5 select-none cursor-pointer',
            labelClassName,
          )}
        >
          {label}
          {isRequired ? (
            <span className="text-red-500 font-bold ml-1" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {/* Render input or child */}
      {typeof children === 'function' ? (
        children({
          id: fieldId,
          name,
          value: fieldValue,
          onChange: handleInputChange,
          onBlur: handleInputBlur,
          hasError: hasErrors,
          errors: visibleErrors,
          disabled: isDisabled,
          isSubmitting,
          required: isRequired,
        })
      ) : React.isValidElement(children) ? (
        React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          id: ((children.props as Record<string, unknown>).id as string) || fieldId,
          name: ((children.props as Record<string, unknown>).name as string) || name,
          value:
            (children.props as Record<string, unknown>).value !== undefined
              ? (children.props as Record<string, unknown>).value
              : fieldValue,
          onChange:
            ((children.props as Record<string, unknown>).onChange as (val: unknown) => void) ||
            handleInputChange,
          onBlur:
            ((children.props as Record<string, unknown>).onBlur as (ev: unknown) => void) ||
            handleInputBlur,
          error:
            (children.props as Record<string, unknown>).error !== undefined
              ? (children.props as Record<string, unknown>).error
              : hasErrors,
          hasError:
            (children.props as Record<string, unknown>).hasError !== undefined
              ? (children.props as Record<string, unknown>).hasError
              : hasErrors,
          disabled:
            (children.props as Record<string, unknown>).disabled !== undefined
              ? (children.props as Record<string, unknown>).disabled
              : isDisabled,
          'aria-required': isRequired ? 'true' : undefined,
          'aria-invalid': hasErrors ? 'true' : undefined,
          'aria-describedby': hasErrors
            ? `${fieldId}-errors`
            : helperText
              ? `${fieldId}-helper`
              : undefined,
        })
      ) : multiline || rows !== undefined ? (
        <AppTextArea
          id={fieldId}
          name={name}
          value={String(fieldValue ?? '')}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={isDisabled}
          placeholder={placeholder}
          clearable={clearable}
          onClear={handleClear}
          size={size}
          hasError={hasErrors}
          error={false}
          rows={rows}
          autoResize={autoResize}
          resize={resize}
          showCount={false}
          maxLength={inputProps.maxLength}
          className={inputClassName}
          aria-required={isRequired ? 'true' : undefined}
          aria-invalid={hasErrors ? 'true' : undefined}
          aria-describedby={
            hasErrors ? `${fieldId}-errors` : helperText ? `${fieldId}-helper` : undefined
          }
        />
      ) : (
        <AppInput
          id={fieldId}
          name={name}
          type={type}
          value={String(fieldValue ?? '')}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={isDisabled}
          placeholder={placeholder}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          showPasswordToggle={showPasswordToggle}
          clearable={clearable}
          onClear={handleClear}
          size={size}
          hasError={hasErrors}
          error={false} // Error list rendered below by AppFormField
          className={inputClassName}
          aria-required={isRequired ? 'true' : undefined}
          aria-invalid={hasErrors ? 'true' : undefined}
          aria-describedby={
            hasErrors ? `${fieldId}-errors` : helperText ? `${fieldId}-helper` : undefined
          }
          {...inputProps}
        />
      )}

      {/* Error List display, Helper Text, or Character Counter */}
      {hasErrors || helperText || showCount ? (
        <div className="mt-1.5 flex items-start justify-between gap-2 text-xs font-sans">
          <div className="flex-1">
            {hasErrors ? (
              <ul
                id={`${fieldId}-errors`}
                className={cn('space-y-1 text-xs text-red-600 font-sans', errorClassName)}
                role="alert"
                aria-live="polite"
              >
                {visibleErrors.map((errMsg, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold shrink-0 leading-tight select-none">
                      •
                    </span>
                    <span className="leading-tight">{errMsg}</span>
                  </li>
                ))}
              </ul>
            ) : helperText ? (
              <p id={`${fieldId}-helper`} className="text-slate-500 font-sans">
                {helperText}
              </p>
            ) : null}
          </div>

          {showCount ? (
            <span
              className={cn(
                'font-mono tabular-nums text-slate-400 shrink-0 select-none ml-auto text-xs',
                inputProps.maxLength !== undefined &&
                  String(fieldValue ?? '').length > inputProps.maxLength &&
                  'text-red-500 font-semibold',
              )}
              aria-live="polite"
            >
              {String(fieldValue ?? '').length}
              {inputProps.maxLength !== undefined ? `/${inputProps.maxLength}` : ''}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

AppFormField.displayName = 'AppFormField';
