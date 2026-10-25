'use client';

import * as React from 'react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { AppButton, type AppButtonProps } from './app-button';

export interface AppFormFieldRule<T = unknown> {
  required?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  email?: boolean | string;
  message?: string;
  validate?: (
    value: T,
    formValues: Record<string, unknown>,
  ) =>
    | boolean
    | string
    | string[]
    | Promise<boolean | string | string[] | undefined | null>
    | undefined
    | null;
}

export type AppFormErrors = Record<string, string[]>;
export type AppFormTouched = Record<string, boolean>;

export interface FieldRegistration {
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
  label?: string;
  required?: boolean | string;
}

export interface AppFormHelpers<T = Record<string, unknown>> {
  values: T;
  errors: AppFormErrors;
  touched: AppFormTouched;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (name: string, value: unknown, shouldValidate?: boolean) => void;
  setFieldError: (name: string, error: string | string[] | null) => void;
  setErrors: (errors: Record<string, string | string[]>) => void;
  setFieldTouched: (name: string, touched?: boolean, shouldValidate?: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  resetForm: (nextValues?: Partial<T>) => void;
  validateForm: () => Promise<boolean>;
  validateField: (name: string) => Promise<boolean>;
  submitForm: () => Promise<boolean>;
}

export interface AppFormContextValue<T = Record<string, unknown>> extends AppFormHelpers<T> {
  formId: string;
  validateOn: 'blur' | 'change' | 'submit';
  registerField: (name: string, registration: FieldRegistration) => () => void;
  handleFieldChange: (name: string, value: unknown) => void;
  handleFieldBlur: (name: string) => void;
}

const AppFormContext = React.createContext<AppFormContextValue<Record<string, unknown>> | null>(
  null,
);

export function useAppFormContext<
  T extends Record<string, unknown> = Record<string, unknown>,
>(): AppFormContextValue<T> {
  const context = React.useContext(AppFormContext);
  if (!context) {
    throw new Error('useAppFormContext must be used within an <AppForm>');
  }
  return context as unknown as AppFormContextValue<T>;
}

export function useOptionalAppFormContext<
  T extends Record<string, unknown> = Record<string, unknown>,
>(): AppFormContextValue<T> | null {
  return (React.useContext(AppFormContext) as unknown as AppFormContextValue<T>) || null;
}

export async function validateFieldWithRules(
  value: unknown,
  formValues: Record<string, unknown>,
  rules?: AppFormFieldRule<unknown>[],
  fieldLabel?: string,
  fieldValidate?: FieldRegistration['validate'],
  isRequiredProp?: boolean | string,
): Promise<string[]> {
  const errors: string[] = [];
  const allRules: AppFormFieldRule<unknown>[] = rules ? [...rules] : [];

  if (isRequiredProp) {
    allRules.unshift({
      required: isRequiredProp,
    });
  }

  for (const rule of allRules) {
    // 1. Required Check
    if (rule.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        const message =
          typeof rule.required === 'string'
            ? rule.required
            : rule.message || `${fieldLabel || 'Trường này'} không được để trống`;
        errors.push(message);
        continue;
      }
    }

    const isEmpty =
      value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    if (isEmpty) {
      continue;
    }

    // 2. minLength Check
    if (rule.minLength !== undefined) {
      const min = typeof rule.minLength === 'number' ? rule.minLength : rule.minLength.value;
      const strVal = String(value);
      if (strVal.length < min) {
        const message =
          typeof rule.minLength === 'object' && rule.minLength.message
            ? rule.minLength.message
            : rule.message || `${fieldLabel || 'Trường này'} phải có tối thiểu ${min} ký tự`;
        errors.push(message);
      }
    }

    // 3. maxLength Check
    if (rule.maxLength !== undefined) {
      const max = typeof rule.maxLength === 'number' ? rule.maxLength : rule.maxLength.value;
      const strVal = String(value);
      if (strVal.length > max) {
        const message =
          typeof rule.maxLength === 'object' && rule.maxLength.message
            ? rule.maxLength.message
            : rule.message || `${fieldLabel || 'Trường này'} không được vượt quá ${max} ký tự`;
        errors.push(message);
      }
    }

    // 4. min Numeric Check
    if (rule.min !== undefined) {
      const min = typeof rule.min === 'number' ? rule.min : rule.min.value;
      const numVal = Number(value);
      if (isNaN(numVal) || numVal < min) {
        const message =
          typeof rule.min === 'object' && rule.min.message
            ? rule.min.message
            : rule.message || `${fieldLabel || 'Giá trị'} phải lớn hơn hoặc bằng ${min}`;
        errors.push(message);
      }
    }

    // 5. max Numeric Check
    if (rule.max !== undefined) {
      const max = typeof rule.max === 'number' ? rule.max : rule.max.value;
      const numVal = Number(value);
      if (isNaN(numVal) || numVal > max) {
        const message =
          typeof rule.max === 'object' && rule.max.message
            ? rule.max.message
            : rule.message || `${fieldLabel || 'Giá trị'} phải nhỏ hơn hoặc bằng ${max}`;
        errors.push(message);
      }
    }

    // 6. email Check
    if (rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        const message =
          typeof rule.email === 'string'
            ? rule.email
            : rule.message || 'Địa chỉ email không đúng định dạng';
        errors.push(message);
      }
    }

    // 7. pattern Check
    if (rule.pattern) {
      const regex = rule.pattern instanceof RegExp ? rule.pattern : rule.pattern.value;
      if (!regex.test(String(value))) {
        const message =
          typeof rule.pattern === 'object' &&
          !(rule.pattern instanceof RegExp) &&
          rule.pattern.message
            ? rule.pattern.message
            : rule.message || `${fieldLabel || 'Định dạng'} không hợp lệ`;
        errors.push(message);
      }
    }

    // 8. custom rule.validate function
    if (rule.validate) {
      try {
        const res = await rule.validate(value, formValues);
        if (typeof res === 'string') {
          errors.push(res);
        } else if (Array.isArray(res)) {
          errors.push(...res.filter(Boolean));
        } else if (res === false && rule.message) {
          errors.push(rule.message);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Giá trị không hợp lệ';
        errors.push(msg);
      }
    }
  }

  // 9. Dedicated fieldValidate
  if (fieldValidate) {
    try {
      const res = await fieldValidate(value, formValues);
      if (typeof res === 'string') {
        errors.push(res);
      } else if (Array.isArray(res)) {
        errors.push(...res.filter(Boolean));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Giá trị không hợp lệ';
      errors.push(msg);
    }
  }

  return errors;
}

export interface AppFormProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children' | 'onError'> {
  initialValues?: T;
  values?: T;
  validationSchema?: z.ZodType<unknown>;
  validate?: (
    values: T,
  ) => Record<string, string | string[]> | Promise<Record<string, string | string[]>>;
  validateOn?: 'blur' | 'change' | 'submit';
  onSubmit?: (values: T, helpers: AppFormHelpers<T>) => void | Promise<void>;
  onError?: (errors: AppFormErrors) => void;
  children?: React.ReactNode | ((context: AppFormContextValue<T>) => React.ReactNode);
}

export function AppForm<T extends Record<string, unknown> = Record<string, unknown>>({
  initialValues = {} as T,
  values: controlledValues,
  validationSchema,
  validate: customValidate,
  validateOn = 'blur',
  onSubmit,
  onError,
  onReset,
  id,
  className,
  children,
  ...formProps
}: AppFormProps<T>) {
  const generatedFormId = React.useId();
  const formId = id || `app-form-${generatedFormId.replace(/:/g, '')}`;

  const [internalValues, setInternalValues] = React.useState<T>(initialValues);
  const values = controlledValues ?? internalValues;

  const [errors, setErrorsState] = React.useState<AppFormErrors>({});
  const [touched, setTouchedState] = React.useState<AppFormTouched>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const registeredFieldsRef = React.useRef<Map<string, FieldRegistration>>(new Map());

  const isDirty = React.useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  const isValid = React.useMemo(() => {
    return Object.values(errors).every(errList => !errList || errList.length === 0);
  }, [errors]);

  const setFieldError = React.useCallback((name: string, error: string | string[] | null) => {
    setErrorsState(prev => {
      const next = { ...prev };
      if (!error) {
        delete next[name];
      } else {
        next[name] = Array.isArray(error) ? error.filter(Boolean) : [error];
      }
      return next;
    });
  }, []);

  const setErrors = React.useCallback((newErrors: Record<string, string | string[]>) => {
    const formatted: AppFormErrors = {};
    for (const [key, val] of Object.entries(newErrors)) {
      if (val) {
        formatted[key] = Array.isArray(val) ? val.filter(Boolean) : [val];
      }
    }
    setErrorsState(formatted);
  }, []);

  // Field level validation runner
  const validateSingleField = React.useCallback(
    async (fieldName: string, fieldValue: unknown): Promise<boolean> => {
      const registration = registeredFieldsRef.current.get(fieldName);
      const currentValues = { ...values, [fieldName]: fieldValue };
      const fieldErrors: string[] = [];

      // 1. Check registered field rules
      if (registration) {
        const ruleErrors = await validateFieldWithRules(
          fieldValue,
          currentValues,
          registration.rules,
          registration.label,
          registration.validate,
          registration.required,
        );
        fieldErrors.push(...ruleErrors);
      }

      // 2. Check Zod schema if present
      if (validationSchema) {
        const parseResult = await validationSchema.safeParseAsync(currentValues);
        if (!parseResult.success) {
          const zodIssues = parseResult.error.issues.filter(
            issue => issue.path.length > 0 && String(issue.path[0]) === fieldName,
          );
          for (const issue of zodIssues) {
            if (!fieldErrors.includes(issue.message)) {
              fieldErrors.push(issue.message);
            }
          }
        }
      }

      // 3. Check customValidate if present
      if (customValidate) {
        const formErrResult = await customValidate(currentValues);
        const specificErr = formErrResult[fieldName];
        if (specificErr) {
          const list = Array.isArray(specificErr) ? specificErr : [specificErr];
          for (const msg of list) {
            if (!fieldErrors.includes(msg)) {
              fieldErrors.push(msg);
            }
          }
        }
      }

      setFieldError(fieldName, fieldErrors.length > 0 ? fieldErrors : null);
      return fieldErrors.length === 0;
    },
    [values, validationSchema, customValidate, setFieldError],
  );

  const setFieldValue = React.useCallback(
    (name: string, value: unknown, shouldValidate: boolean = false) => {
      setInternalValues(prev => ({
        ...prev,
        [name]: value,
      }));

      if (shouldValidate || validateOn === 'change' || (validateOn === 'blur' && touched[name])) {
        void validateSingleField(name, value);
      }
    },
    [validateOn, touched, validateSingleField],
  );

  const setFieldTouched = React.useCallback(
    (name: string, isTouched: boolean = true, shouldValidate: boolean = true) => {
      setTouchedState(prev => ({
        ...prev,
        [name]: isTouched,
      }));

      if (shouldValidate) {
        void validateSingleField(name, values[name]);
      }
    },
    [values, validateSingleField],
  );

  const resetForm = React.useCallback(
    (nextValues?: Partial<T>) => {
      setInternalValues((nextValues as T) || initialValues);
      setErrorsState({});
      setTouchedState({});
      setIsSubmitted(false);
      setIsSubmitting(false);
    },
    [initialValues],
  );

  // Form level validation runner
  const runFullValidation = React.useCallback(async (): Promise<{
    isValid: boolean;
    errors: AppFormErrors;
  }> => {
    const allErrors: AppFormErrors = {};

    // 1. Validate all registered fields
    for (const [name, reg] of registeredFieldsRef.current.entries()) {
      const val = values[name];
      const fieldErrors = await validateFieldWithRules(
        val,
        values,
        reg.rules,
        reg.label,
        reg.validate,
        reg.required,
      );
      if (fieldErrors.length > 0) {
        allErrors[name] = fieldErrors;
      }
    }

    // 2. Validate Zod schema
    if (validationSchema) {
      const parseResult = await validationSchema.safeParseAsync(values);
      if (!parseResult.success) {
        for (const issue of parseResult.error.issues) {
          const field = issue.path.length > 0 ? String(issue.path[0]) : '_form';
          if (!allErrors[field]) {
            allErrors[field] = [];
          }
          if (!allErrors[field].includes(issue.message)) {
            allErrors[field].push(issue.message);
          }
        }
      }
    }

    // 3. Validate customValidate
    if (customValidate) {
      const customErrors = await customValidate(values);
      for (const [key, msg] of Object.entries(customErrors)) {
        if (!msg) continue;
        const msgList = Array.isArray(msg) ? msg : [msg];
        if (!allErrors[key]) {
          allErrors[key] = [];
        }
        for (const m of msgList) {
          if (!allErrors[key].includes(m)) {
            allErrors[key].push(m);
          }
        }
      }
    }

    setErrorsState(allErrors);
    return {
      isValid: Object.keys(allErrors).length === 0,
      errors: allErrors,
    };
  }, [values, validationSchema, customValidate]);

  const validateForm = React.useCallback(async (): Promise<boolean> => {
    const result = await runFullValidation();
    return result.isValid;
  }, [runFullValidation]);

  const submitForm = React.useCallback(async (): Promise<boolean> => {
    setIsSubmitted(true);

    // Mark all registered fields as touched
    const allTouched: AppFormTouched = {};
    for (const key of registeredFieldsRef.current.keys()) {
      allTouched[key] = true;
    }
    setTouchedState(allTouched);

    const { isValid: isFormValid, errors: formErrors } = await runFullValidation();

    if (!isFormValid) {
      const firstErrorField = Object.keys(formErrors).find(key => formErrors[key]?.length > 0);
      if (firstErrorField) {
        const el =
          document.getElementById(`${formId}-${firstErrorField}`) ||
          document.querySelector<HTMLElement>(`[name="${firstErrorField}"]`);
        if (el && typeof el.focus === 'function') {
          el.focus();
        }
      }
      onError?.(formErrors);
      return false;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values, {
          values,
          errors,
          touched,
          isSubmitting: true,
          isSubmitted: true,
          isValid: true,
          isDirty,
          setFieldValue,
          setFieldError,
          setErrors,
          setFieldTouched,
          setSubmitting: setIsSubmitting,
          resetForm,
          validateForm,
          validateField: (name: string) => validateSingleField(name, values[name]),
          submitForm,
        });
      } finally {
        setIsSubmitting(false);
      }
    }

    return true;
  }, [
    formId,
    runFullValidation,
    validateForm,
    onSubmit,
    onError,
    values,
    errors,
    touched,
    isDirty,
    setFieldValue,
    setFieldError,
    setErrors,
    setFieldTouched,
    resetForm,
    validateSingleField,
  ]);

  const registerField = React.useCallback((name: string, registration: FieldRegistration) => {
    registeredFieldsRef.current.set(name, registration);
    return () => {
      registeredFieldsRef.current.delete(name);
    };
  }, []);

  const handleFieldChange = React.useCallback(
    (name: string, value: unknown) => {
      setInternalValues(prev => ({
        ...prev,
        [name]: value,
      }));

      if (validateOn === 'change' || (validateOn === 'blur' && (touched[name] || isSubmitted))) {
        void validateSingleField(name, value);
      }
    },
    [validateOn, touched, isSubmitted, validateSingleField],
  );

  const handleFieldBlur = React.useCallback(
    (name: string) => {
      setTouchedState(prev => ({
        ...prev,
        [name]: true,
      }));

      if (validateOn === 'blur' || validateOn === 'change') {
        void validateSingleField(name, values[name]);
      }
    },
    [validateOn, values, validateSingleField],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitForm();
  };

  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    resetForm();
    onReset?.(e);
  };

  const contextValue = React.useMemo<AppFormContextValue<T>>(
    () => ({
      formId,
      values,
      errors,
      touched,
      isSubmitting,
      isSubmitted,
      isValid,
      isDirty,
      validateOn,
      setFieldValue,
      setFieldError,
      setErrors,
      setFieldTouched,
      setSubmitting: setIsSubmitting,
      resetForm,
      validateForm,
      validateField: (name: string) => validateSingleField(name, values[name]),
      submitForm,
      registerField,
      handleFieldChange,
      handleFieldBlur,
    }),
    [
      formId,
      values,
      errors,
      touched,
      isSubmitting,
      isSubmitted,
      isValid,
      isDirty,
      validateOn,
      setFieldValue,
      setFieldError,
      setErrors,
      setFieldTouched,
      resetForm,
      validateForm,
      validateSingleField,
      submitForm,
      registerField,
      handleFieldChange,
      handleFieldBlur,
    ],
  );

  return (
    <AppFormContext.Provider
      value={contextValue as unknown as AppFormContextValue<Record<string, unknown>>}
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        onReset={handleReset}
        noValidate
        className={cn('w-full', className)}
        {...formProps}
      >
        {typeof children === 'function' ? children(contextValue) : children}
      </form>
    </AppFormContext.Provider>
  );
}

export type AppFormSubmitProps = Omit<AppButtonProps, 'type'>;

export const AppFormSubmit: React.FC<AppFormSubmitProps> = ({
  children,
  isLoading,
  disabled,
  ...props
}) => {
  const context = useOptionalAppFormContext();
  const isSubmitting = isLoading ?? context?.isSubmitting ?? false;

  return (
    <AppButton
      type="submit"
      isLoading={isSubmitting}
      disabled={disabled || isSubmitting}
      {...props}
    >
      {children}
    </AppButton>
  );
};

export * from './app-form-field';
