import { BuiltinZeroArgs, FieldCurlyExprDef, FieldNamedDef, Program, Declaration, BuiltinOneArgExpr, NumberExpr, NameExpr, CombinatorExpr, FieldBuiltinDef, MathExpr, SimpleExpr, NegateExpr, CellRefExpr, FieldDefinition, FieldAnonymousDef, CondExpr, CompareExpr, Expression as ParserExpression, FieldExprDef } from '../../../ast/nodes'
import { tIdentifier, tArrowFunctionExpression, tArrowFunctionType, tBinaryExpression, tBinaryNumericLiteral, tDeclareVariable, tExpressionStatement, tFunctionCall, tFunctionDeclaration, tIfStatement, tImportDeclaration, tMemberExpression, tNumericLiteral, tObjectExpression, tObjectProperty, tReturnStatement, tStringLiteral, tStructDeclaration, tTypeParametersExpression, tTypeWithParameters, tTypedIdentifier, GenDeclaration, tUnionTypeDeclaration, toCode, TypeWithParameters, ArrowFunctionExpression, FunctionDeclaration } from './tsgen'
import { TLBMathExpr, TLBVarExpr, TLBNumberExpr, TLBBinaryOp, TLBCode, TLBType, TLBConstructor, TLBParameter, TLBVariable, TLBField, TLBFieldType } from '../../ast'
import { Expression, Statement, Identifier, BinaryExpression, ASTNode, TypeExpression, TypeParametersExpression, ObjectProperty, TypedIdentifier } from './tsgen'
import { fillConstructors, firstLower, getCurrentSlice, bitLen, convertToMathExpr, splitForTypeValue, deriveMathExpression } from '../../utils'
import { handleType } from './handle_type'
import { addLoadProperty, getNegationDerivationFunctionBody, getParamVarExpr, sliceLoad } from './utils'
import { goodVariableName } from '../../utils'
import { getType } from "../../astbuilder/handle_type"

export function handleField(field: TLBField | undefined, fieldDefinition: FieldDefinition, slicePrefix: Array<number>, tlbCode: TLBCode, constructor: TLBConstructor, constructorLoadStatements: Statement[], subStructStoreStatements: Statement[], subStructProperties: TypedIdentifier[], subStructLoadProperties: ObjectProperty[], variableCombinatorName: string, variableSubStructName: string, jsCodeFunctionsDeclarations: GenDeclaration[], fieldIndex: string) {
  let currentSlice = getCurrentSlice(slicePrefix, 'slice');
  let currentCell = getCurrentSlice(slicePrefix, 'cell');

  if (field && field.subFields.length > 0 && fieldDefinition instanceof FieldAnonymousDef) {
    slicePrefix[slicePrefix.length - 1]++;
    slicePrefix.push(0)

    constructorLoadStatements.push(sliceLoad(slicePrefix, currentSlice))
    subStructStoreStatements.push(tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')), tFunctionCall(tIdentifier('beginCell'), []))))

    let currentFieldIndex = 0;
    fieldDefinition.fields.forEach(fieldDef => {
      let theFieldIndex = fieldIndex + '_' + currentFieldIndex.toString();
      handleField(constructor.fields.get(theFieldIndex), fieldDef, slicePrefix, tlbCode, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations, theFieldIndex)
      currentFieldIndex++;
    });

    subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tIdentifier(getCurrentSlice(slicePrefix, 'cell'))])))

    slicePrefix.pop();
  } 

  if (fieldDefinition instanceof FieldNamedDef || fieldDefinition instanceof FieldExprDef) {
    let fieldName: string;
    if (fieldDefinition instanceof FieldNamedDef) {
      fieldName = fieldDefinition.name;
    } else {
      fieldName = 'anon' + fieldIndex;
    }
    if (fieldDefinition instanceof FieldExprDef && fieldDefinition.expr instanceof NameExpr && fieldDefinition.expr.name == '_') {
      return;
    }

    if (fieldDefinition.expr instanceof CellRefExpr) {
      if (fieldDefinition.expr.expr instanceof CombinatorExpr && (fieldDefinition.expr.expr.name == 'MERKLE_UPDATE' || fieldDefinition.expr.expr.name == 'MERKLE_ROOT')) {
        slicePrefix[slicePrefix.length - 1]++;
        slicePrefix.push(0);
        constructorLoadStatements.push(
          tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')),
              tFunctionCall(tMemberExpression(
                tIdentifier(currentSlice), tIdentifier('loadRef')
              ), []),)))
        addLoadProperty(goodVariableName(fieldName), tIdentifier(getCurrentSlice(slicePrefix, 'cell')), undefined, constructorLoadStatements, subStructLoadProperties)
        subStructProperties.push(tTypedIdentifier(tIdentifier(goodVariableName(fieldName)), tIdentifier('Cell')));
        subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tMemberExpression(tIdentifier(variableCombinatorName), tIdentifier(goodVariableName(fieldName)))])))
        slicePrefix.pop();
      } else {
        slicePrefix[slicePrefix.length - 1]++;
        slicePrefix.push(0)
        constructorLoadStatements.push(sliceLoad(slicePrefix, currentSlice))
        subStructStoreStatements.push(tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')), tFunctionCall(tIdentifier('beginCell'), []))))
        let theFieldIndex = fieldIndex + '_' + '0';
        handleField(field?.subFields[0], new FieldNamedDef(fieldName, fieldDefinition.expr.expr), slicePrefix, tlbCode, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations, theFieldIndex)
        subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tIdentifier(getCurrentSlice(slicePrefix, 'cell'))])))
        slicePrefix.pop();
      }      
    }

    if (field?.subFields.length == 0) {
      if (field == undefined) {
        throw new Error('')
      }
      let thefield: TLBFieldType = field.fieldType
      let fieldInfo = handleType(field, thefield, true, variableCombinatorName, variableSubStructName, currentSlice, currentCell, constructor, jsCodeFunctionsDeclarations, 0, tlbCode);
      if (fieldInfo.loadExpr) {
        addLoadProperty(goodVariableName(fieldName), fieldInfo.loadExpr, fieldInfo.typeParamExpr, constructorLoadStatements, subStructLoadProperties);
      }
      if (fieldInfo.typeParamExpr) {
        subStructProperties.push(tTypedIdentifier(tIdentifier(goodVariableName(fieldName)), fieldInfo.typeParamExpr));
      }
      if (fieldInfo.storeExpr) {
        subStructStoreStatements.push(fieldInfo.storeExpr)
      }
      fieldInfo.negatedVariablesLoads.forEach(element => {
        addLoadProperty(goodVariableName(element.name), element.expression, undefined, constructorLoadStatements, subStructLoadProperties)
      });
    }
  }
}