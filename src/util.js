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

/**
 * Convert iterable objects into arrays
 * @param   {Iterable} iterable
 * @returns {Array}
 */
export function arraize(iterable) {
    return [].slice.apply(iterable);
}

export function query(node, query) {
    return arraize(node.querySelectorAll(query));
}

export function clone(inputs, except) {
    let result = {};
    inputs
        .forEach((input) => {
            if (typeof input !== 'object') {
                return;
            }
            Object
                .keys(input)
                .forEach((key) => {
                    if (except && except.indexOf(key) !== -1) {
                        return;
                    }
                    result[key] = JSON.parse(JSON.stringify(input[key]));
                });
        });
    return result;
}
