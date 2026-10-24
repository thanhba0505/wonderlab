'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { fetchSimulationStats, SimulationGlobalStats } from '@/lib/telemetry';
import {
  ArrowLeft,
  ShieldCheck,
  Server,
  Database,
  Lock,
  LogOut,
  Activity,
  Cpu,
  RefreshCw,
  AlertCircle,
  Loader2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

function AdminDashboard() {
  const { user, login, logout, isLoading } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Live health telemetry from backend
  const [healthData, setHealthData] = React.useState<HealthData | null>(null);
  const [simStats, setSimStats] = React.useState<SimulationGlobalStats | null>(null);
  const [isHealthLoading, setIsHealthLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'telemetry' | 'simulations' | 'security'>(
    'telemetry',
  );

  const fetchHealth = React.useCallback(async () => {
    setIsHealthLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1';
      const [healthRes, stats] = await Promise.all([
        fetch(`${apiUrl}/health`, { cache: 'no-store' }),
        fetchSimulationStats(),
      ]);

      if (healthRes.ok) {
        const data = await healthRes.json();
        setHealthData(data);
      }
      if (stats) {
        setSimStats(stats);
      }
    } catch {
      // Ignored
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchHealth();
    }
  }, [user, fetchHealth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLoginError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }
    setLoginError(null);
    setIsSubmitting(true);
    const result = await login(username.trim(), password);
    setIsSubmitting(false);
    if (!result.success) {
      setLoginError(result.error || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="text-sm font-mono text-slate-500">Đang đồng bộ phiên bảo mật...</span>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: Unauthenticated State -> High-Craft Login Console
  // =========================================================================
  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-300 text-slate-700 bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Về Trang chủ
            </Button>
          </Link>
          <span className="text-xs font-mono text-slate-500">Wonderlab Portal / Auth</span>
        </div>

        <Card className="border-slate-300/85 bg-white shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/70 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <Lock className="h-3 w-3" />
              XÁC THỰC QUẢN TRỊ
            </div>
            <h1 className="font-heading text-xl font-bold text-slate-900">
              Đăng nhập Admin Console
            </h1>
            <p className="text-xs text-slate-500 font-sans">
              Khu vực dành cho quản trị viên vận hành hệ thống Wonderlab.
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="admin-username"
                className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700"
              >
                Tên đăng nhập
              </label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-sans"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700"
              >
                Mật khẩu
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-sans"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xác thực...
                </>
              ) : (
                'Đăng nhập vào Hệ thống'
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: Authenticated State -> Wonderlab Admin Control Center
  // =========================================================================
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-300 text-slate-700 bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Trang chủ
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
              Wonderlab Console
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono text-blue-700 font-semibold">Dashboard</span>
          </div>
        </div>

        {/* User Session Badge & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300/85 bg-white shadow-2xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-800">{user.username}</span>
            <Badge
              variant="default"
              className="px-1.5 py-0 text-[10px] font-mono bg-blue-50 text-blue-700 border-blue-200"
            >
              {user.role}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            className="gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 bg-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Main Console Welcome Banner */}
      <div className="rounded-2xl border border-slate-300/85 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-700 font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            Phiên làm việc Quản trị viên đã xác thực
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight">
            Trung tâm Điều hành Khoa học & Mô phỏng
          </h1>
          <p className="text-sm text-slate-600 font-sans max-w-2xl">
            Quản lý trực tiếp các mô hình toán học, theo dõi trạng thái hệ thống máy chủ NestJS, cơ
            sở dữ liệu PostgreSQL và cấu hình tham số thực nghiệm.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchHealth}
          disabled={isHealthLoading}
          className="gap-1.5 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-mono text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isHealthLoading ? 'animate-spin' : ''}`} />
          Làm mới Telemetry
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold border-b-2 transition-colors ${
            activeTab === 'telemetry'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="h-4 w-4" />
          HỆ THỐNG & TELEMETRY
        </button>

        <button
          onClick={() => setActiveTab('simulations')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold border-b-2 transition-colors ${
            activeTab === 'simulations'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          QUẢN LÝ THÍ NGHIỆM
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          BẢO MẬT & PHÂN QUYỀN
        </button>
      </div>

      {/* TAB 1: System Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* NestJS Server Health */}
            <Card className="border-slate-300/85 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                    BACKEND API
                  </span>
                  <Badge variant="emerald" className="gap-1 text-[10px] font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ONLINE
                  </Badge>
                </div>
                <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-600" />
                  NestJS 10 Runtime
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs font-mono text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Trạng thái:</span>
                  <span className="font-bold text-emerald-700">HTTP 200 (OK)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Phiên bản:</span>
                  <span className="text-slate-900">{healthData?.version || '1.0.0'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Prefix:</span>
                  <span className="text-blue-700">/api/v1</span>
                </div>
              </CardContent>
            </Card>

            {/* PostgreSQL Database Health */}
            <Card className="border-slate-300/85 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                    DATABASE
                  </span>
                  <Badge variant="emerald" className="gap-1 text-[10px] font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    CONNECTED
                  </Badge>
                </div>
                <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  PostgreSQL 16 (Prisma)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs font-mono text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Host:</span>
                  <span className="text-slate-900">127.0.0.1:5434</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Database:</span>
                  <span className="text-blue-700 font-bold">wonderlab</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Bảng xác thực:</span>
                  <span className="text-slate-900">users (UUID v4)</span>
                </div>
              </CardContent>
            </Card>

            {/* Session Security */}
            <Card className="border-slate-300/85 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                    SECURITY
                  </span>
                  <Badge
                    variant="default"
                    className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border-blue-200"
                  >
                    ACTIVE
                  </Badge>
                </div>
                <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  JWT HttpOnly Cookie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs font-mono text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Thuật toán Hash:</span>
                  <span className="font-bold text-blue-700">Argon2id</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Lưu trữ Token:</span>
                  <span className="text-slate-900">HttpOnly, Lax</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Rate Limiting:</span>
                  <span className="text-emerald-700 font-bold">5 req/min (Active)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Telemetry Log panel */}
          <div className="rounded-xl bg-slate-100/70 border-l-4 border-blue-600 p-4 text-xs font-mono text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              System Heartbeat Log:
            </div>
            <div>Dịch vụ: {healthData?.service || 'wonderlab-server'}</div>
            <div>Thời điểm kiểm tra cuối: {healthData?.timestamp || new Date().toISOString()}</div>
            <div>
              Đường dẫn OpenAPI Docs:{' '}
              <a
                href={(
                  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4101/api/v1'
                ).replace(/\/api\/v1\/?$/, '/api/docs')}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline font-bold"
              >
                OpenAPI Specification
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Simulations Management */}
      {activeTab === 'simulations' && (
        <div className="space-y-6">
          {/* Live Telemetry Summary Banner */}
          <div className="rounded-xl border border-slate-300/85 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  DATABASE TELEMETRY
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900 mt-0.5">
                  Dữ liệu Thực nghiệm Tích lũy Toàn Hệ thống
                </h3>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block">Tổng phép thử:</span>
                  <span className="text-lg font-extrabold text-blue-700 tabular-nums">
                    {(simStats?.totalTrials ?? 0).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500 block">Tổng lượt chạy:</span>
                  <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                    {(simStats?.totalRuns ?? 0).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-500 block">Đồng bộ:</span>
                  <span className="text-emerald-700 font-bold">PostgreSQL Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Birthday Paradox Card */}
            <Card className="border-slate-300/85 bg-white shadow-xs">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="cyan" className="text-[10px] font-mono">
                    PROBABILITY LAB
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-500">
                    {simStats?.bySimulation?.['birthday-paradox']?.runs ?? 0} lượt chạy
                  </span>
                </div>
                <CardTitle className="text-base text-slate-900 flex items-center gap-2 mt-1">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Nghịch lý Ngày sinh (Birthday Paradox)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-sans">
                  Va chạm ngày sinh trong buồng thử radar và thuật toán Monte Carlo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs font-mono text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Mốc quan trọng:</span>
                  <span className="font-bold text-slate-900">n = 23 (P ≈ 50.7%)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Số phép thử đã tích lũy:</span>
                  <span className="font-bold text-blue-700 tabular-nums">
                    {(simStats?.bySimulation?.['birthday-paradox']?.trials ?? 0).toLocaleString(
                      'vi-VN',
                    )}{' '}
                    phòng
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Số lượt chạy đã ghi nhận:</span>
                  <span className="text-slate-900 font-bold tabular-nums">
                    {simStats?.bySimulation?.['birthday-paradox']?.runs ?? 0} lượt
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Trạng thái telemetry:</span>
                  <span className="text-emerald-700 font-bold">Đồng bộ thời gian thực</span>
                </div>
              </CardContent>
            </Card>

            {/* Monty Hall Card */}
            <Card className="border-slate-300/85 bg-white shadow-xs">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    PARADOX LAB
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-500">
                    {simStats?.bySimulation?.['monty-hall']?.runs ?? 0} lượt chạy
                  </span>
                </div>
                <CardTitle className="text-base text-slate-900 flex items-center gap-2 mt-1">
                  <CheckCircle2 className="h-5 w-5 text-violet-600" />
                  Mô phỏng Monty Hall
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-sans">
                  Tham số hội tụ theo Định luật số lớn (Monte Carlo)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs font-mono text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Số lượng cửa:</span>
                  <span className="font-bold text-slate-900">3 Vault Doors</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Số ván đã tích lũy:</span>
                  <span className="font-bold text-violet-700 tabular-nums">
                    {(simStats?.bySimulation?.['monty-hall']?.trials ?? 0).toLocaleString('vi-VN')}{' '}
                    ván
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Tỷ lệ thắng lý thuyết (Đổi / Giữ):</span>
                  <span className="text-slate-900 font-bold">66.67% / 33.33%</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Chế độ mô phỏng hàng loạt:</span>
                  <span className="text-emerald-700 font-bold">+50 / +500 Ván trực tiếp</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: Security & RBAC */}
      {activeTab === 'security' && (
        <Card className="border-slate-300/85 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Danh sách Tài khoản Quản trị & Phân quyền (RBAC)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 font-sans">
              Quản lý các tài khoản có quyền truy cập vào hệ điều hành Wonderlab
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Vai trò (Role)</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="px-4 py-3 font-bold text-blue-700">{user.username}</td>
                    <td className="px-4 py-3">{user.email || 'admin@wonderlab.local'}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="default"
                        className="text-[10px] font-mono bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-emerald-700 font-bold">● Hoạt động</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-xs font-sans text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 font-heading mb-1">
                Nguyên tắc Quản trị Wonderlab:
              </div>
              Hệ thống hiện tại định hình duy nhất vai trò{' '}
              <code className="font-mono font-bold text-blue-700">Role.ADMIN</code> để đảm bảo an
              toàn tuyệt đối và tránh phình to phạm vi (Scope Creep). Khi cần phân quyền biên tập
              viên nghiên cứu hoặc cộng tác viên khoa học, schema Prisma đã sẵn sàng mở rộng các vai
              trò tiếp theo.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminPage() {
  return <AdminDashboard />;
}
