
import { BuiltinOneArgExpr, BuiltinZeroArgs, CellRefExpr, CombinatorExpr, CondExpr, Declaration, FieldAnonymousDef, FieldDefinition, FieldExprDef, FieldNamedDef, MathExpr, NameExpr } from "../../ast/nodes";
import { TLBCode, TLBConstructor, TLBField, TLBType, TLBTypeNew } from "../ast";
import { TLBNumberType } from "../ast";
import { GenDeclaration, ObjectProperty, Statement, TypedIdentifier } from "../generators/typescript/tsgen";
import { firstLower, getSubStructName, goodVariableName } from "../utils";
import { getType } from "./handle_type";

export function getField(field: FieldDefinition, slicePrefix: Array<number>, constructor: TLBConstructor, constructorLoadStatements: Statement[], subStructStoreStatements: Statement[], subStructProperties: TypedIdentifier[], subStructLoadProperties: ObjectProperty[], variableCombinatorName: string, variableSubStructName: string, jsCodeFunctionsDeclarations: GenDeclaration[], fieldIndex: string): TLBField | undefined {
  if (field instanceof FieldAnonymousDef) {
    let result: TLBField = { name: '', anonymous: true, fieldType: { kind: 'TLBBoolType' }, subFields: [] };
    let currentFieldIndex = 0;
    field.fields.forEach(field => {
      let theFieldIndex = fieldIndex + '_' + currentFieldIndex.toString();
      let subfield = getField(field, slicePrefix, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations, theFieldIndex);
      if (subfield) {
        result.subFields.push(subfield)
      }
      currentFieldIndex++;
    });
    return result;
  }

  if (field instanceof FieldNamedDef || field instanceof FieldExprDef) {
    let fieldName: string;
    if (field instanceof FieldNamedDef) {
      fieldName = field.name;
    } else {
      fieldName = 'anon' + fieldIndex;
    }
    if (field instanceof FieldExprDef && field.expr instanceof NameExpr && field.expr.name == '_') {
      return undefined;
    }

    if (field.expr instanceof CellRefExpr) {
      if (field.expr.expr instanceof CombinatorExpr && (field.expr.expr.name == 'MERKLE_UPDATE' || field.expr.expr.name == 'MERKLE_ROOT')) {
        return { name: fieldName, anonymous: true, fieldType: { kind: 'TLBExoticType' }, subFields: [] };
      } else {
        let theFieldIndex = fieldIndex + '_' + '0';
        let subfield = getField(new FieldNamedDef(fieldName, field.expr.expr), slicePrefix, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations, theFieldIndex)
        if (subfield) {
          let result: TLBField = { name: fieldName, anonymous: true, fieldType: { kind: 'TLBBoolType' }, subFields: [subfield] };
          return result;
        }
        return subfield
      }
    }

    if (field.expr instanceof CombinatorExpr || field.expr instanceof NameExpr || field.expr instanceof BuiltinZeroArgs || field.expr instanceof BuiltinOneArgExpr || field.expr instanceof MathExpr || field.expr instanceof CondExpr) {
      let tmpTypeName: string;
      if (field.expr instanceof MathExpr || field.expr instanceof CondExpr) {
        tmpTypeName = ''
      } else {
        tmpTypeName = field.expr.name;
      }
      let fieldInfo = getType(field.expr, fieldName, true, false, variableCombinatorName, variableSubStructName, constructor, tmpTypeName, 0);
      return { name: fieldName, anonymous: !(field instanceof FieldNamedDef), fieldType: fieldInfo, subFields: [] };
    }
  }
  return undefined
}

export function fillFields(typeItem: {declaration: Declaration, constructor: TLBConstructor}, tlbType: TLBType) {
      let constructor = typeItem.constructor;
      let declaration = typeItem.declaration;

      let fieldIndex = -1;
      let variableCombinatorName = goodVariableName(firstLower(tlbType.name), '0')
      let subStructName: string = getSubStructName(tlbType, constructor);
      let variableSubStructName = goodVariableName(firstLower(subStructName), '_' + constructor.name)
      let slicePrefix: number[] = [0];

      declaration.fields.forEach(fieldDecl => {
        fieldIndex++;
        let field = getField(fieldDecl, slicePrefix, constructor, [], [], [], [], variableCombinatorName, variableSubStructName, [], fieldIndex.toString())
        if (field != undefined) {
          constructor.fields.push(field)
        }
      })
}