import { BuiltinZeroArgs, FieldCurlyExprDef, FieldNamedDef, Program, Declaration, BuiltinOneArgExpr, NumberExpr, NameExpr, CombinatorExpr, FieldBuiltinDef, MathExpr, SimpleExpr, NegateExpr, CellRefExpr, FieldDefinition, FieldAnonymousDef, CondExpr, CompareExpr, Expression as ParserExpression, Constructor } from '../../src/ast/nodes'
import { TLBMathExpr, TLBVarExpr, TLBNumberExpr, TLBBinaryOp, TLBCode, TLBType, TLBConstructor, TLBParameter, TLBVariable, TLBConstructorTag, TLBCodeNew } from './ast'
import { convertToReadonly, fillConstructors } from './utils'
import { CodeBuilder } from './generators/CodeBuilder'
import { CodeGenerator, CommonGenDeclaration } from './generators/generator'
import { TypescriptGenerator } from './generators/typescript/generator'

export function generate(tree: Program, input: string) {
  let oldTlbCode: TLBCode = { types: new Map<string, TLBType>() }

  let splittedInput = input.split('\n')

  fillConstructors(tree.declarations, oldTlbCode, splittedInput);
  let tlbCode: TLBCodeNew = convertToReadonly(oldTlbCode)

  let codeGenerator: CodeGenerator = new TypescriptGenerator(tlbCode);
  
  codeGenerator.addTonCoreClassUsage('Builder')
  codeGenerator.addTonCoreClassUsage('Slice')
  codeGenerator.addTonCoreClassUsage('beginCell')
  codeGenerator.addTonCoreClassUsage('BitString')
  codeGenerator.addTonCoreClassUsage('Cell')
  codeGenerator.addTonCoreClassUsage('Address')

  codeGenerator.addBitLenFunction();

  let jsCodeDeclarations: CommonGenDeclaration[] = []
  codeGenerator.jsCodeDeclarations.forEach(declaration => {
    jsCodeDeclarations.push(declaration)
  })

  tlbCode.types.forEach((tlbType: TLBType) => { codeGenerator.addTlbType(tlbType) });

  let generatedCode = ''

  codeGenerator.jsCodeConstructorDeclarations.forEach(element => {
    jsCodeDeclarations.push(element)
  });

  codeGenerator.jsCodeFunctionsDeclarations.forEach(element => {
    jsCodeDeclarations.push(element)
  });

  jsCodeDeclarations.forEach(element => {
    generatedCode += codeGenerator.toCode(element, new CodeBuilder()).render() + '\n';
  });

  return generatedCode;
}