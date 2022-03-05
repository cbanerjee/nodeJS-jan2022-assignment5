const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("./mongodb");
const { ObjectId } = require("mongodb");
const path = require("path")

const server = express();

mongodb.connect();
const db = () => mongodb.getCollection("bugs")

server.listen(3000, () => {
    console.log("Server is listening");
})

server.set("view engine", "ejs");
server.set("views",
    [path.join(__dirname, "./views")]);

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.raw);
server.use(express.json())

server.get("/", (req, res) => {
    console.log("Get req at /")

    db().find({}).toArray().then((data, err) => {
        if (err) {
            // console.log("ERR =");
            console.log(err);
            res.render("addbug");
        } else {

            for(let i = 0; i<data.length ; i++) {
                var status, deadline;
                deadline = data[i].createdAt + (3*86400);
                if(data[i].closedAt=='Not Yet') {
                    status = 'Open';
                } else {
                    status = 'Closed';
                }
                data[i]['slaDetails'] = new Date(deadline).toLocaleDateString();
                data[i]['status'] = status;
            }
            res.render("addbug", { data: data });
        }
    })
})

server.post("/add/", (req, res) => {
    const request = req.body;
    request['closedAt'] = 'Not Yet';
    request['createdAt'] = Date.now();
    db().insertOne({
            title: request.title,
            description: request.description,
            assignee: request.assignee,
            createdAt: request.createdAt,
            closedAt: request.closedAt
        })
        .then(response => {
            res.redirect("/");
        }, err => {
            res.redirect("/");
        })
})

server.get("/close/:id", (req, res) => {
    const id = req.params.id;
    db().findOneAndUpdate({ _id: ObjectId(id) }, {
        $set: {
            closedAt: Date.now()
        }
    }, { upsert: true, new: true }).then(resp => res.redirect("/"), err => { console.log(err); res.redirect("/") });

});

server.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    db().findOneAndDelete({ _id: ObjectId(id) });
    res.redirect("/");
});
