import { TLBVariableType, TLBMathExpr } from "../ast";



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

