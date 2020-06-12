import React, { useRef } from 'react';
import SelectProjectPropertiesStep from '../steps/SelectProjectPropertiesStep';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from 'react-bootstrap';
import { FormikValues } from 'formik';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

const FlexRight = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  margin: 0.5rem 0;
`;

/**
 * Display the SelectProjectPropertiesForm without the stepper and with custom action buttons.
 */
const SelectProjectPropertiesPage = () => {
  const formikRef = useRef<FormikValues>();
  const history = useHistory();

  return (
    <>
      <SelectProjectPropertiesStep formikRef={formikRef} />
      <FlexRight>
        <Button
          onClick={() => {
            formikRef.current?.submitForm().then(() => {
              history.goBack();
            });
          }}
        >
          Update
        </Button>
      </FlexRight>
    </>
  );
};

export default SelectProjectPropertiesPage;
