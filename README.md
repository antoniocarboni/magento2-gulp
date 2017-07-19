# magento2-gulp
A new gulpfile for Magento 2


## Requirements
- Node.js
- Unix-like OS

## Installation
1. Update your composer.json file:
```
“require”: {
	...
	“antoniocarboni/magento2-gulp”:"1.0.*”
},

 "repositories": [
    { "type": "vcs", "url":  "https://github.com/antoniocarboni/magento2-gulp" }
    ],
    
```
2. Go to directory `cd vendor/antoniocarboni/magento2-gulp`
3. Run `npm install`
4. Run `gulp install` 
5. Define your gulp configuration in `dev/configs.js`
6. This gulpfile uses a default grunt configuration for get the list of themes; for this reason, you have to change the default config file in `dev/tools/grunt/configs/themes.js`

## configs.js structure
The file `dev/configs.js` for this gulpfile has some options:

### options
- `sourcemap`: creates sourcemap during less compilation (true/false)
- `ninicss`: minify the compiled styles (true/false)
- `liveReload`: enable LiveReload Plugin (true/false)
### watch
- `singletheme`: if set, the watch task without arguments will only watch a specified theme as if it was declared (theme-name / false)
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
### browsersync
- `enabled`: enable browsersync
for more informations & all configurations visit [https://browsersync.io/docs](https://browsersync.io/docs) 
### mapVendor
- used to map theme's name with original vendor path

## Tasks List
- `install`: installs gulpfile in to Magento2 root & creates a configPath file
- `prepare-dev`: set developer mode & diables cache
- `default`: run less task
- `less`: compiles LESS files. Parameters:
- - `--[nometema]`: compile only for specific theme
- - `--map`: generates sourcemaps
- - `--min`: minify the css files compiled
- - `--sync`: enable BrowserSync
- - `--live`: enable LiveReload (it isn't working for now )
- `watch`: Watch for file changes and run processing task and/or browserSync reloading:
- - `--[nometema]`: watch only specific theme
- - `--map`: generates sourcemaps
- - `--min`: minify the css files compiled
- - `--sync`: enable BrowserSync
- - `--live`: enable LiveReload (it isn't working for now )
- - `--js`: watch also .js files
- - `--xml`: watch also xml layout files
- - `--phtml`: watch also .phtml files
- - `--html`: watch also .html files
- `browser-sync`: reload the browser page
- `exec`: executes dev:source-theme:deploy command 
- `deploy`: clean & deploy static file to pub/static.
- `clean`: cleans pub/static folder
- `clear`: clear Magento2 Cache
- - `clean`: cleans cache
- - `disable`: disables cache
- - `enable`: enables cache
- - `flush`: flushes cache storage
- `developer`: set Magento2 to developer mode