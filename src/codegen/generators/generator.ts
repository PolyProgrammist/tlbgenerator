import { TLBCode, TLBType } from "../ast"
import { GenDeclaration } from "./typescript/tsgen"

export interface CodeGenerator {
    jsCodeDeclarations: GenDeclaration[]

    addTonCoreClassUsage(name: string): void
    addBitLenFunction(): void
    addTlbType(tlbType: TLBType, tlbCode: TLBCode, input: string[], jsCodeConstructorDeclarations: GenDeclaration[], jsCodeFunctionsDeclarations: GenDeclaration[]): void
}