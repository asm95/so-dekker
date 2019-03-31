const gulp = require('gulp');
const rename = require("gulp-rename");
const zip = require('gulp-zip');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');


gulp.task('compress-css', function () {
  return gulp.src('simulador.js')
    .pipe( uglify({mangle:{properties:{keep_quoted: true, reserved: [
        'ready', 'addClass', 'removeClass', 'each', 'text', 'val', 'on', 'attr', 'html',
            'extend', 'prepend', 'toggleClass',
        'stringify', 'parse',
        'highlightBlock',
        ]}}}) )
    .pipe( rename('simulador.min.js') )
    .pipe( gulp.dest('dist') );
});

gulp.task('compress-html', function () {
    return gulp.src('simulador.html')
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
    return gulp.src(['./dist/**', './static/**'], {base: '.'})
        .pipe(zip('dist-app.zip'))
        .pipe(gulp.dest('.'));
});

gulp.task('default', gulp.series('compress-css', 'compress-html'));