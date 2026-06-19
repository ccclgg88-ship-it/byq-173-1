import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pairApi } from '@/api/client';
import { useAppStore } from '@/store/useAppStore';
import type { PairTaskDetail } from '../../shared/types';
import { Clock, Copy, Check, Users, Sparkles, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function PairInvite() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);

  const [task, setTask] = useState<PairTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await pairApi.getTask(taskId, currentUser?.id);
      setTask(data);
      if (data.status === 'READY' || data.status === 'EXPIRED') {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch (err) {
      console.error('获取任务失败:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId, currentUser?.id]);

  useEffect(() => {
    if (!taskId) return;

    fetchTask();
    pollRef.current = setInterval(fetchTask, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [taskId, fetchTask]);

  useEffect(() => {
    if (!task) return;

    const updateCountdown = () => {
      const remaining = new Date(task.expiresAt).getTime() - Date.now();
      setCountdown(Math.max(0, remaining));
      if (remaining <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

    updateCountdown();
    timerRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [task]);

  const handleCopy = () => {
    const inviteUrl = `${window.location.origin}/pair/join/${taskId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    if (!task) return null;

    switch (task.status) {
      case 'WAITING_PARTNER':
        return (
          <div className="space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/30 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/40 to-pink-500/40 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="w-14 h-14 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-display">等待好友加入</h2>
              <p className="text-white/60">将邀请链接发送给好友，TA 加入后即可生成合拍报告</p>
            </div>
            <div className="glass-card p-4 space-y-3">
              <p className="text-sm text-white/60 text-center">邀请链接</p>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 truncate text-sm text-white/70">
                  {`${window.location.origin}/pair/join/${taskId}`}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        );

      case 'GENERATING':
        return (
          <div className="space-y-6">
            <div className="w-32 h-32 mx-auto flex items-center justify-center">
              <div className="relative">
                <Loader2 className="w-24 h-24 text-indigo-400 animate-spin" />
                <Sparkles className="w-10 h-10 text-pink-400 absolute inset-0 m-auto animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-display">正在生成合拍报告</h2>
              <p className="text-white/60">AI 正在分析你们的人格匹配度，请稍候...</p>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        );

      case 'READY':
        return (
          <div className="space-y-6">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white animate-bounce" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-display">合拍报告已生成！</h2>
              <p className="text-white/60">快来看看你们的合拍指数吧</p>
            </div>
            <button
              onClick={() => navigate(`/pair/result/${taskId}`)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>查看报告</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );

      case 'EXPIRED':
        return (
          <div className="space-y-6">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-display">邀请已过期</h2>
              <p className="text-white/60">邀请链接已超过 24 小时有效期</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary w-full"
            >
              返回个人中心
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-center gap-2 text-white/70">
            <Clock className="w-4 h-4" />
            <span className="text-sm">邀请有效期剩余</span>
            <span className="font-mono font-bold text-white">{formatCountdown(countdown)}</span>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
