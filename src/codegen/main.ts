import { BuiltinZeroArgs, FieldCurlyExprDef, FieldNamedDef, Program, Declaration, BuiltinOneArgExpr, NumberExpr, NameExpr, CombinatorExpr, FieldBuiltinDef, MathExpr, SimpleExpr, NegateExpr, CellRefExpr, FieldDefinition, FieldAnonymousDef, CondExpr, CompareExpr, Expression as ParserExpression, Constructor } from '../../src/ast/nodes'
import { tIdentifier, tArrowFunctionExpression, tArrowFunctionType, tBinaryExpression, tBinaryNumericLiteral, tDeclareVariable, tExpressionStatement, tFunctionCall, tFunctionDeclaration, tIfStatement, tImportDeclaration, tMemberExpression, tNumericLiteral, tObjectExpression, tObjectProperty, tReturnStatement, tStringLiteral, tStructDeclaration, tTypeParametersExpression, tTypeWithParameters, tTypedIdentifier, tUnionTypeDeclaration, toCode, GenDeclaration, TypeWithParameters, ArrowFunctionExpression, tUnionTypeExpression, tUnaryOpExpression, StructDeclaration, FunctionDeclaration, tComment } from './generators/typescript/tsgen'
import { TLBMathExpr, TLBVarExpr, TLBNumberExpr, TLBBinaryOp, TLBCode, TLBType, TLBConstructor, TLBParameter, TLBVariable, TLBConstructorTag } from './ast'
import { Expression, Statement, Identifier, BinaryExpression, ASTNode, TypeExpression, TypeParametersExpression, ObjectProperty, TypedIdentifier } from './generators/typescript/tsgen'
import { fillConstructors, firstLower, getCurrentSlice, bitLen, convertToMathExpr, splitForTypeValue, deriveMathExpression, getStringDeclaration } from './utils'
import { getCondition } from "./generators/typescript/utils"
import { getTypeParametersExpression } from "./generators/typescript/utils"
import { convertToAST } from "./generators/typescript/utils"
import { constructorNodes } from '../parsing'
import { handleType } from './type_handler'
import { handleField } from './field_handler'
import { getParamVarExpr } from './generators/typescript/utils'
import { getSubStructName } from './utils'
import { goodVariableName } from './utils'
import { CodeBuilder } from './generators/CodeBuilder'
import { CodeGenerator } from './generators/generator'
import { TypescriptGenerator } from './generators/typescript/generator'

export function generate(tree: Program, input: string) {
  let codeGenerator: CodeGenerator = new TypescriptGenerator();
  
  codeGenerator.addTonCoreClassUsage('Builder')
  codeGenerator.addTonCoreClassUsage('Slice')
  codeGenerator.addTonCoreClassUsage('beginCell')
  codeGenerator.addTonCoreClassUsage('BitString')
  codeGenerator.addTonCoreClassUsage('Cell')
  codeGenerator.addTonCoreClassUsage('Address')

  codeGenerator.addBitLenFunction();

  let jsCodeDeclarations: GenDeclaration[] = []
  codeGenerator.jsCodeDeclarations.forEach(declaration => {
    jsCodeDeclarations.push(declaration)
  })

  let jsCodeConstructorDeclarations: GenDeclaration[] = []
  let jsCodeFunctionsDeclarations: GenDeclaration[] = []


  let tlbCode: TLBCode = { types: new Map<string, TLBType>() }

  let splittedInput = input.split('\n')
  
  fillConstructors(tree.declarations, tlbCode, splittedInput);

  tlbCode.types.forEach((tlbType: TLBType) => { codeGenerator.addTlbType(tlbType, tlbCode, splittedInput, jsCodeConstructorDeclarations, jsCodeFunctionsDeclarations) });

  let generatedCode = ''

  jsCodeConstructorDeclarations.forEach(element => {
    jsCodeDeclarations.push(element)
  });

  jsCodeFunctionsDeclarations.forEach(element => {
    jsCodeDeclarations.push(element)
  });

  jsCodeDeclarations.forEach(element => {
    generatedCode += toCode(element, new CodeBuilder()).render() + '\n';
  });
  return generatedCode;
}