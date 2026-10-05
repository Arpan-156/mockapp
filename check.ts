
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tests = await prisma.mockTest.findMany({ include: { testQuestions: true }});
  console.log(tests.map(t => t.title + ': ' + t.testQuestions.length + ' questions'));
}
main();

