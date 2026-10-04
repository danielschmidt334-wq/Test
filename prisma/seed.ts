import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.onboardingStepProgress.deleteMany();
  await prisma.onboardingInstance.deleteMany();
  await prisma.onboardingTemplateStep.deleteMany();
  await prisma.onboardingTemplate.deleteMany();
  await prisma.trainingProof.deleteMany();
  await prisma.trainingAssignment.deleteMany();
  await prisma.training.deleteMany();
  await prisma.userCompetency.deleteMany();
  await prisma.jobProfileCompetency.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.user.deleteMany();
  await prisma.jobProfile.deleteMany();
  await prisma.department.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const prod = await prisma.department.create({ data: { name: "Produktion" } });
  const qm = await prisma.department.create({ data: { name: "Qualitätsmanagement" } });
  const hrDept = await prisma.department.create({ data: { name: "Personal" } });
  const log = await prisma.department.create({ data: { name: "Logistik" } });

  const profileProd = await prisma.jobProfile.create({
    data: { name: "Produktion — Maschinenbediener", description: "Fertigung IATF" },
  });
  const profileLead = await prisma.jobProfile.create({
    data: { name: "Produktion — Schichtführer", description: "Linienführung" },
  });
  const profileQm = await prisma.jobProfile.create({
    data: { name: "QM — Prüfer", description: "Qualitätssicherung" },
  });

  const compIso = await prisma.competency.create({
    data: { name: "IATF / QMS Grundlagen", description: "Normenkenntnis 7.2" },
  });
  const compSafety = await prisma.competency.create({
    data: { name: "Arbeitssicherheit", description: "Unterweisung & Gefährdungsbeurteilung" },
  });
  const compLean = await prisma.competency.create({
    data: { name: "Lean / 5S", description: "Produktionsorganisation" },
  });
  const compLead = await prisma.competency.create({
    data: { name: "Führung & Team", description: "Schichtführung" },
  });

  for (const [profileId, competencyId, targetLevel] of [
    [profileProd.id, compIso.id, 2],
    [profileProd.id, compSafety.id, 3],
    [profileProd.id, compLean.id, 2],
    [profileLead.id, compIso.id, 3],
    [profileLead.id, compSafety.id, 3],
    [profileLead.id, compLead.id, 3],
    [profileQm.id, compIso.id, 4],
    [profileQm.id, compSafety.id, 2],
  ] as const) {
    await prisma.jobProfileCompetency.create({
      data: { jobProfileId: profileId, competencyId, targetLevel },
    });
  }

  const hrAdmin = await prisma.user.create({
    data: {
      email: "hr.admin@knauf-demo.local",
      passwordHash,
      firstName: "Sabine",
      lastName: "Müller",
      role: "HR_ADMIN",
      departmentId: hrDept.id,
      entryDate: new Date("2018-03-01"),
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "fuehrungskraft@knauf-demo.local",
      passwordHash,
      firstName: "Thomas",
      lastName: "Weber",
      role: "MANAGER",
      departmentId: prod.id,
      jobProfileId: profileLead.id,
      entryDate: new Date("2015-06-15"),
    },
  });

  const employees = await Promise.all(
    [
      ["anna.schmidt@knauf-demo.local", "Anna", "Schmidt", prod.id, profileProd.id],
      ["peter.klein@knauf-demo.local", "Peter", "Klein", prod.id, profileProd.id],
      ["julia.becker@knauf-demo.local", "Julia", "Becker", prod.id, profileProd.id],
      ["markus.fischer@knauf-demo.local", "Markus", "Fischer", log.id, profileProd.id],
      ["lisa.wagner@knauf-demo.local", "Lisa", "Wagner", qm.id, profileQm.id],
      ["jonas.hoffmann@knauf-demo.local", "Jonas", "Hoffmann", prod.id, profileProd.id],
      ["nina.richter@knauf-demo.local", "Nina", "Richter", prod.id, profileProd.id],
      ["felix.bauer@knauf-demo.local", "Felix", "Bauer", log.id, profileProd.id],
    ].map(([email, firstName, lastName, departmentId, jobProfileId]) =>
      prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role: "EMPLOYEE",
          departmentId,
          jobProfileId,
          managerId: manager.id,
          entryDate: new Date("2022-01-10"),
        },
      })
    )
  );

  const trainings = await Promise.all([
    prisma.training.create({
      data: {
        title: "Jährliche Arbeitssicherheitsunterweisung",
        description: "Pflicht gemäß Arbeitsschutzgesetz",
        category: "WORK_SAFETY",
        isMandatory: true,
        intervalMonths: 12,
        durationMinutes: 45,
      },
    }),
    prisma.training.create({
      data: {
        title: "Datenschutz Grundlagen",
        category: "DATA_PROTECTION",
        isMandatory: true,
        intervalMonths: 12,
        durationMinutes: 30,
      },
    }),
    prisma.training.create({
      data: {
        title: "IATF 16949 — Bewusstsein QMS",
        category: "QMS",
        isMandatory: true,
        intervalMonths: 24,
        durationMinutes: 60,
      },
    }),
    prisma.training.create({
      data: {
        title: "Compliance / Code of Conduct",
        category: "COMPLIANCE",
        isMandatory: true,
        intervalMonths: 12,
        durationMinutes: 30,
      },
    }),
    prisma.training.create({
      data: {
        title: "Erste Hilfe Auffrischung",
        category: "OTHER",
        isMandatory: false,
        intervalMonths: 24,
        durationMinutes: 120,
      },
    }),
  ]);

  const now = new Date();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  for (const emp of employees) {
    await prisma.trainingAssignment.create({
      data: {
        userId: emp.id,
        trainingId: trainings[0].id,
        dueDate: daysAgo(5),
        status: "OVERDUE",
        assignedById: hrAdmin.id,
      },
    });
    await prisma.trainingAssignment.create({
      data: {
        userId: emp.id,
        trainingId: trainings[1].id,
        dueDate: daysFromNow(14),
        status: "OPEN",
        assignedById: hrAdmin.id,
      },
    });
    const completed = await prisma.trainingAssignment.create({
      data: {
        userId: emp.id,
        trainingId: trainings[2].id,
        dueDate: daysAgo(30),
        status: "COMPLETED",
        completedAt: daysAgo(35),
        validUntil: daysFromNow(700),
        assignedById: hrAdmin.id,
      },
    });
    if (emp.email === "anna.schmidt@knauf-demo.local") {
      await prisma.trainingProof.create({
        data: {
          assignmentId: completed.id,
          fileName: "qms-nachweis-demo.pdf",
          filePath: "demo/qms-nachweis-demo.pdf",
          mimeType: "application/pdf",
        },
      });
    }

    await prisma.userCompetency.createMany({
      data: [
        { userId: emp.id, competencyId: compIso.id, actualLevel: 2 },
        { userId: emp.id, competencyId: compSafety.id, actualLevel: 1 },
        { userId: emp.id, competencyId: compLean.id, actualLevel: 2 },
      ],
    });
  }

  await prisma.userCompetency.createMany({
    data: [
      { userId: manager.id, competencyId: compIso.id, actualLevel: 3 },
      { userId: manager.id, competencyId: compSafety.id, actualLevel: 3 },
      { userId: manager.id, competencyId: compLead.id, actualLevel: 2 },
    ],
  });

  const onboardingTemplate = await prisma.onboardingTemplate.create({
    data: {
      name: "Standard Onboarding Produktion",
      jobProfileId: profileProd.id,
      steps: {
        create: [
          { sortOrder: 1, title: "Willkommen & Sicherheitsbegehung", trainingId: trainings[0].id },
          { sortOrder: 2, title: "Datenschutz einlesen", trainingId: trainings[1].id },
          { sortOrder: 3, title: "QMS Bewusstsein", trainingId: trainings[2].id },
        ],
      },
    },
    include: { steps: true },
  });

  const newHire = employees[6];
  const instance = await prisma.onboardingInstance.create({
    data: {
      userId: newHire.id,
      templateId: onboardingTemplate.id,
    },
  });

  for (const step of onboardingTemplate.steps) {
    await prisma.onboardingStepProgress.create({
      data: {
        instanceId: instance.id,
        stepId: step.id,
        done: step.sortOrder === 1,
        doneAt: step.sortOrder === 1 ? daysAgo(2) : undefined,
      },
    });
  }

  console.log("Seed OK — Demo-Passwort für alle: demo1234");
  console.log("HR:", hrAdmin.email);
  console.log("FK:", manager.email);
  console.log("MA:", employees[0].email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
