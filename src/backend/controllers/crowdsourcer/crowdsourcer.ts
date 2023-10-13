import { Response } from 'express';
import { CrowdsourcerSchema } from '../../models/Crowdsourcer';
import { ReferralSchema } from '../../models/Referral';
import { handleQueries } from '../utils';
import * as Interfaces from '../utils/interfaces';

export const createReferral = async (req: Interfaces.EditorRequest, res: Response): Promise<void> => {
  const {
    mongooseConnection,
    referralCode,
    user: { uid },
  } = handleQueries(req);

  const Crowdsourcer = mongooseConnection.model<Interfaces.Crowdsourcer>('Crowdsourcer', CrowdsourcerSchema);

  const [referrer, referredUser] = await Promise.all([
    Crowdsourcer.findOne({ referralCode }),
    Crowdsourcer.findOne({ firebaseId: uid }),
  ]);

  const Referral = mongooseConnection.model<Interfaces.Referral>('Referral', ReferralSchema);

  const existingReferral = await Referral.findOne({ referredUserId: referredUser.id });
  if (existingReferral) {
    res.status(403).send({ error: `Users cannot be referred twice. Referral code [${referralCode}] will be ignored` });
  }

  await Referral.create({
    referredUserId: referredUser.id,
    referrerId: referrer.id,
  });

  res.send({ message: 'Referral successful' });
};
