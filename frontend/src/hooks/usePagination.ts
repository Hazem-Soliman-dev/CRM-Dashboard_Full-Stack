import { useCallback, useEffect, useMemo, useState } from "react";

export type UsePaginationOptions = {
  perPage: number;
  total?: number;
  initialPage?: number;
  onPageChange?: (page: number, offset: number) => void;
};

export function usePagination(options: UsePaginationOptions) {
  const { perPage, total = 0, initialPage = 1, onPageChange } = options;
  const [page, setPage] = useState<number>(initialPage);
  const offset = useMemo(() => (page - 1) * perPage, [page, perPage]);
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / perPage)),
    [total, perPage]
  );

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const goTo = useCallback(
    (p: number) => {
      const next = Math.min(Math.max(1, p), pageCount);
      setPage(next);
      onPageChange?.(next, (next - 1) * perPage);
    },
    [pageCount, perPage, onPageChange]
  );

  const next = useCallback(() => goTo(page + 1), [goTo, page]);
  const prev = useCallback(() => goTo(page - 1), [goTo, page]);
  const reset = useCallback(() => goTo(1), [goTo]);

  return {
    page,
    perPage,
    total,
    offset,
    pageCount,
    setPage: goTo,
    next,
    prev,
    reset,
  };
}
