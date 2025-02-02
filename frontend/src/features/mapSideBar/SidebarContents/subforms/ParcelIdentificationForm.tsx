import './ParcelIdentificationForm.scss';

import { IParcel } from 'actions/parcelsActions';
import { ReactComponent as ParcelDraftIcon } from 'assets/images/draft-parcel-icon.svg';
import classNames from 'classnames';
import { Check, FastInput, InputGroup, SelectOptions, TextArea } from 'components/common/form';
import { ParentSelect } from 'components/common/form/ParentSelect';
import { ISteppedFormValues } from 'components/common/form/StepForm';
import GenericModal from 'components/common/GenericModal';
import { Label } from 'components/common/Label';
import TooltipWrapper from 'components/common/TooltipWrapper';
import { ProjectNumberLink } from 'components/maps/leaflet/InfoSlideOut/ProjectNumberLink';
import * as API from 'constants/API';
import { PropertyTypes } from 'constants/propertyTypes';
import { HARMFUL_DISCLOSURE_URL } from 'constants/strings';
import AddressForm from 'features/properties/components/forms/subforms/AddressForm';
import PidPinForm from 'features/properties/components/forms/subforms/PidPinForm';
import { getIn, useFormikContext } from 'formik';
import { IGeocoderResponse } from 'hooks/useApi';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import useCodeLookups from 'hooks/useLookupCodes';
import { useMyAgencies } from 'hooks/useMyAgencies';
import { noop } from 'lodash';
import React, { useMemo, useState } from 'react';
import { Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { mapSelectOptionWithParent } from 'utils';
import { withNameSpace } from 'utils/formUtils';

import { sensitiveTooltip } from '../../../../../src/features/properties/components/forms/strings';
import AddParentParcelsForm from './AddParentParcelsForm';
import LandSearchForm from './LandSearchForm';

interface IIdentificationProps {
  /** used for changign the agency - note that only select users will be able to edit this field */
  agencies: SelectOptions;
  /** pass the options for classifications */
  classifications: SelectOptions;
  /** used for determining nameSpace of field */
  nameSpace?: any;
  /** for list fields (eg. buildings, financials) */
  index?: any;
  /** handle the population of Geocoder information */
  handleGeocoderChanges: (data: IGeocoderResponse, nameSpace?: string) => Promise<void>;
  /** help set the cursor type when click the add marker button */
  setMovingPinNameSpace: (nameSpace?: string) => void;
  /** handle the pid formatting on change */
  handlePidChange: (pid: string, nameSpace?: string) => void;
  /** handle the pin formatting on change */
  handlePinChange: (pin: string, nameSpace?: string) => void;
  /** Function that searches for a parcel matching a pid within the API */
  findMatchingPid?: (pid: string, nameSpace?: string | undefined) => Promise<IParcel | undefined>;
  /** whether or not this user has property admin priviledges */
  isPropertyAdmin: boolean;
  /** whether or not this form is being displayed as part of a view or update */
  isViewOrUpdate: boolean;
  /** whether or not the fields on this form can be interacted with */
  disabled?: boolean;
}

const StyledProjectNumbers = styled.div`
  flex-direction: column;
  display: flex;
`;

export const ParcelIdentificationForm: React.FC<IIdentificationProps> = ({
  nameSpace,
  handleGeocoderChanges,
  setMovingPinNameSpace,
  handlePidChange,
  handlePinChange,
  findMatchingPid,
  isPropertyAdmin,
  isViewOrUpdate,
  disabled,
  ...props
}) => {
  const [overrideData, setOverrideData] = useState<IParcel>();

  const agencies = (props.agencies ?? []).map((c) => mapSelectOptionWithParent(c, props.agencies));
  const formikProps = useFormikContext<ISteppedFormValues<IParcel>>();
  const { lookupCodes } = useCodeLookups();
  const { propertyTypeId, latitude, longitude } = getIn(formikProps.values, nameSpace);
  const projectNumbers = getIn(formikProps.values, 'data.projectNumbers');
  const agencyId = getIn(formikProps.values, `data.agencyId`);
  const [privateProject, setPrivateProject] = useState(false);

  const keycloak = useKeycloakWrapper();
  const userAgency = agencies.find((a) => Number(a.value) === Number(keycloak.agencyId));

  const isUserAgencyAParent = useMemo(() => {
    return !!userAgency && !userAgency.parentId;
  }, [userAgency]);

  const myAgencies = useMyAgencies();

  return (
    <Container>
      {propertyTypeId === PropertyTypes.SUBDIVISION && (
        <Row className="section g-0">
          <AddParentParcelsForm
            nameSpace={nameSpace}
            findMatchingPid={findMatchingPid}
            disabled={disabled}
          />
        </Row>
      )}
      <Row style={{ textAlign: 'left' }}>
        <h4>Parcel Identification</h4>
      </Row>
      {!disabled && (
        <>
          {isViewOrUpdate || propertyTypeId === PropertyTypes.SUBDIVISION ? (
            <Row className="section g-0">
              <Col md={12}>
                <h5>Update Parcel Location</h5>
              </Col>
              <Col md={12} className="instruction">
                <p style={{ textAlign: 'center' }}>
                  Find a parcel on the map for the new location and click it to populate the Parcel
                  Details below.
                </p>
                <Row>
                  <Col className="marker-svg">
                    <ParcelDraftIcon className="parcel-icon" />
                  </Col>
                </Row>
              </Col>
            </Row>
          ) : (
            <LandSearchForm
              {...{
                setMovingPinNameSpace,
                nameSpace,
                handleGeocoderChanges,
                handlePidChange,
                handlePinChange,
              }}
            />
          )}
        </>
      )}
      <Row
        className={
          classNames('section', latitude === '' && longitude === '' ? 'disabled' : '') + ' g-0'
        }
      >
        <Col md={12}>
          <h5>Parcel Details</h5>
        </Col>
        <Col md={6}>
          {propertyTypeId !== PropertyTypes.SUBDIVISION && (
            <PidPinForm
              nameSpace={nameSpace}
              handlePidChange={noop}
              handlePinChange={noop}
              disabled={disabled}
            />
          )}
          <AddressForm
            parcelInformationStyles
            onGeocoderChange={(selection: IGeocoderResponse) => {
              const administrativeArea = selection.administrativeArea
                ? lookupCodes.find((code) => {
                    return (
                      code.type === API.AMINISTRATIVE_AREA_CODE_SET_NAME &&
                      code.name === selection.administrativeArea
                    );
                  })
                : undefined;
              if (administrativeArea) {
                selection.administrativeArea = administrativeArea.name;
              }
              const updatedPropertyDetail = {
                ...getIn(formikProps.values, withNameSpace(nameSpace, '')),
                latitude: selection.latitude,
                longitude: selection.longitude,
                address: {
                  ...getIn(formikProps.values, withNameSpace(nameSpace, 'address')),
                  line1: selection.address1,
                  administrativeArea: selection.administrativeArea,
                },
              };
              if (!getIn(formikProps.values, withNameSpace(nameSpace, 'latitude'))) {
                formikProps.setFieldValue(withNameSpace(nameSpace, ''), updatedPropertyDetail);
              } else {
                setOverrideData(updatedPropertyDetail);
              }
            }}
            {...formikProps}
            disabled={disabled}
            nameSpace={withNameSpace(nameSpace, 'address')}
          />
          <Row
            style={{
              alignItems: 'center',
              marginLeft: '-23px',
              marginTop: '10px',
              marginBottom: '20px',
            }}
          >
            <Col md="auto" style={{ width: '160px' }}>
              <Form.Label>Agency</Form.Label>
            </Col>
            <Col md="auto">
              <ParentSelect
                required
                field={withNameSpace(nameSpace, 'agencyId')}
                options={myAgencies.map((c) => mapSelectOptionWithParent(c, myAgencies))}
                filterBy={['code', 'label', 'parent']}
                disabled={(!isPropertyAdmin && !isUserAgencyAParent) || disabled}
              />
            </Col>
          </Row>
        </Col>
        <Col md={6} className="form-container">
          <Row style={{ justifyContent: 'right', alignItems: 'center', marginBottom: '20px' }}>
            <Col md="auto" style={{ marginRight: '-25px' }}>
              <Label>Name</Label>
            </Col>
            <Col md="auto" style={{ marginRight: '73px' }}>
              <FastInput
                disabled={disabled}
                field={withNameSpace(nameSpace, 'name')}
                formikProps={formikProps}
              />
            </Col>
          </Row>
          <Row style={{ justifyContent: 'right', alignItems: 'center', marginBottom: '20px' }}>
            <Col md="auto" style={{ marginRight: '-37px' }}>
              <Label>Description</Label>
            </Col>
            <Col md="auto" style={{ marginRight: '70px' }}>
              <TextArea disabled={disabled} field={withNameSpace(nameSpace, 'description')} />
            </Col>
          </Row>
          <Row style={{ justifyContent: 'right', alignItems: 'center', marginBottom: '20px' }}>
            <Col md="auto" style={{ marginRight: '-37px' }}>
              <Label>Legal Description</Label>
            </Col>
            <Col md="auto" style={{ marginRight: '70px' }}>
              <TextArea
                disabled={disabled}
                field={withNameSpace(nameSpace, 'landLegalDescription')}
                displayErrorTooltips
              />
            </Col>
          </Row>
          <Row style={{ justifyContent: 'right', alignItems: 'center', marginBottom: '20px' }}>
            <Col md="auto" style={{ marginRight: '-27px' }}>
              <Label>Lot Size</Label>
            </Col>
            <Col md="auto" style={{ width: '200px', marginRight: '100px' }}>
              <InputGroup
                displayErrorTooltips
                fast={true}
                disabled={disabled}
                type="number"
                field={withNameSpace(nameSpace, 'landArea')}
                formikProps={formikProps}
                postText="Hectares"
                required
              />
            </Col>
          </Row>
          {!!projectNumbers?.length && (
            <Row style={{ justifyContent: 'right', alignItems: 'center', marginBottom: '20px' }}>
              <Col md="auto">
                <Label style={{ marginTop: '1rem' }}>Project Number(s)</Label>
              </Col>
              <Col md="auto">
                <StyledProjectNumbers>
                  {projectNumbers.map((projectNum: string) => (
                    <ProjectNumberLink
                      key={projectNum}
                      projectNumber={projectNum}
                      agencyId={agencyId}
                      setPrivateProject={setPrivateProject}
                      privateProject={privateProject}
                    />
                  ))}
                </StyledProjectNumbers>
              </Col>
            </Row>
          )}
        </Col>
      </Row>

      <Row style={{ justifyContent: 'center', marginBottom: '20px' }}>
        <div className="input-medium harmful">
          <p style={{ marginBottom: '-5px' }}>
            Would this information be harmful if released?&nbsp;
          </p>
          <TooltipWrapper toolTipId="sensitive-harmful" toolTip={sensitiveTooltip}>
            <a target="_blank" rel="noopener noreferrer" href={HARMFUL_DISCLOSURE_URL}>
              Policy
            </a>
          </TooltipWrapper>
          <Check
            type="radio"
            field={withNameSpace(nameSpace, 'isSensitive')}
            radioLabelOne="Yes"
            radioLabelTwo="No"
            disabled={disabled}
          />
        </div>
      </Row>
      <GenericModal
        display={!!overrideData}
        title="Update Form Details"
        okButtonText="Update"
        cancelButtonText="Cancel"
        handleOk={() => {
          formikProps.setFieldValue(withNameSpace(nameSpace, ''), overrideData);
          setOverrideData(undefined);
        }}
        handleCancel={() => {
          setOverrideData(undefined);
        }}
        message={
          <>
            <p>
              Would you like to update this form using the Geocoder data for the updated address?
            </p>
            <h5>New Values:</h5>
            <ListGroup>
              <ListGroup.Item>Latitude: {overrideData?.latitude}</ListGroup.Item>
              <ListGroup.Item>Longitude: {overrideData?.longitude}</ListGroup.Item>
              <ListGroup.Item>Address: {overrideData?.address?.line1}</ListGroup.Item>
              <ListGroup.Item>Location: {overrideData?.address?.administrativeArea}</ListGroup.Item>
            </ListGroup>
          </>
        }
      />
    </Container>
  );
};
