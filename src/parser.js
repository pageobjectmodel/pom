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

class Parser {

    parse(format, token, data, options) {

        if (!token) {
            return Promise.reject(new Error('Model is empty'));
        }

        return this.handle(format, token, data, options);
    }

    on(format, token, handler) {
        this._handlers = this._handlers || {};
        this._handlers[format] = this._handlers[format] || {};
        this._handlers[format][token] = handler;
    }

    handle(format, token, data, options) {

        let handler = (this._handlers && this._handlers[format] && this._handlers[format][token]) ? this._handlers[format][token] : null;
        if (!handler) {
            handler = (this._handlers && this._handlers[format] && this._handlers[format]['*']) ? this._handlers[format]['*'] : null;
            if (!handler) {
                return Promise.reject(new Error('No handler defined for ' + format + ' : ' + token));
            }
        }

        return handler(token, data, options)
            .then((POM) => {
                return POM;
            });
    }

}

export var parser = new Parser();
