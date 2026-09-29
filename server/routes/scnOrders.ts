import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// GET all SCN & Orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const { circle } = req.query;
    let sql = 'SELECT * FROM scn_and_orders';
    const params: any[] = [];
    if (circle && circle !== 'all') {
      params.push(circle);
      sql += ' WHERE circle = $1';
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);

    const formatted = result.rows.map(row => ({
      id: row.id,
      companyId: row.company_id,
      companyName: row.company_name,
      circle: row.circle,
      scnNo: row.scn_no,
      scnIssueDate: row.scn_issue_date,
      demandAmountTaka: parseFloat(row.demand_amount_taka || 0),
      orderNo: row.order_no,
      orderDate: row.order_date,
      adjudicatedRevenueTaka: parseFloat(row.adjudicated_revenue_taka || 0),
      adjudicatedFineTaka: parseFloat(row.adjudicated_fine_taka || 0),
      totalAdjudicatedTaka: parseFloat(row.total_adjudicated_taka || 0),
      realizedAmountTaka: parseFloat(row.realized_amount_taka || 0),
      outstandingAmountTaka: parseFloat(row.outstanding_amount_taka || 0),
      orderStatus: row.order_status
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching SCN and Orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST new SCN & Order
router.post('/', async (req: Request, res: Response) => {
  try {
    const s = req.body;
    const sql = `
      INSERT INTO scn_and_orders (
        company_id, company_name, circle, scn_no, scn_issue_date,
        demand_amount_taka, order_no, order_date, adjudicated_revenue_taka,
        adjudicated_fine_taka, total_adjudicated_taka, realized_amount_taka,
        outstanding_amount_taka, order_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [
      s.companyId || null,
      s.companyName,
      s.circle,
      s.scnNo,
      s.scnIssueDate || null,
      s.demandAmountTaka || 0,
      s.orderNo || null,
      s.orderDate || null,
      s.adjudicatedRevenueTaka || 0,
      s.adjudicatedFineTaka || 0,
      s.totalAdjudicatedTaka || 0,
      s.realizedAmountTaka || 0,
      s.outstandingAmountTaka || 0,
      s.orderStatus || 'বিচারাদেশ অপেক্ষমান'
    ];
    const result = await query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating SCN/Order:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE SCN & Order
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM scn_and_orders WHERE id = $1', [id]);
    res.json({ success: true, message: 'SCN/Order deleted' });
  } catch (error: any) {
    console.error('Error deleting SCN/Order:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
