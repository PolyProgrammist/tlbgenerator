import fs from 'fs'
import path from 'path'
import util from 'util'

import { parse } from '../src'
import { ast } from '../src'
import { generate } from '../src/codegen/main'
import { Program } from '../src/ast/nodes'
import { BitString, Slice, Builder, Cell, Address } from 'ton'

import { TwoConstructors, Simple, loadTwoConstructors, loadSimple, storeTwoConstructors, storeSimple, TypedParam, loadTypedParam, storeTypedParam, TypedField, loadTypedField, storeTypedField, ExprArg, BitLenArg, loadBitLenArg, storeBitLenArg, BitLenArgUser, loadBitLenArgUser, storeBitLenArgUser, ExprArgUser, loadExprArgUser, storeExprArgUser, ComplexTypedField, loadComplexTypedField, storeComplexTypedField, CellTypedField, storeCellTypedField, loadCellTypedField, CellsSimple, loadCellsSimple, storeCellsSimple, IntBitsOutside, loadIntBitsOutside, storeIntBitsOutside, IntBitsParametrizedOutside, loadIntBitsParametrizedOutside, storeIntBitsParametrizedOutside, LessThan, loadLessThan, storeLessThan, Unary, loadUnary, storeUnary, ParamConst, loadParamConst, storeParamConst, ParamDifNames, loadParamDifNames, storeParamDifNames, NegationFromImplicit, loadNegationFromImplicit, storeNegationFromImplicit, loadManyComb, storeManyComb, ManyComb, ParamDifNamesUser, loadParamDifNamesUser, storeParamDifNamesUser, UnaryUserCheckOrder, loadUnaryUserCheckOrder, storeUnaryUserCheckOrder, CombArgCellRef, loadCombArgCellRef, storeCombArgCellRef, CombArgCellRefUser, loadCombArgCellRefUser, storeCombArgCellRefUser, MathExprAsCombArg, loadMathExprAsCombArg, storeMathExprAsCombArg, SharpConstructor, loadSharpConstructor, storeSharpConstructor, EmptyTag, loadEmptyTag, storeEmptyTag, SharpTag, loadSharpTag, storeSharpTag, DollarTag, loadDollarTag, storeDollarTag, TupleCheck, loadTupleCheck, storeTupleCheck, HashmapE, loadHashmapE, storeHashmapE, HashmapEUser, loadHashmapEUser, storeHashmapEUser, ConditionalField, loadConditionalField, storeConditionalField, BitSelection, loadBitSelection, storeBitSelection, ImplicitCondition, loadImplicitCondition, storeImplicitCondition, MultipleEmptyConstructor, loadMultipleEmptyConstructor, storeMultipleEmptyConstructor, True, loadTrue, storeTrue, ParamNamedArgInSecondConstr, loadParamNamedArgInSecondConstr, storeParamNamedArgInSecondConstr, RefCombinatorAny, loadRefCombinatorAny, storeRefCombinatorAny, EqualityExpression, loadEqualityExpression, storeEqualityExpression, ConditionalRef, loadConditionalRef, storeConditionalRef, LoadFromNegationOutsideExpr, loadLoadFromNegationOutsideExpr, storeLoadFromNegationOutsideExpr, AnonymousData, loadAnonymousData, storeAnonymousData, FalseAnonField, loadFalseAnonField, storeFalseAnonField, ConstructorOrder, loadConstructorOrder, storeConstructorOrder, CheckCrc32, loadCheckCrc32, storeCheckCrc32, CheckKeyword, loadCheckKeyword, storeCheckKeyword, RefCombinatorInRef, loadRefCombinatorInRef, storeRefCombinatorInRef, BoolUser, loadBoolUser, storeBoolUser, AddressUser, loadAddressUser, storeAddressUser} from '../generated_test'
import { beginCell } from 'ton'
import { loadBit, loadBlock, storeBlock} from '../generated_block'

const fixturesDir = path.resolve(__dirname, 'fixtures')

function deepEqual(object1: any, object2: any) {
    if (object1 instanceof BitString && object2 instanceof BitString) {
        return object1.equals(object2);
    }
    if (object1 instanceof Slice && object2 instanceof Slice) {
        return object1.toString() == object2.toString();
    }
    if (object1 instanceof Address && object2 instanceof Address) {
        return object1.equals(object2);
    }

    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            areObjects && !deepEqual(val1, val2) ||
            !areObjects && val1 !== val2
        ) {
            return false;
        }
    }

    return true;
}

function isObject(object: any) {
    return object != null && typeof object === 'object';
}

function checkSameOnStoreLoad(expected: any, load: any, store: any, expectCell?: any) {
    let cell = beginCell();
    store(expected)(cell);
    let slice = cell.endCell().beginParse();
    if (expectCell) {
        expectCell(slice)
    }
    let actual = load(slice)
    expect(deepEqual(expected, actual)).toBeTruthy()
}

function checkDifferOnStoreLoad(expected: any, load: any, store: any) {
    let cell = beginCell();
    store(expected)(cell);
    let actual = load(cell.endCell().beginParse())
    expect(deepEqual(expected, actual)).toBeFalsy()
}

function getBitStringOne(bit: boolean): BitString {
    return beginCell().storeBit(bit).endCell().beginParse().loadBits(1);
}

function getBitStringArray(bitString: string) {
    let result: BitString[] = [];
    for (let i = 0; i < bitString.length; i++) {
        result.push(getBitStringOne(bitString[i] == '0'))
    }
    return result;
}

function checkThrowOnStoreLoad(expected: any, load: any, store: any, expectCell?: any) {
    const t = () => {
        let cell = beginCell();
        store(expected)(cell);
        let slice = cell.endCell().beginParse();
        if (expectCell) {
            expectCell(slice)
        }
        let actual = load(slice)
        return actual;
    }
    expect(t).toThrow(Error);
}

export type TLFunction = {
    decode: any
    encode: any
};

describe('Generating tlb code', () => {
    test('Basic types', () => {
        expect.hasAssertions()

        let simple: Simple = { kind: 'Simple', a: 827, b: 387 }
        checkSameOnStoreLoad(simple, loadSimple, storeSimple);
        let tcFalse: TwoConstructors = { 'kind': 'TwoConstructors_bool_false', a: 1000, b: 10, c: 1000 }
        checkSameOnStoreLoad(tcFalse, loadTwoConstructors, storeTwoConstructors)
        let tcTooBigNumberB: TwoConstructors = { 'kind': 'TwoConstructors_bool_false', a: 1000, b: 128, c: 1000 }
        checkThrowOnStoreLoad(tcTooBigNumberB, loadTwoConstructors, storeTwoConstructors)
        let tcTrue: TwoConstructors = {'kind': 'TwoConstructors_bool_true', b: 1000}
        checkSameOnStoreLoad(tcTrue, loadTwoConstructors, storeTwoConstructors)
        let typedConstructor: TypedField = {'kind': 'TypedField', c: 5, y: {'kind': 'FixedIntParam', y: 10}}
        checkSameOnStoreLoad(typedConstructor, loadTypedField, storeTypedField);
        let typedParamValue: TypedParam = {'kind': 'TypedParam', x: {'kind': 'Maybe_just', value: {'kind': 'SharpConstructor', c: 5, y: {'kind': 'FixedIntParam', y: 6}}}}
        checkSameOnStoreLoad(typedParamValue, loadTypedParam, storeTypedParam);
        let typedParamNothing: TypedParam = {'kind': 'TypedParam', x:{'kind': 'Maybe_nothing'}}
        checkSameOnStoreLoad(typedParamNothing, loadTypedParam, storeTypedParam);
        let bitlenArgUser: BitLenArgUser = {'kind': 'BitLenArgUser', t: {'kind': 'BitLenArg', x: 4, value: BigInt(10)}}
        checkSameOnStoreLoad(bitlenArgUser, loadBitLenArgUser, storeBitLenArgUser);
        let bitlenArgUserIncorrect: BitLenArgUser = {'kind': 'BitLenArgUser', t: {'kind': 'BitLenArg', x: 3, value: BigInt(10)}}
        checkThrowOnStoreLoad(bitlenArgUserIncorrect, loadBitLenArgUser, storeBitLenArgUser);
        let exprArgUser: ExprArgUser = {'kind': 'ExprArgUser', t: {'kind': 'ExprArg', x: 4, value: BigInt(10)}}
        checkSameOnStoreLoad(exprArgUser, loadExprArgUser, storeExprArgUser);
        let exprArgUserIncorrect: ExprArgUser = {'kind': 'ExprArgUser', t: {'kind': 'ExprArg', x: 5, value: BigInt(10)}}
        checkDifferOnStoreLoad(exprArgUserIncorrect, loadExprArgUser, storeExprArgUser);
        let complexTypedField: ComplexTypedField = {'kind': 'ComplexTypedField', a:{'kind': 'ExprArgUser', t: {'kind': 'ExprArg', x: 4, value: BigInt(10)}}}
        checkSameOnStoreLoad(complexTypedField, loadComplexTypedField, storeComplexTypedField);
        let cellTypedField: CellTypedField = {'kind': 'CellTypedField', a:{'kind': 'ExprArgUser', t: {'kind': 'ExprArg', x: 4, value: BigInt(10)}}}
        checkSameOnStoreLoad(cellTypedField, loadCellTypedField, storeCellTypedField);
        let lessThan: LessThan = {kind: 'LessThan', x: 3, y: 7} 
        checkSameOnStoreLoad(lessThan, loadLessThan, storeLessThan);
        let lessThanIncorrectX: LessThan = {kind: 'LessThan', x: 4, y: 7} 
        checkThrowOnStoreLoad(lessThanIncorrectX, loadLessThan, storeLessThan);
        let lessThanIncorrectY: LessThan = {kind: 'LessThan', x: 3, y: 8} 
        checkThrowOnStoreLoad(lessThanIncorrectY, loadLessThan, storeLessThan);
        let paramNamedArgInSecondConstr: ParamNamedArgInSecondConstr = {kind: 'ParamNamedArgInSecondConstr_a', n: 3}
        checkSameOnStoreLoad(paramNamedArgInSecondConstr, (slice: Slice) => { return loadParamNamedArgInSecondConstr(slice, 3) }, storeParamNamedArgInSecondConstr);
        let anonymousData: AnonymousData = {kind: 'AnonymousData', anon0: 1}
        checkSameOnStoreLoad(anonymousData, loadAnonymousData, storeAnonymousData);
        let falseAnonField: FalseAnonField = {kind: 'FalseAnonField', value: 3}
        checkSameOnStoreLoad(falseAnonField, loadFalseAnonField, storeFalseAnonField)
        let checkKeyword: CheckKeyword = {kind: 'CheckKeyword', const0: 3}
        checkSameOnStoreLoad(checkKeyword, loadCheckKeyword, storeCheckKeyword);

        let checkBigInt: BitLenArg = {kind: 'BitLenArg', x: 100, value: BigInt(2709958555) * BigInt(1e9) + BigInt(228628813)}
        checkSameOnStoreLoad(checkBigInt, (slice: Slice) => {return loadBitLenArg(slice, checkBigInt.x)}, storeBitLenArg)
    })

    test('Primitives', () => {
        expect.hasAssertions()

        let boolUserTrue: BoolUser = {kind: 'BoolUser', a: true}
        checkSameOnStoreLoad(boolUserTrue, loadBoolUser, storeBoolUser);
        let boolUserFalse: BoolUser = {kind: 'BoolUser', a: false}
        checkSameOnStoreLoad(boolUserFalse, loadBoolUser, storeBoolUser);

        let expectedAddressUser: AddressUser = {kind: 'AddressUser', src: Address.parseFriendly('EQBmzW4wYlFW0tiBgj5sP1CgSlLdYs-VpjPWM7oPYPYWQEdT').address}
        checkSameOnStoreLoad(expectedAddressUser, loadAddressUser, storeAddressUser)
    })

    test('Combinators', () => {
        expect.hasAssertions()
        let manyComb: ManyComb = {kind: 'ManyComb', y: {kind: 'OneComb', t: 5, x: {kind: 'OneComb', t: 6, x: {kind: 'OneComb', t: 7, x: 3}}}};
        checkSameOnStoreLoad(manyComb, loadManyComb, storeManyComb);
        let manyCombIncorrect: ManyComb = {kind: 'ManyComb', y: {kind: 'OneComb', t: 5, x: {kind: 'OneComb', t: 8, x: {kind: 'OneComb', t: 7, x: 8}}}};
        checkThrowOnStoreLoad(manyCombIncorrect, loadManyComb, storeManyComb);
        let combArgCellRefUser: CombArgCellRefUser = {kind: 'CombArgCellRefUser', x: {kind: 'CombArgCellRef', body: {'kind': 'Either_right', value: 3}, info: 4, other: {kind: 'Either_right', value: {kind: 'OneComb', t: 5, x: 5}}, init: {kind: 'Maybe_just', value: {kind: 'Either_right', value: 4}}}}
        checkSameOnStoreLoad(combArgCellRefUser, loadCombArgCellRefUser, storeCombArgCellRefUser);
        let mathExprAsCombArg: MathExprAsCombArg = {kind: 'MathExprAsCombArg', n: 8, ref: {kind: 'BitLenArg', x: 10, value: BigInt(1000)}}
        checkSameOnStoreLoad(mathExprAsCombArg, (slice: Slice) => {return loadMathExprAsCombArg(slice, mathExprAsCombArg.n + 2)}, storeMathExprAsCombArg);

        let refCombinatorAny: RefCombinatorAny = {
            kind: 'RefCombinatorAny',
            msg: {kind: 'Maybe_just', value: beginCell().storeUint(676, 10).endCell().beginParse()}
        }
        checkSameOnStoreLoad(refCombinatorAny, loadRefCombinatorAny, storeRefCombinatorAny);

        let msgEnvelope: RefCombinatorInRef = {kind: 'RefCombinatorInRef', msg: {kind: 'RefCombinatorInRefHelper', t: 3, y: {kind: 'Maybe_just', value: beginCell().storeUint(3, 32).endCell().beginParse()}} } 
        checkSameOnStoreLoad(msgEnvelope, loadRefCombinatorInRef, storeRefCombinatorInRef);
    });

    test('Naming', () => {
        expect.hasAssertions()

        let multipleEmptyConstructor: MultipleEmptyConstructor = {kind: 'MultipleEmptyConstructor__', a: 5}
        checkSameOnStoreLoad(multipleEmptyConstructor, (slice: Slice) => {return loadMultipleEmptyConstructor(slice, 0);}, storeMultipleEmptyConstructor);
        let multipleEmptyConstructor1: MultipleEmptyConstructor = {kind: 'MultipleEmptyConstructor__1', b: 6}
        checkSameOnStoreLoad(multipleEmptyConstructor1, (slice: Slice) => {return loadMultipleEmptyConstructor(slice, 1);}, storeMultipleEmptyConstructor);
        let multipleEmptyConstructor2: MultipleEmptyConstructor = {kind: 'MultipleEmptyConstructor_a', x: 5}
        checkSameOnStoreLoad(multipleEmptyConstructor2, (slice: Slice) => {return loadMultipleEmptyConstructor(slice, 2);}, storeMultipleEmptyConstructor);

        let trueCheck: True = {kind: 'True'}
        checkSameOnStoreLoad(trueCheck, loadTrue, storeTrue);
    })

    test('Complex Expressions', () => {
        expect.hasAssertions()

        let tupleCheck: TupleCheck = {kind: 'TupleCheck', s: [5, 6, 7]}
        checkSameOnStoreLoad(tupleCheck, loadTupleCheck, storeTupleCheck);

        let conditionalField: ConditionalField = {kind: 'ConditionalField', a: 1, b: 5}
        checkSameOnStoreLoad(conditionalField, loadConditionalField, storeConditionalField);

        let conditionalFieldIncorrect: ConditionalField = {kind: 'ConditionalField', a: 0, b: 5}
        checkDifferOnStoreLoad(conditionalFieldIncorrect, loadConditionalField, storeConditionalField);

        let conditionalFieldBUndef: ConditionalField = {kind: 'ConditionalField', a: 0, b: undefined}
        checkSameOnStoreLoad(conditionalFieldBUndef, loadConditionalField, storeConditionalField);

        let bitSelection: BitSelection = {kind: 'BitSelection', a: 5, b: 5}
        checkSameOnStoreLoad(bitSelection, loadBitSelection, storeBitSelection);

        let bitSelectionIncorrect: BitSelection = {kind: 'BitSelection', a: 8, b: 5}
        checkDifferOnStoreLoad(bitSelectionIncorrect, loadBitSelection, storeBitSelection);

        let conditionalRef: ConditionalRef = {kind: 'ConditionalRef', x: 1, y: {kind: 'Simple', a: 3, b: 4}}
        checkSameOnStoreLoad(conditionalRef, loadConditionalRef, storeConditionalRef);

        let conditionalRefUndefined: ConditionalRef = {kind: 'ConditionalRef', x: 0, y: undefined}
        checkSameOnStoreLoad(conditionalRefUndefined, loadConditionalRef, storeConditionalRef);
    })

    test('Exceptions', () => {
        expect.hasAssertions()

        let implicitConditionIncorrect: ImplicitCondition = {kind: 'ImplicitCondition', flags: 200}
        checkThrowOnStoreLoad(implicitConditionIncorrect, loadImplicitCondition, storeImplicitCondition);

        let implicitCondition: ImplicitCondition = {kind: 'ImplicitCondition', flags: 100}
        checkSameOnStoreLoad(implicitCondition, loadImplicitCondition, storeImplicitCondition);

        let implicitConditionIncorrectCell = beginCell().storeUint(200, 10).endCell().beginParse();
        expect(() => {
            loadImplicitCondition(implicitConditionIncorrectCell)
        }).toThrow(Error);

        let implicitConditionCell = beginCell().storeUint(100, 10).endCell().beginParse();
        expect(loadImplicitCondition(implicitConditionCell).flags == 100).toBeTruthy()

        let equalityExpression: EqualityExpression = {kind: 'EqualityExpression', n: 2}
        checkSameOnStoreLoad(equalityExpression, loadEqualityExpression, storeEqualityExpression);

        let equalityExpressionIncorrect: EqualityExpression = {kind: 'EqualityExpression', n: 3}
        checkThrowOnStoreLoad(equalityExpressionIncorrect, loadEqualityExpression, storeEqualityExpression);
    })

    test('Hashmap', () => {
        expect.hasAssertions()

        let hashmapEUser: HashmapEUser = {
            kind: 'HashmapEUser', 
            x: {
                kind: 'HashmapE_hme_root', 
                n: 8, 
                root: {
                    kind: 'Hashmap', 
                    l:0, m: 8, n: 8, 
                    label: {
                        kind: 'HmLabel_hml_short', 
                        n: 0, m: 8, 
                        len: {kind: 'Unary_unary_zero'}, 
                        s: []
                    },
                    node: {
                        kind: 'HashmapNode_hmn_fork',
                        n: 7,
                        left: {
                            kind: 'Hashmap',
                            n: 7,
                            m: 5,
                            l: 2,
                            label: {
                                kind: 'HmLabel_hml_long',
                                m: 7,
                                n: 2,
                                s: getBitStringArray('00')
                            },
                            node: {
                                kind: 'HashmapNode_hmn_fork',
                                n: 4,
                                left: {
                                    kind: 'Hashmap',
                                    n: 4,
                                    m: 0,
                                    l: 4,
                                    label: {
                                        kind: 'HmLabel_hml_long',
                                        m: 4,
                                        n: 4,
                                        s: getBitStringArray('0001')
                                    },
                                    node: {
                                        kind: 'HashmapNode_hmn_leaf',
                                        value: 777
                                    }
                                },
                                right: {
                                    kind: 'Hashmap',
                                    n: 4,
                                    m: 0,
                                    l: 4,
                                    label: {
                                        kind: 'HmLabel_hml_long',
                                        m: 4,
                                        n: 4,
                                        s: getBitStringArray('0001')
                                    },
                                    node: {
                                        kind: 'HashmapNode_hmn_leaf',
                                        value: 111
                                    }
                                }
                            }
                        },
                        right: {
                            kind: 'Hashmap',
                            n: 7,
                            m: 0,
                            l: 7,
                            label: {
                                kind: 'HmLabel_hml_long',
                                m: 7,
                                n: 7,
                                s: getBitStringArray('0000000')
                            },
                            node: {
                                kind: 'HashmapNode_hmn_leaf',
                                value: 777
                            }
                        }
                    }
                }
            }
        }
        checkSameOnStoreLoad(hashmapEUser, loadHashmapEUser, storeHashmapEUser);
    })

    test('Constructor Tags', () => {
        expect.hasAssertions()

        let sharpConstructor: SharpConstructor = {kind: 'SharpConstructor', c: 5, y: {'kind': 'FixedIntParam', y: 6} }
        checkSameOnStoreLoad(sharpConstructor, loadSharpConstructor, storeSharpConstructor);

        let emptyTag: EmptyTag = {kind: 'EmptyTag', a: 3}
        checkSameOnStoreLoad(emptyTag, loadEmptyTag, storeEmptyTag);
        let emptyTagCell = beginCell();
        storeEmptyTag(emptyTag)(emptyTagCell);
        expect(emptyTagCell.endCell().beginParse().remainingBits == 32).toBeTruthy();

        let sharpTag: SharpTag = {kind: 'SharpTag', x: 3}
        checkSameOnStoreLoad(sharpTag, loadSharpTag, storeSharpTag);
        let sharpTagCell = beginCell();
        storeSharpTag(sharpTag)(sharpTagCell);
        let sharpTagSlice = sharpTagCell.endCell().beginParse()
        expect(sharpTagSlice.loadUint(8) == 0xf4).toBeTruthy();
        expect(sharpTagSlice.remainingBits == 32).toBeTruthy();

        let dollarTag: DollarTag = {kind: 'DollarTag', x: 3} 
        checkSameOnStoreLoad(dollarTag, loadDollarTag, storeDollarTag);
        let dollarTagCell = beginCell();
        storeDollarTag(dollarTag)(dollarTagCell);
        let dollarTagSlice = dollarTagCell.endCell().beginParse()
        expect(dollarTagSlice.loadUint(4) == 0b1011).toBeTruthy();
        expect(dollarTagSlice.remainingBits == 32).toBeTruthy();

        let constructorOrder: ConstructorOrder = {kind: 'ConstructorOrder_a', a: {kind: 'Simple', a: 2, b: 3}}
        checkSameOnStoreLoad(constructorOrder, loadConstructorOrder, storeConstructorOrder);

        let checkCrc32A: CheckCrc32 = {kind: 'CheckCrc32_a', a: 3}
        checkSameOnStoreLoad(checkCrc32A, loadCheckCrc32, storeCheckCrc32);

        let checkCrc32B: CheckCrc32 = {kind: 'CheckCrc32_b', b: 4, c: 5}
        checkSameOnStoreLoad(checkCrc32B, loadCheckCrc32, storeCheckCrc32);

        let checkCrc32AOpCode = beginCell().storeUint(0x9d97e7a, 32).storeUint(76, 32).endCell().beginParse();
        loadCheckCrc32(checkCrc32AOpCode);
    })

    test('Advanced types', () => {
        expect.hasAssertions()

        let unary: Unary = {kind: 'Unary_unary_succ', n: 2, x: {kind: 'Unary_unary_succ', n: 1, x: {kind: 'Unary_unary_succ', n: 0, x: {kind: 'Unary_unary_zero'}}}}
        checkSameOnStoreLoad(unary, loadUnary, storeUnary);
        let unaryIncorrectOne: Unary = {kind: 'Unary_unary_succ', n: 3, x: {kind: 'Unary_unary_succ', n: 1, x: {kind: 'Unary_unary_succ', n: 0, x: {kind: 'Unary_unary_zero'}}}}
        checkDifferOnStoreLoad(unaryIncorrectOne, loadUnary, storeUnary);
        let unaryIncorrectAll: Unary = {kind: 'Unary_unary_succ', n: 3, x: {kind: 'Unary_unary_succ', n: 2, x: {kind: 'Unary_unary_succ', n: 1, x: {kind: 'Unary_unary_zero'}}}}
        checkDifferOnStoreLoad(unaryIncorrectAll, loadUnary, storeUnary);
        let unaryIncorrectSuccZero: Unary = {kind: 'Unary_unary_succ', n: 3, x: {kind: 'Unary_unary_zero'}}
        checkDifferOnStoreLoad(unaryIncorrectSuccZero, loadUnary, storeUnary);

        let paramConstD: ParamConst = {kind: 'ParamConst_d', n: 1, k: 2, l: 3, m: 4}
        checkDifferOnStoreLoad(paramConstD, (slice: Slice) => loadParamConst(slice, 1, 1), storeParamConst);
        checkThrowOnStoreLoad(paramConstD, (slice: Slice) => loadParamConst(slice, 1, 2), storeParamConst)
        checkSameOnStoreLoad(paramConstD, (slice: Slice) => loadParamConst(slice, 4, 2), storeParamConst)
        let paramConstB: ParamConst = {kind: 'ParamConst_b', k: 2, m: 4}
        checkSameOnStoreLoad(paramConstB, (slice: Slice) => loadParamConst(slice, 2, 1), storeParamConst);
        let paramConstC: ParamConst = {kind: 'ParamConst_c', k: 2, m: 4, n: 3}
        checkSameOnStoreLoad(paramConstC, (slice: Slice) => loadParamConst(slice, 3, 3), storeParamConst);

        let paramDifNamesC: ParamDifNames = {kind: 'ParamDifNames_c', n: 3, x: {kind: 'ParamDifNames_c', n: 2, x: {kind: 'ParamDifNames_c', n: 1, x:{kind: 'ParamDifNames_a'}}}}
        checkSameOnStoreLoad(paramDifNamesC, (slice: Slice) => loadParamDifNames(slice, 2), storeParamDifNames);
        let paramDifNamesD: ParamDifNames = {kind: 'ParamDifNames_d', m: 4, x: {kind: 'ParamDifNames_d', m: 2, x: {kind: 'ParamDifNames_d', m: 1, x: {kind: 'ParamDifNames_b'}}}}
        checkSameOnStoreLoad(paramDifNamesD, (slice: Slice) => loadParamDifNames(slice, 3), storeParamDifNames);

        let paramDifNamesUser: ParamDifNamesUser = {kind: 'ParamDifNamesUser', k: 4, x: {kind: 'ParamDifNames_c', n: 3, x: {kind: 'ParamDifNames_c', n: 2, x: {kind: 'ParamDifNames_c', n: 1, x:{kind: 'ParamDifNames_a'}}}}}
        checkSameOnStoreLoad(paramDifNamesUser, loadParamDifNamesUser, storeParamDifNamesUser);
        let paramDifNamesUserIncorrect: ParamDifNamesUser = {kind: 'ParamDifNamesUser', k: 5, x: {kind: 'ParamDifNames_c', n: 3, x: {kind: 'ParamDifNames_c', n: 2, x: {kind: 'ParamDifNames_c', n: 1, x:{kind: 'ParamDifNames_a'}}}}}
        checkDifferOnStoreLoad(paramDifNamesUserIncorrect, loadParamDifNamesUser, storeParamDifNamesUser);

        let negationFromImplicit: NegationFromImplicit = {kind: 'NegationFromImplicit', t: 4, y: 2, z: 7}
        checkSameOnStoreLoad(negationFromImplicit, loadNegationFromImplicit, storeNegationFromImplicit)
        let negationFromImplicitIncorrect: NegationFromImplicit = {kind: 'NegationFromImplicit', t: 4, y: 3, z: 7}
        checkDifferOnStoreLoad(negationFromImplicitIncorrect, loadNegationFromImplicit, storeNegationFromImplicit)

        let unaryUserCheckOrder: UnaryUserCheckOrder = {kind: 'UnaryUserCheckOrder', l: 2, m: 5, label: {kind: 'Unary_unary_succ', n: 1, x: {kind: 'Unary_unary_succ', n: 0, x: {kind: 'Unary_unary_zero'}}}}
        checkSameOnStoreLoad(unaryUserCheckOrder, loadUnaryUserCheckOrder, storeUnaryUserCheckOrder)

        let loadFromNegationOutsideExpr: LoadFromNegationOutsideExpr = {kind: 'LoadFromNegationOutsideExpr', prev_seq_no: 3, seq_no: 4}
        checkSameOnStoreLoad(loadFromNegationOutsideExpr, loadLoadFromNegationOutsideExpr, storeLoadFromNegationOutsideExpr)

    })

    test('Slices', () => {
        expect.hasAssertions()

        let cellsSimple: CellsSimple = {'kind': 'CellsSimple', a: 5, b: 3, c: 4, d: 100, e: 4, q: 1, t: 3}
        checkSameOnStoreLoad(cellsSimple, loadCellsSimple, storeCellsSimple, (slice: Slice) => {
            slice = slice.clone()
            slice.loadRef();
            let slice2 = slice.loadRef().beginParse();
            slice2.loadRef();
            let slice22 = slice2.loadRef().beginParse();
            let slice221 = slice22.loadRef();
        });
        checkThrowOnStoreLoad(cellsSimple, loadCellsSimple, storeCellsSimple, (slice: Slice) => {
            slice = slice.clone()
            slice.loadRef();
            let slice2 = slice.loadRef().beginParse();
            slice2.loadRef();
            let slice22 = slice2.loadRef().beginParse();
            let slice221 = slice22.loadRef();
            let slice2211 = slice221.beginParse().loadRef();
        });
        checkThrowOnStoreLoad(cellsSimple, loadCellsSimple, storeCellsSimple, (slice: Slice) => {
            slice.loadRef();
        });
        checkThrowOnStoreLoad(cellsSimple, loadCellsSimple, storeCellsSimple, (slice: Slice) => {
            slice.preloadRef().beginParse().preloadRef();
        });
        checkSameOnStoreLoad(cellsSimple, loadCellsSimple, storeCellsSimple, (slice: Slice) => {
            slice.preloadRef().beginParse();
        });

        let intBitsOutside: IntBitsOutside = {
            'kind': 'IntBitsOutside', 
            x: {
                'kind': 'IntBitsInside', 
                a: {
                    'kind': 'IntBits', arg: BigInt(3), d: 5, 
                    g: beginCell().storeUint(3, 2).endCell().beginParse().loadBits(2), 
                    x: beginCell().storeUint(76, 10).endCell().beginParse()
                },
                x: 3
            }
        }
        checkSameOnStoreLoad(intBitsOutside, loadIntBitsOutside, storeIntBitsOutside);

        let intBitsParametrizedOutside: IntBitsParametrizedOutside = {
            kind: 'IntBitsParametrizedOutside', 
            x: {
                kind: 'IntBitsParametrizedInside', 
                a: {
                    kind: 'IntBitsParametrized', e: 5, f: BigInt(3), h: BigInt(7), j: 9, k: BigInt(10),
                    i: beginCell().storeUint(676, 10).endCell().beginParse().loadBits(10), 
                    tc: beginCell().storeUint(76, 10).endCell().beginParse()
                },
                x: 5
            }
        }
        checkSameOnStoreLoad(intBitsParametrizedOutside, loadIntBitsParametrizedOutside, storeIntBitsParametrizedOutside);

        let intBitsParametrizedOutsideIncorrect: IntBitsParametrizedOutside = {
            kind: 'IntBitsParametrizedOutside', 
            x: {
                kind: 'IntBitsParametrizedInside', 
                a: {
                    kind: 'IntBitsParametrized', e: 6, f: BigInt(3), h: BigInt(7), j: 9, k: BigInt(10),
                    i: beginCell().storeUint(676, 10).endCell().beginParse().loadBits(10), 
                    tc: beginCell().storeUint(76, 10).endCell().beginParse()
                },
                x: 5
            }
        }
        checkDifferOnStoreLoad(intBitsParametrizedOutsideIncorrect, loadIntBitsParametrizedOutside, storeIntBitsParametrizedOutside);
    })

    test('block tlb tests', () => {
        const state = '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';
        const cs = Cell.fromBase64(state);

        let blk = loadBlock(cs.beginParse());
        let builder = beginCell();
        storeBlock(blk)(builder);

        expect(deepEqual(cs.hash(), builder.endCell().hash())).toBeTruthy()
    })
})
