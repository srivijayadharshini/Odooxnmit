import React, { useState } from "react";
import { FileText, Download, Eye, Upload, File, FileCheck, FileBadge, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, Button, Badge, PageHeader, EmptyState } from "@/components/ui";

interface Document {
  id: number;
  name: string;
  document_type: string;
  file_url: string;
  uploaded_at: string;
  size: string;
  status: "verified" | "pending" | "expired";
}

const EMPLOYEE_DOCUMENTS: Document[] = [
  { id: 1, name: "Offer Letter.pdf", document_type: "Offer Letter", file_url: "#", uploaded_at: "2022-03-01", size: "248 KB", status: "verified" },
  { id: 2, name: "Employment Contract.pdf", document_type: "Contract", file_url: "#", uploaded_at: "2022-03-01", size: "1.2 MB", status: "verified" },
  { id: 3, name: "NDA Agreement.pdf", document_type: "Legal", file_url: "#", uploaded_at: "2022-03-02", size: "324 KB", status: "verified" },
  { id: 4, name: "Payslip_Aug_2026.pdf", document_type: "Payslip", file_url: "#", uploaded_at: "2026-08-01", size: "156 KB", status: "verified" },
  { id: 5, name: "Payslip_Jul_2026.pdf", document_type: "Payslip", file_url: "#", uploaded_at: "2026-07-01", size: "152 KB", status: "verified" },
  { id: 6, name: "Payslip_Jun_2026.pdf", document_type: "Payslip", file_url: "#", uploaded_at: "2026-06-01", size: "148 KB", status: "verified" },
  { id: 7, name: "Performance Review Q1 2026.pdf", document_type: "Review", file_url: "#", uploaded_at: "2026-04-15", size: "512 KB", status: "verified" },
  { id: 8, name: "Leave Policy 2026.pdf", document_type: "Policy", file_url: "#", uploaded_at: "2026-01-10", size: "89 KB", status: "verified" },
  { id: 9, name: "Health Insurance Card.pdf", document_type: "Benefits", file_url: "#", uploaded_at: "2022-04-01", size: "205 KB", status: "pending" },
  { id: 10, name: "Training Certificate - AWS.pdf", document_type: "Certificate", file_url: "#", uploaded_at: "2025-11-20", size: "430 KB", status: "verified" },
];

const DOC_ICONS: Record<string, React.ReactNode> = {
  Payslip: <FileText size={20} className="text-indigo-600" />,
  Contract: <FileCheck size={20} className="text-emerald-600" />,
  "Offer Letter": <FileBadge size={20} className="text-blue-600" />,
  Legal: <Lock size={20} className="text-amber-600" />,
  Certificate: <FileCheck size={20} className="text-violet-600" />,
  Review: <File size={20} className="text-slate-600" />,
  Policy: <FileText size={20} className="text-slate-500" />,
  Benefits: <File size={20} className="text-pink-500" />,
};

const TYPE_COLORS: Record<string, string> = {
  Payslip: "bg-indigo-50",
  Contract: "bg-emerald-50",
  "Offer Letter": "bg-blue-50",
  Legal: "bg-amber-50",
  Certificate: "bg-violet-50",
  Review: "bg-slate-50",
  Policy: "bg-slate-50",
  Benefits: "bg-pink-50",
};

const STATUS_BADGE: Record<Document["status"], { label: string; variant: "success" | "warning" | "danger" }> = {
  verified: { label: "Verified", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  expired: { label: "Expired", variant: "danger" },
};

export default function Documents() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const docTypes = ["all", ...Array.from(new Set(EMPLOYEE_DOCUMENTS.map((d) => d.document_type)))];

  const filtered = EMPLOYEE_DOCUMENTS.filter((d) => {
    const matchType = filter === "all" || d.document_type === filter;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.document_type.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleDownload = (doc: Document) => {
    // Simulated download action
    const el = document.createElement("a");
    el.href = "data:application/pdf;base64,JVBERi0xLjQ=";
    el.download = doc.name;
    el.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        subtitle="Your employment records, payslips, and certificates"
        action={
          <Button size="sm" variant="secondary" icon={<Upload size={14} />}>
            Upload Document
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: EMPLOYEE_DOCUMENTS.length, color: "bg-indigo-50 text-indigo-600", icon: <FileText size={18} /> },
          { label: "Verified", value: EMPLOYEE_DOCUMENTS.filter((d) => d.status === "verified").length, color: "bg-emerald-50 text-emerald-600", icon: <FileCheck size={18} /> },
          { label: "Pending Review", value: EMPLOYEE_DOCUMENTS.filter((d) => d.status === "pending").length, color: "bg-amber-50 text-amber-600", icon: <File size={18} /> },
          { label: "Payslips", value: EMPLOYEE_DOCUMENTS.filter((d) => d.document_type === "Payslip").length, color: "bg-blue-50 text-blue-600", icon: <FileText size={18} /> },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
          {docTypes.slice(0, 6).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={<FileText size={36} />} title="No documents found" description="Try adjusting your filter or search." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const status = STATUS_BADGE[doc.status];
            return (
              <Card key={doc.id} className="p-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${TYPE_COLORS[doc.document_type] || "bg-slate-50"}`}>
                    {DOC_ICONS[doc.document_type] || <File size={20} className="text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{doc.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.document_type} · {doc.size}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Uploaded {doc.uploaded_at}</p>
                    <div className="mt-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Download size={13} /> Download
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <Eye size={13} /> Preview
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <Lock size={16} className="text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-700">
          Your documents are encrypted and stored securely. Only you and authorized HR personnel can access them.
          Contact HR to request additional documents or updates.
        </p>
      </div>
    </div>
  );
}
