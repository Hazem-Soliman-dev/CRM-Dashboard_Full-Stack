import React from "react";
import { Button } from "./Button";

type PaginationProps = {
  page: number;
  pageCount: number;
  total?: number;
  perPage?: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  compact?: boolean;
};

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageCount,
  total,
  perPage,
  loading = false,
  onPageChange,
  compact = true,
}) => {
  if (pageCount <= 1) return null;

  const goTo = (p: number) => {
    if (loading) return;
    const next = Math.min(Math.max(1, p), pageCount);
    if (next !== page) onPageChange(next);
  };

  // Determine a compact set of page numbers to display
  const pages: (number | string)[] = [];
  const add = (v: number | string) => pages.push(v);
  const maxButtons = compact ? 5 : 9;
  const side = Math.floor((maxButtons - 1) / 2);
  let start = Math.max(1, page - side);
  let end = Math.min(pageCount, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  if (start > 1) {
    add(1);
    if (start > 2) add("…");
  }
  for (let i = start; i <= end; i++) add(i);
  if (end < pageCount) {
    if (end < pageCount - 1) add("…");
    add(pageCount);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {typeof total === "number" && typeof perPage === "number" ? (
          <span>
            {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)}{" "}
            of {total}
          </span>
        ) : (
          <span>
            Page {page} of {pageCount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          disabled={loading || page <= 1}
          onClick={() => goTo(page - 1)}
        >
          Prev
        </Button>
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              onClick={() => goTo(p)}
              disabled={loading}
              className={`px-3 py-1 rounded text-sm ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ) : (
            <span
              key={idx}
              className="px-2 text-gray-500 dark:text-gray-400 select-none"
            >
              {p}
            </span>
          )
        )}
        <Button
          variant="outline"
          disabled={loading || page >= pageCount}
          onClick={() => goTo(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
