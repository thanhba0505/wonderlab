'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowBigUp,
  FlaskConical,
  ExternalLink,
  Sparkles,
  Sliders,
  MessageSquare,
  User,
} from 'lucide-react';
import { AppButton } from '@/components/ui';
import { cn } from '@/lib/utils';
import { SimulationRequestItem } from '@/lib/simulation-requests-api';
import { RequestStatusBadge } from './request-status-badge';
import { useTranslation } from '@/i18n';

interface RequestCardProps {
  request: SimulationRequestItem;
  onToggleVote: (id: string) => Promise<void>;
  isVoting?: boolean;
}

export function RequestCard({ request, onToggleVote, isVoting = false }: RequestCardProps) {
  const { locale, dict } = useTranslation();
  const [localVoted, setLocalVoted] = React.useState(request.hasVoted);
  const [localVoteCount, setLocalVoteCount] = React.useState(request.voteCount);

  // Sync with prop changes if refreshed
  React.useEffect(() => {
    setLocalVoted(request.hasVoted);
    setLocalVoteCount(request.voteCount);
  }, [request.hasVoted, request.voteCount]);

  const handleVoteClick = async () => {
    if (isVoting) return;

    // Optimistic UI update
    const nextVoted = !localVoted;
    setLocalVoted(nextVoted);
    setLocalVoteCount(prev => (nextVoted ? prev + 1 : Math.max(0, prev - 1)));

    await onToggleVote(request.id);
  };

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(request.createdAt);
      return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  }, [request.createdAt, locale]);

  const isCompleted = request.status === 'COMPLETED';

  return (
    <article className="lab-card lab-card-hover flex flex-col justify-between rounded-xl p-5 sm:p-6 transition-all duration-200">
      <div>
        {/* Header: Category & Status */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
            {request.category}
          </span>
          <RequestStatusBadge status={request.status} />
        </div>

        {/* Title */}
        <h3 className="font-heading mt-3 text-lg font-bold text-slate-900 leading-snug">
          {request.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-700 leading-relaxed line-clamp-4">
          {request.description}
        </p>

        {/* Why interesting / Intuition hook */}
        {request.whyInteresting && (
          <div className="mt-3 rounded-lg border-l-4 border-l-blue-500 bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-blue-900 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>{dict.requests.intuition_hook_title}</span>
            </div>
            <p className="text-slate-600 line-clamp-3">{request.whyInteresting}</p>
          </div>
        )}

        {/* Proposed Controls (Optional) */}
        {request.proposedControls && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
            <Sliders className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              <strong className="text-slate-700 font-medium">
                {dict.requests.proposed_interaction}
              </strong>{' '}
              {request.proposedControls}
            </span>
          </div>
        )}

        {/* Reference URL (Optional) */}
        {request.referenceUrl && (
          <div className="mt-2">
            <a
              href={request.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{dict.requests.reference_literature}</span>
            </a>
          </div>
        )}

        {/* Admin Editorial Feedback */}
        {request.adminNotes && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1">
              <MessageSquare className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span>{dict.requests.editorial_feedback}</span>
            </div>
            <p className="text-amber-800/90">{request.adminNotes}</p>
          </div>
        )}
      </div>

      {/* Footer: Author, Link to completed lab, and Upvote Button */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Author info */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <User className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-medium text-slate-800">{request.author.name}</span>
            <span className="mx-1.5 text-slate-300">•</span>
            <span className="font-mono">{formattedDate}</span>
          </div>
        </div>

        {/* Actions right: Completed link + Vote button */}
        <div className="flex items-center gap-2">
          {isCompleted && request.targetSlug && (
            <Link href={`/simulations/${request.targetSlug}`}>
              <AppButton
                size="sm"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
                <span>{dict.requests.launch_simulation}</span>
              </AppButton>
            </Link>
          )}

          <button
            type="button"
            onClick={handleVoteClick}
            disabled={isVoting}
            className={cn(
              'group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer select-none active:scale-[0.98]',
              localVoted
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-2xs'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs',
            )}
            title={localVoted ? dict.requests.remove_upvote_tooltip : dict.requests.upvote_tooltip}
            aria-pressed={localVoted}
          >
            <ArrowBigUp
              className={cn(
                'h-4 w-4 transition-transform duration-150 group-hover:-translate-y-0.5',
                localVoted ? 'fill-blue-600 text-blue-600' : 'text-slate-400',
              )}
            />
            <span className="font-mono tabular-nums text-xs font-bold">{localVoteCount}</span>
            <span className="text-slate-500 font-normal">
              {localVoted ? dict.requests.voted_btn : dict.requests.vote_btn}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
