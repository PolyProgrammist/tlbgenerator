
import { BuiltinOneArgExpr, BuiltinZeroArgs, CellRefExpr, CombinatorExpr, CondExpr, FieldAnonymousDef, FieldDefinition, FieldExprDef, FieldNamedDef, MathExpr, NameExpr } from "../../ast/nodes";
import { TLBCode, TLBConstructor, TLBField, TLBNumberType, TLBType } from "../ast";
import { GenDeclaration, ObjectProperty, Statement, TypedIdentifier } from "../generators/typescript/tsgen";
import { firstLower, getSubStructName, goodVariableName } from "../utils";
import { getType } from "./handle_type";

export function getField(field: FieldDefinition, slicePrefix: Array<number>, tlbCode: TLBCode, constructor: TLBConstructor, constructorLoadStatements: Statement[], subStructStoreStatements: Statement[], subStructProperties: TypedIdentifier[], subStructLoadProperties: ObjectProperty[], variableCombinatorName: string, variableSubStructName: string, jsCodeFunctionsDeclarations: GenDeclaration[], fieldIndex: string): TLBField | undefined {
  // let currentSlice = getCurrentSlice(slicePrefix, 'slice');
  // let currentCell = getCurrentSlice(slicePrefix, 'cell');

  if (field instanceof FieldAnonymousDef) {
    //   slicePrefix[slicePrefix.length - 1]++;
    //   slicePrefix.push(0)

    //   constructorLoadStatements.push(sliceLoad(slicePrefix, currentSlice))
    //   subStructStoreStatements.push(tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')), tFunctionCall(tIdentifier('beginCell'), []))))

    let result: TLBField = { name: '', anonymous: true, fieldType: {kind: 'TLBBoolType'} , subFields: [] };
    let currentFieldIndex = 0;
    let valid = true;
    field.fields.forEach(field => {
      let theFieldIndex = fieldIndex + '_' + currentFieldIndex.toString();
      let subfield = getField(field, slicePrefix, tlbCode, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations, theFieldIndex);
      if (subfield) {
        constructor.newFieldIndices.set(theFieldIndex, subfield)
        result.subFields.push(subfield)
      } else {
        valid = false;
      }
      currentFieldIndex++;
    });
    return result;

    //   subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tIdentifier(getCurrentSlice(slicePrefix, 'cell'))])))

    //   slicePrefix.pop();
    return undefined
  }

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
      return undefined;
    }

      if (field.expr instanceof CellRefExpr) {

        if (field.expr.expr instanceof CombinatorExpr && (field.expr.expr.name == 'MERKLE_UPDATE' || field.expr.expr.name == 'MERKLE_ROOT')) {
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
        } else {
    //       slicePrefix[slicePrefix.length - 1]++;
    //       slicePrefix.push(0)
    //       constructorLoadStatements.push(sliceLoad(slicePrefix, currentSlice))
    //       subStructStoreStatements.push(tExpressionStatement(tDeclareVariable(tIdentifier(getCurrentSlice(slicePrefix, 'cell')), tFunctionCall(tIdentifier('beginCell'), []))))


          let theFieldIndex = fieldIndex + '_' + '0';
          let subfield = getField(new FieldNamedDef(fieldName, field.expr.expr), slicePrefix, tlbCode, constructor, constructorLoadStatements, subStructStoreStatements, subStructProperties, subStructLoadProperties, variableCombinatorName, variableSubStructName, jsCodeFunctionsDeclarations, theFieldIndex)
          if (subfield) {
            let result: TLBField = { name: '', anonymous: true, fieldType: {kind: 'TLBBoolType'} , subFields: [subfield] };
            constructor.newFieldIndices.set(theFieldIndex, subfield)
            return result;
          }
          return subfield
    //       subStructStoreStatements.push(tExpressionStatement(tFunctionCall(tMemberExpression(tIdentifier(currentCell), tIdentifier('storeRef')), [tIdentifier(getCurrentSlice(slicePrefix, 'cell'))])))
    //       slicePrefix.pop();
        }      
        return undefined;
      }

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
      let thefield = { name: fieldName, anonymous: !(field instanceof FieldNamedDef), fieldType: fieldInfo, subFields: [] };
      constructor.fields.push(thefield)
      constructor.fieldIndices.set(fieldIndex, thefield)
      return thefield;
    }
  }
  return undefined
}

export function fillFields(tlbCode: TLBCode) {
  tlbCode.types.forEach(tlbType => {
    tlbType.constructors.forEach(constructor => {
      let fieldIndex = -1;
      let variableCombinatorName = goodVariableName(firstLower(tlbType.name), '0')
      let subStructName: string = getSubStructName(tlbType, constructor);
      let variableSubStructName = goodVariableName(firstLower(subStructName), '_' + constructor.name)
      let slicePrefix: number[] = [0];


      constructor.declaration.fields.forEach(fieldDecl => {
        fieldIndex++;
        let field = getField(fieldDecl, slicePrefix, tlbCode, constructor, [], [], [], [], variableCombinatorName, variableSubStructName, [], fieldIndex.toString())
        if (field != undefined) {
          constructor.newFieldIndices.set(fieldIndex.toString(), field)
        }
      })
    })
  })
}