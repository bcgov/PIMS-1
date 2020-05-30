import React, { useState } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { useFormikContext, getIn } from 'formik';
import { DisplayError } from './DisplayError';
import classNames from 'classnames';

type RequiredAttributes = {
  /** The field name */
  field: string;
};

type OptionalAttributes = {
  /** The form component label */
  label?: string;
  /** The underlying HTML element to use when rendering the FormControl */
  as?: React.ElementType;
  /** Short hint that describes the expected value of an <input> element */
  placeholder?: string;
  /** Adds a custom class to the input element of the <Input> component */
  className?: string;
  /** Whether the field is required. Shows an asterisk after the label. */
  required?: boolean;
  /** Specifies that the HTML element should be disabled */
  disabled?: boolean;
  /** Used for restricting user input */
  pattern?: RegExp;
  /** Use React-Bootstrap's custom form elements to replace the browser defaults */
  custom?: boolean;
  outerClassName?: string;
  onBlurFormatter?: Function;
};

// only "field" is required for <Input>, the rest are optional
export type InputProps = FormControlProps & OptionalAttributes & RequiredAttributes;

/**
 * Formik-connected <Input> form control
 */
export const Input: React.FC<InputProps> = ({
  field,
  label,
  as: is, // `as` is reserved in typescript
  placeholder,
  className,
  outerClassName,
  pattern,
  required,
  disabled,
  custom,
  onBlurFormatter,
  ...rest
}) => {
  const { handleChange, handleBlur, errors, touched, values, setFieldValue } = useFormikContext<
    any
  >();
  const error = getIn(errors, field);
  const touch = getIn(touched, field);
  const value = getIn(values, field);
  const asElement: any = is || 'input';
  const [restricted, setRestricted] = useState(value);
  const handleRestrictedChange = (event: any) => {
    let val = event.target.value;
    pattern?.test(val) && setRestricted(val);
    handleChange(event);
  };
  return (
    <Form.Group
      controlId={`input-${field}`}
      className={classNames(!!required ? 'required' : '', outerClassName)}
    >
      {!!label && (
        <Form.Label>
          {label}
          {!!required && <span className="required">*</span>}
        </Form.Label>
      )}
      <span className={className}>
        <Form.Control
          as={asElement}
          name={field}
          required={required}
          disabled={disabled}
          custom={custom}
          isInvalid={!!touch && !!error}
          {...rest}
          isValid={false}
          value={pattern ? restricted : rest.value ?? value}
          placeholder={placeholder}
          onBlur={(e: any) => {
            if (onBlurFormatter) {
              pattern && setRestricted(onBlurFormatter(value));
              setFieldValue(field, onBlurFormatter(value));
            }
            handleBlur(e);
          }}
          onChange={pattern ? handleRestrictedChange : handleChange}
        />
        {!label && !!required && <span className="required">*</span>}
        <DisplayError field={field} />
      </span>
    </Form.Group>
  );
};
