
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


export class TLBVariable {
    constructor(
        readonly isConst: boolean,
        readonly negated: boolean,
        readonly type: TLBVariableType,
        readonly name: string,
        readonly isField: boolean,
        readonly deriveExpr?: TLBMathExpr,
        readonly initialExpr?: TLBMathExpr
    ) {

    }
}

export type TLBBitsType = {
    kind: 'TLBBitsType'
    bits: TLBMathExpr
}

export type TLBNamedType = {
    kind: 'TLBNamedType'
    name: string
    arguments: TLBFieldType[]
}

export type TLBMathExprType = {
    kind: 'TLBExprMathType'
    expr: TLBMathExpr
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

export type TLBNumberType = {
    kind: 'TLBNumberType';
    bits: TLBMathExpr;
    signed: boolean;
    storeBits: TLBMathExpr;
    maxBits: number | undefined;
};

export type TLBNegatedType = {
    kind: 'TLBNegatedType'
    variableName: string
}

export type TLBCellInsideType = {
    kind: 'TLBCellInsideType'
    value: TLBFieldType
}

export type TLBMultipleType = {
    kind: 'TLBMultipleType'
    value: TLBFieldType
    times: TLBMathExpr
}

export type TLBCondType = {
    kind: 'TLBCondType'
    value: TLBFieldType
    condition: TLBMathExpr
}

export type TLBExoticType = {
    kind: 'TLBExoticType'
}

export type TLBFieldType = TLBNumberType | TLBBitsType | TLBNamedType | TLBBoolType | TLBAddressType | TLBCellType | TLBMathExprType | TLBNegatedType | TLBCellInsideType | TLBMultipleType | TLBCondType | TLBExoticType;

export type TLBField = {
    name: string
    anonymous: boolean
    fieldType: TLBFieldType
    subFields: TLBField[]
}


export class TLBParameter {
    constructor(
        readonly variable: TLBVariable,
        readonly paramExpr: TLBMathExpr,
        readonly argName?: string,
    ) {

    }
}

export type TLBConstructorTag = {
    bitLen: number,
    binary: string
}

export class TLBConstructor {
    constructor(
        readonly parameters: Array<TLBParameter>,
        readonly variables: Array<TLBVariable>,
        readonly variablesMap: Map<string, TLBVariable>,
        readonly parametersMap: Map<string, TLBParameter>,
        readonly name: string,
        readonly fields: Array<TLBField>,
        readonly tag: TLBConstructorTag,
        readonly constraints: Array<TLBMathExpr>,
        readonly declaration: string,
        readonly tlbType: string
    ) {

    }
}

export class TLBType {
    constructor(
        readonly name: string,
        readonly constructors: Array<TLBConstructor>,
    ) {

    }
}

export class TLBCode {
    constructor(
        readonly types: Map<string, TLBType>
    ) { }
}
