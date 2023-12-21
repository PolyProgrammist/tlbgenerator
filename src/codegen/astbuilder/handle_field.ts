import { BuiltinOneArgExpr, BuiltinZeroArgs, CellRefExpr, CombinatorExpr, CondExpr, FieldExprDef, FieldNamedDef, MathExpr, NameExpr, NegateExpr, NumberExpr, Expression as ParserExpression } from "../../ast/nodes";
import { TLBBinaryOp, TLBCode, TLBConstructor, TLBField, TLBFieldType, TLBNumberExpr, TLBNumberType, TLBType, TLBUnaryOp } from "../ast";
import { GenDeclaration, ObjectProperty } from "../generators/typescript/tsgen";
import { convertToMathExpr, firstLower, getSubStructName, goodVariableName, splitForTypeValue } from "../utils";

export function getType(expr: ParserExpression, fieldName: string, isField: boolean, needArg: boolean, variableCombinatorName: string, variableSubStructName: string, constructor: TLBConstructor, fieldTypeName: string, argIndex: number, tlbCode: TLBCode): TLBFieldType {
    // let theSlice = 'slice';
    // let theCell = 'builder';
    if (isField) {
    //   theSlice = currentSlice;
    //   theCell = currentCell;
    }
    // let result: FieldInfoType = { typeParamExpr: undefined, loadExpr: undefined, loadFunctionExpr: undefined, storeExpr: undefined, storeExpr2: undefined, storeFunctionExpr: undefined, negatedVariablesLoads: [] };
  
    // let exprForParam: ExprForParam | undefined;
  
    // let storeExpr2: Statement | undefined;
  
    // let insideStoreParameters: Expression[];
  
    // insideStoreParameters = [tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier(goodVariableName(fieldName)))];
    // let insideStoreParameters2: Expression[] = [tIdentifier('arg')]
    
    if (expr instanceof BuiltinZeroArgs) {
      if (expr.name == '#') {
        return { kind: 'TLBNumberType', bits: new TLBNumberExpr(32), storeBits: new TLBNumberExpr(32), signed: false, maxBits: 32}
      } else {
        throw new Error('Expression not supported' + expr)
      }
    } else if (expr instanceof BuiltinOneArgExpr) {
      if (expr.name.toString() == '##' || expr.name.toString() == '(##)') {
        if (expr.arg instanceof NumberExpr) {
            return { kind: 'TLBNumberType', bits: new TLBNumberExpr(expr.arg.num), storeBits: new TLBNumberExpr(expr.arg.num), signed: false, maxBits: expr.arg.num }
        }
        if (expr.arg instanceof NameExpr) {
          let parameter = constructor.parametersMap.get(expr.arg.name)
          if (!parameter || !parameter.variable.deriveExpr || !parameter.variable.initialExpr) {
            throw new Error('')
          }
          return { kind: 'TLBNumberType', bits: parameter.variable.deriveExpr, storeBits: parameter.variable.initialExpr, signed: false, maxBits: undefined }
        } // TODO: handle other cases
      } else if (expr.name == '#<') {
        if (expr.arg instanceof NumberExpr || expr.arg instanceof NameExpr) {
          let bits = new TLBUnaryOp(new TLBBinaryOp(convertToMathExpr(expr.arg), new TLBNumberExpr(1), '-'), '.');
          return { kind: 'TLBNumberType', bits: bits, storeBits: bits, signed: false, maxBits: 32}
        } // TODO: handle other cases
      } else if (expr.name == '#<=') {
        if (expr.arg instanceof NumberExpr || expr.arg instanceof NameExpr) {
          let bits = new TLBUnaryOp(convertToMathExpr(expr.arg), '.');
            return { kind: 'TLBNumberType', bits: bits, storeBits: bits, signed: false, maxBits: 32}
        } // TODO: handle other cases
      } 
    } else if (expr instanceof CombinatorExpr) {
      if (expr.name == 'int' && expr.args.length == 1 && (expr.args[0] instanceof MathExpr || expr.args[0] instanceof NumberExpr || expr.args[0] instanceof NameExpr)) {
        return { kind: 'TLBNumberType', bits: convertToMathExpr(expr.args[0]), storeBits: convertToMathExpr(expr.args[0]), signed: true, maxBits: undefined}
      } else if (expr.name == 'uint' && expr.args.length == 1 && (expr.args[0] instanceof MathExpr || expr.args[0] instanceof NumberExpr || expr.args[0] instanceof NameExpr)) {
        return { kind: 'TLBNumberType', bits: convertToMathExpr(expr.args[0]), storeBits: convertToMathExpr(expr.args[0]), signed: false, maxBits: undefined}
      } else if (expr.name == 'bits' && expr.args.length == 1 && (expr.args[0] instanceof MathExpr || expr.args[0] instanceof NumberExpr || expr.args[0] instanceof NameExpr)) {
        return { kind: 'TLBBitsType', bits: convertToMathExpr(expr.args[0]) }
      } else {
        let argumentTypes: TLBFieldType[] = []
        expr.args.forEach((arg) => {
          let thefield = getType(arg, fieldName, false, needArg, variableCombinatorName, variableSubStructName, constructor, fieldTypeName, argIndex, tlbCode);
          argumentTypes.push(thefield)
        });
        // let typeExpression: TypeParametersExpression = tTypeParametersExpression([]);
        // let loadFunctionsArray: Array<Expression> = []
        // let storeFunctionsArray: Array<Expression> = []
        // let argIndex = -1;
        // expr.args.forEach((arg) => {
        //   argIndex++;
        //   let subExprInfo = handleType(arg, fieldName, false, needArg, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, jsCodeFunctionsDeclarations, fieldTypeName, argIndex, tlbCode, subStructLoadProperties);
        //   if (subExprInfo.typeParamExpr) {
        //     typeExpression.typeParameters.push(subExprInfo.typeParamExpr);
        //   }
        //   if (subExprInfo.loadFunctionExpr) {
        //     loadFunctionsArray.push(subExprInfo.loadFunctionExpr);
        //   }
        //   if (subExprInfo.storeFunctionExpr) {
        //     storeFunctionsArray.push(subExprInfo.storeFunctionExpr); 
        //   }
        //   result.negatedVariablesLoads = result.negatedVariablesLoads.concat(subExprInfo.negatedVariablesLoads);
        // });
        // result.typeParamExpr = tTypeWithParameters(tIdentifier(expr.name), typeExpression);
  
        // let currentTypeParameters = typeExpression;
  
        // let insideLoadParameters: Array<Expression> = [tIdentifier(theSlice)];
  
        // result.loadExpr = tFunctionCall(tIdentifier('load' + expr.name), insideLoadParameters.concat(loadFunctionsArray), currentTypeParameters);
        // result.storeExpr = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + expr.name), insideStoreParameters.concat(storeFunctionsArray), currentTypeParameters), [tIdentifier(theCell)]))
        // storeExpr2 = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + expr.name), insideStoreParameters2.concat(storeFunctionsArray), currentTypeParameters), [tIdentifier(theCell)]))
        return { kind: 'TLBNamedType', name: expr.name, arguments: argumentTypes}
      } 
    //   if (exprForParam) {
    //     result.typeParamExpr = tIdentifier(exprForParam.paramType);
    //   }
    } else if (expr instanceof NameExpr) {
      let theNum;
      if (expr.name == 'Int') {
        return { kind: 'TLBNumberType', bits: new TLBNumberExpr(257), storeBits: new TLBNumberExpr(257), signed: true, maxBits: 257}
      } else if (expr.name == 'Bits') {
        return { kind: 'TLBBitsType', bits: new TLBNumberExpr(1023) }
      } else if (expr.name == 'Bit') {
        return { kind: 'TLBBitsType', bits: new TLBNumberExpr(1) }
      } else if (expr.name == 'Uint') {
        return { kind: 'TLBNumberType', bits: new TLBNumberExpr(257), storeBits: new TLBNumberExpr(257), signed: false, maxBits: 257}
      } else if (expr.name == 'Any' || expr.name == 'Cell') {
        return { kind: 'TLBCellType'}
      } else if ((theNum = splitForTypeValue(expr.name, 'int')) != undefined) {
        return { kind: 'TLBNumberType', bits: new TLBNumberExpr(theNum), storeBits: new TLBNumberExpr(theNum), signed: true, maxBits: theNum}
      } else if ((theNum = splitForTypeValue(expr.name, 'uint')) != undefined) {
        return { kind: 'TLBNumberType', bits: new TLBNumberExpr(theNum), storeBits: new TLBNumberExpr(theNum), signed: false, maxBits: theNum}
      } else if ((theNum = splitForTypeValue(expr.name, 'bits')) != undefined) {
        return { kind: 'TLBBitsType', bits: new TLBNumberExpr(theNum) }
      } else if (expr.name == 'Bool') {
        return { kind: 'TLBBoolType'}
      } else if (expr.name == 'MsgAddressInt') {
        return { kind: 'TLBAddressType' }
      } else {
        if (constructor.variablesMap.get(expr.name)?.type == '#') {
        //   result.loadExpr = getVarExprByName(expr.name, constructor)
        //   result.storeExpr = tExpressionStatement(result.loadExpr);
        } else {
          return {kind: 'TLBNamedType', name: expr.name, arguments: []}
        //   result.typeParamExpr = tIdentifier(expr.name);
        //   if (isField) {
        //     result.loadExpr = tFunctionCall(tIdentifier('load' + expr.name), [tIdentifier(theSlice)])
        //     result.storeExpr = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + expr.name), insideStoreParameters), [tIdentifier(currentCell)]))
        //     storeExpr2 = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + expr.name), insideStoreParameters2), [tIdentifier(currentCell)]))
        //   } else {
        //     result.loadExpr = tIdentifier('load' + expr.name)
        //     result.storeExpr = tExpressionStatement(tIdentifier('store' + expr.name))
        //   }
        }
      }
    //   if (exprForParam) {
    //     result.typeParamExpr = tIdentifier(exprForParam.paramType)
    //   }
    } else if (expr instanceof NumberExpr) {
      return {kind: 'TLBExprMathType', expr: new TLBNumberExpr(expr.num)}
      //   result.loadExpr = tNumericLiteral(expr.num)
    } else if (expr instanceof NegateExpr && expr.expr instanceof NameExpr) { // TODO: handle other case
    //   let getParameterFunctionId = tIdentifier(variableSubStructName + '_get_' + expr.expr.name)
    //   jsCodeFunctionsDeclarations.push(tFunctionDeclaration(getParameterFunctionId, tTypeParametersExpression([]), tIdentifier('number'), [tTypedIdentifier(tIdentifier(goodVariableName(fieldName)), tIdentifier(fieldTypeName))], getNegationDerivationFunctionBody(tlbCode, fieldTypeName, argIndex, fieldName)))
    //   result.negatedVariablesLoads.push({name: expr.expr.name, expression: tFunctionCall(getParameterFunctionId, [tIdentifier(goodVariableName(fieldName))])})
    } else if (expr instanceof CellRefExpr) {
    //   let currentSlice = getCurrentSlice([1, 0], 'slice');
    //   let currentCell = getCurrentSlice([1, 0], 'cell');
  
      let subExprInfo = getType(expr.expr, fieldName, true, true, variableCombinatorName, variableSubStructName, constructor, fieldTypeName, argIndex, tlbCode);
    //   if (subExprInfo.loadExpr) {
    //     result.typeParamExpr = subExprInfo.typeParamExpr;
    //     result.storeExpr = subExprInfo.storeExpr;
    //     result.negatedVariablesLoads = subExprInfo.negatedVariablesLoads;
    //     result.loadFunctionExpr = tArrowFunctionExpression([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], [sliceLoad([1, 0], 'slice'), tReturnStatement(subExprInfo.loadExpr)])
    //     result.loadExpr = tFunctionCall(result.loadFunctionExpr, [tIdentifier(theSlice)])
    //   }
    //   if (subExprInfo.storeExpr) {
    //     result.storeExpr = tMultiStatement([
    //       tExpressionStatement(tDeclareVariable(tIdentifier(currentCell), tFunctionCall(tIdentifier('beginCell'), []))),
    //       subExprInfo.storeExpr,
    //       tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier('builder'), tIdentifier('storeRef')), [tIdentifier(currentCell)]))
    //     ])
    //   }
    //   if (subExprInfo.storeExpr2) {
    //     storeExpr2 = tMultiStatement([
    //       tExpressionStatement(tDeclareVariable(tIdentifier(currentCell), tFunctionCall(tIdentifier('beginCell'), []))),
    //       subExprInfo.storeExpr2,
    //       tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier('builder'), tIdentifier('storeRef')), [tIdentifier(currentCell)]))
    //     ])
    //   }
    } else if (expr instanceof MathExpr) {
      if (fieldTypeName == '') {
        if (expr.op == '*') {
        //   let arrayLength = convertToAST(convertToMathExpr(expr.left), constructor, true);
        //   let subExprInfo = handleType(expr.right, fieldName, false, needArg, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, jsCodeFunctionsDeclarations, fieldTypeName, argIndex, tlbCode, subStructLoadProperties);
        //   let currentParam = insideStoreParameters[0]
        //   let currentParam2 = insideStoreParameters2[0]
        //   if (subExprInfo.loadExpr) {
        //     result.loadExpr = tFunctionCall(tMemberExpression(tFunctionCall(tMemberExpression(tIdentifier('Array'), tIdentifier('from')), [tFunctionCall(tMemberExpression(tFunctionCall(tIdentifier('Array'), [arrayLength]), tIdentifier('keys')), [])]), tIdentifier('map')), [tArrowFunctionExpression([tTypedIdentifier(tIdentifier('arg'), tIdentifier('number'))], [tReturnStatement(subExprInfo.loadExpr)])])
        //   }
        //   if (currentParam && currentParam2 && subExprInfo.typeParamExpr && subExprInfo.storeExpr) {
        //     if (subExprInfo.storeFunctionExpr && subExprInfo.storeExpr2) {
        //       result.storeExpr = tExpressionStatement(tFunctionCall(tMemberExpression(currentParam, tIdentifier('forEach')), [tArrowFunctionExpression([tTypedIdentifier(tIdentifier('arg'), subExprInfo.typeParamExpr)], [subExprInfo.storeExpr2])])) //subExprInfo.storeExpr;)
        //       storeExpr2 = tExpressionStatement(tFunctionCall(tMemberExpression(currentParam2, tIdentifier('forEach')), [tArrowFunctionExpression([tTypedIdentifier(tIdentifier('arg'), subExprInfo.typeParamExpr)], [subExprInfo.storeExpr2])])) //subExprInfo.storeExpr;
        //     }
        //   }
        //   if (subExprInfo.typeParamExpr) {
        //     result.typeParamExpr = tTypeWithParameters(tIdentifier('Array'), tTypeParametersExpression([subExprInfo.typeParamExpr]));
        //   }
        } else {
          throw new Error('')
        }
      } else {
        return {kind: 'TLBExprMathType', expr: convertToMathExpr(expr)}
        // result.loadExpr = convertToAST(convertToMathExpr(expr), constructor, true);
        // result.storeExpr = tExpressionStatement(result.loadExpr);
      }
    } else if (expr instanceof CondExpr) {
    //   let subExprInfo = handleType(expr.condExpr, fieldName, true, false, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, jsCodeFunctionsDeclarations, fieldTypeName, argIndex, tlbCode, subStructLoadProperties);
    //   if (subExprInfo.typeParamExpr) {
    //     result.typeParamExpr = tUnionTypeExpression([subExprInfo.typeParamExpr, tIdentifier('undefined')])
    //   }
    //   if (subExprInfo.loadExpr) {
    //     let conditionExpr: Expression;
    //     if (expr.left instanceof NameExpr) {
    //       conditionExpr = convertToAST(convertToMathExpr(expr.left), constructor, true)
    //       if (expr.dotExpr != null) {
    //         conditionExpr = tBinaryExpression(conditionExpr, '&', tBinaryExpression(tNumericLiteral(1), '<<', tNumericLiteral(expr.dotExpr)))
    //       }
    //     } else { // TODO: handle other cases
    //       throw new Error('')
    //     }
    //     result.loadExpr = tTernaryExpression(conditionExpr, subExprInfo.loadExpr, tIdentifier('undefined'))
    //   }
    //   let currentParam = insideStoreParameters[0]
    //   let currentParam2 = insideStoreParameters2[0]
    //   if (currentParam && currentParam2 && subExprInfo.storeExpr) {
    //     result.storeExpr = tIfStatement(tBinaryExpression(currentParam, '!=', tIdentifier('undefined')), [subExprInfo.storeExpr])
    //     storeExpr2 = tIfStatement(tBinaryExpression(currentParam2, '!=', tIdentifier('undefined')), [subExprInfo.storeExpr])
    //   }
    } else { // TODO: handle other cases
      throw new Error('Expression not supported: ' + expr);
    }
    // if (exprForParam) {
    //   if (exprForParam.paramType != 'BitString' && exprForParam.paramType != 'Slice') {
    //     if (exprForParam.argStoreExpr) {
    //       insideStoreParameters.push(exprForParam.argStoreExpr);
    //       insideStoreParameters2.push(exprForParam.argStoreExpr);
    //     }
    //   }
    //   result.loadExpr = tFunctionCall(tMemberExpression(tIdentifier(currentSlice), tIdentifier('load' + exprForParam.fieldLoadSuffix)), (exprForParam.argLoadExpr ? [exprForParam.argLoadExpr] : []));
    //   if (exprForParam.paramType == 'Slice') {
    //     result.loadExpr = tIdentifier(currentSlice)
    //     result.loadFunctionExpr = tArrowFunctionExpression([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], [tReturnStatement(tIdentifier('slice'))])
    //   }
    //   result.typeParamExpr = tIdentifier(exprForParam.paramType);
    //   result.storeExpr = tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(theCell), tIdentifier('store' + exprForParam.fieldStoreSuffix)), insideStoreParameters));
    //   storeExpr2 = tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(theCell), tIdentifier('store' + exprForParam.fieldStoreSuffix)), insideStoreParameters2));
    // }
  
    // if (result.loadExpr && !result.loadFunctionExpr) {
    //   if (result.loadExpr.type == 'FunctionCall') {
    //     result.loadFunctionExpr = tArrowFunctionExpression([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], [tReturnStatement(result.loadExpr)])
    //   } else {
    //     result.loadFunctionExpr = result.loadExpr
    //   }
    // }
    // if (result.storeExpr && !result.storeFunctionExpr) {
    //   if (!storeExpr2) {
    //     storeExpr2 = result.storeExpr
    //   }
    //   if (result.typeParamExpr) {
    //     if (result.storeExpr.type == 'ExpressionStatement' && result.storeExpr.expression.type == 'FunctionCall' || result.storeExpr.type == 'MultiStatement') {
    //       result.storeFunctionExpr = tArrowFunctionExpression([tTypedIdentifier(tIdentifier('arg'), result.typeParamExpr)], [tReturnStatement(tArrowFunctionExpression([tTypedIdentifier(tIdentifier('builder'), tIdentifier('Builder'))], [storeExpr2]))])
    //     } else {
    //       if (result.storeExpr.type == 'ExpressionStatement') {
    //         result.storeFunctionExpr = result.storeExpr.expression;
    //       }
    //     }
    //   }
    // }
  
    // result.storeExpr2 = storeExpr2
    return {kind: 'TLBUndefinedType'}// {new TLBNumberExpr(3)};
  }
  

export function fillFields(tlbCode: TLBCode) {
    tlbCode.types.forEach(tlbType => {
        tlbType.constructors.forEach(constructor => {
            let fieldIndex = 0;
            let variableCombinatorName = goodVariableName(firstLower(tlbType.name), '0')
            let subStructName: string = getSubStructName(tlbType, constructor);
            let variableSubStructName = goodVariableName(firstLower(subStructName), '_' + constructor.name)

            constructor.declaration.fields.forEach(field => {
                // let currentSlice = getCurrentSlice(slicePrefix, 'slice');
                // let currentCell = getCurrentSlice(slicePrefix, 'cell');
              
                // if (field instanceof FieldAnonymousDef) {
                //   slicePrefix[slicePrefix.length - 1]++;
                //   slicePrefix.push(0)
              
                //   constructorLoadStatements.push(sliceLoad(slicePrefix, currentSlice))
                //   subStructStoreStatements.push(tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')), tFunctionCall(tIdentifier('beginCell'), []))))
              
                //   field.fields.forEach(field => {
                //     handleField(field, slicePrefix, tlbCode, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations, fieldIndex)
                //   });
              
                //   subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tIdentifier(getCurrentSlice(slicePrefix, 'cell'))])))
              
                //   slicePrefix.pop();
                // }
              
                // if (field instanceof FieldBuiltinDef && field.type != 'Type') {
                //   subStructProperties.push(tTypedIdentifier(tIdentifier(goodVariableName(field.name)), tIdentifier('number')));
                //   let parameter = constructor.parametersMap.get(field.name)
                //   if (parameter && !parameter.variable.const && !parameter.variable.negated) {
                //     subStructLoadProperties.push(tObjectProperty(tIdentifier(goodVariableName(field.name)), getParamVarExpr(parameter, constructor)))
                //   }
                // }
              
                if (field instanceof FieldNamedDef || field instanceof FieldExprDef) {
                  let fieldName: string;
                  if (field instanceof FieldNamedDef) {
                    fieldName = field.name;
                  } else {
                    fieldName = 'anon' + fieldIndex;
                  }
                  if (field instanceof FieldExprDef && field.expr instanceof NameExpr && field.expr.name == '_') {
                    return;
                  }
              
                //   if (field.expr instanceof CellRefExpr) {
              
                //     if (field.expr.expr instanceof CombinatorExpr && (field.expr.expr.name == 'MERKLE_UPDATE' || field.expr.expr.name == 'MERKLE_ROOT')) {
                //       slicePrefix[slicePrefix.length - 1]++;
                //       slicePrefix.push(0);
                //       constructorLoadStatements.push(
                //         tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')),
              
                //             tFunctionCall(tMemberExpression(
                //               tIdentifier(currentSlice), tIdentifier('loadRef')
                //             ), []),)))
                //       addLoadProperty(goodVariableName(fieldName), tIdentifier(getCurrentSlice(slicePrefix, 'cell')), undefined, constructorLoadStatements, subStructLoadProperties)
                //       subStructProperties.push(tTypedIdentifier(tIdentifier(goodVariableName(fieldName)), tIdentifier('Cell')));
                //       subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier(goodVariableName(fieldName)))])))
              
                //       // subStructStoreStatements
                //       slicePrefix.pop();
                //     } else {
                //       slicePrefix[slicePrefix.length - 1]++;
                //       slicePrefix.push(0)
                //       constructorLoadStatements.push(sliceLoad(slicePrefix, currentSlice))
                //       subStructStoreStatements.push(tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')), tFunctionCall(tIdentifier('beginCell'), []))))
                //       handleField(new FieldNamedDef(fieldName, field.expr.expr), slicePrefix, tlbCode, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations, fieldIndex)
                //       subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tIdentifier(getCurrentSlice(slicePrefix, 'cell'))])))
                //       slicePrefix.pop();
                //     }      
                //   }
              
                  if (field.expr instanceof CombinatorExpr || field.expr instanceof NameExpr || field.expr instanceof BuiltinZeroArgs || field.expr instanceof BuiltinOneArgExpr || field.expr instanceof MathExpr || field.expr instanceof CondExpr) {
                    let tmpTypeName: string;
                    if (field.expr instanceof MathExpr || field.expr instanceof CondExpr) {
                      tmpTypeName = ''
                    } else {
                      tmpTypeName = field.expr.name;
                    }
              
                    let fieldInfo = getType(field.expr, fieldName, true, false, variableCombinatorName, variableSubStructName, constructor, tmpTypeName, 0, tlbCode);
                    // if (fieldInfo.loadExpr) {
                    //   addLoadProperty(goodVariableName(fieldName), fieldInfo.loadExpr, fieldInfo.typeParamExpr, constructorLoadStatements, subStructLoadProperties);
                    // }
                    // if (fieldInfo.typeParamExpr) {
                    //   subStructProperties.push(tTypedIdentifier(tIdentifier(goodVariableName(fieldName)), fieldInfo.typeParamExpr));
                    // }
                    // if (fieldInfo.storeExpr) {
                    //   subStructStoreStatements.push(fieldInfo.storeExpr)
                    // }
                    // fieldInfo.negatedVariablesLoads.forEach(element => {
                    //   addLoadProperty(goodVariableName(element.name), element.expression, undefined, constructorLoadStatements, subStructLoadProperties)
                    // });
                    constructor.fields.push({name: fieldName, anonymous: !(field instanceof FieldNamedDef), fieldType: fieldInfo})
                  }
                }
            })
        })
    })
}