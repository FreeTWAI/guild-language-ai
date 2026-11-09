import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';

const workspace = JSON.parse(await readFile(new URL('../../workspace.json', import.meta.url), 'utf8'));
const protocol = 'freedom.guild-launchpad/v1';
const channel = 'b5be8af2-2e86-4208-b488-c7c9f1b84512';

async function withPreviewParent(page, hostname, run) {
  const failedResources = [];
  page.on('requestfailed', request => failedResources.push({url: request.url(), error: request.failure()?.errorText}));
  const server = createServer((_request, response) => response.writeHead(200, {'Content-Type': 'text/html'}).end('<!doctype html><html><body><main></main></body></html>'));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, hostname === 'localhost' ? '127.0.0.1' : hostname, resolve);
  });
  try {
    const origin = `http://${hostname}:${server.address().port}`;
    await page.goto(origin);
    await page.evaluate(async () => {
      window.messages = []; window.receivedInit = null;
      const frame = document.createElement('iframe');
      frame.title = 'local preview'; frame.setAttribute('sandbox', 'allow-scripts');
      window.addEventListener('message', event => {
        if (event.source !== frame.contentWindow || event.origin !== 'null') return;
        if (event.data?.test === 'init-observed') window.receivedInit = event.data;
        else window.messages.push(event.data);
      });
      const loaded = new Promise(resolve => {frame.onload = resolve;});
      frame.src = 'http://127.0.0.1:4417/'; document.querySelector('main').append(frame);
      await loaded;
    });
    const frame = page.frameLocator('iframe');
    await expect(frame.locator('html')).toHaveAttribute('data-embedded', 'true');
    await expect.poll(() => frame.locator('img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    await expect.poll(() => frame.locator('html').evaluate(() => [...document.styleSheets].some(sheet => sheet.href?.endsWith('/style.css')))).toBe(true);
    await frame.locator('html').evaluate(() => {
      // Observe delivery after the actual bridge handler without replacing it.
      window.addEventListener('message', event => {
        if (event.source === window.parent) window.parent.postMessage({test: 'init-observed', origin: event.origin, payload: event.data}, '*');
      });
    });
    const payload = {protocol, type: 'init', channel, guildKey: workspace.guild_key, theme: 'light', actions: ['work', 'skills', 'tools', 'information']};
    await page.evaluate(payload => document.querySelector('iframe').contentWindow.postMessage(payload, '*'), payload);
    await expect.poll(() => page.evaluate(() => window.receivedInit)).toEqual({test: 'init-observed', origin, payload});
    await run(origin, frame);
    expect(failedResources).toEqual([]);
  } finally {
    await test.info().attach('preview-resource-requests', {body: JSON.stringify(failedResources, null, 2), contentType: 'application/json'});
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

for (const hostname of ['127.0.0.1', 'localhost']) {
  test(`actual HTTP preview supports an opaque iframe from ${hostname} on another port`, async ({page}) => {
    await withPreviewParent(page, hostname, async (origin, frame) => {
      expect(await page.evaluate(() => window.messages.filter(message => message.type === 'ready'))).toEqual([{protocol, type: 'ready', channel, guildKey: workspace.guild_key}]);
      await frame.getByRole('link', {name: '進入工作區'}).click();
      await expect.poll(() => page.evaluate(() => window.messages.filter(message => message.type === 'navigate'))).toEqual([{protocol, type: 'navigate', channel, guildKey: workspace.guild_key, action: 'work'}]);
      expect(new URL(page.url()).origin).toBe(origin);
    });
  });
}

test('actual HTTP preview bridge refuses an untrusted parent after loading its public assets', async ({page}) => {
  await withPreviewParent(page, '127.0.0.2', async () => {
    expect(await page.evaluate(() => window.messages)).toEqual([]);
  });
});
