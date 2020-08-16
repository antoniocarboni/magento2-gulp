/*****************************************************************************
 ** Author: Antonio Carboni
 ** Email: a.carboni@magenio.com
 ** Website: https://www.magenio.com/
 ****************************************************************************/



/* ===========================================================
 - Required Modules
 ============================================================ */
var gulp =          require('gulp'),
    fs =            require('fs'),
    file =          require('gulp-file'),
    fileExists =    require('file-exists'),
    less =          require('gulp-less'),
    sourcemaps =    require('gulp-sourcemaps'),
    cssmin =        require('gulp-cssmin'),
    // lesshint =    require('gulp-lesshint'),
    // csslint =     require('gulp-csslint'),
    livereload =    require('gulp-livereload'),
    browserSync =   require('browser-sync').create(),
    gulpif =        require('gulp-if'),
    colors =        require('colors/safe'),
    exec =          require('child_process').exec,
    runSequence =   require('run-sequence'),
    del =           require('del'),
    vinylPaths =    require('vinyl-paths'),
    ext =           require('file-extension'),
    gutil =         require('gulp-util');




/* ===========================================================
 - Get Commands & arguments
 ============================================================ */
var cmdArguments = [];
var commands = [];

var nargv = 2; // fix some problem with different nargv
for (i=nargv; i <= process.argv.length - 1; i++) {
    if(i > nargv) {
        if (!process.argv[i]) {
            return false;
        }
        else {
            var argument = process.argv[i].toString().replace('--', '');
            cmdArguments.push(argument);
        }
    }
    else {
        var command = process.argv[i];
        commands.push(command);
    }
}
argumentsClone = cmdArguments;  // for install task

gulp.cdebug = function(msg) {
    if(gulpConfigs.debug) {
        console.log('#######: ' + msg);
    }
};


/* ==========================================================================
    - Global Configurations
    ========================================================================== */
var gruntThemes             = require('./dev/tools/grunt/configs/themes.js');
gruntLocalThemes        = require('./dev/tools/grunt/configs/local-themes.js');
configPath = require('./gulp-configs');
gulpConfigs = configPath.options,
    lessConfigs = configPath.less,
    watchConfigs = configPath.watch,
    browsersyncConfigs = configPath.browsersync
execTaskConfig = configPath.exec

gulp.cdebug('==============================================================');
gulp.cdebug('gulp configs:');
gulp.cdebug(configPath);
gulp.cdebug('==============================================================');

/* ==========================================================================
    Variables & Default Configs
========================================================================== */

var sourceMaps = gulpConfigs.sourcemap;
var minicss = gulpConfigs.minicss;
var liveReload = gulpConfigs.liveReload;
var browsersyncOn = gulpConfigs.browsersync;
var watch_js = watchConfigs.js;
var watch_xml = watchConfigs.layout;
var watch_phtml = watchConfigs.template;
var watch_html = watchConfigs.html;
var watch_media = watchConfigs.media;
var notify_all = watchConfigs.notifyAll;
var watch_img_folders = watchConfigs.mediaFolders;

var srcImage = [];

if(gruntLocalThemes) {
    themesConfigs = gruntLocalThemes;
    gulp.cdebug('Loaded local-themes.js:');
    gulp.cdebug(themesConfigs);
    gulp.cdebug('==============================================================');
}
else {
    themesConfigs = gruntThemes;
    gulp.cdebug('Loaded themes.js:');
    gulp.cdebug(themesConfigs);
    gulp.cdebug('==============================================================');
}


var lessFiles = [];
var cssFiles = [];
var themeList = [];
var staticFolders = [];
var paths = [];
var themeName = '';   // Skip Theme Check Declaration (for direct command)



/* ===========================================================
 - Prepares Data for Specific Tasks
 ============================================================ */
if(command === 'less' && lessConfigs.singletheme ) {
    themeName = lessConfigs.singletheme;
}
else if(command === 'exec') {
    var execCommand = '';
}
else if(command === 'watch' && lessConfigs.singletheme) {
    themeName = lessConfigs.singletheme;
}
else {
    themeName = cmdArguments[0];
}


/* ===========================================================
 - Get themes paths
 ============================================================ */

var paths = [];
if(command == 'watch'|| command == 'exec' || command == 'less') {
    if (!themeName) {

        gutil.log('No theme specified...');
        gutil.log('Get All theme availables....');
        for (i in themesConfigs) {
            var path = './pub/static/' + themesConfigs[i].area + '/' + themesConfigs[i].name + '/' + themesConfigs[i].locale + '/';

            if (!paths.includes(path)) {
                paths.push(path);
            }

            //  var vendorPath = '';   // TODO: manage multiple vendor path
            //srcImage.push(vendorPath + 'images/',vendorPath + 'media/');

            // Add LESS theme files
            for (j in themesConfigs[i].files) {
                lessFiles.push(path + themesConfigs[i].files[j] + '.' + themesConfigs[i].dsl);
            }
            // Add CSS theme files
            for (j in themesConfigs[i].files) {
                cssFiles.push(path + themesConfigs[i].files[j] + '.' + 'css');
            }
            themeList.push(themesConfigs[i].name);
            staticFolders.push('./pub/static/' + themesConfigs[i].area + '/' + themesConfigs[i].name);

        }
    } else {
        gutil.log('Declared Theme: ', gutil.colors.green(themeName));
        if (!themesConfigs[themeName]) {
            gutil.log('Theme ' + [themeName] + ' not exist.');
            process.exit();
        }
        var path = './pub/static/' + themesConfigs[themeName].area + '/' + themesConfigs[themeName].name + '/' + themesConfigs[themeName].locale + '/';
        paths.push(path);

        /* vendorPath = 'vendor/' + vendorPathConfigs[themeName];

        srcImage.push(vendorPath + 'web/images/*',vendorPath + 'media/*');
        if(watch_img_folders) {
            for (i in watch_img_folders ) {
                srcImage.push(vendorPath + watch_img_folders[i]);
            }
        } */

        /// Add LESS theme files
        for (i in themesConfigs[themeName].files) {
            lessFiles.push(path + themesConfigs[themeName].files[i] + '.' + themesConfigs[themeName].dsl);
        }
        // Add CSS theme files
        for (i in themesConfigs[themeName].files) {
            cssFiles.push(path + themesConfigs[themeName].files[i] + '.' + 'css');
        }
        themeList.push(themesConfigs[themeName].name);
        staticFolders.push('./pub/static/' + themesConfigs[themeName].area + '/' + themesConfigs[themeName].name);
    }
}




/* ===========================================================
 - TASKS
 ============================================================ */

gulp.task('default', ['less']);


gulp.task('less', function() {
    gulp.cdebug('==============================================================');
    gulp.cdebug('Compiling \x1b[1m\x1b[92mLess\x1b[0m  - \x1b[1m\x1b[92m' + lessFiles.length + ' files \x1b[0m - \x1b[1m\x1b[92m' + themeList.length + ' themes:\x1b[0m' );

    // GET list theme processed
    for (c=0; c <= themeList.length - 1; c++) {
        gulp.cdebug('Theme:');
        gulp.cdebug('- \x1b[92m' + themeList[c] + ' theme \x1b[0m');
    }

    // Get list file less to compile
    gulp.cdebug('Files:');
    for (i in lessFiles) {
        gulp.cdebug('- \x1b[92m' + lessFiles[i] +'\x1b[0m');
    }

    gulp.src(lessFiles)
        // Source map
        .pipe(gulpif(sourceMaps, sourcemaps.init({largeFile: true})))
        // Less compilation
        .pipe(less().on('error', function(err) {
            console.log(err.error);
        }))
        // Minify css
        .pipe(gulpif(minicss, cssmin()))
        // Insert Source Maps
        .pipe(gulpif(sourceMaps, sourcemaps.write()))
        // Set Destionation
        .pipe(gulp.dest( path + 'css/'))
        // Set Browsersync stream for injection css
        .pipe(gulpif(browsersyncOn, browserSync.stream()))

        .on('error', gutil.log);
    // Live reload
    //.pipe(gulpif(liveReload, livereload()))   // Not Work for injection,  TODO: resolve this bug

    gulp.cdebug('==============================================================');
});

// Reload BrowserSync
gulp.task('browser-sync', function (cb) {
    gutil.log('- BrowserSync:\x1b[32m', ' Reloading..........','\x1b[0m');
    browserSync.reload();
    cb();
});


// Watcher task
gulp.task('watch', function() {

    gulp.cdebug('==============================================================');
    if (liveReload > 0) {
        gulp.cdebug('- Livereload:\x1b[32m', ' * Enabled *','\x1b[0m');
        livereload.listen();
        gulp.cdebug('==============================================================');
    }

    // Init browsersync
    if(browsersyncOn) {
        gulp.cdebug('- BrowserSync:\x1b[32m  Initializing.......... \x1b[0m');
        browserSync.init(browsersyncConfigs);
        gulp.cdebug('==============================================================');
    }
    // GET list theme processed
    for (c=0; c <= themeList.length - 1; c++) {
        gutil.log( 'Watching \x1b[1m\x1b[92m', themeList[c]  ,'\x1b[0m' );
    }
    pathsToWatch = paths.map(i => i + '**/*.less');
    gulp.watch(pathsToWatch,['less']);

    gulp.cdebug('Paths to watch');
    gulp.cdebug('- BrowserSync:\x1b[32m' + pathsToWatch + '\x1b[0m');
    gulp.cdebug('==============================================================');

    /*
    // Watch Images & media
    if(watch_media) {
        gulp.watch('vendor/bitbull/theme-frontend-goldenpoint/web/images/*', function (event) {

            var symlink = require('gulp-symlink');
            var delSymlink = require('del-symlinks');

            if (extPermittedMedia.includes(ext(event.path))) {
                if (event.type === 'deleted') {
                    gutil.log(gutil.colors.red('You have deleted a File: \x1b[91m' + event.path + '\x1b[0m'));
                    var partialPathChanged = event.path.replace(process.cwd() + '/' + vendorPath, '');
                    delSymlink(staticFolders + '/' + themesConfigs[themeName].locale + '/' + partialPathChanged);
                    gutil.log(gutil.colors.red('Deleted symlink from: \x1b[91m' + vendorPath + partialPathChanged + '\x1b[0m'));

                }
                if (event.type === 'added') {
                    gutil.log(gutil.colors.red('You have added a File: \x1b[91m' + event.path + '\x1b[0m'));
                    var partialPathChanged = event.path.replace(process.cwd() + '/' + vendorPath, '');
                    pathToSymlink = staticFolders + '/' + themesConfigs[themeName].locale + '/' + partialPathChanged;
                    gulp.src(event.path)
                        .pipe(symlink(pathToSymlink));
                    gutil.log(gutil.colors.red('Added symlink from: \x1b[91m' + pathToSymlink + '\x1b[0m'));
                }
            }
        });
    }
   */

    // Watch all files & notify for files added or deleted
    /*
    if(notify_all) {
        gulp.watch([vendorPath + '/4**4/4*4'], function (event) {
            if(!watch_media || !extPermittedMedia.includes(ext(event.path))) {
                if (event.type === 'deleted' || event.type === 'added') {
                    gutil.log(gutil.colors.red('--------------------------------------------------------------------'));
                    gutil.log(gutil.colors.red('--------------------------------------------------------------------'));
                    gutil.log(gutil.colors.red('!!! - You have ' + event.type + ' a File: \x1b[91m' + event.path + '\x1b[0m'));
                    gutil.log(gutil.colors.red('!!! - You need to stop watch task and run "\x1b[91mgulp exec --' + themeName + '\x1b[0m'));
                    gutil.log(gutil.colors.red('--------------------------------------------------------------------'));
                    gutil.log(gutil.colors.red('--------------------------------------------------------------------'));

                }
            }
        });
    }
    */


});

gulp.task('superwatch', function () {
    //TODO: Watch multiple themes
    if(!themeName){
        gutil.log('\x1b[31mPlease specify a theme"\x1b[0m');
        process.exit();
    }
    console.log('================================================================');
    gutil.log( 'Watching \x1b[1m\x1b[92m', themesConfigs[themeName].area + '/' + themesConfigs[themeName].name  ,'\x1b[0m' );

    console.log('------------------------------------------');

    // Init browsersync
    if(browsersyncOn) {
        gutil.log('- BrowserSync:\x1b[32m', ' Initializing..........','\x1b[0m');
        browserSync.init(browsersyncConfigs);
        console.log('------------------------------------------');
    }

    /*
    gulp.watch([vendorPath + '4/**4/4*4'], function (event) {
        if(!watch_media || watch_media && !extPermittedMedia.includes(ext(event.path))) {
            if (event.type === 'deleted' || event.type === 'added') {
                gutil.log(gutil.colors.red('--------------------------------------------------------------------'));
                gutil.log(gutil.colors.red('--------------------------------------------------------------------'));
                gutil.log(gutil.colors.red('!!! - You have ' + event.type + ' a File: \x1b[91m' + event.path + '\x1b[0m'));
                gutil.log(gutil.colors.red('!!! - You need to stop watch task and run "\x1b[91mgulp exec --' + themeName + '"\x1b[0m'));
                gutil.log(gutil.colors.red('--------------------------------------------------------------------'));
                gutil.log(gutil.colors.red('--------------------------------------------------------------------'));

            }
        }
    });
*/

});


// Exec task
gulp.task('exec', ['clean','source-theme-deploy']);



// dev source theme deploy
gulp.task('source-theme-deploy', function (cb) {

    gulp.cdebug('==============================================================');
    gulp.cdebug('SOURCE THEME DEPLOY... ');
    var themesToDeploy = [];
    if(!themeName) {
        themesToDeploy = themesConfigs;
    }
    else {
        themesToDeploy.push(themesConfigs[themeName]);
    }


    gulp.cdebug('Theme to Deploy:');
    gulp.cdebug(themesToDeploy);

    var allErr = '';
    for (i in themesToDeploy) {
        exec('php bin/magento dev:source-theme:deploy ' +
            ' --locale=' + themesToDeploy[i].locale +
            ' --area=' + themesToDeploy[i].area +
            ' --theme=' + themesToDeploy[i].name +
            ' ' + themesToDeploy[i].files.join(' ') +
            '', function (err, stdout, stderr) {

            gulp.cdebug('\x1b[90m'+ stdout + '\x1b[0m');
            gulp.cdebug('\x1b[31m'+ stderr + '\x1b[0m');
            allErr = err;
        });
    }
    cb(allErr);
});


// cache flush task
gulp.task('clean', function (cb) {

    gulp.cdebug('==============================================================');
    gulp.cdebug('Clean folder of static files.. ');
    for (i in paths) {
        gutil.log('Cleaning ' + gutil.colors.magenta(paths[i]));
        gulp.src(paths[i])
            .pipe(vinylPaths(del));
    }
    gutil.log('"pub/static" folders specified are empty now.');
});


// cache flush task
gulp.task('cache-clear', function (cb) {
    gulp.cdebug('==============================================================');
    gulp.cdebug('CACHE FLUSH ');
    exec('php bin/magento cache:flush' , function (err, stdout, stderr) {
        gutil.log('Clearing cache.......');
        gulp.cdebug('\x1b[90m'+ stdout + '\x1b[0m');
        gulp.cdebug('\x1b[31m'+ stderr + '\x1b[0m');
        cb(err);
    });
});

// cache flush task
gulp.task('cache-disable', function (cb) {
    gulp.cdebug('==============================================================');
    gulp.cdebug('DISABLE SPECIFIC CACHE ');
    exec('php bin/magento cache:disable ' + configPath.options.cache_disable , function (err, stdout, stderr) {
        gutil.log('Disabling specific cache: ' + configPath.options.cache_disable);
        gulp.cdebug('\x1b[90m'+ stdout + '\x1b[0m');
        gulp.cdebug('\x1b[31m'+ stderr + '\x1b[0m');
        cb(err);
    });
});


gulp.task('developer', function (cb) {
    gulp.cdebug('==============================================================');
    gulp.cdebug('DEPLOY MODE DEVELOPER ');
    exec('php ' + rootToPath + 'bin/magento deploy:mode:set developer', function (err, stdout, stderr) {
        gutil.log('Setting Developer Mode.......');
        gulp.cdebug('\x1b[32m'+ stdout + '\x1b[0m');
        gulp.cdebug('\x1b[31m'+ stderr + '\x1b[0m');
        cb(err);
    });
});


gulp.task('prepare-dev', function(cb) {
    runSequence('developer','cache-clear','cache-disable', cb);
});


// Load Custom Extra Tasks
require('gulp-task-loader')('./dev/gulp-tasks');
