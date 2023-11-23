import { Declaration } from "../../src/ast/nodes";
import { Expression } from "../../src/codegen/tsgen";

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
}

export type TLBParameter = {
    variable: TLBVariable,
    paramExpr: TLBMathExpr,
    argName?: string,
}

export type TLBConstructor = {
    parameters: Array<TLBParameter>
    parametersMap: Map<string, TLBParameter>
    name: string
    implicitFields: Map<string, string>
    declaration: Declaration
    negatedVariables: Map<string, Expression>
}

export type TLBType = {
    name: string
    constructors: Array<TLBConstructor>
}

export type TLBCode = {
    types: Map<string, TLBType>
}
