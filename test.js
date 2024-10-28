
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mysql = require('mysql2');

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // replace with your MySQL username
    password: 'root',  // replace with your MySQL password
    database: 'Yellowgap2024',  // replace with your database name
    port: 8889,  // replace with your MySQL port if it's not the default
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

// GraphQL schema
const schema = buildSchema(`
    type User {
        id: Int
        title: String
        description: String
        levels: Int
    }

    type Query {
        users: [User]
        user(id: Int!): User
    }
`);

// Resolvers
const root = {
    users: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM task_entity', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
    user: ({ id }) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM task_entity WHERE id = ?', [id], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
    },
    addUser: ({ title, description, levels, created_at }) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO task_entity (title, description, levels, created_at) VALUES (?, ?, ?, ?)', [title, description, levels, created_at], (err, result) => {
                if (err) return reject(err);
                resolve({ id: result.insertId, title, description });
            });
        });
    },
};

// Set up the Express server
const app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000/graphql');
});

// Client-side code to query the GraphQL server


    // Uncomment the following section to use Axios instead
    /*
    const axios = require('axios');
    try {
        const response = await axios.post('http://localhost:4000/graphql', { query });
        console.log(response.data);
    } catch (error) {
        console.error('Error:', error);
    }
    */
