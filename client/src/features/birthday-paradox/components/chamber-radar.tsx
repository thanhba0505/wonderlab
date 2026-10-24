'use client';

import React, { useMemo } from 'react';
import { CollisionPair, PersonInRoom } from '../birthday-math';

interface ChamberRadarProps {
  people: PersonInRoom[];
  collisionPairs: CollisionPair[];
  selectedPersonId: number | null;
  onSelectPerson: (id: number | null) => void;
}

export const ChamberRadar: React.FC<ChamberRadarProps> = ({
  people,
  collisionPairs,
  selectedPersonId,
  onSelectPerson,
}) => {
  const size = 380;
  const radius = 150;
  const center = size / 2;

  // Tính toán tọa độ x, y của từng người trên vòng tròn
  const peopleWithCoords = useMemo(() => {
    const total = people.length;
    return people.map((person, index) => {
      // Góc quay từ -90 độ (đỉnh trên cùng)
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { ...person, x, y };
    });
  }, [people, center, radius]);

  // Tập hợp các ID người có va chạm trùng ngày
  const collidingPersonIds = useMemo(() => {
    const set = new Set<number>();
    collisionPairs.forEach(pair => {
      set.add(pair.personAId);
      set.add(pair.personBId);
    });
    return set;
  }, [collisionPairs]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-h-[380px] max-w-[380px] overflow-visible select-none"
      >
        <defs>
          <radialGradient id="chamberBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Nền buồng radar kỹ thuật */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="url(#chamberBg)"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <circle
          cx={center}
          cy={center}
          r={radius * 0.65}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />
        <circle
          cx={center}
          cy={center}
          r={radius * 0.3}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />

        {/* Trục tọa độ chữ thập */}
        <line
          x1={center - radius - 10}
          y1={center}
          x2={center + radius + 10}
          y2={center}
          stroke="#cbd5e1"
          strokeWidth="0.75"
        />
        <line
          x1={center}
          y1={center - radius - 10}
          x2={center}
          y2={center + radius + 10}
          stroke="#cbd5e1"
          strokeWidth="0.75"
        />

        {/* Tâm radar */}
        <circle cx={center} cy={center} r="3" fill="#64748b" />

        {/* Các đường tia nối giữa các cặp người trùng ngày sinh */}
        {collisionPairs.map((pair, idx) => {
          const personA = peopleWithCoords.find(p => p.id === pair.personAId);
          const personB = peopleWithCoords.find(p => p.id === pair.personBId);
          if (!personA || !personB) return null;

          const isHighlighted =
            selectedPersonId === pair.personAId || selectedPersonId === pair.personBId;

          return (
            <g key={`collision-${pair.personAId}-${pair.personBId}-${idx}`}>
              <line
                x1={personA.x}
                y1={personA.y}
                x2={personB.x}
                y2={personB.y}
                stroke={isHighlighted ? '#b45309' : '#d97706'}
                strokeWidth={isHighlighted ? '2.5' : '1.75'}
                strokeOpacity={isHighlighted ? '1' : '0.85'}
              />
              {/* Điểm giao cắt ở giữa đoạn nối */}
              <circle
                cx={(personA.x + personB.x) / 2}
                cy={(personA.y + personB.y) / 2}
                r="3.5"
                fill="#d97706"
                stroke="#ffffff"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Các nút đại diện cho từng người trong phòng */}
        {peopleWithCoords.map(person => {
          const isColliding = collidingPersonIds.has(person.id);
          const isSelected = selectedPersonId === person.id;
          const nodeRadius = people.length > 50 ? 5 : 7;

          return (
            <g
              key={`person-${person.id}`}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => onSelectPerson(isSelected ? null : person.id)}
            >
              <circle
                cx={person.x}
                cy={person.y}
                r={nodeRadius + (isSelected ? 3 : 0)}
                fill={isColliding ? '#d97706' : isSelected ? '#2563eb' : '#3b82f6'}
                stroke="#ffffff"
                strokeWidth={isSelected ? '2.5' : '1.5'}
              />

              {/* Nhãn ID hiển thị khi số lượng người vừa phải (n <= 35) */}
              {people.length <= 35 && (
                <text
                  x={person.x}
                  y={person.y - nodeRadius - 4}
                  textAnchor="middle"
                  className="fill-slate-600 font-mono text-[9px] font-semibold select-none pointer-events-none"
                >
                  #{person.id}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Thông số kỹ thuật tóm tắt dưới radar */}
      <div className="mt-2 flex items-center justify-between gap-4 text-xs font-mono text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <span>Đối tượng ({people.length})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-600" />
          <span>Va chạm ({collisionPairs.length} cặp)</span>
        </span>
      </div>
    </div>
  );
};
