"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BusinessDashboard from '@/components/BusinessDashboard';
import { ADMIN_EMAIL } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      // ユーザーセッションの確認
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsAdmin(session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

      // 認証状態の変更を監視
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        setIsAdmin(session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
      });

      setIsLoading(false);
    };

    init();
  }, []);

  const handleEdit = (project: { slug: string }) => {
    router.push(`/business/dashboard/editor/${project.slug}`);
  };

  const handleDelete = async (id: string, refetch?: () => Promise<void>) => {
    if (!confirm('本当に削除しますか？')) return;
    if (!supabase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      // 未ログインユーザーの場合は匿名IDを使用
      const anonymousId = localStorage.getItem('anonymous_user_id');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/business-delete', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id, anonymousId }),
      });
      
      let result: any = {};
      try {
        const text = await res.text();
        if (text) {
          result = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('JSON解析エラー:', parseError);
      }
      
      if (!res.ok) {
        throw new Error(result?.error || '削除に失敗しました');
      }

      alert('削除しました');
      // 可能なら一覧を再取得（フォールバックとしてリロード）
      if (refetch && typeof refetch === 'function') {
        await refetch();
      } else {
        window.location.reload();
      }
    } catch (e: any) {
      alert('削除エラー: ' + e.message);
    }
  };

  const handleCreate = (project?: { slug: string }) => {
    if (project?.slug) {
      router.push(`/business/dashboard/editor/${project.slug}`);
    } else {
      router.push('/business/dashboard/editor/new');
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('ログアウトエラー:', error);
        throw error;
      }
      setUser(null);
      alert('ログアウトしました');
      router.push('/');
    } catch (e: any) {
      console.error('ログアウトに失敗:', e);
      alert('ログアウトに失敗しました: ' + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-indigo-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold">読み込み中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">ビジネスLPダッシュボードを利用するにはログインしてください。</p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <BusinessDashboard
      user={user}
      isAdmin={isAdmin}
      setPage={(p: string) => {
        if (p === 'business/dashboard') {
          router.push('/business/dashboard');
        } else {
          router.push(`/${p}`);
        }
      }}
      onLogout={handleLogout}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
    />
  );
}

