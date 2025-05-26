import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(req: NextRequest) {
  try {
    // Parse JSON body from frontend
    const birthData = await req.json();
    
    // Create a promise to handle the Python process
    const pythonResult = await new Promise((resolve, reject) => {
      const py = spawn('python', ['astro_sweph_api.py'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const input = JSON.stringify(birthData);
      let result = '';
      let errResult = '';
      
      py.stdout.on('data', (data) => { 
        result += data.toString(); 
      });
      
      py.stderr.on('data', (err) => { 
        errResult += err.toString(); 
      });
      
      py.on('close', (code) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(result));
          } catch (error) {
            reject({ error: 'Failed to parse Python output', details: result });
          }
        } else {
          reject({ error: 'Python script error', details: errResult });
        }
      });
      
      py.stdin.write(input);
      py.stdin.end();
    });
    
    return NextResponse.json(pythonResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (optional)
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
