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
    parser
}
from './../parser';
import {
    arraize,
    clone
}
from './../util';
import {
    Document,
    TextNode,
    BlockNode,
    Paragraph,
    Heading,
    Image,
    Quote,
    StaticBlockNode
}
from './../document';

function whatWrapper(rootNode) {
    switch (rootNode) {
    case 'td':
    case 'th':
        return 'tr';
    case 'tr':
        return 'table';
    default:
        return 'div';
    }
}

function editMode(node, element, options) {
    if (options && options.edit) {
        element.setAttribute('data-skaryna-id', node.name);
        node.__element = element;
    }
    return node;
}

function processChildren(element, options) {
    if (!element || !element.childNodes) {
        return Promise.resolve([]);
    }
    return Promise
        .all(arraize(element.childNodes)
            .map((child) => {
                if (child.nodeType === 1 || child.nodeType === 3) {
                    return fromHTML(child, options);
                } else {
                    return null;
                }
            }))
        .then((items) => items.filter((item) => {
            if (item.constructor === TextNode) {
                return !item.absoluteEmpty;
            }
            return item !== null;
        }));
}

/**
 * Parse POM JSON representation
 * @param   {string|HTMLElement}   model
 * @param   {options} options
 * @returns {Promise<Node>}
 */
export function fromHTML(input, options) {

    if (!input) {
        return Promise.resolve(null);
    }

    if (typeof input === 'string') {
        if (input.length === 0) {
            return Promise.resolve(null);
        }
        let wrapper = document.createElement(whatWrapper(input.replace('/^(\s*)<([a-zA-Z0-9_-]+)', '$2').toLowerCase()));
        wrapper.innerHTML = input;
        return processChildren(wrapper, options)
            .then((children) => {

                if (children.length === 1) {
                    return children[0];
                }
                if (children
                    .filter((item) => !(item instanceof TextNode || item instanceof InlineNode))
                    .length
                ) {
                    if (children.map((item) => item instanceof BlockNode).length) {
                        return new Document(children.map((item) => {
                            if (item.type === 'text') {
                                return new Paragraph(item.text, item.formats, item.attrs, options);
                            }
                            return item;
                        }));
                    }
                    return new Document(children);
                }
                let items = children.map((item) => {
                        if (item instanceof InlineNode) {
                            let [text, formats] = stringify([item]);
                            return new TextNode(text, formats, options);
                        }

                        return item;
                    }),
                    first = items.shift();
                items.forEach((item) => {
                    first.append(item);
                });
                return first;
            });
    }
    return parser.parse('html', input.nodeType === 3 ? 'text' : input.nodeName, input);
}

class InlineNode extends BlockNode {

}

function formatType(item, text) {
    if (item.type === 'A') {
        return {
            type: 'A',
            title: item.attrs.title || text,
            href: item.attrs.href
        };
    }
    return item.type;
}

function stringify(items) {
    let text = '',
        formats = [],
        index = 0;

    items.forEach((item) => {
        if (item instanceof InlineNode) {
            let [innerText, innerFormats] = stringify(item.items),
                format = {
                    slice: [index, innerText.length],
                    apply: [formatType(item, innerText)]
                };
            formats.push(format);
            innerFormats.forEach((format) => {
                formats.push({
                    slice: [index + format.slice[0], format.slice[1]],
                    apply: format.apply
                });
            });
            formats.forEach((format) => {
                formats.forEach((otherFormat, idx) => {
                    if (format !== otherFormat && format.slice[0] === otherFormat.slice[0] && format.slice[1] === otherFormat.slice[1]) {
                        format.apply = format.apply.concat(otherFormat.apply);
                        formats.splice(idx, 1);
                    }
                });
            });
            text += innerText;
            index += innerText.length;
        } else if (item instanceof TextNode) {
            text += item.text;
            index += item.text.length;
        } else {

        }
    });

    return [text, formats];
}

function heading(token, data, options) {

    return processChildren(data, options)
        .then((items) => {
            let [text, formats] = stringify(items);
            return Promise.resolve(new Heading(token[1].toLowerCase(), text || '', formats.length ? formats : null, options));
        });
}

function paragraph(token, data, options) {
    return processChildren(data, options)
        .then((items) => {
            let [text, formats] = stringify(items);
            return Promise.resolve(new Paragraph(text, formats.length ? formats : null));
        });
}

function attributes(input) {
    let output = null;
    arraize(input)
        .forEach((attribute) => {
            output = output || {};
            if (attribute.value && attribute.value.length) {
                output[attribute.name] = attribute.value;
            }
        });
    return output;

}

function ifAttr(value) {
    if (value && value.length) {
        return value;
    }
    return null;
}

function quote(token, data, options) {
    return processChildren(data, options)
        .then((items) => {

            let paragraphs = [],
                lastParagraph = [];
            items.forEach((item) => {
                if (item instanceof Paragraph) {
                    if (lastParagraph.length) {
                        let [text, formats] = stringify(items);
                        paragraphs.push(Promise.resolve(new Paragraph(text, formats.length ? formats : null, options)));
                        lastParagraph = [];
                    }
                    paragraphs.push(Promise.resolve(item));
                } else {
                    lastParagraph.push(item);
                }
            });
            if (lastParagraph.length) {
                let [text, formats] = stringify(items);
                paragraphs.push(Promise.resolve(new Paragraph(text, formats.length ? formats : null, options)));
            }

            return Promise.all(paragraphs);
        })
        .then((items) => {
            return Promise.resolve(new Quote(items));
        });
}

parser.on('html', 'text', (token, data, options) => {
    return Promise.resolve(new TextNode(data.textContent, null, options));
});
parser.on('html', 'H1', heading);
parser.on('html', 'H2', heading);
parser.on('html', 'H3', heading);
parser.on('html', 'H4', heading);
parser.on('html', 'H5', heading);
parser.on('html', 'H6', heading);
parser.on('html', 'P', paragraph);
parser.on('html', 'BLOCKQUOTE', quote);

parser.on('html', 'IMG', (token, data, options) => {
    return Promise.resolve(new Image(data.src, ifAttr(data.getAttribute('title')), ifAttr(data.getAttribute('alt')), clone([attributes(data.attributes)], ['src', 'title', 'alt'])), options);
});

['ADDRESS', 'ARTICLE', 'ASIDE', 'DIV', 'FIGURE', 'FOOTER', 'HEADER', 'MAIN', 'NAV', 'SECTION'].forEach((nodeName) => {
    parser.on('html', nodeName, (token, data, options) => {
        return processChildren(data, options)
            .then((items) => {
                return Promise.resolve(new StaticBlockNode(token, items, attributes(data.attributes)), options);
            });
    });
});

parser.on('html', '*', (token, data, options) => {
    return processChildren(data, options)
        .then((items) => {
            return Promise.resolve(new InlineNode(token, items, attributes(data.attributes)), options);
        });
});
/*
parser.on('html', '#text', (token, data) => {
    return Promise.resolve(new TextNode(data.textContent));
});

[
    ['b', 'strong'],
    ['big', 'strong'],
    ['i', 'em'],
    'small',
    ['tt', 'code'],
    ['abbr', 'semantic', 'abbr'],
    ['acronym', 'abbr', 'abbr'],
    ['cite', 'semantic', 'cite'],
    'code',
    ['dfn', 'semantic', 'definition'],
    'em',
    ['time', 'semantic', 'time'],
    ['var', 'code', 'var'],
    ['kbd', 'code', 'kbd'],
    'strong',
    ['samp', 'code', 'sample'],
    'bdo',
    'a',
    //'br',
    //'img,
    //'map',
    //'object',
    ['q', 'semantic', 'quotation'],
    //script
    'span',
    del,
    s
    'sub',
    'sup',
    //button
    //input
    //label
    //select
    //textarea
].forEach((inlineRule) => {

    let input = typeof inlineRule === 'string' ? inlineRule : inlineRule[0];

    parser.on('html', input, (token, data) => {
        return processChildren(data)
            .then((items) => {

            });
    });

});
*/
