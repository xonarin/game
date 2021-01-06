import cron from 'node-cron';

import { checkActivityWinner, checkMonthlyWinner, checkReferralsWinner } from '../data/modules/tournaments/tournament';

cron.schedule('* * * * *', () => {
    checkMonthlyWinner();
    checkActivityWinner();
    checkReferralsWinner();
});