import { Declaration } from "../../src/ast/nodes";

export class TLBBinaryOp {
    constructor(
        readonly left: TLBMathExpr,
        readonly right: TLBMathExpr,
        readonly operation: string,
        readonly variables: Set<string>,
        readonly hasNeg: boolean
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

export type TLBMathExpr = TLBBinaryOp | TLBNumberExpr | TLBVarExpr;

export type TLBVariableType = 'Type' | '#';

export type TLBVariable = {
    const: boolean
    negated: boolean
    type: TLBVariableType
    name: string
    deriveExpr?: TLBMathExpr

    calculated: boolean
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
