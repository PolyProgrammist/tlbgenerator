import { GenDeclaration } from "./typescript/tsgen"

export interface CodeGenerator {
    jsCodeDeclarations: GenDeclaration[]

    addTonCoreClassUsage(name: string): void
    addBitLenFunction(): void
}