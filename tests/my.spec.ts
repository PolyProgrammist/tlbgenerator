import fs from 'fs'
import path from 'path'
import util from 'util'

import { parse } from '../src'
import { ast } from '../src'
import { generate } from '../src/codegen/main'
import { Program } from '../src/ast/nodes'

import * as crc32 from 'crc-32';

const fixturesDir = path.resolve(__dirname, 'fixtures')

function calculateRequestOpcode(scheme: string): string {
  let constructor = scheme.substring(0, scheme.indexOf(' '));
  const rest = scheme.substring(scheme.indexOf(' '));
  if (constructor.includes('#')) {
      constructor = constructor.substring(0, constructor.indexOf('#'));
  }
  scheme = 
      constructor +
          ' ' +
          rest
              .replace(/\(/g, '')
              .replace(/\)/g, '')
              .replace(/\s+/g, ' ')
              .replace(/;/g, '')
              .trim()
  return (BigInt(crc32.str(scheme)) & BigInt(0x7fffffff)).toString(16);
}

describe('parsing into intermediate representation using grammar', () => {
  test('test.tlb can be parsed', () => {

    // console.log(util.inspect(babelTestAst.program.body[2], false, null, true /* enable colors */))
    let x = 
`block_extra in_msg_descr:^InMsgDescr
  out_msg_descr:^OutMsgDescr
  account_blocks:^ShardAccountBlocks
  rand_seed:bits256
  created_by:bits256
  custom:(Maybe ^McBlockExtra) = BlockExtra;`
  console.log(calculateRequestOpcode(x));
  })
})

/*
  storeY(y)(builder)
*/