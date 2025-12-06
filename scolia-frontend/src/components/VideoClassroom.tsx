import React, { useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface VideoClassroomProps {
    user: {
        nom: string;
        prenom: string;
        email: string;
    };
    roomName: string; // Ex: "Cours-Maths-6emeA"
}

export const VideoClassroom: React.FC<VideoClassroomProps> = ({ user, roomName }) => {
    const [loading, setLoading] = useState(true);

    return (
        <div style={{ height: '700px', width: '100%', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#f0f2f5', color: '#666' }}>
                    <p>Chargement de la salle de classe virtuelle...</p>
                </div>
            )}

            <JitsiMeeting
                domain="meet.jit.si"
                roomName={roomName}
                configOverwrite={{
                    startWithAudioMuted: true,
                    disableThirdPartyRequests: true,
                    prejoinPageEnabled: false, 
                    toolbarButtons: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                }}
                interfaceConfigOverwrite={{
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: '#0A2240', 
                    TOOLBAR_ALWAYS_VISIBLE: true,
                }}
                userInfo={{
                    displayName: `${user.prenom} ${user.nom}`,
                    email: user.email 
                }}
                onApiReady={() => {
                    setLoading(false);
                }}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                }}
            />
        </div>
    );
};
