/*
    Ali Masuth - IT-207-B01

    This script sets up the Sailing Adventure Application Server with a MySQL database for managing 
    sailors, boats, and reservations. It includes the creation of the database and tables, as well as the 
    implementation of an http server that handles CRUD operations for the Sailors, Boats, and Reserves 
    tables via RESTful endpoints. This script also takes in custom modules regarding managing data for 
    sailors, boats, and reservations.

    Part 2 will involve implementing and using two stored procedures based on the specific business 
    criteria that was stated. The server will then be tested through POSTMAN for multiple cases with 
    various sets of information entered, ensuring that the stored procedures work as intended.
*/

const mysql = require('mysql2');
const http = require('http');
const { URL } = require('url');

const sailor = require('./lib/sailor');
const boat = require('./lib/boat');
const reserves = require('./lib/reserves');

// Database connection
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Robotsaredead10',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.log('An error has occurred');
    } else {
        console.log('Connection successfully established!');
    }
});

// SQL commands to create database and tables
let sql = `
    CREATE DATABASE IF NOT EXISTS SailingAdventures;
    USE SailingAdventures;
    CREATE TABLE IF NOT EXISTS Sailor (
        S_Id INT AUTO_INCREMENT PRIMARY KEY,
        S_name VARCHAR(50),
        B_date DATE,
        Rate INT
    );
    CREATE TABLE IF NOT EXISTS Boat (
        B_Id INT AUTO_INCREMENT PRIMARY KEY,
        B_name VARCHAR(50),
        B_type VARCHAR(50)
    );
    CREATE TABLE IF NOT EXISTS Reserves (
        S_id INT,
        B_Id INT,
        Day DATE,
        PRIMARY KEY (S_id, B_Id, Day),
        FOREIGN KEY (S_id) REFERENCES Sailor(S_Id),
        FOREIGN KEY (B_Id) REFERENCES Boat(B_Id)
    );
`;
connection.query(sql, (err) => {
    if (err) {
        console.log('Query failed');
    } else {
        console.log('Query success');
    }
});

connection.end((err) => {
    if (err) {
        console.log('An error has occurred');
    } else {
        console.log('Connection successfully ended!');
    }
});

// HTTP request handler
const requestHandler = (req, res) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const {pathname, searchParams} = new URL(req.url, baseURL);

    const endpoints = pathname.split('/');
    const path = endpoints[1];
    const code = endpoints[2];

    const cb = (statusCode, statusMessage, message) => {
        res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
        res.end(`${statusMessage}: ${message}`);
    };

    switch (req.method) {
        case 'GET':
            if (path === 'sailor') {
                sailor.getSailors(cb);
            } else if (path === 'boat') {
                boat.getBoats(cb);
            } else if (path === 'reserves') {
                reserves.getReserves(cb);
            } else {
                res.end('Invalid path specified');
            }
            break;
        case 'POST':
            if (path === 'sailor') {
                sailor.addSailor(searchParams, cb);
            } else if (path === 'boat') {
                boat.addBoat(searchParams, cb);
            } else if (path === 'reserves') {
                reserves.addReserve(searchParams, cb);
            } else {
                res.end('Invalid path specified');
            }
            break;
        case 'PUT':
            if (path === 'sailor') {
                sailor.updateSailor(cb, code, searchParams);
            } else if (path === 'boat') {
                boat.updateBoat(cb, code, searchParams);
            } else {
                res.end('Invalid path specified');
            }
            break;
        case 'DELETE':
            if (path === 'sailor') {
                sailor.deleteSailor(cb, code);
            } else if (path === 'boat') {
                boat.deleteBoat(cb, code);
            } else if (path === 'reserves') {
                reserves.deleteReserve(cb, searchParams);
            } else {
                res.end('Invalid path specified');
            }
            break;
        default:
            res.end('Invalid method selected');
            break;
    }
};

// Start server
const server = http.createServer(requestHandler);
server.listen(3000, () => {
    console.log('The server is listening on port 3000.');
});