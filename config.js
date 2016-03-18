module.exports = {
    dataDb: 'mongodb://127.0.0.1/myapp',
    defaultLogopath: '/mypublic/images/man.png',
    defaultBackpath: '/dist/img/photo1.png',
    defaultPosition: 'Team Member',

    defaultSearchUsername: 'default@qq.com',
    tmpUploadDir: './public/mypublic/uploads/',
    logoStoreDir: '/mypublic/uploads/logoups/',
    backStoreDir: '/mypublic/uploads/backups/',
    dropStoreDir: '/mypublic/uploads/filedrop/',

    sessionConfig: {
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        storeUrl: 'mongodb://127.0.0.1/myappSession'
    },
    faviconPath: './public/mypublic/images/favicon.ico',

    port: 3000,
    env: process.env.NODE_ENV || 'production'  // 目前没使用

};
