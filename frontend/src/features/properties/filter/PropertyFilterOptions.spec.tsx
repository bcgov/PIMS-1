/* eslint-disable @typescript-eslint/no-empty-function */
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import { useApi } from 'hooks/useApi';
import React from 'react';
import { Mock, vi } from 'vitest';

import { PropertyFilterOptions } from '.';
import { IPropertyFilter } from './IPropertyFilter';

vi.mock('axios');
vi.mock('@react-keycloak/web');
vi.mock('hooks/useApi');
(useApi as Mock).mockReturnValue({
  searchAddress: vi.fn((val: string) => {
    return Promise.resolve([]);
  }),
});

const filter: IPropertyFilter = {
  searchBy: 'address',
  pid: '',
  address: '',
  administrativeArea: '',
  projectNumber: '',
  agencies: '',
  classificationId: '',
  minLotSize: '',
  maxLotSize: '',
  rentableArea: '',
};

const component = (filter: IPropertyFilter) => (
  <div>
    <Formik initialValues={filter} onSubmit={(values, helpers) => {}}>
      <PropertyFilterOptions />
    </Formik>
  </div>
);

describe('PropertyFilterOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders for address', () => {
    const { container } = render(component(filter));
    expect(container.firstChild).toMatchSnapshot('address');
  });

  it('renders for pid', () => {
    const { container } = render(component({ ...filter, searchBy: 'pid' }));
    expect(container.firstChild).toMatchSnapshot('pid');
  });

  it('make request to geocoder', async () => {
    const value = '12345';
    const api = useApi();

    const { container } = render(component(filter));
    const address = container.querySelector('input[name="address"]');

    await waitFor(() => {
      fireEvent.change(address!, {
        target: {
          value: value,
        },
      });
      expect(api.searchAddress).toBeCalledTimes(1);
      expect(api.searchAddress).toBeCalledWith(value);
    });
  });

  it('less than 5 characters', async () => {
    const value = '1234';
    const api = useApi();

    const { container } = render(component(filter));
    const address = container.querySelector('input[name="address"]');

    await waitFor(() => {
      fireEvent.change(address!, {
        target: {
          value: value,
        },
      });
      expect(api.searchAddress).toBeCalledTimes(0);
    });
  });

  it('do not make request to geocoder', async () => {
    const value = '12345';
    const api = useApi();

    const { container } = render(component({ ...filter, address: value }));
    const address = container.querySelector('input[name="address"]');

    await waitFor(() => {
      fireEvent.change(address!, {
        target: {
          value: value,
        },
      });
      expect(api.searchAddress).toBeCalledTimes(0);
    });
  });
});
