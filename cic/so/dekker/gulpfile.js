const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const zip = require('gulp-zip');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const nunjucks = require('gulp-nunjucks');
const fs = require('fs');

gulp.task('compress-js', function () {
  return gulp.src('simulador.js')
    .pipe( uglify({mangle:{properties:{keep_quoted: true, reserved: [
        'ready', 'addClass', 'removeClass', 'each', 'text', 'val', 'on', 'attr', 'removeAttr', 'html',
            'extend', 'prepend', 'toggleClass',
        'stringify', 'parse',
        'highlightBlock',
     ]}}}))
    .pipe( rename('simulador.min.js') )
    .pipe( gulp.dest('dist') );
});

gulp.task('serve-html', function(){
    return gulp.src('views/simulador.html')
    .pipe( nunjucks.compile({
        app_ver: '0.13.0-b',
        css_idea: 'static/highlight/styles/idea.min.css',
        js_highlight: 'static/highlight/highlight.pack.js',
        js_simulador: 'simulador.min.js',
        inc_highlight_js: false,
     }))
    .pipe( rename('simulador.live.html') )
    .pipe( gulp.dest('dist') );
});

gulp.task('compress-html', function () {
    return gulp.src('dist/simulador.live.html')
    .pipe(replace(/<link rel="stylesheet" origin="local" href="(.*\.css)">/g, function(s, fn){
        var style = fs.readFileSync('dist/' + fn, 'utf8');
        return '<style>' + style + '</style>';
    }))
    .pipe( htmlmin({
        collapseBooleanAttributes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        collapseWhitespace: true,
        minifyCSS: true,
    }))
    .pipe( rename('simulador.html') )
    .pipe( gulp.dest('dist') );
});

gulp.task('zip', function () {
    return gulp.src(['./dist/static/**', './dist/simulador.html', './dist/simulador.min.js'], {base: '.'})
        .pipe(zip('dist-app.zip'))
        .pipe(gulp.dest('.'));
});

gulp.task('live', function (){
    gulp.watch('views/simulador.html', ['serve-html']);
    gulp.watch('simulador.js', ['compress-js']);
})

gulp.task('default', gulp.series('compress-js', 'serve-html', 'compress-html'));