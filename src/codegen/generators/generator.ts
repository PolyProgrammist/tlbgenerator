import { TLBCode, TLBCodeNew, TLBType, TLBTypeNew } from "../ast"
import { CodeBuilder } from "./CodeBuilder"
import { GenDeclaration as TSGenDeclaration, TheNode } from "./typescript/tsgen"

export interface CodeGenerator {
    jsCodeDeclarations: CommonGenDeclaration[]
    jsCodeConstructorDeclarations: CommonGenDeclaration[]
    jsCodeFunctionsDeclarations: CommonGenDeclaration[]
    tlbCode: TLBCodeNew

    addTonCoreClassUsage(name: string): void
    addBitLenFunction(): void
    addTlbType(tlbType: TLBTypeNew): void
    toCode(node: TheNode, code: CodeBuilder): CodeBuilder
}

export type CommonGenDeclaration = TSGenDeclaration;