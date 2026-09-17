import React from "react";
import { AuditLog } from "@/types";
import { Clock, CheckCircle2, User, Cpu, ShieldAlert, AlertCircle } from "lucide-react";

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
          color: "bg-orange-950/70 text-brand-peach border-brand-orange/40",
        };
      case "SYSTEM_FRAUD_ENGINE":
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
          label: "Fraud Engine",
          color: "bg-rose-950 text-rose-300 border-rose-800",
        };
      case "SYSTEM_OCR":
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-sky-400" />,
          label: "OCR Service",
          color: "bg-sky-950 text-sky-300 border-sky-800",
        };
      case "EMPLOYEE":
      default:
        return {
          icon: <User className="w-3.5 h-3.5 text-slate-300" />,
          label: "Employee Submission",
          color: "bg-slate-800 text-slate-300 border-slate-700",
        };
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-5 border-2 border-slate-800 shadow-[2px_2px_0px_0px_#0F172A] text-white">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
        <Clock className="w-4 h-4 text-brand-orange" />
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
          Immutable Audit Trail ({logs.length} events)
        </h3>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
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
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-orange ring-4 ring-slate-900" />

              <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.color}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                    <span className="font-semibold text-slate-200">
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {date} {time}
                  </span>
                </div>

                {log.details && (
                  <div className="text-[11px] text-slate-400 mt-1 space-y-0.5 font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    {Object.entries(log.details).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 truncate">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-slate-300 font-semibold truncate">
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
