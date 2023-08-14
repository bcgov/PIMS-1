import { Box, Grid, Stack, Typography } from '@mui/material';
import { FastCurrencyInput, FastInput, FastSelect } from 'components/common/form';
import { EvaluationKeys } from 'constants/evaluationKeys';
import { FiscalKeys } from 'constants/fiscalKeys';
import { indexOfFinancial } from 'features/properties/components/forms/subforms/EvaluationForm';
import { getIn, useFormikContext } from 'formik';
import moment from 'moment';
import React, { CSSProperties, Dispatch, SetStateAction } from 'react';
import { FaEdit } from 'react-icons/fa';
import styled from 'styled-components';
import { formatFiscalYear } from 'utils';

import { HeaderDivider } from './HeaderDivider';

interface IUsageValuationProps {
  withNameSpace: Function;
  disabled?: boolean;
  classifications: any;
  editInfo: {
    identification: boolean;
    usage: boolean;
    valuation: boolean;
  };
  setEditInfo: Dispatch<SetStateAction<object>>;
}

export const UsageValuation: React.FC<any> = (props: IUsageValuationProps) => {
  const { setEditInfo, editInfo, withNameSpace, classifications, disabled } = props;
  const formikProps = useFormikContext();

  const currentYear = moment().year();

  const fiscalIndex = indexOfFinancial(
    getIn(formikProps.values, withNameSpace('fiscals')),
    FiscalKeys.NetBook,
    currentYear,
  );

  const evaluationIndex = indexOfFinancial(
    getIn(formikProps.values, withNameSpace('evaluations')),
    EvaluationKeys.Assessed,
    currentYear,
  );

  const netBookYear = getIn(formikProps.values, withNameSpace(`fiscals.${fiscalIndex}.fiscalYear`));

  // Style Constants
  const leftColumnWidth = 3;
  const rightColumnWidth = 12 - leftColumnWidth;
  const boldFontWeight = 700;
  const fontSize = 14;
  const rightColumnStyle: CSSProperties = { display: 'flex', justifyContent: 'left' };
  const StyledProjectNumbers = styled.div`
    flex-direction: column;
    display: flex;
  `;
  const headerColour = '#1a57c7';

  return (
    <>
      {/* USAGE */}
      <div className="usage">
        <Box sx={{ p: 2, background: 'white' }}>
          {/* HEADER */}
          <Stack direction="row" spacing={1}>
            <Typography text-align="left" sx={{ fontWeight: boldFontWeight, color: headerColour }}>
              Usage
            </Typography>
            {!disabled && (
              <Box sx={{ pl: 1 }}>
                <FaEdit
                  size={20}
                  className="edit"
                  onClick={() => {
                    setEditInfo({
                      ...editInfo,
                      usage: formikProps.isValid && !editInfo.usage,
                    });
                  }}
                />
              </Box>
            )}
          </Stack>
          <HeaderDivider />

          {/* CONTENT */}
          <Grid container sx={{ textAlign: 'left' }} rowSpacing={0.5}>
            {/* CLASSIFICATION */}
            <Grid item xs={leftColumnWidth}>
              <Typography fontSize={fontSize}>Classification:</Typography>
            </Grid>
            <Grid item xs={rightColumnWidth}>
              <FastSelect
                formikProps={formikProps}
                disabled={editInfo.usage}
                type="number"
                placeholder="Must Select One"
                field={withNameSpace('classificationId')}
                options={classifications}
                required={true}
              />
            </Grid>

            {/* CURRENT ZONING */}
            <Grid item xs={leftColumnWidth}>
              <Typography fontSize={fontSize}>Current Zoning:</Typography>
            </Grid>
            <Grid item xs={rightColumnWidth}>
              <FastInput
                formikProps={formikProps}
                disabled={editInfo.usage}
                field={withNameSpace('zoning')}
              />
            </Grid>

            {/* POTENTIAL ZONING */}
            <Grid item xs={leftColumnWidth}>
              <Typography fontSize={fontSize}>Potential Zoning:</Typography>
            </Grid>
            <Grid item xs={rightColumnWidth}>
              <FastInput
                formikProps={formikProps}
                disabled={editInfo.usage}
                field={withNameSpace('zoningPotential')}
              />
            </Grid>
          </Grid>
        </Box>
      </div>

      {/* VALUATION */}
      <div className="valuation">
        <Box sx={{ p: 2, background: 'white' }}>
          {/* HEADER */}
          <Stack direction="row" spacing={1}>
            <Typography text-align="left" sx={{ fontWeight: boldFontWeight, color: headerColour }}>
              Valuation
            </Typography>
            {!disabled && (
              <Box sx={{ pl: 1 }}>
                <FaEdit
                  size={20}
                  className="edit"
                  onClick={() => {
                    setEditInfo({
                      ...editInfo,
                      valuation: formikProps.isValid && !editInfo.valuation,
                    });
                  }}
                />
              </Box>
            )}
          </Stack>
          <HeaderDivider />

          {/* CONTENT */}
          <Grid container sx={{ textAlign: 'left' }} rowSpacing={0.5}>
            {/* NET BOOK VALUE */}
            <Grid item xs={leftColumnWidth}>
              <Typography fontSize={fontSize}>Net Book Value:</Typography>
            </Grid>
            <Grid container item xs={rightColumnWidth}>
              <Grid item xs={4}>
                <FastCurrencyInput
                  formikProps={formikProps}
                  field={withNameSpace(`fiscals.${fiscalIndex}.value`)}
                  disabled={editInfo.valuation}
                />
              </Grid>
              <Grid item xs={3}>
                <FastInput
                  formikProps={formikProps}
                  field="netBookYearDisplay"
                  value={formatFiscalYear(netBookYear)}
                  disabled
                  style={{ width: 50, fontSize: 11 }}
                />
              </Grid>
            </Grid>

            {/* ASSESSED VALUE */}
            <Grid item xs={leftColumnWidth}>
              <Typography fontSize={fontSize}>Assessed Value:</Typography>
            </Grid>
            <Grid container item xs={rightColumnWidth}>
              <Grid item xs={4}>
                <FastCurrencyInput
                  formikProps={formikProps}
                  field={withNameSpace(`evaluations.${evaluationIndex}.value`)}
                  disabled={editInfo.valuation}
                />
              </Grid>
              <Grid item xs={3}>
                <FastInput
                  formikProps={formikProps}
                  field={withNameSpace(`evaluations.${evaluationIndex}.year`)}
                  disabled
                  style={{ width: 50, fontSize: 11 }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  );
};
