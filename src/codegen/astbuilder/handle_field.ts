import { BuiltinOneArgExpr, BuiltinZeroArgs, CellRefExpr, CombinatorExpr, CondExpr, FieldExprDef, FieldNamedDef, MathExpr, NameExpr, NegateExpr, NumberExpr, Expression as ParserExpression } from "../../ast/nodes";
import { TLBBinaryOp, TLBCode, TLBConstructor, TLBField, TLBFieldType, TLBMathExpr, TLBNumberExpr, TLBNumberType, TLBType, TLBUnaryOp, TLBVarExpr } from "../ast";
import { GenDeclaration, ObjectProperty } from "../generators/typescript/tsgen";
import { convertToMathExpr, firstLower, getSubStructName, goodVariableName, splitForTypeValue } from "../utils";

export function getType(expr: ParserExpression, fieldName: string, isField: boolean, needArg: boolean, variableCombinatorName: string, variableSubStructName: string, constructor: TLBConstructor, fieldTypeName: string, argIndex: number, tlbCode: TLBCode): TLBFieldType {
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
        return { kind: 'TLBNamedType', name: expr.name, arguments: argumentTypes}
      } 
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
          return {kind: 'TLBExprMathType', expr: new TLBVarExpr(expr.name)}
        } else {
          return {kind: 'TLBNamedType', name: expr.name, arguments: []}
        }
      }
    } else if (expr instanceof NumberExpr) {
      return {kind: 'TLBExprMathType', expr: new TLBNumberExpr(expr.num)}
    } else if (expr instanceof NegateExpr && expr.expr instanceof NameExpr) { // TODO: handle other case
      return {kind: 'TLBNegatedType', variableName: expr.expr.name}
    } else if (expr instanceof CellRefExpr) {
      let subExprInfo = getType(expr.expr, fieldName, true, true, variableCombinatorName, variableSubStructName, constructor, fieldTypeName, argIndex, tlbCode);
      return {kind: 'TLBCellInsideType', value: subExprInfo}
    } else if (expr instanceof MathExpr) {
      if (fieldTypeName == '') {
        if (expr.op == '*') {
          let subExprInfo = getType(expr.right, fieldName, false, needArg, variableCombinatorName, variableSubStructName, constructor, fieldTypeName, argIndex, tlbCode)
          return {kind: 'TLBMultipleType', times: convertToMathExpr(expr.left), value: subExprInfo}
        } else {
          throw new Error('')
        }
      } else {
        return {kind: 'TLBExprMathType', expr: convertToMathExpr(expr)}
      }
    } else if (expr instanceof CondExpr) {
      let subExprInfo = getType(expr.condExpr, fieldName, true, false, variableCombinatorName, variableSubStructName, constructor, fieldTypeName, argIndex, tlbCode);
      if (expr.left instanceof NameExpr) {
        let condition: TLBMathExpr =  convertToMathExpr(expr.left);
        if (expr.dotExpr != null) {
          condition = new TLBBinaryOp(condition, new TLBBinaryOp(new TLBNumberExpr(1), new TLBNumberExpr(expr.dotExpr), '<<'), '&')
        }
        return {kind: 'TLBCondType', value: subExprInfo, condition: condition}
      } 
    } else {
      throw new Error('Expression not supported: ' + expr);
    }
    throw new Error('Type unknown')
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