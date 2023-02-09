import { render } from '@testing-library/react';
import { getIn, useFormikContext } from 'formik';
import { noop } from 'lodash';
import * as React from 'react';
import { Mock, vi } from 'vitest';

import ExemptionRequest from './ExemptionRequest';

vi.mock('formik');
(useFormikContext as Mock).mockReturnValue({
  values: {
    exemptionRequested: false,
    handleChange: noop,
    setFieldValue: noop,
  },
});

const renderComponent = (
  exemptionLabel?: string,
  rationaleInstruction?: string,
  tooltip?: string,
  sectionHeader?: string,
  submissionStep?: boolean,
) => {
  return render(
    <ExemptionRequest
      exemptionField="testFieldOne"
      rationaleField="testFieldTwo"
      exemptionLabel={exemptionLabel}
      rationaleInstruction={rationaleInstruction}
      tooltip={tooltip}
      sectionHeader={sectionHeader}
      submissionStep={submissionStep}
    />,
  );
};

describe('Exemption Request test', () => {
  it('Matches Snapshot', () => {
    const { container } = render(
      <ExemptionRequest
        exemptionField="testFieldOne"
        rationaleField="testFieldTwo"
        submissionStep={true}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('does not display rationale box when checkbox is not checked', () => {
    // false by default
    const { queryByText } = renderComponent('label', 'instruction', 'tooltip', 'header', true);
    expect(queryByText('Rationale')).toBeNull();
  });

  it('does not display checkbox on Approval step', () => {
    const { queryByText } = renderComponent(
      'checkbox label',
      'instruction',
      'tooltip',
      'header',
      false,
    );
    expect(queryByText('checkbox label')).toBeNull();
    expect(queryByText('instruction')).toBeInTheDocument();
    expect(queryByText('tooltip')).toBeNull();
  });

  describe('rationale functionality', () => {
    it('displays rationale field when clicked', () => {
      (getIn as Mock).mockReturnValue(true);
      const { getByText } = renderComponent();
      expect(getByText('Rationale')).toBeInTheDocument();
    });
    it('renders props when provided', () => {
      (getIn as Mock).mockReturnValue(true);
      (useFormikContext as Mock).mockReturnValue({
        values: {
          exemptionRequested: false,
        },
        handleChange: noop,
        setFieldValue: noop,
        setFieldTouched: noop,
      });
      const { getByText } = renderComponent(
        'test label',
        'test rationale instruction',
        '',
        'test header',
        true,
      );
      expect(getByText('test label')).toBeInTheDocument();
      expect(getByText('test rationale instruction')).toBeInTheDocument();
      expect(getByText('test header')).toBeInTheDocument();
    });
  });
});
