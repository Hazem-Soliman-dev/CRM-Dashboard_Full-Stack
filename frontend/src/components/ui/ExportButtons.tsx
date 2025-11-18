import { useState } from "react";
import { exportPdf, exportExcel, exportCsv } from "../../services/exportService";

type ExportButtonsProps = {
	context: "invoice" | "report" | "table";
	id?: string; // required for invoice/report
	rows?: Array<Record<string, any>>; // required for table excel/csv
	filenameBase?: string;
	className?: string;
};

export function ExportButtons(props: ExportButtonsProps) {
	const { context, id, rows = [], filenameBase = "export", className } = props;
	const [loading, setLoading] = useState<string | null>(null);

	const handlePdf = async () => {
		if (context === "invoice" || context === "report") {
			if (!id) return;
			try {
				setLoading("pdf");
				await exportPdf({ type: context, id });
			} finally {
				setLoading(null);
			}
		}
	};

	const handleExcel = async () => {
		try {
			setLoading("excel");
			await exportExcel({
				rows,
				filename: `${filenameBase}-${new Date().toISOString().slice(0, 10)}.xlsx`,
				sheetName: "Data",
			});
		} finally {
			setLoading(null);
		}
	};

	const handleCsv = async () => {
		try {
			setLoading("csv");
			await exportCsv({
				rows,
				filename: `${filenameBase}-${new Date().toISOString().slice(0, 10)}.csv`,
			});
		} finally {
			setLoading(null);
		}
	};

	return (
		<div className={className}>
			{(context === "invoice" || context === "report") && (
				<button
					onClick={handlePdf}
					disabled={loading === "pdf" || !id}
					className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded mr-2 disabled:opacity-50"
				>
					{loading === "pdf" ? "Generating..." : "Export PDF"}
				</button>
			)}
			{context === "table" && (
				<>
					<button
						onClick={handleExcel}
						disabled={loading === "excel" || rows.length === 0}
						className="inline-flex items-center px-3 py-2 text-sm bg-emerald-600 text-white rounded mr-2 disabled:opacity-50"
					>
						{loading === "excel" ? "Exporting..." : "Export Excel"}
					</button>
					<button
						onClick={handleCsv}
						disabled={loading === "csv" || rows.length === 0}
						className="inline-flex items-center px-3 py-2 text-sm bg-gray-700 text-white rounded disabled:opacity-50"
					>
						{loading === "csv" ? "Exporting..." : "Export CSV"}
					</button>
				</>
			)}
		</div>
	);
}


