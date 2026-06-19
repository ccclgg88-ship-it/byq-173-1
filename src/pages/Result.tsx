import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  Users,
  RefreshCw,
  Home,
  Share2,
  Loader2,
  Sparkles,
  Download
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { assessmentApi, shareApi, pairApi } from '@/api/client';
import { useAppStore } from '@/store/useAppStore';
import type { PersonaResult, ShareGenerateResult } from '../../shared/types';

export default function Result() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, sharerInfo, setSharerInfo, setCurrentAssessment } = useAppStore();

  const [assessment, setAssessment] = useState<PersonaResult | null>(null);
  const [shareData, setShareData] = useState<ShareGenerateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingShare, setGeneratingShare] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [savingPoster, setSavingPoster] = useState(false);

  const loadAssessment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await assessmentApi.get(id);
      setAssessment(data);
      setCurrentAssessment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [id, setCurrentAssessment]);

  const generateShare = useCallback(async () => {
    if (!currentUser || !assessment) return;
    try {
      setGeneratingShare(true);
      const data = await shareApi.generate(currentUser.id, assessment.id);
      setShareData(data);
    } catch (err) {
      console.error('生成分享失败:', err);
    } finally {
      setGeneratingShare(false);
    }
  }, [currentUser, assessment]);

  const recordReferral = useCallback(async () => {
    if (!sharerInfo || !currentUser || !assessment) return;
    try {
      await shareApi.recordReferral(sharerInfo.sharerId, sharerInfo.assessmentId, currentUser.id);
      setSharerInfo(null);
    } catch (err) {
      console.error('记录回流失败:', err);
    }
  }, [sharerInfo, currentUser, assessment, setSharerInfo]);

  useEffect(() => {
    loadAssessment();
  }, [loadAssessment]);

  useEffect(() => {
    if (assessment && currentUser) {
      generateShare();
      if (sharerInfo) {
        recordReferral();
      }
    }
  }, [assessment, currentUser, generateShare, recordReferral, sharerInfo]);

  const handleCopy = async () => {
    if (!shareData?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleInvite = async () => {
    if (!currentUser || !assessment) return;
    try {
      setInviting(true);
      const result = await pairApi.invite(currentUser.id, assessment.id);
      navigate(`/pair/invite/${result.taskId}`);
    } catch (err) {
      console.error('邀请失败:', err);
    } finally {
      setInviting(false);
    }
  };

  const handleSavePoster = async () => {
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
      link.download = `persona-${assessment?.title || 'result'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('保存海报失败:', err);
    } finally {
      setSavingPoster(false);
    }
  };

  const handleRetry = () => {
    navigate('/quiz');
  };

  const handleHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-white/60" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4">
        <p className="text-white/80 text-lg">{error || '未找到测评结果'}</p>
        <button onClick={handleHome} className="btn-secondary flex items-center gap-2">
          <Home className="w-5 h-5" />
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8 pb-16 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleHome}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Home className="w-5 h-5 text-white/80" />
        </button>
        <h1 className="text-lg font-bold text-white/90">测评结果</h1>
        <div className="w-10" />
      </div>

      <div className="glass-card-strong p-8 mb-6 text-center">
        <p className="text-white/60 text-sm mb-2">你的人设称号</p>
        <h2
          className="font-display font-bold text-4xl sm:text-5xl mb-6 leading-tight"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 50%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {assessment.title}
        </h2>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {assessment.tags.slice(0, 5).map((tag, index) => (
            <span key={index} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>

        <p className="text-white/80 text-base leading-relaxed">
          {assessment.description}
        </p>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Share2 className="w-5 h-5 text-pink-400" />
          <h3 className="font-bold text-white text-lg">分享海报</h3>
        </div>

        {generatingShare || !shareData ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mb-3" />
            <p className="text-white/60 text-sm">正在生成分享海报...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div
              ref={posterRef}
              className="relative w-full max-w-xs overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #312e81 0%, #581c87 50%, #be185d 100%)',
                borderRadius: '20px',
                padding: '24px'
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white/90 text-sm">人设实验室</span>
                </div>
                <span className="text-xs text-white/40">PERSONA LAB</span>
              </div>

              <div className="text-center mb-5">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-3xl overflow-hidden">
                  {currentUser?.avatar}
                </div>
                <p className="text-white/80 text-sm mb-1">{currentUser?.nickname}</p>
                <p className="text-white/40 text-xs">的专属人设</p>
              </div>

              <div
                className="text-center mb-5 py-5 px-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
              >
                <p
                  className="font-display font-bold text-2xl mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 50%, #a78bfa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {assessment?.title}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {assessment?.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.8)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs text-white/30">扫码测一测</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl shadow-lg">
                  <img
                    src={shareData.qrCodeDataUrl}
                    alt="分享二维码"
                    className="w-28 h-28"
                  />
                </div>
              </div>

              <p className="text-center text-white/30 text-xs mt-4">
                长按识别二维码 · 发现你的专属人设
              </p>
            </div>

            <div className="w-full bg-white/5 rounded-2xl p-4 mt-5 border border-white/10">
              <p className="text-white/50 text-xs mb-2">分享链接</p>
              <div className="flex items-center gap-2">
                <p className="text-white/80 text-sm flex-1 truncate">
                  {shareData.shareUrl}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/70" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleSavePoster}
              disabled={savingPoster}
              className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
            >
              {savingPoster ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              保存海报到相册
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleInvite}
          disabled={inviting}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {inviting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Users className="w-5 h-5" />
          )}
          邀请朋友合拍
        </button>

        <button
          onClick={handleRetry}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          再测一次
        </button>
      </div>
    </div>
  );
}
