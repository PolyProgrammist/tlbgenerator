import { BuiltinZeroArgs, FieldCurlyExprDef, FieldNamedDef, Program, Declaration, BuiltinOneArgExpr, NumberExpr, NameExpr, CombinatorExpr, FieldBuiltinDef, MathExpr, SimpleExpr, NegateExpr, CellRefExpr, FieldDefinition, FieldAnonymousDef, CondExpr, CompareExpr, Expression as ParserExpression, TypeExpr } from '../../../ast/nodes'
import { tIdentifier, tArrowFunctionExpression, tArrowFunctionType, tBinaryExpression, tBinaryNumericLiteral, tDeclareVariable, tExpressionStatement, tFunctionCall, tFunctionDeclaration, tIfStatement, tImportDeclaration, tMemberExpression, tNumericLiteral, tObjectExpression, tObjectProperty, tReturnStatement, tStringLiteral, tStructDeclaration, tTypeParametersExpression, tTypeWithParameters, tTypedIdentifier, tUnionTypeDeclaration, toCode, TypeWithParameters, ArrowFunctionExpression, tMultiStatement, tUnionTypeExpression, tTernaryExpression, FunctionDeclaration, GenDeclaration } from './tsgen'
import { TLBMathExpr, TLBVarExpr, TLBNumberExpr, TLBBinaryOp, TLBCode, TLBType, TLBConstructor, TLBParameter, TLBVariable, TLBFieldType, TLBNumberType } from '../../ast'
import { Expression, Statement, Identifier, BinaryExpression, ASTNode, TypeExpression, TypeParametersExpression, ObjectProperty, TypedIdentifier } from './tsgen'
import { fillConstructors, firstLower, getCurrentSlice, bitLen, convertToMathExpr, splitForTypeValue, deriveMathExpression } from '../../utils'
import { getCondition } from "./utils"
import { getTypeParametersExpression } from "./utils"
import { convertToAST } from "./utils"
import { getNegationDerivationFunctionBody, getParamVarExpr, getVarExprByName, simpleCycle, sliceLoad } from './utils'
import { goodVariableName } from '../../utils'
import util  from 'util'

type FieldInfoType = {
  typeParamExpr: TypeExpression | undefined
  loadExpr: Expression | undefined
  loadFunctionExpr: Expression | undefined
  storeExpr: Statement | undefined
  storeExpr2: Statement | undefined
  storeFunctionExpr: Expression | undefined
  negatedVariablesLoads: Array<{name: string, expression: Expression}>
}

type ExprForParam = {
  argLoadExpr: Expression | undefined
  argStoreExpr: Expression | undefined
  paramType: string
  fieldLoadSuffix: string
  fieldStoreSuffix: string
}

function isBigInt(fieldType: TLBNumberType) {
  if (fieldType.bits instanceof TLBNumberExpr) {
    if (fieldType.bits.n <= 64) {
      return false;
    }
  }
  if (fieldType.maxBits && fieldType.maxBits <= 64) {
    return false;
  }
  return true;
}

export function handleType(fieldType: TLBFieldType, expr: ParserExpression, fieldName: string, isField: boolean, needArg: boolean, variableCombinatorName: string, variableSubStructName: string, currentSlice: string, currentCell: string, constructor: TLBConstructor, jsCodeFunctionsDeclarations: GenDeclaration[], fieldTypeName: string, argIndex: number, tlbCode: TLBCode, subStructLoadProperties: ObjectProperty[]): FieldInfoType {
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

  insideStoreParameters = [tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier(goodVariableName(fieldName)))]; // TODO: use only field
  let insideStoreParameters2: Expression[] = [tIdentifier('arg')]

  if (fieldType.kind == 'TLBNumberType') {
    exprForParam = {
      argLoadExpr: convertToAST(fieldType.bits, constructor, true),
      argStoreExpr: convertToAST(fieldType.storeBits, constructor, false, tIdentifier(variableCombinatorName)),
      paramType: 'number',
      fieldLoadSuffix: fieldType.signed ? 'Int' : 'Uint',
      fieldStoreSuffix: fieldType.signed ? 'Int': 'Uint'
    }
    if (isBigInt(fieldType)) {
      exprForParam.fieldLoadSuffix += 'Big';
      exprForParam.paramType = 'bigint';
    }
  }

  if (fieldType.kind == 'TLBBitsType') {
    exprForParam = {
      argLoadExpr: convertToAST(fieldType.bits, constructor),
        argStoreExpr: convertToAST(fieldType.bits, constructor, false, tIdentifier(variableSubStructName)),
        paramType: 'BitString', fieldLoadSuffix: 'Bits', fieldStoreSuffix: 'Bits'
    }
  }

  if (fieldType.kind == 'TLBCellType') {
    exprForParam = {argLoadExpr: tIdentifier(theSlice), argStoreExpr: tIdentifier(theSlice), paramType: 'Slice', fieldLoadSuffix: 'Slice', fieldStoreSuffix: 'Slice'}
  }

  if (fieldType.kind == 'TLBBoolType') {
    exprForParam = {argLoadExpr: undefined, argStoreExpr: undefined, paramType: 'boolean', fieldLoadSuffix: 'Boolean', fieldStoreSuffix: 'Bit'}
  }

  if (fieldType.kind == 'TLBAddressType') {
    exprForParam = {argLoadExpr: undefined, argStoreExpr: undefined, paramType: 'Address', fieldLoadSuffix: 'Address', fieldStoreSuffix: 'Address'}
  }
  
  if (expr instanceof BuiltinZeroArgs) {
    if (expr.name == '#') {
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {argLoadExpr: tNumericLiteral(32), argStoreExpr: tNumericLiteral(32), paramType: 'number', fieldLoadSuffix: 'Uint', fieldStoreSuffix: 'Uint'}
      }
    } else {
      throw new Error('Expression not supported' + expr)
    }
  } else if (expr instanceof BuiltinOneArgExpr) {
    if (expr.name.toString() == '##' || expr.name.toString() == '(##)') {
      if (expr.arg instanceof NumberExpr) {
        if (fieldType.kind == 'TLBUndefinedType') {
          exprForParam = {
            argLoadExpr: tNumericLiteral(expr.arg.num), 
            argStoreExpr: tNumericLiteral(expr.arg.num), 
            paramType: expr.arg.num <= 63 ? 'number' : 'bigint', 
            fieldLoadSuffix:  expr.arg.num <= 63 ? 'Uint' : 'UintBig', fieldStoreSuffix: 'Uint'
          }
        } 
        
      }
      if (expr.arg instanceof NameExpr) {
        let parameter = constructor.parametersMap.get(expr.arg.name)
        if (!parameter) {
          throw new Error('')
        }
        if (fieldType.kind == 'TLBUndefinedType') {
          exprForParam = {
            argLoadExpr: getParamVarExpr(parameter, constructor), 
            argStoreExpr: tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier(goodVariableName(expr.arg.name))), 
            paramType: 'bigint', fieldLoadSuffix: 'UintBig', fieldStoreSuffix: 'Uint'
          }
        }
        
      } // TODO: handle other cases
    } else if (expr.name == '#<') {
      if (expr.arg instanceof NumberExpr || expr.arg instanceof NameExpr) {
        if (fieldType.kind == 'TLBUndefinedType') {
          exprForParam = {
            argLoadExpr: tFunctionCall(tIdentifier('bitLen'), [tBinaryExpression(convertToAST(convertToMathExpr(expr.arg), constructor, true), '-', tNumericLiteral(1))]), 
            argStoreExpr: tFunctionCall(tIdentifier('bitLen'), [tBinaryExpression(convertToAST(convertToMathExpr(expr.arg), constructor, true, tIdentifier(variableCombinatorName)), '-', tNumericLiteral(1))]), 
            paramType: 'number', fieldLoadSuffix: 'Uint', fieldStoreSuffix: 'Uint'
          }
        }
      } // TODO: handle other cases
    } else if (expr.name == '#<=') {
      if (expr.arg instanceof NumberExpr || expr.arg instanceof NameExpr) {
        if (fieldType.kind == 'TLBUndefinedType') {
          exprForParam = {
            argLoadExpr: tFunctionCall(tIdentifier('bitLen'), [convertToAST(convertToMathExpr(expr.arg), constructor, true)]), 
            argStoreExpr: tFunctionCall(tIdentifier('bitLen'), [convertToAST(convertToMathExpr(expr.arg), constructor, true, tIdentifier(variableCombinatorName))]), 
            paramType: 'number', fieldLoadSuffix: 'Uint', fieldStoreSuffix: 'Uint'
          }
        }
      } // TODO: handle other cases
    } 
  } else if (expr instanceof CombinatorExpr) {
    if (expr.name == 'int' && expr.args.length == 1 && (expr.args[0] instanceof MathExpr || expr.args[0] instanceof NumberExpr || expr.args[0] instanceof NameExpr)) {
      let myMathExpr = convertToMathExpr(expr.args[0])
      let isSmallInt = (expr.args[0] instanceof NumberExpr && expr.args[0].num <= 63)
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {
          argLoadExpr: convertToAST(myMathExpr, constructor),
          argStoreExpr: convertToAST(myMathExpr, constructor, false, tIdentifier(variableSubStructName)),
          paramType: isSmallInt ? 'number' : 'bigint', 
          fieldLoadSuffix: isSmallInt ? 'Int' : 'IntBig', fieldStoreSuffix: 'Int'
        }
      }
    } else if (expr.name == 'uint' && expr.args.length == 1 && (expr.args[0] instanceof MathExpr || expr.args[0] instanceof NumberExpr || expr.args[0] instanceof NameExpr)) {
      let myMathExpr = convertToMathExpr(expr.args[0])
      let isSmallInt = (expr.args[0] instanceof NumberExpr && expr.args[0].num <= 63)
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {
          argLoadExpr: convertToAST(myMathExpr, constructor),
          argStoreExpr: convertToAST(myMathExpr, constructor, false, tIdentifier(variableSubStructName)),
          paramType: (expr.args[0] instanceof NumberExpr && expr.args[0].num <= 63) ? 'number' : 'bigint', 
          fieldLoadSuffix: isSmallInt ? 'Uint' : 'UintBig', fieldStoreSuffix: 'Uint'
        }
      }
      
    } else if (expr.name == 'bits' && expr.args.length == 1 && (expr.args[0] instanceof MathExpr || expr.args[0] instanceof NumberExpr || expr.args[0] instanceof NameExpr)) {
      let myMathExpr = convertToMathExpr(expr.args[0])
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {
          argLoadExpr: convertToAST(myMathExpr, constructor),
          argStoreExpr: convertToAST(myMathExpr, constructor, false, tIdentifier(variableSubStructName)),
          paramType: 'BitString', fieldLoadSuffix: 'Bits', fieldStoreSuffix: 'Bits'
        }
      }
    } else {
      let typeName = expr.name
      if (fieldType.kind == 'TLBNamedType') {
        typeName = fieldType.name;
      }
      
      let typeExpression: TypeParametersExpression = tTypeParametersExpression([]);
      let loadFunctionsArray: Array<Expression> = []
      let storeFunctionsArray: Array<Expression> = []
      let argIndex = -1;
      if (fieldType.kind == 'TLBNamedType') {
        if (constructor.declaration.combinator.name == 'CombArgCellRef') {
          console.log(util.inspect(fieldType, false, null, true))
        }
        fieldType.arguments.forEach(arg => {
          argIndex++;
          let exprArg = expr.args[argIndex];
          if (exprArg) {
            let subExprInfo = handleType(arg, exprArg, fieldName, false, needArg, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, jsCodeFunctionsDeclarations, fieldTypeName, argIndex, tlbCode, subStructLoadProperties);
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
          }
        })
      } else {
        expr.args.forEach((arg) => {
          argIndex++;
          let subExprInfo = handleType({kind: 'TLBUndefinedType'}, arg, fieldName, false, needArg, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, jsCodeFunctionsDeclarations, fieldTypeName, argIndex, tlbCode, subStructLoadProperties);
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
        });
      }
      result.typeParamExpr = tTypeWithParameters(tIdentifier(typeName), typeExpression);

      let currentTypeParameters = typeExpression;

      let insideLoadParameters: Array<Expression> = [tIdentifier(theSlice)];

      result.loadExpr = tFunctionCall(tIdentifier('load' + typeName), insideLoadParameters.concat(loadFunctionsArray), currentTypeParameters);
      result.storeExpr = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + typeName), insideStoreParameters.concat(storeFunctionsArray), currentTypeParameters), [tIdentifier(theCell)]))
      storeExpr2 = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + typeName), insideStoreParameters2.concat(storeFunctionsArray), currentTypeParameters), [tIdentifier(theCell)]))
    } 
    if (exprForParam) {
      result.typeParamExpr = tIdentifier(exprForParam.paramType);
    }
  } else if (expr instanceof NameExpr) {
    let theNum;
    if (expr.name == 'Int') {
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {argLoadExpr: tNumericLiteral(257), argStoreExpr: tNumericLiteral(257), paramType: 'number', fieldLoadSuffix: 'Int', fieldStoreSuffix: 'Int'}
      }
    } else if (expr.name == 'Bits') {
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {argLoadExpr: tNumericLiteral(1023), argStoreExpr: tNumericLiteral(1023), paramType: 'BitString', fieldLoadSuffix: 'Bits', fieldStoreSuffix: 'Bits'}
      }
    } else if (expr.name == 'Bit') {
      if (fieldType.kind == 'TLBUndefinedType') {
              exprForParam = {argLoadExpr: tNumericLiteral(1), argStoreExpr: tNumericLiteral(1), paramType: 'BitString', fieldLoadSuffix: 'Bits', fieldStoreSuffix: 'Bits'}
      }
    } else if (expr.name == 'Uint') {
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {argLoadExpr: tNumericLiteral(256), argStoreExpr: tNumericLiteral(256), paramType: 'number', fieldLoadSuffix: 'Uint', fieldStoreSuffix: 'Uint'}
      }
    } else if (expr.name == 'Any' || expr.name == 'Cell') {
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {argLoadExpr: tIdentifier(theSlice), argStoreExpr: tIdentifier(theSlice), paramType: 'Slice', fieldLoadSuffix: 'Slice', fieldStoreSuffix: 'Slice'}
      }
    } else if ((theNum = splitForTypeValue(expr.name, 'int')) != undefined) {
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {argLoadExpr: tNumericLiteral(theNum), argStoreExpr: tNumericLiteral(theNum), paramType: 'number', fieldLoadSuffix: 'Int', fieldStoreSuffix: 'Int'}
      }
    } else if ((theNum = splitForTypeValue(expr.name, 'uint')) != undefined) {
      if (fieldType.kind == 'TLBUndefinedType') {
              exprForParam = {argLoadExpr: tNumericLiteral(theNum), argStoreExpr: tNumericLiteral(theNum), paramType: 'number', fieldLoadSuffix: 'Uint', fieldStoreSuffix: 'Uint'}
      }
    } else if ((theNum = splitForTypeValue(expr.name, 'bits')) != undefined) {
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {argLoadExpr: tNumericLiteral(theNum), argStoreExpr: tNumericLiteral(theNum), paramType: 'BitString', fieldLoadSuffix: 'Bits', fieldStoreSuffix: 'Bits'}
      }
    } else if (expr.name == 'Bool') {
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {argLoadExpr: undefined, argStoreExpr: undefined, paramType: 'boolean', fieldLoadSuffix: 'Boolean', fieldStoreSuffix: 'Bit'}
      }
    } else if (expr.name == 'MsgAddressInt') {
      if (fieldType.kind == 'TLBUndefinedType') {
        exprForParam = {argLoadExpr: undefined, argStoreExpr: undefined, paramType: 'Address', fieldLoadSuffix: 'Address', fieldStoreSuffix: 'Address'}
      }
    } else {
      let typeName = expr.name
      if (fieldType.kind == 'TLBNamedType') {
        typeName = fieldType.name;
      }

      if (constructor.variablesMap.get(typeName)?.type == '#') {
        result.loadExpr = getVarExprByName(typeName, constructor)
        result.storeExpr = tExpressionStatement(result.loadExpr);
      } else {
        
        result.typeParamExpr = tIdentifier(typeName);
        if (isField) {
          result.loadExpr = tFunctionCall(tIdentifier('load' + typeName), [tIdentifier(theSlice)])
          result.storeExpr = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + typeName), insideStoreParameters), [tIdentifier(currentCell)]))
          storeExpr2 = tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + typeName), insideStoreParameters2), [tIdentifier(currentCell)]))
        } else {
          result.loadExpr = tIdentifier('load' + typeName)
          result.storeExpr = tExpressionStatement(tIdentifier('store' + typeName))
        }
      }
    }
    if (exprForParam) {
      result.typeParamExpr = tIdentifier(exprForParam.paramType)
    }
  } else if (expr instanceof NumberExpr) {
    result.loadExpr = tNumericLiteral(expr.num)
  } else if (expr instanceof NegateExpr && expr.expr instanceof NameExpr) { // TODO: handle other case
    let getParameterFunctionId = tIdentifier(variableSubStructName + '_get_' + expr.expr.name)
    jsCodeFunctionsDeclarations.push(tFunctionDeclaration(getParameterFunctionId, tTypeParametersExpression([]), tIdentifier('number'), [tTypedIdentifier(tIdentifier(goodVariableName(fieldName)), tIdentifier(fieldTypeName))], getNegationDerivationFunctionBody(tlbCode, fieldTypeName, argIndex, fieldName)))
    result.negatedVariablesLoads.push({name: expr.expr.name, expression: tFunctionCall(getParameterFunctionId, [tIdentifier(goodVariableName(fieldName))])})
  } else if (expr instanceof CellRefExpr) {
    let currentSlice = getCurrentSlice([1, 0], 'slice');
    let currentCell = getCurrentSlice([1, 0], 'cell');

    let subExprInfo = handleType(fieldType, expr.expr, fieldName, true, true, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, jsCodeFunctionsDeclarations, fieldTypeName, argIndex, tlbCode, subStructLoadProperties);
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
  } else if (expr instanceof MathExpr) {
    if (fieldTypeName == '') {
      if (expr.op == '*') {
        let arrayLength = convertToAST(convertToMathExpr(expr.left), constructor, true);
        let subExprInfo = handleType(fieldType, expr.right, fieldName, false, needArg, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, jsCodeFunctionsDeclarations, fieldTypeName, argIndex, tlbCode, subStructLoadProperties);
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
      } else {
        throw new Error('')
      }
    } else {
      result.loadExpr = convertToAST(convertToMathExpr(expr), constructor, true);
      result.storeExpr = tExpressionStatement(result.loadExpr);
    }
  } else if (expr instanceof CondExpr) {
    let subExprInfo = handleType(fieldType, expr.condExpr, fieldName, true, false, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, jsCodeFunctionsDeclarations, fieldTypeName, argIndex, tlbCode, subStructLoadProperties);
    if (subExprInfo.typeParamExpr) {
      result.typeParamExpr = tUnionTypeExpression([subExprInfo.typeParamExpr, tIdentifier('undefined')])
    }
    if (subExprInfo.loadExpr) {
      let conditionExpr: Expression;
      if (expr.left instanceof NameExpr) {
        conditionExpr = convertToAST(convertToMathExpr(expr.left), constructor, true)
        if (expr.dotExpr != null) {
          conditionExpr = tBinaryExpression(conditionExpr, '&', tBinaryExpression(tNumericLiteral(1), '<<', tNumericLiteral(expr.dotExpr)))
        }
      } else { // TODO: handle other cases
        throw new Error('')
      }
      result.loadExpr = tTernaryExpression(conditionExpr, subExprInfo.loadExpr, tIdentifier('undefined'))
    }
    let currentParam = insideStoreParameters[0]
    let currentParam2 = insideStoreParameters2[0]
    if (currentParam && currentParam2 && subExprInfo.storeExpr) {
      result.storeExpr = tIfStatement(tBinaryExpression(currentParam, '!=', tIdentifier('undefined')), [subExprInfo.storeExpr])
      storeExpr2 = tIfStatement(tBinaryExpression(currentParam2, '!=', tIdentifier('undefined')), [subExprInfo.storeExpr])
    }
  } else { // TODO: handle other cases
    throw new Error('Expression not supported: ' + expr);
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
