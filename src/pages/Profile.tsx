import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  User,
  Users,
  Clock,
  ChevronRight,
  Loader2,
  Sparkles
} from 'lucide-react';
import { userApi, assessmentApi } from '@/api/client';
import { useAppStore } from '@/store/useAppStore';
import type { ShareStats, PersonaResult } from '../../shared/types';

const EMOJI_AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐸', '🐵', '🦄', '🐙', '🦋', '🌸'];

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser } = useAppStore();

  const [shareStats, setShareStats] = useState<ShareStats | null>(null);
  const [assessments, setAssessments] = useState<PersonaResult[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAssessments, setLoadingAssessments] = useState(true);

  const loadShareStats = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoadingStats(true);
      const data = await userApi.getShareStats(currentUser.id);
      setShareStats(data);
    } catch (err) {
      console.error('加载分享数据失败:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [currentUser]);

  const loadAssessments = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoadingAssessments(true);
      const data = await assessmentApi.getByUser(currentUser.id);
      setAssessments(data);
    } catch (err) {
      console.error('加载测评历史失败:', err);
    } finally {
      setLoadingAssessments(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/', { replace: true });
      return;
    }
    loadShareStats();
    loadAssessments();
  }, [currentUser, navigate, loadShareStats, loadAssessments]);

  const handleHome = () => {
    navigate('/');
  };

  const handleViewResult = (id: string) => {
    navigate(`/result/${id}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (!currentUser) {
    return null;
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
        <h1 className="text-lg font-bold text-white/90">个人中心</h1>
        <div className="w-10" />
      </div>

      <div className="glass-card-strong p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">
              {currentUser.nickname}
            </h2>
            <p className="text-white/50 text-sm mt-1">
              加入于 {formatDate(currentUser.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card-strong p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-pink-400" />
          <h3 className="font-bold text-white">分享数据</h3>
        </div>

        {loadingStats ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
          </div>
        ) : (
          <>
            <div className="text-center py-4 mb-6">
              <p className="text-white/50 text-sm mb-2">累计邀请人数</p>
              <p
                className="font-display font-bold text-5xl"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {shareStats?.totalInvites || 0}
              </p>
            </div>

            {shareStats && shareStats.recentFriends.length > 0 && (
              <div>
                <p className="text-white/60 text-sm mb-3">最近回流好友</p>
                <div className="space-y-2">
                  {shareStats.recentFriends.slice(0, 5).map((friend, index) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-lg flex-shrink-0 border border-white/10">
                        {EMOJI_AVATARS[index % EMOJI_AVATARS.length]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 text-sm font-medium truncate">
                          {friend.anonymousTitle}
                        </p>
                      </div>
                      <Sparkles className="w-4 h-4 text-yellow-400/70 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white">我的测评</h3>
        </div>

        {loadingAssessments ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-10">
            <Clock className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">暂无测评记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((item) => (
              <button
                key={item.id}
                onClick={() => handleViewResult(item.id)}
                className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-4 flex items-center gap-4 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0 border border-white/10">
                  <Sparkles className="w-5 h-5 text-pink-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.title}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleHome}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          返回首页
        </button>
      </div>
    </div>
  );
}
