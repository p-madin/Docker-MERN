// ============================================
// XML-Driven Test Runner for MERN Stack
// Supports API calls and browser automation
// ============================================

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');
const xpath = require('xpath');
const puppeteer = require('puppeteer');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const TEST_FILE = process.env.TEST_FILE || 'test-suite.xml';
const HEADLESS = process.env.HEADLESS !== 'false';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Colors
const colors = { reset: '\x1b[0m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m', gray: '\x1b[90m' };

// Global state
let browser = null;
let page = null;

// Ensure screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// Dynamic XML Parser
function parseXML(xmlString) {
    const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
    const parseStep = (node) => {
        const step = { body: {}, expected: {}, parameters: [] };
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType !== 1) continue; // Skip non-elements

            if (child.nodeName === 'body') {
                for (let j = 0; j < child.childNodes.length; j++) {
                    const field = child.childNodes[j];
                    if (field.nodeType === 1) step.body[field.nodeName] = field.textContent;
                }
            } else if (child.nodeName === 'expected') {
                for (let j = 0; j < child.childNodes.length; j++) {
                    const expect = child.childNodes[j];
                    if (expect.nodeType === 1) step.expected[expect.nodeName] = expect.textContent;
                }
            } else if (child.nodeName === 'parameters') {
                for (let j = 0; j < child.childNodes.length; j++) {
                    const param = child.childNodes[j];
                    if (param.nodeType === 1 && param.nodeName === 'parameter') {
                        const name = xpath.select1('string(./name)', param);
                        const value = xpath.select1('string(./value)', param);
                        if (name && value) step.parameters.push({ name, value });
                    }
                }
            } else {
                step[child.nodeName] = child.textContent;
            }
        }
        // Data type conversions
        if (step.timeout) step.timeout = parseInt(step.timeout);
        if (step.saveSession) step.saveSession = step.saveSession === 'true';
        if (step.useSession) step.useSession = step.useSession === 'true';
        if (step.useFrontend) step.useFrontend = step.useFrontend === 'true';
        if (step.submit) step.submit = step.submit === 'true';
        return step;
    };

    return xpath.select('//testGroup', doc).map(group => ({
        name: xpath.select1('string(./name)', group),
        tests: xpath.select('./test', group).map(test => ({
            name: xpath.select1('string(./name)', test),
            steps: xpath.select('./step', test).map(stepNode => parseStep(stepNode))
        }))
    }));
}

// Initialize browser
async function initBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: HEADLESS,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
    }
    return { browser, page };
}

// Get nested JSON value by path
const getJsonPath = (obj, path) => path.split('.').reduce((cur, key) => cur?.[key], obj);

// Unified Action Handler
async function executeStep(step, testName) {
    const { page } = await initBrowser();
    const action = step.action || 'CallApi'; // Default to CallApi if no action
    const timeout = step.timeout || 5000;

    try {
        switch (action) {
            case 'NavigateTo':
                await page.goto(step.url, { waitUntil: 'networkidle2' });
                if (step.expected.pageTitle) {
                    const title = await page.title();
                    if (!title.includes(step.expected.pageTitle)) throw new Error(`Expected title "${step.expected.pageTitle}", got "${title}"`);
                }
                return { passed: true, message: `Navigated to ${step.url}` };

            case 'FillForm':
                const params = step.parameters.length > 0 ? step.parameters : [{ name: step.selector, value: step.value }];
                // If using selector/value, we need to handle it, but params array is cleaner
                if (step.selector && step.value && step.parameters.length === 0) {
                    // Backward compat for single selector
                    await page.waitForSelector(step.selector, { timeout });
                    await page.type(step.selector, step.value);
                    return { passed: true, message: `Filled ${step.selector}` };
                }

                // If selector is provided with parameters, use it as a container scope
                const containerSelector = (step.selector && step.parameters.length > 0) ? `${step.selector} ` : '';

                for (const param of params) {
                    const selector = `${containerSelector}input[name="${param.name}"], ${containerSelector}input#${param.name}`;
                    await page.waitForSelector(selector, { timeout });
                    await page.type(selector, param.value);
                }

                if (step.submit) {
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout }).catch(() => { }),
                        page.keyboard.press('Enter')
                    ]);
                    await page.waitForSelector('body', { timeout });
                    return { passed: true, message: `Filled fields and submitted` };
                }
                return { passed: true, message: `Filled fields: ${params.map(p => p.name).join(', ')}` };

            case 'Click':
                await page.waitForSelector(step.selector, { timeout });
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout }).catch(() => { }),
                    page.click(step.selector)
                ]);
                await page.waitForSelector('body', { timeout });
                return { passed: true, message: `Clicked ${step.selector}` };

            case 'WaitForSelector':
                await page.waitForSelector(step.selector, { timeout });
                return { passed: true, message: `Found ${step.selector}` };

            case 'Screenshot':
                const file = path.join(SCREENSHOT_DIR, step.expected.filename || `shot-${Date.now()}.png`);
                await page.screenshot({ path: file });
                return { passed: true, message: `Screenshot: ${file}` };

            case 'AssertText':
                await page.waitForSelector(step.selector, { timeout });
                const text = await page.$eval(step.selector, el => el.textContent);
                if (step.expected.contains && !text.includes(step.expected.contains)) throw new Error(`Expected "${step.expected.contains}", got "${text}"`);
                if (step.expected.equals && text !== step.expected.equals) throw new Error(`Expected "${step.expected.equals}", got "${text}"`);
                return { passed: true, message: `Text assertion passed` };

            case 'CallApi':
                // Resolve URL
                const baseUrl = step.useFrontend ? FRONTEND_URL : BACKEND_URL;
                const url = step.url.startsWith('http') ? step.url : baseUrl + step.url;

                // Ensure we have a valid origin for cookies
                if (page.url() === 'about:blank') {
                    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
                }

                // Execute fetch in browser context (shares cookies automatically)
                const result = await page.evaluate(async (url, method, body) => {
                    const res = await fetch(url, {
                        method: method || 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        body: body && Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
                    });
                    const text = await res.text();
                    // Try parsing JSON, fallback to text
                    try { return { status: res.status, body: JSON.parse(text), isJson: true }; }
                    catch { return { status: res.status, body: text, isJson: false }; }
                }, url, step.method, step.body);

                // Validation
                const { expected } = step;
                if (expected.statusCode && result.status !== parseInt(expected.statusCode)) throw new Error(`Status ${expected.statusCode}, got ${result.status}`);

                if (result.isJson) {
                    if (expected.jsonPath) {
                        const val = getJsonPath(result.body, expected.jsonPath);
                        if (expected.equals && String(val) !== String(expected.equals)) throw new Error(`${expected.jsonPath}="${expected.equals}", got "${val}"`);
                        if (expected.contains && !String(val).includes(expected.contains)) throw new Error(`${expected.jsonPath} contains "${expected.contains}", got "${val}"`);
                    }
                } else if (expected.bodyContains && !result.body.includes(expected.bodyContains)) {
                    throw new Error(`Body contains "${expected.bodyContains}"`);
                }

                return { passed: true, message: `${step.method || 'GET'} ${step.url} OK` };

            default:
                throw new Error(`Unknown action: ${action}`);
        }
    } catch (err) {
        const shot = path.join(SCREENSHOT_DIR, `error-${Date.now()}.png`);
        try { await page.screenshot({ path: shot }); } catch { }
        return { passed: false, message: `${err.message} (screenshot saved)` };
    }
}

// Main Runner
async function runTests() {
    console.log(`\n${colors.cyan}=== Minimalist Test Runner ===${colors.reset}\n`);
    const xmlContent = fs.readFileSync(path.join(__dirname, TEST_FILE), 'utf8');
    const groups = parseXML(xmlContent);

    let total = 0, passed = 0;

    try {
        for (const group of groups) {
            console.log(`${colors.yellow}${group.name}${colors.reset}`);
            for (const test of group.tests) {
                console.log(`  ${colors.cyan}${test.name}${colors.reset}`);
                let testPassed = true;
                for (const step of test.steps) {
                    const res = await executeStep(step, test.name);
                    const desc = step.action || `${step.method || 'GET'} ${step.url}`;
                    if (res.passed) console.log(`    ${colors.green}✓ ${desc}${colors.reset} ${colors.gray}${res.message}${colors.reset}`);
                    else {
                        console.log(`    ${colors.red}✗ ${desc}${colors.reset} ${res.message}`);
                        testPassed = false;
                        break;
                    }
                }
                total++;
                if (testPassed) passed++;
                console.log('');
            }
        }
    } finally {
        if (browser) await browser.close();
    }

    console.log(`${colors.cyan}=== Summary ===${colors.reset}`);
    console.log(`Total: ${total}, Passed: ${colors.green}${passed}${colors.reset}, Failed: ${colors.red}${total - passed}${colors.reset}`);
    process.exit(total === passed ? 0 : 1);
}

runTests().catch(e => { console.error(e); process.exit(1); });
