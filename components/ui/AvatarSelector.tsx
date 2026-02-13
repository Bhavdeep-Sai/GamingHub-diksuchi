import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Special avatar types with negative IDs
export const AVATAR_TYPE_GOOGLE = 'google';
export const AVATAR_TYPE_INITIALS = 'initials';

interface AvatarOption {
  id: string;
  name: string;
  url: string;
  category?: string;
  isPremium: boolean;
}

export const getAvatarUrl = (avatarId: string | number, size = 200) => {
    // If it's already a URL, return it
    if (typeof avatarId === 'string' && avatarId.startsWith('http')) {
        return avatarId;
    }
    
    // For backward compatibility with old numeric IDs
    if (typeof avatarId === 'number' || (typeof avatarId === 'string' && !isNaN(Number(avatarId)))) {
        // Return a default dicebear avatar based on the ID
        return `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarId}&size=${size}`;
    }
    
    // For MongoDB ObjectId strings (avatars from database)
    // This will be the avatar ID, but we need to get the URL from the avatar object
    // This is a fallback - the actual URL should come from the avatar object
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarId}&size=${size}`;
};

// Fallback avatar URL
export const getFallbackAvatarUrl = (avatarId = 1, size = 200) => {
    return `https://ui-avatars.com/api/?name=Avatar&size=${size}&background=6366f1&color=fff&bold=true`;
};

interface AvatarSelectorProps {
    currentAvatar?: number | string;
    onSelect?: (avatarId: number | string) => void;
    className?: string;
    googleProfilePic?: string | null;
    userInitials?: string;
    userName?: string;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
    currentAvatar = 1, 
    onSelect, 
    className,
    googleProfilePic,
    userInitials,
    userName
}) => {
    const [avatars, setAvatars] = useState<AvatarOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAvatars() {
            try {
                const response = await fetch('/api/avatars');
                const data = await response.json();
                setAvatars(data.avatars || []);
            } catch (error) {
                console.error('Error fetching avatars:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAvatars();
    }, []);

    console.log('AvatarSelector received props:', { 
        currentAvatar, 
        googleProfilePic, 
        userInitials, 
        userName,
        hasGooglePic: !!googleProfilePic 
    });

    const handleAvatarClick = (avatarId: number | string) => {
        if (onSelect) {
            onSelect(avatarId);
        }
    };

    // Determine if current avatar is a special type
    const isGoogleSelected = currentAvatar === AVATAR_TYPE_GOOGLE || 
        (typeof currentAvatar === 'string' && currentAvatar.startsWith('http'));
    const isInitialsSelected = currentAvatar === AVATAR_TYPE_INITIALS;

    return (
        <div className={cn("space-y-2.5", className)}>
            <div className="text-sm font-semibold text-foreground">
                Choose Your Avatar
            </div>
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2">
                {/* Google Profile Picture Option */}
                {googleProfilePic && (
                    <button
                        onClick={() => handleAvatarClick(AVATAR_TYPE_GOOGLE)}
                        className={cn(
                            "w-full relative group rounded-lg p-2.5 transition-all duration-200 border-2 flex items-center space-x-3",
                            isGoogleSelected
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-border hover:border-primary/50 hover:shadow-sm"
                        )}
                        title="Google Profile Picture"
                    >
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-muted/50 shrink-0">
                            <img
                                src={googleProfilePic}
                                alt="Google Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">Google Profile Picture</div>
                            <div className="text-xs text-muted-foreground">Use your Google account photo</div>
                        </div>
                        {isGoogleSelected && (
                            <div className="bg-primary rounded-full p-1 shadow-md shrink-0">
                                <Check size={14} className="text-white" />
                            </div>
                        )}
                    </button>
                )}

                {/* First Letter Avatar Option */}
                {userInitials && (
                    <button
                        onClick={() => handleAvatarClick(AVATAR_TYPE_INITIALS)}
                        className={cn(
                            "w-full relative group rounded-lg p-2.5 transition-all duration-200 border-2 flex items-center space-x-3",
                            isInitialsSelected
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-border hover:border-primary/50 hover:shadow-sm"
                        )}
                        title="First Letter Avatar"
                    >
                        <div className="w-11 h-11 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-lg">{userInitials}</span>
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground">First Letter Avatar</div>
                            <div className="text-xs text-muted-foreground truncate">{userName ? `${userName}'s initials` : 'Use your initials'}</div>
                        </div>
                        {isInitialsSelected && (
                            <div className="bg-primary rounded-full p-1 shadow-md shrink-0">
                                <Check size={14} className="text-white" />
                            </div>
                        )}
                    </button>
                )}

                {/* Divider if special avatars exist */}
                {(googleProfilePic || userInitials) && (
                    <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground font-medium">Or choose an avatar</span>
                        </div>
                    </div>
                )}

                {/* DiceBear Avatars Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-muted-foreground">Loading avatars...</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-2.5">
                        {avatars.map(avatar => {
                            const isSelected = currentAvatar === avatar.id;
                            return (
                                <button
                                    key={avatar.id}
                                    onClick={() => handleAvatarClick(avatar.id)}
                                    className={cn(
                                        "relative group rounded-lg p-1.5 transition-all duration-200 border-2",
                                        isSelected
                                            ? "border-primary bg-primary/10 shadow-md"
                                            : "border-border hover:border-primary/50 hover:shadow-sm"
                                    )}
                                    title={avatar.name}
                                >
                                    <div className="aspect-square rounded-md overflow-hidden bg-muted/50">
                                        <img
                                            src={avatar.url}
                                            alt={avatar.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = getFallbackAvatarUrl(1, 120);
                                            }}
                                        />
                                    </div>
                                    {isSelected && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-primary rounded-full p-0.5 shadow-md">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                    {avatar.isPremium && (
                                        <div className="absolute top-0 left-0 bg-yellow-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-br">
                                            PRO
                                        </div>
                                    )}
                                    <div className="text-[10px] text-center mt-1 text-muted-foreground group-hover:text-primary truncate leading-tight">
                                        {avatar.name}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvatarSelector;