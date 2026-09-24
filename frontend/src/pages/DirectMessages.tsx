import React, { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { messagingService, ConversationItem, ConversationDetail } from '../services/messagingService';
import { useAuth } from '../context/AuthContext';

export const DirectMessages: React.FC = () => {
    useAuth();
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [activeDetail, setActiveDetail] = useState<ConversationDetail | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);

    const loadConversations = async () => {
        setLoadingConvs(true);
        try {
            const data = await messagingService.getConversations();
            setConversations(data);
            if (data.length > 0 && !activeConvId) {
                setActiveConvId(data[0].id);
            }
        } catch (err) {
            console.error("Failed to load conversations", err);
        } finally {
            setLoadingConvs(false);
        }
    };

    const loadMessages = async (convId: string) => {
        setLoadingMsgs(true);
        try {
            const detail = await messagingService.getConversationMessages(convId);
            setActiveDetail(detail);
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            setLoadingMsgs(false);
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (activeConvId) {
            loadMessages(activeConvId);
        }
    }, [activeConvId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeConvId || !messageInput.trim()) return;

        setSending(true);
        try {
            await messagingService.sendMessage({
                conversation_id: activeConvId,
                content: messageInput.trim()
            });
            setMessageInput('');
            await loadMessages(activeConvId);
            await loadConversations();
        } catch (err) {
            console.error("Error sending message", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <AppShell>
            <div className="w-full px-container-margin py-md max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high/40 flex-1 flex overflow-hidden">
                    {/* Left Conversations Sidebar */}
                    <div className="w-full md:w-80 border-r border-surface-container flex flex-col shrink-0">
                        <div className="p-md border-b border-surface-container flex items-center justify-between">
                            <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">chat_bubble</span>
                                Messages
                            </h2>
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-surface-container/60">
                            {loadingConvs ? (
                                <div className="p-md text-xs text-outline animate-pulse">Loading inbox...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-xl text-center flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-outline text-[32px]">mail_outline</span>
                                    <p className="text-xs font-bold text-on-surface">Your inbox is empty</p>
                                    <p className="text-[11px] text-on-surface-variant px-4">
                                        Connect with a mentor or student to start a 1-to-1 conversation.
                                    </p>
                                </div>
                            ) : (
                                conversations.map((conv) => {
                                    const isSelected = conv.id === activeConvId;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setActiveConvId(conv.id)}
                                            className={`p-md flex items-start gap-md text-left transition-colors ${
                                                isSelected ? 'bg-surface-container-low font-bold' : 'hover:bg-surface-container-low/50'
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm overflow-hidden shrink-0">
                                                {conv.other_user_avatar ? (
                                                    <img src={conv.other_user_avatar} alt={conv.other_user_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{conv.other_user_name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-xs text-on-surface truncate">{conv.other_user_name}</span>
                                                    {conv.unread_count > 0 && (
                                                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{conv.last_message}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Active Conversation Window */}
                    <div className="hidden md:flex flex-1 flex-col justify-between bg-surface-container-lowest">
                        {!activeConvId || !activeDetail ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center p-md">
                                <span className="material-symbols-outlined text-outline text-[48px]">chat</span>
                                <p className="text-sm font-bold text-on-surface">Select a conversation to message</p>
                            </div>
                        ) : (
                            <>
                                {/* Conversation Top Bar */}
                                <div className="p-md border-b border-surface-container flex items-center justify-between bg-surface-container-lowest">
                                    <div className="flex items-center gap-md">
                                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm overflow-hidden">
                                            {activeDetail.other_user_avatar ? (
                                                <img src={activeDetail.other_user_avatar} alt={activeDetail.other_user_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{activeDetail.other_user_name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-on-surface">{activeDetail.other_user_name}</span>
                                            <span className="text-[11px] text-on-surface-variant">{activeDetail.other_user_company || 'Mentor Bridge Member'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Message Stream */}
                                <div className="flex-1 p-md overflow-y-auto flex flex-col gap-sm bg-surface-container-low/20">
                                    {loadingMsgs ? (
                                        <div className="text-xs text-outline text-center py-4">Loading messages...</div>
                                    ) : activeDetail.messages.length === 0 ? (
                                        <div className="text-xs text-outline text-center py-8">No messages yet. Send a greeting!</div>
                                    ) : (
                                        activeDetail.messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col max-w-md ${msg.is_me ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                                            >
                                                <div
                                                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                                        msg.is_me
                                                            ? 'bg-primary text-on-primary rounded-br-none shadow-xs'
                                                            : 'bg-surface-container-lowest text-on-surface border border-surface-container rounded-bl-none shadow-xs'
                                                    }`}
                                                >
                                                    {msg.content}
                                                </div>
                                                <span className="text-[10px] text-outline mt-1 px-1">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Message Input Box */}
                                <form onSubmit={handleSendMessage} className="p-md border-t border-surface-container flex items-center gap-sm bg-surface-container-lowest">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 p-2.5 bg-surface-container-low text-xs rounded-xl focus:outline-none focus:bg-surface-container text-on-surface border border-surface-container"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !messageInput.trim()}
                                        className="px-md py-2 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary-container disabled:opacity-50 transition-colors shadow-xs"
                                    >
                                        Send
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
};

export default DirectMessages;
