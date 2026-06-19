import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { pairApi, shareApi } from '@/api/client';
import { useAppStore } from '@/store/useAppStore';
import type { PairTaskDetail } from '../../shared/types';
import html2canvas from 'html2canvas';
import {
  Loader2,
  Check,
  Clock,
  Share2,
  Download,
  X,
  User as UserIcon,
  Sparkles,
  AlertCircle,
  Heart
} from 'lucide-react';

function ScoreRing({ score, size = 220 }: { score: number; size?: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [score]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return { from: '#22c55e', to: '#10b981' };
    if (s >= 60) return { from: '#f59e0b', to: '#f97316' };
    if (s >= 40) return { from: '#6366f1', to: '#8b5cf6' };
    return { from: '#ec4899', to: '#f43f5e' };
  };

  const color = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.from} />
            <stop offset="100%" stopColor={color.to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm text-white/50">合拍指数</span>
        <span className="text-5xl font-bold font-display" style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {displayScore}
        </span>
        <span className="text-sm text-white/50">/ 100</span>
      </div>
    </div>
  );
}

function PersonaCard({
  user,
  assessment,
  side
}: {
  user: { id: string; nickname: string; avatar: string };
  assessment?: { title: string; tags: string[]; description: string };
  side: 'left' | 'right';
}) {
  return (
    <div className={`glass-card p-4 flex-1 ${side === 'right' ? 'text-right' : ''}`}>
      <div className={`flex items-center gap-3 mb-3 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
          {user.avatar && /^[a-zA-Z0-9_/:.]/.test(user.avatar) ? (
            <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
          ) : user.avatar ? (
            <span>{user.avatar}</span>
          ) : (
            <UserIcon className="w-6 h-6 text-white" />
          )}
        </div>
        <div className={side === 'right' ? 'text-right' : ''}>
          <p className="text-xs text-white/50">{side === 'left' ? '发起者' : '参与者'}</p>
          <p className="font-bold">{user.nickname}</p>
        </div>
      </div>
      {assessment && (
        <>
          <p className="font-display font-bold text-base bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {assessment.title}
          </p>
          <div className={`flex flex-wrap gap-1.5 ${side === 'right' ? 'justify-end' : ''}`}>
            {assessment.tags.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function PairResult() {
  const { taskId } = useParams<{ taskId: string }>();
  const currentUser = useAppStore((s) => s.currentUser);

  const [task, setTask] = useState<PairTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [consenting, setConsenting] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const [posterData, setPosterData] = useState<{ shareUrl: string; qrCodeDataUrl: string } | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await pairApi.getTask(taskId, currentUser?.id);
      setTask(data);
      if (data.status === 'READY') {
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

  const handleConsent = async () => {
    if (!taskId || !currentUser?.id) return;
    setConsenting(true);
    try {
      await pairApi.consent(taskId, currentUser.id);
      await fetchTask();
    } catch (err) {
      console.error('确认公开失败:', err);
    } finally {
      setConsenting(false);
    }
  };

  const handleGeneratePoster = async () => {
    if (!task?.inviterAssessment?.id || !currentUser?.id) return;
    setGeneratingPoster(true);
    try {
      const data = await shareApi.generate(currentUser.id, task.inviterAssessment.id);
      setPosterData(data);
      setShowPoster(true);
    } catch (err) {
      console.error('生成海报失败:', err);
    } finally {
      setGeneratingPoster(false);
    }
  };

  const [savingPoster, setSavingPoster] = useState(false);

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setSavingPoster(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `pair-report-${taskId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('保存海报失败:', err);
    } finally {
      setSavingPoster(false);
    }
  };

  if (loading || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (task.status !== 'READY') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card p-8 text-center max-w-md">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-400" />
          <h2 className="text-xl font-bold mb-2">报告生成中</h2>
          <p className="text-white/60">请稍候，AI 正在分析你们的合拍报告...</p>
        </div>
      </div>
    );
  }

  const report = task.compatibilityReport;
  const isInviter = currentUser?.id === task.inviter.id;
  const userConsented = isInviter ? task.inviterConsented : task.partnerConsented;
  const bothConsented = task.inviterConsented && task.partnerConsented;

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <ScoreRing score={report?.score || 0} />
          </div>
          {report && (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500/30 to-pink-500/30 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="font-bold">{report.relationshipType}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <PersonaCard user={task.inviter} assessment={task.inviterAssessment} side="left" />
          <div className="flex items-center">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          {task.partner && (
            <PersonaCard user={task.partner} assessment={task.partnerAssessment} side="right" />
          )}
        </div>

        {report && (
          <>
            <div className="glass-card p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-yellow-400" />
                  共同点
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.commonTags.map((tag, idx) => (
                    <span key={idx} className="tag-chip tag-common">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  需要磨合
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.conflictTags.map((tag, idx) => (
                    <span key={idx} className="tag-chip tag-conflict">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <p className="text-sm font-medium text-white/80 mb-2">合拍解读</p>
              <p className="text-white/70 leading-relaxed text-sm">
                {report.description}
              </p>
            </div>
          </>
        )}

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">公开状态</span>
            <span className={`text-xs px-3 py-1 rounded-full ${bothConsented ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {bothConsented ? '双方已确认' : '等待确认'}
            </span>
          </div>
          <div className="flex gap-2">
            <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl ${task.inviterConsented ? 'bg-green-500/15' : 'bg-white/5'}`}>
              {task.inviterConsented ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Clock className="w-4 h-4 text-white/40" />
              )}
              <span className={`text-sm ${task.inviterConsented ? 'text-green-400' : 'text-white/50'}`}>
                {task.inviter.nickname}
              </span>
            </div>
            {task.partner && (
              <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl ${task.partnerConsented ? 'bg-green-500/15' : 'bg-white/5'}`}>
                {task.partnerConsented ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Clock className="w-4 h-4 text-white/40" />
                )}
                <span className={`text-sm ${task.partnerConsented ? 'text-green-400' : 'text-white/50'}`}>
                  {task.partner.nickname}
                </span>
              </div>
            )}
          </div>
          {!userConsented && currentUser && (
            <button
              onClick={handleConsent}
              disabled={consenting}
              className="w-full py-3 rounded-2xl font-bold bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {consenting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              确认公开此报告
            </button>
          )}
          {userConsented && (
            <div className="text-center text-sm text-green-400 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              你已确认公开
            </div>
          )}
        </div>

        {bothConsented && (
          <button
            onClick={handleGeneratePoster}
            disabled={generatingPoster}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generatingPoster ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
            <span>生成合拍海报</span>
          </button>
        )}
      </div>

      {showPoster && posterData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm" onClick={() => setShowPoster(false)}>
          <div className="glass-card-strong p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-display">合拍海报</h3>
              <button onClick={() => setShowPoster(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={posterRef} className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                {task.inviterAssessment && (
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xl overflow-hidden mb-2">
                      {task.inviter.avatar && /^[a-zA-Z0-9_/:.]/.test(task.inviter.avatar) ? (
                        <img src={task.inviter.avatar} alt="" className="w-full h-full object-cover" />
                      ) : task.inviter.avatar ? (
                        <span>{task.inviter.avatar}</span>
                      ) : (
                        <UserIcon className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <p className="text-sm font-bold">{task.inviter.nickname}</p>
                    <p className="text-xs text-white/50">{task.inviterAssessment.title}</p>
                  </div>
                )}
                <div className="px-3">
                  <Heart className="w-6 h-6 text-pink-400" />
                </div>
                {task.partner && task.partnerAssessment && (
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center text-xl overflow-hidden mb-2">
                      {task.partner.avatar && /^[a-zA-Z0-9_/:.]/.test(task.partner.avatar) ? (
                        <img src={task.partner.avatar} alt="" className="w-full h-full object-cover" />
                      ) : task.partner.avatar ? (
                        <span>{task.partner.avatar}</span>
                      ) : (
                        <UserIcon className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <p className="text-sm font-bold">{task.partner.nickname}</p>
                    <p className="text-xs text-white/50">{task.partnerAssessment.title}</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-4xl font-bold font-display bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                  {report?.score}
                </p>
                <p className="text-xs text-white/50">合拍指数</p>
                <p className="mt-2 text-sm font-medium">{report?.relationshipType}</p>
              </div>

              <div className="flex justify-center">
                <img src={posterData.qrCodeDataUrl} alt="QR Code" className="w-32 h-32 rounded-xl" />
              </div>

              <p className="text-center text-xs text-white/40">扫码查看你们的合拍报告</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPoster(false)} className="flex-1 py-3 rounded-2xl font-semibold bg-white/10 hover:bg-white/15 transition-colors">
                关闭
              </button>
              <button
                onClick={handleDownloadPoster}
                disabled={savingPoster}
                className="flex-1 py-3 rounded-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {savingPoster ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {savingPoster ? '保存中...' : '保存到相册'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
