# magento2-gulp


A new gulpfile for Magento 2


## Installation
1. Update your composer.json file:
```
“require-dev”: {
	...
	“antoniocarboni/magento2-gulp”:"2.0.*”
},

 "repositories": [
    { "type": "vcs", "url":  "https://github.com/magenio-it/magento2-gulp" }
    ],
    
```
2. Run composer update
3. Install node.js
4. Rename `package.gulp.json.sample` to `package.json`
5. Run `npm install`
6. Install gulp globally using `npm install -g gulp-cli`
7. Define your gulp configuration in `dev/gulp-configs.js` using the file sample gulp-configs.sample.js

## configs.js structure
The file `gulp-configs.js` for this gulpfile has some options:

### options
- `debug`: enable verbose mode (true/false)
- `liveReload`: enable LiveReload Plugin (true/false)
- `browsersync`: enable Browsersync Plugin (true/false)
- `cache-disable`: cache to keep disabled to default on developer mode
### less
- `sourcemap`: creates sourcemap during less compilation (true/false)
- `singletheme`: if set, the less task will only watch the specified theme to improve the speed of compile

### watch
- `js`: Enables watch task for .js files (true/false)
- `layout`: Enables watch task for .xml files (true/false)
- `template`: Enables watch task for .phtml files (true/false)
- `html`: Enables watch task for .html files (true/false)
- `media`: Enables watch task for media files (true/false)
- `mediaFolders`: add custom folders used for images, video or others file which aren't managed by magento direclty and which will contain new files; paths starts on root theme path
- `notifyAll`: Watch everything on vendor folder theme. The watch task will notice changes (added or deleted files) that require an 'gulp exec' for generate symlinks in pub folder 
### deploy
- `enableDefaultTask`: if set, task deploy without arguments uses a default task set (true/false)
- `defaultTask`:  default task to run if enableDefaultTask is enabled
- `staticFolderToClear`: set full path of pub/static theme to clear before deploy.
### exec
- `enableDefaultTask`: if set, task deploy without arguments uses a default task set (true/false)
- `defaultTask`:  default task to run if enableDefaultTask is enabled
- `staticFolderToClear`: set full path of pub/static theme to clear before to soure theme deploy.
### browsersync
for more informations & all configurations visit [https://browsersync.io/docs](https://browsersync.io/docs) 

## Tasks List 
- `prepare-dev`: set developer mode & diables cache
- `default`: run less task
- `less`: compiles LESS files. Parameters:
- - `--[nometema]`: compile only for specific theme
- `watch`: Watch for file changes and run processing task and/or browserSync reloading:
- - `--[nometema]`: watch only specific theme
- `browser-sync`: reload the browser page
- `exec`: executes dev:source-theme:deploy command
- `cache-disable`: disable specific cache
- `cache-clear`: clear Magento2 Cache
- `developer`: set Magento2 to developer mode
