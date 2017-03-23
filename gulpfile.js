const gulp = require('gulp')

const zip = require('gulp-zip')
const browserify = require('browserify')
const source = require('vinyl-source-stream')

gulp.task('js', () => {
  return browserify({
    entries: [ './src/background.js' ]
  })
  .bundle()
  .pipe(source('background.js'))
  .pipe(gulp.dest('./dist'))
})

gulp.task('zip', [ 'setup' ], () => {
  return gulp.src('./dist/*')
  .pipe(zip('extension.zip'))
  .pipe(gulp.dest('./'))
})

gulp.task('js:watch', () => gulp.watch('./src/*.js', [ 'js' ]))

gulp.task('copy-icons', () => gulp.src('./icons/*').pipe(gulp.dest('./dist/icons')))
gulp.task('copy-manifest', () => gulp.src('./manifest.json').pipe(gulp.dest('./dist')))
gulp.task('copy-license', () => gulp.src('./LICENSE').pipe(gulp.dest('./dist')))
gulp.task('copy-resources', [ 'copy-icons', 'copy-manifest', 'copy-license' ])

gulp.task('watch', [ 'js:watch' ])
gulp.task('setup', [ 'copy-resources', 'js' ])
gulp.task('dist', [ 'zip' ])
gulp.task('default', [ 'copy-resources', 'js', 'watch' ])
