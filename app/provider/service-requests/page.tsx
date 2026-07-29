"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ClipboardList, User, MapPin, Clock, AlertTriangle, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, Loader2, MessageSquare, Calendar,
} from "lucide-react";

interface Patient { id: string; name: string; phone?: string; avatar?: string; wilaya?: string; }
interface Service { id: string; nameFr: string; nameAr: string; icon: string; category: string; }
interface ServiceReq { id: string; description: string; address: string; scheduledAt: string; urgency: string; status: string; patient: Patient; service: Service; }
interface ProviderResponse { id: string; status: string; message?: string; serviceRequest: ServiceReq; }

const statusColors: Record<string, string> = {
  PENDING:  "badge-pending",
  ACCEPTED: "badge-confirmed",
  REFUSED:  "badge-cancelled",
};

export default function ProviderServiceRequestsPage() {
  const { lang, dir } = useLanguage();
  const [responses, setResponses] = useState<ProviderResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [acting, setActing]       = useState<string | null>(null);
  const [replyMsg, setReplyMsg]   = useState<Record<string, string>>({});

  const L = {
    title:    lang === "ar" ? "طلبات الخدمة" : lang === "en" ? "Service Requests" : "Demandes de service",
    subtitle: lang === "ar" ? "الطلبات الموجهة إليك" : lang === "en" ? "Requests sent to you" : "Demandes qui vous sont adressées",
    empty:    lang === "ar" ? "لا توجد طلبات" : lang === "en" ? "No requests yet" : "Aucune demande reçue",
    accept:   lang === "ar" ? "قبول" : lang === "en" ? "Accept" : "Accepter",
    refuse:   lang === "ar" ? "رفض" : lang === "en" ? "Refuse" : "Refuser",
    pending:  lang === "ar" ? "قيد الانتظار" : lang === "en" ? "Pending" : "En attente",
    accepted: lang === "ar" ? "مقبول" : lang === "en" ? "Accepted" : "Accepté",
    refused:  lang === "ar" ? "مرفوض" : lang === "en" ? "Refused" : "Refusé",
    urgent:   lang === "ar" ? "عاجل" : lang === "en" ? "Urgent" : "Urgent",
    normal:   lang === "ar" ? "عادي" : lang === "en" ? "Normal" : "Normal",
    msg:      lang === "ar" ? "رسالة اختيارية..." : lang === "en" ? "Optional message..." : "Message optionnel...",
    patient:  lang === "ar" ? "المريض" : lang === "en" ? "Patient" : "Patient",
    service:  lang === "ar" ? "الخدمة" : lang === "en" ? "Service" : "Service",
    date:     lang === "ar" ? "التاريخ المرغوب" : lang === "en" ? "Requested Date" : "Date souhaitée",
    address:  lang === "ar" ? "العنوان" : lang === "en" ? "Address" : "Adresse",
    desc:     lang === "ar" ? "الوصف" : lang === "en" ? "Description" : "Description",
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/provider/requests");
      const d = await r.json();
      setResponses(d.responses || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAction(responseId: string, requestId: string, action: "ACCEPTED" | "REFUSED") {
    setActing(responseId);
    await fetch(`/api/service-requests/${requestId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, message: replyMsg[requestId] || "" }),
    });
    setActing(null);
    await load();
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
      <div>
        <h2 className="text-2xl font-extrabold">{L.title}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">{L.subtitle}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" size={32}/></div>
      ) : responses.length === 0 ? (
        <div className="card text-center py-20">
          <ClipboardList size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30"/>
          <p className="font-semibold text-lg">{L.empty}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map((resp) => {
            const req = resp.serviceRequest;
            const isOpen = expanded === resp.id;
            const isPending = resp.status === "PENDING";
            return (
              <div key={resp.id} className={`card transition-all ${isPending ? "border-l-4 rtl:border-r-4 rtl:border-l-0 border-l-amber-400" : ""}`}>
                {/* Header row */}
                <div className="flex items-center justify-between gap-3 flex-wrap cursor-pointer" onClick={() => setExpanded(isOpen ? null : resp.id)}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{req.service.icon}</span>
                    <div>
                      <p className="font-bold">{lang === "ar" ? req.service.nameAr : req.service.nameFr}</p>
                      <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                        <User size={12}/>{req.patient.name}
                        {req.urgency === "URGENT" && (
                          <span className="ms-2 text-xs text-red-500 flex items-center gap-1 font-semibold">
                            <AlertTriangle size={11}/>{L.urgent}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${statusColors[resp.status] || "badge-pending"}`}>
                      {resp.status === "PENDING" ? L.pending : resp.status === "ACCEPTED" ? L.accepted : L.refused}
                    </span>
                    {isOpen ? <ChevronUp size={16} className="text-[var(--text-muted)]"/> : <ChevronDown size={16} className="text-[var(--text-muted)]"/>}
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <Calendar size={14} className="text-primary-500 mt-0.5 shrink-0"/>
                        <div><p className="text-[var(--text-muted)] text-xs">{L.date}</p>
                          <p className="font-medium">{new Date(req.scheduledAt).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ", { day:"2-digit", month:"long", year:"numeric" })}</p></div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-primary-500 mt-0.5 shrink-0"/>
                        <div><p className="text-[var(--text-muted)] text-xs">{L.address}</p>
                          <p className="font-medium">{req.address}</p></div>
                      </div>
                      {req.patient.phone && (
                        <div className="flex items-start gap-2">
                          <User size={14} className="text-primary-500 mt-0.5 shrink-0"/>
                          <div><p className="text-[var(--text-muted)] text-xs">{L.patient}</p>
                            <p className="font-medium">{req.patient.name} — {req.patient.phone}</p></div>
                        </div>
                      )}
                      {req.patient.wilaya && (
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-primary-500 mt-0.5 shrink-0"/>
                          <div><p className="text-[var(--text-muted)] text-xs">Wilaya</p>
                            <p className="font-medium">{req.patient.wilaya}</p></div>
                        </div>
                      )}
                    </div>

                    <div className="bg-[var(--bg-hover)] rounded-xl p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1 flex items-center gap-1"><MessageSquare size={11}/>{L.desc}</p>
                      <p className="text-sm">{req.description}</p>
                    </div>

                    {isPending && (
                      <div className="space-y-2 pt-2">
                        <textarea
                          className="input w-full text-sm" rows={2}
                          placeholder={L.msg}
                          value={replyMsg[req.id] || ""}
                          onChange={(e) => setReplyMsg(p => ({ ...p, [req.id]: e.target.value }))}
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleAction(resp.id, req.id, "REFUSED")} disabled={acting === resp.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors">
                            {acting === resp.id ? <Loader2 size={14} className="animate-spin"/> : <XCircle size={14}/>}
                            {L.refuse}
                          </button>
                          <button onClick={() => handleAction(resp.id, req.id, "ACCEPTED")} disabled={acting === resp.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors">
                            {acting === resp.id ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>}
                            {L.accept}
                          </button>
                        </div>
                      </div>
                    )}

                    {!isPending && resp.message && (
                      <div className="bg-[var(--bg-hover)] rounded-xl p-3">
                        <p className="text-xs text-[var(--text-muted)] mb-1">{lang === "ar" ? "ردك" : "Votre réponse"}</p>
                        <p className="text-sm">{resp.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
