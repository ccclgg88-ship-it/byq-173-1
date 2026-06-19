import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  Users,
  RefreshCw,
  Home,
  Share2,
  Loader2
} from 'lucide-react';
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
          <h3 className="font-bold text-white text-lg">分享给朋友</h3>
        </div>

        {generatingShare || !shareData ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mb-3" />
            <p className="text-white/60 text-sm">正在生成分享海报...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl mb-5">
              <img
                src={shareData.qrCodeDataUrl}
                alt="分享二维码"
                className="w-44 h-44"
              />
            </div>

            <div className="w-full bg-white/5 rounded-2xl p-4 mb-5 border border-white/10">
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
