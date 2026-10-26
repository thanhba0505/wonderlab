'use client';

import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { PersonInRoom, SharedDateInfo } from '../birthday-math';
import { useTranslation } from '@/i18n';

interface CalendarHeatmapProps {
  people: PersonInRoom[];
  sharedDates: SharedDateInfo[];
  selectedPersonId: number | null;
  onSelectPerson: (id: number | null) => void;
}

const MONTH_NAMES_VI = [
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

const MONTH_NAMES_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  people,
  sharedDates,
  selectedPersonId,
  onSelectPerson,
}) => {
  const { locale } = useTranslation();
  const isEn = locale === 'en';
  const monthNames = isEn ? MONTH_NAMES_EN : MONTH_NAMES_VI;

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
      {/* Title duy nhất */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-heading">
            {isEn
              ? 'Birthday Distribution (365-Day Calendar)'
              : 'Phân bổ Ngày sinh trên Lịch 365 Ngày'}
          </h4>
        </div>
        <span className="font-mono text-xs text-slate-500">
          {sharedDates.length > 0 ? (
            <span className="font-semibold text-amber-600">
              {sharedDates.length}{' '}
              {isEn
                ? sharedDates.length === 1
                  ? 'shared date'
                  : 'shared dates'
                : 'ngày có trùng sinh'}
            </span>
          ) : (
            <span className="text-slate-400">
              {isEn ? 'No shared dates' : 'Không có ngày trùng'}
            </span>
          )}
        </span>
      </div>

      {/* Grid 12 tháng */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {monthNames.map((monthName, mIdx) => {
          const monthNum = mIdx + 1;
          const daysCount = DAYS_IN_MONTH[mIdx] ?? 31;

          return (
            <div key={monthName} className="rounded-md border border-slate-200 bg-slate-50/50 p-2">
              <div className="mb-1 text-center font-mono text-xs font-bold text-slate-700">
                {monthName}
              </div>

              {/* Grid các ô ngày nhỏ gọn */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: daysCount }).map((_, dIdx) => {
                  const dayNum = dIdx + 1;
                  const key = `${monthNum}-${dayNum}`;
                  const peopleOnThisDay = dateOccupancy.get(key) || [];
                  const count = peopleOnThisDay.length;
                  const isCollision = count > 1;
                  const isSelected =
                    selectedPersonId !== null &&
                    peopleOnThisDay.some(p => p.id === selectedPersonId);

                  let cellStyle =
                    'h-4 w-4 rounded-[2px] flex items-center justify-center text-xs leading-none transition-all cursor-pointer';

                  if (isCollision) {
                    cellStyle +=
                      ' bg-amber-500 text-white font-bold ring-1 ring-amber-600 hover:bg-amber-600';
                  } else if (count === 1) {
                    cellStyle +=
                      ' bg-blue-100 text-blue-900 font-semibold border border-blue-300 hover:bg-blue-200';
                  } else {
                    cellStyle += ' bg-slate-200/60 hover:bg-slate-300/80';
                  }

                  if (isSelected) {
                    cellStyle += ' ring-2 ring-indigo-600 ring-offset-1 scale-110 z-10';
                  }

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={count === 0}
                      onClick={() => {
                        if (count > 0 && peopleOnThisDay[0]) {
                          onSelectPerson(peopleOnThisDay[0].id);
                        }
                      }}
                      className={cellStyle}
                      title={
                        count > 0
                          ? isEn
                            ? `${dayNum} ${monthName}: ${count} people`
                            : `${dayNum}/${monthNum}: ${count} người sinh`
                          : undefined
                      }
                    >
                      {count > 0 ? <span className="font-mono text-xs">{count}</span> : null}
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
          <span>{isEn ? '0 people' : '0 người'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[2px] border border-blue-300 bg-blue-100 text-xs font-semibold text-blue-900 flex items-center justify-center leading-none">
            1
          </span>
          <span>{isEn ? '1 person' : '1 người'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-[2px] bg-amber-500 text-xs font-bold text-white flex items-center justify-center leading-none">
            2+
          </span>
          <span className="font-semibold text-amber-700">
            {isEn ? 'Shared birthday (Collision)' : 'Trùng sinh (Va chạm xác suất)'}
          </span>
        </span>
      </div>
    </div>
  );
};
