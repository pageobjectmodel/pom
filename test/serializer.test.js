/* jslint esnext:true, node:true, mocha:true */
/*eslint-env node, mocha */
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
"use strict";

require('should');

const
    toHTML = require('../build/serializer/toHTML').toHTML,
    fromPOM = require('../build/parser/fromPOM').fromPOM,
    toPOM = require('../build/serializer/toPOM').toPOM,
    fs = require('fs'),
    POM_MOCKUP = require('./mockups/pom.json'),
    HTML_MOCKUP = fs.readFileSync(__dirname + '/mockups/html.html', 'utf8').replace(/\n$/, '');

describe('skaryna/serializer', () => {

    it('toHTML', () => {
        return fromPOM(POM_MOCKUP)
            .then((pom) => toHTML(pom))
            .then((html) => {
                html.outerHTML.should.be.eql(HTML_MOCKUP);
                return true;
            })
            .should.finally.be.eql(true);
    });

    it('toPOM', () => {
        return fromPOM(POM_MOCKUP)
            .then((pom) => toPOM(pom))
            .then((pom) => {
                pom.should.be.eql(POM_MOCKUP);
                return true;
            })
            .should.finally.be.eql(true);
    });
});
