import { useParams, useSearchParams } from "react-router-dom";
import "../../index.css";

export default function InvoicePrint() {
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const isPrint = searchParams.get("print") === "1";

	// Minimal, data-light printable layout. Real data wiring can be added later.
	return (
		<div className="print-container">
			<header className="print-header">
				<h1>Invoice</h1>
				<div className="meta">
					<div>Invoice ID: {id}</div>
					<div>Date: {new Date().toLocaleDateString()}</div>
				</div>
			</header>
			<main className="print-body">
				<section>
					<h2>Bill To</h2>
					<p>Customer Name</p>
					<p>Address Line 1</p>
					<p>City, Country</p>
				</section>

				<section>
					<h2>Items</h2>
					<table className="print-table">
						<thead>
							<tr>
								<th>Description</th>
								<th>Qty</th>
								<th>Unit Price</th>
								<th>Total</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Service A</td>
								<td>1</td>
								<td>$100.00</td>
								<td>$100.00</td>
							</tr>
							<tr>
								<td>Service B</td>
								<td>2</td>
								<td>$50.00</td>
								<td>$100.00</td>
							</tr>
						</tbody>
						<tfoot>
							<tr>
								<td colSpan={3} style={{ textAlign: "right" }}>
									Subtotal
								</td>
								<td>$200.00</td>
							</tr>
							<tr>
								<td colSpan={3} style={{ textAlign: "right" }}>
									Tax
								</td>
								<td>$0.00</td>
							</tr>
							<tr>
								<td colSpan={3} style={{ textAlign: "right", fontWeight: 600 }}>
									Total
								</td>
								<td style={{ fontWeight: 600 }}>$200.00</td>
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


