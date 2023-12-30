import { Builder } from 'ton'
import { Slice } from 'ton'
import { beginCell } from 'ton'
import { BitString } from 'ton'
import { Cell } from 'ton'
import { Address } from 'ton'
export function bitLen(n: number) {
    return n.toString(2).length;;
}

export interface Simple {
    readonly kind: 'Simple';
    readonly a: number;
    readonly b: number;
}

export type TwoConstructors = TwoConstructors_bool_false | TwoConstructors_bool_true;

export interface TwoConstructors_bool_false {
    readonly kind: 'TwoConstructors_bool_false';
    readonly a: number;
    readonly b: number;
    readonly c: number;
}

export interface TwoConstructors_bool_true {
    readonly kind: 'TwoConstructors_bool_true';
    readonly b: number;
}

export interface FixedIntParam {
    readonly kind: 'FixedIntParam';
    readonly y: number;
}

export interface TypedField {
    readonly kind: 'TypedField';
    readonly y: FixedIntParam;
    readonly c: number;
}

export interface SharpConstructor {
    readonly kind: 'SharpConstructor';
    readonly y: FixedIntParam;
    readonly c: number;
}

export type Maybe<TheType> = Maybe_nothing<TheType> | Maybe_just<TheType>;

export interface Maybe_nothing<TheType> {
    readonly kind: 'Maybe_nothing';
}

export interface Maybe_just<TheType> {
    readonly kind: 'Maybe_just';
    readonly value: TheType;
}

export interface TypedParam {
    readonly kind: 'TypedParam';
    readonly x: Maybe<SharpConstructor>;
}

export type Either<X, Y> = Either_left<X, Y> | Either_right<X, Y>;

export interface Either_left<X, Y> {
    readonly kind: 'Either_left';
    readonly value: X;
}

export interface Either_right<X, Y> {
    readonly kind: 'Either_right';
    readonly value: Y;
}

export interface BitLenArg {
    readonly kind: 'BitLenArg';
    readonly x: number;
    readonly value: bigint;
}

export interface BitLenArgUser {
    readonly kind: 'BitLenArgUser';
    readonly t: BitLenArg;
}

export interface ExprArg {
    readonly kind: 'ExprArg';
    readonly x: number;
    readonly value: bigint;
}

export interface ExprArgUser {
    readonly kind: 'ExprArgUser';
    readonly t: ExprArg;
}

export interface ComplexTypedField {
    readonly kind: 'ComplexTypedField';
    readonly a: ExprArgUser;
}

export interface CellTypedField {
    readonly kind: 'CellTypedField';
    readonly a: ExprArgUser;
}

export interface CellsSimple {
    readonly kind: 'CellsSimple';
    readonly t: number;
    readonly q: number;
    readonly a: number;
    readonly e: number;
    readonly b: number;
    readonly d: number;
    readonly c: number;
}

export interface IntBits<Arg> {
    readonly kind: 'IntBits';
    readonly d: number;
    readonly g: BitString;
    readonly arg: Arg;
    readonly x: Slice;
}

export interface IntBitsInside {
    readonly kind: 'IntBitsInside';
    readonly x: number;
    readonly a: IntBits<bigint>;
}

export interface IntBitsOutside {
    readonly kind: 'IntBitsOutside';
    readonly x: IntBitsInside;
}

export interface IntBitsParametrized {
    readonly kind: 'IntBitsParametrized';
    readonly e: number;
    readonly h: bigint;
    readonly f: bigint;
    readonly i: BitString;
    readonly j: number;
    readonly k: bigint;
    readonly tc: Slice;
}

export interface IntBitsParametrizedInside {
    readonly kind: 'IntBitsParametrizedInside';
    readonly x: number;
    readonly a: IntBitsParametrized;
}

export interface IntBitsParametrizedOutside {
    readonly kind: 'IntBitsParametrizedOutside';
    readonly x: IntBitsParametrizedInside;
}

export interface LessThan {
    readonly kind: 'LessThan';
    readonly x: number;
    readonly y: number;
}

export interface OneComb<A> {
    readonly kind: 'OneComb';
    readonly t: number;
    readonly x: A;
}

export interface ManyComb {
    readonly kind: 'ManyComb';
    readonly y: OneComb<OneComb<OneComb<number>>>;
}

export type Unary = Unary_unary_zero | Unary_unary_succ;

export interface Unary_unary_zero {
    readonly kind: 'Unary_unary_zero';
}

export interface Unary_unary_succ {
    readonly kind: 'Unary_unary_succ';
    readonly n: number;
    readonly x: Unary;
}

export type ParamConst = ParamConst_b | ParamConst_c | ParamConst_a | ParamConst_d;

export interface ParamConst_b {
    readonly kind: 'ParamConst_b';
    readonly m: number;
    readonly k: number;
}

export interface ParamConst_c {
    readonly kind: 'ParamConst_c';
    readonly n: number;
    readonly m: number;
    readonly k: number;
}

export interface ParamConst_a {
    readonly kind: 'ParamConst_a';
    readonly n: number;
}

export interface ParamConst_d {
    readonly kind: 'ParamConst_d';
    readonly n: number;
    readonly m: number;
    readonly k: number;
    readonly l: number;
}

export type ParamDifNames = ParamDifNames_a | ParamDifNames_b | ParamDifNames_c | ParamDifNames_d;

export interface ParamDifNames_a {
    readonly kind: 'ParamDifNames_a';
}

export interface ParamDifNames_b {
    readonly kind: 'ParamDifNames_b';
}

export interface ParamDifNames_c {
    readonly kind: 'ParamDifNames_c';
    readonly n: number;
    readonly x: ParamDifNames;
}

export interface ParamDifNames_d {
    readonly kind: 'ParamDifNames_d';
    readonly m: number;
    readonly x: ParamDifNames;
}

export interface ParamDifNamesUser {
    readonly kind: 'ParamDifNamesUser';
    readonly k: number;
    readonly x: ParamDifNames;
}

export interface NegationFromImplicit {
    readonly kind: 'NegationFromImplicit';
    readonly y: number;
    readonly t: number;
    readonly z: number;
}

export interface UnaryUserCheckOrder {
    readonly kind: 'UnaryUserCheckOrder';
    readonly l: number;
    readonly m: number;
    readonly label: Unary;
}

export interface CombArgCellRef<X> {
    readonly kind: 'CombArgCellRef';
    readonly info: number;
    readonly init: Maybe<Either<X, number>>;
    readonly other: Either<X, OneComb<X>>;
    readonly body: Either<X, X>;
}

export interface CombArgCellRefUser {
    readonly kind: 'CombArgCellRefUser';
    readonly x: CombArgCellRef<number>;
}

export interface MathExprAsCombArg {
    readonly kind: 'MathExprAsCombArg';
    readonly n: number;
    readonly ref: BitLenArg;
}

export interface EmptyTag {
    readonly kind: 'EmptyTag';
    readonly a: number;
}

export interface SharpTag {
    readonly kind: 'SharpTag';
    readonly x: number;
}

export interface DollarTag {
    readonly kind: 'DollarTag';
    readonly x: number;
}

export interface TupleCheck {
    readonly kind: 'TupleCheck';
    readonly s: Array<number>;
}

export interface Hashmap<X> {
    readonly kind: 'Hashmap';
    readonly n: number;
    readonly l: number;
    readonly m: number;
    readonly label: HmLabel;
    readonly node: HashmapNode<X>;
}

export type HashmapNode<X> = HashmapNode_hmn_leaf<X> | HashmapNode_hmn_fork<X>;

export interface HashmapNode_hmn_leaf<X> {
    readonly kind: 'HashmapNode_hmn_leaf';
    readonly value: X;
}

export interface HashmapNode_hmn_fork<X> {
    readonly kind: 'HashmapNode_hmn_fork';
    readonly n: number;
    readonly left: Hashmap<X>;
    readonly right: Hashmap<X>;
}

export type HmLabel = HmLabel_hml_short | HmLabel_hml_long | HmLabel_hml_same;

export interface HmLabel_hml_short {
    readonly kind: 'HmLabel_hml_short';
    readonly m: number;
    readonly n: number;
    readonly len: Unary;
    readonly s: Array<BitString>;
}

export interface HmLabel_hml_long {
    readonly kind: 'HmLabel_hml_long';
    readonly m: number;
    readonly n: number;
    readonly s: Array<BitString>;
}

export interface HmLabel_hml_same {
    readonly kind: 'HmLabel_hml_same';
    readonly m: number;
    readonly v: BitString;
    readonly n: number;
}

export type HashmapE<X> = HashmapE_hme_empty<X> | HashmapE_hme_root<X>;

export interface HashmapE_hme_empty<X> {
    readonly kind: 'HashmapE_hme_empty';
    readonly n: number;
}

export interface HashmapE_hme_root<X> {
    readonly kind: 'HashmapE_hme_root';
    readonly n: number;
    readonly root: Hashmap<X>;
}

export interface HashmapEUser {
    readonly kind: 'HashmapEUser';
    readonly x: HashmapE<number>;
}

export interface ConditionalField {
    readonly kind: 'ConditionalField';
    readonly a: number;
    readonly b: number | undefined;
}

export interface BitSelection {
    readonly kind: 'BitSelection';
    readonly a: number;
    readonly b: number | undefined;
}

export interface ImplicitCondition {
    readonly kind: 'ImplicitCondition';
    readonly flags: number;
}

export type MultipleEmptyConstructor = MultipleEmptyConstructor__ | MultipleEmptyConstructor__1 | MultipleEmptyConstructor_a;

export interface MultipleEmptyConstructor__ {
    readonly kind: 'MultipleEmptyConstructor__';
    readonly a: number;
}

export interface MultipleEmptyConstructor__1 {
    readonly kind: 'MultipleEmptyConstructor__1';
    readonly b: number;
}

export interface MultipleEmptyConstructor_a {
    readonly kind: 'MultipleEmptyConstructor_a';
    readonly x: number;
}

export interface True {
    readonly kind: 'True';
}

export type ParamNamedArgInSecondConstr = ParamNamedArgInSecondConstr_a | ParamNamedArgInSecondConstr_b;

export interface ParamNamedArgInSecondConstr_a {
    readonly kind: 'ParamNamedArgInSecondConstr_a';
    readonly n: number;
}

export interface ParamNamedArgInSecondConstr_b {
    readonly kind: 'ParamNamedArgInSecondConstr_b';
    readonly n: number;
}

export interface RefCombinatorAny {
    readonly kind: 'RefCombinatorAny';
    readonly msg: Maybe<Slice>;
}

export interface EqualityExpression {
    readonly kind: 'EqualityExpression';
    readonly n: number;
}

export interface ConditionalRef {
    readonly kind: 'ConditionalRef';
    readonly x: number;
    readonly y: Simple | undefined;
}

export interface LoadFromNegationOutsideExpr {
    readonly kind: 'LoadFromNegationOutsideExpr';
    readonly prev_seq_no: number;
    readonly seq_no: number;
}

export interface AnonymousData {
    readonly kind: 'AnonymousData';
    readonly anon0: number;
    readonly anon0_0: number;
}

export interface FalseAnonField {
    readonly kind: 'FalseAnonField';
    readonly value: bigint;
}

export type ConstructorOrder = ConstructorOrder_a | ConstructorOrder__;

export interface ConstructorOrder_a {
    readonly kind: 'ConstructorOrder_a';
    readonly a: Simple;
}

export interface ConstructorOrder__ {
    readonly kind: 'ConstructorOrder__';
    readonly anon0: Simple;
}

export type CheckCrc32 = CheckCrc32_a | CheckCrc32_b;

export interface CheckCrc32_a {
    readonly kind: 'CheckCrc32_a';
    readonly a: number;
}

export interface CheckCrc32_b {
    readonly kind: 'CheckCrc32_b';
    readonly b: number;
    readonly c: number;
}

export interface CheckKeyword {
    readonly kind: 'CheckKeyword';
    readonly const0: number;
}

export interface RefCombinatorInRefHelper<X> {
    readonly kind: 'RefCombinatorInRefHelper';
    readonly t: number;
    readonly y: Maybe<X>;
}

export interface RefCombinatorInRef {
    readonly kind: 'RefCombinatorInRef';
    readonly msg: RefCombinatorInRefHelper<Slice>;
}

export interface BoolUser {
    readonly kind: 'BoolUser';
    readonly a: boolean;
}

export interface Anycast {
    readonly kind: 'Anycast';
    readonly depth: number;
    readonly rewrite_pfx: BitString;
}

export interface AddressUser {
    readonly kind: 'AddressUser';
    readonly src: Address;
}

// tmpa$_ a:# b:# = Simple;

export function loadSimple(slice: Slice): Simple {
    let a: number = slice.loadUint(32);
    let b: number = slice.loadUint(32);
    return {
        kind: 'Simple',
        a: a,
        b: b,
    }

}

export function storeSimple(simple: Simple): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(simple.a, 32);
        builder.storeUint(simple.b, 32);
    })

}

// bool_false$0 a:# b:(## 7) c:# = TwoConstructors;

// bool_true$1 b:# = TwoConstructors;

export function loadTwoConstructors(slice: Slice): TwoConstructors {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        let a: number = slice.loadUint(32);
        let b: number = slice.loadUint(7);
        let c: number = slice.loadUint(32);
        return {
            kind: 'TwoConstructors_bool_false',
            a: a,
            b: b,
            c: c,
        }

    }
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        let b: number = slice.loadUint(32);
        return {
            kind: 'TwoConstructors_bool_true',
            b: b,
        }

    }
    throw new Error('Expected one of "TwoConstructors_bool_false", "TwoConstructors_bool_true" in loading "TwoConstructors", but data does not satisfy any constructor');
}

export function storeTwoConstructors(twoConstructors: TwoConstructors): (builder: Builder) => void {
    if ((twoConstructors.kind == 'TwoConstructors_bool_false')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
            builder.storeUint(twoConstructors.a, 32);
            builder.storeUint(twoConstructors.b, 7);
            builder.storeUint(twoConstructors.c, 32);
        })

    }
    if ((twoConstructors.kind == 'TwoConstructors_bool_true')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
            builder.storeUint(twoConstructors.b, 32);
        })

    }
    throw new Error('Expected one of "TwoConstructors_bool_false", "TwoConstructors_bool_true" in loading "TwoConstructors", but data does not satisfy any constructor');
}

// tmpb$_ y:(## 5) = FixedIntParam;

export function loadFixedIntParam(slice: Slice): FixedIntParam {
    let y: number = slice.loadUint(5);
    return {
        kind: 'FixedIntParam',
        y: y,
    }

}

export function storeFixedIntParam(fixedIntParam: FixedIntParam): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(fixedIntParam.y, 5);
    })

}

// tmpc$_ y:FixedIntParam c:# = TypedField;

export function loadTypedField(slice: Slice): TypedField {
    let y: FixedIntParam = loadFixedIntParam(slice);
    let c: number = slice.loadUint(32);
    return {
        kind: 'TypedField',
        y: y,
        c: c,
    }

}

export function storeTypedField(typedField: TypedField): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeFixedIntParam(typedField.y)(builder);
        builder.storeUint(typedField.c, 32);
    })

}

// tmpd#_ y:FixedIntParam c:# = SharpConstructor;

export function loadSharpConstructor(slice: Slice): SharpConstructor {
    let y: FixedIntParam = loadFixedIntParam(slice);
    let c: number = slice.loadUint(32);
    return {
        kind: 'SharpConstructor',
        y: y,
        c: c,
    }

}

export function storeSharpConstructor(sharpConstructor: SharpConstructor): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeFixedIntParam(sharpConstructor.y)(builder);
        builder.storeUint(sharpConstructor.c, 32);
    })

}

// nothing$0 {TheType:Type} = Maybe TheType;

// just$1 {TheType:Type} value:TheType = Maybe TheType;

export function loadMaybe<TheType>(slice: Slice, loadTheType: (slice: Slice) => TheType): Maybe<TheType> {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        return {
            kind: 'Maybe_nothing',
        }

    }
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        let value: TheType = loadTheType(slice);
        return {
            kind: 'Maybe_just',
            value: value,
        }

    }
    throw new Error('Expected one of "Maybe_nothing", "Maybe_just" in loading "Maybe", but data does not satisfy any constructor');
}

export function storeMaybe<TheType>(maybe: Maybe<TheType>, storeTheType: (theType: TheType) => (builder: Builder) => void): (builder: Builder) => void {
    if ((maybe.kind == 'Maybe_nothing')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
        })

    }
    if ((maybe.kind == 'Maybe_just')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
            storeTheType(maybe.value)(builder);
        })

    }
    throw new Error('Expected one of "Maybe_nothing", "Maybe_just" in loading "Maybe", but data does not satisfy any constructor');
}

// thejust$_ x:(Maybe SharpConstructor) = TypedParam;

export function loadTypedParam(slice: Slice): TypedParam {
    let x: Maybe<SharpConstructor> = loadMaybe<SharpConstructor>(slice, loadSharpConstructor);
    return {
        kind: 'TypedParam',
        x: x,
    }

}

export function storeTypedParam(typedParam: TypedParam): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeMaybe<SharpConstructor>(typedParam.x, storeSharpConstructor)(builder);
    })

}

// left$0 {X:Type} {Y:Type} value:X = Either X Y;

// right$1 {X:Type} {Y:Type} value:Y = Either X Y;

export function loadEither<X, Y>(slice: Slice, loadX: (slice: Slice) => X, loadY: (slice: Slice) => Y): Either<X, Y> {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        let value: X = loadX(slice);
        return {
            kind: 'Either_left',
            value: value,
        }

    }
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        let value: Y = loadY(slice);
        return {
            kind: 'Either_right',
            value: value,
        }

    }
    throw new Error('Expected one of "Either_left", "Either_right" in loading "Either", but data does not satisfy any constructor');
}

export function storeEither<X, Y>(either: Either<X, Y>, storeX: (x: X) => (builder: Builder) => void, storeY: (y: Y) => (builder: Builder) => void): (builder: Builder) => void {
    if ((either.kind == 'Either_left')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
            storeX(either.value)(builder);
        })

    }
    if ((either.kind == 'Either_right')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
            storeY(either.value)(builder);
        })

    }
    throw new Error('Expected one of "Either_left", "Either_right" in loading "Either", but data does not satisfy any constructor');
}

// a$_ {x:#} value:(## x) = BitLenArg x;

export function loadBitLenArg(slice: Slice, x: number): BitLenArg {
    let value: bigint = slice.loadUintBig(x);
    return {
        kind: 'BitLenArg',
        x: x,
        value: value,
    }

}

export function storeBitLenArg(bitLenArg: BitLenArg): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(bitLenArg.value, bitLenArg.x);
    })

}

// a$_ t:(BitLenArg 4) = BitLenArgUser;

export function loadBitLenArgUser(slice: Slice): BitLenArgUser {
    let t: BitLenArg = loadBitLenArg(slice, 4);
    return {
        kind: 'BitLenArgUser',
        t: t,
    }

}

export function storeBitLenArgUser(bitLenArgUser: BitLenArgUser): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeBitLenArg(bitLenArgUser.t)(builder);
    })

}

// a$_ {x:#} value:(## x) = ExprArg (2 + x);

export function loadExprArg(slice: Slice, arg0: number): ExprArg {
    let value: bigint = slice.loadUintBig((arg0 - 2));
    return {
        kind: 'ExprArg',
        x: (arg0 - 2),
        value: value,
    }

}

export function storeExprArg(exprArg: ExprArg): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(exprArg.value, exprArg.x);
    })

}

// a$_ t:(ExprArg 6) = ExprArgUser;

export function loadExprArgUser(slice: Slice): ExprArgUser {
    let t: ExprArg = loadExprArg(slice, 6);
    return {
        kind: 'ExprArgUser',
        t: t,
    }

}

export function storeExprArgUser(exprArgUser: ExprArgUser): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeExprArg(exprArgUser.t)(builder);
    })

}

// a$_ a:ExprArgUser = ComplexTypedField;

export function loadComplexTypedField(slice: Slice): ComplexTypedField {
    let a: ExprArgUser = loadExprArgUser(slice);
    return {
        kind: 'ComplexTypedField',
        a: a,
    }

}

export function storeComplexTypedField(complexTypedField: ComplexTypedField): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeExprArgUser(complexTypedField.a)(builder);
    })

}

// a$_ a:^ExprArgUser = CellTypedField;

export function loadCellTypedField(slice: Slice): CellTypedField {
    let slice1 = slice.loadRef().beginParse();
    let a: ExprArgUser = loadExprArgUser(slice1);
    return {
        kind: 'CellTypedField',
        a: a,
    }

}

export function storeCellTypedField(_cellTypedField: CellTypedField): (builder: Builder) => void {
    return ((builder: Builder) => {
        let cell1 = beginCell();
        storeExprArgUser(_cellTypedField.a)(cell1);
        builder.storeRef(cell1);
    })

}

// a$_ t:# ^[ q:# ] ^[ a:(## 32) ^[ e:# ] ^[ b:(## 32) d:# ^[ c:(## 32) ] ] ] = CellsSimple;

export function loadCellsSimple(slice: Slice): CellsSimple {
    let t: number = slice.loadUint(32);
    let slice1 = slice.loadRef().beginParse();
    let q: number = slice1.loadUint(32);
    let slice2 = slice.loadRef().beginParse();
    let a: number = slice2.loadUint(32);
    let slice21 = slice2.loadRef().beginParse();
    let e: number = slice21.loadUint(32);
    let slice22 = slice2.loadRef().beginParse();
    let b: number = slice22.loadUint(32);
    let d: number = slice22.loadUint(32);
    let slice221 = slice22.loadRef().beginParse();
    let c: number = slice221.loadUint(32);
    return {
        kind: 'CellsSimple',
        t: t,
        q: q,
        a: a,
        e: e,
        b: b,
        d: d,
        c: c,
    }

}

export function storeCellsSimple(_cellsSimple: CellsSimple): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(_cellsSimple.t, 32);
        let cell1 = beginCell();
        cell1.storeUint(_cellsSimple.q, 32);
        builder.storeRef(cell1);
        let cell2 = beginCell();
        cell2.storeUint(_cellsSimple.a, 32);
        let cell21 = beginCell();
        cell21.storeUint(_cellsSimple.e, 32);
        cell2.storeRef(cell21);
        let cell22 = beginCell();
        cell22.storeUint(_cellsSimple.b, 32);
        cell22.storeUint(_cellsSimple.d, 32);
        let cell221 = beginCell();
        cell221.storeUint(_cellsSimple.c, 32);
        cell22.storeRef(cell221);
        cell2.storeRef(cell22);
        builder.storeRef(cell2);
    })

}

// b$_ d:int11 g:bits2 {Arg:Type} arg:Arg x:Any = IntBits Arg;

export function loadIntBits<Arg>(slice: Slice, loadArg: (slice: Slice) => Arg): IntBits<Arg> {
    let d: number = slice.loadInt(11);
    let g: BitString = slice.loadBits(2);
    let arg: Arg = loadArg(slice);
    let x: Slice = slice;
    return {
        kind: 'IntBits',
        d: d,
        g: g,
        arg: arg,
        x: x,
    }

}

export function storeIntBits<Arg>(intBits: IntBits<Arg>, storeArg: (arg: Arg) => (builder: Builder) => void): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeInt(intBits.d, 11);
        builder.storeBits(intBits.g);
        storeArg(intBits.arg)(builder);
        builder.storeSlice(intBits.x);
    })

}

// a$_ {x:#} a:(IntBits (int (1 + x))) = IntBitsInside (x * 2);

export function loadIntBitsInside(slice: Slice, arg0: number): IntBitsInside {
    let a: IntBits<bigint> = loadIntBits<bigint>(slice, ((slice: Slice) => {
        return slice.loadIntBig((1 + (arg0 / 2)))

    }));
    return {
        kind: 'IntBitsInside',
        x: (arg0 / 2),
        a: a,
    }

}

export function storeIntBitsInside(intBitsInside: IntBitsInside): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeIntBits<bigint>(intBitsInside.a, ((arg: bigint) => {
            return ((builder: Builder) => {
                builder.storeInt(arg, (1 + intBitsInside.x));
            })

        }))(builder);
    })

}

// a$_ x:(IntBitsInside 6) = IntBitsOutside;

export function loadIntBitsOutside(slice: Slice): IntBitsOutside {
    let x: IntBitsInside = loadIntBitsInside(slice, 6);
    return {
        kind: 'IntBitsOutside',
        x: x,
    }

}

export function storeIntBitsOutside(intBitsOutside: IntBitsOutside): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeIntBitsInside(intBitsOutside.x)(builder);
    })

}

// a$_ {e:#} h:(int (e * 8)) f:(uint (7 * e)) i:(bits (5 + e)) j:(int 5) k:(uint e) tc:Cell = IntBitsParametrized e;

export function loadIntBitsParametrized(slice: Slice, e: number): IntBitsParametrized {
    let h: bigint = slice.loadIntBig((e * 8));
    let f: bigint = slice.loadUintBig((7 * e));
    let i: BitString = slice.loadBits((5 + e));
    let j: number = slice.loadInt(5);
    let k: bigint = slice.loadUintBig(e);
    let tc: Slice = slice;
    return {
        kind: 'IntBitsParametrized',
        e: e,
        h: h,
        f: f,
        i: i,
        j: j,
        k: k,
        tc: tc,
    }

}

export function storeIntBitsParametrized(intBitsParametrized: IntBitsParametrized): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeInt(intBitsParametrized.h, (intBitsParametrized.e * 8));
        builder.storeUint(intBitsParametrized.f, (7 * intBitsParametrized.e));
        builder.storeBits(intBitsParametrized.i);
        builder.storeInt(intBitsParametrized.j, 5);
        builder.storeUint(intBitsParametrized.k, intBitsParametrized.e);
        builder.storeSlice(intBitsParametrized.tc);
    })

}

// a$_ {x:#} a:(IntBitsParametrized x) = IntBitsParametrizedInside x;

export function loadIntBitsParametrizedInside(slice: Slice, x: number): IntBitsParametrizedInside {
    let a: IntBitsParametrized = loadIntBitsParametrized(slice, x);
    return {
        kind: 'IntBitsParametrizedInside',
        x: x,
        a: a,
    }

}

export function storeIntBitsParametrizedInside(intBitsParametrizedInside: IntBitsParametrizedInside): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeIntBitsParametrized(intBitsParametrizedInside.a)(builder);
    })

}

// a$_ x:(IntBitsParametrizedInside 5) = IntBitsParametrizedOutside;

export function loadIntBitsParametrizedOutside(slice: Slice): IntBitsParametrizedOutside {
    let x: IntBitsParametrizedInside = loadIntBitsParametrizedInside(slice, 5);
    return {
        kind: 'IntBitsParametrizedOutside',
        x: x,
    }

}

export function storeIntBitsParametrizedOutside(intBitsParametrizedOutside: IntBitsParametrizedOutside): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeIntBitsParametrizedInside(intBitsParametrizedOutside.x)(builder);
    })

}

// a$_ x:(#< 4) y:(#<= 4) = LessThan;

export function loadLessThan(slice: Slice): LessThan {
    let x: number = slice.loadUint(bitLen((4 - 1)));
    let y: number = slice.loadUint(bitLen(4));
    return {
        kind: 'LessThan',
        x: x,
        y: y,
    }

}

export function storeLessThan(lessThan: LessThan): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(lessThan.x, bitLen((4 - 1)));
        builder.storeUint(lessThan.y, bitLen(4));
    })

}

// a$_ {A:Type} t:# x:A = OneComb A;

export function loadOneComb<A>(slice: Slice, loadA: (slice: Slice) => A): OneComb<A> {
    let t: number = slice.loadUint(32);
    let x: A = loadA(slice);
    return {
        kind: 'OneComb',
        t: t,
        x: x,
    }

}

export function storeOneComb<A>(oneComb: OneComb<A>, storeA: (a: A) => (builder: Builder) => void): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(oneComb.t, 32);
        storeA(oneComb.x)(builder);
    })

}

// a$_ y:(OneComb(OneComb(OneComb int3))) = ManyComb;

export function loadManyComb(slice: Slice): ManyComb {
    let y: OneComb<OneComb<OneComb<number>>> = loadOneComb<OneComb<OneComb<number>>>(slice, ((slice: Slice) => {
        return loadOneComb<OneComb<number>>(slice, ((slice: Slice) => {
            return loadOneComb<number>(slice, ((slice: Slice) => {
                return slice.loadInt(3)

            }))

        }))

    }));
    return {
        kind: 'ManyComb',
        y: y,
    }

}

export function storeManyComb(manyComb: ManyComb): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeOneComb<OneComb<OneComb<number>>>(manyComb.y, ((arg: OneComb<OneComb<number>>) => {
            return ((builder: Builder) => {
                storeOneComb<OneComb<number>>(arg, ((arg: OneComb<number>) => {
                    return ((builder: Builder) => {
                        storeOneComb<number>(arg, ((arg: number) => {
                            return ((builder: Builder) => {
                                builder.storeInt(arg, 3);
                            })

                        }))(builder);
                    })

                }))(builder);
            })

        }))(builder);
    })

}

// unary_zero$0 = Unary ~0;

export function unary_unary_succ_get_n(x: Unary): number {
    if ((x.kind == 'Unary_unary_zero')) {
        return 0

    }
    if ((x.kind == 'Unary_unary_succ')) {
        let n = x.n;
        return (n + 1)

    }
    throw new Error('Expected one of "Unary_unary_zero", "Unary_unary_succ" for type "Unary" while getting "x", but data does not satisfy any constructor');
}

// unary_succ$1 {n:#} x:(Unary ~n) = Unary ~(n + 1);

export function loadUnary(slice: Slice): Unary {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        return {
            kind: 'Unary_unary_zero',
        }

    }
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        let x: Unary = loadUnary(slice);
        let n = unary_unary_succ_get_n(x);
        return {
            kind: 'Unary_unary_succ',
            x: x,
            n: n,
        }

    }
    throw new Error('Expected one of "Unary_unary_zero", "Unary_unary_succ" in loading "Unary", but data does not satisfy any constructor');
}

export function storeUnary(unary: Unary): (builder: Builder) => void {
    if ((unary.kind == 'Unary_unary_zero')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
        })

    }
    if ((unary.kind == 'Unary_unary_succ')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
            storeUnary(unary.x)(builder);
        })

    }
    throw new Error('Expected one of "Unary_unary_zero", "Unary_unary_succ" in loading "Unary", but data does not satisfy any constructor');
}

// b$01 m:# k:# = ParamConst 2 1;

// c$01 n:# m:# k:# = ParamConst 3 3;

// a$_ n:# = ParamConst 1 1;

// d$_ n:# m:# k:# l:# = ParamConst 4 2;

export function loadParamConst(slice: Slice, arg0: number, arg1: number): ParamConst {
    if (((slice.remainingBits >= 2) && ((slice.preloadUint(2) == 0b01) && ((arg0 == 2) && (arg1 == 1))))) {
        slice.loadUint(2);
        let m: number = slice.loadUint(32);
        let k: number = slice.loadUint(32);
        return {
            kind: 'ParamConst_b',
            m: m,
            k: k,
        }

    }
    if (((slice.remainingBits >= 2) && ((slice.preloadUint(2) == 0b01) && ((arg0 == 3) && (arg1 == 3))))) {
        slice.loadUint(2);
        let n: number = slice.loadUint(32);
        let m: number = slice.loadUint(32);
        let k: number = slice.loadUint(32);
        return {
            kind: 'ParamConst_c',
            n: n,
            m: m,
            k: k,
        }

    }
    if (((arg0 == 1) && (arg1 == 1))) {
        let n: number = slice.loadUint(32);
        return {
            kind: 'ParamConst_a',
            n: n,
        }

    }
    if (((arg0 == 4) && (arg1 == 2))) {
        let n: number = slice.loadUint(32);
        let m: number = slice.loadUint(32);
        let k: number = slice.loadUint(32);
        let l: number = slice.loadUint(32);
        return {
            kind: 'ParamConst_d',
            n: n,
            m: m,
            k: k,
            l: l,
        }

    }
    throw new Error('Expected one of "ParamConst_b", "ParamConst_c", "ParamConst_a", "ParamConst_d" in loading "ParamConst", but data does not satisfy any constructor');
}

export function storeParamConst(paramConst: ParamConst): (builder: Builder) => void {
    if ((paramConst.kind == 'ParamConst_b')) {
        return ((builder: Builder) => {
            builder.storeUint(0b01, 2);
            builder.storeUint(paramConst.m, 32);
            builder.storeUint(paramConst.k, 32);
        })

    }
    if ((paramConst.kind == 'ParamConst_c')) {
        return ((builder: Builder) => {
            builder.storeUint(0b01, 2);
            builder.storeUint(paramConst.n, 32);
            builder.storeUint(paramConst.m, 32);
            builder.storeUint(paramConst.k, 32);
        })

    }
    if ((paramConst.kind == 'ParamConst_a')) {
        return ((builder: Builder) => {
            builder.storeUint(paramConst.n, 32);
        })

    }
    if ((paramConst.kind == 'ParamConst_d')) {
        return ((builder: Builder) => {
            builder.storeUint(paramConst.n, 32);
            builder.storeUint(paramConst.m, 32);
            builder.storeUint(paramConst.k, 32);
            builder.storeUint(paramConst.l, 32);
        })

    }
    throw new Error('Expected one of "ParamConst_b", "ParamConst_c", "ParamConst_a", "ParamConst_d" in loading "ParamConst", but data does not satisfy any constructor');
}

// a$0 = ParamDifNames 2 ~1;

// b$1 = ParamDifNames 3 ~1;

export function paramDifNames_c_get_n(x: ParamDifNames): number {
    if ((x.kind == 'ParamDifNames_a')) {
        return 1

    }
    if ((x.kind == 'ParamDifNames_b')) {
        return 1

    }
    if ((x.kind == 'ParamDifNames_c')) {
        let n = x.n;
        return (n + 1)

    }
    if ((x.kind == 'ParamDifNames_d')) {
        let m = x.m;
        return (m * 2)

    }
    throw new Error('Expected one of "ParamDifNames_a", "ParamDifNames_b", "ParamDifNames_c", "ParamDifNames_d" for type "ParamDifNames" while getting "x", but data does not satisfy any constructor');
}

// c$1 {n:#} x:(ParamDifNames 2 ~n) = ParamDifNames 2 ~(n + 1);

export function paramDifNames_d_get_m(x: ParamDifNames): number {
    if ((x.kind == 'ParamDifNames_a')) {
        return 1

    }
    if ((x.kind == 'ParamDifNames_b')) {
        return 1

    }
    if ((x.kind == 'ParamDifNames_c')) {
        let n = x.n;
        return (n + 1)

    }
    if ((x.kind == 'ParamDifNames_d')) {
        let m = x.m;
        return (m * 2)

    }
    throw new Error('Expected one of "ParamDifNames_a", "ParamDifNames_b", "ParamDifNames_c", "ParamDifNames_d" for type "ParamDifNames" while getting "x", but data does not satisfy any constructor');
}

// d$0 {m:#} x:(ParamDifNames 3 ~m) = ParamDifNames 3 ~(m * 2);

export function loadParamDifNames(slice: Slice, arg0: number): ParamDifNames {
    if (((slice.remainingBits >= 1) && ((slice.preloadUint(1) == 0b0) && (arg0 == 2)))) {
        slice.loadUint(1);
        return {
            kind: 'ParamDifNames_a',
        }

    }
    if (((slice.remainingBits >= 1) && ((slice.preloadUint(1) == 0b1) && (arg0 == 3)))) {
        slice.loadUint(1);
        return {
            kind: 'ParamDifNames_b',
        }

    }
    if (((slice.remainingBits >= 1) && ((slice.preloadUint(1) == 0b1) && (arg0 == 2)))) {
        slice.loadUint(1);
        let x: ParamDifNames = loadParamDifNames(slice, 2);
        let n = paramDifNames_c_get_n(x);
        return {
            kind: 'ParamDifNames_c',
            x: x,
            n: n,
        }

    }
    if (((slice.remainingBits >= 1) && ((slice.preloadUint(1) == 0b0) && (arg0 == 3)))) {
        slice.loadUint(1);
        let x: ParamDifNames = loadParamDifNames(slice, 3);
        let m = paramDifNames_d_get_m(x);
        return {
            kind: 'ParamDifNames_d',
            x: x,
            m: m,
        }

    }
    throw new Error('Expected one of "ParamDifNames_a", "ParamDifNames_b", "ParamDifNames_c", "ParamDifNames_d" in loading "ParamDifNames", but data does not satisfy any constructor');
}

export function storeParamDifNames(paramDifNames: ParamDifNames): (builder: Builder) => void {
    if ((paramDifNames.kind == 'ParamDifNames_a')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
        })

    }
    if ((paramDifNames.kind == 'ParamDifNames_b')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
        })

    }
    if ((paramDifNames.kind == 'ParamDifNames_c')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
            storeParamDifNames(paramDifNames.x)(builder);
        })

    }
    if ((paramDifNames.kind == 'ParamDifNames_d')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
            storeParamDifNames(paramDifNames.x)(builder);
        })

    }
    throw new Error('Expected one of "ParamDifNames_a", "ParamDifNames_b", "ParamDifNames_c", "ParamDifNames_d" in loading "ParamDifNames", but data does not satisfy any constructor');
}

export function paramDifNamesUser_get_k(x: ParamDifNames): number {
    if ((x.kind == 'ParamDifNames_a')) {
        return 1

    }
    if ((x.kind == 'ParamDifNames_b')) {
        return 1

    }
    if ((x.kind == 'ParamDifNames_c')) {
        let n = x.n;
        return (n + 1)

    }
    if ((x.kind == 'ParamDifNames_d')) {
        let m = x.m;
        return (m * 2)

    }
    throw new Error('Expected one of "ParamDifNames_a", "ParamDifNames_b", "ParamDifNames_c", "ParamDifNames_d" for type "ParamDifNames" while getting "x", but data does not satisfy any constructor');
}

// e$0 {k:#} x:(ParamDifNames 2 ~k) = ParamDifNamesUser;

export function loadParamDifNamesUser(slice: Slice): ParamDifNamesUser {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        let x: ParamDifNames = loadParamDifNames(slice, 2);
        let k = paramDifNamesUser_get_k(x);
        return {
            kind: 'ParamDifNamesUser',
            x: x,
            k: k,
        }

    }
    throw new Error('Expected one of "ParamDifNamesUser" in loading "ParamDifNamesUser", but data does not satisfy any constructor');
}

export function storeParamDifNamesUser(paramDifNamesUser: ParamDifNamesUser): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0b0, 1);
        storeParamDifNames(paramDifNamesUser.x)(builder);
    })

}

// b$1 {y:#} t:# z:# { t = (~y) * 2} = NegationFromImplicit ~(y + 1);

export function loadNegationFromImplicit(slice: Slice): NegationFromImplicit {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        let t: number = slice.loadUint(32);
        let z: number = slice.loadUint(32);
        return {
            kind: 'NegationFromImplicit',
            y: (t / 2),
            t: t,
            z: z,
        }

    }
    throw new Error('Expected one of "NegationFromImplicit" in loading "NegationFromImplicit", but data does not satisfy any constructor');
}

export function storeNegationFromImplicit(negationFromImplicit: NegationFromImplicit): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0b1, 1);
        builder.storeUint(negationFromImplicit.t, 32);
        builder.storeUint(negationFromImplicit.z, 32);
    })

}

export function unaryUserCheckOrder_get_l(label: Unary): number {
    if ((label.kind == 'Unary_unary_zero')) {
        return 0

    }
    if ((label.kind == 'Unary_unary_succ')) {
        let n = label.n;
        return (n + 1)

    }
    throw new Error('Expected one of "Unary_unary_zero", "Unary_unary_succ" for type "Unary" while getting "label", but data does not satisfy any constructor');
}

// hm_edge#_ {l:#} {m:#} label:(Unary ~l) {7 = (~m) + l} = UnaryUserCheckOrder;

export function loadUnaryUserCheckOrder(slice: Slice): UnaryUserCheckOrder {
    let label: Unary = loadUnary(slice);
    let l = unaryUserCheckOrder_get_l(label);
    return {
        kind: 'UnaryUserCheckOrder',
        m: (7 - l),
        label: label,
        l: l,
    }

}

export function storeUnaryUserCheckOrder(unaryUserCheckOrder: UnaryUserCheckOrder): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeUnary(unaryUserCheckOrder.label)(builder);
    })

}

/*
a$_ {X:Type} info:int32
  init:(Maybe (Either X ^int22))
  other:(Either X ^(OneComb X))
  body:(Either X ^X) = CombArgCellRef X;
*/

export function loadCombArgCellRef<X>(slice: Slice, loadX: (slice: Slice) => X): CombArgCellRef<X> {
    let info: number = slice.loadInt(32);
    let init: Maybe<Either<X, number>> = loadMaybe<Either<X, number>>(slice, ((slice: Slice) => {
        return loadEither<X, number>(slice, loadX, ((slice: Slice) => {
            let slice1 = slice.loadRef().beginParse();
            return slice1.loadInt(22)

        }))

    }));
    let other: Either<X, OneComb<X>> = loadEither<X, OneComb<X>>(slice, loadX, ((slice: Slice) => {
        let slice1 = slice.loadRef().beginParse();
        return loadOneComb<X>(slice1, loadX)

    }));
    let body: Either<X, X> = loadEither<X, X>(slice, loadX, ((slice: Slice) => {
        let slice1 = slice.loadRef().beginParse();
        return loadX(slice1)

    }));
    return {
        kind: 'CombArgCellRef',
        info: info,
        init: init,
        other: other,
        body: body,
    }

}

export function storeCombArgCellRef<X>(combArgCellRef: CombArgCellRef<X>, storeX: (x: X) => (builder: Builder) => void): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeInt(combArgCellRef.info, 32);
        storeMaybe<Either<X, number>>(combArgCellRef.init, ((arg: Either<X, number>) => {
            return ((builder: Builder) => {
                storeEither<X, number>(arg, storeX, ((arg: number) => {
                    return ((builder: Builder) => {
                        let cell1 = beginCell();
                        cell1.storeInt(arg, 22);
                        builder.storeRef(cell1);

                    })

                }))(builder);
            })

        }))(builder);
        storeEither<X, OneComb<X>>(combArgCellRef.other, storeX, ((arg: OneComb<X>) => {
            return ((builder: Builder) => {
                let cell1 = beginCell();
                storeOneComb<X>(arg, storeX)(cell1);
                builder.storeRef(cell1);

            })

        }))(builder);
        storeEither<X, X>(combArgCellRef.body, storeX, ((arg: X) => {
            return ((builder: Builder) => {
                let cell1 = beginCell();
                storeX(arg)(cell1);
                builder.storeRef(cell1);

            })

        }))(builder);
    })

}

// a$_ x:(CombArgCellRef int12) = CombArgCellRefUser;

export function loadCombArgCellRefUser(slice: Slice): CombArgCellRefUser {
    let x: CombArgCellRef<number> = loadCombArgCellRef<number>(slice, ((slice: Slice) => {
        return slice.loadInt(12)

    }));
    return {
        kind: 'CombArgCellRefUser',
        x: x,
    }

}

export function storeCombArgCellRefUser(combArgCellRefUser: CombArgCellRefUser): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeCombArgCellRef<number>(combArgCellRefUser.x, ((arg: number) => {
            return ((builder: Builder) => {
                builder.storeInt(arg, 12);
            })

        }))(builder);
    })

}

// a$_ {n:#} ref:^(BitLenArg (n + 2)) = MathExprAsCombArg (n + 2);

export function loadMathExprAsCombArg(slice: Slice, arg0: number): MathExprAsCombArg {
    let slice1 = slice.loadRef().beginParse();
    let ref: BitLenArg = loadBitLenArg(slice1, ((arg0 - 2) + 2));
    return {
        kind: 'MathExprAsCombArg',
        n: (arg0 - 2),
        ref: ref,
    }

}

export function storeMathExprAsCombArg(mathExprAsCombArg: MathExprAsCombArg): (builder: Builder) => void {
    return ((builder: Builder) => {
        let cell1 = beginCell();
        storeBitLenArg(mathExprAsCombArg.ref)(cell1);
        builder.storeRef(cell1);
    })

}

// _ a:# = EmptyTag;

export function loadEmptyTag(slice: Slice): EmptyTag {
    let a: number = slice.loadUint(32);
    return {
        kind: 'EmptyTag',
        a: a,
    }

}

export function storeEmptyTag(emptyTag: EmptyTag): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(emptyTag.a, 32);
    })

}

// a#f4 x:# = SharpTag;

export function loadSharpTag(slice: Slice): SharpTag {
    if (((slice.remainingBits >= 8) && (slice.preloadUint(8) == 0xf4))) {
        slice.loadUint(8);
        let x: number = slice.loadUint(32);
        return {
            kind: 'SharpTag',
            x: x,
        }

    }
    throw new Error('Expected one of "SharpTag" in loading "SharpTag", but data does not satisfy any constructor');
}

export function storeSharpTag(sharpTag: SharpTag): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0xf4, 8);
        builder.storeUint(sharpTag.x, 32);
    })

}

// a$1011 x:# = DollarTag;

export function loadDollarTag(slice: Slice): DollarTag {
    if (((slice.remainingBits >= 4) && (slice.preloadUint(4) == 0b1011))) {
        slice.loadUint(4);
        let x: number = slice.loadUint(32);
        return {
            kind: 'DollarTag',
            x: x,
        }

    }
    throw new Error('Expected one of "DollarTag" in loading "DollarTag", but data does not satisfy any constructor');
}

export function storeDollarTag(dollarTag: DollarTag): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0b1011, 4);
        builder.storeUint(dollarTag.x, 32);
    })

}

// a$_ s:(3 * int5) = TupleCheck;

export function loadTupleCheck(slice: Slice): TupleCheck {
    let s: Array<number> = Array.from(Array(3).keys()).map(((arg: number) => {
        return slice.loadInt(5)

    }));
    return {
        kind: 'TupleCheck',
        s: s,
    }

}

export function storeTupleCheck(tupleCheck: TupleCheck): (builder: Builder) => void {
    return ((builder: Builder) => {
        tupleCheck.s.forEach(((arg: number) => {
            builder.storeInt(arg, 5);
        }));
    })

}

export function hashmap_get_l(label: HmLabel): number {
    if ((label.kind == 'HmLabel_hml_short')) {
        let n = label.n;
        return n

    }
    if ((label.kind == 'HmLabel_hml_long')) {
        let n = label.n;
        return n

    }
    if ((label.kind == 'HmLabel_hml_same')) {
        let n = label.n;
        return n

    }
    throw new Error('Expected one of "HmLabel_hml_short", "HmLabel_hml_long", "HmLabel_hml_same" for type "HmLabel" while getting "label", but data does not satisfy any constructor');
}

/*
hm_edge#_ {n:#} {X:Type} {l:#} {m:#} label:(HmLabel ~l n) 
          {n = (~m) + l} node:(HashmapNode m X) = Hashmap n X;
*/

export function loadHashmap<X>(slice: Slice, n: number, loadX: (slice: Slice) => X): Hashmap<X> {
    let label: HmLabel = loadHmLabel(slice, n);
    let l = hashmap_get_l(label);
    let node: HashmapNode<X> = loadHashmapNode<X>(slice, (n - l), loadX);
    return {
        kind: 'Hashmap',
        m: (n - l),
        n: n,
        label: label,
        l: l,
        node: node,
    }

}

export function storeHashmap<X>(hashmap: Hashmap<X>, storeX: (x: X) => (builder: Builder) => void): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeHmLabel(hashmap.label)(builder);
        storeHashmapNode<X>(hashmap.node, storeX)(builder);
    })

}

// hmn_leaf#_ {X:Type} value:X = HashmapNode 0 X;

/*
hmn_fork#_ {n:#} {X:Type} left:^(Hashmap n X) 
           right:^(Hashmap n X) = HashmapNode (n + 1) X;
*/

export function loadHashmapNode<X>(slice: Slice, arg0: number, loadX: (slice: Slice) => X): HashmapNode<X> {
    if ((arg0 == 0)) {
        let value: X = loadX(slice);
        return {
            kind: 'HashmapNode_hmn_leaf',
            value: value,
        }

    }
    if (true) {
        let slice1 = slice.loadRef().beginParse();
        let left: Hashmap<X> = loadHashmap<X>(slice1, (arg0 - 1), loadX);
        let slice2 = slice.loadRef().beginParse();
        let right: Hashmap<X> = loadHashmap<X>(slice2, (arg0 - 1), loadX);
        return {
            kind: 'HashmapNode_hmn_fork',
            n: (arg0 - 1),
            left: left,
            right: right,
        }

    }
    throw new Error('Expected one of "HashmapNode_hmn_leaf", "HashmapNode_hmn_fork" in loading "HashmapNode", but data does not satisfy any constructor');
}

export function storeHashmapNode<X>(hashmapNode: HashmapNode<X>, storeX: (x: X) => (builder: Builder) => void): (builder: Builder) => void {
    if ((hashmapNode.kind == 'HashmapNode_hmn_leaf')) {
        return ((builder: Builder) => {
            storeX(hashmapNode.value)(builder);
        })

    }
    if ((hashmapNode.kind == 'HashmapNode_hmn_fork')) {
        return ((builder: Builder) => {
            let cell1 = beginCell();
            storeHashmap<X>(hashmapNode.left, storeX)(cell1);
            builder.storeRef(cell1);
            let cell2 = beginCell();
            storeHashmap<X>(hashmapNode.right, storeX)(cell2);
            builder.storeRef(cell2);
        })

    }
    throw new Error('Expected one of "HashmapNode_hmn_leaf", "HashmapNode_hmn_fork" in loading "HashmapNode", but data does not satisfy any constructor');
}

export function hmLabel_hml_short_get_n(len: Unary): number {
    if ((len.kind == 'Unary_unary_zero')) {
        return 0

    }
    if ((len.kind == 'Unary_unary_succ')) {
        let n = len.n;
        return (n + 1)

    }
    throw new Error('Expected one of "Unary_unary_zero", "Unary_unary_succ" for type "Unary" while getting "len", but data does not satisfy any constructor');
}

// hml_short$0 {m:#} {n:#} len:(Unary ~n) {n <= m} s:(n * Bit) = HmLabel ~n m;

// hml_long$10 {m:#} n:(#<= m) s:(n * Bit) = HmLabel ~n m;

// hml_same$11 {m:#} v:Bit n:(#<= m) = HmLabel ~n m;

export function loadHmLabel(slice: Slice, m: number): HmLabel {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        let len: Unary = loadUnary(slice);
        let n = hmLabel_hml_short_get_n(len);
        let s: Array<BitString> = Array.from(Array(n).keys()).map(((arg: number) => {
            return slice.loadBits(1)

        }));
        if ((!(n <= m))) {
            throw new Error('Condition (n <= m) is not satisfied while loading "HmLabel_hml_short" for type "HmLabel"');
        }
        return {
            kind: 'HmLabel_hml_short',
            m: m,
            len: len,
            n: n,
            s: s,
        }

    }
    if (((slice.remainingBits >= 2) && (slice.preloadUint(2) == 0b10))) {
        slice.loadUint(2);
        let n: number = slice.loadUint(bitLen(m));
        let s: Array<BitString> = Array.from(Array(n).keys()).map(((arg: number) => {
            return slice.loadBits(1)

        }));
        return {
            kind: 'HmLabel_hml_long',
            m: m,
            n: n,
            s: s,
        }

    }
    if (((slice.remainingBits >= 2) && (slice.preloadUint(2) == 0b11))) {
        slice.loadUint(2);
        let v: BitString = slice.loadBits(1);
        let n: number = slice.loadUint(bitLen(m));
        return {
            kind: 'HmLabel_hml_same',
            m: m,
            v: v,
            n: n,
        }

    }
    throw new Error('Expected one of "HmLabel_hml_short", "HmLabel_hml_long", "HmLabel_hml_same" in loading "HmLabel", but data does not satisfy any constructor');
}

export function storeHmLabel(hmLabel: HmLabel): (builder: Builder) => void {
    if ((hmLabel.kind == 'HmLabel_hml_short')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
            storeUnary(hmLabel.len)(builder);
            hmLabel.s.forEach(((arg: BitString) => {
                builder.storeBits(arg);
            }));
            if ((!(hmLabel.n <= hmLabel.m))) {
                throw new Error('Condition (hmLabel.n <= hmLabel.m) is not satisfied while loading "HmLabel_hml_short" for type "HmLabel"');
            }
        })

    }
    if ((hmLabel.kind == 'HmLabel_hml_long')) {
        return ((builder: Builder) => {
            builder.storeUint(0b10, 2);
            builder.storeUint(hmLabel.n, bitLen(hmLabel.m));
            hmLabel.s.forEach(((arg: BitString) => {
                builder.storeBits(arg);
            }));
        })

    }
    if ((hmLabel.kind == 'HmLabel_hml_same')) {
        return ((builder: Builder) => {
            builder.storeUint(0b11, 2);
            builder.storeBits(hmLabel.v);
            builder.storeUint(hmLabel.n, bitLen(hmLabel.m));
        })

    }
    throw new Error('Expected one of "HmLabel_hml_short", "HmLabel_hml_long", "HmLabel_hml_same" in loading "HmLabel", but data does not satisfy any constructor');
}

// hme_empty$0 {n:#} {X:Type} = HashmapE n X;

// hme_root$1 {n:#} {X:Type} root:^(Hashmap n X) = HashmapE n X;

export function loadHashmapE<X>(slice: Slice, n: number, loadX: (slice: Slice) => X): HashmapE<X> {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        return {
            kind: 'HashmapE_hme_empty',
            n: n,
        }

    }
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        let slice1 = slice.loadRef().beginParse();
        let root: Hashmap<X> = loadHashmap<X>(slice1, n, loadX);
        return {
            kind: 'HashmapE_hme_root',
            n: n,
            root: root,
        }

    }
    throw new Error('Expected one of "HashmapE_hme_empty", "HashmapE_hme_root" in loading "HashmapE", but data does not satisfy any constructor');
}

export function storeHashmapE<X>(hashmapE: HashmapE<X>, storeX: (x: X) => (builder: Builder) => void): (builder: Builder) => void {
    if ((hashmapE.kind == 'HashmapE_hme_empty')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
        })

    }
    if ((hashmapE.kind == 'HashmapE_hme_root')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
            let cell1 = beginCell();
            storeHashmap<X>(hashmapE.root, storeX)(cell1);
            builder.storeRef(cell1);
        })

    }
    throw new Error('Expected one of "HashmapE_hme_empty", "HashmapE_hme_root" in loading "HashmapE", but data does not satisfy any constructor');
}

// a$_ x:(HashmapE 8 uint16) = HashmapEUser;

export function loadHashmapEUser(slice: Slice): HashmapEUser {
    let x: HashmapE<number> = loadHashmapE<number>(slice, 8, ((slice: Slice) => {
        return slice.loadUint(16)

    }));
    return {
        kind: 'HashmapEUser',
        x: x,
    }

}

export function storeHashmapEUser(hashmapEUser: HashmapEUser): (builder: Builder) => void {
    return ((builder: Builder) => {
        storeHashmapE<number>(hashmapEUser.x, ((arg: number) => {
            return ((builder: Builder) => {
                builder.storeUint(arg, 16);
            })

        }))(builder);
    })

}

// _ a:(## 1) b:a?(## 32) = ConditionalField;

export function loadConditionalField(slice: Slice): ConditionalField {
    let a: number = slice.loadUint(1);
    let b: number | undefined = (a ? slice.loadUint(32) : undefined);
    return {
        kind: 'ConditionalField',
        a: a,
        b: b,
    }

}

export function storeConditionalField(conditionalField: ConditionalField): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(conditionalField.a, 1);
        if ((conditionalField.b != undefined)) {
            builder.storeUint(conditionalField.b, 32);
        }
    })

}

// _ a:(## 6) b:(a . 2)?(## 32) = BitSelection;

export function loadBitSelection(slice: Slice): BitSelection {
    let a: number = slice.loadUint(6);
    let b: number | undefined = ((a & (1 << 2)) ? slice.loadUint(32) : undefined);
    return {
        kind: 'BitSelection',
        a: a,
        b: b,
    }

}

export function storeBitSelection(bitSelection: BitSelection): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(bitSelection.a, 6);
        if ((bitSelection.b != undefined)) {
            builder.storeUint(bitSelection.b, 32);
        }
    })

}

// _ flags:(## 10) { flags <= 100 } = ImplicitCondition;

export function loadImplicitCondition(slice: Slice): ImplicitCondition {
    let flags: number = slice.loadUint(10);
    if ((!(flags <= 100))) {
        throw new Error('Condition (flags <= 100) is not satisfied while loading "ImplicitCondition" for type "ImplicitCondition"');
    }
    return {
        kind: 'ImplicitCondition',
        flags: flags,
    }

}

export function storeImplicitCondition(implicitCondition: ImplicitCondition): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(implicitCondition.flags, 10);
        if ((!(implicitCondition.flags <= 100))) {
            throw new Error('Condition (implicitCondition.flags <= 100) is not satisfied while loading "ImplicitCondition" for type "ImplicitCondition"');
        }
    })

}

// _ a:# = MultipleEmptyConstructor 0;

// _ b:(## 5) = MultipleEmptyConstructor 1;

// a$_ x:(## 6) = MultipleEmptyConstructor 2;

export function loadMultipleEmptyConstructor(slice: Slice, arg0: number): MultipleEmptyConstructor {
    if ((arg0 == 0)) {
        let a: number = slice.loadUint(32);
        return {
            kind: 'MultipleEmptyConstructor__',
            a: a,
        }

    }
    if ((arg0 == 1)) {
        let b: number = slice.loadUint(5);
        return {
            kind: 'MultipleEmptyConstructor__1',
            b: b,
        }

    }
    if ((arg0 == 2)) {
        let x: number = slice.loadUint(6);
        return {
            kind: 'MultipleEmptyConstructor_a',
            x: x,
        }

    }
    throw new Error('Expected one of "MultipleEmptyConstructor__", "MultipleEmptyConstructor__1", "MultipleEmptyConstructor_a" in loading "MultipleEmptyConstructor", but data does not satisfy any constructor');
}

export function storeMultipleEmptyConstructor(multipleEmptyConstructor: MultipleEmptyConstructor): (builder: Builder) => void {
    if ((multipleEmptyConstructor.kind == 'MultipleEmptyConstructor__')) {
        return ((builder: Builder) => {
            builder.storeUint(multipleEmptyConstructor.a, 32);
        })

    }
    if ((multipleEmptyConstructor.kind == 'MultipleEmptyConstructor__1')) {
        return ((builder: Builder) => {
            builder.storeUint(multipleEmptyConstructor.b, 5);
        })

    }
    if ((multipleEmptyConstructor.kind == 'MultipleEmptyConstructor_a')) {
        return ((builder: Builder) => {
            builder.storeUint(multipleEmptyConstructor.x, 6);
        })

    }
    throw new Error('Expected one of "MultipleEmptyConstructor__", "MultipleEmptyConstructor__1", "MultipleEmptyConstructor_a" in loading "MultipleEmptyConstructor", but data does not satisfy any constructor');
}

// true$_ = True;

export function loadTrue(slice: Slice): True {
    return {
        kind: 'True',
    }

}

export function storeTrue(true0: True): (builder: Builder) => void {
    return ((builder: Builder) => {
    })

}

// a$0 {n:#} = ParamNamedArgInSecondConstr n;

// b$1 {n:#} = ParamNamedArgInSecondConstr (n + 1);

export function loadParamNamedArgInSecondConstr(slice: Slice, arg0: number): ParamNamedArgInSecondConstr {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        return {
            kind: 'ParamNamedArgInSecondConstr_a',
            n: arg0,
        }

    }
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b1))) {
        slice.loadUint(1);
        return {
            kind: 'ParamNamedArgInSecondConstr_b',
            n: (arg0 - 1),
        }

    }
    throw new Error('Expected one of "ParamNamedArgInSecondConstr_a", "ParamNamedArgInSecondConstr_b" in loading "ParamNamedArgInSecondConstr", but data does not satisfy any constructor');
}

export function storeParamNamedArgInSecondConstr(paramNamedArgInSecondConstr: ParamNamedArgInSecondConstr): (builder: Builder) => void {
    if ((paramNamedArgInSecondConstr.kind == 'ParamNamedArgInSecondConstr_a')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
        })

    }
    if ((paramNamedArgInSecondConstr.kind == 'ParamNamedArgInSecondConstr_b')) {
        return ((builder: Builder) => {
            builder.storeUint(0b1, 1);
        })

    }
    throw new Error('Expected one of "ParamNamedArgInSecondConstr_a", "ParamNamedArgInSecondConstr_b" in loading "ParamNamedArgInSecondConstr", but data does not satisfy any constructor');
}

// a$_ msg:^(Maybe Any) = RefCombinatorAny;

export function loadRefCombinatorAny(slice: Slice): RefCombinatorAny {
    let slice1 = slice.loadRef().beginParse();
    let msg: Maybe<Slice> = loadMaybe<Slice>(slice1, ((slice: Slice) => {
        return slice

    }));
    return {
        kind: 'RefCombinatorAny',
        msg: msg,
    }

}

export function storeRefCombinatorAny(refCombinatorAny: RefCombinatorAny): (builder: Builder) => void {
    return ((builder: Builder) => {
        let cell1 = beginCell();
        storeMaybe<Slice>(refCombinatorAny.msg, ((arg: Slice) => {
            return ((builder: Builder) => {
                builder.storeSlice(arg);
            })

        }))(cell1);
        builder.storeRef(cell1);
    })

}

// a$_ n:# { 5 + n = 7 } = EqualityExpression;

export function loadEqualityExpression(slice: Slice): EqualityExpression {
    let n: number = slice.loadUint(32);
    if ((!((5 + n) == 7))) {
        throw new Error('Condition ((5 + n) == 7) is not satisfied while loading "EqualityExpression" for type "EqualityExpression"');
    }
    return {
        kind: 'EqualityExpression',
        n: n,
    }

}

export function storeEqualityExpression(equalityExpression: EqualityExpression): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(equalityExpression.n, 32);
        if ((!((5 + equalityExpression.n) == 7))) {
            throw new Error('Condition ((5 + equalityExpression.n) == 7) is not satisfied while loading "EqualityExpression" for type "EqualityExpression"');
        }
    })

}

// a$_ x:(## 1) y:x?^Simple = ConditionalRef;

export function loadConditionalRef(slice: Slice): ConditionalRef {
    let x: number = slice.loadUint(1);
    let y: Simple | undefined = (x ? ((slice: Slice) => {
        let slice1 = slice.loadRef().beginParse();
        return loadSimple(slice1)

    })(slice) : undefined);
    return {
        kind: 'ConditionalRef',
        x: x,
        y: y,
    }

}

export function storeConditionalRef(conditionalRef: ConditionalRef): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(conditionalRef.x, 1);
        if ((conditionalRef.y != undefined)) {
            let cell1 = beginCell();
            storeSimple(conditionalRef.y)(cell1);
            builder.storeRef(cell1);

        }
    })

}

// block_info#9bc7a987 seq_no:# { prev_seq_no:# } { ~prev_seq_no + 1 = seq_no } = LoadFromNegationOutsideExpr;

export function loadLoadFromNegationOutsideExpr(slice: Slice): LoadFromNegationOutsideExpr {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x9bc7a987))) {
        slice.loadUint(32);
        let seq_no: number = slice.loadUint(32);
        return {
            kind: 'LoadFromNegationOutsideExpr',
            prev_seq_no: (seq_no - 1),
            seq_no: seq_no,
        }

    }
    throw new Error('Expected one of "LoadFromNegationOutsideExpr" in loading "LoadFromNegationOutsideExpr", but data does not satisfy any constructor');
}

export function storeLoadFromNegationOutsideExpr(loadFromNegationOutsideExpr: LoadFromNegationOutsideExpr): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0x9bc7a987, 32);
        builder.storeUint(loadFromNegationOutsideExpr.seq_no, 32);
    })

}

// bit$_ (## 1) anon0:# = AnonymousData;

export function loadAnonymousData(slice: Slice): AnonymousData {
    let anon0: number = slice.loadUint(1);
    let anon0_0: number = slice.loadUint(32);
    return {
        kind: 'AnonymousData',
        anon0: anon0,
        anon0_0: anon0_0,
    }

}

export function storeAnonymousData(anonymousData: AnonymousData): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(anonymousData.anon0, 1);
        builder.storeUint(anonymousData.anon0_0, 32);
    })

}

// vm_stk_int#0201_ value:int257 = FalseAnonField;

export function loadFalseAnonField(slice: Slice): FalseAnonField {
    if (((slice.remainingBits >= 16) && (slice.preloadUint(16) == 0x0201))) {
        slice.loadUint(16);
        let value: bigint = slice.loadIntBig(257);
        return {
            kind: 'FalseAnonField',
            value: value,
        }

    }
    throw new Error('Expected one of "FalseAnonField" in loading "FalseAnonField", but data does not satisfy any constructor');
}

export function storeFalseAnonField(falseAnonField: FalseAnonField): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(0x0201, 16);
        builder.storeInt(falseAnonField.value, 257);
    })

}

// a$0 a:Simple = ConstructorOrder;

// _ Simple = ConstructorOrder;

export function loadConstructorOrder(slice: Slice): ConstructorOrder {
    if (((slice.remainingBits >= 1) && (slice.preloadUint(1) == 0b0))) {
        slice.loadUint(1);
        let a: Simple = loadSimple(slice);
        return {
            kind: 'ConstructorOrder_a',
            a: a,
        }

    }
    if (true) {
        let anon0: Simple = loadSimple(slice);
        return {
            kind: 'ConstructorOrder__',
            anon0: anon0,
        }

    }
    throw new Error('Expected one of "ConstructorOrder_a", "ConstructorOrder__" in loading "ConstructorOrder", but data does not satisfy any constructor');
}

export function storeConstructorOrder(constructorOrder: ConstructorOrder): (builder: Builder) => void {
    if ((constructorOrder.kind == 'ConstructorOrder_a')) {
        return ((builder: Builder) => {
            builder.storeUint(0b0, 1);
            storeSimple(constructorOrder.a)(builder);
        })

    }
    if ((constructorOrder.kind == 'ConstructorOrder__')) {
        return ((builder: Builder) => {
            storeSimple(constructorOrder.anon0)(builder);
        })

    }
    throw new Error('Expected one of "ConstructorOrder_a", "ConstructorOrder__" in loading "ConstructorOrder", but data does not satisfy any constructor');
}

// a a:#  = CheckCrc32;

// b b:# c:# = CheckCrc32;

export function loadCheckCrc32(slice: Slice): CheckCrc32 {
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x9d97e7a))) {
        slice.loadUint(32);
        let a: number = slice.loadUint(32);
        return {
            kind: 'CheckCrc32_a',
            a: a,
        }

    }
    if (((slice.remainingBits >= 32) && (slice.preloadUint(32) == 0x2842b3f0))) {
        slice.loadUint(32);
        let b: number = slice.loadUint(32);
        let c: number = slice.loadUint(32);
        return {
            kind: 'CheckCrc32_b',
            b: b,
            c: c,
        }

    }
    throw new Error('Expected one of "CheckCrc32_a", "CheckCrc32_b" in loading "CheckCrc32", but data does not satisfy any constructor');
}

export function storeCheckCrc32(checkCrc32: CheckCrc32): (builder: Builder) => void {
    if ((checkCrc32.kind == 'CheckCrc32_a')) {
        return ((builder: Builder) => {
            builder.storeUint(0x9d97e7a, 32);
            builder.storeUint(checkCrc32.a, 32);
        })

    }
    if ((checkCrc32.kind == 'CheckCrc32_b')) {
        return ((builder: Builder) => {
            builder.storeUint(0x2842b3f0, 32);
            builder.storeUint(checkCrc32.b, 32);
            builder.storeUint(checkCrc32.c, 32);
        })

    }
    throw new Error('Expected one of "CheckCrc32_a", "CheckCrc32_b" in loading "CheckCrc32", but data does not satisfy any constructor');
}

// a$_ const:# = CheckKeyword;

export function loadCheckKeyword(slice: Slice): CheckKeyword {
    let const0: number = slice.loadUint(32);
    return {
        kind: 'CheckKeyword',
        const0: const0,
    }

}

export function storeCheckKeyword(checkKeyword: CheckKeyword): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(checkKeyword.const0, 32);
    })

}

// a$_ {X:Type} t:# y:(Maybe ^X) = RefCombinatorInRefHelper X;

export function loadRefCombinatorInRefHelper<X>(slice: Slice, loadX: (slice: Slice) => X): RefCombinatorInRefHelper<X> {
    let t: number = slice.loadUint(32);
    let y: Maybe<X> = loadMaybe<X>(slice, ((slice: Slice) => {
        let slice1 = slice.loadRef().beginParse();
        return loadX(slice1)

    }));
    return {
        kind: 'RefCombinatorInRefHelper',
        t: t,
        y: y,
    }

}

export function storeRefCombinatorInRefHelper<X>(refCombinatorInRefHelper: RefCombinatorInRefHelper<X>, storeX: (x: X) => (builder: Builder) => void): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(refCombinatorInRefHelper.t, 32);
        storeMaybe<X>(refCombinatorInRefHelper.y, ((arg: X) => {
            return ((builder: Builder) => {
                let cell1 = beginCell();
                storeX(arg)(cell1);
                builder.storeRef(cell1);

            })

        }))(builder);
    })

}

// a$_ msg:^(RefCombinatorInRefHelper Any) = RefCombinatorInRef;

export function loadRefCombinatorInRef(slice: Slice): RefCombinatorInRef {
    let slice1 = slice.loadRef().beginParse();
    let msg: RefCombinatorInRefHelper<Slice> = loadRefCombinatorInRefHelper<Slice>(slice1, ((slice: Slice) => {
        return slice

    }));
    return {
        kind: 'RefCombinatorInRef',
        msg: msg,
    }

}

export function storeRefCombinatorInRef(refCombinatorInRef: RefCombinatorInRef): (builder: Builder) => void {
    return ((builder: Builder) => {
        let cell1 = beginCell();
        storeRefCombinatorInRefHelper<Slice>(refCombinatorInRef.msg, ((arg: Slice) => {
            return ((builder: Builder) => {
                builder.storeSlice(arg);
            })

        }))(cell1);
        builder.storeRef(cell1);
    })

}

// _ a:Bool = BoolUser;

export function loadBoolUser(slice: Slice): BoolUser {
    let a: boolean = slice.loadBoolean();
    return {
        kind: 'BoolUser',
        a: a,
    }

}

export function storeBoolUser(boolUser: BoolUser): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeBit(boolUser.a);
    })

}

/*
anycast_info$_ depth:(#<= 30) { depth >= 1 }
   rewrite_pfx:(bits depth) = Anycast;
*/

export function loadAnycast(slice: Slice): Anycast {
    let depth: number = slice.loadUint(bitLen(30));
    let rewrite_pfx: BitString = slice.loadBits(depth);
    if ((!(depth >= 1))) {
        throw new Error('Condition (depth >= 1) is not satisfied while loading "Anycast" for type "Anycast"');
    }
    return {
        kind: 'Anycast',
        depth: depth,
        rewrite_pfx: rewrite_pfx,
    }

}

export function storeAnycast(anycast: Anycast): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeUint(anycast.depth, bitLen(30));
        builder.storeBits(anycast.rewrite_pfx);
        if ((!(anycast.depth >= 1))) {
            throw new Error('Condition (anycast.depth >= 1) is not satisfied while loading "Anycast" for type "Anycast"');
        }
    })

}

// _ src:MsgAddressInt = AddressUser;

export function loadAddressUser(slice: Slice): AddressUser {
    let src: Address = slice.loadAddress();
    return {
        kind: 'AddressUser',
        src: src,
    }

}

export function storeAddressUser(addressUser: AddressUser): (builder: Builder) => void {
    return ((builder: Builder) => {
        builder.storeAddress(addressUser.src);
    })

}

