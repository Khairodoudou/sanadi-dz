"use client";
import { useState } from "react";
import { X, CreditCard, Wallet, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface PaymentModalProps {
  appointmentId: string;
  amount: number;
  onClose: () => void;
  onSuccess: (payment: any) => void;
}

export function PaymentModal({ appointmentId, amount, onClose, onSuccess }: PaymentModalProps) {
  const { lang } = useLanguage();
  const [method, setMethod] = useState("CIB");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate network delay for payment gateway
      await new Promise(r => setTimeout(r, 1500));

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, amount, method }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      onSuccess(data.payment);
    } catch (err: any) {
      setError(err.message || "An error occurred during payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="bg-[var(--bg)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {lang === "ar" ? "الدفع الإلكتروني" : lang === "en" ? "Online Payment" : "Paiement en ligne"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-muted)] text-[var(--text-muted)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-[var(--text-muted)] text-sm mb-1">
              {lang === "ar" ? "المبلغ المطلوب" : lang === "en" ? "Amount to pay" : "Montant à payer"}
            </p>
            <p className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">
              {amount.toLocaleString()} <span className="text-xl">DZD</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === "ar" ? "طريقة الدفع" : lang === "en" ? "Payment method" : "Méthode de paiement"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("CIB")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    method === "CIB" ? "border-primary-500 bg-primary-500/10 text-primary-700 dark:text-primary-400" : "border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500/50"
                  }`}
                >
                  <CreditCard size={24} />
                  <span className="font-bold text-sm">Carte CIB</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("EDAHABIA")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    method === "EDAHABIA" ? "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" : "border-[var(--border)] text-[var(--text-muted)] hover:border-yellow-500/50"
                  }`}
                >
                  <Wallet size={24} />
                  <span className="font-bold text-sm">Edahabia</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="relative">
                <input type="text" className="input-field" placeholder={lang === "ar" ? "رقم البطاقة" : lang === "en" ? "Card number" : "Numéro de la carte"} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" className="input-field" placeholder="MM/YY" required />
                <input type="text" className="input-field" placeholder="CVC" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-4">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                lang === "ar" ? "تأكيد الدفع" : lang === "en" ? "Confirm Payment" : "Confirmer le paiement"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
