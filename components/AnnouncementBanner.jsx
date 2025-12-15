import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, X, ExternalLink } from 'lucide-react';

const AnnouncementBanner = ({ serviceType = 'profile', onNavigateToAnnouncements }) => {
    const [announcement, setAnnouncement] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLatestAnnouncement();
    }, [serviceType]);

    const fetchLatestAnnouncement = async () => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            
            // 最新の表示中のお知らせを1件取得
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .in('service_type', [serviceType, 'all'])
                .order('announcement_date', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 = データが見つからない（エラーではない）
                throw error;
            }

            if (data) {
                // ローカルストレージで閉じたお知らせを記録
                const dismissedId = localStorage.getItem('dismissed_announcement_id');
                if (dismissedId !== data.id) {
                    setAnnouncement(data);
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            }
        } catch (error) {
            console.error('お知らせ取得エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = () => {
        if (announcement) {
            // 閉じたお知らせのIDを記録
            localStorage.setItem('dismissed_announcement_id', announcement.id);
        }
        setIsVisible(false);
    };

    const handleClick = () => {
        if (announcement?.link_url) {
            window.open(announcement.link_url, '_blank', 'noopener,noreferrer');
        } else if (onNavigateToAnnouncements) {
            onNavigateToAnnouncements();
        }
    };

    // ローディング中、データなし、非表示の場合は何も表示しない
    if (isLoading || !announcement || !isVisible) {
        return null;
    }

    // 全サービス共通のお知らせは目立つ色にする
    const isGlobalAnnouncement = announcement.service_type === 'all';
    const bgColor = isGlobalAnnouncement 
        ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
        : 'bg-gradient-to-r from-indigo-600 to-blue-600';

    return (
        <div className={`${bgColor} text-white py-2 px-4 relative z-40 shadow-md`}>
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                {/* 左側: アイコン */}
                <div className="flex-shrink-0">
                    <Bell size={20} className="animate-pulse" />
                </div>

                {/* 中央: お知らせ内容 */}
                <div 
                    className="flex-1 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity min-w-0"
                    onClick={handleClick}
                >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isGlobalAnnouncement && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold flex-shrink-0">
                                重要
                            </span>
                        )}
                        <span className="font-bold text-sm md:text-base truncate">
                            {announcement.title}
                        </span>
                    </div>
                    {announcement.link_url && (
                        <ExternalLink size={16} className="flex-shrink-0" />
                    )}
                </div>

                {/* 右側: 閉じるボタン */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss();
                    }}
                    className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                    aria-label="閉じる"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default AnnouncementBanner;

