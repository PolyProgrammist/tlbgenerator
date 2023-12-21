import { Declaration } from "../../src/ast/nodes";

export class TLBBinaryOp {
    constructor(
        readonly left: TLBMathExpr,
        readonly right: TLBMathExpr,
        readonly operation: string,
        readonly variables: Set<string> = new Set([...left.variables, ...right.variables]),
        readonly hasNeg: boolean = left.hasNeg || right.hasNeg
    ) {
    }
}

export class TLBNumberExpr {
    constructor(
        readonly n: number,
        readonly variables: Set<string> = new Set<string>(),
        readonly hasNeg: boolean = false
    ) {

    }
}

export class TLBUnaryOp {
    constructor(
        readonly value: TLBMathExpr,
        readonly operation: string, 
        readonly variables: Set<string> = value.variables,
        readonly hasNeg: boolean = value.hasNeg
    ) {
    }
}

export class TLBVarExpr {
    constructor(
        readonly x: string,
        readonly variables: Set<string> = new Set<string>(),
        readonly hasNeg: boolean = false
    ) {
        if (variables.size == 0) {
            variables.add(x);
        }
    }
}

export type TLBMathExpr = TLBBinaryOp | TLBNumberExpr | TLBVarExpr | TLBUnaryOp;

export type TLBVariableType = 'Type' | '#';

export type TLBVariable = {
    const: boolean
    negated: boolean
    type: TLBVariableType
    name: string
    deriveExpr?: TLBMathExpr
    initialExpr?: TLBMathExpr

    calculated: boolean
}

export type TLBNumberType = {
    kind: 'TLBNumberType'
    bits: TLBMathExpr
    signed: boolean
    storeBits: TLBMathExpr
    maxBits: number | undefined
}

export type TLBBitsType = {
    kind: 'TLBBitsType'
    bits: TLBMathExpr
}

export type TLBNamedType = {
    kind: 'TLBNamedType'
    name: string
    arguments: TLBVariable[]
}

export type TLBBoolType = {
    kind: 'TLBBoolType'
}

export type TLBAddressType = {
    kind: 'TLBAddressType'
}

export type TLBCellType = {
    kind: 'TLBCellType'
}

export type TLBFieldType = TLBNumberType | TLBBitsType | TLBNamedType | TLBBoolType | TLBAddressType | TLBCellType;

export type TLBField = {
    name: string
    anonymous: boolean
    fieldType: TLBFieldType
}

export type TLBParameter = {
    variable: TLBVariable,
    paramExpr: TLBMathExpr,
    argName?: string,
}


export type TLBConstructorTag = {
    bitLen: number,
    binary: string
}

export type TLBConstructor = {
    parameters: Array<TLBParameter>
    variables: Array<TLBVariable>
    variablesMap: Map<string, TLBVariable>
    parametersMap: Map<string, TLBParameter>
    name: string
    fields: Array<TLBField>
    declaration: Declaration
    tag: TLBConstructorTag
    constraints: Array<TLBMathExpr>
}

export type TLBType = {
    name: string
    constructors: Array<TLBConstructor>
}

export type TLBCode = {
    types: Map<string, TLBType>
}
