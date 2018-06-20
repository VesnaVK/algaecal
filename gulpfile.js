var gulp = require('gulp'),
	sass = require('gulp-sass'),
    inject = require('gulp-inject');
	autoprefixer = require('gulp-autoprefixer'),
	plumber = require('gulp-plumber'),
	logger = require('fancy-log'),
	del = require('del'),
	sourcemaps = require('gulp-sourcemaps'),
	sync = require('browser-sync').create();

// Builds a CSS file from SCSS files.
// Includes error check, autoprefix, minify.
gulp.task('styles', function () {
	var injectAppFiles = gulp.src(
		[
			'src/styles/override/*.scss',
			'node_modules/bootstrap/scss/bootstrap.scss',
			'src/styles/*.scss'
		], 
		{read: false}
	);
 
	function transformFilepath(filepath) {
	  return '@import "' + filepath + '";';
	}
   
	var injectAppOptions = {
	  transform: transformFilepath,
	  starttag: '// inject:app',
	  endtag: '// endinject',
	  addRootSlash: false
	};
   
	return gulp.src('src/main.scss')
		.pipe(inject(injectAppFiles, injectAppOptions))
		.pipe(plumber(function (err) {
			logger.error('Styles Task Error');
			logger.error(err);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'})
			.on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/styles'))
		.pipe(sync.stream());
});

// Builds scripts from Bootstrap's JavaScript.
gulp.task('scripts', function() {
    return gulp.src([
			'node_modules/bootstrap/dist/js/bootstrap.min.js',
			'ls node_modules/jquery/dist/jquery.min.js',
			'node_modules/popper.js/dist/popper.min.js'
		])
        .pipe(gulp.dest("dist/scripts"))
		.pipe(sync.stream());
});

// Builds HTML with injected CSS.
gulp.task('html', ['styles'], function(){
	var injectFiles = gulp.src(['dist/styles/main.css']);
   
	var injectOptions = {
	  addRootSlash: false,
	  ignorePath: ['src', 'dist']
	};
   
	return gulp.src('src/index.html')
	  .pipe(inject(injectFiles, injectOptions))
	  .pipe(gulp.dest('dist'))
	  .pipe(sync.stream());
  });
  
// Deletes autogenerated files.
gulp.task(
	'clean', 
	function () {
	return del.sync([
		'dist'
	]);
});

// Deletes and then rebuilds autogenerated files.
gulp.task(
	'default', 
	['clean', 'html', 'scripts'], 
	function () {
});

// Watches for changes, then rebuilds in dist.
gulp.task(
	'watch', 
	['default'], 
	function () {
		sync.init({
			server: "./dist"  
		});

		gulp.watch([
			'src/styles/**/*.scss',
			'src/index.html',
			'node_modules/bootstrap/scss/bootstrap.scss'
		], ['html']);
		gulp.watch([
			'node_modules/bootstrap/dist/js/bootstrap.min.js',
			'node_modules/jquery/dist/jquery.min.js',
			'node_modules/popper/dist/js/popper.min.js'
		], ['scripts']);
});