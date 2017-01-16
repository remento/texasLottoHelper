/*jslint node:true */
(function () {
    'use strict';
    var // require
        clean = require('gulp-clean'),
        concat = require('gulp-concat-sourcemap'),
        gulp = require('gulp'),
        jslint = require('gulp-jslint'),
        less = require('gulp-less-sourcemap'),
        path = require('path'),
        runSequence = require('run-sequence'),
        watch = require('gulp-watch'),
        // config
        dist = './dist/',
        distCss = './dist/static/css/',
        distJs = './dist/static/js/',
        distPartials = './dist/static/partials/';

    gulp.task('clean', function () {
        return gulp.src(dist, {read: false})
            .pipe(clean());
    });

//    gulp.task('concat', function () {
//        gulp.src(['./source/**/*.js'])
//            .pipe(concat('all.js', {}))
//            .pipe(gulp.dest(distJs));
//    });

    gulp.task('copy', function () {
        gulp.src(['./lotto*.html'])
            .pipe(gulp.dest(dist));
        gulp.src(['./css/**.*'])
            .pipe(gulp.dest(distCss));
        gulp.src(['./js/**.*'])
            .pipe(gulp.dest(distJs));
        gulp.src(['./partials/**/*.html'])
            .pipe(gulp.dest(distPartials));
    });

//    gulp.task('less', function () {
//        gulp.src('./source/less/main.less')
//            .pipe(less({
//                sourceMap: {
//                    sourceMapRootpath: '/source/less' // Optional absolute or relative path to your LESS files
//                }
//            }))
//            .pipe(gulp.dest(distCss));
//        gulp.src('./source/less/customBootstrap.less')
//            .pipe(less({
//                sourceMap: {
//                    sourceMapRootpath: '/source/less' // Optional absolute or relative path to your LESS files
//                }
//            }))
//            .pipe(gulp.dest(distCss));
//    });

    gulp.task('lint', function () {
        return gulp.src(['./js/**/*.js'])
            .pipe(jslint({
                //node: true,
                //evil: true,
                //nomen: true,
                //global: [],
                //predef: [],
                //reporter: 'default',
                //edition: '2014-07-08',
                //errorsOnly: false
            }))
            .on('error', function (error) {
                console.error(String(error));
            });
    });

    gulp.task('build', function (callback) {
        return runSequence(
            'clean',
            [
                'clean',
                //'lint', 'less', 'concat',
                'copy'
            ],
            callback
        );
    });

    gulp.task('watch', function (callback) {
        return watch([
            './js/**/*',
            './css/**/*',
            './partials/**/*'
        ], function () {
            console.log('Watch triggered --- rebuilding');
            gulp.start('build');
        });
    });

    gulp.task('buildThenWatch', function (callback) {
        return runSequence(
            'build',
            'watch',
            callback
        );
    });

    gulp.task('default', ['buildThenWatch']);
}());
