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

// Add a reservation with callback
exports.addReserve = (searchParams, cb) => {
    let sql = `
    CALL InsertReservation(?, ?, ?, @message);
    SELECT @message AS message;`;
    let data = [
        searchParams.get('S_Id'), 
        searchParams.get('B_Id'),
        searchParams.get('Day')
    ];

    connection.query(sql, data, (err, result) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else {
            const message = result[1][0].message;
            if (message === 'Reservation added') {
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
        let day = new Date(results[i].Day).toDateString().split(' ').slice(0, 3).join(' ');
        formatted += `${results[i].S_Id} ${results[i].S_name} ${results[i].B_Id} ${results[i].B_name} ${day}\n`;
    }
    return formatted;
};

// Get all reservations with callback
exports.getReserves = (cb) => {
    let sql = `
        SELECT 
            r.S_Id, s.S_name, r.B_Id, b.B_name, r.Day
        FROM 
            Reserves r
        JOIN 
            Sailor s ON r.S_Id = s.S_Id
        JOIN 
            Boat b ON r.B_Id = b.B_Id
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            cb(500, 'Internal Server Error', `${err.message}`);
        } else {
            if (results.length === 0) {
                cb(200, 'OK', 'Reserves Table is empty');
            } else {
                cb(200, 'OK', formatResults(results));
            }
        }
    });
};

// Delete a reservation with callback
exports.deleteReserve = (cb, searchParams) => {
    let sql = 'DELETE FROM Reserves WHERE S_Id = ? AND B_Id = ? AND Day = ?';
    let data = [
        searchParams.get('S_Id'),
        searchParams.get('B_Id'),
        searchParams.get('Day')
    ];

    connection.query(sql, data, (err, result) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Reservation Entry does not exist');
        } else if (result.affectedRows === 0) {
            cb(404, 'Not Found', 'Record Not Found');
        } else {
            cb(200, 'OK', 'Reservation has been deleted');
        }
    });
};