import { BuiltinOneArgExpr, BuiltinZeroArgs, CellRefExpr, CombinatorExpr, CondExpr, MathExpr, NameExpr, NegateExpr, NumberExpr, Expression as ParserExpression } from "../../ast/nodes";
import { TLBBinaryOp, TLBCode, TLBConstructor, TLBFieldType, TLBMathExpr, TLBNumberExpr, TLBUnaryOp, TLBVarExpr } from "../ast";
import { convertToMathExpr, splitForTypeValue } from "../utils";


export function getType(expr: ParserExpression, fieldName: string, isField: boolean, needArg: boolean, variableCombinatorName: string, variableSubStructName: string, constructor: TLBConstructor, fieldTypeName: string, argIndex: number, tlbCode: TLBCode): TLBFieldType {
  if (expr instanceof BuiltinZeroArgs) {
    if (expr.name == '#') {
      return { kind: 'TLBNumberType', bits: new TLBNumberExpr(32), storeBits: new TLBNumberExpr(32), signed: false, maxBits: 32 };
    } else {
      throw new Error('Expression not supported' + expr);
    }
  } else if (expr instanceof BuiltinOneArgExpr) {
    if (expr.name.toString() == '##' || expr.name.toString() == '(##)') {
      if (expr.arg instanceof NumberExpr) {
        return { kind: 'TLBNumberType', bits: new TLBNumberExpr(expr.arg.num), storeBits: new TLBNumberExpr(expr.arg.num), signed: false, maxBits: expr.arg.num };
      }
      if (expr.arg instanceof NameExpr) {
        let parameter = constructor.parametersMap.get(expr.arg.name);
        if (!parameter || !parameter.variable.deriveExpr || !parameter.variable.initialExpr) {
          throw new Error('');
        }
        return { kind: 'TLBNumberType', bits: parameter.variable.deriveExpr, storeBits: parameter.variable.initialExpr, signed: false, maxBits: undefined };
      } // TODO: handle other cases
    } else if (expr.name == '#<') {
      if (expr.arg instanceof NumberExpr || expr.arg instanceof NameExpr) {
        let bits = new TLBUnaryOp(new TLBBinaryOp(convertToMathExpr(expr.arg), new TLBNumberExpr(1), '-'), '.');
        return { kind: 'TLBNumberType', bits: bits, storeBits: bits, signed: false, maxBits: 32 };
      } // TODO: handle other cases
    } else if (expr.name == '#<=') {
      if (expr.arg instanceof NumberExpr || expr.arg instanceof NameExpr) {
        let bits = new TLBUnaryOp(convertToMathExpr(expr.arg), '.');
        return { kind: 'TLBNumberType', bits: bits, storeBits: bits, signed: false, maxBits: 32 };
      } // TODO: handle other cases
    }
  } else if (expr instanceof CombinatorExpr) {
    if (expr.name == 'int' && expr.args.length == 1 && (expr.args[0] instanceof MathExpr || expr.args[0] instanceof NumberExpr || expr.args[0] instanceof NameExpr)) {
      return { kind: 'TLBNumberType', bits: convertToMathExpr(expr.args[0]), storeBits: convertToMathExpr(expr.args[0]), signed: true, maxBits: undefined };
    } else if (expr.name == 'uint' && expr.args.length == 1 && (expr.args[0] instanceof MathExpr || expr.args[0] instanceof NumberExpr || expr.args[0] instanceof NameExpr)) {
      return { kind: 'TLBNumberType', bits: convertToMathExpr(expr.args[0]), storeBits: convertToMathExpr(expr.args[0]), signed: false, maxBits: undefined };
    } else if (expr.name == 'bits' && expr.args.length == 1 && (expr.args[0] instanceof MathExpr || expr.args[0] instanceof NumberExpr || expr.args[0] instanceof NameExpr)) {
      return { kind: 'TLBBitsType', bits: convertToMathExpr(expr.args[0]) };
    } else {
      let argumentTypes: TLBFieldType[] = [];
      expr.args.forEach((arg) => {
        let thefield = getType(arg, fieldName, false, needArg, variableCombinatorName, variableSubStructName, constructor, fieldTypeName, argIndex, tlbCode);
        argumentTypes.push(thefield);
      });
      return { kind: 'TLBNamedType', name: expr.name, arguments: argumentTypes };
    }
  } else if (expr instanceof NameExpr) {
    let theNum;
    if (expr.name == 'Int') {
      return { kind: 'TLBNumberType', bits: new TLBNumberExpr(257), storeBits: new TLBNumberExpr(257), signed: true, maxBits: 257 };
    } else if (expr.name == 'Bits') {
      return { kind: 'TLBBitsType', bits: new TLBNumberExpr(1023) };
    } else if (expr.name == 'Bit') {
      return { kind: 'TLBBitsType', bits: new TLBNumberExpr(1) };
    } else if (expr.name == 'Uint') {
      return { kind: 'TLBNumberType', bits: new TLBNumberExpr(257), storeBits: new TLBNumberExpr(257), signed: false, maxBits: 257 };
    } else if (expr.name == 'Any' || expr.name == 'Cell') {
      return { kind: 'TLBCellType' };
    } else if ((theNum = splitForTypeValue(expr.name, 'int')) != undefined) {
      return { kind: 'TLBNumberType', bits: new TLBNumberExpr(theNum), storeBits: new TLBNumberExpr(theNum), signed: true, maxBits: theNum };
    } else if ((theNum = splitForTypeValue(expr.name, 'uint')) != undefined) {
      return { kind: 'TLBNumberType', bits: new TLBNumberExpr(theNum), storeBits: new TLBNumberExpr(theNum), signed: false, maxBits: theNum };
    } else if ((theNum = splitForTypeValue(expr.name, 'bits')) != undefined) {
      return { kind: 'TLBBitsType', bits: new TLBNumberExpr(theNum) };
    } else if (expr.name == 'Bool') {
      return { kind: 'TLBBoolType' };
    } else if (expr.name == 'MsgAddressInt') {
      return { kind: 'TLBAddressType' };
    } else {
      if (constructor.variablesMap.get(expr.name)?.type == '#') {
        return { kind: 'TLBExprMathType', expr: new TLBVarExpr(expr.name) };
      } else {
        return { kind: 'TLBNamedType', name: expr.name, arguments: [] };
      }
    }
  } else if (expr instanceof NumberExpr) {
    return { kind: 'TLBExprMathType', expr: new TLBNumberExpr(expr.num) };
  } else if (expr instanceof NegateExpr && expr.expr instanceof NameExpr) { // TODO: handle other case
    return { kind: 'TLBNegatedType', variableName: expr.expr.name };
  } else if (expr instanceof CellRefExpr) {
    let subExprInfo = getType(expr.expr, fieldName, true, true, variableCombinatorName, variableSubStructName, constructor, fieldTypeName, argIndex, tlbCode);
    return { kind: 'TLBCellInsideType', value: subExprInfo };
  } else if (expr instanceof MathExpr) {
    if (fieldTypeName == '') {
      if (expr.op == '*') {
        let subExprInfo = getType(expr.right, fieldName, false, needArg, variableCombinatorName, variableSubStructName, constructor, fieldTypeName, argIndex, tlbCode);
        return { kind: 'TLBMultipleType', times: convertToMathExpr(expr.left), value: subExprInfo };
      } else {
        throw new Error('');
      }
    } else {
      return { kind: 'TLBExprMathType', expr: convertToMathExpr(expr) };
    }
  } else if (expr instanceof CondExpr) {
    let subExprInfo = getType(expr.condExpr, fieldName, true, false, variableCombinatorName, variableSubStructName, constructor, fieldTypeName, argIndex, tlbCode);
    if (expr.left instanceof NameExpr) {
      let condition: TLBMathExpr = convertToMathExpr(expr.left);
      if (expr.dotExpr != null) {
        condition = new TLBBinaryOp(condition, new TLBBinaryOp(new TLBNumberExpr(1), new TLBNumberExpr(expr.dotExpr), '<<'), '&');
      }
      return { kind: 'TLBCondType', value: subExprInfo, condition: condition };
    }
  } else {
    throw new Error('Expression not supported: ' + expr);
  }
  throw new Error('Type unknown');
}
