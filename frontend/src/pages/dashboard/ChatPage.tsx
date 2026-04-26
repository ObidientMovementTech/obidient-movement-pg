import { useState } from 'react';
import { Box } from '@mui/material';
import { MessageSquare, Users } from 'lucide-react';
import { useUser } from '../../context/UserContext';

import type { ChatTab, ProfileInfo } from './chat/types';
import { FONT, PRIMARY, PRIMARY_LIGHT, SURFACE_LOW } from './chat/types';
import { useDirectMessages } from './chat/hooks/useDirectMessages';
import { useCommunityRooms } from './chat/hooks/useCommunityRooms';

import ConversationList from './chat/components/ConversationList';
import ConversationChat from './chat/components/ConversationChat';
import ContactsDialog from './chat/components/ContactsDialog';
import RoomList from './chat/components/RoomList';
import RoomChat from './chat/components/RoomChat';
import ProfileModal from './chat/components/ProfileModal';

export default function ChatPage() {
  const { profile } = useUser();
  const [activeTab, setActiveTab] = useState<ChatTab>('messages');
  const [profileModalUser, setProfileModalUser] = useState<ProfileInfo | null>(null);

  const dm = useDirectMessages();
  const rooms = useCommunityRooms(activeTab === 'community');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: { xs: 'calc(100vh - 150px)', md: 'calc(100vh - 180px)' },
        bgcolor: '#fff',
        borderRadius: { md: 3 },
        overflow: 'hidden',
        boxShadow: { md: '0 1px 4px rgba(0,0,0,0.06)' },
      }}
    >
      {/* Tab Bar */}
      <Box
        sx={{
          display: 'flex',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          bgcolor: '#fff',
        }}
      >
        {(['messages', 'community'] as ChatTab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <Box
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                flex: 1,
                py: 1.5,
                textAlign: 'center',
                cursor: 'pointer',
                fontFamily: FONT,
                fontWeight: active ? 700 : 500,
                fontSize: '0.88rem',
                color: active ? PRIMARY : '#6f7a70',
                borderBottom: active ? `3px solid ${PRIMARY}` : '3px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                '&:hover': { color: PRIMARY, bgcolor: PRIMARY_LIGHT },
              }}
            >
              {tab === 'messages' ? (
                <MessageSquare size={16} style={active ? { fill: PRIMARY, opacity: 0.15 } : undefined} />
              ) : (
                <Users size={16} style={active ? { fill: PRIMARY, opacity: 0.15 } : undefined} />
              )}
              {tab === 'messages' ? 'Messages' : 'Community'}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Messages Tab ── */}
        {activeTab === 'messages' && (
          <>
            <Box
              sx={{
                width: { xs: '100%', md: 360 },
                flexShrink: 0,
                display: { xs: dm.mobileShowChat ? 'none' : 'flex', md: 'flex' },
                flexDirection: 'column',
                borderRight: { md: '1px solid rgba(0,0,0,0.06)' },
                bgcolor: '#fff',
              }}
            >
              <ConversationList
                conversations={dm.conversations}
                loading={dm.loadingConvos}
                activeConvId={dm.activeConvId}
                search={dm.search}
                onSearchChange={dm.setSearch}
                onSelect={dm.selectConversation}
                onNewChat={dm.openContactsDialog}
                isConnected={dm.isConnected}
                onlineUsers={dm.onlineUsers}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: { xs: dm.mobileShowChat ? 'flex' : 'none', md: 'flex' },
                flexDirection: 'column',
                bgcolor: SURFACE_LOW,
              }}
            >
              <ConversationChat
                conversation={dm.activeConversation}
                messages={dm.messages}
                loadingMessages={dm.loadingMessages}
                hasMore={dm.hasMoreMessages}
                messageInput={dm.messageInput}
                sending={dm.sending}
                typingText={dm.typingText}
                onlineUsers={dm.onlineUsers}
                profileId={dm.profileId}
                onBack={dm.goBackToList}
                onSend={dm.handleSend}
                onInputChange={dm.setMessageInput}
                onLoadMore={dm.handleLoadMore}
                onProfileClick={setProfileModalUser}
                replyingTo={dm.replyingTo}
                onReply={dm.handleReply}
                onCancelReply={dm.cancelReply}
                onReact={dm.handleToggleReaction}
                onDelete={dm.handleDeleteMessage}
              />
            </Box>

            <ContactsDialog
              open={dm.showContacts}
              onClose={dm.closeContactsDialog}
              loading={dm.loadingContacts}
              coordinators={dm.contacts.coordinators}
              subordinates={dm.contacts.subordinates}
              onSelect={dm.startConversation}
            />
          </>
        )}

        {/* ── Community Tab ── */}
        {activeTab === 'community' && (
          <>
            <Box
              sx={{
                width: { xs: '100%', md: 360 },
                flexShrink: 0,
                display: { xs: rooms.mobileShowRoom ? 'none' : 'flex', md: 'flex' },
                flexDirection: 'column',
                borderRight: { md: '1px solid rgba(0,0,0,0.06)' },
                bgcolor: '#fff',
              }}
            >
              <RoomList
                rooms={rooms.rooms}
                loading={rooms.loadingRooms}
                activeRoomId={rooms.activeRoomId}
                isConnected={rooms.isConnected}
                onSelect={rooms.selectRoom}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: { xs: rooms.mobileShowRoom ? 'flex' : 'none', md: 'flex' },
                flexDirection: 'column',
                bgcolor: SURFACE_LOW,
              }}
            >
              <RoomChat
                room={rooms.activeRoom}
                messages={rooms.roomMessages}
                loadingMessages={rooms.loadingRoomMsgs}
                hasMore={rooms.hasMoreRoomMsgs}
                roomInput={rooms.roomInput}
                sendingRoom={rooms.sendingRoom}
                roomSendError={rooms.roomSendError}
                myRoomRole={rooms.myRoomRole}
                profileId={rooms.profileId}
                contextMenu={rooms.contextMenu}
                onBack={rooms.goBackToRoomList}
                onSend={rooms.handleSendRoomMsg}
                onInputChange={rooms.setRoomInput}
                onLoadMore={rooms.handleLoadMore}
                onProfileClick={setProfileModalUser}
                onCleanup={rooms.handleCleanupRoom}
                onContextMenu={rooms.setContextMenu}
                onDeleteMsg={rooms.handleDeleteMsg}
                onPinMsg={rooms.handlePinMsg}
                onMuteUser={rooms.handleMuteUser}
                onBanUser={rooms.handleBanUser}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Profile Modal (shared) */}
      {profileModalUser && (
        <ProfileModal
          user={profileModalUser}
          currentUserId={profile?._id}
          onClose={() => setProfileModalUser(null)}
          onStartConversation={(userId) => {
            setActiveTab('messages');
            dm.startConversation(userId);
          }}
        />
      )}
    </Box>
  );
}
