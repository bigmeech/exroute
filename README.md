### ExRoute

Manage and load your API routes without messing up your app.js file


## Installation
```
npm install exroute
```

## In your app.js file
```
routeController.init(app, {
    caseSensitive:false,
    mergeParams:false,
    strict:false,
    routesDirectory:'routes/**/*.js'
});
```


## A sample route file
```
function usersGet(req, res, next) {
    res.json({});
}

function createUser(res, req, next){
    res.json({});
}

function isAuth(){
    res.json({});
};

module.exports = function usersRoute() {
    return {
        rootPath: '/api/users',
        routes: [
            {
                path: '/',
                get: [ isAuth, usersGet],
                post:[ createUser ]
            }
        ]
    }
};
```
