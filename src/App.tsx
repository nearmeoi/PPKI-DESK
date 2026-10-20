import React, { useState, useEffect } from 'react';
import type { CardItem, ColumnStatus, BoardFilter, ActivityLog } from './types';
import { storageService } from './lib/storage';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { CardModal } from './components/CardModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { EmailNotificationModal } from './components/EmailNotificationModal';
import { SetupSupabaseModal } from './components/SetupSupabaseModal';
import { AccountModal } from './components/AccountModal';

export const AppContent: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();

  // State
  const [cards, setCards] = useState<CardItem[]>(() => storageService.getCards());
  const [activities, setActivities] = useState<ActivityLog[]>(() => storageService.getActivities());

  const [filters, setFilters] = useState<BoardFilter>({
    searchQuery: '',
    assignedToUserId: 'all',
    selectedLabel: 'all',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<ColumnStatus>('todo');

  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [isSupabaseSetupOpen, setIsSupabaseSetupOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Sync cards changes to localStorage
  useEffect(() => {
    storageService.saveCards(cards);
  }, [cards]);

  // Log activity helper
  const handleLogActivity = (cardId: string, action: string) => {
    const updated = storageService.logActivity(cardId, currentUser, action);
    setActivities(updated);
  };

  // Open modal to create card
  const handleOpenAddCard = (columnId: ColumnStatus = 'todo') => {
    setEditingCard(null);
    setDefaultColumnId(columnId);
    setIsCardModalOpen(true);
  };

  // Open modal to view/edit card
  const handleCardClick = (card: CardItem) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveCard = (cardData: Partial<CardItem>) => {
    if (editingCard) {
      // Check permission: only creator or admin
      if (!storageService.canModifyCard(editingCard, currentUser)) {
        alert('Anda hanya dapat mengubah kartu tugas yang Anda buat sendiri.');
        return;
      }

      const updatedCards = cards.map((c) =>
        c.id === editingCard.id
          ? {
              ...c,
              ...cardData,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      setCards(updatedCards);
      handleLogActivity(editingCard.id, 'memperbarui detail kartu tugas');
    } else {
      // Create new card
      const newCard: CardItem = {
        id: 'card-' + Date.now(),
        columnId: cardData.columnId || defaultColumnId,
        title: cardData.title || '',
        description: cardData.description || '',
        assignedTo: cardData.assignedTo || [],
        createdBy: currentUser.id,
        deadline: cardData.deadline,
        labels: cardData.labels || [],
        priority: cardData.priority || 'medium',
        orderIndex: cards.filter((c) => c.columnId === (cardData.columnId || defaultColumnId)).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedCards = [newCard, ...cards];
      setCards(updatedCards);
      handleLogActivity(newCard.id, 'membuat kartu tugas baru');
    }

    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    const target = cards.find((c) => c.id === cardId);
    if (!target) return;

    if (!storageService.canModifyCard(target, currentUser)) {
      alert('Anda hanya dapat menghapus kartu tugas yang Anda buat sendiri.');
      return;
    }

    const updated = cards.filter((c) => c.id !== cardId);
    setCards(updated);
    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center text-zinc-100 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Centered Mobile-First App Container */}
      <div className="w-full max-w-xl min-h-screen bg-zinc-900 border-x border-zinc-800/80 flex flex-col shadow-2xl relative">
        {/* App Top Navigation */}
        <Header
          onOpenAdminUsers={() => setIsAdminUsersOpen(true)}
          onOpenEmailPreview={() => setIsEmailPreviewOpen(true)}
          onOpenSupabaseSetup={() => setIsSupabaseSetupOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onQuickAdd={() => handleOpenAddCard('todo')}
          onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
          isFilterOpen={isFilterOpen}
          totalCards={cards.length}
        />

        {/* Collapsible Search & Filter Bar */}
        {isFilterOpen && (
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onClose={() => setIsFilterOpen(false)}
          />
        )}

        {/* Main Kanban Board View */}
        <main className="flex-1 flex flex-col">
          <KanbanBoard
            cards={cards}
            filters={filters}
            onCardsChange={setCards}
            onCardClick={handleCardClick}
            onAddCardClick={handleOpenAddCard}
            onLogActivity={handleLogActivity}
          />
        </main>

        {/* Bottom App Bar / Info Bar */}
        <footer className="px-4 py-2.5 bg-zinc-950/80 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>PPKI Progress Web</span>
          </div>
          <div>
            <span>Masuk sebagai: </span>
            <span className="text-zinc-200 font-semibold">{currentUser.name}</span>
          </div>
        </footer>

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

        {isAdminUsersOpen && isAdmin && (
          <AdminUsersModal onClose={() => setIsAdminUsersOpen(false)} />
        )}

        {isEmailPreviewOpen && (
          <EmailNotificationModal onClose={() => setIsEmailPreviewOpen(false)} />
        )}

        {isSupabaseSetupOpen && (
          <SetupSupabaseModal onClose={() => setIsSupabaseSetupOpen(false)} />
        )}

        {isAccountOpen && (
          <AccountModal onClose={() => setIsAccountOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
