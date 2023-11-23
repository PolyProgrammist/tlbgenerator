import { SimpleExpr, NameExpr, NumberExpr, MathExpr, FieldBuiltinDef, NegateExpr, Declaration, CompareExpr, FieldCurlyExprDef, FieldNamedDef } from "../ast/nodes";
import { TLBMathExpr, TLBVarExpr, TLBNumberExpr, TLBBinaryOp, TLBCode, TLBType, TLBConstructor, TLBParameter, TLBVariable } from "../codegen/ast"
import { Identifier, Expression, BinaryExpression } from "./tsgen";
import { tIdentifier, tArrowFunctionExpression, tArrowFunctionType, tBinaryExpression, tBinaryNumericLiteral, tDeclareVariable, tExpressionStatement, tFunctionCall, tFunctionDeclaration, tIfStatement, tImportDeclaration, tMemberExpression, tNumericLiteral, tObjectExpression, tObjectProperty, tReturnStatement, tStringLiteral, tStructDeclaration, tTypeParametersExpression, tTypeWithParameters, tTypedIdentifier, tUnionTypeDeclaration, toCode, toCodeArray } from './tsgen'
import util from 'util'

export function convertToMathExpr(mathExpr: SimpleExpr | NameExpr | NumberExpr | CompareExpr): TLBMathExpr {
    if (mathExpr instanceof NameExpr) {
        let variables = new Set<string>();
        variables.add(mathExpr.name);
        return new TLBVarExpr(mathExpr.name, variables, false);
    }
    if (mathExpr instanceof NumberExpr) {
        return new TLBNumberExpr(mathExpr.num, new Set<string>(), false);
    }
    if (mathExpr instanceof MathExpr) {
        let left = convertToMathExpr(mathExpr.left)
        let right = convertToMathExpr(mathExpr.right)
        return new TLBBinaryOp(left, right, mathExpr.op, new Set(...left.variables, ...right.variables), left.hasNeg || right.hasNeg)
    }
    if (mathExpr instanceof CompareExpr) {
        let left = convertToMathExpr(mathExpr.left);
        let right = convertToMathExpr(mathExpr.right);
        return new TLBBinaryOp(left, right, mathExpr.op, new Set(...left.variables, ...right.variables), left.hasNeg || right.hasNeg)
    }
    if (mathExpr instanceof NegateExpr) {
        if (mathExpr.expr instanceof MathExpr || mathExpr.expr instanceof NameExpr || mathExpr.expr instanceof NumberExpr) {
            let expression = convertToMathExpr(mathExpr.expr);
            if (expression instanceof TLBBinaryOp) {
                return new TLBBinaryOp(expression.left, expression.right, expression.operation, expression.variables, true);
            }
            if (expression instanceof TLBVarExpr) {
                return new TLBVarExpr(expression.x, expression.variables, true);
            }
            if (expression instanceof TLBNumberExpr) {
                return new TLBNumberExpr(expression.n, expression.variables, true);
            }
        }
    }
    return { n: 0, variables: new Set<string>(), hasNeg: false };
}

export function convertToAST(mathExpr: TLBMathExpr, objectId?: Identifier): Expression {
    if (mathExpr instanceof TLBVarExpr) {
        if (objectId != undefined) {
            return tMemberExpression(objectId, tIdentifier(mathExpr.x));
        }
        return tIdentifier(mathExpr.x);
    }
    if (mathExpr instanceof TLBNumberExpr) {
        return tNumericLiteral(mathExpr.n)
    }
    if (mathExpr instanceof TLBBinaryOp) {
        return tBinaryExpression(convertToAST(mathExpr.left, objectId), mathExpr.operation, convertToAST(mathExpr.right, objectId));
    }
    return tIdentifier('');
}

export function getNegatedVariable(mathExpr: TLBMathExpr): string | undefined {
    if (mathExpr.hasNeg) {
        if (mathExpr instanceof TLBBinaryOp) {
            if (mathExpr.left.hasNeg) {
                return getNegatedVariable(mathExpr.left);
            }
            if (mathExpr.right.hasNeg) {
                return getNegatedVariable(mathExpr.right);
            }
        }
        if (mathExpr instanceof TLBVarExpr) {
            return mathExpr.x;
        }
    }
    return undefined
}

export function reorganizeExpression(mathExpr: TLBMathExpr, variable: string): TLBMathExpr {
    if (mathExpr instanceof TLBBinaryOp && mathExpr.operation == '=') {
        if (mathExpr.left.variables.has(variable)) {
            mathExpr = new TLBBinaryOp(mathExpr.right, mathExpr.left, '=', mathExpr.variables, mathExpr.hasNeg);
        }
        if (mathExpr.right instanceof TLBVarExpr) {
            return new TLBBinaryOp(mathExpr.right, mathExpr.left, '=', mathExpr.variables, mathExpr.hasNeg);
        }
        let rightSide = mathExpr.right
        if (rightSide instanceof TLBBinaryOp) {
            let op = '';
            if (rightSide.operation == '*') {
                op = '/';
            } else if (rightSide.operation == '+') {
                op = '-'
            } else {
                throw new Error('invalid operation')
            }
            let withVariable = undefined;
            let other = undefined;
            if (rightSide.left.variables.has(variable)) {
                withVariable = rightSide.left;
                other = rightSide.right
            } else {
                other = rightSide.left
                withVariable = rightSide.right
            }
            let leftSide = new TLBBinaryOp(
                mathExpr.left,
                other,
                op,
                new Set(...mathExpr.left.variables, ...other.variables),
                mathExpr.right.hasNeg || other.hasNeg
            )
            mathExpr = new TLBBinaryOp(
                leftSide,
                withVariable,
                '=',
                new Set(...leftSide.variables, withVariable.variables),
                leftSide.hasNeg || rightSide.hasNeg
            )
            return reorganizeExpression(mathExpr, variable);
        }
    }
    return { n: 0, variables: new Set<string>(), hasNeg: false }
}

export function getXname(myMathExpr: TLBMathExpr): string {
    if (myMathExpr instanceof TLBVarExpr) {
        return myMathExpr.x;
    }
    if (myMathExpr instanceof TLBBinaryOp) {
        if (myMathExpr.left.variables.size) {
            return getXname(myMathExpr.left);
        } else {
            return getXname(myMathExpr.right);
        }
    }
    return '';
}

export function deriveMathExpression(mathExpr: MathExpr | NameExpr | NumberExpr | CompareExpr) {
    let myMathExpr = convertToMathExpr(mathExpr);
    // let derived = convertToAST(myMathExpr)
    return {
        name: getXname(myMathExpr),
        derived: myMathExpr,
    }
}


export function firstLower(structName: String) {
    return structName.charAt(0).toLowerCase() + structName.slice(1)
}

export function splitForTypeValue(name: string, typeName: string) {
    if (!name.startsWith(typeName)) {
        return undefined;
    }
    let num = parseInt(name.slice(typeName.length))
    if (num == undefined) {
        return undefined
    }
    if (name != typeName + num.toString()) {
        return undefined
    }
    return num
}

export function getCurrentSlice(slicePrefix: number[], name: string): string {
    let result = name;
    slicePrefix = slicePrefix.slice(0, slicePrefix.length - 1);
    slicePrefix.forEach(element => {
        result += element.toString();
    });
    if (result == 'cell') {
        return 'builder';
    }
    return result;
}

export function bitLen(n: number) {
    return n.toString(2).length;
}

// export type TLBVariable = {
//   name: string,

// }

// export type TLBField = {
//   name: string
//   expression: 
// }

export function getTypeParametersExpression(parameters: Array<TLBParameter>) {
    let structTypeParameters: Array<Identifier> = []
    parameters.forEach(element => {
        if (element.variable.type == 'Type') {
            structTypeParameters.push(tIdentifier(element.variable.name))
        }
    });
    let structTypeParametersExpr = tTypeParametersExpression(structTypeParameters);
    return structTypeParametersExpr;
}

export function getCondition(conditions: Array<BinaryExpression>): Expression {
    let cnd = conditions[0];
    if (cnd) {
        if (conditions.length > 1) {
            return tBinaryExpression(cnd, '&&', getCondition(conditions.slice(1)));
        } else {
            return cnd
        }
    } else {
        return tIdentifier('true');
    }
}

export function checkConstructors(tlbType: TLBType) {
    // TODO
}

export function fillParameterNames(tlbType: TLBType) {
    let parameterNames: string[] = []
    let argNames: (string | undefined)[] = []
    tlbType.constructors[0]?.parameters.forEach(element => {
        parameterNames.push(element.variable.name);
        argNames.push(undefined);
    });
    tlbType.constructors.forEach(constructor => {
        for (let i = 0; i < constructor.parameters.length; i++) {
            if (parameterNames[i] == '') {
                let parameterName = constructor.parameters[i]?.variable.name;
                if (parameterName != undefined) {
                    parameterNames[i] = parameterName;
                }
                let argName = constructor.parameters[i]?.argName
                if (argName) {
                    argNames[i] = argName
                }
            }
        }
    });
    for (let i = 0; i < parameterNames.length; i++) {
        if (parameterNames[i] == '') {
            parameterNames[i] = 'arg' + i;
        }
    }
    tlbType.constructors.forEach(constructor => {
        for (let i = 0; i < constructor.parameters.length; i++) {
            let parameterName = parameterNames[i]
            if (parameterName != undefined && constructor.parameters[i]?.variable.name == '') {
                constructor.parameters[i]!.variable.name = parameterName;
            }
            let argName = argNames[i];
            let parameter = constructor.parameters[i]
            if (argName != undefined && parameter != undefined) {
                parameter.argName = argName;
            }
        }
    })
}

export function fillNegationExpressions(constructor: TLBConstructor) {
    constructor.declaration.fields.forEach(field => {
        if (field instanceof FieldCurlyExprDef && field.expr instanceof CompareExpr && field.expr.op == '=') {
            let myMathExpr = convertToMathExpr(field.expr);
            let negatedVariable = getNegatedVariable(myMathExpr);
            if (negatedVariable) {
                myMathExpr = reorganizeExpression(myMathExpr, negatedVariable)
                if (myMathExpr instanceof TLBBinaryOp) {
                    myMathExpr = myMathExpr.right
                }
                let variable = constructor.variablesMap.get(negatedVariable)
                if (variable) {
                    variable.negated = true;
                    variable.deriveExpr = myMathExpr;
                } else {
                    throw new Error(`Variable ${negatedVariable} not defined`)
                }
            }
        }
    })
}

export function reorganizeWithArg(myMathExpr: TLBMathExpr, argName: string, varName: string): TLBMathExpr {
    let tmpset = new Set<string>();
    tmpset.add(argName);
    let reorganized = reorganizeExpression(new TLBBinaryOp(new TLBVarExpr(argName, tmpset, false), myMathExpr, '=', new Set<string>(), false), varName)
    if (reorganized instanceof TLBBinaryOp) {
        return reorganized.right;
    }
    throw new Error('')
}

export function fillConstructors(declarations: Declaration[], tlbCode: TLBCode) {
    declarations.forEach(declaration => {
        let tlbType: TLBType | undefined = tlbCode.types.get(declaration.combinator.name);
        if (tlbType == undefined) {
            tlbType = { name: declaration.combinator.name, constructors: [] }
        }
        tlbType.constructors.push({ declaration: declaration, parameters: [], parametersMap: new Map<string, TLBParameter>(), name: declaration.constructorDef.name, variables: new Array<TLBVariable>(), variablesMap: new Map<string, TLBVariable>() });
        tlbCode.types.set(tlbType.name, tlbType);
    })

    tlbCode.types.forEach((tlbType: TLBType, combinatorName: string) => {
        tlbType.constructors.forEach(constructor => {
            constructor.declaration?.fields.forEach(field => {
                if (field instanceof FieldBuiltinDef) {
                    constructor.variables.push({ name: field.name, const: false, negated: false, type: field.type })
                }
                if (field instanceof FieldNamedDef) {
                    constructor.variables.push({ name: field.name, const: false, negated: false, type: '#' })
                }
            })
            constructor.variables.forEach(variable => {
                constructor.variablesMap.set(variable.name, variable);
            })
            let argumentIndex = -1;
            constructor.declaration.combinator.args.forEach(element => {
                argumentIndex++;
                let parameter: TLBParameter | undefined = undefined;
                if (element instanceof NameExpr) {
                    let variable = constructor.variablesMap.get(element.name)
                    if (variable) {
                        if (variable.type == '#') {
                            variable.deriveExpr = new TLBVarExpr(element.name);
                        }
                        parameter = { variable: variable, paramExpr: new TLBVarExpr(element.name) };
                    }
                    else {
                        throw new Error('Field not known before using (should be tagged as implicit): ' + element)
                    }
                } else if (element instanceof MathExpr) {
                    let derivedExpr = deriveMathExpression(element);
                    let variable = constructor.variablesMap.get(derivedExpr.name)
                    if (variable) {
                        parameter = { variable: variable, paramExpr: derivedExpr.derived };
                        parameter.argName = 'arg' + argumentIndex;
                        parameter.variable.deriveExpr = reorganizeWithArg(convertToMathExpr(element), parameter.argName, parameter.variable.name);
                    } else {
                        throw new Error('')
                    }
                } else if (element instanceof NegateExpr && (element.expr instanceof MathExpr || element.expr instanceof NumberExpr || element.expr instanceof NameExpr)) {
                    let derivedExpr = deriveMathExpression(element.expr);
                    let toBeConst = false;
                    if (element.expr instanceof NumberExpr) {
                        toBeConst = true;
                    }
                    parameter = { variable: { negated: true, const: toBeConst, type: '#', name: derivedExpr.name, deriveExpr: derivedExpr.derived }, paramExpr: derivedExpr.derived };
                } else if (element instanceof NumberExpr) {
                    parameter = { variable: { negated: false, const: true, type: '#', name: '', deriveExpr: new TLBNumberExpr(element.num) }, paramExpr: new TLBNumberExpr(element.num) }
                } else {
                    throw new Error('Cannot identify combinator arg: ' + element)
                }
                constructor.parameters.push(parameter);
                constructor.parametersMap.set(parameter.variable.name, parameter);
            });
            fillNegationExpressions(constructor);
        });
        checkConstructors(tlbType);
        fillParameterNames(tlbType);
    });
}