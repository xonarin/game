import { and, IRules } from 'graphql-shield';

import { Resolver, Resolvers, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import {
    MinesGame,
    MinesGameConfiguration,
    Mutation,
    MutationMakeMinesGameStepArgs,
    MutationStartMinesGameArgs,
    Query,
} from '../../../__generated__/graphql';
import { MinesGame as MinesGameBackend, MinesGameStatus } from '../../models/MinesGame';
import { isAuth } from '../rules';
import { checkMakeMinesGameStepArgs, checkStartMinesGameArgs } from './rules';
import { UserError } from '../../../utils/errors';
import { FIELD_SIZE, generateMinesCoefs, getMinesCoefs, MIN_BOMBS_COUNT } from '../../../utils/mines';

export type OriginMinesGameParent = MinesGameBackend;

type QueryType = Pick<Query, 'minesGameConfiguration' | 'activeMinesGame'>;
type MutationType = Pick<Mutation, 'startMinesGame' | 'endMinesGame' | 'makeMinesGameStep'>;
type MinesGameType = Pick<MinesGame, 'id' | 'betAmount' | 'bombsCount' | 'fieldConf' | 'stepsConf' | 'status'>;

interface QueryMapping {
    minesGameConfiguration: Resolver<MinesGameConfiguration>;
    activeMinesGame: Resolver<OriginMinesGameParent | null>;
}

interface MutationMapping {
    startMinesGame: Resolver<OriginMinesGameParent, MutationStartMinesGameArgs>;
    endMinesGame: Resolver<OriginMinesGameParent>;
    makeMinesGameStep: Resolver<OriginMinesGameParent, MutationMakeMinesGameStepArgs>;
}

type MinesGameResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
        MinesGame: TypeResolvers<MinesGameType, {}, OriginMinesGameParent>;
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
    },
    Mutation: {
        startMinesGame: async (_0, { input: { betAmount, bombsCount } }, { user, repositories }) => {
            const currentGame = await repositories.minesGames.getCurrentGame(user!.id);

            if (currentGame) {
                throw new UserError('MINES_GAME_ALREADY_ACTIVE');
            }

            const maxBet = await repositories.settings.getSettingAsNumber('mines::maxBetAmount');

            if (betAmount > maxBet) {
                throw new UserError('MINES_GAME_BET_TOO_HIGH');
            }

            await repositories.users.withdrawMoney(user!.id, betAmount);
            return repositories.minesGames.createGame(user!.id, betAmount, bombsCount);
        },
        endMinesGame: async (_0, _1, { user, repositories }) => {
            return repositories.minesGames.endGame(user!.id);
        },
        makeMinesGameStep: async (_0, { cell }, { user, repositories }) => {
            return repositories.minesGames.makeStep(user!.id, cell);
        },
    },
    MinesGame: {
        fieldConf: game => {
            return game.status === MinesGameStatus.Ended ? game.fieldConf : 0;
        },
    },
};

// Pre-generating of mines coefs
generateMinesCoefs();
