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
    gutil =         require('gulp-util');


/* ===========================================================
 - Get Paths
 ============================================================ */
var rootToPath          = '../../../',    // Relative path for Root
    rootToPathClone     = rootToPath,     // Used for internal gulp paths
    configPath          = false;          // Init var configPath for installer

// Check configPath.js exist
if(fs.existsSync('configPath.js')){
    configPath = require('./configPath').path;
}
if(fs.existsSync('vendor')){
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
    var deployTask = deployTaskConfig.enableDefaultTask;


    /* ==========================================================================
     // Enable and Override Configs by arguments
     ========================================================================== */

    if (sourceMaps === false) {
        sourceMaps = cmdArguments.indexOf("map");  // if --map is used, result 1
    }
    if (minicss === false) {
        minicss = cmdArguments.indexOf("min");  // if --map is used, result 1
    }
    if (browsersyncOn === false) {
        browsersyncOn = cmdArguments.indexOf("sync"); // if --sync is used, result 1
    }
    if (livereload() === false) {
        livereload = cmdArguments.indexOf("live"); // if --live is used, result 1
    }

    if (cmdArguments.indexOf("watch")) {
        if (watch_js === false) {
            watch_js = cmdArguments.indexOf("js");
        }
        if (watch_xml === false) {
            watch_xml = cmdArguments.indexOf("xml");
        }
        if (watch_phtml === false) {
            watch_phtml = cmdArguments.indexOf("phtml");
        }
        if (watch_html === false) {
            watch_html = cmdArguments.indexOf("html");
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
        gutil.log('Loading ',gutil.colors.yellow('Gulp Default Task'));
        deployCommand = deployTaskConfig.defaultTask;
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

            var vendorPath = '';

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

        vendorPath = './vendor/' + vendorPathConfigs[themeName];

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
        .pipe(gulpif(sourceMaps, sourcemaps.init()))
        // Less compilation
        .pipe(less().on('error', function(err) {
            console.log(err.error);
        }))
        // Minify css
        .pipe(gulpif(minicss, cssmin()))
        // Insert Source Maps
        .pipe(gulpif(sourceMaps, sourcemaps.write('.')))
        // Set Destionation
        .pipe(gulp.dest( path + 'css/'))
        // Set Browsersync stream for injection css
        .pipe(gulpif(browsersyncOn, browserSync.stream()))
    // Live reload
    //.pipe(gulpif(liveReload, livereload()))   // Not Work for injection,  TODO: resolve this bug
    ;
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


// Exec task
gulp.task('exec', function (cb) {
    if (themeName) {
        exec('php bin/magento dev:source-theme:deploy --locale="' + themesConfigs[themeName].locale + '" --area="' + themesConfigs[themeName].area + '" --theme="' + themesConfigs[themeName].name + '"', function (err, stdout, stderr) {
            console.log('\x1b[90m'+ stdout + '\x1b[0m');
            console.log('\x1b[31m'+ stderr + '\x1b[0m');
            cb(err);
        });
    }
    else {
        gutil.log('\x1b[31mUndefined Theme \x1b[0m');
    }
});

gulp.task('deploy', ['clean','static-content-deploy']);

// yoy Static content
gulp.task('static-content-deploy', function (cb) {
    gutil.log('Start', gutil.colors.cyan('Deploying Magento application'), '...');
    exec('php bin/magento setup:static-content:deploy ' + deployCommand +  '', function (err, stdout, stderr) {
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
            .pipe(vinylPaths(del))
            .pipe(gulp.dest('dist'));
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
require('gulp-task-loader')({
    dist:'extra'
});

