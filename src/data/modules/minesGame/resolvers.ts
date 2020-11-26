import { and, IRules } from 'graphql-shield';

import { Resolver, Resolvers, TypeResolvers, ResolverSubscriber } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import {
    MinesGame,
    MinesGameConfiguration,
    MinesGameHistory,
    Mutation,
    MutationMakeMinesGameStepArgs,
    MutationStartMinesGameArgs,
    Subscription,
    Query,
} from '../../../__generated__/graphql';
import { MinesGame as MinesGameBackend, MinesGameStatus } from '../../models/MinesGame';
import { isAuth } from '../rules';
import { checkMakeMinesGameStepArgs, checkStartMinesGameArgs } from './rules';
import { UserError } from '../../../utils/errors';
import { countOnes } from '../../../utils/number';
import { FIELD_SIZE, generateMinesCoefs, getMinesCoef, getMinesCoefs, MIN_BOMBS_COUNT } from '../../../utils/mines';
import pubsub from '../../pubsub';

export type OriginMinesGameParent = MinesGameBackend;

type QueryType = Pick<Query, 'minesGameConfiguration' | 'activeMinesGame' | 'minesGameHistory'>;
type MutationType = Pick<Mutation, 'startMinesGame' | 'endMinesGame' | 'makeMinesGameStep'>;
type SubscriptionType = Pick<Subscription, 'minesGameBet'>;
type MinesGameType = Pick<MinesGame, 'id' | 'betAmount' | 'bombsCount' | 'fieldConf' | 'stepsConf' | 'status'>;

interface QueryMapping {
    minesGameConfiguration: Resolver<MinesGameConfiguration>;
    activeMinesGame: Resolver<OriginMinesGameParent | null>;
    minesGameHistory: Resolver<MinesGameHistory | null>;
    currentMinesGame: Resolver<OriginMinesGameParent>;
}

interface MutationMapping {
    startMinesGame: Resolver<OriginMinesGameParent, MutationStartMinesGameArgs>;
    endMinesGame: Resolver<OriginMinesGameParent>;
    makeMinesGameStep: Resolver<OriginMinesGameParent, MutationMakeMinesGameStepArgs>;
}
interface SubscriptionMapping {
    minesGameBet: ResolverSubscriber<OriginMinesGameParent>;
}
type MinesGameResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
        MinesGame: TypeResolvers<MinesGameType, {}, OriginMinesGameParent>;
        Subscription: TypeResolvers<SubscriptionType, SubscriptionMapping>;
    },
    ApolloContext
>;

export const rules: IRules = {
    Query: {
        activeMinesGame: isAuth,
    },
    Mutation: {
        startMinesGame: and(isAuth, checkStartMinesGameArgs),
        endMinesGame: isAuth,
        makeMinesGameStep: and(isAuth, checkMakeMinesGameStepArgs),
    },
};

export const resolvers: MinesGameResolvers = {
    Query: {
        minesGameConfiguration: () => {
            return {
                fieldSize: FIELD_SIZE,
                minBombsCount: MIN_BOMBS_COUNT,
                coefs: getMinesCoefs(),
            };
        },
        activeMinesGame: (_0, _1, { user, repositories }) => {
            return repositories.minesGames.getCurrentGame(user!.id);
        },
        minesGameHistory: (_0, _1, { repositories }) => {
            return repositories.minesGames.getMinesGame();
        },
    },
    Mutation: {
        startMinesGame: async (_0, { input: { betAmount, bombsCount } }, { user, repositories }) => {
            const currentGame = await repositories.minesGames.getCurrentGame(user!.id);

            if (currentGame) {
                throw new UserError('MINES_GAME_ALREADY_ACTIVE');
            }

            await repositories.users.withdrawMoney(user!.id, betAmount);

            return repositories.minesGames.createGame(user!.id, betAmount, bombsCount);
        },
        endMinesGame: async (_0, _1, { user, repositories }) => {
            const currentGame = await repositories.minesGames.getCurrentGame(user!.id);

            if (!currentGame) {
                throw new UserError('NO_ACTIVE_MINES_GAME');
            }

            const madeStepsCount = countOnes(currentGame.stepsConf);
            const coef = getMinesCoef(currentGame.bombsCount, madeStepsCount);
            const winAmount = currentGame.betAmount * coef;
            await repositories.users.giveMoney(user!.id, winAmount);

            return repositories.minesGames.endGame(currentGame.id, winAmount);
        },
        makeMinesGameStep: async (_0, { cell }, { user, repositories }) => {
            const currentGame = await repositories.minesGames.getCurrentGame(user!.id);

            if (!currentGame) {
                throw new UserError('NO_ACTIVE_MINES_GAME');
            }

            return repositories.minesGames.makeStep(currentGame.id, cell);
        },
    },
    Subscription: {
        minesGameBet: {
            subscribe: () => pubsub.asyncIterator('minesGameBet'),
        },
    },
    MinesGame: {
        fieldConf: game => {
            // eslint-disable-next-line no-bitwise
            return game.status === MinesGameStatus.Ended ? game.fieldConf : game.fieldConf & game.stepsConf;
        },
    },
};

// Pre-generating of mines coefs
generateMinesCoefs();
