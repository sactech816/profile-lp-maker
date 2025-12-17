"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BusinessLPEditor from '@/components/BusinessLPEditor';
import { Loader2 } from 'lucide-react';

export default function NewBusinessLPPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      // ユーザーセッションの確認
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // 認証状態の変更を監視
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      setIsLoading(false);
    };

    init();
  }, []);

  const handleBack = () => {
    router.push('/business/dashboard');
  };

  const handleSave = (data: { slug: string; content: any[] }) => {
    // 保存後の処理（必要に応じて）
    console.log('ビジネスLP保存完了:', data);
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
          <p className="text-gray-600 mb-6">ビジネスLPを作成するにはログインしてください。</p>
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
    <BusinessLPEditor
      user={user}
      initialSlug={null}
      setShowAuth={(show: boolean) => {
        // ログイン画面の表示処理（必要に応じて実装）
        if (show) {
          router.push('/');
        }
      }}
      onBack={handleBack}
      onSave={handleSave}
    />
  );
}
