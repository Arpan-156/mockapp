
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const brokenTestId = 'e4f146d4-9a94-481d-bcb3-dd80a30452e9';
  
  await prisma.attemptAnswer.deleteMany({ where: { attempt: { testId: brokenTestId } } });
  await prisma.attempt.deleteMany({ where: { testId: brokenTestId } });
  await prisma.mockTest.delete({ where: { id: brokenTestId } });

  console.log('Deleted broken test');
}
main();

