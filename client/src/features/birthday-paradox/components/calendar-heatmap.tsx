'use client';

import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { PersonInRoom, SharedDateInfo } from '../birthday-math';

interface CalendarHeatmapProps {
  people: PersonInRoom[];
  sharedDates: SharedDateInfo[];
  selectedPersonId: number | null;
  onSelectPerson: (id: number | null) => void;
}

const MONTH_NAMES = [
  'Th01',
  'Th02',
  'Th03',
  'Th04',
  'Th05',
  'Th06',
  'Th07',
  'Th08',
  'Th09',
  'Th10',
  'Th11',
  'Th12',
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  people,
  sharedDates,
  selectedPersonId,
  onSelectPerson,
}) => {
  // Map lưu danh sách người sinh theo từng tháng và ngày
  const dateOccupancy = useMemo(() => {
    const map = new Map<string, PersonInRoom[]>();
    for (const p of people) {
      const key = `${p.month}-${p.day}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(p);
    }
    return map;
  }, [people]);

  return (
    <div className="flex flex-col gap-3">
      {/* Title duy nhất, không kẻ line ngay dưới title */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
            Phân bổ Ngày sinh trên Lịch 365 Ngày
          </h4>
        </div>
        <span className="font-mono text-xs text-slate-500">
          {sharedDates.length > 0 ? (
            <span className="font-semibold text-amber-600">
              {sharedDates.length} ngày có trùng sinh
            </span>
          ) : (
            <span className="text-slate-400">Không có ngày trùng</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {MONTH_NAMES.map((monthName, mIndex) => {
          const monthNumber = mIndex + 1;
          const daysCount = DAYS_IN_MONTH[mIndex];

          return (
            <div key={monthName} className="rounded-md border border-slate-200 bg-slate-50/50 p-2">
              <div className="mb-1 text-center font-mono text-xs font-bold text-slate-700">
                {monthName}
              </div>

              {/* Lưới các ngày trong tháng */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: daysCount }).map((_, dIndex) => {
                  const dayNumber = dIndex + 1;
                  const key = `${monthNumber}-${dayNumber}`;
                  const occupants = dateOccupancy.get(key) || [];
                  const count = occupants.length;
                  const hasSelected = occupants.some(p => p.id === selectedPersonId);

                  let cellClass =
                    'h-4 w-4 rounded-[2px] flex items-center justify-center text-xs leading-none transition-all cursor-pointer';

                  if (count > 1) {
                    // Trùng sinh: Nổi bật với màu hổ phách (Amber)
                    cellClass +=
                      ' bg-amber-500 text-white font-bold ring-1 ring-amber-600 hover:scale-125';
                  } else if (count === 1) {
                    // Có 1 người: Màu xanh dương nhẹ
                    cellClass +=
                      ' bg-blue-100 text-blue-900 border border-blue-300 font-semibold hover:scale-110';
                  } else {
                    // Không có ai
                    cellClass += ' bg-slate-200/60 hover:bg-slate-300/80';
                  }

                  if (hasSelected) {
                    cellClass += ' ring-2 ring-blue-600 ring-offset-1';
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      title={
                        count > 0
                          ? `${dayNumber} ${monthName}: ${occupants.map(o => `#${o.id}`).join(', ')}`
                          : `${dayNumber} ${monthName}`
                      }
                      onClick={() => {
                        if (occupants.length > 0) {
                          onSelectPerson(
                            occupants[0].id === selectedPersonId ? null : occupants[0].id,
                          );
                        }
                      }}
                      className={cellClass}
                    >
                      {count > 0 ? count : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chú giải ý nghĩa màu sắc */}
      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[2px] bg-slate-200/60" />
          <span>0 người</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[2px] border border-blue-300 bg-blue-100 text-xs font-semibold text-blue-900 flex items-center justify-center leading-none">
            1
          </span>
          <span>1 người</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[2px] bg-amber-500 text-xs font-bold text-white flex items-center justify-center leading-none">
            2+
          </span>
          <span className="font-semibold text-amber-700">Trùng sinh (Va chạm xác suất)</span>
        </span>
      </div>
    </div>
  );
};
