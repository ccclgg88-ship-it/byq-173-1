import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pairApi } from '@/api/client';
import { useAppStore } from '@/store/useAppStore';
import type { PairTaskDetail } from '../../shared/types';
import { User as UserIcon, ArrowRight, Heart, Loader2, Check } from 'lucide-react';

const AVATAR_OPTIONS = ['🦊', '🐼', '🦁', '🐯', '🐸', '🐵', '🦄', '🐙', '🦋', '🌸'];

export default function PairJoin() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAppStore();

  const [task, setTask] = useState<PairTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [useExistingIdentity, setUseExistingIdentity] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!taskId) return;

    const loadTask = async () => {
      try {
        const data = await pairApi.getTask(taskId);
        setTask(data);
      } catch (err) {
        console.error('获取任务失败:', err);
        setError('获取邀请信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  useEffect(() => {
    if (currentUser) {
      setUseExistingIdentity(true);
      setNickname(currentUser.nickname);
      setSelectedAvatar(currentUser.avatar || null);
    }
  }, [currentUser]);

  const handleSubmit = async () => {
    if (!taskId || !nickname.trim()) {
      setError('请输入昵称');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const userId = useExistingIdentity && currentUser ? currentUser.id : undefined;
      const result = await pairApi.join(
        taskId,
        nickname.trim(),
        selectedAvatar || undefined,
        userId
      );

      if (useExistingIdentity && currentUser) {
        setCurrentUser({
          ...currentUser,
          nickname: nickname.trim(),
          avatar: selectedAvatar || currentUser.avatar
        });
      } else if (result.isNewUser) {
        const newUser = {
          id: result.partnerId,
          nickname: nickname.trim(),
          avatar: selectedAvatar || '',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(newUser);
      }

      navigate(`/pair/result/${taskId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加入失败，请重试';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/60">{error || '邀请不存在或已过期'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-sm text-white/80">合拍邀请</span>
          </div>
          <h1 className="text-3xl font-bold font-display">
            {task.inviter.nickname} 邀请你合拍
          </h1>
          <p className="text-white/60">完成测评，看看你们的合拍指数有多高！</p>
        </div>

        <div className="glass-card p-6 flex items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-4xl overflow-hidden">
            {task.inviter.avatar && /^[a-zA-Z0-9_/:.]/.test(task.inviter.avatar) ? (
              <img src={task.inviter.avatar} alt={task.inviter.nickname} className="w-full h-full object-cover" />
            ) : task.inviter.avatar ? (
              <span>{task.inviter.avatar}</span>
            ) : (
              <UserIcon className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <p className="text-sm text-white/50 mb-1">发起者</p>
            <p className="text-xl font-bold">{task.inviter.nickname}</p>
          </div>
        </div>

        {currentUser && (
          <div className="glass-card p-4">
            <button
              onClick={() => setUseExistingIdentity(!useExistingIdentity)}
              className="w-full flex items-center gap-3"
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                useExistingIdentity
                  ? 'bg-gradient-to-br from-indigo-500 to-pink-500 border-transparent'
                  : 'border-white/30'
              }`}>
                {useExistingIdentity && <Check className="w-4 h-4 text-white" />}
              </div>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-lg">
                  {currentUser.avatar}
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{currentUser.nickname}</p>
                  <p className="text-xs text-white/50">使用我的现有身份</p>
                </div>
              </div>
            </button>
          </div>
        )}

        <div className="glass-card p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              {useExistingIdentity ? '我的昵称' : '你的昵称'}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入一个有趣的昵称"
              className="input-field"
              maxLength={20}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">选择头像</label>
            <div className="grid grid-cols-5 gap-3">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedAvatar(selectedAvatar === emoji ? null : emoji)}
                  className={`w-full aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-200 ${
                    selectedAvatar === emoji
                      ? 'bg-gradient-to-br from-indigo-500/50 to-pink-500/50 border-2 border-white/50 scale-110'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !nickname.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>加入中...</span>
              </>
            ) : (
              <>
                <span>{useExistingIdentity ? '使用此身份加入' : '加入合拍'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-white/40 text-xs">
          加入后将自动生成你们的合拍报告
        </p>
      </div>
    </div>
  );
}
