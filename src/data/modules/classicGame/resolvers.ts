import { GraphQLScalarType } from 'graphql';
import { GraphQLDateTime, GraphQLHexColorCode, GraphQLURL } from 'graphql-scalars';
import { and, IRules } from 'graphql-shield';

import { Resolver, Resolvers, ResolverSubscriber, TypeResolvers } from '../../../interfaces/graphql';
import { ApolloContext } from '../../../interfaces/apollo';
import {
    ClassicGame,
    ClassicGameBet,
    ClassicGamePlayer,
    ClassicGamesHistoryItem,
    Mutation,
    MutationPlaceClassicGameBetArgs,
    PlacedClassicGameBetPayload,
    Query,
    Subscription,
    SwitchedToClassicGameStateCulminationPayload,
    UpdatedClassicGameTimerPayload,
} from '../../../__generated__/graphql';
import {
    ClassicGameBet as ClassicGameBetBackend,
    ClassicGameClientSnapshot,
    ClassicGamePlayer as ClassicGamePlayerBackend,
} from '../../../services/classicGame/classicGame';
import { HistoryClassicGame as HistoryClassicGameBackend } from '../../models/ClassicGame';
import pubsub from '../../pubsub';
import { services } from '../../../services';
import { isAuth } from '../rules';
import { checkPlaceClassicGameBetArgs } from './rules';

export type OriginClassicGameParent = ClassicGameClientSnapshot;
export type OriginClassicGameBetParent = ClassicGameBetBackend;
export type OriginClassicGamePlayerParent = ClassicGamePlayerBackend;
export type OriginClassicGamesHistoryItemParent = HistoryClassicGameBackend | ClassicGamesHistoryItemType;
export type OriginPlacedClassicGameBetPayloadParent = {
    fund: number;
    bet: OriginClassicGameBetParent;
    players: OriginClassicGamePlayerParent[];
};
export type OriginUpdatedClassicGameTimerPayloadParent = {
    state: string;
    timer: number;
    maxTimer: number;
};

type QueryType = Pick<Query, 'currentClassicGame' | 'classicGamesHistory'>;
type MutationType = Pick<Mutation, 'placeClassicGameBet'>;
type SubscriptionType = Pick<
    Subscription,
    | 'placedClassicGameBet'
    | 'startedClassicGame'
    | 'updatedClassicGameTimer'
    | 'switchedToClassicGameStateCulmination'
    | 'switchedToClassicGameStateEnded'
>;
type ClassicGameType = Pick<
    ClassicGame,
    | 'minBetAmount'
    | 'id'
    | 'commission'
    | 'state'
    | 'randomNumber'
    | 'hash'
    | 'fund'
    | 'winnerId'
    | 'winnerTicket'
    | 'timer'
    | 'maxTimer'
    | 'bets'
    | 'players'
    | 'culminationDegree'
    | 'remainingCulminationDuration'
>;
type ClassicGameBetType = Pick<ClassicGameBet, 'id' | 'userId' | 'amount'>;
type ClassicGamePlayerType = Pick<
    ClassicGamePlayer,
    'id' | 'username' | 'avatar' | 'chance' | 'startDegree' | 'endDegree' | 'color'
>;
type ClassicGamesHistoryItemType = Pick<
    ClassicGamesHistoryItem,
    | 'id'
    | 'commission'
    | 'randomNumber'
    | 'fund'
    | 'winnerId'
    | 'winnerUsername'
    | 'winnerAvatar'
    | 'winnerTicket'
    | 'winnerBetsPrice'
    | 'winnerChance'
    | 'finishedAt'
>;
type PlacedClassicGameBetPayloadType = Pick<PlacedClassicGameBetPayload, 'bet' | 'players'>;
type UpdateClassicGameTimerPayloadType = Pick<UpdatedClassicGameTimerPayload, 'state' | 'timer'>;

interface QueryMapping {
    currentClassicGame: Resolver<OriginClassicGameParent>;
    classicGamesHistory: Resolver<OriginClassicGamesHistoryItemParent[]>;
}

interface MutationMapping {
    placeClassicGameBet: Resolver<OriginClassicGameBetParent, MutationPlaceClassicGameBetArgs>;
}

interface SubscriptionMapping {
    placedClassicGameBet: ResolverSubscriber<OriginPlacedClassicGameBetPayloadParent>;
    startedClassicGame: ResolverSubscriber<OriginClassicGameParent>;
    updatedClassicGameTimer: ResolverSubscriber<OriginUpdatedClassicGameTimerPayloadParent>;
    switchedToClassicGameStateCulmination: ResolverSubscriber<SwitchedToClassicGameStateCulminationPayload>;
    switchedToClassicGameStateEnded: ResolverSubscriber<OriginClassicGamesHistoryItemParent>;
}

interface ClassicGameMapping {
    // Переопределил state, чтобы не делать лишнюю type-guard проверку
    state: Resolver<string>;
    bets: Resolver<OriginClassicGameBetParent[]>;
    players: Resolver<OriginClassicGamePlayerParent[]>;
}

interface PlaceClassicGameBetPayloadMapping {
    bet: OriginClassicGameBetParent;
    players: OriginClassicGamePlayerParent[];
}

interface UpdatedClassicGameTimerPayloadMapping {
    // Переопределил state, чтобы не делать лишнюю type-guard проверку
    state: Resolver<string>;
}

type ClassicGameResolvers = Resolvers<
    {
        Query: TypeResolvers<QueryType, QueryMapping>;
        Mutation: TypeResolvers<MutationType, MutationMapping>;
        Subscription: TypeResolvers<SubscriptionType, SubscriptionMapping>;
        ClassicGame: TypeResolvers<ClassicGameType, ClassicGameMapping, OriginClassicGameParent>;
        ClassicGameBet: TypeResolvers<ClassicGameBetType, {}, OriginClassicGameBetParent>;
        ClassicGamePlayer: TypeResolvers<ClassicGamePlayerType, {}, OriginClassicGamePlayerParent>;
        ClassicGamesHistoryItem: TypeResolvers<ClassicGamesHistoryItemType, {}, OriginClassicGamesHistoryItemParent>;
        PlacedClassicGameBetPayload: TypeResolvers<
            PlacedClassicGameBetPayloadType,
            PlaceClassicGameBetPayloadMapping,
            OriginPlacedClassicGameBetPayloadParent
        >;
        UpdatedClassicGameTimerPayload: TypeResolvers<
            UpdateClassicGameTimerPayloadType,
            UpdatedClassicGameTimerPayloadMapping,
            OriginUpdatedClassicGameTimerPayloadParent
        >;
        URL: GraphQLScalarType;
        DateTime: GraphQLScalarType;
        HexColorCode: GraphQLScalarType;
    },
    ApolloContext
>;

export const rules: IRules = {
    Mutation: {
        placeClassicGameBet: and(isAuth, checkPlaceClassicGameBetArgs),
    },
};

export const resolvers: ClassicGameResolvers = {
    Query: {
        currentClassicGame: () => {
            return services.classicGame.clientSnapshot();
        },
        classicGamesHistory: (_0, _1, { repositories }) => {
            return repositories.classicGames.getHistory();
        },
    },
    Mutation: {
        placeClassicGameBet: (_0, { input: { amount } }, { user }) => {
            return services.classicGame.placeBet(user!, amount);
        },
    },
    Subscription: {
        placedClassicGameBet: {
            subscribe: () => pubsub.asyncIterator('placedClassicGameBet'),
        },
        startedClassicGame: {
            subscribe: () => pubsub.asyncIterator('startedClassicGame'),
        },
        updatedClassicGameTimer: {
            subscribe: () => pubsub.asyncIterator('updatedClassicGameTimer'),
        },
        switchedToClassicGameStateCulmination: {
            subscribe: () => pubsub.asyncIterator('switchedToClassicGameStateCulmination'),
        },
        switchedToClassicGameStateEnded: {
            subscribe: () => pubsub.asyncIterator('switchedToClassicGameStateEnded'),
        },
    },
    ClassicGame: {
        id: snapshot => {
            return snapshot.gameId;
        },
        commission: snapshot => snapshot.commission,
        state: snapshot => {
            return snapshot.state;
        },
        randomNumber: snapshot => {
            return snapshot.randomNumber?.toFixed(18);
        },
        bets: snapshot => {
            return snapshot.bets;
        },
        players: snapshot => {
            return snapshot.players;
        },
    },
    ClassicGameBet: {
        id: bet => {
            return bet.betId;
        },
    },
    ClassicGamePlayer: {
        id: player => {
            return player.userId;
        },
    },
    ClassicGamesHistoryItem: {
        winnerId: game => {
            return 'winner' in game ? game.winner.id : game.winnerId;
        },
        winnerUsername: game => {
            return 'winner' in game ? game.winner.username : game.winnerUsername;
        },
        winnerAvatar: game => {
            return 'winner' in game ? game.winner.avatar : game.winnerAvatar;
        },
    },
    PlacedClassicGameBetPayload: {
        bet: payload => {
            return payload.bet;
        },
        players: payload => {
            return payload.players;
        },
    },
    UpdatedClassicGameTimerPayload: {
        state: payload => {
            return payload.state;
        },
    },
    URL: GraphQLURL,
    DateTime: GraphQLDateTime,
    HexColorCode: GraphQLHexColorCode,
};
