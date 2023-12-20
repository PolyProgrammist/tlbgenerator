import { BuiltinZeroArgs, FieldCurlyExprDef, FieldNamedDef, Program, Declaration, BuiltinOneArgExpr, NumberExpr, NameExpr, CombinatorExpr, FieldBuiltinDef, MathExpr, SimpleExpr, NegateExpr, CellRefExpr, FieldDefinition, FieldAnonymousDef, CondExpr, CompareExpr, Expression as ParserExpression } from '../../src/ast/nodes'
import { tIdentifier, tArrowFunctionExpression, tArrowFunctionType, tBinaryExpression, tBinaryNumericLiteral, tDeclareVariable, tExpressionStatement, tFunctionCall, tFunctionDeclaration, tIfStatement, tImportDeclaration, tMemberExpression, tNumericLiteral, tObjectExpression, tObjectProperty, tReturnStatement, tStringLiteral, tStructDeclaration, tTypeParametersExpression, tTypeWithParameters, tTypedIdentifier, tUnionTypeDeclaration, toCode, TypeWithParameters, ArrowFunctionExpression, tForCycle } from './tsgen'
import { TLBMathExpr, TLBVarExpr, TLBNumberExpr, TLBBinaryOp, TLBCode, TLBType, TLBConstructor, TLBParameter, TLBVariable } from './ast'
import { Expression, Statement, Identifier, BinaryExpression, ASTNode, TypeExpression, TypeParametersExpression, ObjectProperty, TypedIdentifier } from './tsgen'
import { fillConstructors, firstLower, getTypeParametersExpression, getCurrentSlice, bitLen, convertToAST, convertToMathExpr, getCondition, splitForTypeValue, deriveMathExpression, getStringDeclaration } from './util'
import { constructorNodes } from '../parsing'
import { handleType } from './type_handler'
import * as crc32 from 'crc-32';


export function isBadVarName(name: string): boolean {
  let tsReserved = [
    'abstract',	'arguments',	'await',	'boolean',
    'break',	'byte',	'case',	'catch',
    'char',	'class',	'const',	'continue',
    'debugger',	'default',	'delete',	'do',
    'double',	'else',	'enum',	'eval',
    'export',	'extends', 'false',	'final',
    'finally',	'float',	'for',	'function',
    'goto',	'if',	'implements',	'import',
    'in',	'instanceof',	'int',	'interface',
    'let',	'long',	'native',	'new',
    'null',	'package',	'private',	'protected',
    'public',	'return',	'short',	'static',
    'super',	'switch',	'synchronized',	'this',
    'throw', 'throws',	'transient',	'true',
    'try',	'typeof',	'var',	'void',
    'volatile',	'while',	'with',	'yield'
  ]
  if (tsReserved.includes(name)) {
    return true;
  }
  if (name.startsWith('slice')) {
    return true;
  }
  if (name.startsWith('cell')) {
    return true;
  }
  if (name == 'builder') {
    return true;
  }
  return false;
}

export function goodVariableName(name: string, possibleSuffix: string = '0'): string {
  if (name.startsWith('slice') || name.startsWith('cell')) {
    name = '_' + name;
  }
  while (isBadVarName(name)) {
    name += possibleSuffix;
  }
  return name;
}

export function sliceLoad(slicePrefix: number[], currentSlice: string) {
  return tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'slice')),
    tFunctionCall(tMemberExpression(
      tFunctionCall(tMemberExpression(
        tIdentifier(currentSlice), tIdentifier('loadRef')
      ), []),
      tIdentifier('beginParse')
    ), []),))
}

export function simpleCycle(varName: string, finish: Expression) : Statement {
  return tForCycle(tDeclareVariable(tIdentifier(varName), tNumericLiteral(0)), tBinaryExpression(tIdentifier(varName), '<', finish), tNumericLiteral(5), [])
}

export function getSubStructName(tlbType: TLBType, constructor: TLBConstructor): string {
  if (tlbType.constructors.length > 1) {
    return tlbType.name + '_' + constructor.name;
  } else {
    return tlbType.name;
  }
}

export function getParamVarExpr(param: TLBParameter, constructor: TLBConstructor): Expression {
  if (param.variable.deriveExpr) {
    return convertToAST(param.variable.deriveExpr, constructor);
  } else {
    return tIdentifier('')
  }
}

export function getVarExprByName(name: string, constructor: TLBConstructor): Expression {
  let variable = constructor.variablesMap.get(name)
  if (variable?.deriveExpr) {
    return convertToAST(variable.deriveExpr, constructor);
  }
  return tIdentifier(name)
}

export function getNegationDerivationFunctionBody(tlbCode: TLBCode, typeName: string, parameterIndex: number, parameterName: string): Statement[] {
  let result: Statement[] = [];
  let tlbType: TLBType | undefined = tlbCode.types.get(typeName);
  tlbType?.constructors.forEach(constructor => {
    if (tlbType != undefined) {
      let parameter = constructor.parameters[parameterIndex];
      if (parameter) {
        let getExpression: Expression;
        getExpression = convertToAST(parameter.paramExpr, constructor);
        let statements = [];
        if (!parameter.variable.const) {
          statements.push(tExpressionStatement(tDeclareVariable(tIdentifier(parameter.variable.name), tMemberExpression(tIdentifier(parameterName), tIdentifier(parameter.variable.name)))));
        }
        statements.push(tReturnStatement(getExpression));
        result.push(tIfStatement(tBinaryExpression(tMemberExpression(tIdentifier(parameterName), tIdentifier('kind')), '==', tStringLiteral(getSubStructName(tlbType, constructor))), statements))
      }
    }
  });

  if (tlbType) {
    let exceptionTypesComment = tlbType.constructors.map(constructor => {return `"${tlbType ? getSubStructName(tlbType, constructor) : ''}"`}).join(', ')
    let exceptionComment = tExpressionStatement(tIdentifier("throw new Error('" + `Expected one of ${exceptionTypesComment} for type "${tlbType.name}" while getting "${parameterName}", but data does not satisfy any constructor` + "')"))
    result.push(exceptionComment)
  }

  return result;
}

export function addLoadProperty(name: string, loadExpr: Expression, typeExpr: TypeExpression | undefined, constructorLoadStatements: Statement[], subStructLoadProperties: ObjectProperty[]) {
  let nameId = tIdentifier(name);
  constructorLoadStatements.push(tExpressionStatement(tDeclareVariable(nameId, loadExpr, typeExpr)))
  subStructLoadProperties.push(tObjectProperty(nameId, nameId))
}

export function calculateOpcode(declaration: Declaration, input: string[]): string {
    let scheme = getStringDeclaration(declaration, input)
    let constructor = scheme.substring(0, scheme.indexOf(' '));
    const rest = scheme.substring(scheme.indexOf(' '));
    if (constructor.includes('#')) {
        constructor = constructor.substring(0, constructor.indexOf('#'));
    }
    scheme = 
        constructor +
            ' ' +
            rest
                .replace(/\(/g, '')
                .replace(/\)/g, '')
                .replace(/\s+/g, ' ')
                .replace(/;/g, '')
                .trim()
    return (BigInt(crc32.str(scheme)) & BigInt(0x7fffffff)).toString(16);
}