
        document.addEventListener('DOMContentLoaded', () => {
            const notesListEl = document.getElementById('notes-list');
            const filterChipsContainerEl = document.getElementById('filter-chips-container');
            const addNoteBtn = document.getElementById('add-note-btn');
            const noteModal = document.getElementById('note-modal');
            const cancelBtn = document.getElementById('cancel-btn');
            const noteForm = document.getElementById('note-form');
            const modalTitle = document.getElementById('modal-title');
            const noteIdInput = document.getElementById('note-id');
            const noteTitleInput = document.getElementById('note-title');
            const noteContentInput = document.getElementById('note-content');
            const noteIsTodoInput = document.getElementById('note-is-todo');
            const toggleCompletedBtn = document.getElementById('toggle-completed-btn');
            const manageTagsBtn = document.getElementById('manage-tags-btn');
            const manageTagsModal = document.getElementById('manage-tags-modal');
            const closeManageTagsBtn = document.getElementById('close-manage-tags-btn');
            const manageTagsList = document.getElementById('manage-tags-list');
            const newTagInput = document.getElementById('new-tag-input');
            const addNewTagBtn = document.getElementById('add-new-tag-btn');
            const searchInput = document.getElementById('search-input');
            const showAllBtn = document.getElementById('show-all-btn');
            const showTodosBtn = document.getElementById('show-todos-btn');
            const showNotesBtn = document.getElementById('show-notes-btn');
            const showPriorityMatrixBtn = document.getElementById('show-priority-matrix-btn'); // Renamed button
            const eisenhowerMatrixEl = document.getElementById('eisenhower-matrix');
            const tagFilterSection = document.getElementById('tag-filter-section');

            let doQuadrantEl = document.querySelector('#do-quadrant > div');
            let decideQuadrantEl = document.querySelector('#decide-quadrant > div');
            let delegateQuadrantEl = document.querySelector('#delegate-quadrant > div');
            let discardQuadrantEl = document.querySelector('#discard-quadrant > div');

            const tagPillsContainer = document.getElementById('tag-pills-container');
            const tagInput = document.getElementById('note-tags-input');
            const suggestiveTagsContainer = document.getElementById('suggestive-tags-container');

            let notes = [
                { id: 1, title: 'Prepare for Marketing Presentation', content: 'Finalize slides, rehearse talking points, and ensure all team members are aligned on key messages. Focus on Q3 growth metrics.', isTodo: true, isCompleted: false, tags: ['Work', 'Presentation', 'Urgent', 'Imp'] },
                { id: 2, title: 'Grocery List', content: 'Milk, Eggs, Bread, Coffee, Apples, Chicken Breast. Don\'t forget the special cheese!', isTodo: true, isCompleted: false, tags: ['Personal', 'Shopping', 'Not Imp'] },
                { id: 3, title: 'Meeting Notes: Project Alpha Kick-off', content: 'Key stakeholders present. Discussed project scope, initial timelines, and resource allocation. Follow-up on budget approval by Friday.', isTodo: false, isCompleted: false, tags: ['Work', 'Meeting', 'Project Alpha', 'Imp'] },
                { id: 4, title: 'Call Bank about Credit Card Issue', content: 'Fraudulent charge detected. Need to dispute transaction and request new card. Call customer service during lunch break.', isTodo: true, isCompleted: false, tags: ['Personal', 'Finance', 'Urgent'] },
                { id: 5, title: 'Ideas for Blog Post: Remote Work Productivity', content: 'Brainstormed topics: effective communication, setting boundaries, virtual team building, digital tools. Need to outline structure by end of week.', isTodo: false, isCompleted: false, tags: ['Work', 'Content', 'Ideas', 'Not Urgent'] },
                { id: 6, title: 'Review Q2 Performance Report', content: 'Analyze sales figures, identify areas for improvement, and prepare summary for next team meeting. Pay attention to regional variances.', isTodo: true, isCompleted: false, tags: ['Work', 'Report', 'Imp'] },
                { id: 7, title: 'Book Dentist Appointment', content: 'It\'s been over 6 months. Need to schedule a cleaning and check-up. Call Dr. Smith\'s office next week.', isTodo: true, isCompleted: true, tags: ['Personal', 'Health', 'Not Urgent'] },
                { id: 8, title: 'Weekend Plans', content: 'Hiking trip to the national park. Check weather forecast. Pack light snacks and water. Invite Sarah and Tom.', isTodo: false, isCompleted: false, tags: ['Personal', 'Leisure', 'Planning'] },
                { id: 9, title: 'Research new software for project management', content: 'Look into Asana, Trello, and Monday.com. Compare features, pricing, and team collaboration tools. Prepare a brief comparison document.', isTodo: true, isCompleted: false, tags: ['Work', 'Research', 'Tooling', 'Not Imp'] },
                { id: 10, title: 'Learn new recipe: Vegan Chili', content: 'Found a great recipe online. Need to buy ingredients: kidney beans, black beans, tomatoes, chili powder, cumin, bell peppers. Try cooking it on Sunday.', isTodo: true, isCompleted: false, tags: ['Personal', 'Cooking', 'Hobby'] }
            ];

            let defaultTags = ['Imp', 'Urgent', 'Not Imp', 'Not Urgent'];
            let allTags = new Set(defaultTags);
            let selectedFilters = new Set();
            let currentEditTags = new Set();
            let draggedItem = null;
            let showCompleted = true;
            let currentView = 'all'; // Changed from 'eisenhower' to 'priorityMatrix' where applicable

            const updateAllTags = () => {
                const newAllTags = new Set(defaultTags);
                notes.forEach(note => note.tags.forEach(tag => newAllTags.add(tag)));
                allTags = newAllTags;
            };

            const renderTags = () => {
                filterChipsContainerEl.innerHTML = '';
                allTags.forEach(tag => {
                    const chip = document.createElement('button');
                    chip.textContent = tag;
                    chip.dataset.tag = tag;
                    chip.className = `filter-chip whitespace-nowrap px-3 py-1 text-sm font-medium border rounded-full transition-colors duration-200 ${selectedFilters.has(tag) ? 'active' : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'}`;
                    chip.onclick = () => toggleFilter(tag);
                    filterChipsContainerEl.appendChild(chip);
                });
            };

            window.toggleTodoStatus = (id) => {
                const note = notes.find(n => n.id === id);
                if (note) {
                    note.isCompleted = !note.isCompleted;
                    renderApp();
                }
            };

            window.toggleContent = (event, id) => {
                const contentEl = document.getElementById(`content-${id}`);
                const toggleBtn = document.getElementById(`toggle-btn-${id}`);
                if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'BUTTON' && event.target.closest('button') === null) {
                    contentEl.classList.toggle('hidden');
                    if (contentEl.classList.contains('hidden')) {
                        toggleBtn.querySelector('svg').style.transform = 'rotate(0deg)';
                    } else {
                        toggleBtn.querySelector('svg').style.transform = 'rotate(180deg)';
                    }
                }
            };

            window.deleteNote = (id) => {
                notes = notes.filter(n => n.id !== id);
                updateAllTags();
                renderApp();
                renderTags();
            };

            const toggleFilter = (tag) => {
                if (selectedFilters.has(tag)) {
                    selectedFilters.delete(tag);
                } else {
                    selectedFilters.add(tag);
                }
                document.querySelectorAll('.filter-chip').forEach(chip => {
                    if (chip.dataset.tag === tag) {
                        chip.classList.toggle('active');
                        chip.classList.toggle('bg-slate-700');
                        chip.classList.toggle('text-slate-200');
                        chip.classList.toggle('border-slate-600');
                        chip.classList.toggle('hover:bg-slate-600');
                    }
                });
                renderApp();
            };

            const renderNotesList = () => {
                notesListEl.classList.remove('hidden');
                eisenhowerMatrixEl.classList.add('hidden');
                tagFilterSection.classList.remove('hidden');
                searchInput.classList.remove('hidden');

                const searchQuery = searchInput.value.toLowerCase();
                let filteredNotes = notes.filter(note => {
                    if (currentView === 'todos' && !note.isTodo) return false;
                    if (currentView === 'notes' && note.isTodo) return false;

                    if (selectedFilters.size > 0 && !Array.from(selectedFilters).every(filter => note.tags.includes(filter))) {
                        return false;
                    }

                    const matchesSearch = note.title.toLowerCase().includes(searchQuery) || note.content.toLowerCase().includes(searchQuery);
                    if (searchQuery && !matchesSearch) {
                        return false;
                    }

                    if (!showCompleted && note.isTodo && note.isCompleted) {
                        return false;
                    }

                    return true;
                });

                filteredNotes.sort((a, b) => {
                    if (!a.isTodo && !b.isTodo) return 0;
                    if (a.isTodo && b.isTodo) return a.isCompleted - b.isCompleted;
                    if (a.isTodo) return a.isCompleted ? 1 : -1;
                    if (b.isTodo) return b.isCompleted ? -1 : 1;
                    return 0;
                });

                notesListEl.innerHTML = '';
                if (filteredNotes.length === 0) {
                    notesListEl.innerHTML = `<div class="col-span-full text-center py-12">
                        <h3 class="text-lg font-semibold text-slate-300">No entries found</h3>
                        <p class="text-slate-500 mt-1">Try adjusting your filters or adding a new entry.</p>
                    </div>`;
                } else {
                    filteredNotes.forEach(note => {
                        const card = document.createElement('div');
                        card.className = `note-card bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4 flex flex-col transition-all duration-200`;

                        card.draggable = true;
                        card.dataset.noteId = note.id;

                        const isCompleted = note.isTodo && note.isCompleted;
                        const strikethroughClass = isCompleted ? 'line-through text-slate-500' : 'text-slate-100';

                        let flagIcon = '';
                        let recommendedAction = '';
                        let actionBgColorClass = '';

                        const tags = note.tags;
                        const isImp = tags.includes('Imp');
                        const isUrgent = tags.includes('Urgent');
                        const isNotImp = tags.includes('Not Imp');
                        const isNotUrgent = tags.includes('Not Urgent');

                        if (isImp && isUrgent) {
                            flagIcon = `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 ml-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
                                </svg>
                            `;
                            recommendedAction = "Just do it";
                            actionBgColorClass = "bg-red-700";
                        } else if (isImp && isNotUrgent) {
                            flagIcon = `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500 ml-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
                                </svg>
                            `;
                            recommendedAction = "Schedule it";
                            actionBgColorClass = "bg-yellow-700";
                        } else if (isNotImp && isUrgent) {
                            flagIcon = `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500 ml-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
                                </svg>
                            `;
                            recommendedAction = "Delegate it";
                            actionBgColorClass = "bg-blue-700";
                        } else if (isNotImp && isNotUrgent) {
                            flagIcon = `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-500 ml-2" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
                                </svg>
                            `;
                            recommendedAction = "Avoid or Postpone it";
                            actionBgColorClass = "bg-slate-700";
                        }

                        const tagsHtml = note.tags.map(tag => `<span class="bg-indigo-600 text-white text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">${tag}</span>`).join('');

                        card.innerHTML = `
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-lg font-bold flex-1 pr-2 cursor-pointer ${strikethroughClass}" onclick="toggleContent(event, ${note.id})">${note.title}</h3>
                                <div class="flex items-center gap-2">
                                    ${flagIcon}
                                    <button onclick="event.stopPropagation(); openModal(${note.id});" class="text-slate-400 hover:text-indigo-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button onclick="event.stopPropagation(); deleteNote(${note.id});" class="text-slate-400 hover:text-red-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <button id="toggle-btn-${note.id}" class="text-slate-400 hover:text-indigo-500 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    ${note.isTodo ? `
                                        <input type="checkbox" id="todo-${note.id}" ${isCompleted ? 'checked' : ''} class="h-5 w-5 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer" onclick="event.stopPropagation(); toggleTodoStatus(${note.id});">
                                    ` : ''}
                                </div>
                            </div>
                            <div id="content-${note.id}" class="hidden">
                                <p class="text-slate-400 text-sm mb-4 pt-2 border-t border-slate-700 ${strikethroughClass}">${note.content}</p>
                                <div class="flex flex-wrap items-center justify-between gap-1 mt-auto pt-2 border-t border-slate-700">
                                    <div class="flex flex-wrap gap-1">
                                        ${tagsHtml}
                                    </div>
                                    ${recommendedAction ? `
                                        <div class="text-white text-xs font-medium px-2.5 py-0.5 rounded-full ${actionBgColorClass}">
                                            ${recommendedAction}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                        notesListEl.appendChild(card);
                    });
                }

                const blankBox = document.createElement('div');
                blankBox.className = `note-card bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-4 flex flex-col justify-center items-center h-[100px] text-slate-500 italic`;
                blankBox.innerHTML = `<p>End</p>`;
                notesListEl.appendChild(blankBox);

                const noteCards = notesListEl.querySelectorAll('.note-card');
                noteCards.forEach(card => {
                    card.addEventListener('dragstart', (e) => {
                        draggedItem = card;
                        card.classList.add('dragging');
                        setTimeout(() => card.style.display = 'none', 0);
                    });

                    card.addEventListener('dragenter', (e) => {
                        e.preventDefault();
                        if (draggedItem !== card) {
                            card.classList.add('drag-over');
                        }
                    });

                    card.addEventListener('dragover', (e) => {
                        e.preventDefault();
                    });

                    card.addEventListener('dragleave', () => {
                        card.classList.remove('drag-over');
                    });

                    card.addEventListener('drop', (e) => {
                        e.preventDefault();
                        card.classList.remove('drag-over');

                        if (draggedItem !== card) {
                            const draggedId = parseInt(draggedItem.dataset.noteId);
                            const targetId = parseInt(card.dataset.noteId);

                            const draggedIndex = notes.findIndex(note => note.id === draggedId);
                            const targetIndex = notes.findIndex(note => note.id === targetId);

                            const [removed] = notes.splice(draggedIndex, 1);
                            notes.splice(targetIndex, 0, removed);

                            renderApp();
                        }
                    });

                    card.addEventListener('dragend', () => {
                        draggedItem.classList.remove('dragging');
                        draggedItem.style.display = 'flex';
                        draggedItem = null;
                        notesListEl.querySelectorAll('.note-card').forEach(c => c.classList.remove('drag-over'));
                        renderApp();
                    });
                });
            };

            const renderEisenhowerMatrix = () => {
                notesListEl.classList.add('hidden');
                eisenhowerMatrixEl.classList.remove('hidden');
                tagFilterSection.classList.add('hidden');
                searchInput.classList.add('hidden');

                doQuadrantEl.innerHTML = '';
                decideQuadrantEl.innerHTML = '';
                delegateQuadrantEl.innerHTML = '';
                discardQuadrantEl.innerHTML = '';

                const todoItems = notes.filter(note => note.isTodo && (showCompleted || !note.isCompleted));

                if (todoItems.length === 0) {
                    eisenhowerMatrixEl.innerHTML = `<div class="col-span-full text-center py-12">
                        <h3 class="text-lg font-semibold text-slate-300">No To-Do entries found for Priority Matrix</h3>
                        <p class="text-slate-500 mt-1">Add some to-dos with "Imp" or "Urgent" tags.</p>
                    </div>`;
                } else {
                    if (eisenhowerMatrixEl.children.length !== 4 || eisenhowerMatrixEl.querySelector('#do-quadrant') === null) {
                        eisenhowerMatrixEl.innerHTML = `
                            <div id="do-quadrant" class="bg-red-900/40 border border-red-700 rounded-lg p-4 flex flex-col">
                                <h3 class="text-lg font-bold text-red-300 mb-2">Do (Urgent & Important)</h3>
                                <div class="flex flex-col gap-2 overflow-y-auto"></div>
                            </div>
                            <div id="decide-quadrant" class="bg-yellow-900/40 border border-yellow-700 rounded-lg p-4 flex flex-col">
                                <h3 class="text-lg font-bold text-yellow-300 mb-2">Decide (Important & Not Urgent)</h3>
                                <div class="flex flex-col gap-2 overflow-y-auto"></div>
                            </div>
                            <div id="delegate-quadrant" class="bg-blue-900/40 border border-blue-700 rounded-lg p-4 flex flex-col">
                                <h3 class="text-lg font-bold text-blue-300 mb-2">Delegate (Urgent & Not Important)</h3>
                                <div class="flex flex-col gap-2 overflow-y-auto"></div>
                            </div>
                            <div id="discard-quadrant" class="bg-slate-700/40 border border-slate-600 rounded-lg p-4 flex flex-col">
                                <h3 class="text-lg font-bold text-slate-300 mb-2">Discard (Not Important & Not Urgent) / Undefined</h3>
                                <div class="flex flex-col gap-2 overflow-y-auto"></div>
                            </div>
                        `;
                        doQuadrantEl = document.querySelector('#do-quadrant > div');
                        decideQuadrantEl = document.querySelector('#decide-quadrant > div');
                        delegateQuadrantEl = document.querySelector('#delegate-quadrant > div');
                        discardQuadrantEl = document.querySelector('#discard-quadrant > div');
                    }
                    doQuadrantEl.innerHTML = '';
                    decideQuadrantEl.innerHTML = '';
                    delegateQuadrantEl.innerHTML = '';
                    discardQuadrantEl.innerHTML = '';


                    todoItems.forEach(todo => {
                        const isImp = todo.tags.includes('Imp');
                        const isUrgent = todo.tags.includes('Urgent');
                        const isCompleted = todo.isCompleted;

                        const todoCard = document.createElement('div');
                        todoCard.className = `bg-slate-700 rounded-md p-3 text-sm flex items-center justify-between border border-slate-600 ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`;
                        todoCard.innerHTML = `
                            <span class="flex-1">${todo.title}</span>
                            <input type="checkbox" id="todo-eisenhower-${todo.id}" ${isCompleted ? 'checked' : ''} class="h-4 w-4 rounded border-slate-500 bg-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer" onclick="event.stopPropagation(); toggleTodoStatus(${todo.id});">
                        `;

                        if (isImp && isUrgent) {
                            doQuadrantEl.appendChild(todoCard);
                        } else if (isImp && !isUrgent) {
                            decideQuadrantEl.appendChild(todoCard);
                        } else if (!isImp && isUrgent) {
                            delegateQuadrantEl.appendChild(todoCard);
                        } else if (!isImp && !isUrgent) {
                            discardQuadrantEl.appendChild(todoCard);
                        }
                    });

                    if (doQuadrantEl.children.length === 0) doQuadrantEl.innerHTML = '<p class="text-slate-500 italic text-center py-4">No "Do" tasks.</p>';
                    if (decideQuadrantEl.children.length === 0) decideQuadrantEl.innerHTML = '<p class="text-slate-500 italic text-center py-4">No "Decide" tasks.</p>';
                    if (delegateQuadrantEl.children.length === 0) delegateQuadrantEl.innerHTML = '<p class="text-slate-500 italic text-center py-4">No "Delegate" tasks.</p>';
                    if (discardQuadrantEl.children.length === 0) discardQuadrantEl.innerHTML = '<p class="text-slate-500 italic text-center py-4">No "Discard" tasks.</p>';
                }
            };

            const renderApp = () => {
                document.querySelectorAll('.view-filter-btn').forEach(btn => btn.classList.remove('active'));
                if (currentView === 'all') showAllBtn.classList.add('active');
                else if (currentView === 'todos') showTodosBtn.classList.add('active');
                else if (currentView === 'notes') showNotesBtn.classList.add('active');
                else if (currentView === 'priorityMatrix') showPriorityMatrixBtn.classList.add('active'); 
                
                if (currentView === 'priorityMatrix') { 
                    renderEisenhowerMatrix();
                } else {
                    renderNotesList();
                }
            };

            showAllBtn.addEventListener('click', () => {
                currentView = 'all';
                renderApp();
            });

            showTodosBtn.addEventListener('click', () => {
                currentView = 'todos';
                renderApp();
            });

            showNotesBtn.addEventListener('click', () => {
                currentView = 'notes';
                renderApp();
            });

            showPriorityMatrixBtn.addEventListener('click', () => { 
                currentView = 'priorityMatrix'; 
                renderApp();
            });

            toggleCompletedBtn.addEventListener('click', () => {
                showCompleted = !showCompleted;
                toggleCompletedBtn.textContent = showCompleted ? 'Hide Completed' : 'Show All';
                renderApp();
            });

            searchInput.addEventListener('input', renderApp);

            window.openModal = (id = null) => {
                noteForm.reset();
                currentEditTags.clear();
                if (id) {
                    const note = notes.find(n => n.id === id);
                    modalTitle.textContent = 'Edit Entry';
                    noteIdInput.value = note.id;
                    noteTitleInput.value = note.title;
                    noteContentInput.value = note.content;
                    noteIsTodoInput.checked = note.isTodo;
                    note.tags.forEach(tag => currentEditTags.add(tag));
                } else {
                    modalTitle.textContent = 'Add New Entry';
                    noteIdInput.value = '';
                }
                renderTagPills();
                renderSuggestiveTags();
                noteModal.classList.remove('hidden');
            };

            const closeModal = () => {
                noteModal.classList.add('hidden');
            };

            const renderTagPills = () => {
                tagPillsContainer.innerHTML = '';
                currentEditTags.forEach(tag => {
                    const pill = document.createElement('span');
                    pill.className = 'tag';
                    pill.innerHTML = `${tag} <button type="button" data-tag="${tag}">&times;</button>`;
                    tagPillsContainer.appendChild(pill);
                });
                renderSuggestiveTags();
            };

            const renderSuggestiveTags = () => {
                suggestiveTagsContainer.innerHTML = '';
                const availableTags = new Set(allTags);
                currentEditTags.forEach(tag => availableTags.delete(tag));

                availableTags.forEach(tag => {
                    const button = document.createElement('button');
                    button.textContent = tag;
                    button.className = 'suggestive-tag-btn';
                    button.type = 'button';
                    button.onclick = () => {
                        currentEditTags.add(tag);
                        renderTagPills();
                    };
                    suggestiveTagsContainer.appendChild(button);
                });
            };

            tagPillsContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const tagToRemove = e.target.dataset.tag;
                    currentEditTags.delete(tagToRemove);
                    renderTagPills();
                }
            });

            tagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const newTag = tagInput.value.trim();
                    if (newTag) {
                        currentEditTags.add(newTag);
                        tagInput.value = '';
                        renderTagPills();
                    }
                }
            });

            noteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = noteIdInput.value;
                const newNote = {
                    id: id ? parseInt(id) : Date.now(),
                    title: noteTitleInput.value,
                    content: noteContentInput.value,
                    isTodo: noteIsTodoInput.checked,
                    isCompleted: id ? notes.find(n => n.id == id).isCompleted : false,
                    tags: Array.from(currentEditTags)
                };

                if (id) {
                    const index = notes.findIndex(n => n.id == id);
                    notes[index] = newNote;
                } else {
                    notes.push(newNote);
                }

                updateAllTags();
                closeModal();
                renderApp();
                renderTags();
            });

            addNoteBtn.addEventListener('click', () => openModal());
            cancelBtn.addEventListener('click', closeModal);
            noteModal.addEventListener('click', (e) => {
                if (e.target === noteModal) closeModal();
            });

            // --- Manage Tags Modal Logic ---
            manageTagsBtn.addEventListener('click', () => {
                renderManageTagsList();
                manageTagsModal.classList.remove('hidden');
            });

            closeManageTagsBtn.addEventListener('click', () => {
                manageTagsModal.classList.add('hidden');
            });

            manageTagsModal.addEventListener('click', (e) => {
                if (e.target === manageTagsModal) {
                    manageTagsModal.classList.add('hidden');
                }
            });

            addNewTagBtn.addEventListener('click', () => {
                const newTag = newTagInput.value.trim();
                if (newTag && !allTags.has(newTag)) {
                    allTags.add(newTag);
                    defaultTags.push(newTag);
                    newTagInput.value = '';
                    renderManageTagsList();
                    renderTags();
                }
            });

            const renderManageTagsList = () => {
                manageTagsList.innerHTML = '';
                allTags.forEach(tag => {
                    const listItem = document.createElement('li');
                    listItem.className = 'tag-list-item text-slate-100';
                    listItem.innerHTML = `
                        <span>${tag}</span>
                        <button class="text-red-500 hover:text-red-700" data-tag="${tag}">&times;</button>
                    `;
                    manageTagsList.appendChild(listItem);
                });
            };

            manageTagsList.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' && e.target.dataset.tag) {
                    const tagToDelete = e.target.dataset.tag;
                    allTags.delete(tagToDelete);
                    defaultTags = defaultTags.filter(tag => tag !== tagToDelete);
                    notes.forEach(note => {
                        note.tags = note.tags.filter(tag => tag !== tagToDelete);
                    });
                    renderManageTagsList();
                    renderTags();
                    renderApp();
                }
            });
            // --- End Manage Tags Modal Logic ---

            updateAllTags();
            renderTags();
            renderApp();
        });
    