import { BuiltinZeroArgs, FieldCurlyExprDef, FieldNamedDef, Program, Declaration, BuiltinOneArgExpr, NumberExpr, NameExpr, CombinatorExpr, FieldBuiltinDef, MathExpr, SimpleExpr, NegateExpr, CellRefExpr, FieldDefinition, FieldAnonymousDef, CondExpr, CompareExpr, Expression as ParserExpression, Constructor } from '../../src/ast/nodes'
import { TLBMathExpr, TLBVarExpr, TLBNumberExpr, TLBBinaryOp, TLBCode, TLBType, TLBConstructor, TLBParameter, TLBVariable, TLBConstructorTag } from './ast'
import { fillConstructors } from './utils'
import { CodeBuilder } from './generators/CodeBuilder'
import { CodeGenerator, CommonGenDeclaration } from './generators/generator'
import { TypescriptGenerator } from './generators/typescript/generator'

export function generate(tree: Program, input: string) {
  let tlbCode: TLBCode = { types: new Map<string, TLBType>() }

  let splittedInput = input.split('\n')

  fillConstructors(tree.declarations, tlbCode, splittedInput);
  
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

  tlbCode.types.forEach((tlbType: TLBType) => { codeGenerator.addTlbType(tlbType, tlbCode) });

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