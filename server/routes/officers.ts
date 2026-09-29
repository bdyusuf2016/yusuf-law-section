import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET all officers (with optional designation filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { designation, search } = req.query;
    let sql = 'SELECT * FROM officers WHERE 1=1';
    const params: any[] = [];

    if (designation && designation !== 'all') {
      if (designation === 'AC_DC') {
        sql += ` AND (designation = 'AC' OR designation = 'DC')`;
      } else if (designation === 'JC_ADC') {
        sql += ` AND (designation = 'JC' OR designation = 'ADC')`;
      } else {
        params.push(designation);
        sql += ` AND designation = $${params.length}`;
      }
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR mobile ILIKE $${params.length} OR designation_bangla ILIKE $${params.length})`;
    }

    sql += ' ORDER BY created_at ASC';
    const result = await query(sql, params);

    const formatted = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      designation: row.designation,
      designationBangla: row.designation_bangla,
      mobile: row.mobile,
      email: row.email,
      roomNo: row.room_no,
      assignedCircles: row.assigned_circles || [],
      assignedCompanyIds: row.assigned_company_ids || [],
      assignedCompanyNames: row.assigned_company_names || [],
      status: row.status
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching officers:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new officer
router.post('/', async (req: Request, res: Response) => {
  try {
    const o = req.body;
    const sql = `
      INSERT INTO officers (
        name, designation, designation_bangla, mobile, email, room_no,
        assigned_circles, assigned_company_ids, assigned_company_names
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      o.name,
      o.designation,
      o.designationBangla,
      o.mobile || null,
      o.email || null,
      o.roomNo || null,
      o.assignedCircles || [],
      o.assignedCompanyIds || [],
      o.assignedCompanyNames || []
    ];
    const result = await query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating officer:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update officer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const o = req.body;
    const sql = `
      UPDATE officers SET
        name = $1, designation = $2, designation_bangla = $3,
        mobile = $4, email = $5, room_no = $6, assigned_circles = $7,
        assigned_company_ids = $8, assigned_company_names = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;
    const values = [
      o.name,
      o.designation,
      o.designationBangla,
      o.mobile || null,
      o.email || null,
      o.roomNo || null,
      o.assignedCircles || [],
      o.assignedCompanyIds || [],
      o.assignedCompanyNames || [],
      id
    ];
    const result = await query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Officer not found' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating officer:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST assign circles & companies to multiple officers
router.post('/assign-bulk', async (req: Request, res: Response) => {
  try {
    const { officerIds, assignedCircles, assignedCompanyIds, assignedCompanyNames, syncToCompanies } = req.body;
    if (!officerIds || !Array.isArray(officerIds) || officerIds.length === 0) {
      return res.status(400).json({ error: 'officerIds array is required' });
    }

    const sql = `
      UPDATE officers SET
        assigned_circles = $1,
        assigned_company_ids = $2,
        assigned_company_names = $3,
        updated_at = NOW()
      WHERE id = ANY($4)
      RETURNING *
    `;
    const result = await query(sql, [
      assignedCircles || [],
      assignedCompanyIds || [],
      assignedCompanyNames || [],
      officerIds
    ]);

    // Optional: auto-sync to companies
    if (syncToCompanies && assignedCompanyIds && assignedCompanyIds.length > 0) {
      for (const officer of result.rows) {
        let fieldName = '';
        if (officer.designation === 'ARO') fieldName = 'officer_aro';
        else if (officer.designation === 'RO') fieldName = 'officer_ro';
        else if (officer.designation === 'AC' || officer.designation === 'DC') fieldName = 'officer_ac_dc';
        else if (officer.designation === 'JC' || officer.designation === 'ADC') fieldName = 'officer_jc_adc';

        if (fieldName) {
          const val = `${officer.name}, ${officer.designation_bangla}`;
          await query(
            `UPDATE companies SET ${fieldName} = $1, updated_at = NOW() WHERE id = ANY($2)`,
            [val, assignedCompanyIds]
          );
        }
      }
    }

    res.json({ success: true, count: result.rowCount, officers: result.rows });
  } catch (error: any) {
    console.error('Error assigning officer circles/companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE officer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM officers WHERE id = $1', [id]);
    res.json({ success: true, message: 'Officer deleted' });
  } catch (error: any) {
    console.error('Error deleting officer:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
