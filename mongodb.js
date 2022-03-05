const mongoDbClient = require("mongodb").MongoClient;

const url = "mongodb+srv://chuni1998:oqqFjTXFjUsqh5Ry@cluster0.fikhe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

var dbClient;

exports.connect = () => {
    mongoDbClient.connect(url).then(
        (client)=>{
            dbClient = client;
            console.log("MongoDb has been connected");
        },
        (err) => {
            console.log(err)
            console.log("retrying");
            this.connect();
        }
    )
}

exports.getCollection = (name) =>{
    return dbClient.db("myFirstDatabase").collection(name);
}