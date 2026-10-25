'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppTag } from '@/components/ui';
import { Sliders, ShieldCheck, Database } from 'lucide-react';

interface SettingsTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs: SettingsTab[] = [
    {
      label: 'Cài đặt Chung',
      href: '/admin/settings',
      icon: Sliders,
      description: 'Thông tin hệ thống, bảo trì và giới hạn',
    },
    {
      label: 'Chính sách Truy cập',
      href: '/admin/settings/access',
      icon: ShieldCheck,
      description: 'Quyền chạy mô phỏng, bình luận và đăng ký',
    },
    {
      label: 'Sao lưu & Dữ liệu',
      href: '/admin/settings/backup',
      icon: Database,
      description: 'Xuất tệp JSON, CSV và lưu trữ ngoại tuyến',
    },
  ];

  const isTabActive = (href: string) => {
    if (href === '/admin/settings') {
      return pathname === '/admin/settings';
    }
    return pathname === href;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Settings Section Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-300/85 shadow-2xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <AppTag variant="blue" size="sm">
              CÀI ĐẶT HỆ THỐNG
            </AppTag>
            <span className="text-xs font-mono text-slate-400">Vận hành nền tảng</span>
          </div>
          <h2 className="text-[18px] font-heading font-extrabold text-slate-900 mt-1">
            Cấu Hình & Quản Trị Nền Tảng
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
            Quản trị các tham số vận hành, phân quyền truy cập phòng Lab và sao lưu dữ liệu nghiên
            cứu khoa học.
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 pt-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = isTabActive(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap -mb-px border-b-2 ${
                  active
                    ? 'border-blue-600 text-blue-700 bg-blue-50/60 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`}
                />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
