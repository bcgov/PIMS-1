import { ContentPaste as PasteIcon } from '@mui/icons-material';
import { Box, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { IParcel } from 'actions/parcelsActions';
import { ReactComponent as ParcelDraftIcon } from 'assets/images/draft-parcel-icon.svg';
import { FastInput, Input } from 'components/common/form';
import SearchButton from 'components/common/form/SearchButton';
import { ISteppedFormValues } from 'components/common/form/StepForm';
import { Label } from 'components/common/Label';
import { pidFormatter } from 'features/properties/components/forms/subforms/PidPinForm';
import { GeocoderAutoComplete } from 'features/properties/components/GeocoderAutoComplete';
import { getIn, useFormikContext } from 'formik';
import { IGeocoderResponse } from 'hooks/useApi';
import React, { SyntheticEvent, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { withNameSpace } from 'utils/formUtils';

import { ISearchFields } from '../LandForm';

interface ISearchFormProps {
  /** used for determining nameSpace of field */
  nameSpace?: string;
  /** handle the population of Geocoder information */
  handleGeocoderChanges: (data: IGeocoderResponse, nameSpace?: string) => Promise<void>;
  /** help set the cursor type when click the add marker button */
  setMovingPinNameSpace: (nameSpace?: string) => void;
  /** handle the pid formatting on change */
  handlePidChange: (pid: string, nameSpace?: string) => void;
  /** handle the pin formatting on change */
  handlePinChange: (pin: string, nameSpace?: string) => void;
}

/**
 * Search component which displays a vertically stacked set of search fields, used to find matching parcels within pims or the parcel layer.
 * @param {ISearchFormProps} param0
 */
const LandSearchForm = ({
  nameSpace,
  handleGeocoderChanges,
  handlePidChange,
  handlePinChange,
}: ISearchFormProps) => {
  const [geocoderResponse, setGeocoderResponse] = useState<IGeocoderResponse | undefined>();
  const [tab, setTab] = useState<number>(0);

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const formikProps = useFormikContext<ISteppedFormValues<IParcel & ISearchFields>>();
  const { searchPin, searchPid, searchAddress } = getIn(
    formikProps.values,
    withNameSpace(nameSpace),
  );

  const handlePasteFromClipboard = (field: string) => {
    navigator.clipboard
      .readText()
      .then((text) => {
        formikProps.setFieldValue(withNameSpace(nameSpace, field), text);
        const input: unknown = document.getElementsByName(`data.${field}`)[0];
        if ((input as HTMLInputElement).type === 'text') (input as HTMLInputElement).value = text;
      })
      .catch((err) => {
        console.error('Failed to read clipboard contents: ', err);
      });
  };

  return (
    <Row className="section g-0">
      <Col md={12}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="Search for Property" id="parcel-search-tab" />
            <Tab label="Select a Parcel from the Map" id="parcel-marker-tab" />
          </Tabs>
        </Box>

        {/* Search Tab */}
        <Box role="tabpanel" hidden={tab !== 0} id="parcel-tabpanel-search" sx={{ p: 3 }}>
          <Row style={{ alignItems: 'center', marginBottom: 5 }}>
            <Col md={2} style={{ textAlign: 'left' }}>
              <Label>PID</Label>
            </Col>
            <Col md="auto" style={{ marginLeft: '-11px' }}>
              <Input
                displayErrorTooltips
                className="input-small"
                disabled={false}
                pattern={RegExp(/^[\d\- ]*$/)}
                onBlurFormatter={(pid: string) => {
                  if (pid?.length > 0) {
                    return pid.replace(pid, pidFormatter(pid));
                  }
                  return '';
                }}
                field={withNameSpace(nameSpace, 'searchPid')}
              />
            </Col>
            <Col md="auto" style={{ marginLeft: '-40px' }}>
              <IconButton onClick={() => handlePasteFromClipboard('searchPid')}>
                <Tooltip title="Paste From Clipboard">
                  <PasteIcon />
                </Tooltip>
              </IconButton>
            </Col>
            <Col md="auto" style={{ marginLeft: '-13px' }}>
              <SearchButton
                onClick={(e: any) => {
                  e.preventDefault();
                  handlePidChange(searchPid, nameSpace);
                }}
              />
            </Col>
          </Row>
          <Row style={{ alignItems: 'center', marginBottom: 5 }}>
            <Col md={2} style={{ textAlign: 'left' }}>
              <Label>PIN</Label>
            </Col>
            <Col md="auto">
              <FastInput
                formikProps={formikProps}
                displayErrorTooltips
                className="input-small"
                disabled={false}
                field={withNameSpace(nameSpace, 'searchPin')}
                onBlurFormatter={(pin: number) => {
                  if (pin > 0) {
                    return pin;
                  }
                  return '';
                }}
                type="number"
              />
            </Col>
            <Col md="auto" style={{ marginLeft: '-27px' }}>
              <IconButton onClick={() => handlePasteFromClipboard('searchPin')}>
                <Tooltip title="Paste From Clipboard">
                  <PasteIcon />
                </Tooltip>
              </IconButton>
            </Col>
            <Col md="auto" style={{ marginLeft: '-13px' }}>
              <SearchButton
                onClick={(e: any) => {
                  e.preventDefault();
                  handlePinChange(searchPin, nameSpace);
                }}
              />
            </Col>
          </Row>
          <Row style={{ alignItems: 'center' }}>
            <Col md={2} style={{ textAlign: 'left' }}>
              <Label>Street Address</Label>
            </Col>
            <Col md="auto">
              <GeocoderAutoComplete
                value={searchAddress}
                field={withNameSpace(nameSpace, 'searchAddress')}
                onSelectionChanged={(selection) => {
                  formikProps.setFieldValue(
                    withNameSpace(nameSpace, 'searchAddress'),
                    selection.fullAddress,
                  );
                  setGeocoderResponse(selection);
                }}
                onTextChange={(value) => {
                  if (value !== geocoderResponse?.address1) {
                    setGeocoderResponse(undefined);
                  }
                  formikProps.setFieldValue(withNameSpace(nameSpace, 'searchAddress'), value);
                }}
                error={getIn(formikProps.errors, withNameSpace(nameSpace, 'searchAddress'))}
                touch={getIn(formikProps.touched, withNameSpace(nameSpace, 'searchAddress'))}
                displayErrorTooltips
              />
            </Col>
            <Col md="auto" style={{ marginLeft: '-27px' }}>
              <IconButton onClick={() => handlePasteFromClipboard('searchAddress')}>
                <Tooltip title="Paste From Clipboard">
                  <PasteIcon />
                </Tooltip>
              </IconButton>
            </Col>
            <Col md="auto" style={{ marginLeft: '-13px' }}>
              <SearchButton
                disabled={!geocoderResponse}
                onClick={(e: any) => {
                  e.preventDefault();
                  geocoderResponse && handleGeocoderChanges(geocoderResponse, nameSpace);
                }}
              />
            </Col>
          </Row>
        </Box>

        {/* Marker Tab */}
        <Box role="tabpanel" hidden={tab !== 1} id="parcel-tabpanel-marker" sx={{ p: 3 }}>
          <Row style={{ alignItems: 'center' }}>
            <Col md="auto">
              Find a parcel on the map and click it to populate the Parcel Details below.
            </Col>
            <Col className="marker-svg">
              <ParcelDraftIcon className="parcel-icon" />
            </Col>
          </Row>
        </Box>
      </Col>
    </Row>
  );
};

export default LandSearchForm;
