import { TLBCode, TLBField, TLBType } from "../../ast";
import { handleField } from "./handle_field";
import { firstLower, getStringDeclaration, getSubStructName, goodVariableName } from "../../utils";
import { CodeBuilder } from "../CodeBuilder";
import { CodeGenerator } from "../generator";
import { BinaryExpression, GenDeclaration, ObjectProperty, Statement, StructDeclaration, TheNode, TypeExpression, TypeParametersExpression, TypedIdentifier, tArrowFunctionExpression, tArrowFunctionType, tBinaryExpression, tComment, tExpressionStatement, tFunctionCall, tFunctionDeclaration, tIdentifier, tIfStatement, tImportDeclaration, tMemberExpression, tNumericLiteral, tObjectExpression, tObjectProperty, tReturnStatement, tStringLiteral, tStructDeclaration, tTypeParametersExpression, tTypeWithParameters, tTypedIdentifier, tUnaryOpExpression, tUnionTypeDeclaration, tUnionTypeExpression, toCode } from "./tsgen";
import { convertToAST, getCondition, getParamVarExpr, getTypeParametersExpression } from "./utils";
import { BuiltinOneArgExpr, BuiltinZeroArgs, CombinatorExpr, CondExpr, FieldBuiltinDef, FieldExprDef, FieldNamedDef, MathExpr, NameExpr } from "../../../ast/nodes";

export class TypescriptGenerator implements CodeGenerator {
    jsCodeDeclarations: GenDeclaration[] = []

    addTonCoreClassUsage(name: string) {
        this.jsCodeDeclarations.push(tImportDeclaration(tIdentifier(name), tStringLiteral('ton')))
    }
    addBitLenFunction() {
        this.jsCodeDeclarations.push(tFunctionDeclaration(tIdentifier('bitLen'), tTypeParametersExpression([]), null, [tTypedIdentifier(tIdentifier('n'), tIdentifier('number'))], [
            tExpressionStatement(tIdentifier('return n.toString(2).length;'))
        ]))
    }
    addTlbType(tlbType: TLBType, tlbCode: TLBCode, input: string[], jsCodeConstructorDeclarations: GenDeclaration[], jsCodeFunctionsDeclarations: GenDeclaration[]): void {
        let variableCombinatorName = goodVariableName(firstLower(tlbType.name), '0')
        let subStructsUnion: TypeExpression[] = []
        let subStructDeclarations: StructDeclaration[] = []

        let loadStatements: Statement[] = []
        let storeStatements: Statement[] = []

        let structTypeParametersExpr: TypeParametersExpression = tTypeParametersExpression([]);

        tlbType.constructors.forEach(constructor => {
            let constructorLoadStatements: Statement[] = []
            let subStructName: string = getSubStructName(tlbType, constructor);

            let variableSubStructName = goodVariableName(firstLower(subStructName), '_' + constructor.name)

            let subStructProperties: TypedIdentifier[] = [tTypedIdentifier(tIdentifier('kind'), tStringLiteral(subStructName))]
            let subStructLoadProperties: ObjectProperty[] = [tObjectProperty(tIdentifier('kind'), tStringLiteral(subStructName))]
            let subStructStoreStatements: Statement[] = []

            if (constructor.tag == undefined) {
                return;
            }

            structTypeParametersExpr = getTypeParametersExpression(constructor.parameters);

            let slicePrefix: number[] = [0];

            constructor.variables.forEach((variable) => {
                if (variable.negated) {
                    if (variable.deriveExpr) {
                        subStructLoadProperties.push(tObjectProperty(tIdentifier(goodVariableName(variable.name)), convertToAST(variable.deriveExpr, constructor)));
                    }
                }
            })

            constructor.variables.forEach(variable => {
                if (variable.type == '#' && !variable.isField) {
                    subStructProperties.push(tTypedIdentifier(tIdentifier(goodVariableName(variable.name)), tIdentifier('number')));
                    let parameter = constructor.parametersMap.get(variable.name)
                    if (parameter && !parameter.variable.const && !parameter.variable.negated) {
                      subStructLoadProperties.push(tObjectProperty(tIdentifier(goodVariableName(variable.name)), getParamVarExpr(parameter, constructor)))
                    }
                }
            })

            constructor.fields.forEach(field => {
                handleField(field, slicePrefix, tlbCode, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations); 
            })

            subStructsUnion.push(tTypeWithParameters(tIdentifier(subStructName), structTypeParametersExpr));

            let structX = tStructDeclaration(tIdentifier(subStructName), subStructProperties, structTypeParametersExpr);

            constructor.constraints.forEach(constraint => {
                let loadConstraintAST = convertToAST(constraint, constructor, true);
                let storeConstraintAST = convertToAST(constraint, constructor, true, tIdentifier(variableCombinatorName));
                let exceptionCommentLastPart = ` is not satisfied while loading "${getSubStructName(tlbType, constructor)}" for type "${tlbType.name}"`
                constructorLoadStatements.push(tIfStatement(tUnaryOpExpression('!', loadConstraintAST), [tExpressionStatement(tIdentifier("throw new Error('Condition " + toCode(loadConstraintAST).code + exceptionCommentLastPart + "')"))]));
                subStructStoreStatements.push(tIfStatement(tUnaryOpExpression('!', storeConstraintAST), [tExpressionStatement(tIdentifier("throw new Error('Condition " + toCode(storeConstraintAST).code + exceptionCommentLastPart + "')"))]))
            });

            constructorLoadStatements.push(tReturnStatement(tObjectExpression(subStructLoadProperties)));
            if (constructor.tag.bitLen != 0 || tlbType.constructors.length > 1) {
                let conditions: Array<BinaryExpression> = []
                if (constructor.tag.bitLen != 0) {
                    conditions.push(tBinaryExpression(tMemberExpression(tIdentifier('slice'), tIdentifier('remainingBits')), '>=', tNumericLiteral(constructor.tag.bitLen)))
                    conditions.push(tBinaryExpression(tFunctionCall(tMemberExpression(tIdentifier('slice'), tIdentifier('preloadUint')), [tNumericLiteral(constructor.tag.bitLen)]), '==', tIdentifier(constructor.tag.binary)))
                    let loadBitsStatement: Statement[] = [tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier('slice'), tIdentifier('loadUint')), [tNumericLiteral(constructor.tag.bitLen)]))]
                    constructorLoadStatements = loadBitsStatement.concat(constructorLoadStatements);
                }
                constructor.parameters.forEach(param => {
                    if (param.variable.const && !param.variable.negated) {
                        let argName = goodVariableName(param.variable.name);
                        if (param.argName) {
                            argName = param.argName
                        }
                        conditions.push(tBinaryExpression(tIdentifier(argName), '==', getParamVarExpr(param, constructor)))
                    }
                });
                loadStatements.push(tIfStatement(getCondition(conditions), constructorLoadStatements))
            } else {
                loadStatements = loadStatements.concat(constructorLoadStatements);
            }

            if (constructor.tag.bitLen != 0) {
                let preStoreStatement: Statement[] = [tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier('builder'), tIdentifier('storeUint')), [tIdentifier(constructor.tag.binary), tNumericLiteral(constructor.tag.bitLen)]))];
                subStructStoreStatements = preStoreStatement.concat(subStructStoreStatements)
            }
            let storeStatement: Statement = tReturnStatement(tArrowFunctionExpression([tTypedIdentifier(tIdentifier('builder'), tIdentifier('Builder'))], subStructStoreStatements));
            if (tlbType.constructors.length > 1) {
                storeStatement = tIfStatement(tBinaryExpression(tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier('kind')), '==', tStringLiteral(subStructName)), [storeStatement])
            }
            storeStatements.push(storeStatement);

            subStructDeclarations.push(structX)

            jsCodeFunctionsDeclarations.push(tComment(getStringDeclaration(constructor.declaration, input)))

        });


        // loadTheType: (slice: Slice) => TheType

        let exceptionTypesComment = tlbType.constructors.map(constructor => { return `"${getSubStructName(tlbType, constructor)}"` }).join(', ')
        let exceptionComment = tExpressionStatement(tIdentifier("throw new Error('" + `Expected one of ${exceptionTypesComment} in loading "${tlbType.name}", but data does not satisfy any constructor` + "')"))
        if (tlbType.constructors.length > 1 || tlbType.constructors.at(0)?.tag.bitLen != 0) {
            let neededTypesComment = '';
            tlbType.constructors.forEach(constructor => {
                neededTypesComment += getSubStructName(tlbType, constructor)
            })
            loadStatements.push(exceptionComment)
        }
        if (tlbType.constructors.length > 1) {
            storeStatements.push(exceptionComment)
        }

        let loadFunctionParameters = [tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))]
        let storeFunctionParameters = [tTypedIdentifier(tIdentifier(variableCombinatorName), tTypeWithParameters(tIdentifier(tlbType.name), structTypeParametersExpr))]

        let anyConstructor = tlbType.constructors[0];
        if (anyConstructor) {
            anyConstructor.parameters.forEach(element => {
                if (element.variable.type == 'Type') {
                    loadFunctionParameters.push(tTypedIdentifier(tIdentifier('load' + element.variable.name), tArrowFunctionType([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], tIdentifier(goodVariableName(element.variable.name)))))

                    storeFunctionParameters.push(
                        tTypedIdentifier(tIdentifier('store' + element.variable.name),
                            tArrowFunctionType(
                                [tTypedIdentifier(tIdentifier(goodVariableName(firstLower(element.variable.name), '0')), tIdentifier(goodVariableName(element.variable.name)))],
                                tArrowFunctionType([tTypedIdentifier(tIdentifier('builder'), tIdentifier('Builder'))], tIdentifier('void')))))
                }
                if (element.variable.type == '#' && !element.variable.negated) {
                    if (element.argName) {
                        loadFunctionParameters.push(tTypedIdentifier(tIdentifier(element.argName), tIdentifier('number')))
                    } else {
                        loadFunctionParameters.push(tTypedIdentifier(tIdentifier(goodVariableName(element.variable.name)), tIdentifier('number')))
                    }
                }
            });
        }

        let loadFunction = tFunctionDeclaration(tIdentifier('load' + tlbType.name), structTypeParametersExpr, tTypeWithParameters(tIdentifier(tlbType.name), structTypeParametersExpr), loadFunctionParameters, loadStatements);

        let storeFunction = tFunctionDeclaration(tIdentifier('store' + tlbType.name), structTypeParametersExpr, tIdentifier('(builder: Builder) => void'), storeFunctionParameters, storeStatements)

        if (tlbType.constructors.length > 1) {
            let unionTypeDecl = tUnionTypeDeclaration(tTypeWithParameters(tIdentifier(tlbType.name), structTypeParametersExpr), tUnionTypeExpression(subStructsUnion))
            jsCodeConstructorDeclarations.push(unionTypeDecl)
        }
        subStructDeclarations.forEach(element => {
            jsCodeConstructorDeclarations.push(element)
        });

        jsCodeFunctionsDeclarations.push(loadFunction)
        jsCodeFunctionsDeclarations.push(storeFunction)
    }

    toCode(node: TheNode, code: CodeBuilder = new CodeBuilder()): CodeBuilder {
        return toCode(node, code);
    }
}