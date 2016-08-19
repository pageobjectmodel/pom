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

const //Document = require('../../build/document').Document,
    bestMatch = require('../build/document').bestMatch,
    mockup = require('./mockups/pom.json');

describe('Best Match', () => {
    let hashmap = [
            'a.b.c',
            '*.b.c',
            'a.*.c',
            'a.b.*',
            'a.*.*'
        ],
        scenarios = [{
            input: 'a.b.c',
            output: 'a.b.c'
        }, {
            input: 'b.b.c',
            output: '*.b.c'
        }, {
            input: 'a.a.c',
            output: 'a.*.c'
        }, {
            input: 'a.b.d',
            output: 'a.b.*'
        }, {
            input: 'a.z.c',
            output: 'a.*.c'
        }, {
            input: 'a.c.d',
            output: 'a.*.*'
        }];

    scenarios.forEach((scenario) => {
        it(JSON.stringify(scenario), () => {
            bestMatch(hashmap, scenario.input).should.be.eql(scenario.output);
        });
    });

    it('1.1.0 - `*.something` over `*` for `abc.something`', function () {
        let hashmap = [
            'type:*',
            'hero:online:en',
            'hero:offline:en',
            '*',
            '*:online:pl',
            '*:offline:pl'
        ],
            filter = '*:online:pl';
        bestMatch(hashmap, filter).should.be.eql('*:online:pl');
    });
});

describe('skaryna/document', () => {

    //let doc = new Document(mockup);

    it('Get', () => {
        //doc.get('var').should.be.eql(123);
        //doc.get('title').should.be.eql(mockup.title);
        //doc.get('title.0').should.be.eql(mockup.title.contents[0]);
        //doc.get('intro').should.be.eql(mockup.intro['*']);
    });

});
