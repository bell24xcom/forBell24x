/**
 * Simple Express server to verify database tables
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to PostgreSQL using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());

// API Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Bell24h API is running' });
});

// Database status check
app.get('/api/db-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'connected', timestamp: result.rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'disconnected', error: error.message });
  }
});

// List all tables
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    res.json({ tables: result.rows.map(row => row.table_name) });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get table structure
app.get('/api/tables/:tableName', async (req, res) => {
  const { tableName } = req.params;
  
  try {
    // Get column information
    const columnsResult = await pool.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = $1 
       ORDER BY ordinal_position`,
      [tableName]
    );
    
    // Get sample data (limited to 10 rows)
    const dataResult = await pool.query(
      `SELECT * FROM "${tableName}" LIMIT 10`
    );
    
    res.json({
      tableName,
      columns: columnsResult.rows,
      sampleData: dataResult.rows,
      rowCount: dataResult.rowCount
    });
  } catch (error) {
    console.error(`Error fetching table ${tableName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route for API requests
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static frontend
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bell24h Database Viewer</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { padding: 20px; }
          h1 { margin-bottom: 20px; }
          .header { 
            background: linear-gradient(45deg, #3498db, #1abc9c);
            color: white;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .table-container {
            margin-top: 20px;
            overflow-x: auto;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
          .btn-fetch { 
            background: linear-gradient(45deg, #3498db, #2980b9);
            border: none;
            margin-right: 10px;
          }
          .loading { opacity: 0.7; }
          #tablesList .btn { margin: 5px; }
          table { width: 100%; }
          th { position: sticky; top: 0; background-color: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bell24h Database Viewer</h1>
            <p class="lead">View database tables and their contents</p>
            <button class="btn btn-light" id="fetchTables">Fetch Database Tables</button>
          </div>
          
          <div class="row">
            <div class="col-md-3">
              <h3>Database Tables</h3>
              <div id="tablesList" class="list-group"></div>
            </div>
            <div class="col-md-9">
              <h3 id="tableTitle">Select a table</h3>
              <div class="table-container">
                <table class="table table-striped table-bordered" id="tableContent">
                  <thead>
                    <tr id="tableHeader"></tr>
                  </thead>
                  <tbody id="tableBody"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const fetchTablesBtn = document.getElementById('fetchTables');
            const tablesList = document.getElementById('tablesList');
            const tableTitle = document.getElementById('tableTitle');
            const tableHeader = document.getElementById('tableHeader');
            const tableBody = document.getElementById('tableBody');

            fetchTablesBtn.addEventListener('click', async function() {
              fetchTablesBtn.classList.add('loading');
              fetchTablesBtn.textContent = 'Loading...';
              
              try {
                const response = await fetch('/api/tables');
                const data = await response.json();
                
                tablesList.innerHTML = '';
                data.tables.forEach(table => {
                  const button = document.createElement('button');
                  button.className = 'btn btn-fetch';
                  button.textContent = table;
                  button.addEventListener('click', () => fetchTableData(table));
                  tablesList.appendChild(button);
                });
              } catch (error) {
                console.error('Error fetching tables:', error);
                tablesList.innerHTML = '<div class="alert alert-danger">Error loading tables</div>';
              } finally {
                fetchTablesBtn.classList.remove('loading');
                fetchTablesBtn.textContent = 'Fetch Database Tables';
              }
            });

            async function fetchTableData(tableName) {
              tableTitle.textContent = 'Loading ' + tableName + '...';
              tableHeader.innerHTML = '';
              tableBody.innerHTML = '';
              
              try {
                const response = await fetch('/api/tables/' + tableName);
                const data = await response.json();
                
                tableTitle.textContent = tableName + ' (' + data.rowCount + ' rows)';
                
                // Create headers
                tableHeader.innerHTML = '';
                data.columns.forEach(column => {
                  const th = document.createElement('th');
                  th.textContent = column.column_name + ' (' + column.data_type + ')';
                  tableHeader.appendChild(th);
                });
                
                // Create rows
                tableBody.innerHTML = '';
                data.sampleData.forEach(row => {
                  const tr = document.createElement('tr');
                  
                  data.columns.forEach(column => {
                    const td = document.createElement('td');
                    let cellValue = row[column.column_name];
                    
                    // Format complex types
                    if (cellValue === null || cellValue === undefined) {
                      td.innerHTML = '<em class="text-muted">null</em>';
                    } else if (typeof cellValue === 'object') {
                      td.innerHTML = '<pre>' + JSON.stringify(cellValue, null, 2) + '</pre>';
                    } else {
                      td.textContent = cellValue.toString();
                    }
                    
                    tr.appendChild(td);
                  });
                  
                  tableBody.appendChild(tr);
                });
              } catch (error) {
                console.error('Error fetching table ' + tableName + ':', error);
                tableTitle.textContent = 'Error loading ' + tableName;
                tableBody.innerHTML = '<tr><td colspan="100%" class="alert alert-danger">Error: ' + error.message + '</td></tr>';
              }
            }

            // Auto-fetch tables on load
            fetchTablesBtn.click();
          });
        </script>
      </body>
    </html>
  `);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bell24h Database Viewer running on port ${PORT}`);
});
