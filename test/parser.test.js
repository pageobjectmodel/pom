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

const
    should = require('should'),
    atomus = require('atomus'),
    fromHTML = require('../build/parser/fromHTML').fromHTML,
    fromPOM = require('../build/parser/fromPOM').fromPOM,
    Node = require('../build/document').Node,
    POM_MOCKUP = require('./mockups/pom.json'),
    PROSEMIRROR_MOCKUP = require('./mockups/prosemirror.json');

let browserReady = new Promise((resolve) => {
    atomus().html('').ready(function (errors, window) {
        GLOBAL.document = window.document;
        GLOBAL.window = window;
        GLOBAL.top = window;
        resolve();
    });
});

describe('skaryna/parser', () => {

    describe('fromPOM', () => {

        [{}, {
            input: null
        }, {
            input: {
                type: 'text',
                text: 'text'
            }
        }, {
            input: {
                type: 'text',
                text: 'Lorem Ipsum',
                formats: [{
                    slice: [5, 5],
                    apply: ['strong', 'em']
                }]
            }
        }, {
            input: {
                type: 'document',
                items: [{
                    type: 'heading',
                    text: 'Title',
                    level: 1
                }, {
                    type: 'paragraph',
                    text: 'Lorem Ipsum',
                    attrs: {
                        class: 'post-body'
                    },
                    formats: [{
                        slice: [5, 5],
                        apply: ['strong', 'em']
                    }]
                }]
            }
        }]
        .forEach((example) => {
            it(JSON.stringify(example.input), () => {
                if (!example.input) {
                    return fromPOM(example.input).should.finally.be.eql(null);
                }
                return fromPOM(example.input)
                    .then((node) => {
                        node.should.be.instanceOf(Node);
                        node.toJSON().should.be.eql(example.output === undefined ? example.input : example.output);
                        return true;
                    }).should.finally.be.eql(true);
            });
        });

    });

    describe('fromHTML', () => {

        [{
            input: '',
            output: null
        }, {
            input: 'Lorem Ipsum',
            output: {
                type: 'text',
                text: 'Lorem Ipsum'
            }
        }, {
            input: '<h1></h1>',
            output: {
                type: 'heading',
                level: 1,
                text: ''
            }
        }, {
            input: '<h2>Page <strong>title</h2>',
            output: {
                type: 'heading',
                level: 2,
                text: 'Page title',
                formats: [{
                    slice: [5, 5],
                    apply: ['STRONG']
                    }]
            }
        }, {
            input: '<p>This is <em><b>quite complex</b></em>',
            output: {
                type: 'paragraph',
                text: 'This is quite complex',
                formats: [{
                    slice: [8, 13],
                    apply: ['EM', 'B']
                    }]
            }
        }, {
            input: '<p>This is <em><b>quite complex</b></em> example of <i>text <u>that contains</u> <s><sup>various</sup></s></i> formatting',
            output: {
                type: 'paragraph',
                text: 'This is quite complex example of text that contains various formatting',
                formats: [{
                    slice: [8, 13],
                    apply: ['EM', 'B']
                    }, {
                    slice: [33, 26],
                    apply: ['I']
                    }, {
                    slice: [38, 13],
                    apply: ['U']
                    }, {
                    slice: [52, 7],
                    apply: ['S', 'SUP']
                    }]
            }
        }, {
            input: '<blockquote><p>Lorem ipsum</p></blockquote>',
            output: {
                type: 'quote',
                items: [{
                    type: 'paragraph',
                    text: 'Lorem ipsum'
                    }]
            }
        }, {
            input: '<blockquote>Lorem ipsum <strong>habababa</strong></blockquote>',
            output: {
                type: 'quote',
                items: [{
                    type: 'paragraph',
                    text: 'Lorem ipsum habababa',
                    formats: [{
                        slice: [12, 8],
                        apply: ['STRONG']
                        }]
                    }]
            }
        }, {
            input: 'This is <a href="http://google.com">link</a> to google',
            output: {
                type: 'text',
                text: 'This is link to google',
                formats: [{
                    slice: [8, 4],
                    apply: [{
                        type: 'A',
                        href: 'http://google.com',
                        title: 'link'
                            }]
                        }]
            }
        }, {
            input: 'This is text that should be <img src="https://unsplash.it/200/300"/> divided to block elements',
            output: {
                type: 'document',
                items: [{
                    type: 'paragraph',
                    text: 'This is text that should be '
                }, {
                    type: 'image',
                    src: 'https://unsplash.it/200/300'
                }, {
                    type: 'paragraph',
                    text: ' divided to block elements'
                }]
            }
        }]
        .forEach((example) => {

            it(example.input, () => {
                return browserReady
                    .then(() => {
                        return fromHTML(example.input);
                    })
                    .then((node) => {
                        if (example.output === null) {
                            should.not.exist(node);
                            return true;
                        }
                        node.should.be.instanceOf(Node);
                        node.toJSON().should.be.eql(example.output);
                        return true;
                    })
                    .should.finally.be.eql(true);
            });
        });
    });
});
