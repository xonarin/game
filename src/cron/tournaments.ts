import cron from 'node-cron';

import { checkActivityWinner, checkMonthlyWinner, checkReferralsWinner } from '../data/modules/tournaments/tournament';

export default () => {
    cron.schedule('* * * * *', () => {
        checkMonthlyWinner();
        checkActivityWinner();
        checkReferralsWinner();
    });
};
