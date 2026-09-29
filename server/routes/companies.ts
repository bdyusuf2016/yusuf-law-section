import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET all companies
router.get('/', async (req: Request, res: Response) => {
  try {
    const { circle, search } = req.query;
    let sql = 'SELECT * FROM companies WHERE 1=1';
    const params: any[] = [];

    if (circle && circle !== 'all') {
      params.push(circle);
      sql += ` AND circle = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (company_name ILIKE $${params.length} OR bin ILIKE $${params.length} OR bond_license_no ILIKE $${params.length})`;
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    
    // Map snake_case to camelCase
    const formatted = result.rows.map(row => ({
      id: row.id,
      companyName: row.company_name,
      address: row.address,
      bondLicenseNo: row.bond_license_no,
      bin: row.bin,
      circle: row.circle,
      auditStatus: row.audit_status,
      auditYear: row.audit_year,
      commercialManagerName: row.commercial_manager_name,
      commercialManagerMobile: row.commercial_manager_mobile,
      commercialManagerEmail: row.commercial_manager_email,
      officerARO: row.officer_aro,
      officerRO: row.officer_ro,
      officerAC_DC: row.officer_ac_dc,
      officerJC_ADC: row.officer_jc_adc,
      arrearsTaka: parseFloat(row.arrears_taka || 0),
      arrearsCrore: parseFloat(row.arrears_crore || 0),
      linkedCaseNos: row.linked_case_nos,
      remarks: row.remarks
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new company
router.post('/', async (req: Request, res: Response) => {
  try {
    const c = req.body;
    const sql = `
      INSERT INTO companies (
        company_name, address, bond_license_no, bin, circle,
        audit_status, audit_year, commercial_manager_name,
        commercial_manager_mobile, commercial_manager_email,
        officer_aro, officer_ro, officer_ac_dc, officer_jc_adc,
        arrears_taka, arrears_crore, linked_case_nos, remarks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;
    const values = [
      c.companyName,
      c.address || null,
      c.bondLicenseNo || null,
      c.bin || null,
      c.circle,
      c.auditStatus || 'অডিট অপেক্ষমান',
      c.auditYear || null,
      c.commercialManagerName || null,
      c.commercialManagerMobile || null,
      c.commercialManagerEmail || null,
      c.officerARO || null,
      c.officerRO || null,
      c.officerAC_DC || null,
      c.officerJC_ADC || null,
      c.arrearsTaka || 0,
      c.arrearsCrore || 0,
      c.linkedCaseNos || null,
      c.remarks || null
    ];
    const result = await query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update company
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const c = req.body;
    const sql = `
      UPDATE companies SET
        company_name = $1, address = $2, bond_license_no = $3, bin = $4,
        circle = $5, audit_status = $6, audit_year = $7,
        commercial_manager_name = $8, commercial_manager_mobile = $9,
        commercial_manager_email = $10, officer_aro = $11, officer_ro = $12,
        officer_ac_dc = $13, officer_jc_adc = $14, arrears_taka = $15,
        arrears_crore = $16, linked_case_nos = $17, remarks = $18,
        updated_at = NOW()
      WHERE id = $19
      RETURNING *
    `;
    const values = [
      c.companyName,
      c.address || null,
      c.bondLicenseNo || null,
      c.bin || null,
      c.circle,
      c.auditStatus || 'অডিট অপেক্ষমান',
      c.auditYear || null,
      c.commercialManagerName || null,
      c.commercialManagerMobile || null,
      c.commercialManagerEmail || null,
      c.officerARO || null,
      c.officerRO || null,
      c.officerAC_DC || null,
      c.officerJC_ADC || null,
      c.arrearsTaka || 0,
      c.arrearsCrore || 0,
      c.linkedCaseNos || null,
      c.remarks || null,
      id
    ];
    const result = await query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST bulk assign officers to multiple companies
router.post('/bulk-assign', async (req: Request, res: Response) => {
  try {
    const { companyIds, officersData } = req.body;
    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return res.status(400).json({ error: 'companyIds array is required' });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (officersData.officerARO !== undefined) {
      params.push(officersData.officerARO);
      updates.push(`officer_aro = $${params.length}`);
    }
    if (officersData.officerRO !== undefined) {
      params.push(officersData.officerRO);
      updates.push(`officer_ro = $${params.length}`);
    }
    if (officersData.officerAC_DC !== undefined) {
      params.push(officersData.officerAC_DC);
      updates.push(`officer_ac_dc = $${params.length}`);
    }
    if (officersData.officerJC_ADC !== undefined) {
      params.push(officersData.officerJC_ADC);
      updates.push(`officer_jc_adc = $${params.length}`);
    }

    if (updates.length === 0) {
      return res.json({ success: true, message: 'No officer fields provided to update' });
    }

    updates.push('updated_at = NOW()');
    params.push(companyIds);
    const sql = `
      UPDATE companies
      SET ${updates.join(', ')}
      WHERE id = ANY($${params.length})
      RETURNING *
    `;

    const result = await query(sql, params);
    res.json({ success: true, count: result.rowCount, updated: result.rows });
  } catch (error: any) {
    console.error('Error bulk assigning officers to companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE company
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM companies WHERE id = $1', [id]);
    res.json({ success: true, message: 'Company deleted' });
  } catch (error: any) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
