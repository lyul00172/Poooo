"use client";

import { useState, useEffect } from 'react';
import { Utensils, Send, MessageSquare, Clock, AlertCircle, Trash2, Lock } from 'lucide-react';

export default function Home() {
  const [menu, setMenu] = useState<string[]>([]);
  const [calories, setCalories] = useState<string>('');
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [mealError, setMealError] = useState<string | null>(null);

  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTodayKst = () => {
    const today = new Date();
    const kstDate = new Date(today.getTime() + 9 * 60 * 60 * 1000);
    return kstDate.toISOString().slice(0, 10).replace(/-/g, '');
  };

  const [currentDate] = useState(getTodayKst());

  const formatDisplayDate = (dateStr: string) => {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${month}월 ${day}일 (${days[date.getDay()]})`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/meals?date=${currentDate}`);
        const data = await res.json();
        if (res.ok) {
          if (data.menu && data.menu.length > 0) {
            setMenu(data.menu);
            setCalories(data.calories || '');
          } else {
            setMealError('오늘은 급식 정보가 없어요.');
          }
        } else {
          setMealError(data.error || '급식 정보를 불러오지 못했어요.');
        }
      } catch (err) {
        setMealError('네트워크 오류가 발생했어요.');
      } finally {
        setLoadingMeals(false);
      }

      fetchComments();
    };

    fetchData();
  }, [currentDate]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?date=${currentDate}`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments.reverse()); // Show newest first
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: currentDate,
          nickname: nickname.trim(),
          content: content.trim(),
          password: password,
        }),
      });

      if (res.ok) {
        setContent('');
        setPassword('');
        fetchComments();
      }
    } catch (err) {
      console.error('Submit error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const inputPassword = prompt('댓글을 삭제하려면 비밀번호를 입력하세요:');
    if (inputPassword === null) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password: inputPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchComments();
      } else {
        alert(data.error || '삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Delete error', err);
      alert('오류가 발생했습니다.');
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr + 'Z'); // Convert sqlite UTC string to Local
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    return '어제';
  };

  return (
    <main className="min-h-screen pb-24 px-4 pt-8 max-w-md mx-auto relative isolate sm:pt-12 transition-colors duration-500">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#38bdf8] to-[#2dd4bf] opacity-30 dark:opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>

      <header className="mb-8 text-center opacity-0 animate-spring-up">
        <div className="inline-flex items-center justify-center space-x-2 bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4 shadow-sm">
          <Utensils className="w-4 h-4" />
          <span>오늘의 급식</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl text-glow">
          {formatDisplayDate(currentDate)}
        </h1>
      </header>

      {/* Meal Card */}
      <section className="mb-10 opacity-0 animate-spring-up animation-delay-100">
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          {loadingMeals ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">급식을 불러오고 있어요...</p>
            </div>
          ) : mealError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-slate-400">
              <AlertCircle className="w-12 h-12 mb-3 text-slate-400 dark:text-slate-500" />
              <p className="font-medium text-lg">{mealError}</p>
            </div>
          ) : (
            <div className="relative z-10">
              <ul className="space-y-4">
                {menu.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-3 text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                    <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {calories && (
                <div className="mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-brand-600 dark:text-brand-400 font-semibold">
                  <span>총 칼로리</span>
                  <span>{calories}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Chat Section */}
      <section className="opacity-0 animate-spring-up animation-delay-200">
        <div className="flex items-center space-x-2 mb-6 px-1">
          <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">익명톡</h2>
          <span className="flex-1"></span>
          <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
            {comments.length}
          </span>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="glass-card rounded-2xl p-4 mb-6 shadow-sm focus-within:shadow-md transition-shadow duration-200">
          <div className="flex flex-col space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="flex-1 bg-transparent border-b border-slate-200 dark:border-slate-700/50 px-2 py-2 text-sm focus:outline-none focus:border-brand-500 dark:text-slate-200 transition-colors"
                maxLength={15}
              />
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700/50 px-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-20 bg-transparent py-2 text-sm focus:outline-none dark:text-slate-200 transition-colors"
                  maxLength={4}
                />
              </div>
            </div>
            <div className="flex items-end space-x-3 relative">
              <textarea
                placeholder="오늘 급식 어땠어?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-200 resize-none h-[52px] scrollbar-hide"
                maxLength={200}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="shrink-0 w-[52px] h-[52px] rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center hover:shadow-lg hover:shadow-brand-500/30 disabled:opacity-50 disabled:hover:shadow-none transition-all duration-200 active:scale-95"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {loadingComments ? (
            <div className="animate-pulse flex space-x-4 p-4">
              <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-10 w-10"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-500">
              <p>첫 번째 댓글을 남겨보세요.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {comment.nickname || '익명'}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {timeAgo(comment.created_at)}
                    </span>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
