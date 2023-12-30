import { TLBField, TLBConstructorTag, TLBMathExpr } from "../ast";
import { TLBVariableType } from "../ast";

export type TLBVariableBuild = {
    isConst: boolean;
    negated: boolean;
    type: TLBVariableType;
    name: string | undefined;
    deriveExpr?: TLBMathExpr;
    initialExpr?: TLBMathExpr;
    isField: boolean;

    calculated: boolean;
};
export type TLBParameterBuild = {
    variable: TLBVariableBuild;
    paramExpr: TLBMathExpr;
    argName?: string;
};
export type TLBConstructorBuild = {
    parameters: Array<TLBParameterBuild>;
    variables: Array<TLBVariableBuild>;
    variablesMap: Map<string, TLBVariableBuild>;
    parametersMap: Map<string, TLBParameterBuild>;
    name: string;
    fields: Array<TLBField>;
    tag: TLBConstructorTag;
    constraints: Array<TLBMathExpr>;
    declaration: string;
    tlbType: string;
};
export type TLBCodeBuild = {
    types: Map<string, TLBTypeBuild>;
};
export type TLBTypeBuild = {
    name: string;
    constructors: Array<TLBConstructorBuild>;
};

