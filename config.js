module.exports = {
    dataDb: 'mongodb://127.0.0.1/myapp',
    defaultLogopath: '/mypublic/images/man.png',
    defaultBackpath: '/dist/img/photo1.png',
    defaultPosition: "0",
    positionJson: {
        0 : "未分配员工",
        11: "总经理",
        12: "研发部", 13: "行政部", 14: "销售部",
        21: "OA组", 22: "产品组", 23: "基础架构组", 24: "核心开发组", 25: "前端组",
        31: "人事管理组", 32: "薪资统计监管组", 33: "采购组",
            34: "IT服务组", 35: "物资管理组",
        41: "第一销售组", 42: "核心策略组", 43: "执行组", 44: "统计组"
    },

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
    env: process.env.NODE_ENV || 'production'   // 目前没使用
};
