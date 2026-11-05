import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // Initialize SQLite database
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'examseat.sqlite');
  const db = new Database(dbPath);

  // Initialize SQLite tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS seating_plans (
      id TEXT PRIMARY KEY,
      exam_name TEXT,
      exam_date TEXT,
      session TEXT,
      total_students INTEGER,
      total_rooms INTEGER,
      plan_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_records (
      id TEXT PRIMARY KEY,
      reg_no TEXT,
      name TEXT,
      branch TEXT,
      year TEXT,
      semester TEXT,
      section TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // REST API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      system: 'ExamSeat Pro',
      database: 'SQLite',
      timestamp: new Date().toISOString()
    });
  });

  // Save or update current seating plan
  app.post('/api/plan', (req, res) => {
    try {
      const plan = req.body;
      if (!plan || !plan.id) {
        return res.status(400).json({ error: 'Invalid plan object' });
      }

      const stmt = db.prepare(`
        INSERT INTO seating_plans (id, exam_name, exam_date, session, total_students, total_rooms, plan_json)
        VALUES (@id, @examName, @examDate, @session, @totalStudents, @totalRooms, @planJson)
        ON CONFLICT(id) DO UPDATE SET
          exam_name = excluded.exam_name,
          exam_date = excluded.exam_date,
          session = excluded.session,
          total_students = excluded.total_students,
          total_rooms = excluded.total_rooms,
          plan_json = excluded.plan_json
      `);

      stmt.run({
        id: plan.id,
        examName: plan.examDetails?.examName || 'Examination',
        examDate: plan.examDetails?.examDate || '',
        session: plan.examDetails?.session || '',
        totalStudents: plan.totalStudentsAllocated || 0,
        totalRooms: plan.roomAllocations?.length || 0,
        planJson: JSON.stringify(plan)
      });

      res.json({ success: true, planId: plan.id });
    } catch (err: any) {
      console.error('Error saving plan to SQLite:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get latest active seating plan
  app.get('/api/plan/latest', (req, res) => {
    try {
      const row = db.prepare('SELECT plan_json FROM seating_plans ORDER BY created_at DESC LIMIT 1').get() as { plan_json: string } | undefined;
      if (row && row.plan_json) {
        return res.json(JSON.parse(row.plan_json));
      }
      res.json(null);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Search by register number or name across saved plans
  app.get('/api/search', (req, res) => {
    try {
      const query = ((req.query.q as string) || '').toLowerCase().trim();
      if (!query) return res.json([]);

      const row = db.prepare('SELECT plan_json FROM seating_plans ORDER BY created_at DESC LIMIT 1').get() as { plan_json: string } | undefined;
      if (!row || !row.plan_json) return res.json([]);

      const plan = JSON.parse(row.plan_json);
      const matches: any[] = [];

      (plan.roomAllocations || []).forEach((room: any) => {
        (room.benches || []).forEach((bench: any) => {
          if (bench.leftSeat && (bench.leftSeat.regNo.toLowerCase().includes(query) || bench.leftSeat.name.toLowerCase().includes(query))) {
            matches.push({
              student: bench.leftSeat,
              block: room.block,
              roomNumber: room.roomNumber,
              benchNumber: bench.benchNumber,
              columnNumber: bench.columnNumber || Math.floor((bench.benchNumber - 1) / 6) + 1,
              rowInColumn: bench.rowInColumn || ((bench.benchNumber - 1) % 6) + 1,
              position: 'Seat 1 (Left)'
            });
          }
          if (bench.rightSeat && (bench.rightSeat.regNo.toLowerCase().includes(query) || bench.rightSeat.name.toLowerCase().includes(query))) {
            matches.push({
              student: bench.rightSeat,
              block: room.block,
              roomNumber: room.roomNumber,
              benchNumber: bench.benchNumber,
              columnNumber: bench.columnNumber || Math.floor((bench.benchNumber - 1) / 6) + 1,
              rowInColumn: bench.rowInColumn || ((bench.benchNumber - 1) % 6) + 1,
              position: 'Seat 2 (Right)'
            });
          }
        });
      });

      res.json(matches);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite dev server middleware or production static build
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExamSeat Pro Server running with SQLite on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
