import fl = require('fantasy-land');

interface INothing {
    _: 'Nothing';
}

interface IJust<A> {
    _: 'Just';
    value: A;
}

export type Maybe<A> = INothing | IJust<A>;

export const Nothing: INothing = { _: 'Nothing' };

export const Just = <A>(value: A): IJust<A> => ({ _: 'Just', value });

interface IPattern<A, B> {
    Nothing: () => B;
    Just: (value: A) => B;
}

export const match = <A, B>(definition: IPattern<A, B>) => (maybeA: Maybe<A>): B => {
    switch (maybeA._) {
        case 'Nothing':
            return definition.Nothing();
        case 'Just':
            return definition.Just(maybeA.value);
    }
};

export const withDefault = <A>(defaultValue: A) => (maybeA: Maybe<A>): A =>
    match({
        Nothing: () => defaultValue,
        Just: (value: A) => value
    })(maybeA);

type IFn<A, B> = (a: A) => B;
type IFn2<A, B, C> = (a: A) => (b: B) => C;
type IFn3<A, B, C, D> = (a: A) => (b: B) => (c: C) => D;
type IFn4<A, B, C, D, E> = (a: A) => (b: B) => (c: C) => (d: D) => E;
type IFn5<A, B, C, D, E, F> = (a: A) => (b: B) => (c: C) => (d: D) => (e: E) => F;

export const map = <A, B>(fn: IFn<A, B>) => (maybeA: Maybe<A>): Maybe<B> =>
    match({
        Nothing: () => Nothing as Maybe<B>,
        Just: (value: A) => Just(fn(value))
    })(maybeA);

export const ap = <A, B>(maybeFn: Maybe<IFn<A, B>>) => (maybeA: Maybe<A>): Maybe<B> =>
    match({
        Nothing: () => Nothing,
        Just: (value: A) =>
            match({
                Nothing: () => Nothing as Maybe<B>,
                Just: (fn: IFn<A, B>) => Just(fn(value))
            })(maybeFn)
    })(maybeA);

export const map2 = <A, B, C>(fn: IFn2<A, B, C>) => (maybeA: Maybe<A>) => (
    maybeB: Maybe<B>
): Maybe<C> => ap(map(fn)(maybeA))(maybeB);

export const map3 = <A, B, C, D>(fn: IFn3<A, B, C, D>) => (maybeA: Maybe<A>) => (
    maybeB: Maybe<B>
) => (maybeC: Maybe<C>): Maybe<D> => ap(ap(map(fn)(maybeA))(maybeB))(maybeC);

export const map4 = <A, B, C, D, E>(fn: IFn4<A, B, C, D, E>) => (maybeA: Maybe<A>) => (
    maybeB: Maybe<B>
) => (maybeC: Maybe<C>) => (maybeD: Maybe<D>): Maybe<E> =>
    ap(ap(ap(map(fn)(maybeA))(maybeB))(maybeC))(maybeD);

export const map5 = <A, B, C, D, E, F>(fn: IFn5<A, B, C, D, E, F>) => (maybeA: Maybe<A>) => (
    maybeB: Maybe<B>
) => (maybeC: Maybe<C>) => (maybeD: Maybe<D>) => (maybeE: Maybe<E>): Maybe<F> =>
    ap(ap(ap(ap(map(fn)(maybeA))(maybeB))(maybeC))(maybeD))(maybeE);

export const andThen = <A, B>(fn: IFn<A, Maybe<B>>) => (maybeA: Maybe<A>): Maybe<B> =>
    match({
        Nothing: () => Nothing,
        Just: (value: A) => fn(value)
    })(maybeA);

export const alt = <A>(maybeR: Maybe<A>) => (maybeL: Maybe<A>): Maybe<A> =>
    match({
        Nothing: () => maybeL,
        Just: (value: A) => Just(value)
    })(maybeR);

export const zero = <A>(): Maybe<A> => Nothing;

export class MaybeObj<A> {
    public static Nothing<A>(): MaybeObj<A> {
        return new MaybeObj(Nothing);
    }

    public static Just<A>(value: A): MaybeObj<A> {
        return new MaybeObj(Just(value));
    }

    public static [fl.of]<A>(value: A) {
        return MaybeObj.Just(value);
    }

    public static [fl.zero]<A>(): MaybeObj<A> {
        return new MaybeObj(zero());
    }

    protected constructor(private maybe: Maybe<A>) {}

    public match<B>(definition: IPattern<A, B>) {
        return match(definition)(this.maybe);
    }

    public withDefault(value: A) {
        return withDefault(value)(this.maybe);
    }

    public map<B>(fn: IFn<A, B>) {
        return new MaybeObj(map(fn)(this.maybe));
    }

    public [fl.map]<B>(fn: IFn<A, B>) {
        return this.map(fn);
    }

    public ap<B>(maybeFn: MaybeObj<IFn<A, B>>) {
        return new MaybeObj(ap(maybeFn.maybe)(this.maybe));
    }

    public [fl.ap]<B>(maybeFn: MaybeObj<IFn<A, B>>) {
        return this.ap(maybeFn);
    }

    public andThen<B>(fn: IFn<A, MaybeObj<B>>) {
        return new MaybeObj(andThen((a: A) => fn(a).maybe)(this.maybe));
    }

    public [fl.chain]<B>(fn: IFn<A, MaybeObj<B>>) {
        return this.andThen(fn);
    }

    public alt(maybeA: MaybeObj<A>) {
        return new MaybeObj(alt(this.maybe)(maybeA.maybe));
    }

    public [fl.alt](maybeA: MaybeObj<A>) {
        return this.alt(maybeA);
    }
}
