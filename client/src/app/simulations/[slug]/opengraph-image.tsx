import { ImageResponse } from 'next/og';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getSimulationBySlug, getAllSimulations } from '@/features/simulations/registry';

export const alt = 'Wonderlab Interactive Science Simulation';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export async function generateStaticParams() {
  const simulations = getAllSimulations();
  return simulations.map(sim => ({
    slug: sim.slug,
  }));
}

async function loadFont(filename: string): Promise<ArrayBuffer> {
  const possiblePaths = [
    path.join(process.cwd(), 'src/assets/fonts', filename),
    path.join(process.cwd(), 'client/src/assets/fonts', filename),
    path.join(process.cwd(), '../client/src/assets/fonts', filename),
  ];

  for (const filePath of possiblePaths) {
    try {
      const buffer = await fs.readFile(filePath);
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } catch {
      // Continue trying next path
    }
  }

  throw new Error(`Font file not found: ${filename}`);
}

interface CategoryStyle {
  label: string;
  bg: string;
  border: string;
  text: string;
}

const CATEGORY_MAP: Record<string, CategoryStyle> = {
  probability: {
    label: 'Xác suất & Thống kê',
    bg: '#fef3c7',
    border: '#fde68a',
    text: '#b45309',
  },
  quantum: {
    label: 'Vật lý Lượng tử',
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1d4ed8',
  },
  'game-theory': {
    label: 'Lý thuyết Trò chơi',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#047857',
  },
  paradox: {
    label: 'Nghịch lý & Triết học',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    text: '#6d28d9',
  },
  logic: {
    label: 'Logic & Hình học',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    text: '#047857',
  },
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sim = getSimulationBySlug(slug);

  const [boldFontData, regularFontData] = await Promise.all([
    loadFont('BeVietnamPro-Bold.ttf'),
    loadFont('BeVietnamPro-Regular.ttf'),
  ]);

  const title = sim ? sim.title : 'Wonderlab Simulation';
  const subtitle = sim ? sim.subtitle : 'Phòng Thí nghiệm Khoa học Tương tác';
  const summary = sim
    ? sim.summary
    : 'Khám phá các nghịch lý toán học, xác suất thống kê và hiện tượng vật lý lượng tử qua mô phỏng tương tác.';
  const categoryKey = sim ? sim.category : 'default';
  const category = CATEGORY_MAP[categoryKey] ?? {
    label: 'Khoa học Thực nghiệm',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    text: '#334155',
  };
  const estimatedMinutes = sim ? sim.estimatedMinutes : 5;
  const labId = sim ? sim.slug.toUpperCase() : 'SIM';

  const titleFontSize = title.length > 40 ? 38 : 44;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        backgroundImage:
          'linear-gradient(to right, rgba(148, 163, 184, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.22) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
        fontFamily: 'Be Vietnam Pro',
        padding: '40px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid rgba(203, 213, 225, 0.9)',
          padding: '48px 56px',
          boxShadow:
            '0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Top Row: Category badge & Lab metadata */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: category.bg,
              border: `1px solid ${category.border}`,
              color: category.text,
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: category.text,
              }}
            />
            <span>{category.label}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <div
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span>~{estimatedMinutes} PHÚT TRẢI NGHIỆM</span>
            </div>
            <div
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span>LAB #{labId}</span>
            </div>
          </div>
        </div>

        {/* Middle: Title, Subtitle, and 2-line Summary */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            margin: '20px 0',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#2563eb',
              letterSpacing: '0.02em',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span>{subtitle}</span>
          </div>

          <div
            style={{
              fontSize: `${titleFontSize}px`,
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              display: 'flex',
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: '18px',
              fontWeight: 400,
              color: '#475569',
              lineHeight: 1.55,
              marginTop: '16px',
              maxWidth: '1000px',
              display: 'flex',
            }}
          >
            {summary}
          </div>
        </div>

        {/* Bottom Row: Logo & Certification Stamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
                <path d="M5.52 16h12.96" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                }}
              >
                Wonderlab
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  display: 'flex',
                }}
              >
                PHÒNG THÍ NGHIỆM TRỰC QUAN
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                letterSpacing: '0.05em',
                display: 'flex',
              }}
            >
              INTERACTIVE SCIENCE SIMULATION
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Be Vietnam Pro',
          data: boldFontData,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Be Vietnam Pro',
          data: regularFontData,
          style: 'normal',
          weight: 400,
        },
      ],
    },
  );
}
