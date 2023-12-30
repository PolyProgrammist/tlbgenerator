import { SimpleExpr, NameExpr, NumberExpr, MathExpr, FieldBuiltinDef, NegateExpr, Declaration, CompareExpr, FieldCurlyExprDef, FieldNamedDef } from "../ast/nodes";
import { TLBMathExpr, TLBVarExpr, TLBNumberExpr, TLBBinaryOp, TLBCode, TLBType, TLBConstructorTag, TLBConstructor, TLBParameter, TLBVariable, TLBField } from "./ast"
import * as crc32 from "crc-32";
import { fillFields } from "./astbuilder/handle_field";

export function convertToMathExpr(mathExpr: SimpleExpr | NameExpr | NumberExpr | CompareExpr, negated: boolean = false): TLBMathExpr {
    if (mathExpr instanceof NameExpr) {
        let variables = new Set<string>();
        variables.add(mathExpr.name);
        return new TLBVarExpr(mathExpr.name, variables, negated);
    }
    if (mathExpr instanceof NumberExpr) {
        return new TLBNumberExpr(mathExpr.num, new Set<string>(), false);
    }
    if (mathExpr instanceof MathExpr) {
        let left = convertToMathExpr(mathExpr.left, negated)
        let right = convertToMathExpr(mathExpr.right, negated)
        return new TLBBinaryOp(left, right, mathExpr.op)
    }
    if (mathExpr instanceof CompareExpr) {
        let left = convertToMathExpr(mathExpr.left, negated);
        let right = convertToMathExpr(mathExpr.right, negated);
        let operation: string = mathExpr.op;
        return new TLBBinaryOp(left, right, operation)
    }
    if (mathExpr instanceof NegateExpr) {
        if (mathExpr.expr instanceof MathExpr || mathExpr.expr instanceof NameExpr || mathExpr.expr instanceof NumberExpr) {
            let expression = convertToMathExpr(mathExpr.expr, true);
            if (expression instanceof TLBBinaryOp) {
                return new TLBBinaryOp(expression.left, expression.right, expression.operation, expression.variables, true);
            }
            if (expression instanceof TLBVarExpr) {
                return new TLBVarExpr(expression.x, expression.variables, true);
            }
            if (expression instanceof TLBNumberExpr) {
                return new TLBNumberExpr(expression.n, expression.variables, true);
            }
        }
    }
    return { n: 0, variables: new Set<string>(), hasNeg: false };
}

export function getNegatedVariable(mathExpr: TLBMathExpr): string | undefined {
    if (mathExpr.hasNeg) {
        if (mathExpr instanceof TLBBinaryOp) {
            if (mathExpr.left.hasNeg) {
                return getNegatedVariable(mathExpr.left);
            }
            if (mathExpr.right.hasNeg) {
                return getNegatedVariable(mathExpr.right);
            }
        }
        if (mathExpr instanceof TLBVarExpr) {
            return mathExpr.x;
        }
    }
    return undefined
}

export function reorganizeExpression(mathExpr: TLBMathExpr, variable: string): TLBMathExpr {
    if (mathExpr instanceof TLBBinaryOp && mathExpr.operation == '=') {
        if (mathExpr.left.variables.has(variable)) {
            mathExpr = new TLBBinaryOp(mathExpr.right, mathExpr.left, '=', mathExpr.variables, mathExpr.hasNeg);
        }
        if (mathExpr.right instanceof TLBVarExpr) {
            return new TLBBinaryOp(mathExpr.right, mathExpr.left, '=', mathExpr.variables, mathExpr.hasNeg);
        }
        let rightSide = mathExpr.right
        if (rightSide instanceof TLBBinaryOp) {
            let op = '';
            if (rightSide.operation == '*') {
                op = '/';
            } else if (rightSide.operation == '+') {
                op = '-'
            } else {
                throw new Error('invalid operation')
            }
            let withVariable = undefined;
            let other = undefined;
            if (rightSide.left.variables.has(variable)) {
                withVariable = rightSide.left;
                other = rightSide.right
            } else {
                other = rightSide.left
                withVariable = rightSide.right
            }
            let leftSide = new TLBBinaryOp(
                mathExpr.left,
                other,
                op,
            )
            mathExpr = new TLBBinaryOp(
                leftSide,
                withVariable,
                '=',
                new Set([...leftSide.variables, ...withVariable.variables]),
                leftSide.hasNeg || rightSide.hasNeg
            )
            return reorganizeExpression(mathExpr, variable);
        }
    }
    return { n: 0, variables: new Set<string>(), hasNeg: false }
}

export function getVariableName(myMathExpr: TLBMathExpr): string {
    if (myMathExpr instanceof TLBVarExpr) {
        return myMathExpr.x;
    }
    if (myMathExpr instanceof TLBBinaryOp) {
        if (myMathExpr.left.variables.size) {
            return getVariableName(myMathExpr.left);
        } else {
            return getVariableName(myMathExpr.right);
        }
    }
    return '';
}

export function deriveMathExpression(mathExpr: MathExpr | NameExpr | NumberExpr | CompareExpr) {
    let myMathExpr = convertToMathExpr(mathExpr);
    return {
        name: getVariableName(myMathExpr),
        derived: myMathExpr,
    }
}


export function firstLower(structName: String) {
    return structName.charAt(0).toLowerCase() + structName.slice(1)
}

export function splitForTypeValue(name: string, typeName: string) {
    if (!name.startsWith(typeName)) {
        return undefined;
    }
    let num = parseInt(name.slice(typeName.length))
    if (num == undefined) {
        return undefined
    }
    if (name != typeName + num.toString()) {
        return undefined
    }
    return num
}

export function getCurrentSlice(slicePrefix: number[], name: string): string {
    let result = name;
    slicePrefix = slicePrefix.slice(0, slicePrefix.length - 1);
    slicePrefix.forEach(element => {
        result += element.toString();
    });
    if (result == 'cell') {
        return 'builder';
    }
    return result;
}

export function bitLen(n: number) {
    return n.toString(2).length;
}

function constructorPriority(c: TLBConstructor): number {
    let result = 0;
    if (c.tag.bitLen > 0) {
        result++;
    }
    c.parameters.forEach(parameter => {
        if (parameter.variable.const) {
            result++;
        }
    })
    return result;
}

export function compareConstructors(a: TLBConstructor, b: TLBConstructor): number {
    let aPriority = constructorPriority(a);
    let bPriority = constructorPriority(b);
    if ( aPriority < bPriority ){
        return 1;
    }
    if ( aPriority > bPriority ){
        return -1;
    }
    return 0;
}

export function checkConstructors(tlbType: TLBType) {
    // TODO
}

export function fillParameterNames(tlbType: TLBType) {
    let parameterNames: string[] = []
    let argNames: (string | undefined)[] = []
    tlbType.constructors[0]?.parameters.forEach(element => {
        parameterNames.push(element.variable.name);
        argNames.push(undefined);
    });
    tlbType.constructors.forEach(constructor => {
        for (let i = 0; i < constructor.parameters.length; i++) {
            if (parameterNames[i] == '') {
                let parameterName = constructor.parameters[i]?.variable.name;
                if (parameterName != undefined) {
                    parameterNames[i] = parameterName;
                }
                
            }
            let argName = constructor.parameters[i]?.argName
            if (argName) {
                argNames[i] = argName
            }
        }
    });
    for (let i = 0; i < parameterNames.length; i++) {
        if (parameterNames[i] == '') {
            parameterNames[i] = 'arg' + i;
        }
    }
    tlbType.constructors.forEach(constructor => {
        for (let i = 0; i < constructor.parameters.length; i++) {
            let parameterName = parameterNames[i]
            if (parameterName != undefined && constructor.parameters[i]?.variable.name == '') {
                constructor.parameters[i]!.variable.name = parameterName;
            }
            let argName = argNames[i];
            let parameter = constructor.parameters[i]
            if (argName != undefined && parameter != undefined) {
                parameter.argName = argName;
                if (parameter.paramExpr instanceof TLBVarExpr) {
                    parameter.variable.deriveExpr = new TLBVarExpr(parameter.argName)
                    parameter.paramExpr = parameter.variable.deriveExpr
                }
            }
        }
    })
}

export function fillConstraintsAndNegationVars(constructor: TLBConstructor, declaration: Declaration) {
    declaration.fields.forEach(field => {
        if (field instanceof FieldCurlyExprDef && field.expr instanceof CompareExpr) {
            if (field.expr.op == '=') {
                let myMathExpr = convertToMathExpr(field.expr);
                let negatedVariable = getNegatedVariable(myMathExpr);
                if (negatedVariable) {
                    myMathExpr = reorganizeExpression(myMathExpr, negatedVariable)
                    if (myMathExpr instanceof TLBBinaryOp) {
                        myMathExpr = myMathExpr.right
                    }
                    let variable = constructor.variablesMap.get(negatedVariable)
                    if (variable) {
                        variable.negated = true;
                        variable.deriveExpr = myMathExpr;
                    } else {
                        throw new Error(`Variable ${negatedVariable} not defined`)
                    }
                } else {
                    constructor.constraints.push(myMathExpr);
                }
            } else {
                constructor.constraints.push(convertToMathExpr(field.expr));
            }
        }
    })
}

export function reorganizeWithArg(myMathExpr: TLBMathExpr, argName: string, varName: string): TLBMathExpr {
    let tmpset = new Set<string>();
    tmpset.add(argName);
    let reorganized = reorganizeExpression(new TLBBinaryOp(new TLBVarExpr(argName, tmpset, false), myMathExpr, '=', new Set<string>(), false), varName)
    if (reorganized instanceof TLBBinaryOp) {
        return reorganized.right;
    }
    throw new Error('')
}

export function getCalculatedExpression(expr: TLBMathExpr, constructor: TLBConstructor): TLBMathExpr {
    if (expr instanceof TLBVarExpr) {
        let variable = constructor.variablesMap.get(expr.x);
        if (variable) {
            calculateVariable(variable, constructor);
            if (variable.deriveExpr) {
                return variable.deriveExpr;
            }
        }
    }
    if (expr instanceof TLBBinaryOp) {
        let left = getCalculatedExpression(expr.left, constructor)
        let right = getCalculatedExpression(expr.right, constructor)
        return new TLBBinaryOp(left, right, expr.operation, expr.variables, expr.hasNeg)
    }
    return expr;
}

export function calculateVariable(variable: TLBVariable, constructor: TLBConstructor) {
  if (variable.calculated) {
    return;
  }
  if (!variable.deriveExpr) {
    return
  }
  variable.calculated = true;
  variable.deriveExpr = getCalculatedExpression(variable.deriveExpr, constructor);
}

export function calculateVariables(constructor: TLBConstructor) {
  constructor.variables.forEach(variable => {
    calculateVariable(variable, constructor)
  });
}


export function getConstructorTag(declaration: Declaration, input: string[]): TLBConstructorTag {
    let tag = declaration.constructorDef.tag;
    if (tag == null && declaration.constructorDef.name == '_' || tag && tag.length > 1 && tag[1] == '_') {
      return {
        bitLen: 0,
        binary: ''
      };
    }
    if (tag == null) {
        let opCode = calculateOpcode(declaration, input)
        return {
            bitLen: 32,
            binary: '0x' + opCode
        }
    }
    if (tag[0] == '$') {
      return {
        bitLen: tag?.length - 1,
        binary: '0b' + tag.slice(1)
      }
    }
    if (tag[0] == '#') {
      return {
        bitLen: (tag?.length - 1) * 4,
        binary: '0x' + tag.slice(1)
      }
    }
    throw new Error('Unknown tag' + tag);
  }

function fixConstructorsNaming(tlbType: TLBType) {
    let constructorNames: Set<string> = new Set<string>();
    for (let i = 0; i < tlbType.constructors.length; i++) {
        let current = tlbType.constructors[i];
        if (current) {
            while (constructorNames.has(current.name)) {
                current.name += i.toString();
            }
            constructorNames.add(current.name); 
        }  
    }
}

export function getStringDeclaration(declaration: Declaration, input: string[]): string {
    let result = '';
    let splittedInput = input
    let currentLine = declaration.locations.line - 1;
    let currentColumn = 0;
    while (!splittedInput[currentLine]?.includes(';')) {
        result += splittedInput[currentLine]?.substring(currentColumn) + '\n';
        currentLine++;
        currentColumn = 0;
    }
    let currentInput = splittedInput[currentLine];
    if (currentInput) {
        result += currentInput.substring(currentColumn, currentInput.indexOf(';') + 1)
    }
    return result;
}

function opCodeSetsEqual(a: string[], b: string[]) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    a = a.sort();
    b = b.sort();
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

export function fixCurrentVariableName(variable: TLBVariable, variablesSet: Set<string>) {
    let index = 0;
    while (variablesSet.has(variable.name)) {
        variable.name = goodVariableName(variable.name + '_' + index)
        index++;
    }
}

export function fixVariablesNaming(tlbCode: TLBCode) {
    tlbCode.types.forEach(tlbType => {
        tlbType.constructors.forEach(constructor => {
            let variablesSet = new Set<string>();
            constructor.variables.forEach(variable => {
                fixCurrentVariableName(variable, variablesSet)
            })
            constructor.parameters.forEach(parameter => {
                fixCurrentVariableName(parameter.variable, variablesSet)
            })
        })
    })
}

export function checkAndRemovePrimitives(tlbCode: TLBCode, input: string[], typeDeclarations: Map<String, {declaration: Declaration, constructor: TLBConstructor}[]>) {
    let toDelete: string[] = []

    let typesToDelete = new Map<string, string[]>();
    typesToDelete.set('Bool', [ '4702fd23', 'f0e8d7f' ]);
    typesToDelete.set('MsgAddressInt', [ 'd7b672a', '6d593e8a' ])

    typesToDelete.forEach((opCodesExpected: string[], typeName: string) => {
        let typeItems = typeDeclarations.get(typeName);
        if (typeItems) {
            let opCodesActual: string[] = []
            typeItems.forEach(typeItem => {
                opCodesActual.push(calculateOpcode(typeItem.declaration, input))
            })
            if (!opCodeSetsEqual(opCodesExpected, opCodesActual)) {
                throw new Error('Bool primitive type is not correct in scheme')
            }
            toDelete.push(typeName)
        }
    })
    
    toDelete.forEach((name: string) => {
        tlbCode.types.delete(name)
    })
}

export function fillConstructors(declarations: Declaration[], tlbCode: TLBCode, input: string[]) {
    let typeDeclarations = new Map<String, {declaration: Declaration, constructor: TLBConstructor}[]>()
    declarations.forEach(declaration => {
        let tlbType: TLBType | undefined = tlbCode.types.get(declaration.combinator.name);
        if (tlbType == undefined) {
            tlbType = { name: declaration.combinator.name, constructors: [] }
        }
        let constructor = { parameters: [], parametersMap: new Map<string, TLBParameter>(), name: declaration.constructorDef.name, variables: new Array<TLBVariable>(), variablesMap: new Map<string, TLBVariable>(), tag: getConstructorTag(declaration, input), constraints: [], fields: [], declaration: '' }
        tlbType.constructors.push(constructor);
        tlbCode.types.set(tlbType.name, tlbType);

        let currentDecls = typeDeclarations.get(tlbType.name)
        if (!currentDecls) {
            currentDecls = [];
        }
        currentDecls.push({declaration: declaration, constructor: constructor})
        typeDeclarations.set(tlbType.name, currentDecls)
    })

    tlbCode.types.forEach((tlbType: TLBType, combinatorName: string) => {
        typeDeclarations.get(tlbType.name)?.forEach((typeItem) => {
            let declaration = typeItem.declaration;
            let constructor = typeItem.constructor;
            declaration.fields.forEach(field => {
                if (field instanceof FieldBuiltinDef) {
                    constructor.variables.push({ name: field.name, const: false, negated: false, type: field.type, calculated: false, isField: false })
                }
                if (field instanceof FieldNamedDef) {
                    constructor.variables.push({ name: field.name, const: false, negated: false, type: '#', calculated: false, isField: true })
                }
            })
            constructor.variables.forEach(variable => {
                constructor.variablesMap.set(variable.name, variable);
            })
            let argumentIndex = -1;
            declaration.combinator.args.forEach(element => {
                argumentIndex++;
                let parameter: TLBParameter | undefined = undefined;
                if (element instanceof NameExpr) {
                    let variable = constructor.variablesMap.get(element.name)
                    if (variable) {
                        if (variable.type == '#') {
                            variable.deriveExpr = new TLBVarExpr(element.name);
                            variable.initialExpr = variable.deriveExpr;
                        }
                        parameter = { variable: variable, paramExpr: new TLBVarExpr(element.name) };
                    }
                    else {
                        throw new Error('Field not known before using (should be tagged as implicit): ' + element)
                    }
                } else if (element instanceof MathExpr) {
                    let derivedExpr = deriveMathExpression(element);
                    let variable = constructor.variablesMap.get(derivedExpr.name)
                    if (variable) {
                        parameter = { variable: variable, paramExpr: derivedExpr.derived };
                        parameter.argName = 'arg' + argumentIndex;
                        parameter.variable.deriveExpr = reorganizeWithArg(convertToMathExpr(element), parameter.argName, parameter.variable.name);
                        parameter.variable.initialExpr = new TLBVarExpr(parameter.variable.name)
                    } else {
                        throw new Error('')
                    }
                } else if (element instanceof NegateExpr && (element.expr instanceof MathExpr || element.expr instanceof NumberExpr || element.expr instanceof NameExpr)) {
                    let derivedExpr = deriveMathExpression(element.expr);
                    let toBeConst = false;
                    if (element.expr instanceof NumberExpr) {
                        toBeConst = true;
                    }
                    let variable = constructor.variablesMap.get(derivedExpr.name)
                    if (variable) {
                        variable.negated = true;
                        variable.const = toBeConst;
                        variable.initialExpr = derivedExpr.derived
                        parameter = { variable: variable, paramExpr: derivedExpr.derived}
                    } else if (derivedExpr.name == '' && toBeConst) {
                        parameter = { variable: { negated: true, const: toBeConst, type: '#', name: derivedExpr.name, deriveExpr: derivedExpr.derived, initialExpr: derivedExpr.derived, calculated: false, isField: false }, paramExpr: derivedExpr.derived };
                    } else {
                        throw new Error('Cannot identify combinator arg')
                    }
                } else if (element instanceof NumberExpr) {
                    parameter = { variable: { negated: false, const: true, type: '#', name: '', deriveExpr: new TLBNumberExpr(element.num), initialExpr: new TLBNumberExpr(element.num), calculated: false, isField: false }, paramExpr: new TLBNumberExpr(element.num) }
                } else {
                    throw new Error('Cannot identify combinator arg: ' + element)
                }
                constructor.parameters.push(parameter);
                constructor.parametersMap.set(parameter.variable.name, parameter);
            });
            constructor.declaration = getStringDeclaration(declaration, input)
            fillConstraintsAndNegationVars(constructor, declaration);
            calculateVariables(constructor);
            fillFields(typeItem, tlbType);
        });
        checkConstructors(tlbType);
        fillParameterNames(tlbType);
        fixConstructorsNaming(tlbType);
        tlbType.constructors.sort(compareConstructors)
    });
    checkAndRemovePrimitives(tlbCode, input, typeDeclarations);
    fixVariablesNaming(tlbCode);
}
export function isBadVarName(name: string): boolean {
  let tsReserved = [
    'abstract', 'arguments', 'await', 'boolean',
    'break', 'byte', 'case', 'catch',
    'char', 'class', 'const', 'continue',
    'debugger', 'default', 'delete', 'do',
    'double', 'else', 'enum', 'eval',
    'export', 'extends', 'false', 'final',
    'finally', 'float', 'for', 'function',
    'goto', 'if', 'implements', 'import',
    'in', 'instanceof', 'int', 'interface',
    'let', 'long', 'native', 'new',
    'null', 'package', 'private', 'protected',
    'public', 'return', 'short', 'static',
    'super', 'switch', 'synchronized', 'this',
    'throw', 'throws', 'transient', 'true',
    'try', 'typeof', 'var', 'void',
    'volatile', 'while', 'with', 'yield'
  ]
  if (tsReserved.includes(name)) {
    return true
  }
  if (name.startsWith('slice')) {
    return true
  }
  if (name.startsWith('cell')) {
    return true
  }
  if (name == 'builder') {
    return true
  }
  return false
}export function goodVariableName(name: string, possibleSuffix: string = '0'): string {
  if (name.startsWith('slice') || name.startsWith('cell')) {
    name = '_' + name
  }
  while (isBadVarName(name)) {
    name += possibleSuffix
  }
  return name
}
export function getSubStructName(tlbType: TLBType, constructor: TLBConstructor): string {
  if (tlbType.constructors.length > 1) {
    return tlbType.name + '_' + constructor.name
  } else {
    return tlbType.name
  }
}
export function calculateOpcode(declaration: Declaration, input: string[]): string {
  let scheme = getStringDeclaration(declaration, input)
  let constructor = scheme.substring(0, scheme.indexOf(' '))
  const rest = scheme.substring(scheme.indexOf(' '))
  if (constructor.includes('#')) {
    constructor = constructor.substring(0, constructor.indexOf('#'))
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
  return (BigInt(crc32.str(scheme)) & BigInt(2147483647)).toString(16)
}

