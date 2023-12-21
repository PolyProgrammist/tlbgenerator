import { TLBCode, TLBType } from "../ast"
import { GenDeclaration as TSGenDeclaration } from "./typescript/tsgen"

export interface CodeGenerator {
    jsCodeDeclarations: CommonGenDeclaration[]

    addTonCoreClassUsage(name: string): void
    addBitLenFunction(): void
    addTlbType(tlbType: TLBType, tlbCode: TLBCode, input: string[], jsCodeConstructorDeclarations: CommonGenDeclaration[], jsCodeFunctionsDeclarations: CommonGenDeclaration[]): void
}

export type CommonGenDeclaration = TSGenDeclaration;