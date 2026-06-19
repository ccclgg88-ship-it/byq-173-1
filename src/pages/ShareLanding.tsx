import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { assessmentApi, userApi } from '@/api/client';
import type { PersonaResult, User } from '../../shared/types';
import { THEMES } from '../../shared/types';
import { Sparkles, ArrowRight, User as UserIcon } from 'lucide-react';

export default function ShareLanding() {
  const { sharerId, assessmentId } = useParams<{ sharerId: string; assessmentId: string }>();
  const navigate = useNavigate();
  const setSharerInfo = useAppStore((s) => s.setSharerInfo);
  const clearAll = useAppStore((s) => s.clearAll);
  const currentUser = useAppStore((s) => s.currentUser);

  const [sharer, setSharer] = useState<User | null>(null);
  const [assessment, setAssessment] = useState<PersonaResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sharerId && assessmentId) {
      setSharerInfo({ sharerId, assessmentId });
    }
  }, [sharerId, assessmentId, setSharerInfo]);

  useEffect(() => {
    if (!sharerId || !assessmentId) return;

    const loadData = async () => {
      try {
        const [userData, assessmentData] = await Promise.all([
          userApi.get(sharerId),
          assessmentApi.get(assessmentId)
        ]);
        setSharer(userData);
        setAssessment(assessmentData);
      } catch (err) {
        console.error('加载分享数据失败:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sharerId, assessmentId]);

  const handleStart = () => {
    clearAll();
    if (sharerId && assessmentId) {
      setSharerInfo({ sharerId, assessmentId });
    }
    navigate('/');
  };

  const handleSameTheme = () => {
    if (!assessment) return;
    clearAll();
    if (sharerId && assessmentId) {
      setSharerInfo({ sharerId, assessmentId });
    }
    if (currentUser) {
      navigate(`/quiz?theme=${assessment.theme}`);
    } else {
      navigate(`/?redirect=quiz&theme=${assessment.theme}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm text-white/80">好友邀请你一起测</span>
          </div>
          <h1 className="text-3xl font-bold font-display">
            {sharer?.nickname} 的人格测评结果
          </h1>
          <p className="text-white/60">快来看看 TA 是什么样的人，也测测你自己吧！</p>
        </div>

        {sharer && (
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-2xl overflow-hidden">
              {sharer.avatar ? (
                <img src={sharer.avatar} alt={sharer.nickname} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <p className="font-bold text-lg">{sharer.nickname}</p>
              <p className="text-sm text-white/50">邀请你参与测评</p>
            </div>
          </div>
        )}

        {assessment && (
          <div className="glass-card p-6 space-y-4">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70">
                <span>{THEMES.find(t => t.id === assessment.theme)?.icon}</span>
                <span>{THEMES.find(t => t.id === assessment.theme)?.name}</span>
              </span>
            </div>

            <div className="text-center">
              <p className="text-sm text-white/50 mb-1">人格类型</p>
              <h2 className="text-2xl font-bold font-display bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                {assessment.title}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {assessment.tags.map((tag, idx) => (
                <span key={idx} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-white/70 text-sm leading-relaxed text-center">
              {assessment.description}
            </p>
          </div>
        )}

        {assessment && (
          <button
            onClick={handleSameTheme}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{
              background: THEMES.find(t => t.id === assessment.theme)?.coverGradient
            }}
          >
            <span>{THEMES.find(t => t.id === assessment.theme)?.icon}</span>
            <span>测同款主题 · {THEMES.find(t => t.id === assessment.theme)?.name}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        <button onClick={handleStart} className="btn-secondary w-full flex items-center justify-center gap-2">
          <span>我也要测</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-white/40 text-xs">
          完成测评后，你可以看到与好友的合拍指数
        </p>
      </div>
    </div>
  );
}
