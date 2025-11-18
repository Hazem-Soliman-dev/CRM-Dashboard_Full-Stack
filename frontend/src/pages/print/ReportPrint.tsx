import { useParams, useSearchParams } from "react-router-dom";
import "../../index.css";

export default function ReportPrint() {
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const isPrint = searchParams.get("print") === "1";

	return (
		<div className="print-container">
			<header className="print-header">
				<h1>Report</h1>
				<div className="meta">
					<div>Report ID: {id}</div>
					<div>Generated: {new Date().toLocaleString()}</div>
				</div>
			</header>
			<main className="print-body">
				<section>
					<h2>Summary</h2>
					<p>Summary information will appear here.</p>
				</section>
				<section>
					<h2>Details</h2>
					<table className="print-table">
						<thead>
							<tr>
								<th>Field</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Metric A</td>
								<td>123</td>
							</tr>
							<tr>
								<td>Metric B</td>
								<td>456</td>
							</tr>
						</tbody>
						<tfoot>
							<tr>
								<td colSpan={2}>End of report</td>
							</tr>
						</tfoot>
					</table>
				</section>
			</main>
			{!isPrint && (
				<footer className="no-print">
					<p>This is a print-friendly view. To generate a PDF, use the Export action.</p>
				</footer>
			)}
		</div>
	);
}


