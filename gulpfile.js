var gulp        = require("gulp");
var fileImports = require("gulp-imports");
var header      = require("gulp-header");
var beautify    = require("gulp-beautify");
var hintNot     = require("gulp-hint-not");
var uglify      = require("gulp-uglify");
var rename      = require("gulp-rename");
var plato       = require("gulp-plato");
var rimraf      = require("gulp-rimraf");
var gutil       = require("gulp-util");
var express     = require("express");
var path        = require("path");
var pkg         = require("./package.json");
var open        = require("open");
var port        = 3080;

var banner = ["/**",
    " * <%= pkg.name %> - <%= pkg.description %>",
    " * Author: <%= pkg.author %>",
    " * Version: v<%= pkg.version %>",
    " * Url: <%= pkg.homepage %>",
    " * License: <%= pkg.license.type %>",
    " */",
    ""].join("\n");

gulp.task("combine", function() {
    gulp.src(["./src/conduit.js"])
        .pipe(header(banner, { pkg : pkg }))
        .pipe(fileImports())
        .pipe(hintNot())
        .pipe(beautify({ indentSize: 4, preserveNewlines: false }))
        .pipe(gulp.dest("./lib/"))
        .pipe(uglify({ compress: { negate_iife: false }}))
        .pipe(header(banner, { pkg : pkg }))
        .pipe(rename("conduit.min.js"))
        .pipe(gulp.dest("./lib/"));
});

gulp.task("default", function() {
    gulp.run("combine");
});

gulp.task("report", function () {
    gulp.src("./lib/conduit.js")
        .pipe(plato("report"));
});

var createServer = function(port) {
    var p = path.resolve("./");
    var app = express();
    app.use(express.static(p));
    app.listen(port, function() {
        gutil.log("Listening on", port);
    });

    return {
        app: app
    };
};

var servers;

gulp.task("server", function(){
    gulp.run("combine", "report");
    if(!servers) {
        servers = createServer(port);
    }
    open( "http://localhost:" + port + "/index.html" );
});