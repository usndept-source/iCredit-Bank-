import React, { useState, useEffect, useRef } from 'react';
import { 
    MenuIcon, LogoutIcon, BellIcon, CogIcon, QuestionMarkCircleIcon, GlobeAmericasIcon
} from './Icons.tsx';
import { Notification, View, UserProfile } from '../types.ts';
import { MegaMenu } from './MegaMenu.tsx';
import { NotificationsPanel } from './NotificationsPanel.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { ProfileDropdown } from './ProfileDropdown.tsx';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  onNotificationClick: (view: View) => void;
  userProfile: UserProfile;
  onOpenLanguageSelector: () => void;
  onUpdateProfilePicture: (url: string) => void;
  onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
  onOpenWireTransfer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen, activeView, setActiveView, onLogout, notifications, onMarkNotificationsAsRead, onNotificationClick, userProfile, onOpenLanguageSelector, onUpdateProfilePicture, onOpenSendMoneyFlow, onOpenWireTransfer }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
      setShowNotifications(prev => !prev);
      if (!showNotifications) {
          onMarkNotificationsAsRead();
      }
  }

  const useOutsideAlerter = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
  }

  useOutsideAlerter(notificationsRef, () => setShowNotifications(false));
  useOutsideAlerter(profileDropdownRef, () => setIsProfileDropdownOpen(false));

  const handleProfileNavigate = (view: View) => {
      setActiveView(view);
      setIsProfileDropdownOpen(false);
  }

  const handleProfileLogout = () => {
      onLogout();
      setIsProfileDropdownOpen(false);
  }

  const iconButtonClasses = "p-2 rounded-full text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors";

  return (
    <>
      <header className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-30 shadow-lg border-b border-slate-200 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                {/* Left side: Menu and Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuToggle}
                        className={iconButtonClasses}
                        aria-label="Open menu"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white hidden sm:block truncate">{t(`header_title_${activeView}`)}</h1>
                </div>
                
                {/* Right side actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onOpenLanguageSelector}
                        className={iconButtonClasses}
                        aria-label="Select language"
                    >
                        <GlobeAmericasIcon className="w-6 h-6" />
                    </button>
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={toggleNotifications}
                            className={iconButtonClasses}
                            aria-label="View notifications"
                        >
                            <BellIcon className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && <NotificationsPanel notifications={notifications} onClose={() => setShowNotifications(false)} onNotificationClick={onNotificationClick} />}
                    </div>
                    <div className="relative" ref={profileDropdownRef}>
                        <button 
                            onClick={() => setIsProfileDropdownOpen(prev => !prev)} 
                            className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-primary"
                            aria-label="Open user menu"
                            aria-haspopup="true"
                            aria-expanded={isProfileDropdownOpen}
                            id="user-menu-button"
                        >
                            <img src={userProfile.profilePictureUrl} alt="User Profile" className="w-10 h-10 rounded-full object-cover" />
                        </button>

                        {isProfileDropdownOpen && (
                            <ProfileDropdown 
                                userProfile={userProfile}
                                onNavigate={handleProfileNavigate}
                                onLogout={handleProfileLogout}
                                onUpdateProfilePicture={onUpdateProfilePicture}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
      </header>
      <MegaMenu
        isOpen={isMenuOpen}
        onClose={onMenuToggle}
        activeView={activeView}
        setActiveView={setActiveView}
        userProfile={userProfile}
        onOpenSendMoneyFlow={onOpenSendMoneyFlow}
        onOpenWireTransfer={onOpenWireTransfer}
      />
    </>
  );
};