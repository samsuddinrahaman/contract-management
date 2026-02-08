import { prisma } from '../src/config/database.js';
import { FieldType, ContractStatus } from '@prisma/client';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create sample blueprints with fields included in the response
  const ndaBlueprint = await prisma.blueprint.create({
    data: {
      name: 'Non-Disclosure Agreement',
      description: 'Standard NDA template for external partnerships',
      fields: {
        create: [
          { type: FieldType.TEXT, label: 'Company Name', required: true, positionX: 0, positionY: 0 },
          { type: FieldType.TEXT, label: 'Counterparty Name', required: true, positionX: 0, positionY: 1 },
          { type: FieldType.DATE, label: 'Effective Date', required: true, positionX: 0, positionY: 2 },
          { type: FieldType.TEXT, label: 'Governing Law State', required: true, positionX: 0, positionY: 3 },
          { type: FieldType.CHECKBOX, label: 'Mutual NDA', required: false, positionX: 0, positionY: 4 },
          { type: FieldType.SIGNATURE, label: 'Company Representative Signature', required: true, positionX: 0, positionY: 5 },
          { type: FieldType.SIGNATURE, label: 'Counterparty Signature', required: true, positionX: 0, positionY: 6 },
        ],
      },
    },
    include: {
      fields: true,
    },
  });

  const employmentBlueprint = await prisma.blueprint.create({
    data: {
      name: 'Employment Agreement',
      description: 'Standard employment contract template',
      fields: {
        create: [
          { type: FieldType.TEXT, label: 'Employee Full Name', required: true, positionX: 0, positionY: 0 },
          { type: FieldType.TEXT, label: 'Job Title', required: true, positionX: 0, positionY: 1 },
          { type: FieldType.DATE, label: 'Start Date', required: true, positionX: 0, positionY: 2 },
          { type: FieldType.TEXT, label: 'Salary', required: true, positionX: 0, positionY: 3 },
          { type: FieldType.CHECKBOX, label: 'Full Time Position', required: true, positionX: 0, positionY: 4 },
          { type: FieldType.SIGNATURE, label: 'Employee Signature', required: true, positionX: 0, positionY: 5 },
          { type: FieldType.SIGNATURE, label: 'Employer Signature', required: true, positionX: 0, positionY: 6 },
        ],
      },
    },
    include: {
      fields: true,
    },
  });

  const serviceBlueprint = await prisma.blueprint.create({
    data: {
      name: 'Service Agreement',
      description: 'Professional services contract template',
      fields: {
        create: [
          { type: FieldType.TEXT, label: 'Service Provider', required: true, positionX: 0, positionY: 0 },
          { type: FieldType.TEXT, label: 'Client Name', required: true, positionX: 0, positionY: 1 },
          { type: FieldType.TEXT, label: 'Service Description', required: true, positionX: 0, positionY: 2 },
          { type: FieldType.DATE, label: 'Service Start Date', required: true, positionX: 0, positionY: 3 },
          { type: FieldType.DATE, label: 'Service End Date', required: false, positionX: 0, positionY: 4 },
          { type: FieldType.TEXT, label: 'Total Fee', required: true, positionX: 0, positionY: 5 },
          { type: FieldType.SIGNATURE, label: 'Service Provider Signature', required: true, positionX: 0, positionY: 6 },
          { type: FieldType.SIGNATURE, label: 'Client Signature', required: true, positionX: 0, positionY: 7 },
        ],
      },
    },
    include: {
      fields: true,
    },
  });

  // Create sample contracts
  const sampleContracts = [
    {
      name: 'NDA - TechCorp Partnership',
      blueprintId: ndaBlueprint.id,
      status: ContractStatus.SIGNED,
      values: {
        create: [
          { fieldId: ndaBlueprint.fields[0].id, value: 'Acme Inc' },
          { fieldId: ndaBlueprint.fields[1].id, value: 'TechCorp LLC' },
          { fieldId: ndaBlueprint.fields[2].id, value: '2024-01-15' },
          { fieldId: ndaBlueprint.fields[3].id, value: 'California' },
          { fieldId: ndaBlueprint.fields[4].id, value: 'true' },
        ],
      },
    },
    {
      name: 'Employment - John Doe',
      blueprintId: employmentBlueprint.id,
      status: ContractStatus.APPROVED,
      values: {
        create: [
          { fieldId: employmentBlueprint.fields[0].id, value: 'John Doe' },
          { fieldId: employmentBlueprint.fields[1].id, value: 'Senior Developer' },
          { fieldId: employmentBlueprint.fields[2].id, value: '2024-02-01' },
          { fieldId: employmentBlueprint.fields[3].id, value: '$120,000/year' },
          { fieldId: employmentBlueprint.fields[4].id, value: 'true' },
        ],
      },
    },
    {
      name: 'Service - Website Development',
      blueprintId: serviceBlueprint.id,
      status: ContractStatus.CREATED,
      values: {
        create: [
          { fieldId: serviceBlueprint.fields[0].id, value: 'WebDev Pro' },
          { fieldId: serviceBlueprint.fields[1].id, value: 'StartupXYZ' },
          { fieldId: serviceBlueprint.fields[2].id, value: 'Full-stack web application development' },
          { fieldId: serviceBlueprint.fields[3].id, value: '2024-03-01' },
          { fieldId: serviceBlueprint.fields[5].id, value: '$25,000' },
        ],
      },
    },
  ];

  for (const contractData of sampleContracts) {
    await prisma.contract.create({
      data: contractData,
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`📋 Created ${3} blueprints`);
  console.log(`📄 Created ${sampleContracts.length} sample contracts`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
