import fs from 'fs'
import path from 'path'
import util from 'util'

import { parse } from '../src'
import { ast } from '../src'
import { generate } from '../src/codegen/main'
import { Program } from '../src/ast/nodes'

import * as crc32 from 'crc-32';
import { loadBlock, storeBlock } from '../generated_block'
import { Cell, beginCell , BitString} from 'ton'

const fixturesDir = path.resolve(__dirname, 'fixtures')

describe('parsing into intermediate representation using grammar', () => {
  test('test.tlb can be parsed', () => {
    let builder = beginCell();//
    builder.storeUint(BigInt(0), 0);


    let x = beginCell().endCell().beginParse()
    // let y = x.loadBits(0)

    builder.storeBits(BitString.EMPTY)
  })
})

/*
  storeY(y)(builder)
*/

// 0010010110011011101101001111001010110000011011101110011101001101