import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  AssignmentStatus,
  TrainingType,
  UserRole,
} from "../src/generated/prisma/client";
import { createPrismaClient, ensurePrismaReady } from "../src/lib/prisma";

const prisma = createPrismaClient();

async function main() {
  await ensurePrismaReady();
  await prisma.emailOutbox.deleteMany();
  await prisma.trainingEventEnrollment.deleteMany();
  await prisma.trainingEvent.deleteMany();
  await prisma.appNotification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.onboardingTaskProgress.deleteMany();
  await prisma.onboardingInstance.deleteMany();
  await prisma.onboardingTask.deleteMany();
  await prisma.onboardingTemplate.deleteMany();
  await prisma.trainingAssignment.deleteMany();
  await prisma.employeeCompetency.deleteMany();
  await prisma.roleCompetencyRequirement.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.training.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.jobRole.deleteMany();

  const password = await bcrypt.hash("demo1234", 10);

  const roleProd = await prisma.jobRole.create({
    data: { name: "Produktion — Maschinenbediener" },
  });
  const roleShift = await prisma.jobRole.create({
    data: { name: "Produktion — Schichtführer" },
  });
  const roleOffice = await prisma.jobRole.create({
    data: { name: "Verwaltung — HR" },
  });

  const trainings = await Promise.all([
    prisma.training.create({
      data: {
        title: "Jährliche Arbeitsschutzunterweisung",
        category: "Arbeitsschutz",
        mandatory: true,
        intervalMonths: 12,
        tags: "Arbeitsschutz",
        trainingType: TrainingType.PRESENCE,
      },
    }),
    prisma.training.create({
      data: {
        title: "Datenschutz Grundschulung",
        category: "Datenschutz",
        mandatory: true,
        intervalMonths: 12,
        tags: "Datenschutz",
        trainingType: TrainingType.E_LEARNING,
      },
    }),
    prisma.training.create({
      data: {
        title: "Compliance & Code of Conduct",
        category: "Compliance",
        mandatory: true,
        intervalMonths: 12,
        tags: "Compliance",
        trainingType: TrainingType.E_LEARNING,
      },
    }),
    prisma.training.create({
      data: {
        title: "IATF / Qualitätsbewusstsein",
        category: "QMS",
        mandatory: true,
        intervalMonths: 12,
        tags: "QMS,IATF",
        trainingType: TrainingType.INTERNAL,
      },
    }),
  ]);

  const fk = await prisma.employee.create({
    data: {
      firstName: "Anna",
      lastName: "Schmidt",
      email: "anna.schmidt@demo.knauf.local",
      department: "Produktion",
      jobRoleId: roleShift.id,
      startDate: new Date("2018-03-01"),
    },
  });

  const hrEmp = await prisma.employee.create({
    data: {
      firstName: "Laura",
      lastName: "Weber",
      email: "laura.weber@demo.knauf.local",
      department: "Personal",
      jobRoleId: roleOffice.id,
      startDate: new Date("2019-06-15"),
    },
  });

  const employees = [];
  for (let i = 1; i <= 8; i++) {
    employees.push(
      await prisma.employee.create({
        data: {
          firstName: `Max${i}`,
          lastName: "Muster",
          email: `max${i}.muster@demo.knauf.local`,
          department: i <= 6 ? "Produktion" : "Logistik",
          jobRoleId: roleProd.id,
          managerId: i <= 6 ? fk.id : undefined,
          startDate: new Date(2020 + (i % 4), i % 12, 1),
        },
      }),
    );
  }

  await prisma.user.createMany({
    data: [
      {
        email: "hr@demo.knauf.local",
        passwordHash: password,
        role: UserRole.HR_ADMIN,
        employeeId: hrEmp.id,
      },
      {
        email: "qm@demo.knauf.local",
        passwordHash: password,
        role: UserRole.QM_READONLY,
      },
      {
        email: fk.email,
        passwordHash: password,
        role: UserRole.MANAGER,
        employeeId: fk.id,
      },
      {
        email: employees[0].email,
        passwordHash: password,
        role: UserRole.EMPLOYEE,
        employeeId: employees[0].id,
      },
    ],
  });

  const due = new Date();
  due.setMonth(due.getMonth() + 1);
  const overdue = new Date();
  overdue.setMonth(overdue.getMonth() - 1);

  for (const emp of [fk, ...employees]) {
    for (const [idx, tr] of trainings.entries()) {
      await prisma.trainingAssignment.create({
        data: {
          trainingId: tr.id,
          employeeId: emp.id,
          dueDate: idx === 0 && emp.id === employees[2].id ? overdue : due,
          status:
            idx === 0 && emp.id === employees[1].id
              ? AssignmentStatus.COMPLETED
              : AssignmentStatus.OPEN,
          completedAt:
            idx === 0 && emp.id === employees[1].id ? new Date() : undefined,
          validUntil:
            idx === 0 && emp.id === employees[1].id
              ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              : undefined,
        },
      });
    }
  }

  const compQuality = await prisma.competency.create({
    data: { name: "Qualitätsbewusstsein", category: "QMS" },
  });
  const compSafety = await prisma.competency.create({
    data: { name: "Arbeitssicherheit", category: "Arbeitsschutz" },
  });

  await prisma.training.update({
    where: { id: trainings[0].id },
    data: { competencyId: compSafety.id },
  });
  await prisma.training.update({
    where: { id: trainings[3].id },
    data: { competencyId: compQuality.id },
  });

  await prisma.trainingEvent.create({
    data: {
      trainingId: trainings[0].id,
      startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: "Werk — Schulungsraum A",
      capacity: 20,
    },
  });

  await prisma.roleCompetencyRequirement.createMany({
    data: [
      { jobRoleId: roleProd.id, competencyId: compQuality.id, targetLevel: 2 },
      { jobRoleId: roleProd.id, competencyId: compSafety.id, targetLevel: 2 },
      { jobRoleId: roleShift.id, competencyId: compQuality.id, targetLevel: 3 },
    ],
  });

  for (const emp of employees.slice(0, 4)) {
    await prisma.employeeCompetency.createMany({
      data: [
        { employeeId: emp.id, competencyId: compQuality.id, actualLevel: 1 },
        { employeeId: emp.id, competencyId: compSafety.id, actualLevel: 2 },
      ],
    });
  }

  const onboarding = await prisma.onboardingTemplate.create({
    data: {
      name: "Onboarding Produktion",
      jobRoleId: roleProd.id,
      tasks: {
        create: [
          { title: "Willkommen & Sicherheitsbegehung", sortOrder: 1 },
          {
            title: "Arbeitsschutzunterweisung zuweisen",
            sortOrder: 2,
            trainingId: trainings[0].id,
          },
          {
            title: "IATF Qualitätsbewusstsein",
            sortOrder: 3,
            trainingId: trainings[3].id,
          },
        ],
      },
    },
  });

  const newbie = employees[7];
  const instance = await prisma.onboardingInstance.create({
    data: { employeeId: newbie.id, templateId: onboarding.id },
  });
  const tasks = await prisma.onboardingTask.findMany({
    where: { templateId: onboarding.id },
  });
  for (const t of tasks) {
    await prisma.onboardingTaskProgress.create({
      data: { instanceId: instance.id, taskId: t.id, done: t.sortOrder === 1 },
    });
  }

  console.log("Seed OK. Demo-Logins (Passwort: demo1234):");
  console.log("  hr@demo.knauf.local (HR-Admin)");
  console.log("  qm@demo.knauf.local (QM Lesen)");
  console.log("  anna.schmidt@demo.knauf.local (FK)");
  console.log("  max1.muster@demo.knauf.local (MA)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
