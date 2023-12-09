import fs from 'fs'
import path from 'path'
import util from 'util'

import { parse } from '../src'
import { ast } from '../src'
import { generate } from '../src/codegen/main'
import { Program } from '../src/ast/nodes'
import { BitString, Slice, Builder } from 'ton'

import { TwoConstructors, Simple, loadTwoConstructors, loadSimple, storeTwoConstructors, storeSimple, TypedParam, loadTypedParam, storeTypedParam, TypedField, loadTypedField, storeTypedField, ExprArg, BitLenArg, loadBitLenArg, storeBitLenArg, BitLenArgUser, loadBitLenArgUser, storeBitLenArgUser, ExprArgUser, loadExprArgUser, storeExprArgUser, ComplexTypedField, loadComplexTypedField, storeComplexTypedField, CellTypedField, storeCellTypedField, loadCellTypedField, CellsSimple, loadCellsSimple, storeCellsSimple, IntBitsOutside, loadIntBitsOutside, storeIntBitsOutside, IntBitsParametrizedOutside, loadIntBitsParametrizedOutside, storeIntBitsParametrizedOutside, LessThan, loadLessThan, storeLessThan, Unary, loadUnary, storeUnary, ParamConst, loadParamConst, storeParamConst, ParamDifNames, loadParamDifNames, storeParamDifNames, NegationFromImplicit, loadNegationFromImplicit, storeNegationFromImplicit, loadManyComb, storeManyComb, ManyComb, ParamDifNamesUser, loadParamDifNamesUser, storeParamDifNamesUser, UnaryUserCheckOrder, loadUnaryUserCheckOrder, storeUnaryUserCheckOrder, CombArgCellRef, loadCombArgCellRef, storeCombArgCellRef, CombArgCellRefUser, loadCombArgCellRefUser, storeCombArgCellRefUser, MathExprAsCombArg, loadMathExprAsCombArg, storeMathExprAsCombArg, SharpConstructor, loadSharpConstructor, storeSharpConstructor, EmptyTag, loadEmptyTag, storeEmptyTag, SharpTag, loadSharpTag, storeSharpTag, DollarTag, loadDollarTag, storeDollarTag, TupleCheck, loadTupleCheck, storeTupleCheck, HashmapE, loadHashmapE, storeHashmapE, HashmapEUser, loadHashmapEUser, storeHashmapEUser, ConditionalField, loadConditionalField, storeConditionalField, BitSelection, loadBitSelection, storeBitSelection, ImplicitCondition, loadImplicitCondition, storeImplicitCondition, MultipleEmptyConstructor, loadMultipleEmptyConstructor, storeMultipleEmptyConstructor, True, loadTrue, storeTrue, ParamNamedArgInSecondConstr, loadParamNamedArgInSecondConstr, storeParamNamedArgInSecondConstr } from '../generated_test'
import { beginCell } from 'ton'

const fixturesDir = path.resolve(__dirname, 'fixtures')

function deepEqual(object1: any, object2: any) {
    if (object1 instanceof BitString && object2 instanceof BitString) {
        return object1.equals(object2);
    }
    if (object1 instanceof Slice && object2 instanceof Slice) {
        return object1.toString() == object2.toString();
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
        let bitlenArgUser: BitLenArgUser = {'kind': 'BitLenArgUser', t: {'kind': 'BitLenArg', x: 4, value: 10}}
        checkSameOnStoreLoad(bitlenArgUser, loadBitLenArgUser, storeBitLenArgUser);
        let bitlenArgUserIncorrect: BitLenArgUser = {'kind': 'BitLenArgUser', t: {'kind': 'BitLenArg', x: 3, value: 10}}
        checkThrowOnStoreLoad(bitlenArgUserIncorrect, loadBitLenArgUser, storeBitLenArgUser);
        let exprArgUser: ExprArgUser = {'kind': 'ExprArgUser', t: {'kind': 'ExprArg', x: 4, value: 10}}
        checkSameOnStoreLoad(exprArgUser, loadExprArgUser, storeExprArgUser);
        let exprArgUserIncorrect: ExprArgUser = {'kind': 'ExprArgUser', t: {'kind': 'ExprArg', x: 5, value: 10}}
        checkDifferOnStoreLoad(exprArgUserIncorrect, loadExprArgUser, storeExprArgUser);
        let complexTypedField: ComplexTypedField = {'kind': 'ComplexTypedField', a:{'kind': 'ExprArgUser', t: {'kind': 'ExprArg', x: 4, value: 10}}}
        checkSameOnStoreLoad(complexTypedField, loadComplexTypedField, storeComplexTypedField);
        let cellTypedField: CellTypedField = {'kind': 'CellTypedField', a:{'kind': 'ExprArgUser', t: {'kind': 'ExprArg', x: 4, value: 10}}}
        checkSameOnStoreLoad(cellTypedField, loadCellTypedField, storeCellTypedField);
        let lessThan: LessThan = {kind: 'LessThan', x: 3, y: 7} 
        checkSameOnStoreLoad(lessThan, loadLessThan, storeLessThan);
        let lessThanIncorrectX: LessThan = {kind: 'LessThan', x: 4, y: 7} 
        checkThrowOnStoreLoad(lessThanIncorrectX, loadLessThan, storeLessThan);
        let lessThanIncorrectY: LessThan = {kind: 'LessThan', x: 3, y: 8} 
        checkThrowOnStoreLoad(lessThanIncorrectY, loadLessThan, storeLessThan);
        let paramNamedArgInSecondConstr: ParamNamedArgInSecondConstr = {kind: 'ParamNamedArgInSecondConstr_a', n: 3}
        checkSameOnStoreLoad(paramNamedArgInSecondConstr, (slice: Slice) => { return loadParamNamedArgInSecondConstr(slice, 3) }, storeParamNamedArgInSecondConstr);
    })

    test('Combinators', () => {
        expect.hasAssertions()
        let manyComb: ManyComb = {kind: 'ManyComb', y: {kind: 'OneComb', t: 5, x: {kind: 'OneComb', t: 6, x: {kind: 'OneComb', t: 7, x: 3}}}};
        checkSameOnStoreLoad(manyComb, loadManyComb, storeManyComb);
        let manyCombIncorrect: ManyComb = {kind: 'ManyComb', y: {kind: 'OneComb', t: 5, x: {kind: 'OneComb', t: 8, x: {kind: 'OneComb', t: 7, x: 8}}}};
        checkThrowOnStoreLoad(manyCombIncorrect, loadManyComb, storeManyComb);
        let combArgCellRefUser: CombArgCellRefUser = {kind: 'CombArgCellRefUser', x: {kind: 'CombArgCellRef', body: {'kind': 'Either_right', value: 3}, info: 4, other: {kind: 'Either_right', value: {kind: 'OneComb', t: 5, x: 5}}, init: {kind: 'Maybe_just', value: {kind: 'Either_right', value: 4}}}}
        checkSameOnStoreLoad(combArgCellRefUser, loadCombArgCellRefUser, storeCombArgCellRefUser);
        let mathExprAsCombArg: MathExprAsCombArg = {kind: 'MathExprAsCombArg', n: 8, ref: {kind: 'BitLenArg', x: 10, value: 1000}}
        checkSameOnStoreLoad(mathExprAsCombArg, (slice: Slice) => {return loadMathExprAsCombArg(slice, mathExprAsCombArg.n + 2)}, storeMathExprAsCombArg);
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
    })

    test('Exceptions', () => {
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
                    'kind': 'IntBits', arg: 3, d: 5, 
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
                    kind: 'IntBitsParametrized', e: 5, f: 3, h: 7, j: 9, k: 10,
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
                    kind: 'IntBitsParametrized', e: 6, f: 3, h: 7, j: 9, k: 10,
                    i: beginCell().storeUint(676, 10).endCell().beginParse().loadBits(10), 
                    tc: beginCell().storeUint(76, 10).endCell().beginParse()
                },
                x: 5
            }
        }
        checkDifferOnStoreLoad(intBitsParametrizedOutsideIncorrect, loadIntBitsParametrizedOutside, storeIntBitsParametrizedOutside);
    })
})
