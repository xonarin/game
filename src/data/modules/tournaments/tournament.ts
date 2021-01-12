import { DateTime } from 'luxon';

import { repositories } from '../../database';
import { TournamentType } from '../../models/Tournament';
import { RefTournamentType } from '../../../__generated__/graphql';

const checkMonthlyWinner = async () => {
    const nowDate = new Date();
    const activeTournament = await repositories.tournaments.getActiveTournament(RefTournamentType.Monthly);

    if (activeTournament === null) {
        const lastTournament = await repositories.tournaments.getLastTournament(RefTournamentType.Monthly);
        if (lastTournament) {
            const nextStart = DateTime.fromJSDate(lastTournament.start)
                .plus({ month: 1 })
                .toJSDate();

            if (nextStart.getTime() > nowDate.getTime()) {
                return;
            }
        }

        await repositories.tournaments.createTournament(
            TournamentType.Monthly,
            DateTime.local()
                .startOf('month')
                .toJSDate(),
            DateTime.local()
                .endOf('month')
                .toJSDate(),
        );
        return;
    }

    if (activeTournament.finish.getTime() >= nowDate.getTime()) {
        return;
    }

    const topAmountUser = await repositories.referralIncomes.getTopUserId(
        activeTournament.start,
        activeTournament.finish,
    );

    await activeTournament.update({
        winnerId: topAmountUser?.referrerId,
        isFinished: true,
    });
};

const checkActivityWinner = async () => {
    const nowDate = new Date();
    const activeTournament = await repositories.tournaments.getActiveTournament(RefTournamentType.Activity);

    if (activeTournament === null) {
        const lastTournament = await repositories.tournaments.getLastTournament(RefTournamentType.Activity);
        if (lastTournament) {
            const pauseDays = await repositories.settings.getSettingAsNumber('tournament::activityPauseDays');
            const nextStart = DateTime.fromJSDate(lastTournament.finish)
                .plus({ day: pauseDays })
                .toJSDate();

            if (nextStart.getTime() > nowDate.getTime()) {
                return;
            }
        }

        const lengthDays = await repositories.settings.getSettingAsNumber('tournament::activityLengthDays');
        await repositories.tournaments.createTournament(
            TournamentType.Activity,
            DateTime.local()
                .startOf('day')
                .toJSDate(),
            DateTime.local()
                .endOf('day')
                .plus({ day: lengthDays })
                .toJSDate(),
        );
        return;
    }

    if (activeTournament.finish.getTime() >= nowDate.getTime()) {
        return;
    }

    const topAmountUser = await repositories.referralIncomes.getTopUserId(
        activeTournament.start,
        activeTournament.finish,
    );

    await activeTournament.update({
        winnerId: topAmountUser?.referrerId || null,
        isFinished: true,
    });
};

const checkReferralsWinner = async () => {
    const nowDate = new Date();
    const activeTournament = await repositories.tournaments.getActiveTournament(RefTournamentType.Referrals);

    if (activeTournament === null) {
        const lastTournament = await repositories.tournaments.getLastTournament(RefTournamentType.Referrals);
        if (lastTournament) {
            const pauseDays = await repositories.settings.getSettingAsNumber('tournament::referralsPauseDays');
            const nextStart = DateTime.fromJSDate(lastTournament.finish)
                .plus({ day: pauseDays })
                .toJSDate();

            if (nextStart.getTime() > nowDate.getTime()) {
                return;
            }
        }

        const lengthDays = await repositories.settings.getSettingAsNumber('tournament::referralsLengthDays');
        await repositories.tournaments.createTournament(
            TournamentType.Referrals,
            DateTime.local()
                .startOf('day')
                .toJSDate(),
            DateTime.local()
                .endOf('day')
                .plus({ day: lengthDays })
                .toJSDate(),
        );
        return;
    }

    if (activeTournament.finish.getTime() >= nowDate.getTime()) {
        return;
    }

    const topReferralUser = await repositories.users.getTopReferralUserId(
        activeTournament.start,
        activeTournament.finish,
    );

    await activeTournament.update({
        winnerId: topReferralUser?.refId || null,
        isFinished: true,
    });
};

export { checkMonthlyWinner, checkActivityWinner, checkReferralsWinner };
