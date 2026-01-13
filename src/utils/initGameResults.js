export function initGameResults() {
  const existing = localStorage.getItem("gameResults");

  if (!existing) {
    localStorage.setItem(
      "gameResults",
      JSON.stringify({
        game1: null,
        game2: null,
        game3: null
      })
    );
  }
}
