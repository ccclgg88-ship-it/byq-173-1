import { useNavigate } from 'react-router-dom';
import { THEMES } from '../../shared/types';
import type { ThemeId } from '../../shared/types';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';

export default function ThemeSelect() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);

  const handleSelectTheme = (themeId: ThemeId) => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    navigate(`/quiz?theme=${themeId}`);
  };

  return (
    <div className="min-h-screen px-5 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        <h1 className="text-xl font-bold text-white">选择测评主题</h1>
      </div>

      <p className="text-white/60 mb-8 text-base leading-relaxed">
        不同场景，不同的你。选择一个你最好奇的维度，测出专属人设。
      </p>

      <div className="space-y-4">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelectTheme(theme.id)}
            className="w-full text-left glass-card p-5 hover:bg-white/[0.12] transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: theme.coverGradient }}
              >
                {theme.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-white">{theme.name}</h3>
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {theme.estimatedMinutes}分钟
                  </span>
                </div>
                <p className="text-white/50 text-sm truncate">{theme.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-white/30 text-xs">每个主题都有独立的题库和人设称号池</p>
        <p className="text-white/30 text-xs mt-1">同一用户在不同主题下会测出截然不同的人设</p>
      </div>
    </div>
  );
}
