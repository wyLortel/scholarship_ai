import { useId, type SelectHTMLAttributes } from "react";

import { cx } from "./cx";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label: string;
  options: SelectOption[];
  /** 아무것도 고르지 않은 첫 줄. 기본값 "선택" */
  placeholder?: string;
  hint?: string;
  error?: string;
};

// 라벨 + 선택 상자. '모름' 같은 선택지는 호출하는 쪽이 options에 넣는다(값의 의미를 부품이 정하지 않음).
export function SelectField({
  label,
  options,
  placeholder = "선택",
  hint,
  error,
  id,
  className,
  defaultValue = "",
  ...rest
}: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  return (
    <div className={cx("ui-field", className)}>
      <label className="ui-field__label" htmlFor={selectId}>
        {label}
      </label>
      {hint && (
        <span className="ui-field__hint" id={hintId}>
          {hint}
        </span>
      )}
      <select
        id={selectId}
        className="ui-input"
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(hintId, errorId) || undefined}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="ui-field__error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
