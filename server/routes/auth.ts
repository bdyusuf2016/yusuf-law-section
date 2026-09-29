import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

// Pre-defined system accounts for the revenue department
const DEMO_USERS = [
  {
    id: 'user-comm-1',
    username: 'commissioner',
    fullName: 'ড. মুহাম্মদ মোফিজুর রহমান',
    email: 'commissioner@vat.gov.bd',
    role: 'super_admin',
    designationBangla: 'কমিশনার (সুপার অ্যাডমিন)',
    circle: 'all'
  },
  {
    id: 'user-dc-1',
    username: 'dc_circle1',
    fullName: 'ফারহানা আহমেদ',
    email: 'dc.circle1@vat.gov.bd',
    role: 'dc_ac',
    designationBangla: 'উপ-কমিশনার (সার্কেল-১ প্রধান)',
    circle: '১'
  },
  {
    id: 'user-ro-1',
    username: 'ro_circle1',
    fullName: 'মোঃ মাহবুবুর রহমান',
    email: 'ro.circle1@vat.gov.bd',
    role: 'ro',
    designationBangla: 'রাজস্ব কর্মকর্তা (RO)',
    circle: '১'
  },
  {
    id: 'user-aro-1',
    username: 'aro_circle1',
    fullName: 'আনিসুর রহমান',
    email: 'aro.circle1@vat.gov.bd',
    role: 'aro',
    designationBangla: 'সহকারী রাজস্ব কর্মকর্তা (ARO)',
    circle: '১'
  }
];

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password, circle } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    const cleanUser = username.trim().toLowerCase();
    const found = DEMO_USERS.find(
      u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
    );

    const token = 'jwt-vat-' + Buffer.from(`${cleanUser}:${Date.now()}`).toString('base64');

    if (found) {
      return res.json({
        success: true,
        token,
        user: {
          ...found,
          circle: circle && circle !== 'all' ? circle : found.circle
        }
      });
    }

    // Dynamic user
    const dynamicUser = {
      id: 'usr-' + Date.now(),
      username: cleanUser,
      fullName: username,
      email: `${cleanUser}@vat.gov.bd`,
      role: 'ro',
      designationBangla: 'রাজস্ব কর্মকর্তা',
      circle: circle || '১'
    };

    return res.json({
      success: true,
      token,
      user: dynamicUser
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Return default active session user
  res.json({
    user: DEMO_USERS[0],
    active: true
  });
});

// GET /api/auth/roles - list all preset roles
router.get('/roles', (_req: Request, res: Response) => {
  res.json(DEMO_USERS);
});

export default router;
