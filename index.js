/* jslint esnext:true, node:true, E054:false */
/**
    The MIT License (MIT)

    Copyright (c) 2016 Łukasz Marek Sielski

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

let LIB = {}

Object.defineProperties(LIB, {
    document: {
        get : () => require('./src/document')
    },
    emitter: {
        get: () => require('./src/emitter')
    },
    parser: {
        get: () => require('./src/parser')
    },
    serializer: {
        get: () => require('./src/serializer')
    },
    util: {
        get: () => require('./src/util')
    },
    fromMarkdown: {
        get: () => require('./src/parser/fromMarkdown')
    },
    fromHTML: {
        get: () => require('./src/parser/fromHTML')
    },
    fromPOM: {
        get: () => require('./src/parser/fromPOM')
    },
    fromProseMirror: {
        get: () => require('./src/parser/fromProseMirror')
    },
    toHTML: {
        get: () => require('./src/parser/toHTML')
    },
    toPOM: {
        get: () => require('./src/parser/toPOM')
    }
});

module.exports = LIB;
