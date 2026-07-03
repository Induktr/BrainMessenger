'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import withAuth from '@/features/auth-options-roles/ui/withAuth';
import { UserRole } from '@/entities/user/model/user.types';
import UserStatsWidget from '@/widgets/AdminDashboardWidgets/UserStatsWidget';
import FeedbackFeedWidget from '@/widgets/AdminDashboardWidgets/FeedbackFeedWidget';
import ComplaintFeedWidget from '@/widgets/AdminDashboardWidgets/ComplaintFeedWidget';
import { useQuery } from '@apollo/client/react';
import { GET_USER_STATS } from '@/entities/user/model/user.queries';
import { GET_FEEDBACK_COMPLAINTS } from '@/entities/feedback-complaint/model/feedback-complaint.queries';
import Spinner from '@/shared/ui/Spinner/Spinner';
import Image from 'next/image';
import { IMAGES } from '@/shared/assets/Images/images'
import { Loop, Night, Globe, FocusMode } from '@/shared/assets/Icons/icons';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [activeHandbookSection, setActiveHandbookSection] = useState('mission');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { data: userStatsData, loading: userStatsLoading, error: userStatsError } = useQuery(GET_USER_STATS);
  const { data: complaintsData, loading: complaintsLoading, error: complaintsError } = useQuery(GET_FEEDBACK_COMPLAINTS);

  const feedbackItems = [
    { id: '1', user: 'User A', message: t('admin_dashboard.feedback_great_app'), timestamp: '2025-07-01T10:00:00Z', source: 'Google Play' },
    { id: '2', user: 'User B', message: t('admin_dashboard.feedback_needs_features'), timestamp: '2025-07-01T11:00:00Z', source: 'BrainMessenger Landing Page' },
  ];
  
  const complaintItems = complaintsData?.feedbackComplaints ?? [
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

  if (userStatsLoading ?? complaintsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner className="w-16 h-16 text-accent">
          <Image src={IMAGES.logoBrainMessenger} alt={t('admin_dashboard.logo_alt')} width={120} height={120} />
        </Spinner>
      </div>
    );
  }

  if (userStatsError ?? complaintsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary p-4">
        <h1 className="text-3xl font-bold mb-4">{t('admin_dashboard.error_title')}</h1>
        <p className="text-lg mb-4">{t('admin_dashboard.error_loading_data')}</p>
        {userStatsError && <p className="text-danger text-sm">{t('admin_dashboard.user_stats_error')} {userStatsError.message}</p>}
        {complaintsError && <p className="text-danger text-sm">{t('admin_dashboard.complaints_error')} {complaintsError.message}</p>}
      </div>
    );
  }

  const userStats = userStatsData?.getUserStats ?? { totalUsers: 120, activeUsers: 10, newUsersToday: 4 };

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      {/* Main Content Area */}
      <main className="flex-1 p-4">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border mb-6">
          <div className="flex-1 mr-4">
            <input type="text" placeholder={t('admin_dashboard.search_placeholder')} className="w-full p-2 bg-input-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="flex space-x-4">
            <button onClick={() => setIsFocusMode(!isFocusMode)} className="p-2 rounded-full hover:bg-surface transition-colors duration-200">
              <FocusMode alt={t('admin_dashboard.toggle_focus_mode_alt')} className="w-6 h-6 text-text-primary" />
            </button>
            <button className="p-2 rounded-full hover:bg-surface transition-colors duration-200">
              <Loop alt={t('admin_dashboard.toggle_roles_alt')} className="w-6 h-6 text-text-primary" />
            </button>
            <button className="p-2 rounded-full hover:bg-surface transition-colors duration-200">
              <Night alt={t('admin_dashboard.toggle_theme_alt')} className="w-6 h-6 text-text-primary" />
            </button>
            <button className="p-2 rounded-full hover:bg-surface transition-colors duration-200">
              <Globe alt={t('admin_dashboard.toggle_language_alt')} className="w-6 h-6 text-text-primary" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className={`p-4 ${isFocusMode ? 'max-w-full' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
          {!isFocusMode && (
            <div className="flex flex-col items-center p-6 bg-surface rounded-lg shadow-md mb-6">
              <Image src="/images/default-avatar.png" alt={t('admin_dashboard.user_avatar_alt')} width={80} height={80} className="rounded-full mb-4" />
              <span className="text-xl font-semibold text-text-primary mb-2">Induktr</span> {/* Usernames are not translated */}
              <p className="text-text-secondary text-center">{t('admin_dashboard.welcome_message')}</p>
            </div>
          )}
          <h1 className="text-3xl font-bold text-text-primary mb-6">{t('admin_dashboard.dashboard_title')}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
              <div className="bg-surface rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">{t('admin_dashboard.handbook_title')}</h2>
                <div className="flex space-x-4 mb-4 border-b border-border">
                  <button
                    className={`py-2 px-4 text-text-secondary hover:text-text-primary border-b-2 border-transparent ${activeHandbookSection === 'mission' ? 'border-accent text-text-primary' : ''} transition-colors duration-200`}
                    onClick={() => setActiveHandbookSection('mission')}
                  >
                    {t('admin_dashboard.handbook_mission_tab')}
                  </button>
                  <button
                    className={`py-2 px-4 text-text-secondary hover:text-text-primary border-b-2 border-transparent ${activeHandbookSection === 'responsibilities' ? 'border-accent text-text-primary' : ''} transition-colors duration-200`}
                    onClick={() => setActiveHandbookSection('responsibilities')}
                  >
                    {t('admin_dashboard.handbook_responsibilities_tab')}
                  </button>
                  <button
                    className={`py-2 px-4 text-text-secondary hover:text-text-primary border-b-2 border-transparent ${activeHandbookSection === 'rules' ? 'border-accent text-text-primary' : ''} transition-colors duration-200`}
                    onClick={() => setActiveHandbookSection('rules')}
                  >
                    {t('admin_dashboard.handbook_rules_tab')}
                  </button>
                  <button
                    className={`py-2 px-4 text-text-secondary hover:text-text-primary border-b-2 border-transparent ${activeHandbookSection === 'accountability' ? 'border-accent text-text-primary' : ''} transition-colors duration-200`}
                    onClick={() => setActiveHandbookSection('accountability')}
                  >
                    {t('admin_dashboard.handbook_accountability_tab')}
                  </button>
                </div>
                <div className="text-text-secondary">
                  {activeHandbookSection === 'mission' && (
                    <>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">{t('admin_dashboard.mission_section_title')}</h3>
                      <p className="mb-4">{t('admin_dashboard.mission_description')}</p>
                      <h4 className="text-lg font-semibold text-text-primary mb-2">{t('admin_dashboard.core_principles_title')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t('admin_dashboard.fairness_principle')}</li>
                        <li>{t('admin_dashboard.accountability_principle')}</li>
                        <li>{t('admin_dashboard.empathy_principle')}</li>
                      </ul>
                    </>
                  )}
                  {activeHandbookSection === 'responsibilities' && (
                    <>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">{t('admin_dashboard.responsibilities_section_title')}</h3>
                      <p className="mb-4">{t('admin_dashboard.responsibilities_description')}</p>
                      <ul className="list-disc list-inside space-y-1">
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
                      <h3 className="text-xl font-semibold text-text-primary mb-2">{t('admin_dashboard.rules_section_title')}</h3>
                      <p className="mb-4">{t('admin_dashboard.rules_description')}</p>
                      <ul className="list-disc list-inside space-y-1">
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
                      <h3 className="text-xl font-semibold text-text-primary mb-2">{t('admin_dashboard.accountability_section_title')}</h3>
                      <p className="mb-4">{t('admin_dashboard.accountability_description')}</p>
                      <ul className="list-disc list-inside space-y-1">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface rounded-lg shadow-md h-32"></div>
                <div className="bg-surface rounded-lg shadow-md h-32"></div>
                <div className="bg-surface rounded-lg shadow-md h-32"></div>
                <div className="bg-surface rounded-lg shadow-md h-32"></div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default withAuth(AdminDashboardPage, { requiredRoles: [UserRole.MODERATOR, UserRole.ADMIN] });