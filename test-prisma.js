import pkg from './electron/generated/client/index.js';
const { PrismaClient } = pkg;
console.log('Constructor:', PrismaClient.toString());
try {
  const p = new PrismaClient({ datasourceUrl: 'file:test.db' });
  console.log('Success with datasourceUrl');
} catch (e) {
  console.log('Failed with datasourceUrl:', e.message);
}
try {
  const p = new PrismaClient({ datasources: { db: { url: 'file:test.db' } } });
  console.log('Success with datasources');
} catch (e) {
  console.log('Failed with datasources:', e.message);
}
try {
  const p = new PrismaClient({});
  console.log('Success with empty object {}');
} catch (e) {
  console.log('Failed with empty object {}:', e.message);
}
