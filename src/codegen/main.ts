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

  tlbCode.types.forEach((tlbType: TLBType) => {
    let variableCombinatorName = goodVariableName(firstLower(tlbType.name), '0')
    let subStructsUnion: TypeExpression[] = []
    let subStructDeclarations: StructDeclaration[] = []

    let loadStatements: Statement[] = []
    let storeStatements: Statement[] = []

    let structTypeParametersExpr: TypeParametersExpression = tTypeParametersExpression([]);

    tlbType.constructors.forEach(constructor => {
      let constructorLoadStatements: Statement[] = []
      let declaration = constructor.declaration;
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
            subStructLoadProperties.push(tObjectProperty(tIdentifier(goodVariableName(variable.name)), convertToAST(variable.deriveExpr, constructor)));
          }
        }
      })

      let fieldIndex = 0;
      declaration?.fields.forEach(element => { handleField(element, slicePrefix, tlbCode, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations, fieldIndex.toString()); fieldIndex++; })

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
            let argName = goodVariableName(param.variable.name);
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

      jsCodeFunctionsDeclarations.push(tComment(getStringDeclaration(constructor.declaration, splittedInput)))

    });


    // loadTheType: (slice: Slice) => TheType

    let exceptionTypesComment = tlbType.constructors.map(constructor => {return `"${getSubStructName(tlbType, constructor)}"`}).join(', ')
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
          loadFunctionParameters.push(tTypedIdentifier(tIdentifier('load' + element.variable.name), tArrowFunctionType([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], tIdentifier(goodVariableName(element.variable.name)))))

          storeFunctionParameters.push(
            tTypedIdentifier(tIdentifier('store' + element.variable.name),
              tArrowFunctionType(
                [tTypedIdentifier(tIdentifier(goodVariableName(firstLower(element.variable.name), '0')), tIdentifier(goodVariableName(element.variable.name)))],
                tArrowFunctionType([tTypedIdentifier(tIdentifier('builder'), tIdentifier('Builder'))], tIdentifier('void')))))
        }
        if (element.variable.type == '#' && !element.variable.negated) {
          if (element.argName) {
            loadFunctionParameters.push(tTypedIdentifier(tIdentifier(element.argName), tIdentifier('number')))
          } else {
            loadFunctionParameters.push(tTypedIdentifier(tIdentifier(goodVariableName(element.variable.name)), tIdentifier('number')))
          }
        }
      });
    }

    let loadFunction = tFunctionDeclaration(tIdentifier('load' + tlbType.name), structTypeParametersExpr, tTypeWithParameters(tIdentifier(tlbType.name), structTypeParametersExpr), loadFunctionParameters, loadStatements);

    let storeFunction = tFunctionDeclaration(tIdentifier('store' + tlbType.name), structTypeParametersExpr, tIdentifier('(builder: Builder) => void'), storeFunctionParameters, storeStatements)

    if (tlbType.constructors.length > 1) {
      let unionTypeDecl = tUnionTypeDeclaration(tTypeWithParameters(tIdentifier(tlbType.name), structTypeParametersExpr), tUnionTypeExpression(subStructsUnion))
      jsCodeConstructorDeclarations.push(unionTypeDecl)
    }
    subStructDeclarations.forEach(element => {
      jsCodeConstructorDeclarations.push(element)
    });

    jsCodeFunctionsDeclarations.push(loadFunction)
    jsCodeFunctionsDeclarations.push(storeFunction)
  });

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