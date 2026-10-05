import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wbtet.com' },
    update: {},
    create: {
      email: 'admin@wbtet.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
    },
  });

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@wbtet.com' },
    update: {},
    create: {
      email: 'student@wbtet.com',
      name: 'Test Student',
      password: studentPassword,
      role: 'student',
    },
  });

  // Create Subjects
  const subjects = [
    { name: 'Child Development & Pedagogy', orderIndex: 1 },
    { name: 'Language I', orderIndex: 2 },
    { name: 'Language II — English', orderIndex: 3 },
    { name: 'Mathematics', orderIndex: 4 },
    { name: 'Environmental Studies', orderIndex: 5 },
  ];

  const createdSubjects = [];
  for (const sub of subjects) {
    const created = await prisma.subject.create({
      data: sub,
    });
    createdSubjects.push(created);
  }

  // Create Mock Test
  const mockTest = await prisma.mockTest.create({
    data: {
      title: 'WB TET Full Mock Test — Set 01',
      description: 'A full length mock test based on WB TET syllabus',
      durationMinutes: 150,
      totalMarks: 150,
      passingMarks: 90,
      status: 'published',
      isRandomized: false,
      createdById: admin.id,
    },
  });

  // For testing, just create a few questions per subject and add them to the test
  // A real exam would need 30 questions per subject, but let's generate 2 questions per subject for the seed
  
  let orderIndex = 1;
  for (const subject of createdSubjects) {
    for (let i = 1; i <= 2; i++) {
      const q = await prisma.question.create({
        data: {
          subjectId: subject.id,
          questionText: `Sample question ${i} for ${subject.name}`,
          optionA: `Option A for Q${i}`,
          optionB: `Option B for Q${i}`,
          optionC: `Option C for Q${i}`,
          optionD: `Option D for Q${i}`,
          correctOption: 'A',
          explanation: `This is the explanation for question ${i} of ${subject.name}. Option A is correct because...`,
          status: 'published',
        },
      });

      await prisma.testQuestion.create({
        data: {
          mockTestId: mockTest.id,
          questionId: q.id,
          orderIndex: orderIndex++,
        },
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
