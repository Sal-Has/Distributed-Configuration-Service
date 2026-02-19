const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/:key', async (req, res, next) => {
  const configKey = req.params.key;
  const env = req.query.env || 'development';

  try {
    const result = await db.query(
      'SELECT key, value, environment, version FROM configs WHERE key = $1 AND environment = $2',
      [configKey, env]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }

    const row = result.rows[0];
    return res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const { key, value, environment } = req.body;

  if (!key || !value || !environment) {
    return res.status(400).json({ error: 'key, value, and environment are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO configs (key, value, environment)
       VALUES ($1, $2, $3)
       ON CONFLICT (key, environment) DO NOTHING
       RETURNING id, key, value, environment, version`,
      [key, JSON.stringify(value), environment]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Config with this key and environment already exists' });
    }

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:key', async (req, res, next) => {
  const configKey = req.params.key;
  const env = req.query.env || 'development';
  const { value } = req.body;

  if (typeof value === 'undefined') {
    return res.status(400).json({ error: 'value is required' });
  }

  try {
    const result = await db.query(
      `UPDATE configs
       SET value = $1, version = version + 1, last_modified = NOW()
       WHERE key = $2 AND environment = $3
       RETURNING id, key, value, environment, version`,
      [JSON.stringify(value), configKey, env]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  const env = req.query.env || 'development';

  try {
    const result = await db.query(
      'SELECT key, value, environment, version FROM configs WHERE environment = $1',
      [env]
    );

    return res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
