export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const createDeck = (numDecks = 2) => {
  const deck = [];
  for (let i = 0; i < numDecks; i++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          id: `${suit}-${rank}-${i}-${Math.random().toString(36).substr(2, 9)}`,
          suit,
          rank,
          value: RANKS.indexOf(rank) + 1,
          hidden: true,
        });
      }
    }
  }
  return shuffle(deck);
};

export const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export const initializeGame = () => {
  const deck = createDeck(2); // 104 cards
  const columns = Array(10).fill(null).map(() => []);
  
  // Deal 54 cards to columns (6 cards to first 4 cols, 5 cards to last 6 cols)
  // Standard Spider Solitaire: 
  // 10 columns. 
  // First 4 columns: 5 face down, 1 face up (6 cards)
  // Last 6 columns: 4 face down, 1 face up (5 cards)
  // Total: 4*6 + 6*5 = 24 + 30 = 54 cards.
  // Remaining 50 cards in deck.

  let cardIndex = 0;
  for (let i = 0; i < 10; i++) {
    const cardsInCol = i < 4 ? 6 : 5;
    for (let j = 0; j < cardsInCol; j++) {
      const card = deck[cardIndex++];
      if (j === cardsInCol - 1) {
        card.hidden = false;
      }
      columns[i].push(card);
    }
  }

  return {
    columns,
    stock: deck.slice(cardIndex),
  };
};

export const canMoveCard = (sourceCard, targetCard) => {
  if (!targetCard) return true; // Can move to empty column
  // Rule: Must be 1 rank lower
  // For MVP, let's ignore suit requirement for moving, but require it for clearing?
  // Standard Spider: Can place on Rank+1. Suit doesn't matter for placement, but matters for moving a stack.
  // Let's simplify: Can place on Rank+1.
  
  const sourceValue = sourceCard.value;
  const targetValue = targetCard.value;
  
  return targetValue === sourceValue + 1;
};

export const isStackMovable = (stack) => {
  // Check if stack is sequential and same suit
  if (stack.length === 1) return true;
  for (let i = 0; i < stack.length - 1; i++) {
    if (stack[i].suit !== stack[i+1].suit || stack[i].value !== stack[i+1].value + 1) {
      return false;
    }
  }
  return true;
};
