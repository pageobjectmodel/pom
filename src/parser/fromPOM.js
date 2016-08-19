/* jslint esnext:true, node:true */
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
    TextNode,
    Document,
    Heading,
    Paragraph,
    Image,
    Fields,
    Variants
}
from './../document';

/**
 * Parse POM JSON representation
 * @param   {object}   model
 * @param   {options} options
 * @returns {Promise<Node>}
 */
export function fromPOM(model) {
    if (!model) {
        return Promise.resolve(null);
    }
    return parser.parse('pom', model.type, model);
}

function processChildNodes(items) {
    if (!Array.isArray(items)) {
        return Promise.resolve([]);
    }
    return Promise.all(items.map((item) => {
        return fromPOM(item);
    })).then((items) => {
        return items.filter((item) => !!item);
    });
}

parser.on('pom', 'document', (token, data) => {
    return processChildNodes(data.items)
        .then((items) => {
            return new Document(items);
        });
});

parser.on('pom', 'heading', (token, data) => {
    return Promise.resolve(new Heading(data.level, data.text, data.formats, data.attrs));
});

parser.on('pom', 'paragraph', (token, data) => {
    return Promise.resolve(new Paragraph(data.text, data.formats, data.attrs));
});

parser.on('pom', 'text', (token, data) => {
    return Promise.resolve(new TextNode(data.text, data.formats));
});

parser.on('pom', 'image', (token, data) => {
    return Promise.resolve(new Image(data.src, data.title, data.alt));
});

parser.on('pom', 'Fields', (token, data) => {
    let fields = {};
    return Promise.all(Object
            .keys(data)
            .filter((key) => key !== 'type')
            .map((key) => {
                return fromPOM(data[key])
                    .then((POM) => {
                        fields[key] = POM;
                    });
            }))
        .then(() => {
            return Promise.resolve(new Fields(fields));
        });
});

parser.on('pom', 'Variants', (token, data) => {
    let variants = {};
    return Promise.all(Object
            .keys(data)
            .filter((key) => key !== 'type')
            .map((key) => {
                return fromPOM(data[key])
                    .then((POM) => {
                        variants[key] = POM;
                    });
            }))
        .then(() => {
            return Promise.resolve(new Variants(variants));
        });
});
