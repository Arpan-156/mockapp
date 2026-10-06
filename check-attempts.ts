
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const attempts = await prisma.attempt.findMany({ 
    orderBy: { startedAt: 'desc' },
    include: { test: true, answers: true } 
  });
  console.log(attempts.map(a => a.id + ' | Attempt for ' + a.test.title + ' (TestID: ' + a.testId + ') has ' + a.answers.length + ' answers.'));
}
main();

