import { TLBCode, TLBConstructor, TLBField, TLBFieldType, TLBType } from "../../ast";
import { TLBTypeBuild } from "../../astbuilder/utils";
import { TLBCodeBuild } from "../../astbuilder/utils";
import { TLBConstructorBuild } from "../../astbuilder/utils";
import { firstLower, getCurrentSlice, getStringDeclaration, getSubStructName, goodVariableName } from "../../utils";
import { CodeBuilder } from "../CodeBuilder";
import { CodeGenerator } from "../generator";
import { BinaryExpression, Expression, FunctionDeclaration, GenDeclaration, ObjectProperty, Statement, StructDeclaration, TheNode, TypeExpression, TypeParametersExpression, TypedIdentifier, tArrowFunctionExpression, tArrowFunctionType, tBinaryExpression, tComment, tDeclareVariable, tExpressionStatement, tFunctionCall, tFunctionDeclaration, tIdentifier, tIfStatement, tImportDeclaration, tMemberExpression, tMultiStatement, tNumericLiteral, tObjectExpression, tObjectProperty, tReturnStatement, tStringLiteral, tStructDeclaration, tTernaryExpression, tTypeParametersExpression, tTypeWithParameters, tTypedIdentifier, tUnaryOpExpression, tUnionTypeDeclaration, tUnionTypeExpression, toCode } from "./tsgen";
import { addLoadProperty, convertToAST, getCondition, getNegationDerivationFunctionBody, getParamVarExpr, getTypeParametersExpression, sliceLoad } from "./utils";
import { isBigInt } from './utils';
import { ExprForParam } from './utils';
import { FieldInfoType } from './utils';


type ConstructorContext = {
    constructor: TLBConstructor
    constructorLoadStatements: Statement[]
    subStructStoreStatements: Statement[]
    subStructProperties: TypedIdentifier[]
    subStructLoadProperties: ObjectProperty[]
    variableCombinatorName: string
    variableSubStructName: string
}

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
    addTlbType(tlbType: TLBType): void {
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
                    if (parameter && !parameter.variable.isConst && !parameter.variable.negated) {
                        subStructLoadProperties.push(tObjectProperty(tIdentifier(variable.name), getParamVarExpr(parameter, constructor)))
                    }
                }
            })

            let constructorContext: ConstructorContext = {
                constructor: constructor,
                variableSubStructName: variableSubStructName,
                variableCombinatorName: variableCombinatorName,
                constructorLoadStatements: constructorLoadStatements,
                subStructLoadProperties: subStructLoadProperties,
                subStructProperties: subStructProperties,
                subStructStoreStatements: subStructStoreStatements
            }

            constructor.fields.forEach(field => {
                this.handleField(field, slicePrefix, constructorContext);
            })

            subStructsUnion.push(tTypeWithParameters(tIdentifier(subStructName), structTypeParametersExpr));

            let structX = tStructDeclaration(tIdentifier(subStructName), subStructProperties, structTypeParametersExpr);

            constructor.constraints.forEach(constraint => {
                let loadConstraintAST = convertToAST(constraint, constructor);
                let storeConstraintAST = convertToAST(constraint, constructor, tIdentifier(variableCombinatorName));
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
                    if (param.variable.isConst && !param.variable.negated) {
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

    handleField(field: TLBField, slicePrefix: Array<number>, ctx: ConstructorContext) {
        let currentSlice = getCurrentSlice(slicePrefix, 'slice');
        let currentCell = getCurrentSlice(slicePrefix, 'cell');

        if (field && field.subFields.length > 0) {
            slicePrefix[slicePrefix.length - 1]++;
            slicePrefix.push(0)

            ctx.constructorLoadStatements.push(sliceLoad(slicePrefix, currentSlice))
            ctx.subStructStoreStatements.push(tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')), tFunctionCall(tIdentifier('beginCell'), []))))

            field.subFields.forEach(fieldDef => {
                this.handleField(fieldDef, slicePrefix, ctx)
            });

            ctx.subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tIdentifier(getCurrentSlice(slicePrefix, 'cell'))])))

            slicePrefix.pop();
        }

        if (field?.fieldType.kind == 'TLBExoticType') {
            slicePrefix[slicePrefix.length - 1]++;
            slicePrefix.push(0);
            ctx.constructorLoadStatements.push(
                tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')),
                    tFunctionCall(tMemberExpression(
                        tIdentifier(currentSlice), tIdentifier('loadRef')
                    ), []),)))
            addLoadProperty(field.name, tIdentifier(getCurrentSlice(slicePrefix, 'cell')), undefined, ctx.constructorLoadStatements, ctx.subStructLoadProperties)
            ctx.subStructProperties.push(tTypedIdentifier(tIdentifier(field.name), tIdentifier('Cell')));
            ctx.subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tMemberExpression(tIdentifier(ctx.variableCombinatorName), tIdentifier(field.name))])))
            slicePrefix.pop();
        } else if (field?.subFields.length == 0) {
            if (field == undefined) {
                throw new Error('')
            }
            let fieldInfo = this.handleType(field, field.fieldType, true, ctx, currentSlice, currentCell, 0);
            if (fieldInfo.loadExpr) {
                addLoadProperty(field.name, fieldInfo.loadExpr, fieldInfo.typeParamExpr, ctx.constructorLoadStatements, ctx.subStructLoadProperties);
            }
            if (fieldInfo.typeParamExpr) {
                ctx.subStructProperties.push(tTypedIdentifier(tIdentifier(field.name), fieldInfo.typeParamExpr));
            }
            if (fieldInfo.storeExpr) {
                ctx.subStructStoreStatements.push(fieldInfo.storeExpr)
            }
            fieldInfo.negatedVariablesLoads.forEach(element => {
                addLoadProperty(element.name, element.expression, undefined, ctx.constructorLoadStatements, ctx.subStructLoadProperties)
            });
        }
    }


    handleType(field: TLBField, fieldType: TLBFieldType, isField: boolean, ctx: ConstructorContext, currentSlice: string, currentCell: string, argIndex: number): FieldInfoType {
        let fieldName = field.name
        let theSlice = 'slice'; // TODO: use slice from field
        let theCell = 'builder';
        if (isField) {
            theSlice = currentSlice;
            theCell = currentCell;
        }
        let result: FieldInfoType = { typeParamExpr: undefined, loadExpr: undefined, loadFunctionExpr: undefined, storeExpr: undefined, storeExpr2: undefined, storeFunctionExpr: undefined, negatedVariablesLoads: [] };

        let exprForParam: ExprForParam | undefined;

        let storeExpr2: Statement | undefined;

        let insideStoreParameters: Expression[];

        insideStoreParameters = [tMemberExpression(tIdentifier(ctx.variableCombinatorName), tIdentifier(fieldName))]; // TODO: use only field
        let insideStoreParameters2: Expression[] = [tIdentifier('arg')]

        if (fieldType.kind == 'TLBNumberType') {
            exprForParam = {
                argLoadExpr: convertToAST(fieldType.bits, ctx.constructor),
                argStoreExpr: convertToAST(fieldType.storeBits, ctx.constructor, tIdentifier(ctx.variableCombinatorName)),
                paramType: 'number',
                fieldLoadSuffix: fieldType.signed ? 'Int' : 'Uint',
                fieldStoreSuffix: fieldType.signed ? 'Int' : 'Uint'
            }
            if (isBigInt(fieldType)) {
                exprForParam.fieldLoadSuffix += 'Big';
                exprForParam.paramType = 'bigint';
            }
        } else if (fieldType.kind == 'TLBBitsType') {
            exprForParam = {
                argLoadExpr: convertToAST(fieldType.bits, ctx.constructor),
                argStoreExpr: convertToAST(fieldType.bits, ctx.constructor, tIdentifier(ctx.variableSubStructName)),
                paramType: 'BitString', fieldLoadSuffix: 'Bits', fieldStoreSuffix: 'Bits'
            }
        } else if (fieldType.kind == 'TLBCellType') {
            exprForParam = { argLoadExpr: tIdentifier(theSlice), argStoreExpr: tIdentifier(theSlice), paramType: 'Slice', fieldLoadSuffix: 'Slice', fieldStoreSuffix: 'Slice' }
        } else if (fieldType.kind == 'TLBBoolType') {
            exprForParam = { argLoadExpr: undefined, argStoreExpr: undefined, paramType: 'boolean', fieldLoadSuffix: 'Boolean', fieldStoreSuffix: 'Bit' }
        } else if (fieldType.kind == 'TLBAddressType') {
            exprForParam = { argLoadExpr: undefined, argStoreExpr: undefined, paramType: 'Address', fieldLoadSuffix: 'Address', fieldStoreSuffix: 'Address' }
        } else if (fieldType.kind == 'TLBExprMathType') {
            result.loadExpr = convertToAST(fieldType.expr, ctx.constructor);
            result.storeExpr = tExpressionStatement(result.loadExpr)
        } else if (fieldType.kind == 'TLBNegatedType') {
            let getParameterFunctionId = tIdentifier(ctx.variableSubStructName + '_get_' + fieldType.variableName)
            if (field.fieldType.kind == 'TLBNamedType') {
                let fieldTypeName = field.fieldType.name
                this.jsCodeFunctionsDeclarations.push(tFunctionDeclaration(getParameterFunctionId, tTypeParametersExpression([]), tIdentifier('number'), [tTypedIdentifier(tIdentifier(goodVariableName(fieldName)), tIdentifier(fieldTypeName))], getNegationDerivationFunctionBody(this.tlbCode, fieldTypeName, argIndex, fieldName)))
            }
            result.negatedVariablesLoads.push({ name: fieldType.variableName, expression: tFunctionCall(getParameterFunctionId, [tIdentifier(fieldName)]) })
        } else if (fieldType.kind == 'TLBNamedType' && fieldType.arguments.length == 0) {
            let typeName = fieldType.name;
            result.typeParamExpr = tIdentifier(typeName);
            if (isField) {
                result.loadExpr = tFunctionCall(tIdentifier('load' + typeName), [tIdentifier(theSlice)])
                result.storeExpr = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + typeName), insideStoreParameters), [tIdentifier(currentCell)]))
                storeExpr2 = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + typeName), insideStoreParameters2), [tIdentifier(currentCell)]))
            } else {
                result.loadExpr = tIdentifier('load' + typeName)
                result.storeExpr = tExpressionStatement(tIdentifier('store' + typeName))
            }
        } else if (fieldType.kind == 'TLBCondType') {
            let subExprInfo: FieldInfoType
            let conditionExpr: Expression;
            subExprInfo = this.handleType(field, fieldType.value, true, ctx, currentSlice, currentCell, argIndex);
            conditionExpr = convertToAST(fieldType.condition, ctx.constructor)
            if (subExprInfo.typeParamExpr) {
                result.typeParamExpr = tUnionTypeExpression([subExprInfo.typeParamExpr, tIdentifier('undefined')])
            }
            if (subExprInfo.loadExpr) {
                result.loadExpr = tTernaryExpression(conditionExpr, subExprInfo.loadExpr, tIdentifier('undefined'))
            }
            let currentParam = insideStoreParameters[0]
            let currentParam2 = insideStoreParameters2[0]
            if (currentParam && currentParam2 && subExprInfo.storeExpr) {
                result.storeExpr = tIfStatement(tBinaryExpression(currentParam, '!=', tIdentifier('undefined')), [subExprInfo.storeExpr])
                storeExpr2 = tIfStatement(tBinaryExpression(currentParam2, '!=', tIdentifier('undefined')), [subExprInfo.storeExpr])
            }
        } else if (fieldType.kind == 'TLBMultipleType') {
            let arrayLength: Expression
            let subExprInfo: FieldInfoType
            arrayLength = convertToAST(fieldType.times, ctx.constructor);
            subExprInfo = this.handleType(field, fieldType.value, false, ctx, currentSlice, currentCell, argIndex);
            let currentParam = insideStoreParameters[0]
            let currentParam2 = insideStoreParameters2[0]
            if (subExprInfo.loadExpr) {
                result.loadExpr = tFunctionCall(tMemberExpression(tFunctionCall(tMemberExpression(tIdentifier('Array'), tIdentifier('from')), [tFunctionCall(tMemberExpression(tFunctionCall(tIdentifier('Array'), [arrayLength]), tIdentifier('keys')), [])]), tIdentifier('map')), [tArrowFunctionExpression([tTypedIdentifier(tIdentifier('arg'), tIdentifier('number'))], [tReturnStatement(subExprInfo.loadExpr)])])
            }
            if (currentParam && currentParam2 && subExprInfo.typeParamExpr && subExprInfo.storeExpr) {
                if (subExprInfo.storeFunctionExpr && subExprInfo.storeExpr2) {
                    result.storeExpr = tExpressionStatement(tFunctionCall(tMemberExpression(currentParam, tIdentifier('forEach')), [tArrowFunctionExpression([tTypedIdentifier(tIdentifier('arg'), subExprInfo.typeParamExpr)], [subExprInfo.storeExpr2])])) //subExprInfo.storeExpr;)
                    storeExpr2 = tExpressionStatement(tFunctionCall(tMemberExpression(currentParam2, tIdentifier('forEach')), [tArrowFunctionExpression([tTypedIdentifier(tIdentifier('arg'), subExprInfo.typeParamExpr)], [subExprInfo.storeExpr2])])) //subExprInfo.storeExpr;
                }
            }
            if (subExprInfo.typeParamExpr) {
                result.typeParamExpr = tTypeWithParameters(tIdentifier('Array'), tTypeParametersExpression([subExprInfo.typeParamExpr]));
            }
        } else if (fieldType.kind == 'TLBCellInsideType') {
            let currentSlice = getCurrentSlice([1, 0], 'slice');
            let currentCell = getCurrentSlice([1, 0], 'cell');

            let subExprInfo: FieldInfoType;
            subExprInfo = this.handleType(field, fieldType.value, true, ctx, currentSlice, currentCell, argIndex)
            if (subExprInfo.loadExpr) {
                result.typeParamExpr = subExprInfo.typeParamExpr;
                result.storeExpr = subExprInfo.storeExpr;
                result.negatedVariablesLoads = subExprInfo.negatedVariablesLoads;
                result.loadFunctionExpr = tArrowFunctionExpression([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], [sliceLoad([1, 0], 'slice'), tReturnStatement(subExprInfo.loadExpr)])
                result.loadExpr = tFunctionCall(result.loadFunctionExpr, [tIdentifier(theSlice)])
            }
            if (subExprInfo.storeExpr) {
                result.storeExpr = tMultiStatement([
                    tExpressionStatement(tDeclareVariable(tIdentifier(currentCell), tFunctionCall(tIdentifier('beginCell'), []))),
                    subExprInfo.storeExpr,
                    tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier('builder'), tIdentifier('storeRef')), [tIdentifier(currentCell)]))
                ])
            }
            if (subExprInfo.storeExpr2) {
                storeExpr2 = tMultiStatement([
                    tExpressionStatement(tDeclareVariable(tIdentifier(currentCell), tFunctionCall(tIdentifier('beginCell'), []))),
                    subExprInfo.storeExpr2,
                    tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier('builder'), tIdentifier('storeRef')), [tIdentifier(currentCell)]))
                ])
            }
        } else if (fieldType.kind == 'TLBNamedType' && fieldType.arguments.length) {
            let typeName = fieldType.name;

            let typeExpression: TypeParametersExpression = tTypeParametersExpression([]);
            let loadFunctionsArray: Array<Expression> = []
            let storeFunctionsArray: Array<Expression> = []
            let argIndex = -1;
            if (fieldType.kind == 'TLBNamedType') {
                fieldType.arguments.forEach(arg => {
                    argIndex++;
                    let subExprInfo = this.handleType(field, arg, false, ctx, currentSlice, currentCell, argIndex);
                    if (subExprInfo.typeParamExpr) {
                        typeExpression.typeParameters.push(subExprInfo.typeParamExpr);
                    }
                    if (subExprInfo.loadFunctionExpr) {
                        loadFunctionsArray.push(subExprInfo.loadFunctionExpr);
                    }
                    if (subExprInfo.storeFunctionExpr) {
                        storeFunctionsArray.push(subExprInfo.storeFunctionExpr);
                    }
                    result.negatedVariablesLoads = result.negatedVariablesLoads.concat(subExprInfo.negatedVariablesLoads);
                })
            }
            result.typeParamExpr = tTypeWithParameters(tIdentifier(typeName), typeExpression);

            let currentTypeParameters = typeExpression;

            let insideLoadParameters: Array<Expression> = [tIdentifier(theSlice)];

            result.loadExpr = tFunctionCall(tIdentifier('load' + typeName), insideLoadParameters.concat(loadFunctionsArray), currentTypeParameters);
            result.storeExpr = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + typeName), insideStoreParameters.concat(storeFunctionsArray), currentTypeParameters), [tIdentifier(theCell)]))
            storeExpr2 = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + typeName), insideStoreParameters2.concat(storeFunctionsArray), currentTypeParameters), [tIdentifier(theCell)]))
            if (exprForParam) {
                result.typeParamExpr = tIdentifier(exprForParam.paramType);
            }
        }

        if (exprForParam) {
            if (exprForParam.paramType != 'BitString' && exprForParam.paramType != 'Slice') {
                if (exprForParam.argStoreExpr) {
                    insideStoreParameters.push(exprForParam.argStoreExpr);
                    insideStoreParameters2.push(exprForParam.argStoreExpr);
                }
            }
            result.loadExpr = tFunctionCall(tMemberExpression(tIdentifier(currentSlice), tIdentifier('load' + exprForParam.fieldLoadSuffix)), (exprForParam.argLoadExpr ? [exprForParam.argLoadExpr] : []));
            if (exprForParam.paramType == 'Slice') {
                result.loadExpr = tIdentifier(currentSlice)
                result.loadFunctionExpr = tArrowFunctionExpression([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], [tReturnStatement(tIdentifier('slice'))])
            }
            result.typeParamExpr = tIdentifier(exprForParam.paramType);
            result.storeExpr = tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(theCell), tIdentifier('store' + exprForParam.fieldStoreSuffix)), insideStoreParameters));
            storeExpr2 = tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(theCell), tIdentifier('store' + exprForParam.fieldStoreSuffix)), insideStoreParameters2));
        }

        if (result.loadExpr && !result.loadFunctionExpr) {
            if (result.loadExpr.type == 'FunctionCall') {
                result.loadFunctionExpr = tArrowFunctionExpression([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], [tReturnStatement(result.loadExpr)])
            } else {
                result.loadFunctionExpr = result.loadExpr
            }
        }
        if (result.storeExpr && !result.storeFunctionExpr) {
            if (!storeExpr2) {
                storeExpr2 = result.storeExpr
            }
            if (result.typeParamExpr) {
                if (result.storeExpr.type == 'ExpressionStatement' && result.storeExpr.expression.type == 'FunctionCall' || result.storeExpr.type == 'MultiStatement') {
                    result.storeFunctionExpr = tArrowFunctionExpression([tTypedIdentifier(tIdentifier('arg'), result.typeParamExpr)], [tReturnStatement(tArrowFunctionExpression([tTypedIdentifier(tIdentifier('builder'), tIdentifier('Builder'))], [storeExpr2]))])
                } else {
                    if (result.storeExpr.type == 'ExpressionStatement') {
                        result.storeFunctionExpr = result.storeExpr.expression;
                    }
                }
            }
        }

        result.storeExpr2 = storeExpr2
        return result;
    }

}

