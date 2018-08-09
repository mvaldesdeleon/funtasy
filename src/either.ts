import fl = require('fantasy-land');

interface ILeft<A> {
    _: 'Left';
    value: A;
}

interface IRight<B> {
    _: 'Right';
    value: B;
}

export type Either<A, B> = ILeft<A> | IRight<B>;

export const Left = <A>(value: A): ILeft<A> => ({ _: 'Left', value });

export const Right = <A>(value: A): IRight<A> => ({ _: 'Right', value });

interface IPattern<A, B, C> {
    Left: (value: A) => C;
    Right: (value: B) => C;
}

export const match = <A, B, C>(definition: IPattern<A, B, C>) => (eitherAB: Either<A, B>): C => {
    switch (eitherAB._) {
        case 'Left':
            return definition.Left(eitherAB.value);
        case 'Right':
            return definition.Right(eitherAB.value);
    }
};

export const withDefault = <B>(defaultValue: B) => <A>(eitherAB: Either<A, B>): B =>
    match({
        Left: () => defaultValue,
        Right: (value: B) => value
    })(eitherAB);

export const fromLeft = <A>(defaultValue: A) => <B>(eitherAB: Either<A, B>): A =>
    match({
        Left: (value: A) => value,
        Right: () => defaultValue
    })(eitherAB);

export const fromRight = withDefault;

export const isLeft = <A, B>(eitherAB: Either<A, B>): boolean =>
    match({
        Left: () => true,
        Right: () => false
    })(eitherAB);

export const isRight = <A, B>(eitherAB: Either<A, B>): boolean =>
    match({
        Left: () => false,
        Right: () => true
    })(eitherAB);

type IFn<A, B> = (a: A) => B;
type IFn2<A, B, C> = (a: A) => (b: B) => C;
type IFn3<A, B, C, D> = (a: A) => (b: B) => (c: C) => D;
type IFn4<A, B, C, D, E> = (a: A) => (b: B) => (c: C) => (d: D) => E;
type IFn5<A, B, C, D, E, F> = (a: A) => (b: B) => (c: C) => (d: D) => (e: E) => F;

export const map = <B, C>(fn: IFn<B, C>) => <A>(eitherAB: Either<A, B>): Either<A, C> =>
    match({
        Left: (value: A) => Left(value) as Either<A, C>,
        Right: (value: B) => Right(fn(value))
    })(eitherAB);

export const ap = <A, B, C>(eitherAFn: Either<A, IFn<B, C>>) => (
    eitherAB: Either<A, B>
): Either<A, C> =>
    match({
        Left: (value: A) => Left(value),
        Right: (value: B) =>
            match({
                // tslint:disable-next-line:no-shadowed-variable
                Left: (value: A) => Left(value) as Either<A, C>,
                Right: (fn: IFn<B, C>) => Right(fn(value))
            })(eitherAFn)
    })(eitherAB);

export const map2 = <A, B, C, D>(fn: IFn2<B, C, D>) => (eitherAB: Either<A, B>) => (
    eitherAC: Either<A, C>
): Either<A, D> => ap(map(fn)(eitherAB))(eitherAC);

export const map3 = <A, B, C, D, E>(fn: IFn3<B, C, D, E>) => (eitherAB: Either<A, B>) => (
    eitherAC: Either<A, C>
) => (eitherAD: Either<A, D>): Either<A, E> => ap(ap(map(fn)(eitherAB))(eitherAC))(eitherAD);

export const map4 = <A, B, C, D, E, F>(fn: IFn4<B, C, D, E, F>) => (eitherAB: Either<A, B>) => (
    eitherAC: Either<A, C>
) => (eitherAD: Either<A, D>) => (eitherAE: Either<A, E>): Either<A, F> =>
    ap(ap(ap(map(fn)(eitherAB))(eitherAC))(eitherAD))(eitherAE);

export const map5 = <A, B, C, D, E, F, G>(fn: IFn5<B, C, D, E, F, G>) => (
    eitherAB: Either<A, B>
) => (eitherAC: Either<A, C>) => (eitherAD: Either<A, D>) => (eitherAE: Either<A, E>) => (
    eitherAF: Either<A, F>
): Either<A, G> => ap(ap(ap(ap(map(fn)(eitherAB))(eitherAC))(eitherAD))(eitherAE))(eitherAF);

export const andThen = <A, B, C>(fn: IFn<B, Either<A, C>>) => (
    eitherAB: Either<A, B>
): Either<A, C> =>
    match({
        Left: (value: A) => Left(value),
        Right: (value: B) => fn(value)
    })(eitherAB);

export const alt = <A, B>(eitherABR: Either<A, B>) => (eitherABL: Either<A, B>): Either<A, B> =>
    match({
        Left: () => eitherABL,
        Right: (value: B) => Right(value)
    })(eitherABR);

export class EitherObj<A, B> {
    public static Left<A, B>(value: A): EitherObj<A, B> {
        return new EitherObj<A, B>(Left(value));
    }

    public static Right<A, B>(value: B): EitherObj<A, B> {
        return new EitherObj<A, B>(Right(value));
    }

    public static [fl.of]<A>(value: A) {
        return EitherObj.Right(value);
    }

    protected constructor(private either: Either<A, B>) {}

    public match<C>(definition: IPattern<A, B, C>) {
        return match(definition)(this.either);
    }

    public withDefault(value: B) {
        return withDefault(value)(this.either);
    }

    public fromLeft(value: A) {
        return fromLeft(value)(this.either);
    }

    public fromRight(value: B) {
        return fromRight(value)(this.either);
    }

    public isLeft() {
        return isLeft(this.either);
    }

    public isRight() {
        return isRight(this.either);
    }

    public map<C>(fn: IFn<B, C>) {
        return new EitherObj(map(fn)(this.either));
    }

    public [fl.map]<C>(fn: IFn<B, C>) {
        return this.map(fn);
    }

    public ap<C>(eitherAFn: Either<A, IFn<B, C>>) {
        return new EitherObj(ap(eitherAFn)(this.either));
    }

    public [fl.ap]<C>(eitherAFn: Either<A, IFn<B, C>>) {
        return this.ap(eitherAFn);
    }

    public andThen<C>(fn: IFn<B, Either<A, C>>) {
        return new EitherObj(andThen(fn)(this.either));
    }

    public [fl.chain]<C>(fn: IFn<B, Either<A, C>>) {
        return this.andThen(fn);
    }

    public alt(eitherAB: Either<A, B>) {
        return new EitherObj(alt(this.either)(eitherAB));
    }

    public [fl.alt](eitherAB: Either<A, B>) {
        return this.alt(eitherAB);
    }
}
