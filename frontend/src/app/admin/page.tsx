'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/entities/user/model/user.types';
import UserStatsWidget from '@/widgets/AdminDashboardWidgets/UserStatsWidget';
import FeedbackFeedWidget from '@/widgets/AdminDashboardWidgets/FeedbackFeedWidget';
import ComplaintFeedWidget from '@/widgets/AdminDashboardWidgets/ComplaintFeedWidget';
import { useQuery } from '@apollo/client';
import { GET_USER_STATS } from '@/entities/user/model/user.queries';
import { GET_FEEDBACK_COMPLAINTS } from '@/entities/feedback-complaint/model/feedback-complaint.queries';
import Spinner from '@/shared/ui/Spinner/Spinner';
import Image from 'next/image';
import { ICONS } from '@/shared/assets/Icons/icons'

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [activeHandbookSection, setActiveHandbookSection] = useState('mission');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { data: userStatsData, loading: userStatsLoading, error: userStatsError } = useQuery(GET_USER_STATS);
  const { data: complaintsData, loading: complaintsLoading, error: complaintsError } = useQuery(GET_FEEDBACK_COMPLAINTS);

  // Placeholder data for Feedback feed
  const feedbackItems = [
    { id: '1', user: 'User A', message: t('admin_dashboard.feedback_great_app'), timestamp: '2025-07-01T10:00:00Z', source: 'Google Play' },
    { id: '2', user: 'User B', message: t('admin_dashboard.feedback_needs_features'), timestamp: '2025-07-01T11:00:00Z', source: 'BrainMessenger Landing Page' },
  ];

  // Placeholder data for Complaint feed
  const complaintItems = complaintsData?.feedbackComplaints || [
    {
      id: 'c1',
      user: 'User A',
      reason: t('admin_dashboard.complaint_toxic_content'),
      timestamp: '2025-07-01T14:00:00Z',
      source: t('admin_dashboard.complaint_source_gmail'),
      message: {
        id: 'm1',
        author: 'User A',
        text: t('admin_dashboard.complaint_message_text_1'),
      },
      status: 'NEW',
    },
    {
      id: 'c2',
      user: 'User B',
      reason: t('admin_dashboard.complaint_spamming_users'),
      timestamp: '2025-07-01T15:00:00Z',
      source: t('admin_dashboard.complaint_source_in_app'),
      message: {
        id: 'm2',
        author: 'User B',
        text: t('admin_dashboard.complaint_message_text_2'),
      },
      status: 'IN_PROGRESS',
    },
  ];

  if (userStatsLoading || complaintsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a' }}>
        <Spinner className="lazy-loading-logo-container">
          <Image src="/images/logo.png" alt={t('admin_dashboard.logo_alt')} width={120} height={120} />
        </Spinner>
      </div>
    );
  }

  if (userStatsError || complaintsError) {
    return (
      <div className="admin-dashboard">
        <h1 className="admin-dashboard__header">{t('admin_dashboard.error_title')}</h1>
        <p>{t('admin_dashboard.error_loading_data')}</p>
        {userStatsError && <p>{t('admin_dashboard.user_stats_error')} {userStatsError.message}</p>}
        {complaintsError && <p>{t('admin_dashboard.complaints_error')} {complaintsError.message}</p>}
      </div>
    );
  }

  const userStats = userStatsData?.getUserStats || { totalUsers: 120, activeUsers: 10, newUsersToday: 4 };

  return (
    <div className="admin-panel-layout">
      {/* Main Content Area */}
      <main className="admin-panel-layout__main-content">
        {/* Header */}
        <header className="admin-panel-layout__header">
          <div className="header__search">
            <input type="text" placeholder={t('admin_dashboard.search_placeholder')} />
          </div>
          <div className="header__actions">
            <button onClick={() => setIsFocusMode(!isFocusMode)}><span><Image src={ICONS.foucsMode} alt={t('admin_dashboard.toggle_focus_mode_alt')} width={24} height={24}></Image></span></button>
            <button><span><Image src={ICONS.loop} alt={t('admin_dashboard.toggle_roles_alt')} width={24} height={24}></Image></span></button>
            <button><span><Image src={ICONS.night} alt={t('admin_dashboard.toggle_theme_alt')} width={24} height={24}></Image></span></button>
            <button><span><Image src={ICONS.globe} alt={t('admin_dashboard.toggle_language_alt')} width={24} height={24}></Image></span></button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className={`admin-dashboard ${isFocusMode ? 'admin-dashboard--focus-mode' : ''}`}>
          {!isFocusMode && (
            <div className="admin-dashboard__user-profile-section">
              <Image src="/images/default-avatar.png" alt={t('admin_dashboard.user_avatar_alt')} width={80} height={80} className="user-profile-section__avatar" />
              <span className="user-profile-section__name">Induktr</span> {/* Usernames are not translated */}
              <p className="user-profile-section__welcome-message">{t('admin_dashboard.welcome_message')}</p>
            </div>
          )}
          <h1 className="admin-dashboard__header">{t('admin_dashboard.dashboard_title')}</h1>
          <div className="admin-dashboard__grid">
            <UserStatsWidget
              totalUsers={userStats.totalUsers}
              activeUsers={userStats.activeUsers}
              newUsersToday={userStats.newUsersToday}
            />
            <FeedbackFeedWidget feedbackItems={feedbackItems} />
            <ComplaintFeedWidget complaintItems={complaintItems} />
          </div>

          {!isFocusMode && (
            <>
              {/* Moderator Handbook Section */}
              <div className="moderator-handbook admin-widget">
                <h2 className="admin-widget__title">{t('admin_dashboard.handbook_title')}</h2>
                <div className="handbook__tabs">
                  <button
                    className={`handbook__tab ${activeHandbookSection === 'mission' ? 'active' : ''}`}
                    onClick={() => setActiveHandbookSection('mission')}
                  >
                    {t('admin_dashboard.handbook_mission_tab')}
                  </button>
                  <button
                    className={`handbook__tab ${activeHandbookSection === 'responsibilities' ? 'active' : ''}`}
                    onClick={() => setActiveHandbookSection('responsibilities')}
                  >
                    {t('admin_dashboard.handbook_responsibilities_tab')}
                  </button>
                  <button
                    className={`handbook__tab ${activeHandbookSection === 'rules' ? 'active' : ''}`}
                    onClick={() => setActiveHandbookSection('rules')}
                  >
                    {t('admin_dashboard.handbook_rules_tab')}
                  </button>
                  <button
                    className={`handbook__tab ${activeHandbookSection === 'accountability' ? 'active' : ''}`}
                    onClick={() => setActiveHandbookSection('accountability')}
                  >
                    {t('admin_dashboard.handbook_accountability_tab')}
                  </button>
                </div>
                <div className="handbook__content">
                  {activeHandbookSection === 'mission' && (
                    <>
                      <h3>{t('admin_dashboard.mission_section_title')}</h3>
                      <p>{t('admin_dashboard.mission_description')}</p>
                      <h4>{t('admin_dashboard.core_principles_title')}</h4>
                      <ul>
                        <li>{t('admin_dashboard.fairness_principle')}</li>
                        <li>{t('admin_dashboard.accountability_principle')}</li>
                        <li>{t('admin_dashboard.empathy_principle')}</li>
                      </ul>
                    </>
                  )}
                  {activeHandbookSection === 'responsibilities' && (
                    <>
                      <h3>{t('admin_dashboard.responsibilities_section_title')}</h3>
                      <p>{t('admin_dashboard.responsibilities_description')}</p>
                      <ul>
                        <li>{t('admin_dashboard.responsibility_monitor_channels')}</li>
                        <li>{t('admin_dashboard.responsibility_respond_reports')}</li>
                        <li>{t('admin_dashboard.responsibility_enforce_guidelines')}</li>
                        <li>{t('admin_dashboard.responsibility_issue_bans')}</li>
                        <li>{t('admin_dashboard.responsibility_collaborate')}</li>
                      </ul>
                    </>
                  )}
                  {activeHandbookSection === 'rules' && (
                    <>
                      <h3>{t('admin_dashboard.rules_section_title')}</h3>
                      <p>{t('admin_dashboard.rules_description')}</p>
                      <ul>
                        <li>{t('admin_dashboard.rule_no_personal_attacks')}</li>
                        <li>{t('admin_dashboard.rule_no_hate_speech')}</li>
                        <li>{t('admin_dashboard.rule_no_spamming')}</li>
                        <li>{t('admin_dashboard.rule_no_illegal_content')}</li>
                        <li>{t('admin_dashboard.rule_respect_privacy')}</li>
                      </ul>
                    </>
                  )}
                  {activeHandbookSection === 'accountability' && (
                    <>
                      <h3>{t('admin_dashboard.accountability_section_title')}</h3>
                      <p>{t('admin_dashboard.accountability_description')}</p>
                      <ul>
                        <li>{t('admin_dashboard.accountability_transparent')}</li>
                        <li>{t('admin_dashboard.accountability_consistent')}</li>
                        <li>{t('admin_dashboard.accountability_documented')}</li>
                        <li>{t('admin_dashboard.accountability_reviewable')}</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Placeholder Cards at the Bottom */}
              <div className="admin-dashboard__bottom-grid">
                <div className="admin-widget placeholder-card"></div>
                <div className="admin-widget placeholder-card"></div>
                <div className="admin-widget placeholder-card"></div>
                <div className="admin-widget placeholder-card"></div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default withAuth(AdminDashboardPage, { requiredRoles: [UserRole.MODERATOR, UserRole.ADMIN] });