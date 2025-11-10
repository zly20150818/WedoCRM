export type ProjectStage = {
  value: string
  label: string
  label_cn: string
}

export const PROJECT_STAGES: ProjectStage[] = [
  { value: "InquiryQuotation", label: "Inquiry & Quotation", label_cn: "询价与报价阶段" },
  { value: "SampleConfirmation", label: "Sample Confirmation", label_cn: "样品确认阶段" },
  { value: "ContractSigning", label: "Contract Signing", label_cn: "合同签署阶段" },
  { value: "PreProductionSample", label: "Pre-production Sample", label_cn: "大货样品阶段" },
  { value: "PlanningProcurement", label: "Project Planning & Procurement", label_cn: "项目规划与采购阶段" },
  { value: "MassProduction", label: "Mass Production", label_cn: "大货生产阶段" },
  { value: "ExportLogistics", label: "Export Logistics", label_cn: "出口物流阶段" },
  { value: "ProjectClosing", label: "Project Closing", label_cn: "项目收尾阶段" },
]

export const PROJECT_STATUSES = ["On Track", "At Risk", "On Hold", "Overdue"] as const

export function getStagePercent(stageValue?: string | null): number {
  if (!stageValue) return 0
  const idx = PROJECT_STAGES.findIndex((s) => s.value === stageValue)
  if (idx < 0) return 0
  return Math.round(((idx + 1) / PROJECT_STAGES.length) * 100)
}


