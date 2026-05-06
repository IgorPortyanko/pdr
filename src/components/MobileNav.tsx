import { useState } from 'react';
import { BarChart2, BookOpen, ClipboardCheck, Menu, SignpostBig, X } from 'lucide-react';
import { CATEGORIES } from '../data/rules';
import { useRulesStore } from '../store/rulesStore';

const primaryItems = [
  { id: 'all', label: 'Правила', icon: BookOpen },
  { id: 'signs', label: 'Знаки', icon: SignpostBig },
  { id: 'tasks', label: 'Тести', icon: ClipboardCheck },
  { id: 'stats', label: 'Статистика', icon: BarChart2 },
];

export function MobileNav() {
  const { activeCategoryId, setActiveCategory } = useRulesStore();
  const [isOpen, setIsOpen] = useState(false);

  function navigate(id: string) {
    setActiveCategory(id);
    setIsOpen(false);
  }

  return (
    <>
      <nav className="mobile-nav" aria-label="Основна навігація">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeCategoryId === item.id ||
            (item.id === 'signs' && ['warning', 'priority', 'prohibit', 'mandate', 'info', 'service', 'tabl'].includes(activeCategoryId));

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mobile-nav-item"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <Menu size={18} />
          <span>Меню</span>
        </button>
      </nav>

      {isOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setIsOpen(false)}>
          <div
            id="mobile-menu"
            className="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Меню розділів"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <strong>Розділи</strong>
              <button type="button" className="mobile-menu-close" onClick={() => setIsOpen(false)} aria-label="Закрити меню">
                <X size={18} />
              </button>
            </div>

            <div className="mobile-menu-list">
              <button
                type="button"
                onClick={() => navigate('stats')}
                className={activeCategoryId === 'stats' ? 'mobile-menu-row active' : 'mobile-menu-row'}
              >
                <span>Статистика</span>
              </button>

              {CATEGORIES.map((category) => {
                const isGroup = Boolean(category.children?.length);
                const isActive = !isGroup && activeCategoryId === category.id;

                return (
                  <div key={category.id}>
                    <button
                      type="button"
                      onClick={() => !isGroup && navigate(category.id)}
                      className={isActive ? 'mobile-menu-row active' : 'mobile-menu-row'}
                      disabled={isGroup}
                    >
                      <span>{category.label}</span>
                      <small>{category.count}</small>
                    </button>

                    {category.children?.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => navigate(child.id)}
                        className={activeCategoryId === child.id ? 'mobile-menu-row child active' : 'mobile-menu-row child'}
                      >
                        <span>{child.label}</span>
                        <small>{child.count}</small>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
