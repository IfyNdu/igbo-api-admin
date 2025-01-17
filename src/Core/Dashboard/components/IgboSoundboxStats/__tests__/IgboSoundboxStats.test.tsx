import React from 'react';
import moment from 'moment';
import { render } from '@testing-library/react';
import TestContext from 'src/__tests__/components/TestContext';
import * as reactAdmin from 'react-admin';
import UserRoles from 'src/backend/shared/constants/UserRoles';
import IgboSoundboxStats, { calculatePayment } from '../IgboSoundboxStats';

describe('IgboSoundboxStats', () => {
  it('render the Igbo soundbox stats component as admin', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: UserRoles.ADMIN } });
    const recordingStats = {
      recorded: 10,
      verified: 15,
      allRecorded: {},
    };
    const audioStats = { audioApprovalsCount: 20, audioDenialsCount: 25 };
    const { findByText } = render(
      <TestContext>
        <IgboSoundboxStats recordingStats={recordingStats} audioStats={audioStats} />
      </TestContext>,
    );

    await findByText('Recorded example sentence audio');
    await findByText('Verified example sentences');
    await findByText('Approved audio recordings');
    await findByText('Denied audio recordings');
    await findByText('Monthly merged recorded audio');
    await findByText('The number of merged (verified) recorded audio for each month');
    await findByText('Previous month');
    await findByText('Next month');
    await findByText(`Total recorded audio for ${moment().format('MMM, YYYY')}`);
    await findByText('Price to be paid to the user:');
    await findByText('$0.00');
    await findByText('10');
    await findByText('15');
    await findByText('20');
    await findByText('25');
    await findByText('-1');
  });

  it('hides the payment calculation for non admins', async () => {
    jest
      .spyOn(reactAdmin, 'usePermissions')
      .mockReturnValue({ loading: false, loaded: true, permissions: { role: UserRoles.CROWDSOURCER } });
    const recordingStats = {
      recorded: 10,
      verified: 15,
      allRecorded: {},
    };
    const audioStats = { audioApprovalsCount: 20, audioDenialsCount: 25 };
    const { findByText, queryByText } = render(
      <TestContext>
        <IgboSoundboxStats recordingStats={recordingStats} audioStats={audioStats} />
      </TestContext>,
    );

    await findByText('Recorded example sentence audio');
    await findByText('Verified example sentences');
    await findByText('Approved audio recordings');
    await findByText('Denied audio recordings');
    await findByText('Monthly merged recorded audio');
    await findByText('The number of merged (verified) recorded audio for each month');
    await findByText('Previous month');
    await findByText('Next month');
    await findByText(`Total recorded audio for ${moment().format('MMM, YYYY')}`);
    await findByText('10');
    await findByText('15');
    await findByText('20');
    await findByText('25');
    await findByText('-1');
    expect(queryByText('Price to be paid to the user:')).toBeNull();
    expect(queryByText('$0.00')).toBeNull();
  });

  it('calculates the expected payment', () => {
    const count = 100;
    expect(calculatePayment(count)).toEqual('$2.00');
  });
  it('returns no dollars for invalid string input', () => {
    // @ts-expect-error
    expect(calculatePayment('invalid')).toEqual('$0.00');
  });
  it('returns no dollars for invalid NaN input', () => {
    expect(calculatePayment(parseInt('invalid', 10))).toEqual('$0.00');
  });
});
