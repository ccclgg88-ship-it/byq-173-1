import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Loader2, Sparkles } from 'lucide-react';
import type { QuizQuestion, ThemeId } from '../../shared/types';
import { THEMES } from '../../shared/types';
import { useAppStore } from '@/store/useAppStore';
import { assessmentApi } from '@/api/client';

export default function Quiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, setCurrentAssessment } = useAppStore();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const themeParam = searchParams.get('theme') as ThemeId | null;
  const theme: ThemeId = THEMES.some((t) => t.id === themeParam) ? themeParam! : 'social';
  const themeInfo = THEMES.find((t) => t.id === theme)!;

  useEffect(() => {
    if (!currentUser || !themeParam) {
      navigate('/');
      return;
    }
    loadQuestions();
  }, [currentUser, navigate, theme]);

  const loadQuestions = async () => {
    try {
      const data = await assessmentApi.getQuestions(theme);
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isTransitioning || submitting) return;
    setSelectedOption(index);
    setIsTransitioning(true);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setIsTransitioning(false);
      } else {
        handleSubmit();
      }
    }, 600);
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const result = await assessmentApi.create(currentUser.id, theme);
      setCurrentAssessment(result);
      navigate(`/result/${result.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <p className="text-white/70">加载题目中...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="glass-card p-8 text-center max-w-sm">
          <p className="text-white/70 mb-4">暂无题目</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 rounded-full bg-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 min-h-screen flex flex-col px-5 py-8">
        <div className="w-full max-w-lg mx-auto mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">{themeInfo.icon}</span>
              <span className="text-sm font-medium text-white/90">{themeInfo.name}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/70">
                第 {currentIndex + 1} / {questions.length} 题
              </span>
              <span className="text-sm font-medium text-pink-300">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #6366F1 0%, #EC4899 100%)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center w-full max-w-lg mx-auto">
          <div
            className={`glass-card-strong p-8 w-full transition-all duration-500 ${
              isTransitioning ? 'opacity-0 translate-x-12 scale-95' : 'opacity-100 translate-x-0 scale-100'
            }`}
            style={{ animation: isTransitioning ? 'none' : 'slideIn 0.5s ease-out' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white/60">问题 {currentIndex + 1}</span>
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  disabled={isTransitioning || submitting}
                  className={`w-full p-5 rounded-2xl text-left transition-all duration-300 flex items-center justify-between gap-4 ${
                    selectedOption === index
                      ? 'bg-gradient-to-r from-indigo-500/40 to-pink-500/40 border-2 border-white/40 scale-[1.02] shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 hover:scale-[1.01]'
                  } ${isTransitioning || submitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                        selectedOption === index
                          ? 'bg-gradient-to-br from-indigo-400 to-pink-400 text-white'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-white font-medium">{option}</span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-all duration-300 ${
                      selectedOption === index ? 'text-pink-300 translate-x-1' : 'text-white/30'
                    }`}
                  />
                </button>
              ))}
            </div>

            {submitting && (
              <div className="mt-8 flex items-center justify-center gap-3 text-white/70">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>正在生成你的人设画像...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
