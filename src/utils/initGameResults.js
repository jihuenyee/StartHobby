export function initGameResults() {
  const existing = localStorage.getItem("gameResults");

  if (!existing) {
    localStorage.setItem(
      "gameResults",
      JSON.stringify({
        clawGame: {
          completed: false,
          answers: []
        },
        game2: {
          completed: false,
          answers: []
        },
        game3: {
          completed: false,
          answers: []
        }
      })
    );
  }
}
