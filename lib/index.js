var fs = require('fs');
var express = require('express');
var glob = require('glob');
var deAsync = require('deasync');
var path = require('canonical-path');
var _ = require('lodash');

/**
 *
 * @constructor RouteController
 * @param {Object} app object
 * @routeFn {Array} router options
 *
 * */

function RouteController() {}


/**
 *
 * @name init
 * @param {Object} app object
 * @routeFn {Array} router options
 *
 * */

RouteController.prototype.init = function (app, options) {
    this.app = app;
    var _this = this;

    /**
     *
     * @name readRoutes
     * @function
     * @memberof init
     * @static
     * @param {Array} list of route file paths
     *
     * */

    function readRoutes(routes) {
        routes.forEach(function (routePath) {
            if (!fs.existsSync(routePath)) {
                throw new Error('Could not find route: ' + routePath);
            } else {
                var routerPath = path.resolve(__dirname, '../', routePath);
                var routerObj = require(routerPath)();
                _this.createRoute(routerObj);
            }
        });
    };

    if (options.routesDirectory) {
        this.routesDirectory = options.routesDirectory;
        var routeFiles = deAsync(glob)(options.routesDirectory); //...Amazing!!!
        readRoutes(routeFiles);
    } else throw new Error('I need a directory containing your routes');
    setErrorHandler(app);
};

/**
 *
 * @name createRoute
 * @param {Object} router object structure to build the route dynamically
 *
 * */

RouteController.prototype.createRoute = function (routeInfo) {
    var _this = this;
    var router = express.Router();
    routeInfo.routes.forEach(function(mountPath){
        var methods = _.pick(mountPath, ['post', 'get', 'put', 'delete']); //extend this to allow more verbs
        var route = router.route(mountPath.path);
        _.forOwn(methods, function (routeFn, method) {
            if(_.isArray(routeFn)){
                _.spread(route[method])(route)
                route[method].apply(route, [routeFn]);
            }
            route[method].apply(route, [routeFn]);
        });
    });
    _this.app.use(routeInfo.rootPath, router);
};



function setErrorHandler(app) {

    //Handle404
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                success:false,
                status:404,
                error:{
                    message: err.message
                }
            });
        });
    }

    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: {}
        });
    });
}


module.exports = new RouteController();