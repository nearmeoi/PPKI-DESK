import { useState, useEffect, useMemo } from 'react';
import type { CardItem, ColumnId, BoardFilter, ActivityLog, ProjectItem, AppView } from './types';
import { storage } from './lib/storage';
import { generateId } from './lib/utils';
import { sanitizeInput } from './lib/security';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { NavigationMenu } from './components/NavigationMenu';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { TimelineView } from './components/TimelineView';
import { ProjectsView } from './components/ProjectsView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { MeetingSummaryModal } from './components/MeetingSummaryModal';
import { SpotlightSearch } from './components/SpotlightSearch';
import { CardModal } from './components/CardModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';
import { ToastContainer } from './components/ToastContainer';

export const AppContent: React.FC = () => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { toast } = useToast();

  // Navigation view state: 'kanban' | 'timeline' | 'projects' | 'profile'
  const [currentView, setCurrentView] = useState<AppView>('kanban');

  // Initialize storage once
  useEffect(() => {
    storage.init();
  }, []);

  // State
  const [cards, setCards] = useState<CardItem[]>(() => storage.getCards());
  const [projects, setProjects] = useState<ProjectItem[]>(() => storage.getProjects());
  const [activities, setActivities] = useState<ActivityLog[]>(() => storage.getActivities());

  const [filters, setFilters] = useState<BoardFilter>({
    searchQuery: '',
    assignedToUserId: 'all',
    selectedLabel: 'all',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<ColumnId>('todo');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Live Team Notification Broadcast Simulation
  const handleSimulateTeamActivity = () => {
    const simulationEvents = [
      { task: 'implementasi', status: 'review', user: 'aldy' },
      { task: 'skema database', status: 'in progress', user: 'dwitra' },
      { task: 'desain pastel', status: 'done', user: 'kurni' },
      { task: 'audit keamanan', status: 'review', user: 'satria' },
    ];
    const event = simulationEvents[Math.floor(Math.random() * simulationEvents.length)];
    const userObj = storage.getUsers().find((u) => u.name.toLowerCase() === event.user.toLowerCase());
    if (userObj) {
      const updated = storage.addActivity(cards[0]?.id || 'c-1', userObj, `memindahkan tugas ke ${event.status}`);
      setActivities(updated);
      toast(`${event.task} - ${event.status} - ${event.user}`, 'activity');
    }
  };

  // Sync cards changes to storage
  useEffect(() => {
    storage.saveCards(cards);
  }, [cards]);

  // Sync projects changes to storage
  useEffect(() => {
    storage.saveProjects(projects);
  }, [projects]);

  // Calculate timeline count
  const timelineCount = useMemo(() => {
    const cardDeadlines = cards.filter((c) => c.deadline).length;
    const projectMilestones = projects.reduce(
      (acc, prj) => acc + prj.milestones.filter((m) => m.dueDate).length,
      0
    );
    return cardDeadlines + projectMilestones;
  }, [cards, projects]);

  // If user is not authenticated, render Login Page
  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  // Log activity helper
  const handleLogActivity = (cardId: string, action: string) => {
    const updated = storage.addActivity(cardId, currentUser, action);
    setActivities(updated);
  };

  // Open modal to create card
  const handleOpenAddCard = (columnId: ColumnId = 'todo') => {
    setEditingCard(null);
    setDefaultColumnId(columnId);
    setIsCardModalOpen(true);
  };

  // Open modal to view/edit card
  const handleCardClick = (card: CardItem) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  // Save Card (Create or Update)
  const handleSaveCard = (cardData: Partial<CardItem>) => {
    const sanitizedTitle = cardData.title ? sanitizeInput(cardData.title) : '';
    const sanitizedDescription = cardData.description ? sanitizeInput(cardData.description) : '';

    if (editingCard) {
      if (!storage.canModify(editingCard, currentUser)) {
        toast('Hanya pembuat atau admin yang dapat mengubah kartu ini.', 'error');
        return;
      }

      const updatedCards = cards.map((c) =>
        c.id === editingCard.id
          ? {
              ...c,
              ...cardData,
              title: sanitizedTitle || c.title,
              description: sanitizedDescription,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      setCards(updatedCards);
      handleLogActivity(editingCard.id, 'memperbarui detail kartu');
      const colLabel = editingCard.columnId === 'in_progress' ? 'in progress' : editingCard.columnId;
      toast(`${(sanitizedTitle || editingCard.title).slice(0, 16).toLowerCase()} - ${colLabel} - ${currentUser.name.toLowerCase()}`);
    } else {
      const col = cardData.columnId || defaultColumnId;
      const newCard: CardItem = {
        id: generateId('c'),
        columnId: col,
        title: sanitizedTitle || 'Tugas Baru',
        description: sanitizedDescription,
        assignedTo: cardData.assignedTo || [],
        createdBy: currentUser.id,
        deadline: cardData.deadline,
        labels: cardData.labels || [],
        priority: cardData.priority || 'medium',
        orderIndex: cards.filter((c) => c.columnId === col).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedCards = [newCard, ...cards];
      setCards(updatedCards);
      handleLogActivity(newCard.id, 'membuat tugas baru');
      const colLabel = col === 'in_progress' ? 'in progress' : col;
      toast(`${(sanitizedTitle || 'tugas baru').slice(0, 16).toLowerCase()} - ${colLabel} - ${currentUser.name.toLowerCase()}`);
    }

    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    const target = cards.find((c) => c.id === cardId);
    if (!target) return;

    if (!storage.canModify(target, currentUser)) {
      toast('Hanya pembuat atau admin yang dapat menghapus kartu ini.', 'error');
      return;
    }

    const updated = cards.filter((c) => c.id !== cardId);
    setCards(updated);
    setIsCardModalOpen(false);
    setEditingCard(null);
    toast(`${target.title.slice(0, 16).toLowerCase()} - dihapus - ${currentUser.name.toLowerCase()}`, 'info');
  };

  // Project Handlers
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleSelectProject = (project: ProjectItem) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (projectData: Partial<ProjectItem>) => {
    const sanitizedTitle = projectData.title ? sanitizeInput(projectData.title) : '';
    const sanitizedDesc = projectData.description ? sanitizeInput(projectData.description) : '';

    if (editingProject) {
      const updated = storage.updateProject(editingProject.id, {
        ...projectData,
        title: sanitizedTitle || editingProject.title,
        description: sanitizedDesc,
      });
      setProjects(updated);
      toast('Data proyek berhasil diperbarui.');
    } else {
      const created = storage.addProject({
        title: sanitizedTitle || 'Proyek Baru PPKI',
        code: projectData.code || `PRJ-0${projects.length + 1}`,
        description: sanitizedDesc,
        status: projectData.status || 'in_progress',
        progress: projectData.progress || 0,
        startDate: projectData.startDate || new Date().toISOString().split('T')[0],
        targetDate: projectData.targetDate || new Date().toISOString().split('T')[0],
        leaderId: projectData.leaderId || currentUser.id,
        teamMembers: projectData.teamMembers || [currentUser.id],
        tags: projectData.tags || ['PPKI'],
        milestones: projectData.milestones || [],
        notes: projectData.notes || '',
      });
      setProjects([created, ...projects]);
      toast('Proyek baru berhasil direncanakan.');
    }
  };

  const handleDeleteProject = (projectId: string) => {
    const updated = storage.deleteProject(projectId);
    setProjects(updated);
    setIsProjectModalOpen(false);
    setEditingProject(null);
    toast('Proyek berhasil dihapus.', 'info');
  };

  // If in dedicated Profile view
  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800 antialiased selection:bg-indigo-600 selection:text-white">
        <div className="w-full max-w-xl min-h-screen bg-white border-x border-slate-200/90 flex flex-col shadow-xl relative">
          <ProfilePage
            cards={cards}
            onBackToBoard={() => setCurrentView('kanban')}
          />
          <ToastContainer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-slate-800 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Centered Mobile-First App Container (Dominant Clean White) */}
      <div className="w-full max-w-xl min-h-screen bg-white border-x border-slate-200/90 flex flex-col shadow-xl relative">
        {/* App Top Header */}
        <Header
          onOpenAdminUsers={() => setIsAdminUsersOpen(true)}
          onOpenAccount={() => setCurrentView('profile')}
          onQuickAdd={() => handleOpenAddCard('todo')}
          onOpenSpotlight={() => setIsSpotlightOpen(true)}
          onOpenSummary={() => setIsSummaryModalOpen(true)}
          onSimulateTeamActivity={handleSimulateTeamActivity}
          activities={activities}
        />

        {/* Main Workspace Navigation Menu (Papan Tugas, Jadwal Timeline, Proyek) */}
        <NavigationMenu
          currentView={currentView}
          onViewChange={setCurrentView}
          cardsCount={cards.length}
          projectsCount={projects.length}
          timelineCount={timelineCount}
        />

        {/* Collapsible Search & Filter Bar for Kanban */}
        {currentView === 'kanban' && isFilterOpen && (
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onClose={() => setIsFilterOpen(false)}
          />
        )}

        {/* View Switcher Output */}
        <main className="flex-1 flex flex-col min-h-0 bg-slate-50/40">
          {currentView === 'kanban' && (
            <KanbanBoard
              cards={cards}
              filters={filters}
              onCardsChange={setCards}
              onCardClick={handleCardClick}
              onAddCardClick={handleOpenAddCard}
              onLogActivity={handleLogActivity}
              onFilterUserChange={(userId) =>
                setFilters((prev) => ({ ...prev, assignedToUserId: userId }))
              }
            />
          )}

          {currentView === 'timeline' && (
            <TimelineView
              cards={cards}
              projects={projects}
              onCardClick={handleCardClick}
              onProjectClick={handleSelectProject}
              onAddCardClick={() => handleOpenAddCard('todo')}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              onSelectProject={handleSelectProject}
              onAddProjectClick={handleOpenAddProject}
            />
          )}
        </main>

        {/* Clean Footer Bar with @PPKI2026 */}
        <footer className="px-4 py-2.5 bg-white border-t border-slate-200/80 text-center text-[11px] text-slate-400 font-medium tracking-wide">
          @PPKI2026
        </footer>

        {/* Floating Toast notifications */}
        <ToastContainer />

        {/* Mac-style Universal Spotlight Search */}
        <SpotlightSearch
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          cards={cards}
          projects={projects}
          onSelectCard={(c) => {
            setCurrentView('kanban');
            handleCardClick(c);
          }}
          onSelectProject={(p) => {
            setCurrentView('projects');
            handleSelectProject(p);
          }}
          onNavigateView={(v) => setCurrentView(v)}
          onQuickAddCard={() => handleOpenAddCard('todo')}
          onQuickAddProject={handleOpenAddProject}
          onOpenAdminUsers={() => setIsAdminUsersOpen(true)}
          onOpenProfile={() => setCurrentView('profile')}
          onLogout={logout}
        />

        {/* Modals */}
        {isCardModalOpen && (
          <CardModal
            card={editingCard}
            defaultColumnId={defaultColumnId}
            activities={activities}
            onClose={() => {
              setIsCardModalOpen(false);
              setEditingCard(null);
            }}
            onSave={handleSaveCard}
            onDelete={handleDeleteCard}
          />
        )}

        {/* Project Detail & Milestones Modal */}
        <ProjectDetailModal
          project={editingProject}
          isOpen={isProjectModalOpen}
          onClose={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
        />

        {/* Executive Meeting & Progress Summary Modal */}
        <MeetingSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          cards={cards}
          projects={projects}
        />

        {/* Admin User Management Modal (Full CRUD) */}
        {isAdminUsersOpen && isAdmin && (
          <AdminUsersModal onClose={() => setIsAdminUsersOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
