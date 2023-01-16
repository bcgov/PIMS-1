import { cleanup, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ProjectActions } from 'constants/actionTypes';
import Claims from 'constants/claims';
import * as reducerTypes from 'constants/reducerTypes';
import { createMemoryHistory } from 'history';
import useKeycloakWrapper from 'hooks/useKeycloakWrapper';
import { noop } from 'lodash';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import useKeycloakMock from 'useKeycloakWrapperMock';
import { fillInput } from 'utils/testUtils';
import * as Vitest from 'vitest';
import { vi } from 'vitest';

import useStepper from '../hooks/useStepper';
import ProjectDraftStep from './ProjectDraftStep';

const userRoles: string[] | Claims[] = [];
const userAgencies: number[] = [1];
const userAgency = 1;

vi.mock('hooks/useKeycloakWrapper');
(useKeycloakWrapper as Vitest.Mock).mockReturnValue(
  new (useKeycloakMock as any)(userRoles, userAgencies, userAgency),
);

const mockAxios = new MockAdapter(axios);
vi.mock('../hooks/useStepper');
(useStepper as Vitest.Mock).mockReturnValue({
  currentStatus: {},
  project: { agencyId: 1, projectNumber: 'TEST-NUMBER', properties: [] },
  projectStatusCompleted: noop,
  canGoToStatus: noop,
  getLastCompletedStatus: vi.fn(),
  getNextStep: vi.fn(),
});
mockAxios.onAny().reply(200, {});

const mockStore = configureMockStore([thunk]);
const history = createMemoryHistory();

const store = mockStore({
  [reducerTypes.ProjectReducers.PROJECT]: { agencyId: 1 },
  [reducerTypes.LOOKUP_CODE]: { lookupCodes: [] },
  [reducerTypes.NETWORK]: {
    requests: { [ProjectActions.GET_PROJECT]: {} },
  },
});

const uiElement = (
  <Provider store={store}>
    <MemoryRouter initialEntries={[history.location]}>
      <ProjectDraftStep />
    </MemoryRouter>
  </Provider>
);

describe('Project Draft Step', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders correctly', () => {
    const { container } = render(uiElement);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('requires name', async () => {
    const { container, findByText } = render(uiElement);
    container.querySelector('form');
    fillInput(container, 'name', '');
    fillInput(container, 'description', 'description', 'textarea');
    await waitFor(async () => {
      expect(await findByText('Required')).toBeInTheDocument();
    });
  });

  it('can be submitted after required filled', async () => {
    const { container, findByText } = render(uiElement);
    container.querySelector('form');
    fillInput(container, 'name', '');
    fillInput(container, 'description', 'description', 'textarea');
    await waitFor(async () => {
      expect(await findByText('Required')).toBeInTheDocument();
    });
  });

  it('loads the projectNumber', () => {
    render(uiElement);
    expect(screen.getByDisplayValue('TEST-NUMBER')).toBeInTheDocument();
  });
});
