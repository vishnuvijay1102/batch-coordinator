import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0 && !process.env.DATABASE_URL) {
  console.warn(`⚠️ Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('The database connection might fail if DATABASE_URL is also missing.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Database connection configuration
const poolConfig: pg.PoolConfig = {
  host: process.env.DB_HOST || 'lingocoach.duckdns.org',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'adminuser',
  password: String(process.env.DB_PASSWORD || '5647'),
  database: process.env.DB_NAME || 'batch_coordinator',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Only try to connect if we actually have a configuration (using fallbacks now)
const shouldConnect = true;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.length > 5) {
  if (process.env.DATABASE_URL.includes('://')) {
    poolConfig.connectionString = process.env.DATABASE_URL;
  } else {
    poolConfig.host = process.env.DATABASE_URL;
  }
}

console.log(`📡 Attempting to connect to database at: ${poolConfig.host || 'unknown host'}`);

const pool = new Pool(poolConfig);

// Test the connection with retry logic for DNS errors
const connectWithRetry = (retries = 5, delay = 2000) => {
  pool.connect((err, client, release) => {
    if (err) {
      if (err.message.includes('EAI_AGAIN') && retries > 0) {
        console.warn(`⏳ DNS resolution failed for "${poolConfig.host}". Retrying in ${delay/1000}s... (${retries} retries left)`);
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      } else if (err.message.includes('EAI_AGAIN')) {
        console.error('❌ DNS Error (EAI_AGAIN): The server cannot find "lingocoach.duckdns.org" after multiple attempts.');
        console.error('   Please ensure your DuckDNS dashboard shows your current IP.');
      } else if (err.message.includes('pg_hba.conf')) {
        console.error('❌ Postgres Security Error: Connection reached your machine but was rejected.');
        console.error('   Update your pg_hba.conf to allow host "0.0.0.0/0".');
      } else {
        console.error('❌ Database Connection Error:', err.message);
      }
    } else {
      console.log('✅ Successfully connected to PostgreSQL database');
      release();
    }
  });
};

connectWithRetry();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Classrooms
  app.get('/api/classrooms', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM classrooms ORDER BY created_at ASC');
      res.json(result.rows);
    } catch (err) {
      console.error('❌ SQL Error (GET /api/classrooms):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/classrooms', async (req, res) => {
    try {
      const { name } = req.body;
      const result = await pool.query('INSERT INTO classrooms (name) VALUES ($1) RETURNING *', [name]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('❌ SQL Error (POST /api/classrooms):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete('/api/classrooms/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM classrooms WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error('❌ SQL Error (DELETE /api/classrooms):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  // Batches
  app.get('/api/batches', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM batches ORDER BY created_at ASC');
      res.json(result.rows.map(row => ({
        ...row,
        classroomId: row.classroom_id,
        startTime: row.start_time,
        endTime: row.end_time,
        startDate: row.start_date,
        type: row.batch_type
      })));
    } catch (err) {
      console.error('❌ SQL Error (GET /api/batches):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/batches', async (req, res) => {
    try {
      const b = req.body;
      const result = await pool.query(
        'INSERT INTO batches (code, title, trainer_name, classroom_id, start_time, end_time, day, start_date, batch_type, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [b.code, b.title, b.trainer, b.classroomId, b.startTime, b.endTime, b.day, b.startDate, b.type, b.status]
      );
      const row = result.rows[0];
      res.json({
        ...row,
        classroomId: row.classroom_id,
        trainer: row.trainer_name,
        startTime: row.start_time,
        endTime: row.end_time,
        startDate: row.start_date,
        type: row.batch_type
      });
    } catch (err) {
      console.error('❌ SQL Error (POST /api/batches):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.put('/api/batches/:id', async (req, res) => {
    try {
      const b = req.body;
      const result = await pool.query(
        'UPDATE batches SET code = COALESCE($1, code), title = COALESCE($2, title), trainer_name = COALESCE($3, trainer_name), classroom_id = COALESCE($4, classroom_id), start_time = COALESCE($5, start_time), end_time = COALESCE($6, end_time), day = COALESCE($7, day), start_date = COALESCE($8, start_date), batch_type = COALESCE($9, batch_type), status = COALESCE($10, status) WHERE id = $11 RETURNING *',
        [b.code, b.title, b.trainer, b.classroomId, b.startTime, b.endTime, b.day, b.startDate, b.type, b.status, req.params.id]
      );
      const row = result.rows[0];
      res.json({
        ...row,
        classroomId: row.classroom_id,
        trainer: row.trainer_name,
        startTime: row.start_time,
        endTime: row.end_time,
        startDate: row.start_date,
        type: row.batch_type
      });
    } catch (err) {
      console.error('❌ SQL Error (PUT /api/batches):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete('/api/batches/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM batches WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error('❌ SQL Error (DELETE /api/batches):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  // Teachers
  app.get('/api/teachers', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM teachers ORDER BY created_at ASC');
      res.json(result.rows);
    } catch (err) {
      console.error('❌ SQL Error (GET /api/teachers):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/teachers', async (req, res) => {
    try {
      const { name, handling } = req.body;
      const result = await pool.query('INSERT INTO teachers (name, handling) VALUES ($1, $2) RETURNING *', [name, handling]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('❌ SQL Error (POST /api/teachers):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.put('/api/teachers/:id', async (req, res) => {
    try {
      const { name, handling } = req.body;
      const result = await pool.query('UPDATE teachers SET name = $1, handling = $2 WHERE id = $3 RETURNING *', [name, handling, req.params.id]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('❌ SQL Error (PUT /api/teachers):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete('/api/teachers/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM teachers WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error('❌ SQL Error (DELETE /api/teachers):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  // Students
  app.get('/api/students', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM students ORDER BY created_at ASC');
      res.json(result.rows.map(row => ({
        ...row,
        course: row.course_name,
        paymentStatus: row.payment_status,
        promiseDate: row.promise_date
      })));
    } catch (err) {
      console.error('❌ SQL Error (GET /api/students):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/students', async (req, res) => {
    try {
      const s = req.body;
      const result = await pool.query(
        'INSERT INTO students (name, phone, course_name, payment_status, promise_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [s.name, s.phone, s.course, s.paymentStatus, s.promiseDate]
      );
      const row = result.rows[0];
      res.json({
        ...row,
        course: row.course_name,
        paymentStatus: row.payment_status,
        promiseDate: row.promise_date
      });
    } catch (err) {
      console.error('❌ SQL Error (POST /api/students):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.put('/api/students/:id', async (req, res) => {
    try {
      const s = req.body;
      const result = await pool.query(
        'UPDATE students SET name = COALESCE($1, name), phone = COALESCE($2, phone), course_name = COALESCE($3, course_name), payment_status = COALESCE($4, payment_status), promise_date = COALESCE($5, promise_date) WHERE id = $6 RETURNING *',
        [s.name, s.phone, s.course, s.paymentStatus, s.promiseDate, req.params.id]
      );
      const row = result.rows[0];
      res.json({
        ...row,
        course: row.course_name,
        paymentStatus: row.payment_status,
        promiseDate: row.promise_date
      });
    } catch (err) {
      console.error('❌ SQL Error (PUT /api/students):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete('/api/students/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM students WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error('❌ SQL Error (DELETE /api/students):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  // Courses
  app.get('/api/courses', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM courses ORDER BY created_at ASC');
      res.json(result.rows);
    } catch (err) {
      console.error('❌ SQL Error (GET /api/courses):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/courses', async (req, res) => {
    try {
      const { name, code } = req.body;
      const result = await pool.query('INSERT INTO courses (name, code) VALUES ($1, $2) RETURNING *', [name, code]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('❌ SQL Error (POST /api/courses):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.put('/api/courses/:id', async (req, res) => {
    try {
      const { name, code } = req.body;
      const result = await pool.query('UPDATE courses SET name = $1, code = $2 WHERE id = $3 RETURNING *', [name, code, req.params.id]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('❌ SQL Error (PUT /api/courses):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete('/api/courses/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error('❌ SQL Error (DELETE /api/courses):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  // Mock Details
  app.get('/api/mock-details', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM mock_details ORDER BY created_at ASC');
      res.json(result.rows.map(row => ({
        ...row,
        classroomId: row.classroom_id,
        trainer: row.trainer_name,
        date: row.mock_date,
        startTime: row.start_time,
        endTime: row.end_time
      })));
    } catch (err) {
      console.error('❌ SQL Error (GET /api/mock-details):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/mock-details', async (req, res) => {
    try {
      const m = req.body;
      const result = await pool.query(
        'INSERT INTO mock_details (classroom_id, trainer_name, mock_date, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [m.classroomId, m.trainer, m.date, m.startTime, m.endTime]
      );
      const row = result.rows[0];
      res.json({
        ...row,
        classroomId: row.classroom_id,
        trainer: row.trainer_name,
        date: row.mock_date,
        startTime: row.start_time,
        endTime: row.end_time
      });
    } catch (err) {
      console.error('❌ SQL Error (POST /api/mock-details):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.put('/api/mock-details/:id', async (req, res) => {
    try {
      const m = req.body;
      const result = await pool.query(
        'UPDATE mock_details SET classroom_id = COALESCE($1, classroom_id), trainer_name = COALESCE($2, trainer_name), mock_date = COALESCE($3, mock_date), start_time = COALESCE($4, start_time), end_time = COALESCE($5, end_time) WHERE id = $6 RETURNING *',
        [m.classroomId, m.trainer, m.date, m.startTime, m.endTime, req.params.id]
      );
      const row = result.rows[0];
      res.json({
        ...row,
        classroomId: row.classroom_id,
        trainer: row.trainer_name,
        date: row.mock_date,
        startTime: row.start_time,
        endTime: row.end_time
      });
    } catch (err) {
      console.error('❌ SQL Error (PUT /api/mock-details):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete('/api/mock-details/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM mock_details WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error('❌ SQL Error (DELETE /api/mock-details):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  // Users Management
  app.get('/api/users', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, username, password, role FROM users ORDER BY created_at ASC');
      res.json(result.rows);
    } catch (err) {
      console.error('❌ SQL Error (GET /api/users):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const { username, password, role } = req.body;
      const result = await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, password, role', [username, password, role]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('❌ SQL Error (POST /api/users):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.put('/api/users/:id/role', async (req, res) => {
    try {
      const { role } = req.body;
      const result = await pool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, password, role', [role, req.params.id]);
      res.json(result.rows[0]);
    } catch (err) {
      console.error('❌ SQL Error (PUT /api/users):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      console.error('❌ SQL Error (DELETE /api/users):', err);
      res.status(500).json({ error: 'Database query failed', details: err instanceof Error ? err.message : String(err) });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
