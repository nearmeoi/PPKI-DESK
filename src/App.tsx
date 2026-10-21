import React, { useState, useEffect } from 'react';
import type { CardItem, ColumnId, BoardFilter, ActivityLog } from './types';
import { storage } from './lib/storage';
import { generateId } from './lib/utils';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { CardModal } from './components/CardModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { EmailNotificationModal } from './components/EmailNotificationModal';
import { SetupSupabaseModal } from './components/SetupSupabaseModal';
import { AccountModal } from './components/AccountModal';
import { ToastContainer } from './components/ToastContainer';

export const AppContent: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();

  // Initialize storage once
  useEffect(() => {
    storage.init();
  }, []);

  // State
  const [cards, setCards] = useState<CardItem[]>(() => storage.getCards());
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

  const [isAdminUsersOpen, setIsAdminUsersOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [isSupabaseSetupOpen, setIsSupabaseSetupOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Sync cards changes to storage
  useEffect(() => {
    storage.saveCards(cards);
  }, [cards]);

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

  // Save (Create or Update)
  const handleSaveCard = (cardData: Partial<CardItem>) => {
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
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      setCards(updatedCards);
      handleLogActivity(editingCard.id, 'memperbarui detail kartu');
      toast('Perubahan tugas berhasil disimpan.');
    } else {
      const col = cardData.columnId || defaultColumnId;
      const newCard: CardItem = {
        id: generateId('c'),
        columnId: col,
        title: cardData.title || '',
        description: cardData.description || '',
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
      toast('Tugas baru berhasil ditambahkan.');
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
    toast('Tugas berhasil dihapus.', 'info');
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
            onChange={setFilters}
            onClose={() => setIsFilterOpen(false)}
          />
        )}

        {/* Main Kanban Board View */}
        <main className="flex-1 flex flex-col min-h-0">
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
        <footer className="px-4 py-2.5 bg-zinc-950/90 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_1px_rgba(16,185,129,0.4)]" />
            <span className="font-medium text-zinc-300">PPKI Progress</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-500">v1.0-prod</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Akun:</span>
            <span className="text-zinc-200 font-semibold">{currentUser.name}</span>
          </div>
        </footer>

        {/* Toast notifications container */}
        <ToastContainer />

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
