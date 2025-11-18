import api from "./api";

function triggerBrowserDownload(data: Blob, filename: string) {
	const url = window.URL.createObjectURL(data);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	window.URL.revokeObjectURL(url);
}

export async function exportPdf(params: { type: "invoice" | "report"; id: string }) {
	const { type, id } = params;
	const response = await api.get(`/export/pdf`, {
		params: { type, id },
		responseType: "blob",
	});
	const filename =
		response.headers["content-disposition"]
			?.split("filename=")[1]
			?.replace(/"/g, "") || `${type}-${id}.pdf`;
	triggerBrowserDownload(new Blob([response.data], { type: "application/pdf" }), filename);
}

export async function exportExcel(payload: {
	rows: Array<Record<string, any>>;
	filename?: string;
	sheetName?: string;
}) {
	const response = await api.post(`/export/excel`, payload, {
		responseType: "blob",
	});
	const filename =
		payload.filename ||
		response.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
		"export.xlsx";
	triggerBrowserDownload(
		new Blob([response.data], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		}),
		filename
	);
}

export async function exportCsv(payload: {
	rows: Array<Record<string, any>>;
	filename?: string;
}) {
	const response = await api.post(`/export/csv`, payload, {
		responseType: "blob",
	});
	const filename =
		payload.filename ||
		response.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
		"export.csv";
	triggerBrowserDownload(new Blob([response.data], { type: "text/csv;charset=utf-8" }), filename);
}

// Reports-specific helpers (server-side datasets by report id)
export async function exportReportPdf(reportId: string, filters?: Record<string, any>) {
	const params: Record<string, any> = {};
	if (filters) {
		Object.assign(params, filters);
	}
	const response = await api.get(`/reports/${encodeURIComponent(reportId)}/export/pdf`, {
		params,
		responseType: "blob",
	});
	const filename =
		response.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
		`report-${reportId}.pdf`;
	triggerBrowserDownload(new Blob([response.data], { type: "application/pdf" }), filename);
}

export async function exportReportExcel(reportId: string, filters: Record<string, any>, options?: Record<string, any>) {
	const response = await api.post(
		`/reports/${encodeURIComponent(reportId)}/export/excel`,
		{ filters, options },
		{ responseType: "blob" }
	);
	const filename =
		response.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
		`report-${reportId}.xlsx`;
	triggerBrowserDownload(
		new Blob([response.data], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		}),
		filename
	);
}

export async function exportReportCsv(reportId: string, filters: Record<string, any>, options?: Record<string, any>) {
	const response = await api.post(
		`/reports/${encodeURIComponent(reportId)}/export/csv`,
		{ filters, options },
		{ responseType: "blob" }
	);
	const filename =
		response.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
		`report-${reportId}.csv`;
	triggerBrowserDownload(
		new Blob([response.data], { type: "text/csv;charset=utf-8" }),
		filename
	);
}

// Accounting export functions
export async function exportAccountingExcel(
	filters: Record<string, any>,
	options?: Record<string, any>
) {
	const response = await api.post(
		`/accounting/export/excel`,
		{ filters, options },
		{ responseType: "blob" }
	);
	const filename =
		response.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
		`accounting-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
	triggerBrowserDownload(
		new Blob([response.data], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		}),
		filename
	);
}

export async function exportAccountingPdf(
	filters: Record<string, any>,
	options?: Record<string, any>
) {
	const response = await api.post(
		`/accounting/export/pdf`,
		{ filters, options },
		{ responseType: "blob" }
	);
	const filename =
		response.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
		`accounting-export-${new Date().toISOString().slice(0, 10)}.pdf`;
	triggerBrowserDownload(
		new Blob([response.data], { type: "application/pdf" }),
		filename
	);
}

export async function exportAccountingCsv(
	filters: Record<string, any>,
	options?: Record<string, any>
) {
	const response = await api.post(
		`/accounting/export/csv`,
		{ filters, options },
		{ responseType: "blob" }
	);
	const filename =
		response.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
		`accounting-export-${new Date().toISOString().slice(0, 10)}.csv`;
	triggerBrowserDownload(
		new Blob([response.data], { type: "text/csv;charset=utf-8" }),
		filename
	);
}

// Financial report export (for FinancialReportsModal)
export async function exportFinancialReport(
	reportType: string,
	filters: Record<string, any>,
	format: 'excel' | 'pdf' | 'csv' = 'excel'
) {
	const exportFilters = {
		...filters,
		reportType
	};

	switch (format) {
		case 'excel':
			return exportAccountingExcel(exportFilters);
		case 'pdf':
			return exportAccountingPdf(exportFilters);
		case 'csv':
			return exportAccountingCsv(exportFilters);
		default:
			return exportAccountingExcel(exportFilters);
	}
}


