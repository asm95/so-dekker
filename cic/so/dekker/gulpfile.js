const gulp = require('gulp');
const zip = require('gulp-zip');
const uglify = require('gulp-uglify');

gulp.task('compress', function () {
  return gulp.src('simulador.js')
    .pipe( uglify({mangle:{properties:{keep_quoted: true, reserved: [
        'ready', 'addClass', 'removeClass', 'each', 'text', 'val', 'on', 'attr', 'html',
            'extend', 'prepend',
        'stringify', 'parse',
        'highlightBlock',
        ]}}}) )
    .pipe( gulp.dest('pack') );
});

gulp.task('zip', function () {
    return gulp.src(['./pack/**', './static/**', 'simulador.html'], {base: '.'})
        .pipe(zip('dist-app.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.series('compress'));