import { TLBCode, TLBConstructor, TLBField, TLBFieldType, TLBType } from "../../ast";
import { firstLower, getCurrentSlice, getStringDeclaration, getSubStructName, goodVariableName } from "../../utils";
import { CodeBuilder } from "../CodeBuilder";
import { CodeGenerator } from "../generator";
import { BinaryExpression, FunctionDeclaration, GenDeclaration, ObjectProperty, Statement, StructDeclaration, TheNode, TypeExpression, TypeParametersExpression, TypedIdentifier, tArrowFunctionExpression, tArrowFunctionType, tBinaryExpression, tComment, tDeclareVariable, tExpressionStatement, tFunctionCall, tFunctionDeclaration, tIdentifier, tIfStatement, tImportDeclaration, tMemberExpression, tNumericLiteral, tObjectExpression, tObjectProperty, tReturnStatement, tStringLiteral, tStructDeclaration, tTypeParametersExpression, tTypeWithParameters, tTypedIdentifier, tUnaryOpExpression, tUnionTypeDeclaration, tUnionTypeExpression, toCode } from "./tsgen";
import { addLoadProperty, convertToAST, getCondition, getParamVarExpr, getTypeParametersExpression, sliceLoad } from "./utils";
import { handleType } from "./handle_type";

export class TypescriptGenerator implements CodeGenerator {
    jsCodeDeclarations: GenDeclaration[] = []
    jsCodeConstructorDeclarations: GenDeclaration[] = []
    jsCodeFunctionsDeclarations: GenDeclaration[] = []
    tlbCode: TLBCode

    constructor(tlbCode: TLBCode) {
        this.tlbCode = tlbCode
    }

    addTonCoreClassUsage(name: string) {
        this.jsCodeDeclarations.push(tImportDeclaration(tIdentifier(name), tStringLiteral('ton')))
    }
    addBitLenFunction() {
        this.jsCodeDeclarations.push(tFunctionDeclaration(tIdentifier('bitLen'), tTypeParametersExpression([]), null, [tTypedIdentifier(tIdentifier('n'), tIdentifier('number'))], [
            tExpressionStatement(tIdentifier('return n.toString(2).length;'))
        ]))
    }
    addTlbType(tlbType: TLBType, tlbCode: TLBCode): void {
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
                        subStructLoadProperties.push(tObjectProperty(tIdentifier(variable.name), convertToAST(variable.deriveExpr, constructor)));
                    }
                }
            })

            constructor.variables.forEach(variable => {
                if (variable.type == '#' && !variable.isField) {
                    subStructProperties.push(tTypedIdentifier(tIdentifier(variable.name), tIdentifier('number')));
                    let parameter = constructor.parametersMap.get(variable.name)
                    if (parameter && !parameter.variable.const && !parameter.variable.negated) {
                        subStructLoadProperties.push(tObjectProperty(tIdentifier(variable.name), getParamVarExpr(parameter, constructor)))
                    }
                }
            })

            constructor.fields.forEach(field => {
                this.handleField(field, slicePrefix, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName);
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
                        let argName = param.variable.name;
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

            this.jsCodeFunctionsDeclarations.push(tComment(constructor.declaration))

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
                    loadFunctionParameters.push(tTypedIdentifier(tIdentifier('load' + element.variable.name), tArrowFunctionType([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], tIdentifier(element.variable.name))))

                    storeFunctionParameters.push(
                        tTypedIdentifier(tIdentifier('store' + element.variable.name),
                            tArrowFunctionType(
                                [tTypedIdentifier(tIdentifier(firstLower(element.variable.name)), tIdentifier(element.variable.name))],
                                tArrowFunctionType([tTypedIdentifier(tIdentifier('builder'), tIdentifier('Builder'))], tIdentifier('void')))))
                }
                if (element.variable.type == '#' && !element.variable.negated) {
                    if (element.argName) {
                        loadFunctionParameters.push(tTypedIdentifier(tIdentifier(element.argName), tIdentifier('number')))
                    } else {
                        loadFunctionParameters.push(tTypedIdentifier(tIdentifier(element.variable.name), tIdentifier('number')))
                    }
                }
            });
        }

        let loadFunction = tFunctionDeclaration(tIdentifier('load' + tlbType.name), structTypeParametersExpr, tTypeWithParameters(tIdentifier(tlbType.name), structTypeParametersExpr), loadFunctionParameters, loadStatements);

        let storeFunction = tFunctionDeclaration(tIdentifier('store' + tlbType.name), structTypeParametersExpr, tIdentifier('(builder: Builder) => void'), storeFunctionParameters, storeStatements)

        if (tlbType.constructors.length > 1) {
            let unionTypeDecl = tUnionTypeDeclaration(tTypeWithParameters(tIdentifier(tlbType.name), structTypeParametersExpr), tUnionTypeExpression(subStructsUnion))
            this.jsCodeConstructorDeclarations.push(unionTypeDecl)
        }
        subStructDeclarations.forEach(element => {
            this.jsCodeConstructorDeclarations.push(element)
        });

        this.jsCodeFunctionsDeclarations.push(loadFunction)
        this.jsCodeFunctionsDeclarations.push(storeFunction)
    }

    toCode(node: TheNode, code: CodeBuilder = new CodeBuilder()): CodeBuilder {
        return toCode(node, code);
    }

    handleField(field: TLBField, slicePrefix: Array<number>, constructor: TLBConstructor, constructorLoadStatements: Statement[], subStructStoreStatements: Statement[], subStructProperties: TypedIdentifier[], subStructLoadProperties: ObjectProperty[], variableCombinatorName: string, variableSubStructName: string) {
        let currentSlice = getCurrentSlice(slicePrefix, 'slice');
        let currentCell = getCurrentSlice(slicePrefix, 'cell');

        if (field && field.subFields.length > 0) {
            slicePrefix[slicePrefix.length - 1]++;
            slicePrefix.push(0)

            constructorLoadStatements.push(sliceLoad(slicePrefix, currentSlice))
            subStructStoreStatements.push(tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')), tFunctionCall(tIdentifier('beginCell'), []))))

            field.subFields.forEach(fieldDef => {
                this.handleField(fieldDef, slicePrefix, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName)
            });

            subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tIdentifier(getCurrentSlice(slicePrefix, 'cell'))])))

            slicePrefix.pop();
        }

        if (field?.fieldType.kind == 'TLBExoticType') {
            slicePrefix[slicePrefix.length - 1]++;
            slicePrefix.push(0);
            constructorLoadStatements.push(
                tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')),
                    tFunctionCall(tMemberExpression(
                        tIdentifier(currentSlice), tIdentifier('loadRef')
                    ), []),)))
            addLoadProperty(field.name, tIdentifier(getCurrentSlice(slicePrefix, 'cell')), undefined, constructorLoadStatements, subStructLoadProperties)
            subStructProperties.push(tTypedIdentifier(tIdentifier(field.name), tIdentifier('Cell')));
            subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier(field.name))])))
            slicePrefix.pop();
        } else if (field?.subFields.length == 0) {
            if (field == undefined) {
                throw new Error('')
            }
            let thefield: TLBFieldType = field.fieldType
            let fieldInfo = handleType(field, thefield, true, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, this.jsCodeFunctionsDeclarations, 0, this.tlbCode);
            if (fieldInfo.loadExpr) {
                addLoadProperty(field.name, fieldInfo.loadExpr, fieldInfo.typeParamExpr, constructorLoadStatements, subStructLoadProperties);
            }
            if (fieldInfo.typeParamExpr) {
                subStructProperties.push(tTypedIdentifier(tIdentifier(field.name), fieldInfo.typeParamExpr));
            }
            if (fieldInfo.storeExpr) {
                subStructStoreStatements.push(fieldInfo.storeExpr)
            }
            fieldInfo.negatedVariablesLoads.forEach(element => {
                addLoadProperty(element.name, element.expression, undefined, constructorLoadStatements, subStructLoadProperties)
            });
        }
    }
}