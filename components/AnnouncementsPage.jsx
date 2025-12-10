import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAIL } from '../lib/constants';
import Header from './Header';
import Footer from './Footer';
import { Bell, Plus, Edit2, Trash2, ExternalLink, Calendar, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Filter } from 'lucide-react';

const AnnouncementsPage = ({ onBack, isAdmin, setPage, user, onLogout, setShowAuth, serviceType = 'profile' }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [formData, setFormData] = useState({
        service_type: serviceType,
        title: '',
        content: '',
        link_url: '',
        link_text: '',
        is_active: true,
        announcement_date: new Date().toISOString().split('T')[0]
    });
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const serviceName = serviceType === 'quiz' ? '診断クイズメーカー' : 'プロフィールLPメーカー';
        document.title = `お知らせ | ${serviceName}`;
        fetchAnnouncements();
        
        // ページ訪問時刻を記録（未読バッジ用）
        if (!isAdmin) {
            localStorage.setItem(`lastAnnouncementVisit_${serviceType}`, new Date().toISOString());
        }
    }, [isAdmin, serviceType]);

    const fetchAnnouncements = async () => {
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            let query = supabase
                .from('announcements')
                .select('*')
                .order('announcement_date', { ascending: false });

            // サービスタイプでフィルタリング（現在のサービス または 全サービス共通）
            if (!isAdmin) {
                query = query
                    .eq('is_active', true)
                    .in('service_type', [serviceType, 'all']);
            } else {
                // 管理者は全て表示するが、現在のサービスと全サービス共通を優先表示
                query = query.in('service_type', [serviceType, 'all']);
            }

            const { data, error } = await query;

            if (error) throw error;

            setAnnouncements(data || []);
        } catch (error) {
            console.error('お知らせ取得エラー:', error);
            setMessage({ type: 'error', text: 'お知らせの取得に失敗しました' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            setMessage({ type: 'error', text: 'タイトルと本文は必須です' });
            return;
        }

        try {
            setIsSaving(true);
            setMessage({ type: '', text: '' });

            const payload = {
                service_type: formData.service_type,
                title: formData.title.trim(),
                content: formData.content.trim(),
                link_url: formData.link_url.trim() || null,
                link_text: formData.link_text.trim() || null,
                is_active: formData.is_active,
                announcement_date: formData.announcement_date
            };

            let result;
            if (editingAnnouncement) {
                // 更新
                result = await supabase
                    .from('announcements')
                    .update(payload)
                    .eq('id', editingAnnouncement.id)
                    .select();
            } else {
                // 新規作成
                result = await supabase
                    .from('announcements')
                    .insert([payload])
                    .select();
            }

            if (result.error) throw result.error;

            setMessage({ 
                type: 'success', 
                text: editingAnnouncement ? 'お知らせを更新しました' : 'お知らせを作成しました' 
            });

            // フォームをリセット
            setFormData({
                service_type: serviceType,
                title: '',
                content: '',
                link_url: '',
                link_text: '',
                is_active: true,
                announcement_date: new Date().toISOString().split('T')[0]
            });
            setEditingAnnouncement(null);
            setShowEditor(false);

            // リストを再取得
            await fetchAnnouncements();

            // 成功メッセージを3秒後に消す
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);

        } catch (error) {
            console.error('保存エラー:', error);
            setMessage({ type: 'error', text: '保存に失敗しました: ' + error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            service_type: announcement.service_type,
            title: announcement.title,
            content: announcement.content,
            link_url: announcement.link_url || '',
            link_text: announcement.link_text || '',
            is_active: announcement.is_active,
            announcement_date: announcement.announcement_date
        });
        setShowEditor(true);
        setMessage({ type: '', text: '' });
    };

    const handleDelete = async (id) => {
        if (!confirm('このお知らせを削除しますか？')) return;

        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'お知らせを削除しました' });
            await fetchAnnouncements();

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('削除エラー:', error);
            setMessage({ type: 'error', text: '削除に失敗しました: ' + error.message });
        }
    };

    const handleCancelEdit = () => {
        setShowEditor(false);
        setEditingAnnouncement(null);
        setFormData({
            service_type: serviceType,
            title: '',
            content: '',
            link_url: '',
            link_text: '',
            is_active: true,
            announcement_date: new Date().toISOString().split('T')[0]
        });
        setMessage({ type: '', text: '' });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header 
                setPage={setPage} 
                user={user} 
                onLogout={onLogout} 
                setShowAuth={setShowAuth} 
            />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Bell className="text-indigo-600" size={32} />
                        <h1 className="text-3xl font-bold text-gray-800">お知らせ</h1>
                    </div>
                    {isAdmin && !showEditor && (
                        <button
                            onClick={() => setShowEditor(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                        >
                            <Plus size={20} />
                            新規作成
                        </button>
                    )}
                </div>

                {/* メッセージ表示 */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        message.type === 'success' 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {message.type === 'success' ? (
                            <CheckCircle size={20} />
                        ) : (
                            <AlertCircle size={20} />
                        )}
                        <span className="font-medium">{message.text}</span>
                    </div>
                )}

                {/* 編集フォーム（管理者のみ） */}
                {isAdmin && showEditor && (
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            {editingAnnouncement ? 'お知らせを編集' : '新しいお知らせを作成'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    サービス区分 <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.service_type}
                                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    <option value="profile">プロフィールLPメーカー</option>
                                    <option value="quiz">診断クイズメーカー</option>
                                    <option value="all">全サービス共通</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    「全サービス共通」を選択すると、全てのサービスでお知らせが表示されます
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    タイトル <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="お知らせのタイトル"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    本文 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
                                    placeholder="お知らせの本文"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        リンクURL（任意）
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.link_url}
                                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        リンクテキスト（任意）
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.link_text}
                                        onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="詳細はこちら"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        お知らせ日付
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.announcement_date}
                                        onChange={(e) => setFormData({ ...formData, announcement_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        表示状態
                                    </label>
                                    <div className="flex items-center gap-4 h-10">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="is_active"
                                                checked={formData.is_active === true}
                                                onChange={() => setFormData({ ...formData, is_active: true })}
                                                className="w-4 h-4 text-indigo-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Eye size={16} /> 表示中
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="is_active"
                                                checked={formData.is_active === false}
                                                onChange={() => setFormData({ ...formData, is_active: false })}
                                                className="w-4 h-4 text-gray-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <EyeOff size={16} /> 非表示
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            保存中...
                                        </>
                                    ) : (
                                        editingAnnouncement ? '更新する' : '作成する'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-bold text-gray-700"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* お知らせリスト */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <Bell className="mx-auto mb-4 text-gray-300" size={48} />
                            <p className="text-gray-500 font-medium">
                                {isAdmin ? 'お知らせがまだありません。新規作成ボタンから追加してください。' : '現在、お知らせはありません。'}
                            </p>
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                                    announcement.is_active ? 'border-indigo-500' : 'border-gray-300'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            {announcement.service_type === 'all' && (
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">
                                                    全サービス共通
                                                </span>
                                            )}
                                            {announcement.service_type === 'quiz' && isAdmin && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                                                    診断クイズ
                                                </span>
                                            )}
                                            {announcement.service_type === 'profile' && isAdmin && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                                                    プロフィールLP
                                                </span>
                                            )}
                                            {!announcement.is_active && isAdmin && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold flex items-center gap-1">
                                                    <EyeOff size={12} /> 非表示
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={14} />
                                                <span>{formatDate(announcement.announcement_date)}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {announcement.title}
                                        </h3>
                                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                                            {announcement.content}
                                        </p>
                                        {announcement.link_url && (
                                            <a
                                                href={announcement.link_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 mt-4 text-indigo-600 hover:text-indigo-700 font-bold"
                                            >
                                                {announcement.link_text || '詳細を見る'}
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(announcement)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="編集"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(announcement.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="削除"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Footer 
                setPage={setPage} 
                onCreate={() => setPage('profile-editor')} 
                user={user} 
                setShowAuth={setShowAuth} 
            />
        </div>
    );
};

export default AnnouncementsPage;



