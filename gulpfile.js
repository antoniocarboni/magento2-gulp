/*****************************************************************************
 *  =========================== OPTIONS ====================================
 *
 *
******************************************************************************/



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
 - Get Paths
 ============================================================ */
var rootToPath              = '../../../',    // Relative path for Root
    configPathTaskLoader    = './dev/',          // Init var configPath for installer
    rootToPathClone         = rootToPath,     // Used for internal gulp paths
    configPath              = false;          // Init var configPath for installer
    extPermittedMedia       = ['png','jpg','jpeg','gif','svg','ico','bmp','tiff','exif','bat'];

// Check configPath.js exist
if(fs.existsSync('configPath.js')){
    configPath = require('./configPath').path;
    configPathTaskLoader = configPath;

}
if(fs.existsSync('vendor')){
    configPath = require('./configPath').path;
    configPathTaskLoader = require(rootToPath +'configPath').path;
    rootToPath = '';
}


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


/* ===========================================================
 - Installer
 ============================================================ */

gulp.task('install', function(cb) {
    if(!configPath) {
        if (gulp.task('logo')) {
            runSequence('logo');
        }
        var customPathInstall = 'dev/tools/gulp2';
        if(argumentsClone[0]){
            customPathInstall = argumentsClone[0];
        }

        gutil.log('Installing gulpfile on: ', gutil.colors.cyan(customPathInstall));

        configPath = customPathInstall;
        var symlink = require('gulp-symlink');
        originPath = 'dev';
        originPathGulpFile = 'gulpfile.js';

        destinationPath = '../../../';

        exec('rm -rf '+ destinationPath +'gulpfile.js ' + destinationPath + configPath);

        gutil.log('Creation symlink...');

        gulp.src(originPath)
            .pipe(symlink(destinationPath + configPath));
        gulp.src(originPathGulpFile)
            .pipe(symlink(destinationPath +'gulpfile.js'));


        gutil.log('Creating configPath file...');

        gulp.src(originPath)
            .pipe(file('configPath.js','module.exports = { path:  \''+ configPath +'/\' };'))
            .pipe(gulp.dest(destinationPath));

        gulp.src(originPath)
            .pipe(file('configPath.js','module.exports = { path:  \''+ rootToPath + configPath +'/\' };'))
            .pipe(gulp.dest('./'));

        gutil.log(gutil.colors.green('configPath file created'));
    }
    else {
        gutil.log('\x1b[31mScript already installed"\x1b[0m');
    }
});


// Check if script is installed on dev folder
if(!configPath) {
    if(commands[0] !== 'install') {
        gutil.log('\x1b[31mScript not installed. Please run "gulp install"\x1b[0m');
        process.exit();
    }
}






if(configPath) {
    /* ==========================================================================
     - Global Configurations
     ========================================================================== */
    var themesConfigs = require(rootToPathClone + './dev/tools/grunt/configs/themes'),
        gulpConfigs = require(configPath + 'configs').options,
        watchConfigs = require(configPath + 'configs').watch,
        browsersyncConfigs = require(configPath + 'configs').browsersync,
        deployTaskConfig = require(configPath + 'configs').deploy,
        execTaskConfig = require(configPath + 'configs').exec,
        vendorPathConfigs = require(configPath + 'configs').mapVendor;



    /* ==========================================================================
     Variables & Default Configs
     ========================================================================== */
    var sourceMaps = gulpConfigs.sourcemap;
    var minicss = gulpConfigs.minicss;
    var liveReload = gulpConfigs.liveReload;
    var browsersyncOn = browsersyncConfigs.enabled;
    var watch_js = watchConfigs.js;
    var watch_xml = watchConfigs.layout;
    var watch_phtml = watchConfigs.template;
    var watch_html = watchConfigs.html;
    var watch_media = watchConfigs.media;
    var notify_all = watchConfigs.notifyAll;
    var watch_img_folders = watchConfigs.mediaFolders;
    var deployTask = deployTaskConfig.enableDefaultTask;
    var execyTask = execTaskConfig.enableDefaultTask;

    var srcImage = [];


    /* ==========================================================================
     // Enable and Override Configs by arguments
     ========================================================================== */

    if (sourceMaps === false && cmdArguments.indexOf("map") >= 0 ) {  // if --map is used, result 1
        sourceMaps = true;
    }
    if (minicss === false && cmdArguments.indexOf("min") >= 0 ) { // if --map is used, result 1
        minicss = true;
    }
    if (browsersyncOn === false && cmdArguments.indexOf("sync") >= 0) {    // if --sync is used, result 1
        browsersyncOn = true;
    }
    if (livereload() === false && cmdArguments.indexOf("live") >= 0) {    // if --live is used, result 1
        livereload = true;
    }

    if (cmdArguments.indexOf("watch")) {
        if (watch_js === false && cmdArguments.indexOf("js") >= 0) {
            watch_js = true;
        }
        if (watch_xml === false && cmdArguments.indexOf("xml") >= 0) {
            watch_xml = true;
        }
        if (watch_phtml === false && cmdArguments.indexOf("phtml") >= 0) {
            watch_phtml = true;
        }
        if (watch_html === false && cmdArguments.indexOf("html") >= 0) {
            watch_html = true;
        }
        if (watch_media === false && cmdArguments.indexOf("media") >= 0) {
            watch_media = true;
        }
        if (notify_all === false && cmdArguments.indexOf("notify") >= 0) {
            notify_all = true;
        }
    }

    var lessFiles = [];
    var cssFiles = [];
    var themeList = [];
    var staticFolders = [];
    var pathsThemes = [];
    var skipThemeCheck = false;   // Skip Theme Check Declaration (for direct command)
    var themeName = '';   // Skip Theme Check Declaration (for direct command)

}


/* ===========================================================
 - Prepares Data for Specific Tasks
 ============================================================ */
if(command === 'deploy') {
    var deployCommand = '';
    if(deployTask && !cmdArguments[0]) {  //if default task is enabled & command haven't arguments
        deployCommand = deployTaskConfig.defaultTask;
        gutil.log('Loading ',gutil.colors.yellow('Gulp Default Task: '), gutil.colors.green(deployCommand));
        skipThemeCheck = true;
        pathsThemes = deployTaskConfig.staticFolderToClear;
    }
    else if(deployTask && cmdArguments[0] === 'all') {
        gutil.log('Run',gutil.colors.yellow('global deploy'));
        skipThemeCheck = false;
    }
    else {
        //TODO: to expand function for accept parameters
        if (cmdArguments[0]) {
            deployCommand += ' --language ' + cmdArguments[0];
        }
        if (cmdArguments[1]) {
            themeName = cmdArguments[1];
            deployCommand += ' --theme ' + themesConfigs[themeName].name;
        }
    }
}
else if(command === 'exec') {
    var execCommand = '';
    if(deployTask && !cmdArguments[0]) {  //if default task is enabled & command haven't arguments
        execCommand = execTaskConfig.defaultTask;
        gutil.log('Loading ',gutil.colors.yellow('Gulp Default Task: '), gutil.colors.green(execCommand));
        skipThemeCheck = true;
        pathsThemes = execTaskConfig.staticFolderToClear;
    }
    else {
        //TODO: to expand function for accept parameters
        if (cmdArguments[0]) {
            themeName = cmdArguments[0];
            execCommand += ' --locale="' + themesConfigs[themeName].locale + '" --area="' + themesConfigs[themeName].area + '" --theme="' + themesConfigs[themeName].name + '"';
        }
    }
}
else if(command === 'clear' || command === 'developer') {
    skipThemeCheck = true;
    var clearCacheParam = cmdArguments[0];
}
else if(command === 'watch' && watchConfigs.singletheme !== false) {
    themeName = watchConfigs.singletheme;
}
else if(command === 'install') {
    skipThemeCheck = true;
}
else {
    themeName = cmdArguments[0];
}


/* ===========================================================
 - Get themes paths
 ============================================================ */
if(!skipThemeCheck) {
    if (!themeName) {
        gutil.log('No theme specified...');
        gutil.log('Get All theme availables....');
        for (i in themesConfigs) {
            var path = './pub/static/' + themesConfigs[i].area + '/' + themesConfigs[i].name + '/' + themesConfigs[i].locale + '/';
            if (!pathsThemes.includes(path)) {
                pathsThemes.push(path);
            }

            var vendorPath = '';   // TODO: manage multiple vendor path
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
    }
    else {
        gutil.log('Declared Theme: ', gutil.colors.green(themeName));
        var path = './pub/static/' + themesConfigs[themeName].area + '/' + themesConfigs[themeName].name + '/' + themesConfigs[themeName].locale + '/';
        pathsThemes.push(path);

        vendorPath = 'vendor/' + vendorPathConfigs[themeName];

        srcImage.push(vendorPath + 'web/images/*',vendorPath + 'media/*');
        if(watch_img_folders) {
            for (i in watch_img_folders ) {
                srcImage.push(vendorPath + watch_img_folders[i]);
            }
        }

        /// Add LESS theme files
        for (i in themesConfigs[themeName].files) {
            lessFiles.push(path + themesConfigs[themeName].files[i] + '.' + themesConfigs[themeName].dsl);
        }
        // Add CSS theme files
        for (i in themesConfigs[themeName].files) {
            cssFiles.push(path + themesConfigs[themeName].files[i] + '.' + 'css');
        }
        staticFolders.push('./pub/static/' + themesConfigs[themeName].area + '/' + themesConfigs[themeName].name);
    }
}



/* ===========================================================
 - TASKS
 ============================================================ */

gulp.task('default', ['less']);


gulp.task('less', function() {
    console.log('================================================================');
    gutil.log('Compiling \x1b[1m\x1b[92mLess\x1b[0m  - \x1b[1m\x1b[92m' + lessFiles.length + ' files \x1b[0m - \x1b[1m\x1b[92m' + themeList.length + ' themes:\x1b[0m' );

    // GET list theme processed
    for (c=0; c <= themeList.length - 1; c++) {
        console.log(' - \x1b[92m' + themeList[c] + ' theme \x1b[0m');
    }

    console.log('------------------------------------------');

    // Get list file less to compile
    for (i in lessFiles) {
        console.log(' - \x1b[92m',lessFiles[i],'\x1b[0m');
    }

    console.log('------------------------------------------');

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

    console.log('------------------------------------------');
});

// Reload BrowserSync
gulp.task('browser-sync', function (cb) {
    gutil.log('- BrowserSync:\x1b[32m', ' Reloading..........','\x1b[0m');
    browserSync.reload();
    cb();
});


// Watcher task
gulp.task('watch', function() {
    //TODO: Watch multiple themes
    if(!themeName){
        gutil.log('\x1b[31mPlease specify a theme"\x1b[0m');
        process.exit();
    }
    console.log('================================================================');
    gutil.log( 'Watching \x1b[1m\x1b[92m', themesConfigs[themeName].area + '/' + themesConfigs[themeName].name  ,'\x1b[0m' );

    /* if (liveReload > 0) {
     console.log('- Livereload:\x1b[32m', ' * Enabled *','\x1b[0m');
     livereload.listen();
     } */

    console.log('------------------------------------------');

    // Init browsersync
    if(browsersyncOn) {
        gutil.log('- BrowserSync:\x1b[32m', ' Initializing..........','\x1b[0m');
        browserSync.init(browsersyncConfigs.configs);
        console.log('------------------------------------------');
    }

    // Watch less files
    gulp.watch([path + '**/*.less'],['less']);

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

    // Watch all files & notify for files added or deleted
    if(notify_all) {
        gulp.watch([vendorPath + '/**/*'], function (event) {
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

    if(watch_js) {
        gutil.log('Add \x1b[32mJS files\x1b[0m to watching...');
        gulp.watch([path + '**/*.js'],['browser-sync']).on('change', function(changed, stats) {
            gutil.log('Changed File: \x1b[36m' + changed.path + '\x1b[0m');
        });
    }
    if(watch_html) {
        gutil.log('Add \x1b[32m.html files\x1b[0m to watching...');
        gulp.watch([path + '**/*.html'],['browser-sync']).on('change', function(changed, stats) {
            gutil.log('Changed File: \x1b[36m' + changed.path + '\x1b[0m');
        });
    }
    if(watch_phtml) {
        gutil.log('Add \x1b[32m.phtml files\x1b[0m to watching...');
        gulp.watch([vendorPath + '**/*.phtml'],['browser-sync']).on('change', function(changed, stats) {
            gutil.log('Changed File: \x1b[36m' + changed.path + '\x1b[0m');
        });
    }
    if(watch_xml) {
        gutil.log('Add \x1b[32mlayout xml files\x1b[0m to watching...');
        gulp.watch([vendorPath + '**/*.xml'],['browser-sync']).on('change', function(changed, stats) {
            gutil.log('Changed File: \x1b[36m' + changed.path + '\x1b[0m');
        });
    }

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
        browserSync.init(browsersyncConfigs.configs);
        console.log('------------------------------------------');
    }

    gulp.watch([vendorPath + '/**/*'], function (event) {
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

});


// Exec task
gulp.task('exec', ['clean','source-theme-deploy']);

gulp.task('deploy', ['clean','static-content-deploy']);

// deploy Static content
gulp.task('static-content-deploy', function (cb) {
    gutil.log('Start', gutil.colors.cyan('Deploying Magento application'), '...');
    exec('php bin/magento setup:static-content:deploy ' + deployCommand +  '', function (err, stdout, stderr) {
        console.log('\x1b[90m'+ stdout + '\x1b[0m');
        console.log('\x1b[31m'+ stderr + '\x1b[0m');
        cb(err);
    });
});


// dev source theme deploy
gulp.task('source-theme-deploy', function (cb) {
    exec('php bin/magento dev:source-theme:deploy ' + execCommand + '', function (err, stdout, stderr) {
        console.log('\x1b[90m'+ stdout + '\x1b[0m');
        console.log('\x1b[31m'+ stderr + '\x1b[0m');
        cb(err);
    });
});


// cache flush task
gulp.task('clean', function (cb) {
    for (i in pathsThemes) {
        gutil.log('Cleaning ' + gutil.colors.magenta(pathsThemes[i]));
        gulp.src(pathsThemes[i])
            .pipe(vinylPaths(del));
    }
    gutil.log('"pub/static" folders specified are empty now.');
});


// cache flush task
gulp.task('clear', function (cb) {
    exec('php bin/magento cache:' + clearCacheParam, function (err, stdout, stderr) {
        gutil.log(clearCacheParam + ' cache.......');
        console.log('\x1b[90m'+ stdout + '\x1b[0m');
        console.log('\x1b[31m'+ stderr + '\x1b[0m');
        cb(err);
    });
});


gulp.task('developer', function (cb) {
    exec('php ' + rootToPath + 'bin/magento deploy:mode:set developer', function (err, stdout, stderr) {
        gutil.log('Setting Developer Mode.......');
        gutil.log('\x1b[32m'+ stdout + '\x1b[0m');
        console.log('\x1b[31m'+ stderr + '\x1b[0m');
        cb(err);
    });
});


gulp.task('prepare-dev', function(cb) {
    runSequence('developer','cache-disable','clear', cb);
});

// TODO:  integrate CSS e LESS lint


// Load Custom Extra Tasks
require('gulp-task-loader')(configPathTaskLoader + 'gulp-tasks');

