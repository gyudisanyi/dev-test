module.exports={
    database: {
        HOST: "192.168.16.1", // user-defined bridge network ip address
        USER: "root",
        PASSWORD: "root",
        DB: "app",
        PORT: 3308,
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: true
    }
}