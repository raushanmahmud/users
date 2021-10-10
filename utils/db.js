module.exports.getMongoConnectionString = function(username, password, host, port){
    let auth = username;
    if (password)
        auth += ':' + password;
    const connectionString = `mongodb://${auth}${((auth)? '@' : '')}${host}:${port}/sergektask?authSource=admin`;
    return connectionString;
}