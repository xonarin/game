import { Optional } from 'utility-types';

export type KeyType = string | number | symbol;

export type MayPromise<T> = T | Promise<T>;

export type KeysByType<TObject extends object, TType> = {
    [P in keyof TObject]-?: TObject[P] extends TType ? P : never;
}[keyof TObject];

export type UndefinableKeys<TObject extends object> = {
    [P in keyof TObject]-?: undefined extends TObject[P] ? P : never;
}[keyof TObject];

export type OptionalObjectKeys<TObject extends object> = {
    [P in keyof TObject]-?: {} extends TObject[P] ? P : never;
}[keyof TObject];

export type UndefinableToOptional<TObject extends object> = Optional<TObject, UndefinableKeys<TObject>>;

export type OptionalObjectToOptional<TObject extends object> = Optional<TObject, OptionalObjectKeys<TObject>>;
