/* jslint esnext:true, node:true */
/* globals document */
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

import {
    serializer
}
from './../serializer';

import {
    TextNode
}
from './../document';
import {
    arraize
}
from './../util';

export function toHTML(model, options) {
    return serializer.serialize('html', model, options);
}

function otherAttrs(object, except) {
    let result = {};
    Object
        .keys(object)
        .filter((key) => {
            return except.indexOf(key) === -1;
        })
        .forEach((key) => {
            result[key] = object[key];
        });
    return result;
}

function format(string, formats) {
    let wrapper = document.createElement('p'),
        slices = string.split('').map((char) => {
            return {
                char: char,
                apply: []
            };
        });

    slices.push({
        char: '',
        apply: []
    });

    formats.forEach((format) => {
        let from = format.slice[0],
            to = from + format.slice[1];

        format.apply.forEach((apply) => {
            if (slices[from].apply.indexOf(apply) == -1) {
                slices[from].apply.push(apply);
            }
            if (slices[to].apply.indexOf('/' + apply) == -1) {
                slices[to].apply.push('/' + apply);
            }
        });
    });
    wrapper.innerHTML = slices.map((char) => {
        return char.apply.map((tag) => '<' + tag + '>').join('') + char.char;
    }).join('');
    return arraize(wrapper.childNodes);
}

export function element(node, nodeType, attributes, content, options) {

    let promise;

    if (content) {

        promise = serializer.handleContents('html', content || [], options);
    } else {
        promise = Promise.resolve(null);
    }

    return promise.then((content) => {

        if (node.formats && node.formats.length) {
            content = format(content[0].nodeValue, node.formats);
        }

        let elem = document.createElement(nodeType);
        if (options && options.edit) {
            elem.setAttribute('data-skaryna-id', node.name);
        }
        if (attributes) {
            Object
                .keys(attributes)
                .forEach((attributeName) => {
                    elem.setAttribute(attributeName, attributes[attributeName]);
                });
        }
        if (Array.isArray(content)) {
            content.forEach((child) => elem.appendChild(child));
        }
        return elem;
    });
}

class FakeDoc {

    constructor() {
        this.children = [];
    }

    appendChild(child) {
        this.children.push(child);
    }

    get outerHTML() {
        let str = '';
        this.children.forEach((child) => {
            if (child.nodeType === 1) {
                str += child.outerHTML;
            } else {
                str += child.textContent;
            }
        });
        return str;
    }
}

serializer.on('html', 'document', (node, options) => {
    return serializer
        .handleContents('html', node.items || [], options)
        .then((contents) => {
            let output = new FakeDoc();
            if (Array.isArray(contents)) {
                contents.forEach((child) => output.appendChild(child));
            }
            return output;
        });
});

serializer.on('html', 'heading', (node, options) => {
    return element(node, 'h' + (node.level || 1), node.attr(), [new TextNode(node.text, node.formats)], options);
});

serializer.on('html', 'paragraph', (node, options) => {
    return element(node, 'p', node.attr(), [new TextNode(node.text, node.formats)], options);
});

serializer.on('html', 'image', (node, options) => {
    return element(node, 'img', node.attr(), null, options);
});

serializer.on('html', 'text', (node, options) => {
    let element = document.createTextNode(node.text);
    if (options && options.edit) {
        //element.setAttribute('name', node.name);
    }
    return Promise.resolve(element);
});

serializer.on('html', '*', (node, options) => {
    return element(node, node._type, node.attr(), node.items, options);
});
