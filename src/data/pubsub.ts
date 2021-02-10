import { Model } from 'sequelize';
import Redis, { RedisOptions } from 'ioredis';
import { PubSubEngine } from 'apollo-server-express';
import { RedisPubSub } from 'graphql-redis-subscriptions';

import config from '../config';
import {
    DeletedMessagePayload,
    DeletedMessagesBySenderPayload,
    SwitchedToClassicGameStateCulminationPayload,
} from '../__generated__/graphql';
import { SerializedModel } from '../interfaces/sequelize';
import { OriginMessageParent } from './modules/chat/resolvers';
import { OriginAnnouncementType } from './modules/announcements/resolvers';
import {
    OriginClassicGameParent,
    OriginClassicGamesHistoryItemParent,
    OriginPlacedClassicGameBetPayloadParent,
    OriginUpdatedClassicGameTimerPayloadParent,
} from './modules/classicGame/resolvers';
import { LiveDataGameParent, OnlinePayloadParent } from './modules/liveData/resolvers';

export interface BalanceSubscriptionPayload {
    userId: string;
    money: number;
    maxReached: boolean;
}

export interface PubSubEventPayloads {
    // Chat
    sentMessage: OriginMessageParent;
    deletedMessage: DeletedMessagePayload;
    deletedMessagesBySender: DeletedMessagesBySenderPayload;

    // Announcements
    updatedAnnouncement: OriginAnnouncementType;

    // ClassicGame
    placedClassicGameBet: OriginPlacedClassicGameBetPayloadParent;
    startedClassicGame: OriginClassicGameParent;
    updatedClassicGameTimer: OriginUpdatedClassicGameTimerPayloadParent;
    switchedToClassicGameStateCulmination: SwitchedToClassicGameStateCulminationPayload;
    switchedToClassicGameStateEnded: OriginClassicGamesHistoryItemParent;

    // Live Data
    games: LiveDataGameParent;
    onlineData: OnlinePayloadParent;

    // Users
    balance: BalanceSubscriptionPayload;
}

export type PubSubEvent = keyof PubSubEventPayloads;

export interface PubSubEventMeta {
    target?: string[];
    invertTarget?: boolean;
}

export type AsyncIteratorResult<T extends PubSubEvent> = Record<
    T,
    PubSubEventPayloads[T] extends Model ? SerializedModel<PubSubEventPayloads[T]> : PubSubEventPayloads[T]
> &
    PubSubEventMeta;

export class TypedPubSub {
    private readonly pubsub: PubSubEngine;

    constructor(pubsub: PubSubEngine) {
        this.pubsub = pubsub;
    }

    public publish<T extends PubSubEvent>(
        trigger: T,
        payload: PubSubEventPayloads[T],
        target?: string[],
        invertTarget?: boolean,
    ) {
        return this.pubsub.publish(trigger, { target, invertTarget, [trigger]: payload });
    }

    public asyncIterator<T extends PubSubEvent>(trigger: T) {
        return this.pubsub.asyncIterator<AsyncIteratorResult<T>>(trigger);
    }
}

const redisOptions: RedisOptions = {
    retryStrategy: times => Math.min(times * 50, 2000),
};

const pubsub = new TypedPubSub(
    new RedisPubSub({
        publisher: new Redis(config.redisUrl, redisOptions),
        subscriber: new Redis(config.redisUrl, redisOptions),
    }),
);

export default pubsub;
