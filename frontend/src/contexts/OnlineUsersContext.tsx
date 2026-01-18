import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type OnlineUser = {
    id: string; // auth id
    profile_id: string;
    nombre_completo: string;
    rol: string;
    online_at: string;
};

type OnlineUsersContextType = {
    onlineUsers: OnlineUser[];
    usersCount: number;
};

const OnlineUsersContext = createContext<OnlineUsersContextType | undefined>(undefined);

export function OnlineUsersProvider({ children }: { children: React.ReactNode }) {
    const { user, profile } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

    useEffect(() => {
        if (!user || !profile) return;

        const channel = supabase.channel('online_users');

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState<OnlineUser>();
                // Flatten the presence state (list of lists) into a single list
                const users: OnlineUser[] = [];
                Object.values(newState).forEach(presences => {
                    presences.forEach(presence => {
                        users.push(presence);
                    });
                });

                // Deduplicate by ID (just in case of multiple tabs, we want unique users, OR stick to multiple sessions)
                // Ususally presence shows every connection. Let's keep distinct users.
                const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());

                setOnlineUsers(uniqueUsers);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        id: user.id,
                        profile_id: profile.id,
                        nombre_completo: profile.nombre_completo,
                        rol: profile.rol,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, profile]);

    return (
        <OnlineUsersContext.Provider value={{ onlineUsers, usersCount: onlineUsers.length }}>
            {children}
        </OnlineUsersContext.Provider>
    );
}

export function useOnlineUsers() {
    const context = useContext(OnlineUsersContext);
    if (context === undefined) {
        throw new Error('useOnlineUsers must be used within an OnlineUsersProvider');
    }
    return context;
}
