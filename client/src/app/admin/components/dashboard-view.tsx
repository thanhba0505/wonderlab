'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  AppButton,
  AppTag,
} from '@/components/ui';
import {
  Play,
  Flame,
  Users,
  MessageSquare,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { AdminOverviewData } from '@/lib/admin-api';

interface DashboardViewProps {
  overview: AdminOverviewData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onNavigateTo?: (view: 'simulations' | 'users' | 'comments') => void;
}

export function DashboardView({
  overview,
  isLoading,
  onRefresh,
  onNavigateTo,
}: DashboardViewProps) {
  if (isLoading && !overview) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-xs font-mono text-slate-500">Đang tải số liệu tổng quan...</span>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Tổng lượt chạy mô phỏng',
      value: overview?.totalRuns.toLocaleString('vi-VN') ?? '0',
      icon: Play,
      accent: 'border-l-4 border-blue-600 bg-blue-50/20',
      textColor: 'text-blue-700',
      unit: 'phiên tính toán',
    },
    {
      label: 'Tổng mẫu thử Monte Carlo',
      value: overview?.totalTrials.toLocaleString('vi-VN') ?? '0',
      icon: Flame,
      accent: 'border-l-4 border-amber-500 bg-amber-50/20',
      textColor: 'text-amber-700',
      unit: 'lần thử ngẫu nhiên',
    },
    {
      label: 'Thành viên hệ thống',
      value: overview?.totalUsers.toString() ?? '0',
      icon: Users,
      accent: 'border-l-4 border-emerald-600 bg-emerald-50/20',
      textColor: 'text-emerald-700',
      unit: 'tài khoản hoạt động',
    },
    {
      label: 'Thảo luận & Phản biện',
      value: overview?.totalComments.toString() ?? '0',
      icon: MessageSquare,
      accent: 'border-l-4 border-violet-600 bg-violet-50/20',
      textColor: 'text-violet-700',
      unit: 'bình luận & phản hồi',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-300/85 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <AppTag variant="blue" size="sm">
              BẢNG ĐIỀU HÀNH TỔNG QUAN
            </AppTag>
            <span className="text-xs font-mono text-slate-400">Thời gian thực</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 mt-1">
            Trung Tâm Vận Hành Nền Tảng Wonderlab
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-sans mt-0.5">
            Theo dõi lưu lượng thí nghiệm mô phỏng, người dùng thực tế và chất lượng thảo luận khoa
            học.
          </p>
        </div>

        <AppButton
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs font-semibold gap-1.5 border-slate-300 bg-white shadow-2xs shrink-0"
          leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Làm mới số liệu
        </AppButton>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs space-y-2 ${kpi.accent}`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="font-sans truncate">{kpi.label}</span>
                <Icon className={`h-4 w-4 ${kpi.textColor} shrink-0`} />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tabular-nums">
                  {kpi.value}
                </div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">{kpi.unit}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Split: Recent Simulation Runs vs Recent Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Simulation Telemetry */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
                  <Play className="h-4 w-4 text-blue-600" />
                  Nhật Ký Thực Nghiệm Gần Đây
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-sans mt-0.5">
                  Các phiên tính toán Monte Carlo được gửi về từ trình duyệt người dùng.
                </CardDescription>
              </div>
              <Link href="/admin/simulations">
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTo?.('simulations')}
                  className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
                  rightIcon={<ArrowUpRight className="h-3 w-3" />}
                >
                  Xem tất cả
                </AppButton>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            {overview?.recentRuns && overview.recentRuns.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {overview.recentRuns.map(run => (
                  <div
                    key={run.id}
                    className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {run.simulationSlug}
                        </span>
                        <AppTag variant="blue" size="sm">
                          {run.trialsCount.toLocaleString('vi-VN')} ván
                        </AppTag>
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        {new Date(run.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    {run.durationMs && (
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {run.durationMs}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-sans">
                Chưa có dữ liệu thực nghiệm nào được ghi nhận.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Community Comments */}
        <Card className="border-slate-300/85 bg-white shadow-2xs">
          <CardHeader className="border-b border-slate-200/80 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-heading font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-violet-600" />
                  Thảo Luận Mới Cần Chú Ý
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-sans mt-0.5">
                  Bình luận và phản hồi từ các thành viên trong các phòng Lab.
                </CardDescription>
              </div>
              <Link href="/admin/comments">
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateTo?.('comments')}
                  className="text-xs text-violet-700 hover:text-violet-800 font-semibold"
                  rightIcon={<ArrowUpRight className="h-3 w-3" />}
                >
                  Kiểm duyệt
                </AppButton>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            {overview?.recentComments && overview.recentComments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {overview.recentComments.map(comment => (
                  <div
                    key={comment.id}
                    className="p-3.5 hover:bg-slate-50/70 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {comment.user.username}
                        </span>
                        <AppTag variant="default" size="sm">
                          {comment.user.role}
                        </AppTag>
                        <AppTag variant="blue" size="sm">
                          {comment.simulationSlug}
                        </AppTag>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-sans line-clamp-2">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-sans">
                Chưa có bình luận nào trên hệ thống.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
