import { TLBCode, TLBType } from "../ast"
import { CodeBuilder } from "./CodeBuilder"
import { GenDeclaration as TSGenDeclaration, TheNode } from "./typescript/tsgen"

export interface CodeGenerator {
    jsCodeDeclarations: CommonGenDeclaration[]

    addTonCoreClassUsage(name: string): void
    addBitLenFunction(): void
    addTlbType(tlbType: TLBType, tlbCode: TLBCode, input: string[], jsCodeConstructorDeclarations: CommonGenDeclaration[], jsCodeFunctionsDeclarations: CommonGenDeclaration[]): void
    toCode(node: TheNode, code: CodeBuilder): CodeBuilder
}

export type CommonGenDeclaration = TSGenDeclaration;