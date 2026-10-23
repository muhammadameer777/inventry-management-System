import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting clean database seeding for CampusEvents v3...');

  // Clean all records in referential order
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.eventRequest.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);
  const userPasswordHash = await bcrypt.hash('password123', salt);

  // 1. Create Admin User only
  console.log('[Seed] Creating admin user...');
  await prisma.user.create({
    data: {
      id: 'usr-admin-01',
      name: 'Admin User',
      email: 'admin@campusevents.local',
      passwordHash,
      role: 'ADMIN',
      phone: null,
      organization: 'Campus Events Office',
      bio: 'Platform administrator',
    },
  });

  // 2. Create demo student for testing
  const demoStudent = await prisma.user.create({
    data: {
      id: 'usr-demo-student',
      name: 'Demo Student',
      email: 'student@campusevents.local',
      passwordHash: userPasswordHash,
      role: 'USER',
      phone: null,
      organization: null,
      bio: null,
    },
  });

  // 3. Create Categories
  console.log('[Seed] Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        id: 'cat-conference',
        name: 'Conference',
        slug: 'conference',
        description: 'Professional conferences, summits, and industry gatherings.',
        icon: 'Presentation',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-workshop',
        name: 'Workshop',
        slug: 'workshop',
        description: 'Hands-on learning sessions and practical skills workshops.',
        icon: 'Cpu',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-seminar',
        name: 'Seminar',
        slug: 'seminar',
        description: 'Educational presentations and academic seminars.',
        icon: 'BookOpen',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-networking',
        name: 'Networking',
        slug: 'networking',
        description: 'Professional networking events and mixers.',
        icon: 'Users',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-cultural',
        name: 'Cultural',
        slug: 'cultural',
        description: 'Cultural events, arts, and entertainment.',
        icon: 'Sparkles',
      },
    }),
    prisma.category.create({
      data: {
        id: 'cat-sports',
        name: 'Sports',
        slug: 'sports',
        description: 'Sports events, tournaments, and athletic competitions.',
        icon: 'Trophy',
      },
    }),
  ]);

  const [catConference, catWorkshop, catSeminar, catNetworking, catCultural, catSports] = categories;

  // 4. Create sample published events
  console.log('[Seed] Creating sample events...');
  const evt1 = await prisma.event.create({
    data: {
      id: 'evt-001',
      title: 'Tech Innovation Summit 2026',
      slug: 'tech-innovation-summit-2026',
      categoryId: catConference.id,
      date: '2026-12-10',
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      location: 'Main Auditorium, Building A',
      organizer: 'Campus Events Office',
      capacity: 300,
      ticketPrice: 0,
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
      description: 'A full-day technology summit bringing together innovators, entrepreneurs, and thought leaders.',
      fullDescription: 'Join us for an inspiring day of keynotes, panel discussions, and hands-on workshops focused on emerging technologies. Topics include AI, blockchain, cloud computing, and sustainable tech. Open to all students and faculty.',
      status: 'PUBLISHED',
    },
  });

  const evt2 = await prisma.event.create({
    data: {
      id: 'evt-002',
      title: 'Web Development Bootcamp',
      slug: 'web-development-bootcamp',
      categoryId: catWorkshop.id,
      date: '2026-11-20',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      location: 'Computer Lab 301',
      organizer: 'Department of Computer Science',
      capacity: 50,
      ticketPrice: 0,
      image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&q=80&w=1200',
      description: 'Intensive hands-on workshop covering modern web development with React and Node.js.',
      fullDescription: 'Learn modern full-stack web development in this intensive one-day bootcamp. You will build a complete web application from scratch, covering React, Node.js, REST APIs, and database integration. Bring your laptop — limited seats available.',
      status: 'PUBLISHED',
    },
  });

  const evt3 = await prisma.event.create({
    data: {
      id: 'evt-003',
      title: 'Career Fair: Tech & Engineering',
      slug: 'career-fair-tech-engineering',
      categoryId: catNetworking.id,
      date: '2026-12-05',
      startTime: '11:00 AM',
      endTime: '04:00 PM',
      location: 'Grand Hall, Student Union',
      organizer: 'Career Services Office',
      capacity: 500,
      ticketPrice: 0,
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200',
      description: 'Meet top employers from tech, engineering, and finance sectors.',
      fullDescription: 'Connect with over 50 employers from leading companies in technology, engineering, and finance. Bring your resume and be ready for on-the-spot interviews. Professional attire recommended.',
      status: 'PUBLISHED',
    },
  });

  // 5. Create a sample confirmed booking for demo student
  console.log('[Seed] Creating sample booking...');
  await prisma.booking.create({
    data: {
      id: 'bkg-demo-001',
      referenceCode: 'CE-BK-001',
      userId: demoStudent.id,
      eventId: evt1.id,
      ticketType: 'General Admission',
      quantity: 1,
      totalAmount: 0,
      status: 'CONFIRMED',
      checkedIn: false,
    },
  });

  console.log('\n[Seed] ✓ Database seeded successfully');
  console.log('  Admin:   admin@campusevents.local / admin123');
  console.log('  Student: student@campusevents.local / password123');
  console.log('  Categories: 6');
  console.log('  Events: 3 (Published)');
  console.log('  Bookings: 1 (demo)');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
