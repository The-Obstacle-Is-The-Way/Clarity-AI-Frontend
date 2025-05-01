/* eslint-disable */
/* eslint-env node */
// test-puppeteer/r3f-basic.test.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import assert from 'assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Define types for the brain model data
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface BrainRegion {
  id: string;
  name: string;
  position: Vector3;
  color: string;
  connections: string[];
  activityLevel: number;
  isActive: boolean;
  hemisphereLocation: 'left' | 'right';
  dataConfidence: number;
  volume: number;
  activity: number;
}

interface NeuralConnection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number;
  type: 'excitatory' | 'inhibitory';
  directionality: 'unidirectional' | 'bidirectional';
  dataConfidence: number;
  activityLevel: number;
}

interface BrainScan {
  id: string;
  patientId: string;
  scanDate: string;
  scanType: string;
  resolution: Vector3;
  metadata: Record<string, any>;
  dataQualityScore: number;
}

interface BrainModel {
  id: string;
  patientId: string;
  scan: BrainScan;
  timestamp: string;
  processingLevel: string;
  lastUpdated: string;
  version: string;
  regions: BrainRegion[];
  connections: NeuralConnection[];
}

// Get the directory name equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to introduce delay (if needed, currently unused)
// const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Self-executing async function
(async (): Promise<void> => {
  let browser: Browser | undefined;
  let page: Page | undefined; // Define page in the outer scope
  const targetUrl = `file://${__dirname}/../public/brain-standalone-demo.html`;

  try {
    console.log('[Puppeteer] Launching browser for basic R3F test...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Common args for CI environments
    });
    page = await browser.newPage(); // Assign to outer scope variable

    // --- Setup Event Listeners AFTER page is created ---
    page.on('console', (msg) => {
      const type = msg.type().toUpperCase();
      const text = msg.text();
      // Log errors and warnings prominently
      if (type === 'ERROR' || type === 'WARN') {
        console.error(`[Browser Console - ${type}] ${text}`);
      } else {
        console.log(`[Browser Console - ${type}] ${text}`);
      }
    });
    page.on('pageerror', (err) => {
      console.error('[Browser Page Error]', err.toString());
    });

    // --- Mock API Response ---
    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
      const url = interceptedRequest.url();
      // Target the specific API endpoint needed for this test
      if (url.endsWith('/api/brain-models/DEMO_SCAN_001')) {
        console.log(`[Puppeteer Mock] Intercepting: ${url}`);
        // Define the mock BrainModel data
        // Define the mock BrainModel data adhering to type verification rules
        const nowISO = new Date().toISOString();
        const mockBrainModel: BrainModel = {
          id: 'DEMO_SCAN_001', // Required: string
          patientId: 'DEMO_PATIENT', // Required: string
          scan: {
            // Required: BrainScan object
            id: 'SCAN_123', // Required: string
            patientId: 'DEMO_PATIENT', // Required: string
            scanDate: nowISO, // Required: string (ISO format)
            scanType: 'fMRI', // Required: enum
            resolution: { x: 1, y: 1, z: 1 }, // Required: Vector3
            metadata: { acquisitionTime: 300, sequence: 'EPI' }, // Required: object
            dataQualityScore: 0.95, // Required: number (0-1)
            // Optional fields can be added if needed by the component
          },
          timestamp: nowISO, // Required: string (ISO format)
          processingLevel: 'analyzed', // Required: enum
          lastUpdated: nowISO, // Required: string (ISO format)
          version: '1.0.0', // Required: string
          regions: [
            // Required: BrainRegion[]
            // Added 'activity' field matching 'activityLevel' as required by verifyBrainRegion
            {
              id: 'prefrontal',
              name: 'Prefrontal Cortex',
              position: { x: 0, y: 2, z: 0 },
              color: '#ff0000',
              connections: ['pfc-amy', 'pfc-hip'],
              activityLevel: 0.75,
              isActive: true,
              hemisphereLocation: 'left',
              dataConfidence: 0.9,
              volume: 100,
              activity: 0.75,
            },
            {
              id: 'amygdala',
              name: 'Amygdala',
              position: { x: -0.5, y: 0, z: 0 },
              color: '#00ff00',
              connections: ['pfc-amy', 'amy-hip'],
              activityLevel: 0.9,
              isActive: true,
              hemisphereLocation: 'left',
              dataConfidence: 0.9,
              volume: 50,
              activity: 0.9,
            },
            {
              id: 'hippocampus',
              name: 'Hippocampus',
              position: { x: 0.5, y: 0, z: 0 },
              color: '#0000ff',
              connections: ['pfc-hip', 'amy-hip'],
              activityLevel: 0.6,
              isActive: true,
              hemisphereLocation: 'right',
              dataConfidence: 0.9,
              volume: 75,
              activity: 0.6,
            },
          ],
          connections: [
            // Required: NeuralConnection[]
            // Added missing required 'activityLevel' field
            {
              id: 'pfc-amy',
              sourceId: 'prefrontal',
              targetId: 'amygdala',
              strength: 0.8,
              type: 'excitatory',
              directionality: 'unidirectional',
              dataConfidence: 0.85,
              activityLevel: 0.8,
            },
            {
              id: 'pfc-hip',
              sourceId: 'prefrontal',
              targetId: 'hippocampus',
              strength: 0.7,
              type: 'excitatory',
              directionality: 'unidirectional',
              dataConfidence: 0.85,
              activityLevel: 0.7,
            },
            {
              id: 'amy-hip',
              sourceId: 'amygdala',
              targetId: 'hippocampus',
              strength: 0.9,
              type: 'inhibitory',
              directionality: 'bidirectional',
              dataConfidence: 0.85,
              activityLevel: 0.75,
            },
          ],
          // Optional fields can be added if needed
          // algorithmVersion: 'v2.1',
        };
        interceptedRequest.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockBrainModel),
        });
      } else {
        // Allow other requests to continue
        interceptedRequest.continue();
      }
    });
    // --- End Mock API Response ---
    // --- End Event Listeners ---

    // Using static HTML file instead of dev server
    console.log(`[Puppeteer] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle0' }); // Wait for network activity to cease

    console.log('[Puppeteer] Waiting for R3F canvas element to appear...');
    // Wait directly for the canvas element, giving it ample time
    const canvasSelector = 'canvas';
    await page.waitForSelector(canvasSelector, { timeout: 30000 }); // Wait up to 30 seconds for the canvas

    console.log('[Puppeteer] Checking for canvas element...');
    // Check if a canvas element associated with R3F exists
    const canvasElement = await page.$(canvasSelector);

    if (canvasElement) {
      console.log('✅ SUCCESS: Canvas element found.');
      // Basic assertion
      assert.ok(canvasElement, 'Canvas element should exist');
      // Add more sophisticated checks here if needed:
      // - Check canvas dimensions
      // - Execute script in browser context to interact with Three.js scene (page.evaluate)
      // - Take screenshots (page.screenshot) for visual inspection
    } else {
      // Take screenshot on failure for debugging
      const screenshotPath = 'test-puppeteer/failure-screenshot-r3f-basic.png';
      await page.screenshot({ path: screenshotPath });
      console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
      throw new Error(
        `❌ FAILURE: Canvas element ('${canvasSelector}') not found on ${targetUrl}.`
      );
    }

    console.log('[Puppeteer] Basic R3F test finished successfully.');
    console.log(`Node.js version: ${process.version}`);
  } catch (error) {
    console.error('[Puppeteer] Basic R3F test failed:', error);
    if (browser && page) {
      // Check if page exists before screenshot
      try {
        const screenshotPath = 'test-puppeteer/failure-screenshot-r3f-basic.png';
        await page.screenshot({ path: screenshotPath });
        console.error(`[Puppeteer] Screenshot saved to ${screenshotPath}`);
      } catch (ssError) {
        console.error('[Puppeteer] Failed to take screenshot:', ssError);
      }
    }
    process.exitCode = 1; // Indicate failure
  } finally {
    if (browser) {
      console.log('[Puppeteer] Closing browser...');
      await browser.close();
    }
  }
})();