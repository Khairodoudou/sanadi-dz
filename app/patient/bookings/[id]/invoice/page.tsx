import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Image from "next/image";
import logoImg from "@/public/logo.png";
import { PrintButton } from "@/components/ui/PrintButton";

export default async function InvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session || session.role !== "PATIENT") redirect("/login");

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      service: true,
      provider: true,
      patient: true,
      payment: true,
    },
  });

  if (!appointment || appointment.patientId !== session.id) redirect("/patient/bookings");
  if (!appointment.payment || appointment.payment.status !== "PAID") redirect("/patient/bookings");

  return (
    <div className="bg-white min-h-screen text-black p-8 max-w-3xl mx-auto" style={{ fontFamily: "sans-serif" }}>
      {/* Script to trigger print and hide navigation elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        nav, footer, aside { display: none !important; }
      `}} />
      
      <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">
        <div>
          <Image src={logoImg} alt="SanadiDZ Logo" width={150} height={50} className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">FACTURE</h1>
          <p className="text-gray-500">Ref: #{appointment.payment.id.slice(-8).toUpperCase()}</p>
          <p className="text-gray-500">Date: {new Date(appointment.payment.createdAt).toLocaleDateString("fr-DZ")}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold text-gray-800">SanadiDZ inc.</h2>
          <p className="text-gray-500 text-sm">12 Rue Didouche Mourad<br />Alger, 16000<br />contact@sanadidz.dz</p>
        </div>
      </div>

      <div className="flex justify-between mb-12">
        <div>
          <h3 className="text-gray-500 font-medium mb-1">Facturé à :</h3>
          <p className="font-bold text-gray-800">{appointment.patient.name}</p>
          <p className="text-gray-600">{appointment.patient.email}</p>
          <p className="text-gray-600">{appointment.address}</p>
        </div>
        <div className="text-right">
          <h3 className="text-gray-500 font-medium mb-1">Méthode de paiement :</h3>
          <p className="font-bold text-gray-800">{appointment.payment.method || "CIB"}</p>
          <p className="text-green-600 font-bold">PAYÉ</p>
        </div>
      </div>

      <table className="w-full mb-12 text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-3 font-medium">Description du Service</th>
            <th className="py-3 font-medium text-right">Prestataire</th>
            <th className="py-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-4">
              <p className="font-bold text-gray-800">{appointment.service.nameFr}</p>
              <p className="text-sm text-gray-500">Rendez-vous le : {new Date(appointment.scheduledAt).toLocaleString("fr-DZ")}</p>
            </td>
            <td className="py-4 text-right text-gray-600">{appointment.provider?.name || "Non assigné"}</td>
            <td className="py-4 text-right font-bold text-gray-800">{appointment.payment.amount.toLocaleString()} DZD</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2 font-bold text-xl border-t-2 border-gray-800 pt-4">
            <span>Total TTC :</span>
            <span>{appointment.payment.amount.toLocaleString()} DZD</span>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-gray-500 text-sm border-t border-gray-200 pt-8">
        <p>Merci pour votre confiance en SanadiDZ.</p>
        <p>Pour toute question concernant cette facture, veuillez nous contacter.</p>
      </div>

      <div className="mt-8 text-center no-print">
        <PrintButton />
      </div>
    </div>
  );
}
