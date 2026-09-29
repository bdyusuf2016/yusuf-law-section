import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET all circle assignments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM circle_assignments ORDER BY circle ASC');
    const formatted = result.rows.map(row => ({
      circle: row.circle,
      circleName: row.circle_name,
      aroName: row.aro_name,
      roName: row.ro_name,
      acDcName: row.ac_dc_name,
      jcAdcName: row.jc_adc_name
    }));
    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching circle assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST save / upsert circle assignment
router.post('/', async (req: Request, res: Response) => {
  try {
    const a = req.body;
    const sql = `
      INSERT INTO circle_assignments (
        circle, circle_name, aro_name, ro_name, ac_dc_name, jc_adc_name, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (circle) DO UPDATE SET
        circle_name = EXCLUDED.circle_name,
        aro_name = EXCLUDED.aro_name,
        ro_name = EXCLUDED.ro_name,
        ac_dc_name = EXCLUDED.ac_dc_name,
        jc_adc_name = EXCLUDED.jc_adc_name,
        updated_at = NOW()
      RETURNING *
    `;
    const values = [
      a.circle,
      a.circleName || `সার্কেল-${a.circle}`,
      a.aroName || null,
      a.roName || null,
      a.acDcName || null,
      a.jcAdcName || null
    ];
    const result = await query(sql, values);

    // Auto-sync to companies in this circle if requested
    if (req.body.syncToCompanies) {
      await query(
        `UPDATE companies SET
          officer_aro = COALESCE($1, officer_aro),
          officer_ro = COALESCE($2, officer_ro),
          officer_ac_dc = COALESCE($3, officer_ac_dc),
          officer_jc_adc = COALESCE($4, officer_jc_adc),
          updated_at = NOW()
        WHERE circle = $5`,
        [a.aroName, a.roName, a.acDcName, a.jcAdcName, a.circle]
      );
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error saving circle assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
