import { CodeBuilder } from "../CodeBuilder";
import util from 'util'

export interface ASTNode {
    type: TheNode["type"];
}

export interface Identifier extends ASTNode {
    type: "Identifier",
    name: string
}

export interface TypeWithParameters extends ASTNode {
    type: "TypeWithParameters",
    name: Identifier,
    typeParameters: TypeParametersExpression
}

export interface NumericLiteral extends ASTNode {
    type: "NumericLiteral",
    value: number
}

export interface BinaryNumericLiteral extends ASTNode {
    type: "BinaryNumericLiteral",
    value: number
}

export interface StringLiteral extends ASTNode {
    type: "StringLiteral",
    value: string
}

export interface ImportDeclaration extends ASTNode {
    type: "ImportDeclaration",
    importValue: Identifier,
    from: StringLiteral
}

export interface FunctionDeclaration extends ASTNode {
    type: "FunctionDeclaration",
    name: Identifier,
    typeParameters: TypeParametersExpression,
    returnType: TypeExpression | null,
    parameters: Array<TypedIdentifier>;
    body: Array<Statement>;
}

export interface TypedIdentifier extends ASTNode {
    type: "TypedIdentifier",
    name: Identifier,
    typeId: TypeExpression | Literal
}

export interface TypeParametersExpression extends ASTNode {
    type: "TypeParametersExpression",
    typeParameters: Array<TypeExpression>
}

export interface StructDeclaration extends ASTNode {
    type: "StructDeclaration",
    name: Identifier,
    fields: Array<TypedIdentifier>,
    typeParametersExpression: TypeParametersExpression
}

export interface UnionTypeExpression extends ASTNode {
    type: "UnionTypeExpression",
    unionMembers: Array<TypeExpression>
}

export interface UnionTypeDeclaration extends ASTNode {
    type: "UnionTypeDeclaration",
    name: TypeExpression,
    union: UnionTypeExpression
}

export interface ObjectProperty extends ASTNode {
    type: "ObjectProperty",
    key: Expression,
    value: Expression
}

export interface ObjectExpression extends ASTNode {
    type: "ObjectExpression",
    objectValues: Array<ObjectProperty>;
}

export interface FunctionCall extends ASTNode {
    type: "FunctionCall",
    functionId: Expression,
    parameters: Array<Expression>,
    typeParameters: TypeParametersExpression | undefined
}

export interface MemberExpression extends ASTNode {
    type: "MemberExpression",
    thisObject: Expression,
    memberName: Identifier
}

export interface ArrowFunctionType extends ASTNode {
    type: "ArrowFunctionType",
    parameters: Array<TypedIdentifier>,
    returnType: TypeExpression | null
}

export interface ArrowFunctionExpression extends ASTNode {
    type: "ArrowFunctionExpression",
    parameters: Array<TypedIdentifier>,
    body: Array<Statement>
}


export interface ReturnStatement extends ASTNode {
    type: "ReturnStatement",
    returnValue: Expression
}

export interface ExpressionStatement extends ASTNode {
    type: "ExpressionStatement",
    expression: Expression
}

export interface IfStatement extends ASTNode {
    type: "IfStatement",
    condition: Expression,
    body: Array<Statement>,
    elseBody: Array<Statement> | undefined
}

export interface ForCycle extends ASTNode {
    type: "ForCycle",
    init: Expression,
    cond: Expression,
    inc: Expression,
    body: Array<Statement>
}

export interface DeclareVariable extends ASTNode {
    type: "DeclareVariable",
    name: Identifier,
    init: Expression | undefined,
    typeName: TypeExpression | undefined
}

export interface UnaryOpExpression extends ASTNode {
    type: "UnaryOpExpression",
    unaryOperator: string
    expr: Expression
}

export interface BinaryExpression extends ASTNode {
    type: "BinaryExpression",
    binarySign: string,
    left: Expression,
    right: Expression
}
   
export interface TernaryExpression extends ASTNode {
    type: "TernaryExpression",
    condition: Expression,
    body: Expression,
    elseBody: Expression
}

export interface Comment extends ASTNode {
    type: "Comment",
    value: string,
}

export interface MultiStatement extends ASTNode {
    type: "MultiStatement",
    statements: Array<Statement>
}

export type TypeExpression = Identifier | TypeWithParameters | ArrowFunctionType | UnionTypeExpression;
export type Statement = ReturnStatement | ExpressionStatement | IfStatement | MultiStatement | ForCycle;
export type Literal = NumericLiteral | BinaryNumericLiteral | StringLiteral;
export type Expression = Identifier | TypeExpression | Literal | ObjectExpression | FunctionCall | MemberExpression | ArrowFunctionExpression | BinaryExpression | ArrowFunctionType | TypeParametersExpression | DeclareVariable | TernaryExpression | UnaryOpExpression;
export type GenDeclaration = ImportDeclaration | StructDeclaration | UnionTypeDeclaration | FunctionDeclaration | Comment;

export type TheNode = Identifier | GenDeclaration | TypedIdentifier | Expression | ObjectProperty | Statement;


export function tIdentifier(name: string): Identifier {
    return { type: "Identifier", name: name };
}

export function tStringLiteral(value: string): StringLiteral {
    return { type: "StringLiteral", value: value }
}

export function tImportDeclaration(importValue: Identifier, from: StringLiteral): ImportDeclaration {
    return { type: "ImportDeclaration", importValue: importValue, from: from };
}

export function tFunctionDeclaration(name: Identifier, typeParameters: TypeParametersExpression, returnType: TypeExpression | null, parameters: Array<TypedIdentifier>, body: Array<Statement>): FunctionDeclaration {
    return { type: "FunctionDeclaration", name: name, typeParameters: typeParameters, returnType: returnType, parameters: parameters, body: body };
}

export function tTypedIdentifier(name: Identifier, typeId: TypeExpression | StringLiteral): TypedIdentifier {
    return { type: "TypedIdentifier", name: name, typeId: typeId };
}

export function tTypeWithParameters(name: Identifier, typeParameters: TypeParametersExpression): TypeWithParameters {
    return { type: "TypeWithParameters", name: name, typeParameters: typeParameters }
}

export function tStructDeclaration(name: Identifier, fields: Array<TypedIdentifier>, typeParameters: TypeParametersExpression): StructDeclaration {
    return { type: "StructDeclaration", name: name, fields: fields, typeParametersExpression: typeParameters };
}

export function tObjectProperty(key: Expression, value: Expression): ObjectProperty {
    return { type: "ObjectProperty", key: key, value: value }
}

export function tForCycle(init: Expression, cond: Expression, inc: Expression, body: Array<Statement>): ForCycle {
    return { type: "ForCycle", init: init, cond: cond, inc: inc, body: body }
}

export function tObjectExpression(objectValues: Array<ObjectProperty>): ObjectExpression {
    return { type: "ObjectExpression", objectValues: objectValues }
}

export function tReturnStatement(returnValue: Expression): ReturnStatement {
    return { type: "ReturnStatement", returnValue: returnValue }
}

export function tFunctionCall(functionId: Expression, parameters: Array<Expression>, typeParameters?: TypeParametersExpression): FunctionCall {
    return { type: "FunctionCall", functionId: functionId, parameters: parameters, typeParameters: typeParameters }
}

export function tMemberExpression(thisObject: Expression, memberName: Identifier): MemberExpression {
    return { type: "MemberExpression", thisObject: thisObject, memberName: memberName }
}

export function tNumericLiteral(value: number): NumericLiteral {
    return { type: "NumericLiteral", value: value }
}

export function tBinaryNumericLiteral(value: number): BinaryNumericLiteral {
    return { type: "BinaryNumericLiteral", value: value }
}

export function tTypeParametersExpression(typeParameters: Array<TypeExpression>): TypeParametersExpression {
    return { type: "TypeParametersExpression", typeParameters: typeParameters }
}

export function tUnionTypeExpression(unionMembers: Array<TypeExpression>): UnionTypeExpression {
    return { type: "UnionTypeExpression", unionMembers: unionMembers };
}

export function tArrowFunctionExpression(parameters: Array<TypedIdentifier>, body: Array<Statement>): ArrowFunctionExpression {
    return { type: "ArrowFunctionExpression", parameters: parameters, body: body }
}

export function tUnionTypeDeclaration(name: TypeExpression, union: UnionTypeExpression): UnionTypeDeclaration {
    return { type: "UnionTypeDeclaration", name: name, union: union }
}

export function tExpressionStatement(expression: Expression): ExpressionStatement {
    return { type: "ExpressionStatement", expression: expression }
}

export function tIfStatement(condition: Expression, body: Array<Statement>, elseBody?: Array<Statement>): IfStatement {
    return { type: "IfStatement", condition: condition, body: body, elseBody: elseBody }
}

export function tUnaryOpExpression(unaryOperator: string, expr: Expression): UnaryOpExpression {
    return { type: "UnaryOpExpression", unaryOperator: unaryOperator, expr: expr };
}

export function tBinaryExpression(left: Expression, binarySign: string, right: Expression): BinaryExpression {
    return { type: "BinaryExpression", binarySign: binarySign, left: left, right: right }
}


export function tArrowFunctionType(parameters: Array<TypedIdentifier>, returnType: TypeExpression): ArrowFunctionType {
    return { type: "ArrowFunctionType", parameters: parameters, returnType: returnType };
}

export function tDeclareVariable(name: Identifier, init?: Expression, typeName?: TypeExpression): DeclareVariable {
    return { type: "DeclareVariable", name: name, init: init, typeName: typeName }
}

export function tMultiStatement(statements: Array<Statement>): MultiStatement {
    return { type: "MultiStatement", statements: statements };
}

export function tComment(value: string): Comment {
    return { type: "Comment", value: value };
}

export function tTernaryExpression(condition: Expression, body: Expression, elseBody: Expression): TernaryExpression {
    return { type: "TernaryExpression", condition: condition, body: body, elseBody: elseBody };
}

export function toCodeArray(nodeArray: Array<TheNode>, code: CodeBuilder, delimeter: string) {
    for (let i = 0; i < nodeArray.length; i++) {
        let currentParam = nodeArray[i];
        if (currentParam != undefined) {
            toCode(currentParam, code);
        }
        if (i + 1 < nodeArray.length) {
            code.add(delimeter, false);
        }
    }
    return code;
}

export function toCode(node: TheNode, code: CodeBuilder = new CodeBuilder()): CodeBuilder {
    if (node.type == "Identifier") {
        code.add(node.name, false);
    }

    if (node.type == "NumericLiteral") {
        code.add(node.value.toString(), false)
    }

    if (node.type == "ImportDeclaration") {
        code.add(`import { ${toCode(node.importValue).render()} } from ${toCode(node.from).render()}`, false);
    }

    if (node.type == "FunctionDeclaration") {
        code.add(`export function ${toCode(node.name).render()}${toCode(node.typeParameters).render()}(`, false)
        toCodeArray(node.parameters, code, ', ')
        code.add(`)${node.returnType ? ': ' + toCode(node.returnType).render() : ''} {`)
        code.inTab(() => {
            node.body.forEach((statement) => {
                code.append(toCode(statement));
            })
        });
        code.add('}')
    }

    if (node.type == "ArrowFunctionExpression") {
        code.add(`((`, false)
        toCodeArray(node.parameters, code, ', ')
        code.add(`) => {`)
        code.inTab(() => {
            node.body.forEach(statement => {
                code.append(toCode(statement));
            })
        })
        code.add(`})`, false)
    }

    if (node.type == "ArrowFunctionType") {
        code.add(`(${toCodeArray(node.parameters, new CodeBuilder(), ', ').render()}) => ${node.returnType ? toCode(node.returnType).render() : ''}`, false)
    }

    if (node.type == "TypeWithParameters") {
        code.add(`${toCode(node.name).render()}${toCode(node.typeParameters).render()}`, false)
    }

    if (node.type == "TypedIdentifier") {
        code.add(toCode(node.name).render() + ': ' + toCode(node.typeId).render(), false)
    }

    if (node.type == "ObjectProperty") {
        code.add(toCode(node.key).render() + ': ' + toCode(node.value).render(), false)
    }

    if (node.type == "DeclareVariable") {
        code.add(`let ${toCode(node.name).render()}${node.typeName ? ': ' + toCode(node.typeName).render() : ''}`, false)
        if (node.init) {
            code.add(' = ', false);
            toCode(node.init, code);
        }
    }

    if (node.type == "ObjectExpression") {
        code.add('{');
        code.inTab(() => {
            node.objectValues.forEach(objectValue => {
                code.add(toCode(objectValue).render() + ',');
            })
        });
        code.add('}', false);
    }

    if (node.type == "MultiStatement") {
        node.statements.forEach(statement => {
            code.append(toCode(statement));
        })
    }

    if (node.type == "ReturnStatement") {
        code.add(`return `, false)
        code.appendInline(toCode(node.returnValue))
    }

    if (node.type == "ExpressionStatement") {
        code.add(toCode(node.expression).render() + ';', false)
    }

    if (node.type == "TypeParametersExpression") {
        if (node.typeParameters.length > 0) {
            code.add('<', false);
            toCodeArray(node.typeParameters, code, ', ')
            code.add('>', false);
        }
    }

    if (node.type == "StructDeclaration") {
        code.add(`export interface ${toCode(node.name).render()}${toCode(node.typeParametersExpression).render()} {`)
        code.inTab(() => {
            node.fields.forEach(field => {
                code.add(`readonly ${toCode(field).render()};`)
            })
        })
        code.add('}')
    }

    if (node.type == "UnionTypeDeclaration") {
        code.add(`export type ${toCode(node.name).render()} = ${toCode(node.union).render()};`)
    }

    if (node.type == "UnionTypeExpression") {
        toCodeArray(node.unionMembers, code, ' | ');
    }

    if (node.type == "FunctionCall") {
        code.add(`${toCode(node.functionId).render()}${node.typeParameters ? toCode(node.typeParameters).render() : ''}(`, false)
        toCodeArray(node.parameters, code, ', ')
        code.add(`)`, false)
    }

    if (node.type == "StringLiteral") {
        code.add(`'${node.value}'`, false)
    }

    if (node.type == "MemberExpression") {
        code.add(toCode(node.thisObject).render() + '.' + toCode(node.memberName).render(), false);
    }

    if (node.type == "IfStatement") {
        code.add(`if (${toCode(node.condition).render()}) {`)
        code.inTab(() => {
            node.body.forEach(statement => {
                code.append(toCode(statement));
            })
        })
        code.add('}', false)
    }

    if (node.type == "ForCycle") {
        code.add(`for (${toCode(node.init).render()};${toCode(node.cond).render()};${toCode(node.inc).render()}) {`)
        code.inTab(() => {
            node.body.forEach(statement => {
                code.append(toCode(statement));
            })
        })
        code.add(`}`, false);
    }

    if (node.type == "UnaryOpExpression") {
        code.add(`(${node.unaryOperator}${toCode(node.expr).render()})`, false)
    }

    if (node.type == "BinaryExpression") {
        code.add(`(${toCode(node.left).render()} ${node.binarySign} ${toCode(node.right).render()})`, false)
    }

    if (node.type == "TernaryExpression") {
        code.add(`(${toCode(node.condition).render()} ? ${toCode(node.body).render()} : ${toCode(node.elseBody).render()})`, false)
    }

    if (node.type == "Comment") {
        let splittedComment = node.value.split('\n');
        if (splittedComment.length == 1) {
            code.add(`// ${splittedComment[0]}`)
        } else {
            code.add(`/*`)
            splittedComment.forEach(line => {
                code.add(line);
            })
            code.add(`*/`)
        }
    }

    return code;
}
