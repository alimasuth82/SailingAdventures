const mysql = require('mysql2');

// Database connection
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Robotsaredead10',
    database: 'SailingAdventures',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.log('An error has occurred');
    } else {
        console.log('Connection successfully established!');
    }
});

// Add a boat with callback
exports.addBoat = (searchParams, cb) => {
    let sql = 'INSERT INTO Boat (B_name, B_type) VALUES (?, ?)';
    let data = [
        searchParams.get('B_name'),
        searchParams.get('B_type')
    ];

    connection.query(sql, data, (err) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else {
            cb(200, 'OK', 'Boat added');
        }
    });
};

// Format results for better display
const formatResults = (results) => {
    let formatted = '';
    for (let i = 0; i < results.length; i++) {
        formatted += `${results[i].B_Id} ${results[i].B_name} ${results[i].B_type}\n`;
    }
    return formatted;
};

// Get all boats with callback
exports.getBoats = (cb) => {
    let sql = 'SELECT * FROM Boat';
    connection.query(sql, (err, results) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else {
            if (results.length === 0) {
                cb(200, 'OK', 'Boat Table is empty');
            } else {
                cb(200, 'OK', formatResults(results));
            }
        }
    });
};

// Update a boat with callback
exports.updateBoat = (cb, id, searchParams) => {
    let sql = 'UPDATE Boat SET ';
    let data = [];
    let updates = [];

    if (searchParams.has('B_name')) {
        updates.push('B_name = ?');
        data.push(searchParams.get('B_name'));
    }
    if (searchParams.has('B_type')) {
        updates.push('B_type = ?');
        data.push(searchParams.get('B_type'));
    }

    sql += updates.join(', ') + ' WHERE B_Id = ?';
    data.push(id);

    connection.query(sql, data, (err) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else {
            cb(200, 'OK', 'Boat updated');
        }
    });
};

// Delete a boat with callback
exports.deleteBoat = (cb, id) => {
    let sql = 'DELETE FROM Boat WHERE B_Id = ?';
    
    connection.query(sql, id, (err, result) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else if (result.affectedRows === 0) {
            cb(404, 'Not Found', 'Record Not Found');
        } else {
            cb(200, 'OK', 'Boat has been deleted');
        }
    });
};