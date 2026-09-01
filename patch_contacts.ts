import fs from 'fs';
const content = fs.readFileSync('src/components/views/ContactsView.tsx', 'utf8');

// Import UserProfileModal
let updated = content.replace("import { Avatar } from '../ui/Avatar';", 
"import { Avatar } from '../ui/Avatar';\nimport { UserProfileModal } from './UserProfileModal';");

// Add state for selected profile
const stateStr = `const [isAddModalOpen, setIsAddModalOpen] = useState(false);`;
const newStateStr = stateStr + `\n  const [viewProfileId, setViewProfileId] = useState<string | null>(null);`;
updated = updated.replace(stateStr, newStateStr);

// Add button
const buttonStr = `<button
                      onClick={() => handleStartChatWithContact(contact)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[var(--color-accent-from,#ff5757)] to-[var(--color-accent-to,#e63939)] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[var(--color-accent-shadow,rgba(255,75,75,0.3))] transition-all cursor-pointer active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Kirim Pesan</span>
                    </button>`;
const newButtonStr = `<button
                      onClick={() => setViewProfileId(contact.id)}
                      className="px-3.5 py-2 rounded-xl neu-raised text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Profil</span>
                    </button>\n                    ` + buttonStr;
updated = updated.replace(buttonStr, newButtonStr);

// Add modal at bottom
const endStr = `</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;
const newEndStr = `</button>
            </div>
          </div>
        </div>
      )}

      {viewProfileId && (
        <UserProfileModal 
           userId={viewProfileId} 
           isOpen={true} 
           onClose={() => setViewProfileId(null)} 
        />
      )}
    </div>
  );
};`;
updated = updated.replace(endStr, newEndStr);

fs.writeFileSync('src/components/views/ContactsView.tsx', updated);
