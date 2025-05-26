import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Accept JSON body from frontend
  const birthData = req.body;

  try {
    const py = spawn('python', ['astro_sweph_api.py'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const input = JSON.stringify(birthData);
    let result = '';
    let errResult = '';
    py.stdout.on('data', (data) => { result += data.toString(); });
    py.stderr.on('data', (err) => { errResult += err.toString(); });
    py.on('close', (code) => {
      if (code === 0) {
        try {
          res.status(200).json(JSON.parse(result));
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse Python output', details: result });
        }
      } else {
        res.status(500).json({ error: 'Python script error', details: errResult });
      }
    });
    py.stdin.write(input);
    py.stdin.end();
  } catch (e) {
    res.status(500).json({ error: 'Server error', details: e.message });
  }
}
