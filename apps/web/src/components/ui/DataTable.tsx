import { formatNumber } from '@/lib/format';
import { EmptyState } from './Feedback';

export interface DataRow {
	key: string;
	primary: string;
	secondary?: string;
	value: number;
}

export function DataTable({
	columns,
	rows,
	empty,
}: {
	columns: [string, string];
	rows: DataRow[];
	empty: { title: string; hint?: string };
}) {
	if (rows.length === 0) return <EmptyState {...empty} />;
	const max = Math.max(...rows.map((r) => r.value), 1);

	return (
		<div className="overflow-x-auto">
			<table className="mt-3 w-full text-left text-sm">
				<thead className="text-muted">
					<tr className="border-b border-line">
						<th scope="col" className="px-5 pb-2 font-medium">
							{columns[0]}
						</th>
						<th scope="col" className="px-5 pb-2 text-right font-medium">
							{columns[1]}
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-line">
					{rows.map((r) => (
						<tr key={r.key}>
							<td className="w-full px-5 py-3">
								<p className="font-medium">{r.primary}</p>
								{r.secondary && (
									<p className="mt-0.5 break-all text-xs text-muted">
										{r.secondary}
									</p>
								)}
								<div
									className="mt-2 h-1 rounded-full bg-canvas"
									aria-hidden="true"
								>
									<div
										className="h-1 rounded-full bg-pine"
										style={{ width: `${(r.value / max) * 100}%` }}
									/>
								</div>
							</td>
							<td className="px-5 py-3 text-right align-top font-semibold tabular-nums">
								{formatNumber(r.value)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
