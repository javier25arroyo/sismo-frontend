const baseUrl = process.env.SSR_BASE_URL ?? 'http://localhost:4000';
const routes = ['/sismos', '/historial', '/estaciones', '/consultas'];
const failures = [];

for (const route of routes) {
  try {
    const response = await fetch(new URL(route, baseUrl));
    const html = await response.text();

    if (!response.ok) {
      failures.push(`${route}: HTTP ${response.status}`);
      continue;
    }

    if (!html.includes('<app-root')) {
      failures.push(`${route}: missing app shell`);
    }

    if (
      html.includes('ReferenceError:') ||
      html.includes('window is not defined') ||
      html.includes('document is not defined') ||
      html.includes('Cannot read properties of undefined')
    ) {
      failures.push(`${route}: SSR error leaked into HTML`);
    }
  } catch (error) {
    failures.push(`${route}: ${(error instanceof Error ? error.message : String(error))}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`SSR map smoke passed for ${routes.length} routes`);
