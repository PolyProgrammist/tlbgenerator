import { TLBCode, TLBType } from "../ast"
import { CodeBuilder } from "./CodeBuilder"
import { GenDeclaration as TSGenDeclaration, TheNode } from "./typescript/tsgen"

export interface CodeGenerator {
    jsCodeDeclarations: CommonGenDeclaration[]
    jsCodeConstructorDeclarations: CommonGenDeclaration[]
    jsCodeFunctionsDeclarations: CommonGenDeclaration[]
    tlbCode: TLBCode

    addTonCoreClassUsage(name: string): void
    addBitLenFunction(): void
    addTlbType(tlbType: TLBType): void
    toCode(node: TheNode, code: CodeBuilder): CodeBuilder
}

export type CommonGenDeclaration = TSGenDeclaration;