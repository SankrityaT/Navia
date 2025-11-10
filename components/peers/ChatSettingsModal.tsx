'use client';

import { useState } from 'react';
import { X, UserX, Flag, Shield, Eye, EyeOff, User, Briefcase, MapPin, Heart } from 'lucide-react';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  peerName: string;
  connectionId: string;
  onRemoveConnection: () => void;
  onBlockUser: () => void;
  onReportUser: () => void;
}

export default function ChatSettingsModal({
  isOpen,
  onClose,
  peerName,
  connectionId,
  onRemoveConnection,
  onBlockUser,
  onReportUser,
}: ChatSettingsModalProps) {
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    revealName: false,
    showNeurotype: true,
    showStruggles: true,
    showCareer: false,
    showLocation: false,
    showInterests: true,
  });

  if (!isOpen) return null;

  const handleRevealName = async () => {
    // Call the reveal name API
    try {
      const response = await fetch('/api/peers/reveal-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      
      if (response.ok) {
        setPrivacySettings(prev => ({ ...prev, revealName: true }));
      }
    } catch (error) {
      console.error('Error revealing name:', error);
    }
  };

  const handleUpdatePrivacy = async () => {
    // TODO: Implement privacy settings API
    console.log('Updating privacy settings:', privacySettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--sand)] rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--sand)] border-b border-[var(--clay-300)]/30 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
            Chat Settings
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--charcoal)]/40 hover:text-[var(--charcoal)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Privacy Controls */}
          <div>
            <button
              onClick={() => setShowPrivacySettings(!showPrivacySettings)}
              className="w-full flex items-center justify-between p-4 bg-[var(--stone)] hover:bg-[var(--clay-100)] rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[var(--sage-600)]" />
                <span className="font-semibold text-[var(--charcoal)]">Privacy & Sharing</span>
              </div>
              <span className="text-sm text-[var(--charcoal)]/60">
                {showPrivacySettings ? 'Hide' : 'Show'}
              </span>
            </button>

            {showPrivacySettings && (
              <div className="mt-4 space-y-3 p-4 bg-[var(--cream)] rounded-xl border border-[var(--clay-300)]/30">
                <p className="text-sm text-[var(--charcoal)]/70 mb-4">
                  Control what {peerName} can see about you
                </p>

                {/* Reveal Name */}
                <div className="flex items-center justify-between p-3 bg-[var(--sand)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--clay-600)]" />
                    <span className="text-sm font-medium">Reveal Real Name</span>
                  </div>
                  <button
                    onClick={handleRevealName}
                    disabled={privacySettings.revealName}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      privacySettings.revealName
                        ? 'bg-[var(--sage-200)] text-[var(--sage-700)] cursor-not-allowed'
                        : 'bg-[var(--clay-500)] text-[var(--cream)] hover:bg-[var(--clay-600)]'
                    }`}
                  >
                    {privacySettings.revealName ? 'Revealed' : 'Reveal'}
                  </button>
                </div>

                {/* Show Neurotype */}
                <div className="flex items-center justify-between p-3 bg-[var(--sand)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[var(--sage-600)]" />
                    <span className="text-sm font-medium">Show Neurotype</span>
                  </div>
                  <button
                    onClick={() => setPrivacySettings(prev => ({ ...prev, showNeurotype: !prev.showNeurotype }))}
                    className={`w-12 h-6 rounded-full transition-all ${
                      privacySettings.showNeurotype ? 'bg-[var(--sage-500)]' : 'bg-[var(--clay-300)]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      privacySettings.showNeurotype ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Show Struggles */}
                <div className="flex items-center justify-between p-3 bg-[var(--sand)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[var(--clay-500)]" />
                    <span className="text-sm font-medium">Show Struggles</span>
                  </div>
                  <button
                    onClick={() => setPrivacySettings(prev => ({ ...prev, showStruggles: !prev.showStruggles }))}
                    className={`w-12 h-6 rounded-full transition-all ${
                      privacySettings.showStruggles ? 'bg-[var(--sage-500)]' : 'bg-[var(--clay-300)]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      privacySettings.showStruggles ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Show Career */}
                <div className="flex items-center justify-between p-3 bg-[var(--sand)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[var(--clay-600)]" />
                    <span className="text-sm font-medium">Show Career Field</span>
                  </div>
                  <button
                    onClick={() => setPrivacySettings(prev => ({ ...prev, showCareer: !prev.showCareer }))}
                    className={`w-12 h-6 rounded-full transition-all ${
                      privacySettings.showCareer ? 'bg-[var(--sage-500)]' : 'bg-[var(--clay-300)]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      privacySettings.showCareer ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {/* Show Location */}
                <div className="flex items-center justify-between p-3 bg-[var(--sand)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--clay-600)]" />
                    <span className="text-sm font-medium">Show Location</span>
                  </div>
                  <button
                    onClick={() => setPrivacySettings(prev => ({ ...prev, showLocation: !prev.showLocation }))}
                    className={`w-12 h-6 rounded-full transition-all ${
                      privacySettings.showLocation ? 'bg-[var(--sage-500)]' : 'bg-[var(--clay-300)]'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      privacySettings.showLocation ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <button
                  onClick={handleUpdatePrivacy}
                  className="w-full mt-4 px-4 py-2 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-xl font-semibold transition-all"
                >
                  Save Privacy Settings
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--clay-300)]/30" />

          {/* Danger Zone */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--charcoal)]/50 uppercase tracking-wide">
              Manage Connection
            </p>

            {/* Remove Connection */}
            <button
              onClick={() => {
                if (confirm(`Remove ${peerName} from your connections?`)) {
                  onRemoveConnection();
                  onClose();
                }
              }}
              className="w-full flex items-center gap-3 p-4 bg-[var(--stone)] hover:bg-[var(--clay-100)] rounded-xl transition-all text-left"
            >
              <UserX className="w-5 h-5 text-[var(--charcoal)]/60" />
              <div>
                <p className="font-semibold text-[var(--charcoal)]">Remove Connection</p>
                <p className="text-xs text-[var(--charcoal)]/60">End this accountability partnership</p>
              </div>
            </button>

            {/* Block User */}
            <button
              onClick={() => {
                if (confirm(`Block ${peerName}? They won't be able to contact you.`)) {
                  onBlockUser();
                  onClose();
                }
              }}
              className="w-full flex items-center gap-3 p-4 bg-[var(--stone)] hover:bg-red-50 rounded-xl transition-all text-left"
            >
              <EyeOff className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-600">Block User</p>
                <p className="text-xs text-[var(--charcoal)]/60">Prevent all future contact</p>
              </div>
            </button>

            {/* Report User */}
            <button
              onClick={() => {
                onReportUser();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-4 bg-[var(--stone)] hover:bg-red-50 rounded-xl transition-all text-left"
            >
              <Flag className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-600">Report User</p>
                <p className="text-xs text-[var(--charcoal)]/60">Report inappropriate behavior</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
