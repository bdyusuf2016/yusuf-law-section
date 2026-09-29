import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET all cases
router.get('/', async (req: Request, res: Response) => {
  try {
    const { court, status, search } = req.query;
    let sql = 'SELECT * FROM cases WHERE 1=1';
    const params: any[] = [];

    if (court && court !== 'all') {
      params.push(court);
      sql += ` AND court_type = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND current_status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (company_name ILIKE $${params.length} OR case_no ILIKE $${params.length})`;
    }

    sql += ' ORDER BY sl_no ASC, created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new case
router.post('/', async (req: Request, res: Response) => {
  try {
    const c = req.body;
    const sql = `
      INSERT INTO cases (
        sl_no, company_name, court_type, case_no, legal_section,
        disputed_amount_taka, disputed_amount_crore, realized_amount_taka,
        realized_amount_crore, current_status, last_hearing_date,
        next_hearing_date, court_bench, assigned_lawyer, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const values = [
      c.slNo || null,
      c.companyName,
      c.courtType,
      c.caseNo,
      c.legalSection || null,
      c.disputedAmountTaka || 0,
      c.disputedAmountCrore || 0,
      c.realizedAmountTaka || 0,
      c.realizedAmountCrore || 0,
      c.currentStatus,
      c.lastHearingDate || null,
      c.nextHearingDate || null,
      c.courtBench || null,
      c.assignedLawyer || null,
      c.remarks || null
    ];
    const result = await query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating case:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update case
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const c = req.body;
    const sql = `
      UPDATE cases SET
        company_name = $1, court_type = $2, case_no = $3, legal_section = $4,
        disputed_amount_taka = $5, disputed_amount_crore = $6,
        realized_amount_taka = $7, realized_amount_crore = $8,
        current_status = $9, last_hearing_date = $10, next_hearing_date = $11,
        court_bench = $12, assigned_lawyer = $13, remarks = $14,
        updated_at = NOW()
      WHERE id = $15
      RETURNING *
    `;
    const values = [
      c.companyName,
      c.courtType,
      c.caseNo,
      c.legalSection || null,
      c.disputedAmountTaka || 0,
      c.disputedAmountCrore || 0,
      c.realizedAmountTaka || 0,
      c.realizedAmountCrore || 0,
      c.currentStatus,
      c.lastHearingDate || null,
      c.nextHearingDate || null,
      c.courtBench || null,
      c.assignedLawyer || null,
      c.remarks || null,
      id
    ];
    const result = await query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating case:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE case
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM cases WHERE id = $1', [id]);
    res.json({ success: true, message: 'Case deleted' });
  } catch (error: any) {
    console.error('Error deleting case:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
