import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, History, Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { userApi } from '@/api/client';

const AVATARS = ['🦊', '🐱', '🐶', '🐼', '🦄', '🐨', '🐯', '🦁', '🐸', '🐙', '🦋', '🌟'];

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAppStore();
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [avatar, setAvatar] = useState<string>(currentUser?.avatar || AVATARS[0]);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!nickname.trim()) return;
    setLoading(true);
    try {
      let user = currentUser;
      if (!user || user.nickname !== nickname.trim() || user.avatar !== avatar) {
        user = await userApi.create(nickname.trim(), avatar);
      }
      setCurrentUser(user);
      navigate('/quiz');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
      <div className="absolute top-[40%] right-[-15%] w-[28rem] h-[28rem] rounded-full bg-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="absolute top-[15%] left-[10%] w-16 h-16 rotate-45 bg-gradient-to-br from-indigo-400/30 to-purple-500/30 backdrop-blur-xl rounded-2xl animate-bounce" style={{ animationDuration: '6s' }} />
      <div className="absolute top-[60%] left-[5%] w-20 h-20 bg-gradient-to-br from-pink-400/20 to-rose-500/20 backdrop-blur-xl rounded-full animate-bounce" style={{ animationDuration: '8s', animationDelay: '0.5s' }} />
      <div className="absolute top-[25%] right-[8%] w-12 h-12 bg-gradient-to-br from-violet-400/30 to-fuchsia-500/30 backdrop-blur-xl rounded-3xl animate-bounce" style={{ animationDuration: '7s', animationDelay: '1s' }} />
      <div className="absolute bottom-[20%] right-[15%] w-14 h-14 rotate-12 bg-gradient-to-br from-blue-400/25 to-indigo-500/25 backdrop-blur-xl rounded-2xl animate-bounce" style={{ animationDuration: '9s', animationDelay: '1.5s' }} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-6">
            <Sparkles className="w-4 h-4 text-pink-300" />
            <span className="text-sm text-white/80">探索真实的自己</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            发现你的专属人设
          </h1>
          <p className="text-lg text-white/70 max-w-sm mx-auto">
            回答几个有趣的问题，解锁你意想不到的人格画像
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              你的昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称..."
              maxLength={20}
              className="input-field"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-3">
              选择头像
            </label>
            <div className="grid grid-cols-6 gap-3">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all duration-300 ${
                    avatar === emoji
                      ? 'bg-gradient-to-br from-indigo-500 to-pink-500 scale-110 shadow-lg shadow-indigo-500/40'
                      : 'bg-white/5 hover:bg-white/15 border border-white/10 hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !nickname.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                开始测评
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
          >
            <History className="w-4 h-4" />
            查看我的记录
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
