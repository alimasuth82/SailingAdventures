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

// Add a sailor with callback
exports.addSailor = (searchParams, cb) => {
    let sql = `
    CALL InsertSailor(?, ?, ?, @message);
    SELECT @message AS message;`;
    let data = [
        searchParams.get('S_name'), 
        searchParams.get('B_date'),
        searchParams.get('Rate')
    ];

    connection.query(sql, data, (err, result) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else {
            const message = result[1][0].message;
            if (message === 'Sailor added') {
                cb(200, 'OK', message);
            } else {
                cb(400, 'Bad Request', message);
            }
        }
    });
};

// Format results for better display
const formatResults = (results) => {
    let formatted = '';
    for (let i = 0; i < results.length; i++) {
        formatted += `${results[i].S_Id} ${results[i].S_name} ${results[i].Rate}\n`;
    }
    return formatted;
};

// Get all sailors
exports.getSailors = (cb) => {
    let sql = 'SELECT * FROM Sailor';
    connection.query(sql, (err, results) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else {
            if (results.length === 0) {
                cb(200, 'OK', 'Sailor Table is empty');
            } else {
                cb(200, 'OK', formatResults(results));
            }
        }
    });
};

// Update a sailor
exports.updateSailor = (cb, id, searchParams) => {
    let sql = 'UPDATE Sailor SET ';
    let data = [];
    let updates = [];

    if (searchParams.has('S_name')) {
        updates.push('S_name = ?');
        data.push(searchParams.get('S_name'));
    }
    if (searchParams.has('B_date')) {
        updates.push('B_date = ?');
        data.push(searchParams.get('B_date'));
    }
    if (searchParams.has('Rate')) {
        updates.push('Rate = ?');
        data.push(searchParams.get('Rate'));
    }

    sql += updates.join(', ') + ' WHERE S_Id = ?';
    data.push(id);

    connection.query(sql, data, (err) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else {
            cb(200, 'OK', 'Sailor updated');
        }
    });
};

// Delete a sailor
exports.deleteSailor = (cb, id) => {
    let sql = 'DELETE FROM Sailor WHERE S_Id = ?';
    id = parseInt(id);

    connection.query(sql, id, (err, result) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else if (result.affectedRows === 0) {
            cb(404, 'Not Found', 'Record Not Found');
        } else {
            cb(200, 'OK', 'Sailor has been deleted');
        }
    });
};