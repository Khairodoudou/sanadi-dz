import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPass = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sanadidz.dz" },
    update: {},
    create: { name: "Admin SanadiDZ", email: "admin@sanadidz.dz", password: adminPass, role: "ADMIN", approved: true, wilaya: "Alger" },
  });

  const patientPass = await bcrypt.hash("patient123", 12);
  const patient = await prisma.user.upsert({
    where: { email: "patient@sanadidz.dz" },
    update: {},
    create: { name: "Amina Benali", email: "patient@sanadidz.dz", password: patientPass, role: "PATIENT", approved: true, phone: "+213 550 123 456", wilaya: "Alger" },
  });

  const providerPass = await bcrypt.hash("provider123", 12);
  const provider = await prisma.user.upsert({
    where: { email: "provider@sanadidz.dz" },
    update: {},
    create: { name: "Dr. Karim Meziane", email: "provider@sanadidz.dz", password: providerPass, role: "PROVIDER", approved: true, phone: "+213 661 987 654", wilaya: "Alger" },
  });

  const services = [
    { name: "Nursing Care", nameAr: "رعاية تمريضية", nameFr: "Soins Infirmiers", category: "HOME_CARE", description: "Professional nursing care at home.", descFr: "Soins infirmiers professionnels à domicile : injections, pansements, perfusions.", icon: "Stethoscope", price: 2500, duration: 60 },
    { name: "Elderly Care", nameAr: "رعاية المسنين", nameFr: "Aide aux Personnes Âgées", category: "HOME_CARE", description: "Daily living assistance for elderly.", descFr: "Aide à la vie quotidienne et accompagnement des personnes âgées.", icon: "Heart", price: 3000, duration: 120 },
    { name: "Postnatal Care", nameAr: "رعاية ما بعد الولادة", nameFr: "Soins Post-Nataux", category: "HOME_CARE", description: "Expert postnatal care for mother and baby.", descFr: "Soins post-nataux experts pour la mère et le bébé à domicile.", icon: "Baby", price: 3500, duration: 90 },
    { name: "Video Consultation", nameAr: "استشارة طبية عن بُعد", nameFr: "Téléconsultation Médicale", category: "TELEMEDICINE", description: "Video consultation with doctors.", descFr: "Consultation médicale sécurisée en vidéo avec des médecins qualifiés.", icon: "Video", price: 1500, duration: 30 },
    { name: "Remote Monitoring", nameAr: "المراقبة عن بُعد", nameFr: "Surveillance à Distance", category: "TELEMEDICINE", description: "Remote monitoring for chronic diseases.", descFr: "Surveillance continue à distance pour la gestion des maladies chroniques.", icon: "Activity", price: 4000, duration: 0 },
    { name: "Care Coordination", nameAr: "تنسيق الرعاية", nameFr: "Coordination des Soins", category: "COORDINATION", description: "Case manager and care plan creation.", descFr: "Gestionnaire de cas dédié et création de plan de soins personnalisé.", icon: "ClipboardList", price: 5000, duration: 60 },
    { name: "Nutrition Coaching", nameAr: "استشارة تغذية", nameFr: "Coaching Nutritionnel", category: "WELLBEING", description: "Personalized nutrition plans.", descFr: "Plans nutritionnels personnalisés adaptés à vos besoins de santé.", icon: "Salad", price: 2000, duration: 45 },
    { name: "Psychology Support", nameAr: "الدعم النفسي", nameFr: "Soutien Psychologique", category: "WELLBEING", description: "Professional psychological support.", descFr: "Soutien psychologique professionnel et séances de conseil.", icon: "Brain", price: 3000, duration: 60 },
    { name: "Medical Transport", nameAr: "نقل طبي", nameFr: "Transport Médical", category: "DAILY_SUPPORT", description: "Safe medical transport.", descFr: "Transport médical sûr et confortable pour vos rendez-vous.", icon: "Car", price: 1000, duration: 0 },
    { name: "Adapted Meal Delivery", nameAr: "توصيل وجبات طبية", nameFr: "Livraison Repas Adaptés", category: "DAILY_SUPPORT", description: "Adapted meal delivery.", descFr: "Livraison de repas adaptés pour patients avec besoins diététiques.", icon: "UtensilsCrossed", price: 800, duration: 0 },
  ];

  for (const s of services) {
    const id = s.name.replace(/\s+/g, "-").toLowerCase();
    await prisma.service.upsert({ where: { id }, update: {}, create: { id, ...s } });
  }

  const svc = await prisma.service.findFirst({ where: { category: "HOME_CARE" } });
  if (svc) {
    await prisma.appointment.create({ data: { patientId: patient.id, providerId: provider.id, serviceId: svc.id, status: "CONFIRMED", scheduledAt: new Date(Date.now() + 86400000 * 2), address: "12 Rue Didouche Mourad, Alger", notes: "Patient has diabetes." } });
    await prisma.appointment.create({ data: { patientId: patient.id, providerId: provider.id, serviceId: svc.id, status: "PENDING", scheduledAt: new Date(Date.now() + 86400000 * 5), address: "12 Rue Didouche Mourad, Alger" } });
    await prisma.appointment.create({ data: { patientId: patient.id, serviceId: svc.id, status: "COMPLETED", scheduledAt: new Date(Date.now() - 86400000 * 3), address: "12 Rue Didouche Mourad, Alger" } });
  }

  await prisma.medicalRecord.create({ data: { patientId: patient.id, providerId: provider.id, title: "Blood Pressure Report", diagnosis: "Hypertension légère", notes: "BP: 130/85 mmHg. Reduce sodium, monitor weekly.", date: new Date(Date.now() - 86400000 * 10) } });
  await prisma.medicalRecord.create({ data: { patientId: patient.id, providerId: provider.id, title: "Diabetes Follow-up", diagnosis: "Diabète de type 2", prescriptions: "Metformin 500mg", notes: "HbA1c: 7.2%. Diet plan updated.", date: new Date(Date.now() - 86400000 * 5) } });

  await prisma.notification.create({ data: { userId: patient.id, message: "Your appointment has been confirmed for tomorrow." } });
  await prisma.notification.create({ data: { userId: patient.id, message: "New medical record added by Dr. Meziane." } });
  await prisma.notification.create({ data: { userId: provider.id, message: "New appointment request from Amina Benali." } });

  // Platform Settings
  const defaultSettings = [
    { key: "platform_name",       value: "SanadiDZ" },
    { key: "platform_email",      value: "contact@sanadidz.dz" },
    { key: "platform_phone",      value: "+213 XXX XXX XXX" },
    { key: "platform_address",    value: "Alger, Algérie" },
    { key: "platform_commission", value: "10" },
    { key: "platform_tva",        value: "0" },
  ];
  for (const s of defaultSettings) {
    await prisma.platformSettings.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  // Categories
  const categories = [
    { name: "General Practitioner", nameFr: "Médecin généraliste", nameAr: "طبيب عام",        icon: "Stethoscope" },
    { name: "Cardiologist",         nameFr: "Cardiologue",          nameAr: "طبيب قلب",         icon: "Heart" },
    { name: "Nurse",                nameFr: "Infirmier",            nameAr: "ممرض",              icon: "Activity" },
    { name: "Physiotherapist",      nameFr: "Kinésithérapeute",     nameAr: "معالج فيزيائي",     icon: "Dumbbell" },
    { name: "Psychologist",         nameFr: "Psychologue",          nameAr: "طبيب نفسي",         icon: "Brain" },
    { name: "Nutritionist",         nameFr: "Nutritionniste",       nameAr: "أخصائي تغذية",      icon: "Salad" },
    { name: "Midwife",              nameFr: "Sage-femme",           nameAr: "قابلة",             icon: "Baby" },
    { name: "Dermatologist",        nameFr: "Dermatologue",         nameAr: "طبيب جلدية",        icon: "Scan" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { id: c.name.replace(/\s+/g, "-").toLowerCase() }, update: {}, create: { id: c.name.replace(/\s+/g, "-").toLowerCase(), ...c } });
  }

  // Wilayas (top 10)
  const wilayas = [
    { name: "Alger",       nameAr: "الجزائر",    code: "16" },
    { name: "Oran",        nameAr: "وهران",       code: "31" },
    { name: "Constantine", nameAr: "قسنطينة",     code: "25" },
    { name: "Annaba",      nameAr: "عنابة",       code: "23" },
    { name: "Blida",       nameAr: "البليدة",     code: "09" },
    { name: "Sétif",       nameAr: "سطيف",        code: "19" },
    { name: "Batna",       nameAr: "باتنة",       code: "05" },
    { name: "Béjaïa",      nameAr: "بجاية",       code: "06" },
    { name: "Tlemcen",     nameAr: "تلمسان",      code: "13" },
    { name: "Tizi Ouzou",  nameAr: "تيزي وزو",    code: "15" },
  ];
  for (const w of wilayas) {
    await prisma.wilaya.upsert({ where: { code: w.code }, update: {}, create: w });
  }

  console.log("Seed complete!");
  console.log("  Admin:    admin@sanadidz.dz / admin123");
  console.log("  Patient:  patient@sanadidz.dz / patient123");
  console.log("  Provider: provider@sanadidz.dz / provider123");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
