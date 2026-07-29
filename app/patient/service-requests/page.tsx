"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ClipboardList, Calendar, MapPin, AlertTriangle, CheckCircle2,
  XCircle, Clock, User, ChevronDown, ChevronUp, Loader2, MessageSquare,
} from "lucide-react";

interface Provider { id: string; name: string; avatar?: string; wilaya?: string; }
interface Service { id: string; nameFr: string; nameAr: string; icon: string; category: string; }
interface ServiceResponse { id: string; providerId: string; status: string; message?: string; provider: Provider; }
interface ServiceRequestItem {
  id: string; description: string; address: string; scheduledAt: string;
  urgency: string; status: string; createdAt: string;
  service: Service; responses: ServiceResponse[];
}

const statusBadges: Record<string, { labelFr: string; labelAr: string; cls: string }> = {
  PENDING:  { labelFr: "En attente", labelAr: "قيد الانتظار", cls: "badge-pending" },
  ACCEPTED: { labelFr: "Acceptée",   labelAr: "مقبولة",       cls: "badge-confirmed" },
  REFUSED:  { labelFr: "Refusée",    labelAr: "مرفوضة",       cls: "badge-cancelled" },
};

export default function PatientServiceRequestsPage() {
  const { lang, dir } = useLanguage();
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const L = {
    title:    lang === "ar" ? "طلبات الخدمات" : lang === "en" ? "Service Requests" : "Mes demandes de service",
    subtitle: lang === "ar" ? "متابعة حالة طلباتك والإجابات من المزودين" : lang === "en" ? "Track your request status and provider responses" : "Suivez l'état de vos demandes et les réponses des prestataires",
    empty:    lang === "ar" ? "لم تقم بأي طلب بعد" : lang === "en" ? "No service requests yet" : "Aucune demande de service enregistrée",
    urgent:   lang === "ar" ? "عاجل" : "Urgent",
    date:     lang === "ar" ? "التاريخ المرغوب" : "Date souhaitée",
    address:  lang === "ar" ? "العنوان" : "Adresse",
    desc:     lang === "ar" ? "تفاصيل الطلب" : "Description du besoin",
    resp:     lang === "ar" ? "ردود المزودين المستهدفين" : "Réponses des prestataires qualifiés",
    noResp:   lang === "ar" ? "في انتظار ردود المزودين..." : "En attente de réponse des prestataires...",
    accepted: lang === "ar" ? "مقبول" : "Accepté",
    refused:  lang === "ar" ? "مرفوض" : "Refusé",
    pending:  lang === "ar" ? "قيد الدراسة" : "En cours",
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/service-requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
      <div>
        <h2 className="text-2xl font-extrabold">{L.title}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">{L.subtitle}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-20">
          <ClipboardList size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-30" />
          <p className="font-semibold text-lg">{L.empty}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isOpen = expanded === req.id;
            const badge = statusBadges[req.status] || statusBadges.PENDING;
            return (
              <div key={req.id} className="card transition-all">
                <div
                  className="flex items-center justify-between gap-3 flex-wrap cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : req.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{req.service.icon}</span>
                    <div>
                      <h3 className="font-bold text-base">
                        {lang === "ar" ? req.service.nameAr : req.service.nameFr}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(req.scheduledAt).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {req.urgency === "URGENT" && (
                          <span className="text-red-500 flex items-center gap-1 font-semibold">
                            <AlertTriangle size={11} />
                            {L.urgent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`badge ${badge.cls}`}>
                      {lang === "ar" ? badge.labelAr : badge.labelFr}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown size={16} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-primary-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[var(--text-muted)] text-xs">{L.address}</p>
                          <p className="font-medium">{req.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MessageSquare size={14} className="text-primary-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[var(--text-muted)] text-xs">{L.desc}</p>
                          <p className="font-medium">{req.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Providers Responses Section */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                        {L.resp} ({req.responses.length})
                      </h4>
                      {req.responses.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] italic">{L.noResp}</p>
                      ) : (
                        <div className="space-y-2">
                          {req.responses.map((resp) => (
                            <div
                              key={resp.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-hover)] gap-3 flex-wrap"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-600 flex items-center justify-center font-bold text-xs">
                                  {resp.provider.name[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{resp.provider.name}</p>
                                  {resp.provider.wilaya && (
                                    <p className="text-xs text-[var(--text-muted)]">{resp.provider.wilaya}</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {resp.status === "ACCEPTED" && (
                                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                    <CheckCircle2 size={12} /> {L.accepted}
                                  </span>
                                )}
                                {resp.status === "REFUSED" && (
                                  <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                                    <XCircle size={12} /> {L.refused}
                                  </span>
                                )}
                                {resp.status === "PENDING" && (
                                  <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                    <Clock size={12} /> {L.pending}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
