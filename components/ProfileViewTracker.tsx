'use client';

import { useEffect, useRef } from 'react';
import { saveAnalytics } from '@/app/actions/analytics';

export function ProfileViewTracker({ profileId }: { profileId: string }) {
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const scrollTrackedRef = useRef<Set<number>>(new Set());
  const readTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!profileId) return;

    // ページビューを記録
    saveAnalytics(profileId, 'view');

    // スクロール深度を追跡
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollDepth);

      // 25%, 50%, 75%, 100%のマイルストーンを記録
      [25, 50, 75, 100].forEach(milestone => {
        if (scrollDepth >= milestone && !scrollTrackedRef.current.has(milestone)) {
          scrollTrackedRef.current.add(milestone);
          saveAnalytics(profileId, 'scroll', { scrollDepth: milestone });
        }
      });
    };

    // 精読率を計算（スクロール深度50%以上で精読とみなす）
    const checkReadRate = () => {
      if (!readTrackedRef.current && maxScrollRef.current >= 50) {
        readTrackedRef.current = true;
        saveAnalytics(profileId, 'read', { readPercentage: maxScrollRef.current });
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // 定期的にスクロール深度をチェック
    const scrollInterval = setInterval(() => {
      handleScroll();
      checkReadRate();
    }, 1000);

    // ページ離脱時に滞在時間と最終スクロール深度を記録
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        saveAnalytics(profileId, 'time', { timeSpent });
      }
      if (maxScrollRef.current > 0) {
        saveAnalytics(profileId, 'scroll', { scrollDepth: maxScrollRef.current });
      }
    };

    // 定期的に滞在時間を記録（30秒ごと）
    const timeInterval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        saveAnalytics(profileId, 'time', { timeSpent });
      }
    }, 30000);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      clearInterval(scrollInterval);
      clearInterval(timeInterval);
      
      // クリーンアップ時に最終データを記録
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        saveAnalytics(profileId, 'time', { timeSpent });
      }
      if (maxScrollRef.current > 0) {
        saveAnalytics(profileId, 'scroll', { scrollDepth: maxScrollRef.current });
      }
    };
  }, [profileId]);

  return null;
}

