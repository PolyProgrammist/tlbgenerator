import fs from 'fs'
import path from 'path'
import util from 'util'

import { parse } from '../src'
import { ast } from '../src'
import { BuiltinZeroArgs, FieldNamedDef, Program, Declaration, BuiltinOneArgExpr, NumberExpr, NameExpr, CombinatorExpr, FieldBuiltinDef } from '../src/ast/nodes'

import { parse as parseBabel } from "@babel/parser";
import generate from "@babel/generator";
// import { expressionStatement } from '@babel/types'
import { ExportNamedDeclaration, ExpressionStatement as BabelExpressionStatement, Identifier as BabelIdentifier, ObjectProperty as BabelObjectProperty, TSPropertySignature, TSTypeReference, anyTypeAnnotation, arrowFunctionExpression, blockStatement, callExpression, exportNamedDeclaration, expressionStatement, functionDeclaration, identifier, importDeclaration, importSpecifier, memberExpression, numericLiteral, objectExpression, objectProperty, returnStatement, stringLiteral, tsPropertySignature, tsTypeAliasDeclaration, tsTypeAnnotation, tsTypeLiteral, tsTypeReference, tsUnionType, typeAnnotation, MemberExpression as BabelMemberExpression, typeParameter, tsLiteralType} from '@babel/types'

const fixturesDir = path.resolve(__dirname, 'fixtures')

function typedIdentifier(id: string, typeId: string): BabelIdentifier {
  let param = identifier(id)
  param.typeAnnotation = tsTypeAnnotation(tsTypeReference(identifier(typeId)))
  return param;
}

interface ASTNode {
  type: Node["type"];
}

interface Identifier extends ASTNode {
  type: "Identifier",
  name: String
}

interface TypeWithParameters extends ASTNode {
  type: "TypeWithParameters",
  name: Identifier,
  typeParameters: TypeParametersExpression
}

interface NumericLiteral extends ASTNode {
  type: "NumericLiteral",
  value: number
}

interface BinaryNumericLiteral extends ASTNode {
  type: "BinaryNumericLiteral",
  value: number
}

interface ImportDeclaration extends ASTNode {
  type: "ImportDeclaration",
  importValue: Identifier,
  from: String
}

interface FunctionDeclaration extends ASTNode {
  type: "FunctionDeclaration",
  name: Identifier,
  typeParameters: TypeParametersExpression,
  returnType: TypeExpression | null,
  parameters: Array<TypedIdentifier>;
  body: Array<Statement>;
}

interface TypedIdentifier extends ASTNode {
  type: "TypedIdentifier",
  name: Identifier,
  typeId: TypeExpression
}

interface TypeParametersExpression extends ASTNode {
  type: "TypeParametersExpression",
  typeParameters: Array<Identifier>
}

interface StructDeclaration extends ASTNode {
  type: "StructDeclaration",
  name: Identifier,
  fields: Array<TypedIdentifier>,
  typeParametersExpression: TypeParametersExpression
}

interface UnionTypeDeclaration extends ASTNode {
  type: "UnionTypeDeclaration",
  name: TypeExpression,
  unionMembers: Array<TypeExpression>
}

interface ObjectProperty extends ASTNode {
  type: "ObjectProperty",
  key: Expression,
  value: Expression
}

interface ObjectExpression extends ASTNode {
  type: "ObjectExpression",
  objectValues: Array<ObjectProperty>;
}

interface FunctionCall extends ASTNode {
  type: "FunctionCall",
  functionId: Expression,
  parameters: Array<Expression>,
  typeParameters: TypeParametersExpression | undefined
}

interface MemberExpression extends ASTNode {
  type: "MemberExpression",
  thisObject: Expression,
  memberName: Identifier
}

interface ArrowFunctionType extends ASTNode {
  type: "ArrowFunctionType",
  parameters: Array<TypedIdentifier>,
  returnType: TypeExpression | null
}

interface ArrowFunctionExpression extends ASTNode {
  type: "ArrowFunctionExpression",
  parameters: Array<TypedIdentifier>,
  body: Array<Statement>
}


interface ReturnStatement extends ASTNode {
  type: "ReturnStatement",
  returnValue: Expression
}

interface ExpressionStatement extends ASTNode {
  type: "ExpressionStatement",
  expression: Expression
}

interface IfStatement extends ASTNode {
  type: "IfStatement",
  condition: Expression,
  body: Array<Statement>
}

interface BinaryExpression extends ASTNode {
  type: "BinaryExpression",
  binarySign: string,
  left: Expression,
  right: Expression
}


type TypeExpression = Identifier | TypeWithParameters | ArrowFunctionType
type Statement = ReturnStatement | ExpressionStatement | IfStatement;
type Literal = NumericLiteral | BinaryNumericLiteral;
type Expression = Identifier | TypeExpression | Literal | ObjectExpression | FunctionCall | MemberExpression | ArrowFunctionExpression | BinaryExpression | ArrowFunctionType | TypeParametersExpression;
type GenDeclaration = ImportDeclaration | StructDeclaration | UnionTypeDeclaration | FunctionDeclaration;

type Node = Identifier | GenDeclaration | TypedIdentifier | Expression | ObjectProperty | Statement;

function tIdentifier(name: String): Identifier {
  return {type: "Identifier", name: name};
}

function tImportDeclaration(importValue: Identifier, from: String): ImportDeclaration {
  return {type: "ImportDeclaration", importValue: importValue, from: from};
}

function tFunctionDeclaration(name: Identifier, typeParameters: TypeParametersExpression, returnType: TypeExpression | null, parameters: Array<TypedIdentifier>, body: Array<Statement>): FunctionDeclaration {
  return {type: "FunctionDeclaration", name: name, typeParameters: typeParameters, returnType: returnType, parameters: parameters, body: body};
}

function tTypedIdentifier(name: Identifier, typeId: TypeExpression): TypedIdentifier {
  return {type: "TypedIdentifier", name: name, typeId: typeId};
}

function tTypeWithParameters(name: Identifier, typeParameters: TypeParametersExpression): TypeWithParameters {
  return {type: "TypeWithParameters", name: name, typeParameters: typeParameters}
}

function tStructDeclaration(name: Identifier, fields: Array<TypedIdentifier>, typeParameters: TypeParametersExpression): StructDeclaration {
  return {type: "StructDeclaration", name: name, fields: fields, typeParametersExpression: typeParameters};
}

function tObjectProperty(key: Expression, value: Expression): ObjectProperty {
  return {type: "ObjectProperty", key: key, value: value}
}

function tObjectExpression(objectValues: Array<ObjectProperty>): ObjectExpression {
  return {type: "ObjectExpression", objectValues: objectValues}
}

function tReturnStatement(returnValue: Expression): ReturnStatement {
  return {type: "ReturnStatement", returnValue: returnValue}
}

function tFunctionCall(functionId: Expression, parameters: Array<Expression>, typeParameters?: TypeParametersExpression): FunctionCall {
  return {type: "FunctionCall", functionId: functionId, parameters: parameters, typeParameters: typeParameters}
}

function tMemberExpression(thisObject: Expression, memberName: Identifier): MemberExpression {
  return {type: "MemberExpression", thisObject: thisObject, memberName: memberName}
}

function tNumericLiteral(value: number): NumericLiteral {
  return {type: "NumericLiteral", value: value}
}

function tBinaryNumericLiteral(value: number): BinaryNumericLiteral {
  return {type: "BinaryNumericLiteral", value: value}
}

function tTypeParametersExpression(typeParameters: Array<Identifier>): TypeParametersExpression {
  return {type: "TypeParametersExpression", typeParameters: typeParameters}
}

function tArrowFunctionExpression(parameters: Array<TypedIdentifier>, body: Array<Statement>): ArrowFunctionExpression {
  return {type: "ArrowFunctionExpression", parameters: parameters, body: body}
}

function tUnionTypeDeclaration(name: TypeExpression, unionMembers: Array<TypeExpression>): UnionTypeDeclaration {
  return {type: "UnionTypeDeclaration", name: name, unionMembers: unionMembers}
}

function tExpressionStatement(expression: Expression): ExpressionStatement {
  return {type: "ExpressionStatement", expression: expression}
}

function tIfStatement(condition: Expression, body: Array<Statement>): IfStatement {
  return {type: "IfStatement", condition: condition, body: body}
}

function tBinaryExpression(left: Expression, binarySign: string, right: Expression): BinaryExpression {
  return {type: "BinaryExpression", binarySign: binarySign, left: left, right: right}
}


function tArrowFunctionType(parameters: Array<TypedIdentifier>, returnType: TypeExpression): ArrowFunctionType {
  return {type: "ArrowFunctionType", parameters: parameters, returnType: returnType};
}

function toCodeArray(nodeArray: Array<Node>, delimeter: string, prefix: string, printContext: PrintContext, suffix: string) {
  let parameters: string = '';

  for (let i = 0; i < nodeArray.length; i++) {
    let currentParam = nodeArray[i];
    if (currentParam != undefined) {
      parameters += prefix + toCode(currentParam, printContext) + suffix;
    }
    if (i + 1 < nodeArray.length) {
      parameters += delimeter;
    }
  }

  return parameters;
}

type PrintContext = {
  tabs: number;
}

function addTab(printContext: PrintContext): PrintContext {
  return {
    ...printContext,
    tabs: printContext.tabs + 1,
  }
}

function toCode(node: Node, printContext: PrintContext) : string {
  let result: string = '';
  let currentTabs = '\t'.repeat(printContext.tabs);

  if (node.type == "Identifier") {
    result += node.name;
  }

  if (node.type == "NumericLiteral") {
    result += node.value.toString()
  }

  if (node.type == "ImportDeclaration") {
    result += currentTabs + `import { ${toCode(node.importValue, printContext)} } from "${node.from}"`;
  }

  if (node.type == "FunctionDeclaration") {
    result += currentTabs + `export function ${toCode(node.name, printContext)}${toCode(node.typeParameters, printContext)}(${toCodeArray(node.parameters, ', ', '', printContext, '')})${node.returnType ? ': ' + toCode(node.returnType, printContext) : ''} {
${toCodeArray(node.body, '\n', '', addTab(printContext), ';')}
${currentTabs}}`
  }

  if (node.type == "ArrowFunctionExpression") {
    result += `(${toCodeArray(node.parameters, ', ', '', printContext, '')}) => {
${toCodeArray(node.body, '\n', '', addTab(printContext), ';')}
${currentTabs}}`
  }

  if (node.type == "ArrowFunctionType") {
    result += `(${toCodeArray(node.parameters, ', ', '', printContext, '')}) => ${node.returnType ? toCode(node.returnType, printContext) : ''}`
  }

  if (node.type == "TypeWithParameters") {
    result += `${toCode(node.name, printContext)}${toCode(node.typeParameters, printContext)}`
  }

  if (node.type == "TypedIdentifier") {
    result += toCode(node.name, printContext) + ': ' + toCode(node.typeId, printContext);
  }

  if (node.type == "ObjectProperty") {
    result += currentTabs + toCode(node.key, printContext) + ': ' + toCode(node.value, printContext);
  }

  if (node.type == "ObjectExpression") {
    result += `{
${toCodeArray(node.objectValues, ',\n', '', addTab(printContext), '')}
${currentTabs}}`
  }

  if (node.type == "ReturnStatement") {
    result += currentTabs + `return ${toCode(node.returnValue, printContext)}`
  }

  if (node.type == "ExpressionStatement") {
    result += currentTabs + toCode(node.expression, printContext)
  }

  if (node.type == "TypeParametersExpression") {
    if (node.typeParameters.length > 0) {
      result += '<';
      result += toCodeArray(node.typeParameters, ',', '', printContext, '');
      result += '>';
    }
  }

  if (node.type == "StructDeclaration") {
    result += currentTabs + `export type ${toCode(node.name, printContext)}${toCode(node.typeParametersExpression, printContext)} = {
${toCodeArray(node.fields, '\n', '\t', printContext, ';')}
${currentTabs}};`
  }

  if (node.type == "UnionTypeDeclaration") {
    result += currentTabs + `export type ${toCode(node.name, printContext)} = ${toCodeArray(node.unionMembers, ' | ', '', printContext, '')};`
  }

  if (node.type == "FunctionCall") {
    result += `${toCode(node.functionId, printContext)}${node.typeParameters ? toCode(node.typeParameters, printContext) : ''}(${toCodeArray(node.parameters, ', ', '', printContext, '')})`
  }

  if (node.type == "MemberExpression") {
    result += toCode(node.thisObject, printContext) + '.' + toCode(node.memberName, printContext);
  }

  if (node.type == "IfStatement") {
    result += `${currentTabs}if (${toCode(node.condition, printContext)}) {
${toCodeArray(node.body, '\n', '', addTab(printContext), ';')}
${currentTabs}}`
  }

  if (node.type == "BinaryExpression") {
    result += `${toCode(node.left, printContext)} ${node.binarySign} ${toCode(node.right, printContext)}`
  }

  return result;
}


function firstLower(structName: String) {
  return structName.charAt(0).toLowerCase() + structName.slice(1)
}


describe('parsing into intermediate representation using grammar', () => {
  test('block.tlb can be parsed', () => { 

    const babelTestCode = `
    export type X = {}
    export type Y = {}
    
    export type Z = X | Y;`;

    const babelTestAst = parseBabel(babelTestCode, {sourceType: 'module', plugins: ['typescript']});
    // exportNamedDeclaration(functionDeclaration(identifier('loadX')))
    // console.log(util.inspect(babelTestAst.program.body[2], false, null, true /* enable colors */))

    
  
    expect.hasAssertions()

    const input = fs.readFileSync(
      path.resolve(fixturesDir, 'tlb', 'my.tlb'),
      'utf-8',
    )
    const parsed = parse(input)

    expect(parsed.shortMessage).toBe(undefined)
    expect(parsed.succeeded()).toBe(true)

    const tree = ast(input)


    let jsCodeDeclarations = []
    jsCodeDeclarations.push(tImportDeclaration(tIdentifier('Builder'), '../boc/Builder')) // importDeclaration([importSpecifier(identifier('Builder'), identifier('Builder'))], stringLiteral('../boc/Builder')))
    jsCodeDeclarations.push(tImportDeclaration(tIdentifier('Slice'), '../boc/Slice'))  // importDeclaration([importSpecifier(identifier('Slice'), identifier('Slice'))], stringLiteral('../boc/Slice')))

    let declarationsMap = new Map<string, Declaration[]>();
    tree.declarations.forEach(declaration => {
      let currentDeclarations = declarationsMap.get(declaration.combinator.name);
      if (currentDeclarations == undefined) {
        currentDeclarations = []
      }
      currentDeclarations.push(declaration);
      declarationsMap.set(declaration.combinator.name, currentDeclarations)
    })

    declarationsMap.forEach((value: Declaration[], key: string) => {
        let firstDecl = value.at(0);
        if (firstDecl == undefined) {
          return;
        }
        let combinatorName = firstDecl.combinator.name;
        let variableCombinatorName = combinatorName.charAt(0).toLowerCase() + combinatorName.slice(1)
        if (combinatorName == undefined) {
          return;
        }
        let unionTypes: TypeExpression[] = []
        let tmpDeclarations: ASTNode[]  = []
        let loadStatements: Statement[] = []
        let storeStatements: Statement[] = []

        let typeParameters: TypeParametersExpression = tTypeParametersExpression([]);
        let implicitFields = new Map<string, string>();



        value.forEach(declaration => {
          console.log(value)
          let structName: string;
          if (value.length > 1) {
            structName = declaration.combinator.name + '_' + declaration.constructorDef.name;
          } else {
            structName = declaration.combinator.name;
          }
          let variableStructName = firstLower(structName)
    
          let structProperties: TypedIdentifier[] = []
          let loadProperties: ObjectProperty[] = []
          let insideStoreStatements: Statement[] = []      
          
          let tag = declaration?.constructorDef.tag;
          if (tag == undefined) {
            return;
          }
          if (tag[0] == '$') {

          }
          let tagBitLen = tag?.length - 1;
          let tagBinary = '0b' + tag.slice(1);

          declaration?.fields.forEach(field => {
            if (field instanceof FieldBuiltinDef) {
              implicitFields.set(field.name, field.type);
            }
          })

          declaration?.fields.forEach(field => {
            console.log(field)

            if (field instanceof FieldBuiltinDef) {
              structProperties.push(tTypedIdentifier(tIdentifier(field.name), tIdentifier('number')));
              loadProperties.push(tObjectProperty(tIdentifier(field.name), tIdentifier(field.name))) 

            }

            if (field instanceof FieldNamedDef) {
              let bits: Expression | undefined;


              if (field.expr instanceof BuiltinZeroArgs) {
                if (field.expr.name == '#') {
                  bits = tNumericLiteral(32);
                }
              }
              if (field.expr instanceof BuiltinOneArgExpr) {
                if (field.expr.name == '##') {
                  if (field.expr.arg instanceof NumberExpr) {
                    bits = tNumericLiteral(field.expr.arg.num);
                  }
                  if (field.expr.arg instanceof NameExpr) {
                    bits = tIdentifier(field.expr.arg.name);
                  }
                }
              }
              if (field.expr instanceof CombinatorExpr) {
                let typeParameterArray: Array<Identifier> = []
                let loadFunctionsArray: Array<Expression> = []
                let storeFunctionsArray: Array<Expression> = []

                field.expr.args.forEach(element => {
                  if (element instanceof NameExpr) {
                    typeParameterArray.push(tIdentifier(element.name))
                    loadFunctionsArray.push(tIdentifier('load' + element.name))
                    storeFunctionsArray.push(tIdentifier('store' + element.name))
                  }
                  if (element instanceof NumberExpr) {
                    loadFunctionsArray.push(tNumericLiteral(element.num))
                  }
                });

                let currentTypeParameters = tTypeParametersExpression(typeParameterArray);

                let insideLoadParameters: Array<Expression> = [tIdentifier('slice')];
                let insideStoreParameters: Array<Expression> = [tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier(field.name))];

                structProperties.push(tTypedIdentifier(tIdentifier(field.name), tTypeWithParameters(tIdentifier(field.expr.name), currentTypeParameters)));
                loadProperties.push(tObjectProperty(tIdentifier(field.name), tFunctionCall(tIdentifier('load' + field.expr.name), insideLoadParameters.concat(loadFunctionsArray), currentTypeParameters))) 
                insideStoreStatements.push(tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + field.expr.name), insideStoreParameters.concat(storeFunctionsArray), currentTypeParameters), [tIdentifier('builder')])))   
              }
              if (field.expr instanceof NameExpr) {
                structProperties.push(tTypedIdentifier(tIdentifier(field.name), tIdentifier(field.expr.name)));
                loadProperties.push(tObjectProperty(tIdentifier(field.name), tFunctionCall(tIdentifier('load' + field.expr.name), [tIdentifier('slice')]))) 
                insideStoreStatements.push(tExpressionStatement(tFunctionCall(tFunctionCall(tIdentifier('store' + field.expr.name), [tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier(field.name))]), [tIdentifier('builder')])))   
              }
              if (bits != undefined) {
                structProperties.push(tTypedIdentifier(tIdentifier(field.name), tIdentifier('number'))) 
                loadProperties.push(tObjectProperty(tIdentifier(field.name), tFunctionCall(tMemberExpression(tIdentifier('slice'), tIdentifier('loadUint')), [bits]))) 
                if (bits.type == "Identifier") {
                  bits = tMemberExpression(tIdentifier(variableCombinatorName), bits);
                }
                insideStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier('builder'), tIdentifier('storeUint')), [tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier(field.name)), bits])))   
              }
            }
          })

          if (typeParameters.typeParameters.length == 0) {
            let typeParameterArray: Array<Identifier> = []

            declaration.combinator.args.forEach(element => {
              if (element instanceof NameExpr) {
                if (implicitFields.has(element.name) && implicitFields.get(element.name) == 'Type') {
                  typeParameterArray.push(tIdentifier(element.name))
                }
              }
            });

            typeParameters = tTypeParametersExpression(typeParameterArray);
          }

          unionTypes.push(tTypeWithParameters(tIdentifier(structName), typeParameters));
          
          let structX = tStructDeclaration(tIdentifier(structName), structProperties, typeParameters);

          let loadStatement: Statement;
          loadStatement = tReturnStatement(tObjectExpression(loadProperties));
          if (value.length > 1) {
            loadStatement = tIfStatement(tBinaryExpression(tFunctionCall(tMemberExpression(tIdentifier('slice'), tIdentifier('preloadUint')), [tNumericLiteral(tagBitLen)]), '==', tIdentifier(tagBinary)), [loadStatement])
          }
          loadStatements.push(loadStatement)

          let storeStatement: Statement = tReturnStatement(tArrowFunctionExpression([tTypedIdentifier(tIdentifier('builder'), tIdentifier('Builder'))], insideStoreStatements));
          if (value.length > 1) {
            storeStatement = tIfStatement(tBinaryExpression(tIdentifier(variableCombinatorName), 'instanceof', tIdentifier(structName)), [storeStatement])
          }
          storeStatements.push(storeStatement);

          tmpDeclarations.push(structX)
        });


        // loadTheType: (slice: Slice) => TheType

        let loadFunctionParameters = [tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))]
        typeParameters.typeParameters.forEach(element => {
          loadFunctionParameters.push(tTypedIdentifier(tIdentifier('load' + element.name), tArrowFunctionType([tTypedIdentifier(tIdentifier('slice'), tIdentifier('Slice'))], element)))
        });

        implicitFields.forEach((value: string, key: string) => {
          loadFunctionParameters.push(tTypedIdentifier(tIdentifier(key), tIdentifier('number')))
        });

        let loadFunction = tFunctionDeclaration(tIdentifier('load' + combinatorName), typeParameters, tTypeWithParameters(tIdentifier(combinatorName), typeParameters), loadFunctionParameters, loadStatements);
        tmpDeclarations.push(loadFunction)

        let storeFunctionParameters = [tTypedIdentifier(tIdentifier(variableCombinatorName), tTypeWithParameters(tIdentifier(combinatorName), typeParameters))]
        typeParameters.typeParameters.forEach(element => {
          storeFunctionParameters.push(
            tTypedIdentifier(tIdentifier('store' + element.name), 
            tArrowFunctionType(
              [tTypedIdentifier(tIdentifier(firstLower(element.name)), tIdentifier(element.name))], 
              tArrowFunctionType([tTypedIdentifier(tIdentifier('builder'), tIdentifier('Builder'))], tIdentifier('void')))))
        });
        let storeFunction = tFunctionDeclaration(tIdentifier('store' + combinatorName), typeParameters, tIdentifier('Builder'), storeFunctionParameters, storeStatements) 
        tmpDeclarations.push(storeFunction)

        if (value.length > 1) {
          let unionTypeDecl = tUnionTypeDeclaration(tTypeWithParameters(tIdentifier(key), typeParameters), unionTypes)
          jsCodeDeclarations.push(unionTypeDecl)
        }
        tmpDeclarations.forEach(element => {
          jsCodeDeclarations.push(element)
        });
    });

    let generatedCodeBabel = ''
    
    jsCodeDeclarations.forEach(element => {
      generatedCodeBabel += toCode(element, {tabs: 0}) + '\n';
    });

    fs.writeFile('generated.ts', generatedCodeBabel, () => {});


    expect(tree).toBeInstanceOf(Program)
  })
})


/*
  storeY(y)(builder)
*/