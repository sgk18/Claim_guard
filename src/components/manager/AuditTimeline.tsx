import React from "react";
import { AuditLog } from "@/types";
import { Clock, User, Cpu, ShieldAlert } from "lucide-react";

interface Props {
  logs: AuditLog[];
}

export const AuditTimeline: React.FC<Props> = ({ logs }) => {
  const getActorBadge = (actorType: string) => {
    switch (actorType) {
      case "MANAGER":
        return {
          icon: <User className="w-3.5 h-3.5 text-brand-orange" />,
          label: "Manager Decision",
          color: "bg-orange-50 text-orange-800 border-orange-200",
        };
      case "SYSTEM_FRAUD_ENGINE":
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />,
          label: "Fraud Engine",
          color: "bg-rose-50 text-rose-800 border-rose-200",
        };
      case "SYSTEM_OCR":
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-sky-600" />,
          label: "OCR Service",
          color: "bg-sky-50 text-sky-800 border-sky-200",
        };
      case "EMPLOYEE":
      default:
        return {
          icon: <User className="w-3.5 h-3.5 text-slate-600" />,
          label: "Employee Submission",
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm text-slate-900">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
        <Clock className="w-4 h-4 text-brand-orange" />
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
          Immutable Audit Trail ({logs.length} events)
        </h3>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {logs.map((log) => {
          const badge = getActorBadge(log.actorType);
          const time = new Date(log.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          const date = new Date(log.createdAt).toISOString().split("T")[0];

          return (
            <div key={log.id} className="relative text-xs">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-orange ring-4 ring-white shadow-2xs" />

              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="font-bold text-slate-900">
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-medium">
                    {date} {time}
                  </span>
                </div>

                {log.details && (
                  <div className="text-[11px] text-slate-600 mt-1.5 space-y-0.5 font-mono bg-white p-2.5 rounded-lg border border-slate-200">
                    {Object.entries(log.details).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 truncate">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-slate-800 font-semibold truncate">
                          {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
