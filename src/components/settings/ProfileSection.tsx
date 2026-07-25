// src/components/settings/ProfileSection.tsx
import React, {useEffect, useState} from 'react';
import {supabase} from '../../lib/supabase';
import type {User} from '@supabase/supabase-js';

interface ProfileSectionProps {
    user: User;
}

export function ProfileSection({user}: ProfileSectionProps) {
    // 状态管理
    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
    const [sex, setSex] = useState(user?.user_metadata?.sex || 'unspecified');
    const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
    const [hobby, setHobby] = useState(user?.user_metadata?.hobby || '');
    const [address, setAddress] = useState(user?.user_metadata?.address || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');

    // UI 反馈状态
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [message, setMessage] = useState({text: '', type: ''});

    // 1. 页面加载时：抓取 profiles 表里的完整数据
    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            if (!user?.id) return;
            const {data, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!error && data && isMounted) {
                if (data.display_name) setDisplayName(data.display_name);
                if (data.sex) setSex(data.sex);
                if (data.phone) setPhone(data.phone);
                if (data.hobby) setHobby(data.hobby);
                if (data.address) setAddress(data.address);
                if (data.avatar_url) setAvatarUrl(data.avatar_url);
            }
        };
        fetchProfile();
        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    // 2. 头像图片上传处理
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setMessage({text: '', type: ''});
            setIsUploadingAvatar(true);

            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}-${Math.random()}.${fileExt}`;

            // 上传到 Supabase Storage 的 'avatars' 桶
            const {error: uploadError} = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 获取图片的公开访问链接 (Public URL)
            const {data} = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const newAvatarUrl = data.publicUrl;
            setAvatarUrl(newAvatarUrl);

            // 顺便立即写入数据库
            await supabase.from('profiles').upsert({id: user.id, avatar_url: newAvatarUrl});
            await supabase.auth.updateUser({data: {avatar_url: newAvatarUrl}});

            setMessage({text: 'Avatar uploaded successfully!', type: 'success'});
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            setMessage({text: error?.message || 'Error uploading avatar.', type: 'error'});
        } finally {
            setIsUploadingAvatar(false);
            setTimeout(() => setMessage({text: '', type: ''}), 3000);
        }
    };

    // 3. 保存所有个人信息
    const handleSave = async () => {
        setIsSaving(true);
        setMessage({text: '', type: ''});

        try {
            const profileData = {
                id: user.id,
                email: user.email,
                display_name: displayName,
                sex: sex,
                phone: phone,
                hobby: hobby,
                address: address,
                avatar_url: avatarUrl
            };

            // 第一步：写入 profiles 表
            const {error: profileError} = await supabase
                .from('profiles')
                .upsert(profileData);

            if (profileError) throw new Error(`Database error: ${profileError.message}`);

            // 第二步：同步到 auth 用户的 metadata
            const {error: authError} = await supabase.auth.updateUser({
                data: profileData
            });

            if (authError) throw authError;

            setMessage({text: 'Profile updated successfully!', type: 'success'});
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setMessage({text: error?.message || 'Failed to update profile.', type: 'error'});
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({text: '', type: ''}), 3000);
        }
    };

    return (
        <section className="bg-[var(--color-card)] border border-[var(--color-line)] rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-[var(--color-ink)] border-b border-[var(--color-line)] pb-4">
                Personal Information
            </h2>

            <div className="flex flex-col gap-6">
                {/* 顶部：头像区域 */}
                <div className="flex items-center gap-5 pb-4 border-b border-[var(--color-line)]/50">
                    <div
                        className="relative w-20 h-20 rounded-full overflow-hidden bg-[var(--color-bg2)] border-2 border-[var(--color-line)] flex items-center justify-center shrink-0 shadow-inner">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                        ) : (
                            // 默认头像图标
                            <svg className="w-10 h-10 text-[var(--color-muted)]" fill="currentColor"
                                 viewBox="0 0 24 24">
                                <path
                                    d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[var(--color-ink)]">
                            Profile Picture
                        </label>
                        <p className="text-xs text-[var(--color-muted)]">
                            PNG, JPG or GIF up to 5MB.
                        </p>
                        <div className="mt-1">
                            <label
                                className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-[var(--color-line)] rounded-md text-xs font-medium text-[var(--color-ink)] bg-[var(--color-bg)] hover:bg-[var(--color-bg2)] transition-colors shadow-sm">
                                <span>{isUploadingAvatar ? 'Uploading...' : 'Upload new avatar'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={isUploadingAvatar}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* 1. Email (独占一行) */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                        Email Address
                    </label>
                    <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="p-2.5 rounded-lg bg-[var(--color-bg2)] border border-[var(--color-line)] text-[var(--color-muted)] cursor-not-allowed outline-none text-sm"
                    />
                </div>

                {/* 2. 短字段并排网格 (2 Columns Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Display Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] text-[var(--color-ink)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                            placeholder="e.g. Dreamer"
                        />
                    </div>

                    {/* Sex */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                            Sex
                        </label>
                        <select
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                            className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] text-[var(--color-ink)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                        >
                            <option value="unspecified">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] text-[var(--color-ink)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                            placeholder="+1 (234) 567-890"
                        />
                    </div>

                    {/* Hobby */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                            Hobby / Interest
                        </label>
                        <input
                            type="text"
                            value={hobby}
                            onChange={(e) => setHobby(e.target.value)}
                            className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] text-[var(--color-ink)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                            placeholder="e.g. Sci-Fi, Coding, Reading"
                        />
                    </div>
                </div>

                {/* 3. Address (稍长的字段，独占一行) */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                        Address / Location
                    </label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-line)] text-[var(--color-ink)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
                        placeholder="e.g. Seattle, WA"
                    />
                </div>

                {/* 底部：操作按钮与提示消息 */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-line)] mt-2">
                    <span
                        className={`text-sm font-medium ${message.type === 'error' ? 'text-[#ef4444]' : 'text-[var(--color-primary)]'}`}>
                        {message.text}
                    </span>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || isUploadingAvatar}
                        className="px-6 py-2.5 bg-[var(--color-primary-solid)] text-[var(--color-on-primary)] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm text-sm"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </section>
    );
}