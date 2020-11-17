import { OmitByValue, Required } from 'utility-types';
import { GraphQLIsTypeOfFn, GraphQLResolveInfo, GraphQLScalarType, GraphQLTypeResolver } from 'graphql';

import { KeyType, MayPromise, OptionalObjectToOptional, UndefinableToOptional } from './common';

export type TransformScalar<TScalar> = TScalar extends Date ? string : TScalar;

export interface FieldResolver<TContext, TParent, TArgs, TResult> {
    (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo): MayPromise<TResult>;
}

export interface ResolverOptionsObject<TContext, TRoot, TParent, TArgs, TResult> {
    fragment?: string;
    resolve?: FieldResolver<TContext, TParent, TArgs, TResult>;
    subscribe: FieldResolver<TContext, TRoot, TArgs, AsyncIterator<TParent>>;

    // TODO: Разобраться с этими полями
    __resolveType?: GraphQLTypeResolver<unknown, TContext>;
    __isTypeOf?: GraphQLIsTypeOfFn<unknown, TContext>;
}

export type ResolverOptionsObjectGuard<
    TContext,
    TRoot,
    TParent,
    TArgs,
    TResult,
    K extends KeyType
> = K extends keyof TParent
    ? TParent[K] extends TResult
        ? ResolverOptionsObject<TContext, TRoot, TParent, TArgs, TResult>
        : Required<
              ResolverOptionsObject<TContext, TRoot, TParent | undefined, TArgs, TResult | null | undefined>,
              'resolve'
          >
    : Required<
          ResolverOptionsObject<TContext, TRoot, TParent | undefined, TArgs, TResult | null | undefined>,
          'resolve'
      >;

export interface Resolver<TResult, TArgs = {}> {
    result: TResult;
    args: TArgs;
}

export interface ResolverOptions<TResult, TParent = TResult, TArgs = {}> {
    optionsResult: TResult;
    optionsParent: TParent;
    optionsArgs: TArgs;
}

export interface ResolverSubscriber<TResult, TParent = TResult, TArgs = {}> {
    subscriberResult: TResult;
    subscriberParent: TParent;
    subscriberArgs: TArgs;
}

export interface TypeResolvers<TType extends object, TMapping extends object = {}, TParent = unknown> {
    type: TType;
    mapping: TMapping;
    parent: TParent;
}

export interface EnumResolver<TType extends KeyType, TValue> {
    type: TType;
    value: TValue;
}

export type Resolvers<TResolvers extends object, TContext> = OptionalObjectToOptional<
    OmitByValue<
        {
            [P in keyof TResolvers]: TResolvers[P] extends TypeResolvers<infer TType, infer TMapping, infer TParent>
                ? UndefinableToOptional<
                      {
                          [K in keyof Required<TType>]: K extends keyof TMapping
                              ? TMapping[K] extends Resolver<infer TResult, infer TArgs>
                                  ? FieldResolver<TContext, TParent, TArgs, TResult>
                                  : TMapping[K] extends ResolverOptions<
                                        infer TResult,
                                        infer TOptionsParent,
                                        infer TArgs
                                    >
                                  ? ResolverOptionsObjectGuard<TContext, TParent, TOptionsParent, TArgs, TResult, K>
                                  : TMapping[K] extends ResolverSubscriber<
                                        infer TResult,
                                        infer TSubscriberParent,
                                        infer TArgs
                                    >
                                  ? ResolverOptionsObjectGuard<
                                        TContext,
                                        TParent,
                                        Record<K, TSubscriberParent>,
                                        TArgs,
                                        TResult,
                                        K
                                    >
                                  : FieldResolver<TContext, TParent, {}, TMapping[K]>
                              : K extends keyof TParent
                              ? TransformScalar<TParent[K]> extends TType[K]
                                  ? FieldResolver<TContext, TParent, {}, TType[K]> | undefined
                                  : FieldResolver<TContext, TParent, {}, TType[K]>
                              : FieldResolver<TContext, TParent, {}, TType[K]>;
                      }
                  >
                : TResolvers[P] extends EnumResolver<infer TType, infer TValue>
                ? Record<TType, TValue>
                : TResolvers[P] extends GraphQLScalarType
                ? GraphQLScalarType
                : never;
        },
        never
    >
>;
