import { create } from 'zustand';
import { User, GameRoom, Question, GameState, PlayerAnswer, GameSettings } from '../types/game';
import { mockQuestions } from '../data/questions';

interface GameStore {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Game state
  currentRoom: GameRoom | null;
  availableRooms: GameRoom[];
  currentQuestion: Question | null;
  playerAnswers: PlayerAnswer[];
  gameSettings: GameSettings;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showResults: boolean;
  
  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  createRoom: (roomName: string, maxPlayers: number, isPrivate: boolean) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  submitAnswer: (answerIndex: number, timeSpent: number) => void;
  nextQuestion: () => void;
  endGame: () => void;
  setGameSettings: (settings: Partial<GameSettings>) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const defaultGameSettings: GameSettings = {
  questionsPerGame: 10,
  timePerQuestion: 30,
  difficulty: 'mixed',
  categories: ['recycling', 'biodiversity', 'energy', 'climate-change', 'sustainable-consumption', 'pollution', 'conservation']
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  currentUser: null,
  isAuthenticated: false,
  currentRoom: null,
  availableRooms: [],
  currentQuestion: null,
  playerAnswers: [],
  gameSettings: defaultGameSettings,
  isLoading: false,
  error: null,
  showResults: false,

  // Actions
  setUser: (user) => set({ currentUser: user, isAuthenticated: true }),
  
  logout: () => set({ 
    currentUser: null, 
    isAuthenticated: false, 
    currentRoom: null,
    currentQuestion: null,
    playerAnswers: [],
    showResults: false
  }),

  createRoom: (roomName, maxPlayers, isPrivate) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const newRoom: GameRoom = {
      id: Math.random().toString(36).substr(2, 9),
      name: roomName,
      players: [currentUser],
      maxPlayers,
      isPrivate,
      gameState: 'waiting',
      questionIndex: 0,
      timeRemaining: 0,
      scores: { [currentUser.id]: 0 }
    };

    set(state => ({
      currentRoom: newRoom,
      availableRooms: [...state.availableRooms, newRoom]
    }));
  },

  joinRoom: (roomId) => {
    const { currentUser, availableRooms } = get();
    if (!currentUser) return;

    const room = availableRooms.find(r => r.id === roomId);
    if (!room || room.players.length >= room.maxPlayers) return;

    const updatedRoom = {
      ...room,
      players: [...room.players, currentUser],
      scores: { ...room.scores, [currentUser.id]: 0 }
    };

    set(state => ({
      currentRoom: updatedRoom,
      availableRooms: state.availableRooms.map(r => 
        r.id === roomId ? updatedRoom : r
      )
    }));
  },

  leaveRoom: () => set({ 
    currentRoom: null, 
    currentQuestion: null, 
    playerAnswers: [],
    showResults: false 
  }),

  startGame: () => {
    const { currentRoom, gameSettings } = get();
    if (!currentRoom) return;

    // Filter questions based on settings
    let filteredQuestions = mockQuestions;
    
    if (gameSettings.difficulty !== 'mixed') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === gameSettings.difficulty);
    }
    
    filteredQuestions = filteredQuestions.filter(q => 
      gameSettings.categories.includes(q.category)
    );

    // Shuffle and select questions
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, gameSettings.questionsPerGame);

    const updatedRoom = {
      ...currentRoom,
      gameState: 'playing' as GameState,
      questionIndex: 0,
      timeRemaining: gameSettings.timePerQuestion
    };

    set({
      currentRoom: updatedRoom,
      currentQuestion: selectedQuestions[0] || null,
      playerAnswers: []
    });
  },

  submitAnswer: (answerIndex, timeSpent) => {
    const { currentUser, currentQuestion, currentRoom } = get();
    if (!currentUser || !currentQuestion || !currentRoom) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const timeBonus = Math.max(0, (30 - timeSpent) * 2);
    const points = isCorrect ? currentQuestion.points + timeBonus : 0;

    const answer: PlayerAnswer = {
      playerId: currentUser.id,
      answerIndex,
      timeSpent,
      isCorrect,
      points
    };

    const updatedScores = {
      ...currentRoom.scores,
      [currentUser.id]: (currentRoom.scores[currentUser.id] || 0) + points
    };

    set(state => ({
      playerAnswers: [...state.playerAnswers, answer],
      currentRoom: state.currentRoom ? {
        ...state.currentRoom,
        scores: updatedScores
      } : null,
      showResults: true
    }));
  },

  nextQuestion: () => {
    const { currentRoom, gameSettings } = get();
    if (!currentRoom) return;

    const nextIndex = currentRoom.questionIndex + 1;
    
    if (nextIndex >= gameSettings.questionsPerGame) {
      get().endGame();
      return;
    }

    // Filter and get next question
    let filteredQuestions = mockQuestions;
    if (gameSettings.difficulty !== 'mixed') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === gameSettings.difficulty);
    }
    filteredQuestions = filteredQuestions.filter(q => 
      gameSettings.categories.includes(q.category)
    );

    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    const nextQuestion = shuffled[nextIndex % shuffled.length];

    set({
      currentRoom: {
        ...currentRoom,
        questionIndex: nextIndex,
        timeRemaining: gameSettings.timePerQuestion
      },
      currentQuestion: nextQuestion,
      showResults: false
    });
  },

  endGame: () => {
    const { currentRoom } = get();
    if (!currentRoom) return;

    set({
      currentRoom: {
        ...currentRoom,
        gameState: 'finished'
      },
      currentQuestion: null,
      showResults: true
    });
  },

  setGameSettings: (settings) => set(state => ({
    gameSettings: { ...state.gameSettings, ...settings }
  })),

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading })
}));