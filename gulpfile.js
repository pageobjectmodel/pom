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

const
    gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    mocha = require('gulp-mocha'),
    babel = require('gulp-babel'),
    istanbul = require('gulp-istanbul'),
    isparta = require('isparta');

gulp.task('babelify', function () {
    return gulp
        .src([
            './src/*.js',
            './src/**/*.js'
        ])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('build', ['lint', 'babelify']);

gulp.task('lint', () => {
    return gulp
        .src([
            'src/**/*.js',
            'test/**/*.js'
        ])
        .pipe(eslint({
            "env": {
                "es6": true,
                "browser": true
            },
            "ecmaFeatures": {
                "sourceType": "module"
            },
            "parserOptions": {
                "sourceType": "module",
                "ecmaFeatures": {
                    "jsx": true,
                    "experimentalObjectRestSpread": true
                }
            }
        }))
        .pipe(eslint.format());
});

gulp.task('mocha', ['build'], () => {
    return gulp
        .src([
            'test/**/*.js'
        ])
        .pipe(mocha({
            bail: true,
            timeout: 50000
        }));
});

gulp.task('pre-test', ['build'], () => {
    return gulp.src(['./build/**/*.js'])
        .pipe(istanbul({
            instrumenter: isparta.Instrumenter,
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire());
});


gulp.task('test', ['pre-test'], function () {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha({
            bail: true,
            timeout: 50000
        }))
        // Creating the reports after tests ran
        .pipe(istanbul.writeReports())
        // Enforce a coverage of at least 90%
        .pipe(istanbul.enforceThresholds({
            thresholds: {
                global: 90
            }
        }));
});
