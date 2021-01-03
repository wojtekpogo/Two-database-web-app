//Constants declared to enable us to use MongoDb
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

//Constants the reference the DB name And collection
const dbName = 'headsOfStateDB';
const collName ='headsOfState';

var headsOfStateDB
var headOfState

//Get Connection into MongoDB
MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((client) =>{
       headsOfStateDB = client.db(dbName)
        headOfState = headsOfStateDB.collection(collName)
    })
    .catch((error) => {
        reject(error)
        console.log(error)
    })

    //Function that returns a promise of data to an array 
var getHeadsOfState = function(){
    return new Promise((resolve, reject) => {
       var cursor = headOfState.find() //returns cursor object
       cursor.toArray()
        .then((documents) => {
            resolve(documents)
        })
        .catch((error) => {
            reject(error)
        })
    })
}


var addHeadOfState = function(id, name){
    return new Promise((resolve,reject)=>{
        headOfState.insertOne({"_id":id,"headOfState":name})
        .then((result)=>{
            resolve(result)
        })
        .catch((error)=>{
            reject(error)
            console.log(error)
        })

    })
}

module.exports = {getHeadsOfState, addHeadOfState}
