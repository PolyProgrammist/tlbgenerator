import { CodeGenerator } from "../generator";
import { GenDeclaration, tExpressionStatement, tFunctionDeclaration, tIdentifier, tImportDeclaration, tStringLiteral, tTypeParametersExpression, tTypedIdentifier } from "./tsgen";

export class TypescriptGenerator implements CodeGenerator {
    jsCodeDeclarations: GenDeclaration[] = []
    
    addTonCoreClassUsage(name: string) {
        this.jsCodeDeclarations.push(tImportDeclaration(tIdentifier(name), tStringLiteral('ton')))
    }
    addBitLenFunction() {
        this.jsCodeDeclarations.push(tFunctionDeclaration(tIdentifier('bitLen'), tTypeParametersExpression([]), null, [tTypedIdentifier(tIdentifier('n'), tIdentifier('number'))], [
            tExpressionStatement(tIdentifier('return n.toString(2).length;'))
        ]))
    }
}