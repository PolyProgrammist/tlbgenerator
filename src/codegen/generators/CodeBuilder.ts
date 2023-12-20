/**
 * Copyright (c) Whales Corp. 
 * All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class CodeBuilder {
    tabLevel = 0
    code = ''

    tab() {
        this.tabLevel++
    }

    unTab() {
        this.tabLevel--
    }

    inTab(callback: () => void) {
        this.tab();
        callback()
        this.unTab();
    }

    add(text?: string, moveLine = true) {
        if (!text) {
            this.code += '\n'
            return
        }

        let tab = ' '.repeat(this.tabLevel * 4)
        this.code += tab + text + (moveLine ? '\n' : '')
    }

    addMultiline(text: string, inline = false) {
        let lines = text.split('\n')
        let i = 0
        for (let line of lines) {
            if (line === '\n' && lines.indexOf(line) === lines.length - 1) {
                continue
            }
            if (inline && i === 0) {
                this.code += line + '\n'
            } else {
                this.add(line)
            }
            i++
        }
    }

    append(code: CodeBuilder) {
        this.addMultiline(code.render())
    }

    appendInline(code: CodeBuilder) {
        this.addMultiline(code.render(), true)
    }

    render() {
        return this.code
    }
}