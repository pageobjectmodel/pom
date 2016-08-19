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
    Emitter
}
from './emitter';
import {
    clone,
    arraize
}
from './util';
import {
    toHTML
}
from './serializer/toHTML';

let elementMap = {};


/**
 * @see https://github.com/component/escape-regexp
 * @param   {string} str
 * @returns {string}
 */
export function escapeRegexp(str) {
    return String(str).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
}

/**
 * @see App
 * @param   {array} list
 * @param   {string}   filter
 * @returns {string}
 */
export function bestMatch(list, filter) {
    var lowest = null,
        best;

    list.forEach(function (rule) {
        var regexp = new RegExp(escapeRegexp(rule).replace(/\\\*/g, '(.+)')),
            weight = rule.split('*').filter(function (part) {
                return part.length;
            }).length,
            match = filter.match(regexp);

        if (match && (lowest === null || (match.length - weight) < lowest)) {
            lowest = match.length - weight;
            best = rule;
        }
    });
    return best;
}

export function getById(id) {
    return elementMap[id];
}

export function getByNode(element) {
    if (!element) {
        return null;
    }
    let id = element.getAttribute('data-skaryna-id');
    return getById(id);
}

export function randomID(setValue) {
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
        text = '';

    for (let i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    if (Object.keys(elementMap).indexOf(text) === -1) {
        elementMap[text] = elementMap[text] || setValue;
        return text;
    }
    return randomID(setValue);
}

/**
 * @class
 */
export class Node extends Emitter {

    /**
     * @constructs Node
     */
    constructor() {
        super();

        this.name = randomID(this);

        this.__locked = false;
    }

    get locked() {
        return this.__locked;
    }

    lock() {
        this.__locked = true;
    }

    attr() {
        return this.attrs;
    }

    get() {
        throw new Error('Should be implemented');
    }

    set() {
        throw new Error('Should be implemented');
    }

    /**
     * @abstract
     * @throws {Error}
     */
    toJSON() {
        let error = new Error('Should be implemented');
        throw error;
    }

    get defaultNewItem() {
        return null;
    }

    get allowedNewItems() {
        return [];
    }
}

/**
 * @class
 * Defined for Image, Video, Embed, Table, HorizonalRule, Table, List or Component
 */
export class BlockNode extends Node {

    constructor(type, items, attrs) {
        super();
        this._type = type;
        this.items = items || [];
        this.attrs = attrs;
    }

    get(path) {
        let elements = path.split('.'),
            index = elements.shift(),
            rest = elements.join('.'),
            child;

        if (isNaN(index)) {
            return null;
        }

        child = this.items[+index];

        if (rest.length && child) {
            return child.get(rest);
        }

        return child;

    }

    set(path, value) {
        let elements = path.split('.'),
            index = elements.shift(),
            rest = elements.join('.'),
            child;

        if (isNaN(index)) {
            return null;
        }

        if (rest.length && child) {
            return this.items[+index].set(rest, value);
        }

        this.items.splice(+index, 0, value);

    }

    get empty() {
        return this.items.length <= 0;
    }

    get type() {
        return this._type;
    }

    toJSON() {
        let output = {
            type: this.type,
            items: this.items.map((item) => item.toJSON())
        };
        if (this.attrs) {
            output.attrs = JSON.parse(JSON.stringify(this.attrs));
        }
        return output;
    }

    decorate(element) {
        return toHTML(this, {
                edit: true
            })
            .then((html) => {
                element.innerHTML = '';
                arraize(html.children)
                    .forEach((child) => {
                        element.appendChild(child);
                    });
            });
    }
}

export class Document extends BlockNode {

    constructor(items) {
        super('document', items);
    }

    get defaultNewItem() {
        return Paragraph;
    }

    get allowedNewItems() {
        return [
            Paragraph,
            Image
        ];
    }

}

export class Quote extends BlockNode {
    constructor(items) {
        super('quote', items);
    }
}

/**
 * @class
 * Defined for Text, Paragraph, ListItem, Quote and Heading
 */
export class TextNode extends Node {

    get type() {
        return 'text';
    }

    static get type() {
        return 'text';
    }

    get empty() {
        return !this.text || !this.text.replace(/^([\s\n\r\t]+)|([\s\n\r\t]+)$/, '').length;
    }

    get absoluteEmpty() {
        return this.text.length === 0;
    }

    attr() {
        if (this.type === 'text') {
            return {};
        }
        return super.attr();
    }

    constructor(text, formats, attrs) {
        super();
        this.text = (text && text.toString) ? text.toString() : '';
        this.formats = formats || null;
        this.attrs = attrs;
    }

    toJSON() {
        let output = {
            type: this.type,
            text: this.text
        };
        if (this.formats) {
            output.formats = JSON.parse(JSON.stringify(this.formats));
        }
        if (this.attrs && this.type !== 'text') {
            output.attrs = JSON.parse(JSON.stringify(this.attrs));
        }
        return output;
    }

    append(node) {
        if (!(node instanceof TextNode)) {
            throw new Error('Only text nodes can be joined');
        }
        if (node.formats) {
            this.formats = this.formats || [];
            node.formats.forEach((format) => {
                this.formats.push({
                    slice: [format.slice[0] + this.text.length, format.slice[1]],
                    apply: format.apply
                });
            });
        }
        this.text += node.text;
    }

    decorate(element) {
        return toHTML(this, {
                edit: true
            })
            .then((html) => {
                element.innerHTML = html.textContent;
            });
    }
}

export class Paragraph extends TextNode {

    get type() {
        return 'paragraph';
    }

    static get type() {
        return 'paragraph';
    }

    constructor(text, formats, attrs) {
        super(text, formats, attrs);
    }

    get nextNodeType() {
        return Paragraph;
    }
}

export class Image extends Node {

    constructor(source, title, alt) {
        super('image');
        this.src = source;
        this.title = title;
        this.alt = alt;
    }

    get type() {
        return 'image';
    }

    static get type() {
        return 'image';
    }

    attr() {
        let attributes = super.attr() || {};
        if (this.src) {
            attributes.src = this.src;
        }
        if (this.title) {
            attributes.title = this.title;
        }
        if (this.alt) {
            attributes.alt = this.title;
        }
        return attributes;
    }

    toJSON() {
        let output = {
            type: 'image',
            src: this.src
        };
        if (this.title) {
            output.title = this.title;
        }
        if (this.alt) {
            output.alt = this.alt;
        }
        return output;
    }
}

export class Heading extends TextNode {

    constructor(level, text, formats, attrs) {
        super(text, formats, attrs);
        this.level = Math.min(6, level || 1);
    }

    attr() {
        return super.attr();
    }
    get type() {
        return 'heading';
    }

    static get type() {
        return 'heading';
    }

    toJSON() {
        let json = super.toJSON();
        json.level = this.level;
        return json;
    }
}

export class StaticBlockNode extends BlockNode {
    get locked() {
        return true;
    }

    get defaultNewItem() {
        return Paragraph;
    }

    get allowedNewItems() {
        return [
            Paragraph,
            Image
        ];
    }
}

export class Fields extends Node {

    constructor(data) {
        super();
        this._map = data;
    }

    get type() {
        return 'Fields';
    }

    static get type() {
        return 'Fields';
    }

    get(path) {
        let elements = path.split('.'),
            index = elements.shift(),
            rest = elements.join('.'),
            child;

        child = this._map[index];

        if (rest.length && child) {
            return child.get(rest);
        }

        return child;

    }

    set(path, value) {
        let elements = path.split('.'),
            index = elements.shift(),
            rest = elements.join('.'),
            child;

        if (rest.length && child) {
            return this._map[index].get(rest, value);
        }

        this._map[index] = value;

    }

    toJSON() {
        return clone([
            this._map,
            {
                type: 'Fields'
            }
        ]);
    }
}

export class Variants extends Node {

    constructor(data) {
        super();
        this._variants = data;
    }

    get type() {
        return 'Variants';
    }

    static get type() {
        return 'Variants';
    }


    best(variant) {
        let best = bestMatch(Object.keys(this._variants), variant);
        return this._variants[best];

    }

    toJSON() {
        return clone([
            this._map,
            {
                type: 'Variants'
            }
        ]);
    }
}
