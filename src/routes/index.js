// src/routes/index.js
import { Router } from 'express';
import { handleWebhook, handleWebhookVerification } from '../controllers/webhookController.js';
import { antiSpam } from '../middleware/antiSpam.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', ts: new Date().toISOString() });
});

router.get('/webhook', handleWebhookVerification);
router.post('/webhook', antiSpam, handleWebhook);

export default router;
