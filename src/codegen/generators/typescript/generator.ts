import { CodeGenerator } from "../generator";
import { GenDeclaration, tIdentifier, tImportDeclaration, tStringLiteral } from "./tsgen";

export class TypescriptGenerator implements CodeGenerator {
    jsCodeDeclarations: GenDeclaration[] = []
    
    addTonCoreClassUsage(name: string) {
        this.jsCodeDeclarations.push(tImportDeclaration(tIdentifier(name), tStringLiteral('ton')))
    }
}