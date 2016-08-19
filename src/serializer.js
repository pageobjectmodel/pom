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

class Serializer {

    serialize(format, node, options) {

        if (!node) {
            return Promise.reject(new Error('Model is empty'));
        }

        if (!node.type) {
            return Promise.reject(new Error('Undefined node type'));
        }

        return this.handle(format, node.type, node, options);
    }

    on(format, nodeType, handler) {
        this._handlers = this._handlers || {};
        this._handlers[format] = this._handlers[format] || {};
        this._handlers[format][nodeType] = handler;
    }

    handle(format, nodeType, node, options) {

        let handler = (this._handlers && this._handlers[format] && this._handlers[format][nodeType]) ? this._handlers[format][nodeType] : null;
        if (!handler) {
            handler = (this._handlers && this._handlers[format] && this._handlers[format]['*']) ? this._handlers[format]['*'] : null;
            if (!handler) {
                return Promise.reject(new Error('No handler defined for ' + format + ' : ' + nodeType));
            }
        }
        return handler(node, options)
            .then((html) => {
                return html;
            });
    }

    handleContents(format, array, options) {
        let self = this;
        return Promise
            .all(array.map((content) => {
                return self.serialize('html', content, options);
            }));

    }
}

export var serializer = new Serializer();
