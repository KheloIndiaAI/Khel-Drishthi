import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  formatINR,
  formatINRFull,
  summariseFunds,
  summariseManpower,
  type KisceFund,
  type KisceManpower,
} from '@/hooks/useKisce';

const EmptyNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-muted-foreground rounded-md border border-dashed p-3">{children}</p>
);

export const KisceFundsBody: React.FC<{ rows: KisceFund[] }> = ({ rows }) => {
  if (rows.length === 0) return <EmptyNote>No KISCE fund releases recorded.</EmptyNote>;
  const { total, pending, count, sorted } = summariseFunds(rows);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border p-3">
        <p className="text-2xl font-bold tabular-nums">{formatINR(total)}</p>
        <p className="text-[11px] text-muted-foreground tabular-nums">
          {formatINRFull(total)} across {count} release{count === 1 ? '' : 's'}
        </p>
      </div>
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
        {sorted.map((r, i) => (
          <div
            key={`${r.facility_id}-${r.financial_year}-${i}`}
            className="flex items-center gap-2 rounded-md border p-2"
          >
            <span className="text-xs font-medium tabular-nums w-16 shrink-0">
              {r.financial_year}
            </span>
            <span className="text-[11px] text-muted-foreground flex-1 truncate">
              {r.head || '—'}
            </span>
            {r.uc_pending && (
              <span
                className="h-2 w-2 rounded-full bg-amber-500 shrink-0"
                title="UC pending"
                aria-label="UC pending"
              />
            )}
            <span className="text-xs font-semibold tabular-nums shrink-0">
              {formatINR(r.funds_released || 0)}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        UC pending on <span className="font-medium text-foreground">{pending}</span> of {count}{' '}
        release{count === 1 ? '' : 's'}
      </p>
    </div>
  );
};

export const KisceStaffingBody: React.FC<{ rows: KisceManpower[] }> = ({ rows }) => {
  if (rows.length === 0) return <EmptyNote>No KISCE staffing data recorded.</EmptyNote>;
  const { sanctioned, inPost, fillRate, categories } = summariseManpower(rows);

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-lg font-bold tabular-nums">
            {inPost} <span className="text-sm font-normal text-muted-foreground">in post</span>
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            / {sanctioned} sanctioned
          </span>
        </div>
        <Progress value={fillRate} className="h-2" />
        <p className="text-[11px] text-muted-foreground text-right mt-1 tabular-nums">
          {fillRate.toFixed(1)}% fill rate
        </p>
      </div>
      <div className="space-y-1.5">
        {categories.map((c) => (
          <div key={c.name} className="flex items-center justify-between rounded-md border p-2">
            <span className="text-xs truncate pr-2">{c.name}</span>
            <span
              className={cn(
                'text-xs font-semibold tabular-nums shrink-0',
                c.vacancy > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-muted-foreground'
              )}
            >
              {c.vacancy} vacant
              <span className="font-normal text-muted-foreground"> ({c.inPost}/{c.sanctioned})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
